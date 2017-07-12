const createRegl = require('regl')

const pointWidth = 2

module.exports = function createPathRenderer (canvas) {
  const regl = createRegl(canvas)
  const { width, height } = canvas

  const globalStateDraw = regl({
    vert: `
      attribute vec2 position;
      attribute vec4 color;

      varying vec4 fragColor;

      uniform float pointWidth;
      uniform float stageWidth;
      uniform float stageHeight;

      vec2 normalizeCoords(vec2 position) {
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          -(2.0 * ((y / stageHeight) - 0.5))
        );
      }

      void main() {
        gl_PointSize = pointWidth;
        fragColor = color;
        gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
      }
    `,

    frag: `
      precision highp float;

      varying vec4 fragColor;

      void main() {
        gl_FragColor = fragColor;
      }
    `,

    uniforms: {
      pointWidth: regl.prop('pointWidth'),
      stageWidth: regl.prop('stageWidth'),
      stageHeight: regl.prop('stageHeight')
    },

    primitive: 'line strip'
  })

  return function draw (points) {
    const drawPoints = regl({
      attributes: {
        position: points.map(p => p.position),
        color: points.map(p => p.color)
      },
      count: points.length
    })
    return function drawPath () {
      globalStateDraw({
        pointWidth: pointWidth,
        stageWidth: width,
        stageHeight: height
      }, () => drawPoints())
    }
  }
}

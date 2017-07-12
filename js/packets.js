const { uniqueId, difference, sample } = require('underscore')
const Packet = require('./packet')
const { CANVAS_SIZE } = require('./settings')
const createPathRenderer = require('./render-path')

const RATE = 150

class Packets {
  constructor (network, smartOpts = {}) {
    this.network = network
    this.inFlight = []
    this.completed = []
    this.rate = RATE
    this.timeout = null
    this.smart = !!Object.keys(smartOpts).length
    if (this.smart) {
      this.smartOpts = {
        ...smartOpts,
        'version': uniqueId('policy')
      }
    }
  }
  setStats (stats) {
    this.stats = stats
  }
  start () {
    this.pollAddPackets()
  }
  stop () {
    clearTimeout(this.timeout)
  }
  pollAddPackets () {
    this.timeout = setTimeout(this.pollAddPackets.bind(this), 100)
    this.addPackets((this.rate / 10) | 0)
  }
  update () {
    this.inFlight.forEach((packet) => packet.update())
    const completed = this.inFlight.filter((packet) => !!packet.totalTime)
    completed.forEach((packet) => this.stats.logFinish(packet))
    this.completed = this.completed.concat(completed)
    this.inFlight = difference(this.inFlight, completed)
  }
  draw (ctx) {
    this.inFlight.forEach((packet) => packet.draw(ctx))
    // this.drawPathsGL(ctx) // still not performant
    this.drawPaths(ctx)
  }
  drawPaths (ctx) {
    if (this.completed.length > 50) {
      this.completed = this.completed.slice(-50)
    }
    const lines = this.completed.map((packet) => packet.getPathRenderPoints().map(p => p.position))

    ctx.beginPath()
    lines.forEach(points => {
      ctx.moveTo(points[0][0], points[0][1])
      points.slice(1).forEach(point => ctx.lineTo(point[0], point[1]))
    })
    ctx.strokeStyle = `rgba(230, 125, 236, 0.5)`
    ctx.lineWidth = 2
    ctx.stroke()
  }

  drawPathsGL (ctx) {
    // only draw the most recent 50?
    if (!this.pathRenderer) {
      const canvas = document.createElement('canvas')
      canvas.style.height = `${CANVAS_SIZE[1]}px`
      canvas.style.width = `${CANVAS_SIZE[0]}px`
      canvas.width = CANVAS_SIZE[0]
      canvas.height = CANVAS_SIZE[1]
      canvas.style['pointer-events'] = 'none'
      canvas.style.position = 'absolute'
      canvas.style.top = canvas.style.left = 0
      ctx.canvas.parentElement.appendChild(canvas)
      this.pathRenderer = createPathRenderer(canvas)
    }

    this.drawPathCache = this.drawPathCache || {}
    if (this.completed.length > 50) {
      this.completed = this.completed.slice(-50)
    }
    this.completed.map((packet) => {
      if (!this.drawPathCache[packet.id]) {
        this.drawPathCache[packet.id] = this.pathRenderer(packet.getPathRenderPoints())
      }
      this.drawPathCache[packet.id]()
    })
  }
  addPackets (count = 1, endNode, startNode) {
    while (count--) {
      this.stats.totalCount += 1
      this.stats.allTimeTotal += 1
      const _startNode = startNode || sample(Object.values(this.network.nodes))
      const _endNode = endNode || sample(Object.values(this.network.nodes))
      this.inFlight.push(new Packet(_startNode, _endNode, this.smartOpts))
    }
  }
}

module.exports = Packets

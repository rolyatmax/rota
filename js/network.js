const { range, min } = require('underscore')
const Node = require('./node')
const Edge = require('./edge')
const { SPACING } = require('./settings')
const { sqrt, pow, TWO_PI } = require('./helpers')

const RADIUS = 12
const COLOR = 'rgba(96, 57, 193, 0.5)' // purple

class Network {
  constructor (n) {
    this.width = this.height = n
    this.nodes = {}
    this.edges = {}
    let x = this.width
    while (x--) {
      let y = this.height
      while (y--) {
        const node = new Node(x, y)
        this.nodes[node.id] = node
      }
    }
    this.connectAll()
  }
  getNode (x, y) {
    return this.nodes[key(x, y)]
  }
  getEdge (node1, node2) {
    const edge = this.edges[generatePathID(node1, node2)]
    if (!edge) {
      throw new Error('Edge not found!')
    }
    return edge
  }
  findClosestNodes (touchX, touchY, nodeCount) {
    const normalized = [touchX, touchY].map((num) => (num / SPACING) - 1)
    const [minMaxX, minMaxY] = normalized.map((num) => {
      return [Math.floor, Math.ceil].map((fn) => fn(num))
    })

    let possibleVectors = [
      [minMaxX[0], minMaxY[0]],
      [minMaxX[0], minMaxY[1]],
      [minMaxX[1], minMaxY[0]],
      [minMaxX[1], minMaxY[1]]
    ]
    possibleVectors = possibleVectors.filter((vector) => vector[0] >= 0 && vector[1] >= 0)
    const [normalX, normalY] = normalized
    const closest = range(nodeCount).map(() => {
      const vector = min(possibleVectors, ([x, y]) => {
        return sqrt(pow(x - normalX, 2) + pow(y - normalY, 2))
      })
      const i = possibleVectors.indexOf(vector)
      possibleVectors.splice(i, 1)
      return this.getNode(...vector)
    })

    if (!closest.every(node => node)) {
      return console.log('Missing nodes', closest)
    }

    return closest
  }
  findClosestEdge (touchX, touchY) {
    const closest = this.findClosestNodes(touchX, touchY, 2)
    return closest ? this.getEdge(...closest) : null
  }
  connectAll () {
    Object.values(this.nodes).forEach((node) => {
      let {x, y} = node
      const edges = node.getNeighbors();
      [
        this.getNode(x + 1, y),
        this.getNode(x - 1, y),
        this.getNode(x, y + 1),
        this.getNode(x, y - 1)
      ].map((neighbor) => {
        if (!neighbor || edges.indexOf(neighbor) >= 0) {
          return
        }
        const id = generatePathID(node, neighbor)
        const edge = new Edge(node, neighbor, id)
        node.addEdge(edge)
        neighbor.addEdge(edge)
        this.edges[edge.id] = edge
      })
    })
  }
  draw (ctx) {
    Object.values(this.nodes).forEach((node) => node.draw(ctx))
    Object.values(this.edges).forEach((edge) => edge.draw(ctx))
    if (ctx.keys['SHIFT']) {
      let nodes = this.findClosestNodes(ctx.mouse.x, ctx.mouse.y, 1)
      if (nodes && nodes.length) {
        let [x, y] = nodes[0].loc
        ctx.beginPath()
        ctx.arc(x, y, RADIUS, 0, TWO_PI)
        ctx.fillStyle = COLOR
        ctx.fill()
      }
    }
  }
}

function key (x, y) {
  return `${x}|${y}`
}

// deterministic way to generate ids based on a 2-node combo
function generatePathID (node1, node2) {
  const id1 = node1.id
  const id2 = node2.id
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`
}

module.exports = Network

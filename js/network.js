const { sortBy } = require('underscore')
const { squaredDistance } = require('gl-vec2')
const Node = require('./node')
const Edge = require('./edge')
const { pow, TWO_PI } = require('./helpers')
const { CANVAS_SIZE, CONNECTIONS_PER_NODE } = require('./settings')

const RADIUS = 12
const NODE_HIGHLIGHT_COLOR = 'rgba(96, 57, 193, 0.5)' // purple

class Network {
  constructor (n) {
    this.nodes = {}
    this.edges = {}
    const maxMag = Math.min(...CANVAS_SIZE) / 2
    const center = CANVAS_SIZE.map(v => v / 2)
    while (n--) {
      const rads = Math.random() * TWO_PI
      const mag = pow(Math.random(), 0.8) * maxMag
      const x = Math.cos(rads) * mag + center[0] | 0
      const y = Math.sin(rads) * mag + center[1] | 0
      const node = new Node(x, y)
      this.nodes[node.id] = node
    }
    this.connectAll()
  }
  getNode (x, y) {
    return this.nodes[key(x, y)]
  }
  getEdge (node1, node2) {
    const edge = this.edges[generatePathID(node1, node2)]
    if (!edge) {
      console.warn(`Edge not found for ${node1.id} and ${node2.id}`)
    }
    return edge
  }
  findClosestNodes (x, y, nodeCount) {
    const closest = sortBy(Object.values(this.nodes), (node) => {
      return squaredDistance(node.loc, [x, y])
    }).slice(0, nodeCount)
    if (!closest.every(node => node)) {
      return console.log('Missing nodes', closest)
    }

    return closest
  }
  findClosestEdge (x, y) {
    const closest = this.findClosestNodes(x, y, 2)
    return closest ? this.getEdge(...closest) : null
  }
  connectAll () {
    Object.values(this.nodes).forEach((node) => {
      const edges = node.getNeighbors()
      // if (edges.length === CONNECTIONS_PER_NODE) return

      const closest = this.findClosestNodes(node.loc[0], node.loc[1], CONNECTIONS_PER_NODE + 1)
      closest.map((neighbor) => {
        if (neighbor === node || !neighbor || edges.indexOf(neighbor) >= 0) {
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
        ctx.fillStyle = NODE_HIGHLIGHT_COLOR
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

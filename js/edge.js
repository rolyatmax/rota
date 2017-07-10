const { random } = require('underscore')
const { LATENCY_RANGE } = require('./settings')
const { map } = require('./helpers')

class Edge {
  constructor (node1, node2, id) {
    this.id = id
    this.nodes = [node1, node2]
    this.latency = random(...LATENCY_RANGE)
    this.active = true
  }
  getOtherNode (node) {
    const i = this.nodes.indexOf(node)
    return i === 0 ? this.nodes[1] : this.nodes[0]
  }
  draw (ctx) {
    if (!this.active) {
      return
    }
    const [node1, node2] = this.nodes
    const [x1, y1] = node1.loc
    const [x2, y2] = node2.loc
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = 2
    ctx.strokeStyle = getColor(this.latency)
    ctx.stroke()
  }
  toggleActive (active) {
    if (active === undefined) {
      active = !this.active
    }

    const method = active ? 'addEdge' : 'removeEdge'
    this.nodes.forEach((node) => node[method](this))
    this.active = active
  }
}

function getColor (latency) {
  const [minA, maxA] = LATENCY_RANGE
  const opacity = (((map(-latency, -maxA, -minA, 0.1, 0.5)) * 1000) | 0) / 1000
  return `rgba(0, 0, 0, ${opacity})`
}

module.exports = Edge

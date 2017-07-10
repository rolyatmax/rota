const { uniqueId, difference, sample } = require('underscore')
const Packet = require('./packet')

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
    // only draw the most recent 50?
    const toDraw = this.completed.slice(this.completed.length - 50)
    toDraw.forEach((packet) => packet.drawPath(ctx))
  }
  clearCompleted () {
    this.completed = this.completed.slice(-50)
  }
  addPackets (count = 1, endNode, startNode) {
    this.clearCompleted()

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

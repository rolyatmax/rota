const { uniqueId } = require('underscore')
const { REDZONE_TIME, LATENCY_RANGE } = require('./settings')
const { lerp, map, TWO_PI } = require('./helpers')
const catRomSpline = require('cat-rom-spline')

const GREEN = [39, 179, 171]
const RED = [167, 29, 36]
const OPACITY = 0.7
const RADIUS = 6
const SCORE_RANGE = [20, 180]

class Packet {
  constructor (startNode, endNode, smartOpts = {}) {
    this.smart = !!smartOpts['version']
    this.smartOpts = smartOpts
    this.id = uniqueId('packet-')
    this.startNode = startNode
    this.endNode = endNode
    this.startTime = Date.now()
    this.totalTime = 0
    this.curEdge = null
    this.curNode = startNode
    this.curEdgeStart = 0
    this.evaluationCb = null
    this.completedRoute = []
  }
    // TODO: Refactor meeeeeeee
  update () {
    if (this.completedRoute[this.completedRoute.length - 1] !== this.curNode) {
      this.completedRoute.push(this.curNode)
    }
    const now = Date.now()
    if (!this.curEdgeStart) {
      this.curEdgeStart = now
      this.curEdge = this.curNode.selectEdge(this.smartOpts, this.smart, this.endNode)
      if (this.smart && this.curEdge) {
        this.evaluationCb = this.curNode.getEvaluationCb(
          this.smartOpts,
          this.endNode,
          this.curEdge
        )
      }
      return
    }
    if (!this.curEdge) {
      this.curEdge = this.curNode.selectEdge(this.smartOpts, this.smart, this.endNode)
      return
    }
    if (now < (this.curEdge.latency + this.curEdgeStart)) {
      return
    }
    this.curNode = this.curEdge.getOtherNode(this.curNode)
    if (this.curNode === this.endNode) {
      if (this.evaluationCb) {
        let completionReward = this.smartOpts['completionReward']
        let maxActionValue = this.curNode.getMaxActionValue(this.smartOpts, this.endNode)
        this.evaluationCb(completionReward, maxActionValue)
      }
      this.completedRoute.push(this.curNode)
      this.totalTime = now - this.startTime
      return
    }
    if (this.evaluationCb) {
      let score = -1 * (map(this.curEdge.latency, ...LATENCY_RANGE, ...SCORE_RANGE))
      this.evaluationCb(score, this.curNode.getMaxActionValue(this.smartOpts, this.endNode))
    }
    this.curEdgeStart = now
    this.curEdge = this.curNode.selectEdge(this.smartOpts, this.smart, this.endNode)
    if (this.smart && this.curEdge) {
      this.evaluationCb = this.curNode.getEvaluationCb(
        this.smartOpts,
        this.endNode,
        this.curEdge
      )
    }
  }
  draw (ctx) {
    const nextNode = this.curEdge ? this.curEdge.getOtherNode(this.curNode) : this.curNode
    const [curX, curY] = this.curNode.loc
    const [nextX, nextY] = nextNode.loc
    const latency = this.curEdge ? this.curEdge.latency : 1
    const now = Date.now()
    const curTime = now - this.curEdgeStart
    const x = easing(curX, nextX, latency, curTime)
    const y = easing(curY, nextY, latency, curTime)

    ctx.beginPath()
    ctx.arc(x, y, RADIUS, 0, TWO_PI)
    ctx.fillStyle = getColor(now - this.startTime)
    ctx.fill()
  }
  drawPath (ctx) {
    if (!this.splinePoints) {
      const controls = this.completedRoute.map(node => node.loc)
      controls.unshift(controls[0].map(v => v + 1))
      controls.push(controls[controls.length - 1].map(v => v + 1))

      if (controls.length < 4) return

      this.splinePoints = catRomSpline(controls, { samples: Math.min(controls.length * 10, 100) })
    }

    ctx.beginPath()
    ctx.moveTo(this.splinePoints[0][0], this.splinePoints[0][1])
    this.splinePoints.slice(1).forEach(point => ctx.lineTo(point[0], point[1]))
    ctx.strokeStyle = `rgba(230, 125, 236, 0.5)`
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function getColor (time) {
  const perc = time / REDZONE_TIME
  const [r, g, b] = [0, 1, 2].map((i) => lerp(GREEN[i], RED[i], perc) | 0)
  return `rgba(${r}, ${g}, ${b}, ${OPACITY})`
}

// In/Out Cubic
function easing (start, end, duration, curTime) {
  const change = end - start
  curTime /= duration / 2
  if (curTime < 1) {
    return change / 2 * curTime * curTime * curTime + start
  }
  curTime -= 2
  return change / 2 * (curTime * curTime * curTime + 2) + start
}

module.exports = Packet

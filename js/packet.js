var _ = require('underscore');

const REDZONE_TIME = 12000;
const GREEN = [39, 179, 171];
const RED = [167, 29, 36];
const OPACITY = 0.7;
const RADIUS = 6;
const COMPLETION_REWARD = 2000;

class Packet {
    constructor(startNode, endNode, smartOpts={}) {
        this.smart = !!smartOpts['version'];
        this.smartOpts = smartOpts;
        this.id = _.uniqueId('packet-');
        this.startNode = startNode;
        this.endNode = endNode;
        this.startTime = Date.now();
        this.totalTime = 0;
        this.curEdge = null;
        this.curNode = startNode;
        this.curEdgeStart = 0;
        this.evaluationCb = null;
    }
    update() {
        var now = Date.now();
        if (!this.curEdgeStart) {
            this.curEdgeStart = now;
            this.curEdge = this.curNode.selectEdge(this.smartOpts, this.smart, this.endNode);
            if (this.smart) {
                this.evaluationCb = this.curNode.getEvaluationCb(this.smartOpts, this.endNode, this.curEdge);
            }
            return;
        }
        if (now < (this.curEdge.latency + this.curEdgeStart)) {
            return;
        }
        this.curNode = this.curEdge.getOtherNode(this.curNode);
        if (this.curNode === this.endNode) {
            if (this.smart) {
                this.evaluationCb(COMPLETION_REWARD, this.curNode.getMaxActionValue(this.smartOpts, this.endNode));
            }
            this.totalTime = now - this.startTime;
            return;
        }
        if (this.smart) {
            this.evaluationCb(-this.curEdge.latency, this.curNode.getMaxActionValue(this.smartOpts, this.endNode));
        }
        this.curEdgeStart = now;
        this.curEdge = this.curNode.selectEdge(this.smartOpts, this.smart, this.endNode);
        if (this.smart) {
            this.evaluationCb = this.curNode.getEvaluationCb(this.smartOpts, this.endNode, this.curEdge);
        }
    }
    draw(ctx) {
        var nextNode = this.curEdge.getOtherNode(this.curNode);
        var [curX, curY] = this.curNode.loc;
        var [nextX, nextY] = nextNode.loc;
        var latency = this.curEdge.latency;
        var now = Date.now();
        var curTime = now - this.curEdgeStart;
        var x = easing(curX, nextX, latency, curTime);
        var y = easing(curY, nextY, latency, curTime);

        ctx.beginPath();
        ctx.arc(x, y, RADIUS, 0, TWO_PI);
        ctx.fillStyle = getColor(now - this.startTime);
        ctx.fill();
    }
}

function getColor(time) {
    var perc = time / REDZONE_TIME;
    var [r, g, b] = _.map([0, 1, 2], (i) => {
        return lerp(GREEN[i], RED[i], perc) | 0;
    });
    return `rgba(${r}, ${g}, ${b}, ${OPACITY})`;
}

// In/Out Cubic
function easing(start, end, duration, curTime) {
    var change = end - start;
    curTime /= duration / 2;
    if (curTime < 1) {
        return change / 2 * curTime * curTime * curTime + start;
    }
    curTime -= 2;
    return change / 2 * (curTime * curTime * curTime + 2) + start;

    var change = end - start;
    return change * curTime / duration + start;
}

// linear
// function easing(start, end, duration, curTime) {
//     var change = end - start;
//     return change * curTime / duration + start;
// }

module.exports = Packet;

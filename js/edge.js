var _ = require('underscore');
var settings = require('./settings');

const LATENCY_RANGE = settings.LATENCY_RANGE;

class Edge {
    constructor(node1, node2, id) {
        this.id = id;
        this.nodes = [node1, node2];
        this.latency = _.random(...LATENCY_RANGE);
        this.active = true;
    }
    getOtherNode(node) {
        var i = this.nodes.indexOf(node);
        if (1 < 0) {
            console.warn('edge: ', this);
            console.warn('node: ', node);
            throw new Error('Node not part of Edge');
        }
        return i === 0 ? this.nodes[1] : this.nodes[0];
    }
    draw(ctx) {
        if (!this.active) {
            return;
        }
        var [node1, node2] = this.nodes;
        var [x1, y1] = node1.loc;
        var [x2, y2] = node2.loc;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = getColor(this.latency);
        ctx.stroke();
    }
    toggleActive(active) {
        if (active === undefined) {
            active = !this.active;
        }

        var method = active ? 'addEdge' : 'removeEdge';
        _.invoke(this.nodes, method, this);
        this.active = active;
    }
}

function getColor(latency) {
    var [minA, maxA] = LATENCY_RANGE;
    var opacity = (((map(-latency, -maxA, -minA, 0.2, 0.9)) * 1000) | 0) / 1000;
    return 'rgba(0, 0, 0, ' + opacity + ')';
}

module.exports = Edge;

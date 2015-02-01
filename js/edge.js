var _ = require('underscore');

const COLOR = 'rgba(0, 0, 0, 0.4)';
const LATENCY_RANGE = [20, 180];

class Edge {
    constructor(node1, node2) {
        this.id = generateID(node1, node2);
        this.nodes = [node1, node2];
        this.latency = _.random(...LATENCY_RANGE);
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
        var [node1, node2] = this.nodes;
        var [x1, y1] = node1.loc;
        var [x2, y2] = node2.loc;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = getColor(this.latency);
        ctx.stroke();
    }
}

function getColor(latency) {
    var [minA, maxA] = LATENCY_RANGE;
    var opacity = (((map(-latency, -maxA, -minA, 0.2, 0.9)) * 1000) | 0) / 1000;
    return 'rgba(0, 0, 0, ' + opacity + ')';
}

// deterministic way to generate ids based on a 2-node combo
function generateID(node1, node2) {
    var id1 = node1.id;
    var id2 = node2.id;
    return id1 < id2 ? id1 + '-' + id2 : id2 + '-' + id1;
}

module.exports = Edge;

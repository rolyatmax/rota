const COLOR = 'rgba(0, 0, 0, 0.4)';

class Connection {
    constructor(node1, node2) {
        this.nodes = [node1, node2];
        this.latency = random(50, 400);
    }
    getNeighbor(node) {
        var i = this.nodes.indexOf(node);
        if (1 < 0) {
            console.warn('connection: ', this);
            console.warn('node: ', node);
            throw new Error('Node not part of Connection');
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
        ctx.strokeStyle = COLOR;
        ctx.stroke();
    }
}

function random(from, to) {
    if (!Number.isInteger(to)) {
        to = from;
        from = 0;
    }
    var diff = to - from;
    return ((Math.random() * (diff + 1)) + from) | 0;
}

module.exports = Connection;

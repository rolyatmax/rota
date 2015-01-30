const SPACING = 60;
const RADIUS = 5;
const COLOR = 'rgba(0, 0, 0, 0.7)';

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.loc = [(x + 1) * SPACING, (y + 1) * SPACING];
        this.connections = [];
    }
    addConnection(connection) {
        this.connections.push(connection);
    }
    removeConnection(connection) {
        var i = this.connections.indexOf(connection);
        if (i < 0) {
            return;
        }
        this.connections.splice(i, 1);
    }
    getNeighbors() {
        return this.connections.map((connection) => {
            return connection.getNeighbor(this);
        });
    }
    draw(ctx) {
        var [x, y] = this.loc;
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, 0, TWO_PI);
        ctx.fillStyle = COLOR;
        ctx.fill();
    }
}

module.exports = Node;

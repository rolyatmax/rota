var _ = require('underscore');
var Node = require('./node');
var Connection = require('./connection');

class Network {
    constructor(n) {
        this.width = this.height = Math.ceil(Math.sqrt(n));
        this.nodes = {};
        this.connections = [];
        while (n--) {
            this.addNode();
        }
    }
    addNode() {
        var [x, y] = this.getVector();
        var node = new Node(x, y);
        this.nodes[key(x, y)] = node;
    }
    getVector() {
        if (_.size(this.nodes) >= Math.pow(this.width, 2)) {
            throw new Error('Too many nodes: ' + _.size(this.nodes));
        }
        var x = random(this.width - 1);
        var y = random(this.width - 1);
        if (this.getNode(x, y)) {
            return this.getVector();
        }
        return [x, y];
    }
    getNode(x, y) {
        return this.nodes[key(x, y)]
    }
    connectAll() {
        _.each(this.nodes, (node) => {
            let {x, y} = node;
            var connections = node.getNeighbors();
            [this.getNode(x + 1, y),
             this.getNode(x - 1, y),
             this.getNode(x, y + 1),
             this.getNode(x, y - 1)].map((neighbor) => {
                if (!neighbor || connections.indexOf(neighbor) >= 0) {
                    return;
                }
                var connection = new Connection(node, neighbor);
                node.addConnection(connection);
                neighbor.addConnection(connection);
                this.connections.push(connection);
            })
        });
    }
    draw(ctx) {
        _.invoke(this.nodes, 'draw', ctx);
        _.invoke(this.connections, 'draw', ctx);
    }
}

function key(x, y) {
    return x + '|' + y;
}

function random(from, to) {
    if (!Number.isInteger(to)) {
        to = from;
        from = 0;
    }
    var diff = to - from;
    return ((Math.random() * (diff + 1)) + from) | 0;
}

module.exports = Network;

var _ = require('underscore');
var Node = require('./node');
var Edge = require('./edge');

class Network {
    constructor(n) {
        this.width = this.height = Math.ceil(Math.sqrt(n));
        this.nodes = {};
        this.edges = [];
        while (n--) {
            this.addNode();
        }
    }
    addNode() {
        var [x, y] = this.getVector();
        var node = new Node(x, y);
        this.nodes[node.id] = node;
    }
    getVector() {
        if (_.size(this.nodes) >= Math.pow(this.width, 2)) {
            throw new Error('Too many nodes: ' + _.size(this.nodes));
        }
        var x = _.random(this.width - 1);
        var y = _.random(this.width - 1);
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
            var edges = node.getNeighbors();
            [this.getNode(x + 1, y),
             this.getNode(x - 1, y),
             this.getNode(x, y + 1),
             this.getNode(x, y - 1)].map((neighbor) => {
                if (!neighbor || edges.indexOf(neighbor) >= 0) {
                    return;
                }
                var edge = new Edge(node, neighbor);
                node.addEdge(edge);
                neighbor.addEdge(edge);
                this.edges.push(edge);
            })
        });
    }
    draw(ctx) {
        _.invoke(this.nodes, 'draw', ctx);
        _.invoke(this.edges, 'draw', ctx);
    }
}

function key(x, y) {
    return x + '|' + y;
}

module.exports = Network;

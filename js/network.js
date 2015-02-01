var _ = require('underscore');
var Node = require('./node');
var Edge = require('./edge');
var settings = require('./settings');

const SPACING = settings.SPACING;

class Network {
    constructor(n) {
        this.width = this.height = Math.ceil(Math.sqrt(n));
        this.nodes = {};
        this.edges = {};
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
    getEdge(node1, node2) {
        var edge = this.edges[generateEdgeID(node1, node2)];
        if (!edge) {
            throw new Error('Edge not found!');
        }
        return edge;
    }
    findClosestEdge(touchX, touchY) {
        var normalized = _.map([touchX, touchY], (num) => {
            return (num / SPACING) - 1;
        });

        var [minMaxX, minMaxY] = _.map(normalized, (num) => {
            return _.map([Math.floor, Math.ceil], (fn) => fn(num));
        });

        var possibleVectors = [[minMaxX[0], minMaxY[0]],
                               [minMaxX[0], minMaxY[1]],
                               [minMaxX[1], minMaxY[0]],
                               [minMaxX[1], minMaxY[1]]];
        possibleVectors = _.filter(possibleVectors, (vector) => {
            return vector[0] >= 0 && vector[1] >= 0;
        });

        var [normalX, normalY] = normalized;

        var closest = _.map([null, null], () => {
            var vector = _.min(possibleVectors, (vector) => {
                var [x, y] = vector;
                return sqrt(pow(x - normalX, 2) + pow(y - normalY, 2));
            });
            var i = possibleVectors.indexOf(vector);
            possibleVectors.splice(i, 1);
            return this.getNode(...vector);
        });

        if (!_.every(closest)) {
            return console.log('Missing nodes', closest);
        }

        return this.getEdge(...closest);
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
                var id = generateEdgeID(node, neighbor);
                var edge = new Edge(node, neighbor, id);
                node.addEdge(edge);
                neighbor.addEdge(edge);
                this.edges[edge.id] = edge;
            })
        });
    }
    draw(ctx) {
        _.invoke(this.nodes, 'draw', ctx);
        _.invoke(_.values(this.edges), 'draw', ctx);
    }
}

function key(x, y) {
    return x + '|' + y;
}

// deterministic way to generate ids based on a 2-node combo
function generateEdgeID(node1, node2) {
    var id1 = node1.id;
    var id2 = node2.id;
    return id1 < id2 ? id1 + '-' + id2 : id2 + '-' + id1;
}

module.exports = Network;

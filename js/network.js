var _ = require('underscore');
var Node = require('./node');
var Edge = require('./edge');
var settings = require('./settings');
var {sqrt, pow, TWO_PI} = require('./helpers');

const SPACING = settings.SPACING;
const RADIUS = 12;
const COLOR = 'rgba(96, 57, 193, 0.5)'; // purple

class Network {
    constructor(n) {
        this.width = this.height = Math.ceil(Math.sqrt(n));
        this.nodes = {};
        this.edges = {};
        while (n--) {
            this.addNode();
        }
        this.connectAll();
    }
    addNode() {
        var [x, y] = this.getVector();
        var node = new Node(x, y);
        this.nodes[node.id] = node;
    }
    getVector() {
        var nodesCount = Object.keys(this.nodes).length;
        if (nodesCount >= Math.pow(this.width, 2)) {
            throw new Error(`Too many nodes: ${nodesCount}`);
        }
        var x = _.random(this.width - 1);
        var y = _.random(this.width - 1);
        if (this.getNode(x, y)) {
            return this.getVector();
        }
        return [x, y];
    }
    getNode(x, y) {
        return this.nodes[key(x, y)];
    }
    getEdge(node1, node2) {
        var edge = this.edges[generatePathID(node1, node2)];
        if (!edge) {
            throw new Error('Edge not found!');
        }
        return edge;
    }
    findClosestNodes(touchX, touchY, nodeCount) {
        var normalized = [touchX, touchY].map((num) => (num / SPACING) - 1);
        var [minMaxX, minMaxY] = normalized.map((num) => {
            return [Math.floor, Math.ceil].map((fn) => fn(num));
        });

        var possibleVectors = [
            [minMaxX[0], minMaxY[0]],
            [minMaxX[0], minMaxY[1]],
            [minMaxX[1], minMaxY[0]],
            [minMaxX[1], minMaxY[1]]
        ];
        possibleVectors = possibleVectors.filter((vector) => vector[0] >= 0 && vector[1] >= 0);
        var [normalX, normalY] = normalized;
        var closest = _.range(nodeCount).map(() => {
            var vector = _.min(possibleVectors, ([x, y]) => {
                return sqrt(pow(x - normalX, 2) + pow(y - normalY, 2));
            });
            var i = possibleVectors.indexOf(vector);
            possibleVectors.splice(i, 1);
            return this.getNode(...vector);
        });

        if (!closest.every(node => node)) {
            return console.log('Missing nodes', closest);
        }

        return closest;
    }
    findClosestEdge(touchX, touchY) {
        var closest = this.findClosestNodes(touchX, touchY, 2);
        return closest ? this.getEdge(...closest) : null;
    }
    connectAll() {
        Object.values(this.nodes).forEach((node) => {
            let {x, y} = node;
            var edges = node.getNeighbors();
            [
                this.getNode(x + 1, y),
                this.getNode(x - 1, y),
                this.getNode(x, y + 1),
                this.getNode(x, y - 1)
            ].map((neighbor) => {
                if (!neighbor || edges.indexOf(neighbor) >= 0) {
                    return;
                }
                var id = generatePathID(node, neighbor);
                var edge = new Edge(node, neighbor, id);
                node.addEdge(edge);
                neighbor.addEdge(edge);
                this.edges[edge.id] = edge;
            });
        });
    }
    draw(ctx) {
        Object.values(this.nodes).forEach((node) => node.draw(ctx));
        Object.values(this.edges).forEach((edge) => edge.draw(ctx));
        if (ctx.keys['SHIFT']) {
            let nodes = this.findClosestNodes(ctx.mouse.x, ctx.mouse.y, 1);
            if (nodes && nodes.length) {
                let [x, y] = nodes[0].loc;
                ctx.beginPath();
                ctx.arc(x, y, RADIUS, 0, TWO_PI);
                ctx.fillStyle = COLOR;
                ctx.fill();
            }
        }
    }
}

function key(x, y) {
    return `${x}|${y}`;
}

// deterministic way to generate ids based on a 2-node combo
function generatePathID(node1, node2) {
    var id1 = node1.id;
    var id2 = node2.id;
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

module.exports = Network;

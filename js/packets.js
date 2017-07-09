var {uniqueId, difference, sample} = require('underscore');
var Packet = require('./packet');

const RATE = 150;

class Packets {
    constructor(network, smartOpts = {}) {
        this.network = network;
        this.inFlight = [];
        this.completed = [];
        this.rate = RATE;
        this.timeout = null;
        this.smart = !!Object.keys(smartOpts).length;
        if (this.smart) {
            this.smartOpts = {
                ...smartOpts,
                'version': uniqueId('policy')
            };
        }
    }
    setStats(stats) {
        this.stats = stats;
    }
    start() {
        this.pollAddPackets();
    }
    stop() {
        clearTimeout(this.timeout);
    }
    pollAddPackets() {
        this.timeout = setTimeout(this.pollAddPackets.bind(this), 100);
        this.addPackets((this.rate / 10) | 0);
    }
    update() {
        this.inFlight.forEach((packet) => packet.update());
        var completed = this.inFlight.filter((packet) => !!packet.totalTime);
        completed.forEach((packet) => this.stats.logFinish(packet));
        this.completed = this.completed.concat(completed);
        this.inFlight = difference(this.inFlight, completed);
    }
    draw(ctx) {
        // this.inFlight.forEach((packet) => packet.draw(ctx));
        this.completed.forEach((packet) => packet.draw(ctx));
    }
    addPackets(count = 1, endNodeX, endNodeY, startNodeX, startNodeY) {
        var endNode;
        var startNode;
        if (endNodeX !== undefined && endNodeY !== undefined) {
            endNode = this.network.getNode(endNodeX, endNodeY);
        }
        if (startNodeX !== undefined && startNodeY !== undefined) {
            startNode = this.network.getNode(startNodeX, startNodeY);
        }

        while (count--) {
            this.stats.totalCount += 1;
            this.stats.allTimeTotal += 1;
            var _startNode = startNode || sample(Object.values(this.network.nodes));
            var _endNode = endNode || sample(Object.values(this.network.nodes));
            this.inFlight.push(new Packet(_startNode, _endNode, this.smartOpts));
        }
    }
}

module.exports = Packets;

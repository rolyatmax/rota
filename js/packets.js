var _ = require('underscore');
var Packet = require('./packet');

const RATE = 10;

class Packets {
    constructor(network, smartOpts = {}) {
        this.network = network;
        this.inFlight = [];
        this.rate = RATE;
        this.timeout = null;
        this.smart = !!_.size(smartOpts);
        if (this.smart) {
            this.smartOpts = _.extend(smartOpts, {
                'version': _.uniqueId('policy')
            });
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
        this.timeout = setTimeout(this.pollAddPackets.bind(this), 1000);
        this.addPackets(this.rate);
    }
    update() {
        _.invoke(this.inFlight, 'update');
        var completed = _.filter(this.inFlight, (packet) => {
            return !!packet.totalTime;
        });
        _.each(completed, this.stats.logFinish.bind(this.stats));
        this.inFlight = _.difference(this.inFlight, completed);
    }
    draw(ctx) {
        _.invoke(this.inFlight, 'draw', ctx);
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
            var _startNode = startNode || _.sample(_.values(this.network.nodes));
            var _endNode = endNode || _.sample(_.values(this.network.nodes));
            this.inFlight.push(new Packet(_startNode, _endNode, this.smartOpts));
        }
    }
}

module.exports = Packets;

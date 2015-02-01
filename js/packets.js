var _ = require('underscore');
var Packet = require('./packet');

const RATE = 2;

class Packets {
    constructor(network, smartOpts={}) {
        this.totalCount = 0;
        this.completedCount = 0;
        this.aggregateTimes = 0;
        this.network = network;
        this.inFlight = [];
        this.finished = new Set();
        this.rate = RATE;
        this.timeout = null;
        this.smart = !!_.size(smartOpts);
        if (this.smart) {
            this.smartOpts = _.extend(smartOpts, {
                'version': _.uniqueId('policy')
            });
        }
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
        this.completedCount += completed.length;
        _.each(completed, (packet) => {
            this.aggregateTimes += packet.totalTime;
            this.finished.add(packet);
        });
        this.inFlight = _.difference(this.inFlight, completed);
    }
    draw(ctx) {
        _.invoke(this.inFlight, 'draw', ctx);
    }
    addPackets(count=1, endNodeX, endNodeY, startNodeX, startNodeY) {
        var endNode, startNode;
        if (endNodeX !== undefined && endNodeY !== undefined) {
            endNode = this.network.getNode(endNodeX, endNodeY);
        }
        if (startNodeX !== undefined && startNodeY !== undefined) {
            startNode = this.network.getNode(startNodeX, startNodeY);
        }

        while (count--) {
            this.totalCount += 1;
            var _startNode = startNode || _.sample(_.values(this.network.nodes));
            var _endNode = endNode || _.sample(_.values(this.network.nodes));
            this.inFlight.push(new Packet(_startNode, _endNode, this.smartOpts));
        }
    }
}

module.exports = Packets;

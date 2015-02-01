var _ = require('underscore');
var settings = require('./settings');

const RENDER_RATE = 500;

var template = require('./stats.hbs');

class Stats {
    constructor(el, packets) {
        this.el = document.querySelector(el);
        this.packets = packets;
        this.timeout = null;
        this.resetStats();
        this.poll();
    }
    poll() {
        this.timeout = setTimeout(this.poll.bind(this), RENDER_RATE);
        this.render();
    }
    render() {
        var now = Date.now();
        var inFlightAggregateTimes = _.reduce(this.packets.inFlight, (memo, packet) => {
            return memo + (now - packet.startTime);
        }, 0);

        var aggregateTimes = inFlightAggregateTimes + this.aggregateTimes;

        var ctx = {
            'total': this.totalCount,
            'inFlight': this.totalCount - this.completedCount,
            'delivered': this.completedCount,
            'averageTime': (aggregateTimes / this.totalCount) | 0,
            'rate': this.packets.rate
        };

        this.el.innerHTML = template(ctx);
    }
    resetStats() {
        this.totalCount = 0;
        this.completedCount = 0;
        this.finished = new Set();
        this.aggregateTimes = 0;
        this.pathStats = {};
    }
    logFinish(packet) {
        this.completedCount += 1;
        this.aggregateTimes += packet.totalTime;
        this.finished.add(packet);

        var pathKey = settings.generatePathID(packet.startNode, packet.endNode);
        _ensureDefaults(this.pathStats, pathKey);

        var pathStat = this.pathStats[pathKey];
        pathStat['totalCount'] += 1;
        pathStat['aggregateTimes'] += packet.totalTime;
        pathStat['averageTime'] = (pathStat['aggregateTimes'] / pathStat['totalCount']) | 0;
        if (!pathStat['bestTime'] || packet.totalTime < pathStat['bestTime']) {
            pathStat['bestTime'] = packet.totalTime;
        }
        if (!pathStat['worstTime'] || packet.totalTime > pathStat['worstTime']) {
            pathStat['worstTime'] = packet.totalTime;
        }
    }
}

function _ensureDefaults(pathStats, pathKey) {
    pathStats[pathKey] = pathStats[pathKey] || {
        'totalCount': 0,
        'aggregateTimes': 0,
        'bestTime': null,
        'worstTime': null,
        'averageTime': null
    };
}

module.exports = Stats;

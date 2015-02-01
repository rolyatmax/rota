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

        ctx = _.extend(ctx, this.comparePaths());

        this.el.innerHTML = template(ctx);
    }
    resetStats() {
        this.totalCount = 0;
        this.completedCount = 0;
        this.finished = new Set();
        this.aggregateTimes = 0;
        this.pathStats = {};
        this.render();
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
    comparePaths() {
        // average count of each path run
        var pathCount = _.size(this.pathStats);
        var totalCount = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['totalCount'];
        }, 0);
        var averagePathCount = Math.round(totalCount / pathCount);

        // average best
        var totalBest = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['bestTime'];
        }, 0);
        var averageBest = Math.round(totalBest / pathCount);

        // average worst
        var totalWorst = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['worstTime'];
        }, 0);
        var averageWorst = Math.round(totalWorst / pathCount);

        // average difference between best and actual
        var totalBestActualDiff = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['averageTime'] - pathStat['bestTime'];
        }, 0);
        var averageBestActualDifference = Math.round(totalBestActualDiff / pathCount);

        // average difference between best and worst
        var totalBestWorstDiff = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['worstTime'] - pathStat['bestTime'];
        }, 0);
        var averageBestWorstDifference = Math.round(totalBestWorstDiff / pathCount);

        // average difference between best and average
        var totalBestActualDiffRatio = _.reduce(this.pathStats, (memo, pathStat) => {
            return memo + pathStat['averageTime'] / pathStat['bestTime'];
        }, 0);
        var averageBestActualRatio = (((totalBestActualDiffRatio / pathCount) * 100) | 0) / 100;

        var data = {
            pathCount,
            averagePathCount,
            averageBest,
            averageWorst,
            averageBestActualDifference,
            averageBestActualRatio,
            averageBestWorstDifference
        };

        // console.log('Stats!');
        // console.log(_.map(data, (val, key) => `${key}: ${val}`).join('\n'));

        return data;
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

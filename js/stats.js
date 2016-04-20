var _ = require('underscore');
var template = require('./stats.hbs');
var {max, min} = Math;
var {TWO_PI} = require('./helpers');

const RENDER_RATE = 500;
const RADIUS = 14;
const MAX_OVERLAY_OPACITY = 0.6;
const OVERLAY_COLOR = [253, 110, 0]; // orange

class Stats {
    constructor(el, packets, ctx) {
        this.el = document.querySelector(el);
        this.statsContainer = this.el.querySelector('.stats');
        this.packets = packets;
        this.ctx = ctx;
        this.timeout = null;
        this.showOverlay = false;
        this.resetStats();
        this.allTimeTotal = 0;
        this.allTimeCompleted = 0;
        this.poll();
    }
    poll() {
        this.timeout = setTimeout(() => this.poll(), RENDER_RATE);
        this.render();
    }
    render() {
        var now = Date.now();
        var inFlightAggregateTimes = this.packets.inFlight.reduce((total, packet) => {
            return total + (now - packet.startTime);
        }, 0);

        var aggregateTimes = inFlightAggregateTimes + this.aggregateTimes;
        var ctx = {
            'total': this.totalCount,
            'inFlight': this.allTimeTotal - this.allTimeCompleted,
            'delivered': this.completedCount,
            'averageTime': (aggregateTimes / this.totalCount) | 0,
            'rate': this.packets.rate,
            ...this.comparePaths()
        };
        this.statsContainer.innerHTML = template(ctx);
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
        this.allTimeCompleted += 1;
        this.aggregateTimes += packet.totalTime;
        this.finished.add(packet);

        var {startNode, endNode} = packet;

        var pathKey = `${startNode}-${endNode}`;
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
        var paths = Object.values(this.pathStats);

        var pathCount = paths.length;
        var totalCount = paths.reduce((total, pathStat) => total + pathStat.totalCount, 0);
        var averagePathCount = Math.round(totalCount / pathCount);

        // average best
        var totalBest = paths.reduce((total, pathStat) => total + pathStat.bestTime, 0);
        var averageBest = Math.round(totalBest / pathCount);

        // average worst
        var totalWorst = paths.reduce((total, pathStat) => total + pathStat.worstTime, 0);
        var averageWorst = Math.round(totalWorst / pathCount);

        // average difference between best and actual
        var totalBestActualDiff = paths.reduce((total, pathStat) => {
            return total + pathStat.averageTime - pathStat.bestTime;
        }, 0);
        var averageBestActualDifference = Math.round(totalBestActualDiff / pathCount);

        // average difference between best and worst
        var totalBestWorstDiff = paths.reduce((memo, pathStat) => {
            return memo + pathStat.worstTime - pathStat.bestTime;
        }, 0);
        var averageBestWorstDifference = Math.round(totalBestWorstDiff / pathCount);

        // average difference between best and average
        var totalBestActualDiffRatio = paths.reduce((memo, pathStat) => {
            return memo + pathStat.averageTime / pathStat.bestTime;
        }, 0);
        var averageBestActualRatio = (((totalBestActualDiffRatio / pathCount) * 100) | 0) / 100;
        return {
            pathCount,
            averagePathCount,
            averageBest,
            averageWorst,
            averageBestActualDifference,
            averageBestActualRatio,
            averageBestWorstDifference
        };
    }
    showAddressOverlay() {
        if (!this.packets.inFlight.length) {
            return;
        }
        var endNodes = this.packets.inFlight.map((packet) => packet.endNode);
        var groups = _.groupBy(endNodes, 'id');
        var addresses = Object.values(groups).map((group) => ({
            'node': group[0],
            'count': group.length
        }));
        this.draw(this.ctx, addresses);
    }
    draw(ctx, addresses) {
        addresses.forEach((address) => {
            var [x, y] = address.node.loc;
            ctx.beginPath();
            ctx.arc(x, y, RADIUS, 0, TWO_PI);
            ctx.fillStyle = getColor(address.count);
            ctx.fill();
        });
    }
}

function getColor(count) {
    var opacity = max(0.3, min(count / 20, 1)) * MAX_OVERLAY_OPACITY;
    var [r, g, b] = OVERLAY_COLOR;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

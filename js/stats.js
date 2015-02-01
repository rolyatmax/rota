var _ = require('underscore');

const RENDER_RATE = 500;

var template = require('./stats.hbs');

class Stats {
    constructor(el, packets) {
        this.el = document.querySelector(el);
        this.packets = packets;
        this.timeout = null;
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

        var aggregateTimes = inFlightAggregateTimes + this.packets.aggregateTimes;

        var ctx = {
            'total': this.packets.totalCount,
            'inFlight': this.packets.totalCount - this.packets.completedCount,
            'delivered': this.packets.completedCount,
            'averageTime': (aggregateTimes / this.packets.totalCount) | 0,
            'rate': this.packets.rate
        };

        this.el.innerHTML = template(ctx);
    }
}

module.exports = Stats;

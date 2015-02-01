var _ = require('underscore');

const SPEED = 1;
const LATENCY_RANGE = [20, 180];
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2;

const settings = {
    LATENCY_RANGE: _.map(LATENCY_RANGE, (num) => num * SPEED),
    REDZONE_TIME
};

module.exports = settings;

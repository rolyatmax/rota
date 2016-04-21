const SPACING = 60;
const SPEED = 3;
const LATENCY_RANGE = [20, 180].map((num) => num * SPEED);
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2;

const settings = {
    LATENCY_RANGE,
    REDZONE_TIME,
    SPACING,
    SPEED
};

module.exports = settings;

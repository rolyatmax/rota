var _ = require('underscore');

const SPACING = 60;
const SPEED = 1;
const LATENCY_RANGE = [20, 180];
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2;

// deterministic way to generate ids based on a 2-node combo
function generatePathID(node1, node2) {
    var id1 = node1.id;
    var id2 = node2.id;
    return id1 < id2 ? id1 + '-' + id2 : id2 + '-' + id1;
}

const settings = {
    LATENCY_RANGE: _.map(LATENCY_RANGE, (num) => num * SPEED),
    REDZONE_TIME,
    SPACING,
    generatePathID
};

module.exports = settings;

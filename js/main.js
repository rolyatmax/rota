var _ = require('underscore');

var Sketch = require('./lib/sketch');
var Network = require('./network');
var Packets = require('./packets');
var Stats = require('./stats');

var Info = require('./lib/info');

const ROW_COLUMN_COUNT = 6;

var info = new Info({
    url: 'README.md',
    keyTrigger: true,
    container: 'wrapper'
});

var network = new Network(ROW_COLUMN_COUNT * ROW_COLUMN_COUNT);
network.connectAll();

var sketch = Sketch.create({
    'fullscreen': false,
    'autopause': false,
    'width': 800,
    'height': 400,
    'container': document.querySelector('.canvas-container'),
});

var packets = [];
var stats = [];

var smart1 = new Packets(network, {
    'explore': 0.15,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200,
    'completionReward': 50000
});
var stats1 = new Stats('.algo-0', smart1, sketch);
smart1.setStats(stats1);
packets.push(smart1);
stats.push(stats1);

// var smart2 = new Packets(network, {
//     'explore': 0.05,
//     'alpha': 0.9,
//     'discount': 0.8,
//     'initial': 200,
//     'completionReward': 2000
// });
// var stats2 = new Stats('.algo-2', smart2, sketch);
// smart2.setStats(stats2);
// packets.push(smart2);
// stats.push(stats2);

var showOverlay = false;

sketch.update = () => {
    _.invoke(packets, 'update');
};

sketch.draw = () => {
    network.draw(sketch);
    _.invoke(packets, 'draw', sketch);
    if (showOverlay) {
        _.invoke(stats, 'showAddressOverlay');
    }
};

sketch.touchstart = () => {
    var {x, y} = sketch.touches[0];
    if (sketch.keys['SHIFT']) {
        let node = network.findClosestNodes(x, y, 1)[0];
        smart1.addPackets(getCount('.algo-0'), node.x, node.y);
        return;
    }
    var edge = network.findClosestEdge(x, y);
    if (edge) {
        edge.toggleActive();
    }
}

window.sketch = sketch;
window.network = network;
window._ = _;
window.smart1 = smart1;
// window.smart2 = smart2;

var playing = false;

document.addEventListener('keydown', (e) => {
    if (e.which === 32) { // spacebar
        sketch.toggle();
    }
});

_.each(packets, (collection, i) => {
    (() => {
        var selector = `.algo-${i}`;
        var coll = collection;
        document.querySelector(`${selector} .add`).addEventListener('click', () => {
            coll.addPackets(getCount(selector));
        });
    })();
});

document.querySelector('.reset-stats').addEventListener('click', () => {
    _.invoke(stats, 'resetStats');
});

var $popularAddressesBtn = document.querySelector('.get-popular-addresses');
$popularAddressesBtn.addEventListener('click', () => {
    showOverlay = !showOverlay;
    var method = showOverlay ? 'add': 'remove';
    $popularAddressesBtn.classList[method]('on');
});

function getCount(selector) {
    return parseInt(document.querySelector(`${selector} input.count`).value, 10);
}

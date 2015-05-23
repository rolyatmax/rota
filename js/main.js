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

    touchstart() {
        var {x, y} = this.touches[0];
        var edge = network.findClosestEdge(x, y);
        if (edge) {
            edge.toggleActive();
        }
    }
});

var smart1 = new Packets(network, {
    'explore': 0.15,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200,
    'completionReward': 50000
});
var stats1 = new Stats('.algo-1', smart1, sketch);
smart1.setStats(stats1);

var smart2 = new Packets(network, {
    'explore': 0.05,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200,
    'completionReward': 2000
});
var stats2 = new Stats('.algo-2', smart2, sketch);
smart2.setStats(stats2);

var showOverlay = false;

sketch.update = () => {
    smart1.update();
    smart2.update();
};

sketch.draw = () => {
    network.draw(sketch);
    smart1.draw(sketch);
    smart2.draw(sketch);
    if (showOverlay) {
        _.invoke([stats1, stats2], 'showAddressOverlay');
    }
};

window.sketch = sketch;
window.network = network;
window._ = _;
window.smart1 = smart1;
window.smart2 = smart2;

var playing = false;

document.addEventListener('keydown', (e) => {
    if (e.which === 32) { // spacebar
        var method = playing ? 'stop' : 'start';
        _.invoke([smart1, smart2], method);
        playing = !playing;
        e.preventDefault();
    }
});

_.each({
    '.algo-1': smart1,
    '.algo-2': smart2
}, (collection, selector) => {
    (() => {
        var coll = collection;
        document.querySelector(`${selector} .add`).addEventListener('click', () => {
            let count = parseInt(document.querySelector(`${selector} input.count`).value, 10);
            let x = parseInt(document.querySelector(`${selector} input.x`).value, 10);
            let y = parseInt(document.querySelector(`${selector} input.y`).value, 10);

            x = x < ROW_COLUMN_COUNT ? x : null;
            y = y < ROW_COLUMN_COUNT ? y : null;

            var coords = _.isNull(x) || _.isNull(y) ? [] : [x, y];

            coll.addPackets(count, ...coords);
        });
    })();
});

document.querySelector('.reset-stats').addEventListener('click', () => {
    _.invoke([stats1, stats2], 'resetStats');
});

var $popularAddressesBtn = document.querySelector('.get-popular-addresses');
$popularAddressesBtn.addEventListener('click', () => {
    showOverlay = !showOverlay;
    var method = showOverlay ? 'add': 'remove';
    $popularAddressesBtn.classList[method]('on');
});

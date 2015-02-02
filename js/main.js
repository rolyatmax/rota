var _ = require('underscore');

var Sketch = require('./lib/sketch');
var Network = require('./network');
var Packets = require('./packets');
var Stats = require('./stats');

const ROW_COLUMN_COUNT = 6;

var network = new Network(ROW_COLUMN_COUNT * ROW_COLUMN_COUNT);
network.connectAll();

var smart1 = new Packets(network, {
    'explore': 0.15,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200,
    'completionReward': 50000
});
var stats1 = new Stats('.algo-1', smart1);
smart1.setStats(stats1);

var smart2 = new Packets(network, {
    'explore': 0.05,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200,
    'completionReward': 2000
});
var stats2 = new Stats('.algo-2', smart2);
smart2.setStats(stats2);

var sketch = Sketch.create({
    'fullscreen': false,
    'autopause': false,
    'width': 800,
    'height': 400,
    'container': document.querySelector('.canvas-container'),

    update() {
        smart1.update();
        smart2.update();
    },

    draw() {
        network.draw(this);
        smart1.draw(this);
        smart2.draw(this);
    },

    touchstart() {
        var {x, y} = this.touches[0];
        var edge = network.findClosestEdge(x, y);
        if (edge) {
            edge.toggleActive();
        }
    }
});

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

document.querySelector('.get-popular-addresses').addEventListener('click', () => {
    _.invoke([stats1, stats2], 'showPopularAddresses');
});

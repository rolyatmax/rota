var _ = require('underscore');

var Sketch = require('./lib/sketch');
var Network = require('./network');
var Packets = require('./packets');
var Stats = require('./stats');

const NODE_COUNT = 36;

var network = new Network(NODE_COUNT);
network.connectAll();

var smart1 = new Packets(network, {
    'explore': 0.05,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200
});
var stats = new Stats('.smart-stats-1', smart1);

var smart2 = new Packets(network, {
    'explore': 0.05,
    'alpha': 0.9,
    'discount': 0.8,
    'initial': 200
});
var stats = new Stats('.smart-stats-2', smart2);

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
        edge.toggleActive();
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
    '.add-packets-1': smart1,
    '.add-packets-2': smart2
}, (collection, selector) => {
    document.querySelector(selector)
      .addEventListener('click', collection.addPackets.bind(collection, 1000));
});


var _ = require('underscore');

var Sketch = require('./lib/sketch');
var Network = require('./network');
var Packets = require('./packets');
var Stats = require('./stats');

var network = new Network(32);
network.connectAll();

var smartPackets = new Packets(network, { 'smart': true });
var stats = new Stats('.smart-stats', smartPackets);

var dumbPackets = new Packets(network, { 'smart': false });
var stats = new Stats('.dumb-stats', dumbPackets);

var sketch = Sketch.create({
    'fullscreen': false,
    'autopause': false,
    'width': 800,
    'height': 400,
    'container': document.querySelector('.canvas-container'),

    update() {
        smartPackets.update();
        dumbPackets.update();
    },

    draw() {
        network.draw(this);
        smartPackets.draw(this);
        dumbPackets.draw(this);
    }
});

window.sketch = sketch;
window.network = network;
window._ = _;
window.smartPackets = smartPackets;
window.dumbPackets = dumbPackets;

var playing = true;

document.addEventListener('keydown', (e) => {
    if (e.which === 32) { // spacebar
        var method = playing ? 'stop' : 'start';
        _.invoke([sketch, smartPackets, dumbPackets], method);
        playing = !playing;
    }
});

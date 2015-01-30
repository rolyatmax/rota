var Sketch = require('./lib/sketch');
var Network = require('./network');

var network = window.network = new Network(30);

network.connectAll();

Sketch.create({
    'fullscreen': false,
    'width': 800,
    'height': 400,
    'container': document.querySelector('#canvas-container'),

    update() {

    },

    draw() {
        network.draw(this);
    }
});


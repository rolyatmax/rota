const Sketch = require('./lib/sketch')
const Network = require('./network')
const Packets = require('./packets')
const Stats = require('./stats')
const Info = require('./lib/info')
const { ROW_COLUMN_COUNT } = require('./settings')

// eslint-disable-next-line
new Info({
  url: 'README.md',
  keyTrigger: true,
  container: 'wrapper'
})

const network = new Network(ROW_COLUMN_COUNT)

const sketch = Sketch.create({
  'fullscreen': false,
  'autopause': false,
  'width': 800,
  'height': 500,
  'container': document.querySelector('.canvas-container'),
  'globals': false
})

const packets = []
const stats = []

const smart1 = new Packets(network, {
  'explore': 0.15,
  'alpha': 0.9,
  'discount': 0.8,
  'initial': 200,
  'completionReward': 50000
})
const stats1 = new Stats('.algo-0', smart1, sketch)
smart1.setStats(stats1)
packets.push(smart1)
stats.push(stats1)
// smart1.start();

let showOverlay = true

sketch.update = () => {
  packets.forEach((packet) => packet.update())
}

sketch.draw = () => {
  network.draw(sketch)
  packets.forEach((packet) => packet.draw(sketch))
  if (showOverlay) {
    stats.forEach((stat) => stat.showAddressOverlay())
  }
}

sketch.touchstart = () => {
  const {x, y} = sketch.touches[0]
  if (sketch.keys['SHIFT']) {
    let node = network.findClosestNodes(x, y, 1)[0]
    if (node) {
      smart1.addPackets(getCount('.algo-0'), node.x, node.y)
    }
    return
  }
  const edge = network.findClosestEdge(x, y)
  if (edge) {
    edge.toggleActive()
  }
}

window.sketch = sketch
window.network = network
window.smart1 = smart1

packets.forEach((collection, i) => {
  (() => {
    const selector = `.algo-${i}`
    const coll = collection
    document.querySelector(`${selector} .add`).addEventListener('click', () => {
      coll.addPackets(getCount(selector))
    })
  })()
})

document.querySelector('.reset-stats').addEventListener('click', () => {
  stats.forEach((stat) => stat.resetStats())
})

const $popularAddressesBtn = document.querySelector('.get-popular-addresses')
$popularAddressesBtn.addEventListener('click', () => {
  showOverlay = !showOverlay
  const method = showOverlay ? 'add' : 'remove'
  $popularAddressesBtn.classList[method]('on')
})

function getCount (selector) {
  return parseInt(document.querySelector(`${selector} input.count`).value, 10)
}

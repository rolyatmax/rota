const SPACING = 50
const SPEED = 2
const LATENCY_RANGE = [10, 90].map((num) => num / SPEED)
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2
const NETWORK_SIZE = 30
const CANVAS_SIZE = [800, 500]

const settings = {
  LATENCY_RANGE,
  REDZONE_TIME,
  SPACING,
  NETWORK_SIZE,
  CANVAS_SIZE
}

module.exports = settings

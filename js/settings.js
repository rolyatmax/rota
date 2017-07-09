const SPACING = 50
const SPEED = 1
const LATENCY_RANGE = [20, 180].map((num) => num * SPEED)
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2
const ROW_COLUMN_COUNT = 7

const settings = {
  LATENCY_RANGE,
  REDZONE_TIME,
  SPACING,
  ROW_COLUMN_COUNT
}

module.exports = settings

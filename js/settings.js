const SPACING = 50
const SPEED = 2
const LATENCY_RANGE = [10, 90].map((num) => num / SPEED)
const REDZONE_TIME = 40 * (LATENCY_RANGE[0] + LATENCY_RANGE[1]) / 2
const ROW_COLUMN_COUNT = 7

const settings = {
  LATENCY_RANGE,
  REDZONE_TIME,
  SPACING,
  ROW_COLUMN_COUNT
}

module.exports = settings

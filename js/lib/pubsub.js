const Backbone = require('backbone')
const _ = require('underscore')

const Pubsub = { ...Backbone.Events }
window.Pubsub = Pubsub

modules.exports = Pubsub

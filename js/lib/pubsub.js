var Backbone = require('backbone');
var _ = require('underscore');

var Pubsub = _.clone(Backbone.Events);
window.Pubsub = Pubsub;

modules.exports = Pubsub;

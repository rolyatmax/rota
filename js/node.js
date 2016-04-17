var _ = require('underscore');
var settings = require('./settings');

const SPACING = settings.SPACING;
const RADIUS = 4;
const COLOR = 'rgba(0, 0, 0, 0.5)';

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.id = key(x, y);
        this.loc = [(x + 1) * SPACING, (y + 1) * SPACING];
        this.edges = [];

        this.policy = {};
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
    removeEdge(edge) {
        var i = this.edges.indexOf(edge);
        if (i < 0) {
            return;
        }
        this.edges.splice(i, 1);
    }
    getNeighbors() {
        return this.edges.map((edge) => edge.getOtherNode(this));
    }
    selectEdge(smartOpts, smart, endNode) {
        if (!smart) {
            return _.sample(this.edges);
        }
        var policyVersion = smartOpts['version'];
        _ensureDefaults(this.policy, policyVersion, endNode, this.edges, smartOpts['initial']);
        var validActions = this.getValidActions(policyVersion, endNode);
        if (Math.random() > smartOpts['explore']) {
            let maxValue = this.getMaxActionValue(smartOpts, endNode);
            validActions = _.where(validActions, {'value': maxValue});
        }
        var action = _.sample(validActions);
        return action && action['edge'];
    }
    getMaxActionValue(smartOpts, endNode) {
        var policyVersion = smartOpts['version'];
        _ensureDefaults(this.policy, policyVersion, endNode, this.edges, smartOpts['initial']);
        var validActions = this.getValidActions(policyVersion, endNode);
        var maxAction = _.max(validActions, (action) => action.value);
        return maxAction['value'];
    }
    getValidActions(policyVersion, endNode) {
        var actions = Object.values(this.policy[policyVersion][endNode.id]);
        return actions.filter((action) => this.edges.includes(action.edge));
    }
    getEvaluationCb(smartOpts, endNode, edge) {
        var policyVersion = smartOpts['version'];
        var alpha = smartOpts['alpha'];
        var discount = smartOpts['discount'];
        return (reward, curMaxValue) => {
            var prevVal = this.policy[policyVersion][endNode.id][edge.id]['value'];
            var newVal = (1 - discount) * prevVal + alpha * (reward + discount * curMaxValue);
            this.policy[policyVersion][endNode.id][edge.id]['value'] = newVal;
        };
    }
    draw(ctx) {
        var [x, y] = this.loc;
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, 0, TWO_PI);
        ctx.fillStyle = COLOR;
        ctx.fill();
    }
}

function key(x, y) {
    return x + '|' + y;
}

function _ensureDefaults(policy, policyVersion, endNode, edges, initial) {
    policy[policyVersion] = policy[policyVersion] || {};
    var curPolicy = policy[policyVersion];
    curPolicy[endNode.id] = curPolicy[endNode.id] || {};
    edges.forEach((edge) => {
        curPolicy[endNode.id][edge.id] = curPolicy[endNode.id][edge.id] || {
            'value': initial,
            'edge': edge
        };
    });
}

module.exports = Node;

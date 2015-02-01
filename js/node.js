const SPACING = 60;
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
        return this.edges.map((edge) => {
            return edge.getOtherNode(this);
        });
    }
    selectEdge(smartOpts, smart, endNode) {
        if (!smart) {
            return _.sample(this.edges);
        }
        var policyVersion = smartOpts['version'];
        _ensureDefaults(this.policy, policyVersion, endNode, this.edges, smartOpts['initial']);
        var actions = this.policy[policyVersion][endNode.id];
        if (Math.random() > smartOpts['explore']) {
            let maxValue = this.getMaxActionValue(smartOpts, endNode);
            actions = _.where(actions, {'value': maxValue});
        }
        return _.sample(actions)['edge'];
    }
    getMaxActionValue(smartOpts, endNode) {
        var policyVersion = smartOpts['version'];
        _ensureDefaults(this.policy, policyVersion, endNode, this.edges, smartOpts['initial']);
        var maxAction = _.max(this.policy[policyVersion][endNode.id], (action) => { return action['value']; });
        return maxAction['value'];
    }
    getEvaluationCb(smartOpts, endNode, edge) {
        var policyVersion = smartOpts['version'];
        var alpha = smartOpts['alpha'];
        var discount = smartOpts['discount'];
        return function(reward, curMaxValue) {
            var prevVal = this.policy[policyVersion][endNode.id][edge.id]['value'];
            var newVal = (1 - discount) * prevVal + alpha * (reward + discount * curMaxValue);
            this.policy[policyVersion][endNode.id][edge.id]['value'] = newVal;
        }.bind(this);
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

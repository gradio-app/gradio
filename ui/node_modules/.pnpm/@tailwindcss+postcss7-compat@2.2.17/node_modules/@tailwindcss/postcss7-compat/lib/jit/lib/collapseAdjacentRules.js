"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collapseAdjacentRules;
let comparisonMap = {
  atrule: ['name', 'params'],
  rule: ['selector']
};
let types = new Set(Object.keys(comparisonMap));

function collapseAdjacentRules() {
  return root => {
    let currentRule = null;
    root.each(node => {
      if (!types.has(node.type)) {
        currentRule = null;
        return;
      }

      if (currentRule === null) {
        currentRule = node;
        return;
      }

      let properties = comparisonMap[node.type];

      if (node.type === 'atrule' && node.name === 'font-face') {
        currentRule = node;
      } else if (properties.every(property => {
        var _node$property, _currentRule$property;

        return ((_node$property = node[property]) !== null && _node$property !== void 0 ? _node$property : '').replace(/\s+/g, ' ') === ((_currentRule$property = currentRule[property]) !== null && _currentRule$property !== void 0 ? _currentRule$property : '').replace(/\s+/g, ' ');
      })) {
        currentRule.append(node.nodes);
        node.remove();
      } else {
        currentRule = node;
      }
    });
  };
}
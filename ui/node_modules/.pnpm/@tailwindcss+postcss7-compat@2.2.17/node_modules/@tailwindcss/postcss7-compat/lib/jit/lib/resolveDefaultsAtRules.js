"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveDefaultsAtRules;

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _featureFlags = require("../../featureFlags");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function minimumImpactSelector(nodes) {
  let pseudos = nodes.filter(n => n.type === 'pseudo');
  let [bestNode] = nodes;

  for (let [type, getNode = n => n] of [['class'], ['id', n => _postcssSelectorParser.default.attribute({
    attribute: 'id',
    operator: '=',
    value: n.value,
    quoteMark: '"'
  })], ['attribute']]) {
    let match = nodes.find(n => n.type === type);

    if (match) {
      bestNode = getNode(match);
      break;
    }
  }

  return [bestNode, ...pseudos].join('').trim();
}

let elementSelectorParser = (0, _postcssSelectorParser.default)(selectors => {
  return selectors.map(s => {
    let nodes = s.split(n => n.type === 'combinator').pop().filter(n => n.type !== 'pseudo' || n.value.startsWith('::'));
    return minimumImpactSelector(nodes);
  });
});
let cache = new Map();

function extractElementSelector(selector) {
  if (!cache.has(selector)) {
    cache.set(selector, elementSelectorParser.transformSync(selector));
  }

  return cache.get(selector);
}

function resolveDefaultsAtRules({
  tailwindConfig
}) {
  return root => {
    let variableNodeMap = new Map();
    let universals = new Set();
    root.walkAtRules('defaults', rule => {
      if (rule.nodes && rule.nodes.length > 0) {
        universals.add(rule);
        return;
      }

      let variable = rule.params;

      if (!variableNodeMap.has(variable)) {
        variableNodeMap.set(variable, new Set());
      }

      variableNodeMap.get(variable).add(rule.parent);
      rule.remove();
    });

    for (let universal of universals) {
      var _variableNodeMap$get;

      let selectors = new Set();
      let rules = (_variableNodeMap$get = variableNodeMap.get(universal.params)) !== null && _variableNodeMap$get !== void 0 ? _variableNodeMap$get : [];

      for (let rule of rules) {
        for (let selector of extractElementSelector(rule.selector)) {
          selectors.add(selector);
        }
      }

      if (selectors.size === 0) {
        universal.remove();
        continue;
      }

      let universalRule = _postcss.default.rule();

      if ((0, _featureFlags.flagEnabled)(tailwindConfig, 'optimizeUniversalDefaults')) {
        universalRule.selectors = [...selectors];
      } else {
        universalRule.selectors = ['*', '::before', '::after'];
      }

      universalRule.append(universal.nodes);
      universal.before(universalRule);
      universal.remove();
    }
  };
}
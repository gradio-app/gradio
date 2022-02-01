"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _cloneNodes = _interopRequireDefault(require("../util/cloneNodes"));

var _buildMediaQuery = _interopRequireDefault(require("../util/buildMediaQuery"));

var _buildSelectorVariant = _interopRequireDefault(require("../util/buildSelectorVariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isLayer(node) {
  if (Array.isArray(node)) {
    return node.length === 1 && isLayer(node[0]);
  }

  return node.type === 'atrule' && node.name === 'layer';
}

function layerNodes(nodes) {
  return isLayer(nodes) ? nodes[0].nodes : nodes;
}

function _default(config) {
  return function (css) {
    // Wrap any `responsive` rules with a copy of their parent `layer` to
    // ensure the layer isn't lost when copying to the `screens` location.
    css.walkAtRules('layer', layerAtRule => {
      const layer = layerAtRule.params;
      layerAtRule.walkAtRules('responsive', responsiveAtRule => {
        const nestedlayerAtRule = _postcss.default.atRule({
          name: 'layer',
          params: layer
        });

        nestedlayerAtRule.prepend(responsiveAtRule.nodes);
        responsiveAtRule.removeAll();
        responsiveAtRule.prepend(nestedlayerAtRule);
      });
    });
    const {
      theme: {
        screens
      },
      separator
    } = config;

    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('responsive', atRule => {
      const nodes = atRule.nodes;
      responsiveRules.append(...(0, _cloneNodes.default)(nodes)); // If the parent is already a `layer` (this is true for anything coming from
      // a plugin, including core plugins) we don't want to create a double nested
      // layer, so only insert the layer children. If there is no parent layer,
      // preserve the layer information when inserting the nodes.

      if (isLayer(atRule.parent)) {
        atRule.before(layerNodes(nodes));
      } else {
        atRule.before(nodes);
      }

      atRule.remove();
    });

    _lodash.default.keys(screens).forEach(screen => {
      const mediaQuery = _postcss.default.atRule({
        name: 'media',
        params: (0, _buildMediaQuery.default)(screens[screen])
      });

      mediaQuery.append(_lodash.default.tap(responsiveRules.clone(), clonedRoot => {
        clonedRoot.walkRules(rule => {
          rule.selectors = _lodash.default.map(rule.selectors, selector => (0, _buildSelectorVariant.default)(selector, screen, separator, message => {
            throw rule.error(message);
          }));
        });
      }));
      finalRules.push(mediaQuery);
    });

    const hasScreenRules = finalRules.some(i => i.nodes.length !== 0);
    css.walkAtRules('tailwind', atRule => {
      if (atRule.params !== 'screens') {
        return;
      }

      if (hasScreenRules) {
        atRule.before(finalRules);
      }

      atRule.remove();
    });
  };
}
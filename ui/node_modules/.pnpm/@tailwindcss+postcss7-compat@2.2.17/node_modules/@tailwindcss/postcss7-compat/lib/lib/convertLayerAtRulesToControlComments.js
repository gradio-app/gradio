"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertLayerAtRulesToControlComments;

var _postcss = _interopRequireDefault(require("postcss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertLayerAtRulesToControlComments() {
  return function (css) {
    css.walkAtRules('layer', atRule => {
      const layer = atRule.params;

      if (!['base', 'components', 'utilities'].includes(layer)) {
        return;
      }

      atRule.before(_postcss.default.comment({
        text: `tailwind start ${layer}`
      }));
      atRule.before(atRule.nodes);
      atRule.before(_postcss.default.comment({
        text: `tailwind end ${layer}`
      }));
      atRule.remove();
    });
  };
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _pluginUtils = require("../util/pluginUtils");

var _createUtilityPlugin = _interopRequireDefault(require("../util/createUtilityPlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function (helpers) {
    if (helpers.config('mode') === 'jit') {
      (0, _createUtilityPlugin.default)('borderWidth', [['border', [['@defaults border-width', {}], 'border-width']], [['border-t', [['@defaults border-width', {}], 'border-top-width']], ['border-r', [['@defaults border-width', {}], 'border-right-width']], ['border-b', [['@defaults border-width', {}], 'border-bottom-width']], ['border-l', [['@defaults border-width', {}], 'border-left-width']]]], {
        resolveArbitraryValue: _pluginUtils.asLength
      })(helpers);
    } else {
      (0, _createUtilityPlugin.default)('borderWidth', [['border', ['border-width']], [['border-t', ['border-top-width']], ['border-r', ['border-right-width']], ['border-b', ['border-bottom-width']], ['border-l', ['border-left-width']]]], {
        resolveArbitraryValue: _pluginUtils.asLength
      })(helpers);
    }
  };
}
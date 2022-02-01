"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _createUtilityPlugin = _interopRequireDefault(require("../util/createUtilityPlugin"));

var _pluginUtils = require("../util/pluginUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return (0, _createUtilityPlugin.default)('ringOffsetWidth', [['ring-offset', ['--tw-ring-offset-width']]], {
    resolveArbitraryValue: _pluginUtils.asLength
  });
}
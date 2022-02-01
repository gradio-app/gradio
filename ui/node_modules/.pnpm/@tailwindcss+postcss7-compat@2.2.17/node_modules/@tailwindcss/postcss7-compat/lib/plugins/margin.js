"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _createUtilityPlugin = _interopRequireDefault(require("../util/createUtilityPlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return (0, _createUtilityPlugin.default)('margin', [['m', ['margin']], [['mx', ['margin-left', 'margin-right']], ['my', ['margin-top', 'margin-bottom']]], [['mt', ['margin-top']], ['mr', ['margin-right']], ['mb', ['margin-bottom']], ['ml', ['margin-left']]]]);
}
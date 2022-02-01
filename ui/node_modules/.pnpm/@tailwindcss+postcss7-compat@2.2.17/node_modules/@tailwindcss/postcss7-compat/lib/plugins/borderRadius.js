"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _createUtilityPlugin = _interopRequireDefault(require("../util/createUtilityPlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return (0, _createUtilityPlugin.default)('borderRadius', [['rounded', ['border-radius']], [['rounded-t', ['border-top-left-radius', 'border-top-right-radius']], ['rounded-r', ['border-top-right-radius', 'border-bottom-right-radius']], ['rounded-b', ['border-bottom-right-radius', 'border-bottom-left-radius']], ['rounded-l', ['border-top-left-radius', 'border-bottom-left-radius']]], [['rounded-tl', ['border-top-left-radius']], ['rounded-tr', ['border-top-right-radius']], ['rounded-br', ['border-bottom-right-radius']], ['rounded-bl', ['border-bottom-left-radius']]]]);
}
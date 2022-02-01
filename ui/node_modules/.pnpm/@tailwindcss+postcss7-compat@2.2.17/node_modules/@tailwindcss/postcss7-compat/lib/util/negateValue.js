"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _reduceCssCalc = _interopRequireDefault(require("reduce-css-calc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(value) {
  try {
    return (0, _reduceCssCalc.default)(`calc(${value} * -1)`);
  } catch (e) {
    return value;
  }
}
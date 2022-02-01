"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toColorValue;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toColorValue(maybeFunction) {
  return _lodash.default.isFunction(maybeFunction) ? maybeFunction({}) : maybeFunction;
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prefixNegativeModifiers;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prefixNegativeModifiers(base, modifier) {
  if (modifier === '-') {
    return `-${base}`;
  } else if (_lodash.default.startsWith(modifier, '-')) {
    return `-${base}-${modifier.slice(1)}`;
  } else {
    return `${base}-${modifier}`;
  }
}
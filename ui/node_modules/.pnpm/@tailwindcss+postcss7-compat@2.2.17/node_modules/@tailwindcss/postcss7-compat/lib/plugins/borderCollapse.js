"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default() {
  return function ({
    addUtilities,
    variants
  }) {
    addUtilities({
      '.border-collapse': {
        'border-collapse': 'collapse'
      },
      '.border-separate': {
        'border-collapse': 'separate'
      }
    }, variants('borderCollapse'));
  };
}
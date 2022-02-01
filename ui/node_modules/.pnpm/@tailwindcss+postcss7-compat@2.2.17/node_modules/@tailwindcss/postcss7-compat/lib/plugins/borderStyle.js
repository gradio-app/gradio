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
      '.border-solid': {
        'border-style': 'solid'
      },
      '.border-dashed': {
        'border-style': 'dashed'
      },
      '.border-dotted': {
        'border-style': 'dotted'
      },
      '.border-double': {
        'border-style': 'double'
      },
      '.border-none': {
        'border-style': 'none'
      }
    }, variants('borderStyle'));
  };
}
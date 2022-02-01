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
      '.list-inside': {
        'list-style-position': 'inside'
      },
      '.list-outside': {
        'list-style-position': 'outside'
      }
    }, variants('listStylePosition'));
  };
}
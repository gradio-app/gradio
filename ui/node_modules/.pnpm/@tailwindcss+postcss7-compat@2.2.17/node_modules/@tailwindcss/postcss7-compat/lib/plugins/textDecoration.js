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
      '.underline': {
        'text-decoration': 'underline'
      },
      '.line-through': {
        'text-decoration': 'line-through'
      },
      '.no-underline': {
        'text-decoration': 'none'
      }
    }, variants('textDecoration'));
  };
}
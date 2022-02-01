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
      '.text-left': {
        'text-align': 'left'
      },
      '.text-center': {
        'text-align': 'center'
      },
      '.text-right': {
        'text-align': 'right'
      },
      '.text-justify': {
        'text-align': 'justify'
      }
    }, variants('textAlign'));
  };
}
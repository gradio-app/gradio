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
      '.justify-items-start': {
        'justify-items': 'start'
      },
      '.justify-items-end': {
        'justify-items': 'end'
      },
      '.justify-items-center': {
        'justify-items': 'center'
      },
      '.justify-items-stretch': {
        'justify-items': 'stretch'
      }
    }, variants('justifyItems'));
  };
}
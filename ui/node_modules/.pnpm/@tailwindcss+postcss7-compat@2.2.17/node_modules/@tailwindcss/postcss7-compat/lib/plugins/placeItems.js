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
      '.place-items-start': {
        'place-items': 'start'
      },
      '.place-items-end': {
        'place-items': 'end'
      },
      '.place-items-center': {
        'place-items': 'center'
      },
      '.place-items-stretch': {
        'place-items': 'stretch'
      }
    }, variants('placeItems'));
  };
}
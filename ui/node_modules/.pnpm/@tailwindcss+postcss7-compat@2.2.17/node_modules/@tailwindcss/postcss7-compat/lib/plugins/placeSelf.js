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
      '.place-self-auto': {
        'place-self': 'auto'
      },
      '.place-self-start': {
        'place-self': 'start'
      },
      '.place-self-end': {
        'place-self': 'end'
      },
      '.place-self-center': {
        'place-self': 'center'
      },
      '.place-self-stretch': {
        'place-self': 'stretch'
      }
    }, variants('placeSelf'));
  };
}
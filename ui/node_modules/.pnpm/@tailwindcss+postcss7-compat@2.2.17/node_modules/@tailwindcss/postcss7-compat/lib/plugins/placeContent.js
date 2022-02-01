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
      '.place-content-center': {
        'place-content': 'center'
      },
      '.place-content-start': {
        'place-content': 'start'
      },
      '.place-content-end': {
        'place-content': 'end'
      },
      '.place-content-between': {
        'place-content': 'space-between'
      },
      '.place-content-around': {
        'place-content': 'space-around'
      },
      '.place-content-evenly': {
        'place-content': 'space-evenly'
      },
      '.place-content-stretch': {
        'place-content': 'stretch'
      }
    }, variants('placeContent'));
  };
}
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
      '.justify-self-auto': {
        'justify-self': 'auto'
      },
      '.justify-self-start': {
        'justify-self': 'start'
      },
      '.justify-self-end': {
        'justify-self': 'end'
      },
      '.justify-self-center': {
        'justify-self': 'center'
      },
      '.justify-self-stretch': {
        'justify-self': 'stretch'
      }
    }, variants('justifySelf'));
  };
}
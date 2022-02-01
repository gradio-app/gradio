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
      '.self-auto': {
        'align-self': 'auto'
      },
      '.self-start': {
        'align-self': 'flex-start'
      },
      '.self-end': {
        'align-self': 'flex-end'
      },
      '.self-center': {
        'align-self': 'center'
      },
      '.self-stretch': {
        'align-self': 'stretch'
      },
      '.self-baseline': {
        'align-self': 'baseline'
      }
    }, variants('alignSelf'));
  };
}
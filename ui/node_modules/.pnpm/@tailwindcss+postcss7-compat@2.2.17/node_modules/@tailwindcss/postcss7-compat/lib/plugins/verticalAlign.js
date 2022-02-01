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
      '.align-baseline': {
        'vertical-align': 'baseline'
      },
      '.align-top': {
        'vertical-align': 'top'
      },
      '.align-middle': {
        'vertical-align': 'middle'
      },
      '.align-bottom': {
        'vertical-align': 'bottom'
      },
      '.align-text-top': {
        'vertical-align': 'text-top'
      },
      '.align-text-bottom': {
        'vertical-align': 'text-bottom'
      }
    }, variants('verticalAlign'));
  };
}
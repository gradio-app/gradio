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
      '.whitespace-normal': {
        'white-space': 'normal'
      },
      '.whitespace-nowrap': {
        'white-space': 'nowrap'
      },
      '.whitespace-pre': {
        'white-space': 'pre'
      },
      '.whitespace-pre-line': {
        'white-space': 'pre-line'
      },
      '.whitespace-pre-wrap': {
        'white-space': 'pre-wrap'
      }
    }, variants('whitespace'));
  };
}
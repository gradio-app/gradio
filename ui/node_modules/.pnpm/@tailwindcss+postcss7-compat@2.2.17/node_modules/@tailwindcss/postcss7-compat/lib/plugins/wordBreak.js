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
      '.break-normal': {
        'overflow-wrap': 'normal',
        'word-break': 'normal'
      },
      '.break-words': {
        'overflow-wrap': 'break-word'
      },
      '.break-all': {
        'word-break': 'break-all'
      }
    }, variants('wordBreak'));
  };
}
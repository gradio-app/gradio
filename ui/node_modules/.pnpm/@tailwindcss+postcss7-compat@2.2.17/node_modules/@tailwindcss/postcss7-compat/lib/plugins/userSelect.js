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
      '.select-none': {
        'user-select': 'none'
      },
      '.select-text': {
        'user-select': 'text'
      },
      '.select-all': {
        'user-select': 'all'
      },
      '.select-auto': {
        'user-select': 'auto'
      }
    }, variants('userSelect'));
  };
}
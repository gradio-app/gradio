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
      '.clear-left': {
        clear: 'left'
      },
      '.clear-right': {
        clear: 'right'
      },
      '.clear-both': {
        clear: 'both'
      },
      '.clear-none': {
        clear: 'none'
      }
    }, variants('clear'));
  };
}
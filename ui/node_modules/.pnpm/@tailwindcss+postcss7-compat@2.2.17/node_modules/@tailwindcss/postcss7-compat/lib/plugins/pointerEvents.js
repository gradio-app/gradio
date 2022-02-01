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
      '.pointer-events-none': {
        'pointer-events': 'none'
      },
      '.pointer-events-auto': {
        'pointer-events': 'auto'
      }
    }, variants('pointerEvents'));
  };
}
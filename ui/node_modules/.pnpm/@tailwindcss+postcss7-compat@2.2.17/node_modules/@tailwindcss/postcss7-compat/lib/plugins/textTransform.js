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
      '.uppercase': {
        'text-transform': 'uppercase'
      },
      '.lowercase': {
        'text-transform': 'lowercase'
      },
      '.capitalize': {
        'text-transform': 'capitalize'
      },
      '.normal-case': {
        'text-transform': 'none'
      }
    }, variants('textTransform'));
  };
}
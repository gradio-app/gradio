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
      '.bg-repeat': {
        'background-repeat': 'repeat'
      },
      '.bg-no-repeat': {
        'background-repeat': 'no-repeat'
      },
      '.bg-repeat-x': {
        'background-repeat': 'repeat-x'
      },
      '.bg-repeat-y': {
        'background-repeat': 'repeat-y'
      },
      '.bg-repeat-round': {
        'background-repeat': 'round'
      },
      '.bg-repeat-space': {
        'background-repeat': 'space'
      }
    }, variants('backgroundRepeat'));
  };
}
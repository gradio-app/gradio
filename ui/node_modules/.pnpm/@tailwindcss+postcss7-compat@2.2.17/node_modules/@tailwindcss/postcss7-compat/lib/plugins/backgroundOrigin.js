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
      '.bg-origin-border': {
        'background-origin': 'border-box'
      },
      '.bg-origin-padding': {
        'background-origin': 'padding-box'
      },
      '.bg-origin-content': {
        'background-origin': 'content-box'
      }
    }, variants('backgroundOrigin'));
  };
}
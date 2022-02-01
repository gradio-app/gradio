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
      '.visible': {
        visibility: 'visible'
      },
      '.invisible': {
        visibility: 'hidden'
      }
    }, variants('visibility'));
  };
}
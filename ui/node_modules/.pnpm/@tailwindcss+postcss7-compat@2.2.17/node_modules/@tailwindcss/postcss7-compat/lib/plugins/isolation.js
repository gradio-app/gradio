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
      '.isolate': {
        isolation: 'isolate'
      },
      '.isolation-auto': {
        isolation: 'auto'
      }
    }, variants('isolation'));
  };
}
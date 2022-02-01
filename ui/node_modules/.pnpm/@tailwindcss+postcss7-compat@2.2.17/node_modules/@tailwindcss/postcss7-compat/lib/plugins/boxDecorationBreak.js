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
      '.decoration-slice': {
        'box-decoration-break': 'slice'
      },
      '.decoration-clone': {
        'box-decoration-break': 'clone'
      }
    }, variants('boxDecorationBreak'));
  };
}
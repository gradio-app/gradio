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
      '.italic': {
        'font-style': 'italic'
      },
      '.not-italic': {
        'font-style': 'normal'
      }
    }, variants('fontStyle'));
  };
}
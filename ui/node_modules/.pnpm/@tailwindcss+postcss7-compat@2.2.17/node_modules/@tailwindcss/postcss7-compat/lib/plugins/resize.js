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
      '.resize-none': {
        resize: 'none'
      },
      '.resize-y': {
        resize: 'vertical'
      },
      '.resize-x': {
        resize: 'horizontal'
      },
      '.resize': {
        resize: 'both'
      }
    }, variants('resize'));
  };
}
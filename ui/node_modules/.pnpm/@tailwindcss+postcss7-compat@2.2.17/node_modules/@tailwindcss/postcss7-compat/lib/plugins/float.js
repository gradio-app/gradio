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
      '.float-right': {
        float: 'right'
      },
      '.float-left': {
        float: 'left'
      },
      '.float-none': {
        float: 'none'
      }
    }, variants('float'));
  };
}
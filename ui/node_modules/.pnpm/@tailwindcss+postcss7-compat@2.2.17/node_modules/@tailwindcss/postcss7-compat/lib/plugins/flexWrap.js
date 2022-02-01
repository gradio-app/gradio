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
      '.flex-wrap': {
        'flex-wrap': 'wrap'
      },
      '.flex-wrap-reverse': {
        'flex-wrap': 'wrap-reverse'
      },
      '.flex-nowrap': {
        'flex-wrap': 'nowrap'
      }
    }, variants('flexWrap'));
  };
}
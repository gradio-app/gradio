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
      '.object-contain': {
        'object-fit': 'contain'
      },
      '.object-cover': {
        'object-fit': 'cover'
      },
      '.object-fill': {
        'object-fit': 'fill'
      },
      '.object-none': {
        'object-fit': 'none'
      },
      '.object-scale-down': {
        'object-fit': 'scale-down'
      }
    }, variants('objectFit'));
  };
}
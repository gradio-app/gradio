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
      '.table-auto': {
        'table-layout': 'auto'
      },
      '.table-fixed': {
        'table-layout': 'fixed'
      }
    }, variants('tableLayout'));
  };
}
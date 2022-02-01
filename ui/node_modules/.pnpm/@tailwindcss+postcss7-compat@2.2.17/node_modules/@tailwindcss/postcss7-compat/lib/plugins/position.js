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
      '.static': {
        position: 'static'
      },
      '.fixed': {
        position: 'fixed'
      },
      '.absolute': {
        position: 'absolute'
      },
      '.relative': {
        position: 'relative'
      },
      '.sticky': {
        position: 'sticky'
      }
    }, variants('position'));
  };
}
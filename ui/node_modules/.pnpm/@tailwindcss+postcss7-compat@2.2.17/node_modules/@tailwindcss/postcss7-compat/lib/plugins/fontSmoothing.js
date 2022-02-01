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
      '.antialiased': {
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale'
      },
      '.subpixel-antialiased': {
        '-webkit-font-smoothing': 'auto',
        '-moz-osx-font-smoothing': 'auto'
      }
    }, variants('fontSmoothing'));
  };
}
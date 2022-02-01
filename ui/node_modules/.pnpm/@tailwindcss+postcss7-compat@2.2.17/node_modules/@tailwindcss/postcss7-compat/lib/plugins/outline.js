"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants
  }) {
    matchUtilities({
      outline: value => {
        let [outline, outlineOffset = '0'] = Array.isArray(value) ? value : [value];
        return {
          outline,
          'outline-offset': outlineOffset
        };
      }
    }, {
      values: theme('outline'),
      variants: variants('outline'),
      type: 'any'
    });
  };
}
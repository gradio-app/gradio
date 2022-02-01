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
      'placeholder-opacity': value => {
        return {
          ['&::placeholder']: {
            '--tw-placeholder-opacity': value
          }
        };
      }
    }, {
      values: theme('placeholderOpacity'),
      variants: variants('placeholderOpacity'),
      type: 'any'
    });
  };
}
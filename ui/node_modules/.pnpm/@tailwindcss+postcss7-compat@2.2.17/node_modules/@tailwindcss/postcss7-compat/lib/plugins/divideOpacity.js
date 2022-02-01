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
      'divide-opacity': value => {
        return {
          [`& > :not([hidden]) ~ :not([hidden])`]: {
            '--tw-divide-opacity': value
          }
        };
      }
    }, {
      values: theme('divideOpacity'),
      variants: variants('divideOpacity'),
      type: 'any'
    });
  };
}
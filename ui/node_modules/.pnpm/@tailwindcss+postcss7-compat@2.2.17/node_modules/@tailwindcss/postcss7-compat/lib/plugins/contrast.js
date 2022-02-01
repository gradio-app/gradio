"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default() {
  return function ({
    config,
    matchUtilities,
    theme,
    variants
  }) {
    matchUtilities({
      contrast: value => {
        return {
          '--tw-contrast': `contrast(${value})`,
          ...(config('mode') === 'jit' ? {
            '@defaults filter': {},
            filter: 'var(--tw-filter)'
          } : {})
        };
      }
    }, {
      values: theme('contrast'),
      variants: variants('contrast'),
      type: 'any'
    });
  };
}
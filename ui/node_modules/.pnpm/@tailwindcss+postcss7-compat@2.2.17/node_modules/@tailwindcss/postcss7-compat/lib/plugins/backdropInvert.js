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
      'backdrop-invert': value => {
        return {
          '--tw-backdrop-invert': `invert(${value})`,
          ...(config('mode') === 'jit' ? {
            '@defaults backdrop-filter': {},
            'backdrop-filter': 'var(--tw-backdrop-filter)'
          } : {})
        };
      }
    }, {
      values: theme('backdropInvert'),
      variants: variants('backdropInvert'),
      type: 'any'
    });
  };
}
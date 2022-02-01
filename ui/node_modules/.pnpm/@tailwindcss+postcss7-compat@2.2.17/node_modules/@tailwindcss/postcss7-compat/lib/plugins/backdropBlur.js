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
      'backdrop-blur': value => {
        return {
          '--tw-backdrop-blur': `blur(${value})`,
          ...(config('mode') === 'jit' ? {
            '@defaults backdrop-filter': {},
            'backdrop-filter': 'var(--tw-backdrop-filter)'
          } : {})
        };
      }
    }, {
      values: theme('backdropBlur'),
      variants: variants('backdropBlur'),
      type: 'any'
    });
  };
}
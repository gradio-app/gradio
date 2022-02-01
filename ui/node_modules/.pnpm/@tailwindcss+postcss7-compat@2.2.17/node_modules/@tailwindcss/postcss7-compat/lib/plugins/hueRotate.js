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
      'hue-rotate': value => {
        return {
          '--tw-hue-rotate': `hue-rotate(${value})`,
          ...(config('mode') === 'jit' ? {
            '@defaults filter': {},
            filter: 'var(--tw-filter)'
          } : {})
        };
      }
    }, {
      values: theme('hueRotate'),
      variants: variants('hueRotate'),
      type: 'any'
    });
  };
}
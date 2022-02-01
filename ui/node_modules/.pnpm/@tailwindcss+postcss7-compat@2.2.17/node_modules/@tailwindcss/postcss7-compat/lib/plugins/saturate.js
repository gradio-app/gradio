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
      saturate: value => {
        return {
          '--tw-saturate': `saturate(${value})`,
          ...(config('mode') === 'jit' ? {
            '@defaults filter': {},
            filter: 'var(--tw-filter)'
          } : {})
        };
      }
    }, {
      values: theme('saturate'),
      variants: variants('saturate'),
      type: 'any'
    });
  };
}
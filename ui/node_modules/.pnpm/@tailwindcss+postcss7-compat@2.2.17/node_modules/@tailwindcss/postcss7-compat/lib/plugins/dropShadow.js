"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash"));

var _nameClass = _interopRequireDefault(require("../util/nameClass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    config,
    addUtilities,
    theme,
    variants
  }) {
    const utilities = _lodash.default.fromPairs(_lodash.default.map(theme('dropShadow'), (value, modifier) => {
      return [(0, _nameClass.default)('drop-shadow', modifier), {
        '--tw-drop-shadow': Array.isArray(value) ? value.map(v => `drop-shadow(${v})`).join(' ') : `drop-shadow(${value})`,
        ...(config('mode') === 'jit' ? {
          '@defaults filter': {},
          filter: 'var(--tw-filter)'
        } : {})
      }];
    }));

    addUtilities(utilities, variants('dropShadow'));
  };
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _flattenColorPalette = _interopRequireDefault(require("../util/flattenColorPalette"));

var _toColorValue = _interopRequireDefault(require("../util/toColorValue"));

var _withAlphaVariable = require("../util/withAlphaVariable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transparentTo(value) {
  return (0, _withAlphaVariable.withAlphaValue)(value, 0, 'rgba(255, 255, 255, 0)');
}

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants
  }) {
    let options = {
      values: (0, _flattenColorPalette.default)(theme('gradientColorStops')),
      variants: variants('gradientColorStops'),
      type: ['color', 'any']
    };
    matchUtilities({
      from: value => {
        let transparentToValue = transparentTo(value);
        return {
          '--tw-gradient-from': (0, _toColorValue.default)(value, 'from'),
          '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, ${transparentToValue})`
        };
      }
    }, options);
    matchUtilities({
      via: value => {
        let transparentToValue = transparentTo(value);
        return {
          '--tw-gradient-stops': `var(--tw-gradient-from), ${(0, _toColorValue.default)(value, 'via')}, var(--tw-gradient-to, ${transparentToValue})`
        };
      }
    }, options);
    matchUtilities({
      to: value => {
        return {
          '--tw-gradient-to': (0, _toColorValue.default)(value, 'to')
        };
      }
    }, options);
  };
}
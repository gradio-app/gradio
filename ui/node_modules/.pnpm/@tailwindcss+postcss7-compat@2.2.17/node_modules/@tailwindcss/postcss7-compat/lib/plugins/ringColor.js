"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _flattenColorPalette = _interopRequireDefault(require("../util/flattenColorPalette"));

var _withAlphaVariable = _interopRequireDefault(require("../util/withAlphaVariable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants
  }) {
    matchUtilities({
      ring: value => {
        return (0, _withAlphaVariable.default)({
          color: value,
          property: '--tw-ring-color',
          variable: '--tw-ring-opacity'
        });
      }
    }, {
      values: Object.fromEntries(Object.entries((0, _flattenColorPalette.default)(theme('ringColor'))).filter(([modifier]) => modifier !== 'DEFAULT')),
      variants: variants('ringColor'),
      type: 'color'
    });
  };
}
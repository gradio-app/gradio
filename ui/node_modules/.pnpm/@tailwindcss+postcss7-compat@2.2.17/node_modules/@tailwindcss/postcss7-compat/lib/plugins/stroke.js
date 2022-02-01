"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _flattenColorPalette = _interopRequireDefault(require("../util/flattenColorPalette"));

var _toColorValue = _interopRequireDefault(require("../util/toColorValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants
  }) {
    matchUtilities({
      stroke: value => {
        return {
          stroke: (0, _toColorValue.default)(value)
        };
      }
    }, {
      values: (0, _flattenColorPalette.default)(theme('stroke')),
      variants: variants('stroke'),
      type: 'color'
    });
  };
}
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
    variants,
    corePlugins
  }) {
    matchUtilities({
      bg: value => {
        if (!corePlugins('backgroundOpacity')) {
          return {
            'background-color': value
          };
        }

        return (0, _withAlphaVariable.default)({
          color: value,
          property: 'background-color',
          variable: '--tw-bg-opacity'
        });
      }
    }, {
      values: (0, _flattenColorPalette.default)(theme('backgroundColor')),
      variants: variants('backgroundColor'),
      type: 'color'
    });
  };
}
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
      divide: value => {
        if (!corePlugins('divideOpacity')) {
          return {
            ['& > :not([hidden]) ~ :not([hidden])']: {
              'border-color': value
            }
          };
        }

        return {
          ['& > :not([hidden]) ~ :not([hidden])']: (0, _withAlphaVariable.default)({
            color: value,
            property: 'border-color',
            variable: '--tw-divide-opacity'
          })
        };
      }
    }, {
      values: (({
        DEFAULT: _,
        ...colors
      }) => colors)((0, _flattenColorPalette.default)(theme('divideColor'))),
      variants: variants('divideColor'),
      type: 'color'
    });
  };
}
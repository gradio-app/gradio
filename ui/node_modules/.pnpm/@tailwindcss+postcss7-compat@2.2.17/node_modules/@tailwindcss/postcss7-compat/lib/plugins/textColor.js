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
      text: value => {
        if (!corePlugins('textOpacity')) {
          return {
            color: value
          };
        }

        return (0, _withAlphaVariable.default)({
          color: value,
          property: 'color',
          variable: '--tw-text-opacity'
        });
      }
    }, {
      values: (0, _flattenColorPalette.default)(theme('textColor')),
      variants: variants('textColor'),
      type: 'color'
    });
  };
}
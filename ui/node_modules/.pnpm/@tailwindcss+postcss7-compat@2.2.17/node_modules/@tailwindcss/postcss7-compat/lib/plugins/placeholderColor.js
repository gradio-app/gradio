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
      placeholder: value => {
        if (!corePlugins('placeholderOpacity')) {
          return {
            '&::placeholder': {
              color: value
            }
          };
        }

        return {
          '&::placeholder': (0, _withAlphaVariable.default)({
            color: value,
            property: 'color',
            variable: '--tw-placeholder-opacity'
          })
        };
      }
    }, {
      values: (0, _flattenColorPalette.default)(theme('placeholderColor')),
      variants: variants('placeholderColor'),
      type: ['color', 'any']
    });
  };
}
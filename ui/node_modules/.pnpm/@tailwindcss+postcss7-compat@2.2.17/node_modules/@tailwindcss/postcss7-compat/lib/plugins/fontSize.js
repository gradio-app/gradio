"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _isPlainObject = _interopRequireDefault(require("../util/isPlainObject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants
  }) {
    matchUtilities({
      text: value => {
        let [fontSize, options] = Array.isArray(value) ? value : [value];
        let {
          lineHeight,
          letterSpacing
        } = (0, _isPlainObject.default)(options) ? options : {
          lineHeight: options
        };
        return {
          'font-size': fontSize,
          ...(lineHeight === undefined ? {} : {
            'line-height': lineHeight
          }),
          ...(letterSpacing === undefined ? {} : {
            'letter-spacing': letterSpacing
          })
        };
      }
    }, {
      values: theme('fontSize'),
      variants: variants('fontSize'),
      type: 'length'
    });
  };
}
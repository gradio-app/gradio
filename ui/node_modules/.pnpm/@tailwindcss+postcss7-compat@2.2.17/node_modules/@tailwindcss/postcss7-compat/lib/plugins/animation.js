"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _parseAnimationValue = _interopRequireDefault(require("../util/parseAnimationValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    matchUtilities,
    theme,
    variants,
    prefix
  }) {
    let prefixName = name => prefix(`.${name}`).slice(1);

    let keyframes = Object.fromEntries(Object.entries(theme('keyframes') || {}).map(([key, value]) => {
      return [key, [{
        [`@keyframes ${prefixName(key)}`]: value
      }]];
    }));
    matchUtilities({
      animate: (value, {
        includeRules
      }) => {
        let animations = (0, _parseAnimationValue.default)(value);

        for (let {
          name
        } of animations) {
          if (keyframes[name] !== undefined) {
            includeRules(keyframes[name], {
              respectImportant: false
            });
          }
        }

        return {
          animation: animations.map(({
            name,
            value
          }) => {
            if (name === undefined || keyframes[name] === undefined) {
              return value;
            }

            return value.replace(name, prefixName(name));
          }).join(', ')
        };
      }
    }, {
      values: theme('animation'),
      variants: variants('animation')
    });
  };
}
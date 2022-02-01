"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _tap = _interopRequireDefault(require("lodash/tap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(prefix, selector) {
  const getPrefix = typeof prefix === 'function' ? prefix : () => prefix === undefined ? '' : prefix;
  return (0, _postcssSelectorParser.default)(selectors => {
    selectors.walkClasses(classSelector => {
      (0, _tap.default)(classSelector.value, baseClass => {
        classSelector.value = `${getPrefix('.' + baseClass)}${baseClass}`;
      });
    });
  }).processSync(selector);
}
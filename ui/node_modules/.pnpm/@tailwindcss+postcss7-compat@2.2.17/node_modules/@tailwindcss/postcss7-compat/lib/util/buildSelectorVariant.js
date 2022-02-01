"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _tap = _interopRequireDefault(require("lodash/tap"));

var _useMemo = require("./useMemo");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const buildSelectorVariant = (0, _useMemo.useMemo)((selector, variantName, separator, onError = () => {}) => {
  return (0, _postcssSelectorParser.default)(selectors => {
    (0, _tap.default)(selectors.first.filter(({
      type
    }) => type === 'class').pop(), classSelector => {
      if (classSelector === undefined) {
        onError('Variant cannot be generated because selector contains no classes.');
        return;
      }

      classSelector.value = `${variantName}${separator}${classSelector.value}`;
    });
  }).processSync(selector);
}, (selector, variantName, separator) => [selector, variantName, separator].join('||'));
var _default = buildSelectorVariant;
exports.default = _default;
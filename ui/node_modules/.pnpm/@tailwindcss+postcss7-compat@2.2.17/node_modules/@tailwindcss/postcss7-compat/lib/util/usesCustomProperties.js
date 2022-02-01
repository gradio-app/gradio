"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = usesCustomProperties;

var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function usesCustomProperties(value) {
  let foundCustomProperty = false;
  (0, _postcssValueParser.default)(value).walk(node => {
    if (node.type === 'function' && node.value === 'var') {
      foundCustomProperty = true;
    }

    return !foundCustomProperty;
  });
  return foundCustomProperty;
}
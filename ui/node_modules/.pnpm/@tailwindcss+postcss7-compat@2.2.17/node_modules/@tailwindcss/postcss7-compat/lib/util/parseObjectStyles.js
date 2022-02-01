"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseObjectStyles;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssNested = _interopRequireDefault(require("postcss-nested"));

var _postcssJs = _interopRequireDefault(require("postcss-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseObjectStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseObjectStyles([styles]);
  }

  return _lodash.default.flatMap(styles, style => {
    return (0, _postcss.default)([(0, _postcssNested.default)({
      bubble: ['screen']
    })]).process(style, {
      parser: _postcssJs.default
    }).root.nodes;
  });
}
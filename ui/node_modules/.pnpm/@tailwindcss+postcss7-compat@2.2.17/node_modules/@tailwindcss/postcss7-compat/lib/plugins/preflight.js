"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _postcss = _interopRequireDefault(require("postcss"));

var _package = _interopRequireDefault(require("../../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    addBase
  }) {
    const normalizeStyles = _postcss.default.parse(_fs.default.readFileSync(require.resolve('modern-normalize'), 'utf8'));

    const preflightStyles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/preflight.css`, 'utf8'));

    addBase([_postcss.default.comment({
      text: `! tailwindcss v${_package.default.version} | MIT License | https://tailwindcss.com`
    }), ...normalizeStyles.nodes, ...preflightStyles.nodes]);
  };
}
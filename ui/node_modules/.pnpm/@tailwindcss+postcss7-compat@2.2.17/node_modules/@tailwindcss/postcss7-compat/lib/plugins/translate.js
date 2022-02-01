"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _createUtilityPlugin = _interopRequireDefault(require("../util/createUtilityPlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    config,
    ...rest
  }) {
    if (config('mode') === 'jit') {
      return (0, _createUtilityPlugin.default)('translate', [[['translate-x', [['@defaults transform', {}], '--tw-translate-x', ['transform', 'var(--tw-transform)']]], ['translate-y', [['@defaults transform', {}], '--tw-translate-y', ['transform', 'var(--tw-transform)']]]]])({
        config,
        ...rest
      });
    } else {
      return (0, _createUtilityPlugin.default)('translate', [[['translate-x', ['--tw-translate-x']], ['translate-y', ['--tw-translate-y']]]])({
        config,
        ...rest
      });
    }
  };
}
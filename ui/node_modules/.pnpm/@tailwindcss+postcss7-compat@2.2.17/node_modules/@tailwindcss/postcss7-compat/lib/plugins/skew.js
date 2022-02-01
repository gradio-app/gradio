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
      return (0, _createUtilityPlugin.default)('skew', [[['skew-x', [['@defaults transform', {}], '--tw-skew-x', ['transform', 'var(--tw-transform)']]], ['skew-y', [['@defaults transform', {}], '--tw-skew-y', ['transform', 'var(--tw-transform)']]]]])({
        config,
        ...rest
      });
    } else {
      return (0, _createUtilityPlugin.default)('skew', [[['skew-x', ['--tw-skew-x']], ['skew-y', ['--tw-skew-y']]]])({
        config,
        ...rest
      });
    }
  };
}
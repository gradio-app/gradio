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
      return (0, _createUtilityPlugin.default)('scale', [['scale', [['@defaults transform', {}], '--tw-scale-x', '--tw-scale-y', ['transform', 'var(--tw-transform)']]], [['scale-x', [['@defaults transform', {}], '--tw-scale-x', ['transform', 'var(--tw-transform)']]], ['scale-y', [['@defaults transform', {}], '--tw-scale-y', ['transform', 'var(--tw-transform)']]]]])({
        config,
        ...rest
      });
    } else {
      return (0, _createUtilityPlugin.default)('scale', [['scale', ['--tw-scale-x', '--tw-scale-y']], [['scale-x', ['--tw-scale-x']], ['scale-y', ['--tw-scale-y']]]])({
        config,
        ...rest
      });
    }
  };
}
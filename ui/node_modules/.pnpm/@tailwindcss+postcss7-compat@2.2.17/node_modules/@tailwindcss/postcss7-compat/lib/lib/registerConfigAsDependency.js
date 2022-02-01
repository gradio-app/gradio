"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _getModuleDependencies = _interopRequireDefault(require("./getModuleDependencies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(configFile) {
  if (!_fs.default.existsSync(configFile)) {
    throw new Error(`Specified Tailwind config file "${configFile}" doesn't exist.`);
  }

  return function (css, opts) {
    (0, _getModuleDependencies.default)(configFile).forEach(mdl => {
      opts.messages.push({
        type: 'dependency',
        parent: css.source.input.file,
        file: mdl.file
      });
    });
  };
}
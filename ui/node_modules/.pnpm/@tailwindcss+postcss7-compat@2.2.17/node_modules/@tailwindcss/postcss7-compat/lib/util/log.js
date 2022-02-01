"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  info(messages) {
    if (process.env.JEST_WORKER_ID !== undefined) return;
    console.warn('');
    messages.forEach(message => {
      console.warn(_chalk.default.bold.cyan('info'), '-', message);
    });
  },

  warn(messages) {
    if (process.env.JEST_WORKER_ID !== undefined) return;
    console.warn('');
    messages.forEach(message => {
      console.warn(_chalk.default.bold.yellow('warn'), '-', message);
    });
  },

  risk(messages) {
    if (process.env.JEST_WORKER_ID !== undefined) return;
    console.warn('');
    messages.forEach(message => {
      console.warn(_chalk.default.bold.magenta('risk'), '-', message);
    });
  }

};
exports.default = _default;
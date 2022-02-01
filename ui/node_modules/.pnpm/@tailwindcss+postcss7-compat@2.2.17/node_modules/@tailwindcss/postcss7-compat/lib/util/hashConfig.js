"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hashConfig;

var _objectHash = _interopRequireDefault(require("object-hash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hashConfig(config) {
  return (0, _objectHash.default)(config, {
    ignoreUnknown: true
  });
}
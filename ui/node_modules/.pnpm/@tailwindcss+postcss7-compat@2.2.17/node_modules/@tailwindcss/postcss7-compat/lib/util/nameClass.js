"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nameClass;

var _escapeClassName = _interopRequireDefault(require("./escapeClassName"));

var _escapeCommas = _interopRequireDefault(require("./escapeCommas"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asClass(name) {
  return (0, _escapeCommas.default)(`.${(0, _escapeClassName.default)(name)}`);
}

function nameClass(classPrefix, key) {
  if (key === 'DEFAULT') {
    return asClass(classPrefix);
  }

  if (key === '-') {
    return asClass(`-${classPrefix}`);
  }

  if (key.startsWith('-')) {
    return asClass(`-${classPrefix}${key}`);
  }

  return asClass(`${classPrefix}-${key}`);
}
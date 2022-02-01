"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isPlainObject;

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
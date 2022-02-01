"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escapeCommas;

function escapeCommas(className) {
  return className.replace(/\\,/g, '\\2c ');
}
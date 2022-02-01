"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bigSign;

function bigSign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n);
}
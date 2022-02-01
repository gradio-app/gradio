"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isKeyframeRule;

function isKeyframeRule(rule) {
  return rule.parent && rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name);
}
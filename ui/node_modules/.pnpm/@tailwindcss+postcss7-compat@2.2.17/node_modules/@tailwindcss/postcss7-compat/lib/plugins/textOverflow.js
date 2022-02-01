"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default() {
  return function ({
    addUtilities,
    variants
  }) {
    addUtilities({
      '.truncate': {
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      },
      '.overflow-ellipsis': {
        'text-overflow': 'ellipsis'
      },
      '.overflow-clip': {
        'text-overflow': 'clip'
      }
    }, variants('textOverflow'));
  };
}
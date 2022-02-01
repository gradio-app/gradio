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
      '.bg-fixed': {
        'background-attachment': 'fixed'
      },
      '.bg-local': {
        'background-attachment': 'local'
      },
      '.bg-scroll': {
        'background-attachment': 'scroll'
      }
    }, variants('backgroundAttachment'));
  };
}
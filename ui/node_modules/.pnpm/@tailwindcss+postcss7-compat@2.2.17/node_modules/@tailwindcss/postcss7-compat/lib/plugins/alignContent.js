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
      '.content-center': {
        'align-content': 'center'
      },
      '.content-start': {
        'align-content': 'flex-start'
      },
      '.content-end': {
        'align-content': 'flex-end'
      },
      '.content-between': {
        'align-content': 'space-between'
      },
      '.content-around': {
        'align-content': 'space-around'
      },
      '.content-evenly': {
        'align-content': 'space-evenly'
      }
    }, variants('alignContent'));
  };
}
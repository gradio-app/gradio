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
      '.grid-flow-row': {
        gridAutoFlow: 'row'
      },
      '.grid-flow-col': {
        gridAutoFlow: 'column'
      },
      '.grid-flow-row-dense': {
        gridAutoFlow: 'row dense'
      },
      '.grid-flow-col-dense': {
        gridAutoFlow: 'column dense'
      }
    }, variants('gridAutoFlow'));
  };
}
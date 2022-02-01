"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const flattenColorPalette = colors => Object.assign({}, ...Object.entries(colors || {}).flatMap(([color, values]) => typeof values == 'object' ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
  [color + (number === 'DEFAULT' ? '' : `-${number}`)]: hex
})) : [{
  [`${color}`]: values
}]));

var _default = flattenColorPalette;
exports.default = _default;
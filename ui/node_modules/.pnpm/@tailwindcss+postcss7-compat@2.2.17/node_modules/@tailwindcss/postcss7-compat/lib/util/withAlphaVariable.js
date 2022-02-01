"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRgba = toRgba;
exports.toHsla = toHsla;
exports.withAlphaValue = withAlphaValue;
exports.default = withAlphaVariable;

var _color = _interopRequireDefault(require("color"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasAlpha(color) {
  return color.startsWith('rgba(') || color.startsWith('hsla(') || color.startsWith('#') && color.length === 9 || color.startsWith('#') && color.length === 5;
}

function toRgba(color) {
  const [r, g, b, a] = (0, _color.default)(color).rgb().array();
  return [r, g, b, a === undefined && hasAlpha(color) ? 1 : a];
}

function toHsla(color) {
  const [h, s, l, a] = (0, _color.default)(color).hsl().array();
  return [h, `${s}%`, `${l}%`, a === undefined && hasAlpha(color) ? 1 : a];
}

function withAlphaValue(color, alphaValue, defaultValue) {
  if (_lodash.default.isFunction(color)) {
    return color({
      opacityValue: alphaValue
    });
  }

  try {
    const isHSL = color.startsWith('hsl');
    const [i, j, k] = isHSL ? toHsla(color) : toRgba(color);
    return `${isHSL ? 'hsla' : 'rgba'}(${i}, ${j}, ${k}, ${alphaValue})`;
  } catch {
    return defaultValue;
  }
}

function withAlphaVariable({
  color,
  property,
  variable
}) {
  if (_lodash.default.isFunction(color)) {
    return {
      [variable]: '1',
      [property]: color({
        opacityVariable: variable,
        opacityValue: `var(${variable})`
      })
    };
  }

  try {
    const isHSL = color.startsWith('hsl');
    const [i, j, k, a] = isHSL ? toHsla(color) : toRgba(color);

    if (a !== undefined) {
      return {
        [property]: color
      };
    }

    return {
      [variable]: '1',
      [property]: `${isHSL ? 'hsla' : 'rgba'}(${i}, ${j}, ${k}, var(${variable}))`
    };
  } catch (error) {
    return {
      [property]: color
    };
  }
}
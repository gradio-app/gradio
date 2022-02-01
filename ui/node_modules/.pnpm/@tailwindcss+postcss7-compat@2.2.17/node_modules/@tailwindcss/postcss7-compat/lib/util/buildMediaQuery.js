"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildMediaQuery;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildMediaQuery(screens) {
  if (_lodash.default.isString(screens)) {
    screens = {
      min: screens
    };
  }

  if (!Array.isArray(screens)) {
    screens = [screens];
  }

  return (0, _lodash.default)(screens).map(screen => {
    if (_lodash.default.has(screen, 'raw')) {
      return screen.raw;
    }

    return (0, _lodash.default)(screen).map((value, feature) => {
      feature = _lodash.default.get({
        min: 'min-width',
        max: 'max-width'
      }, feature, feature);
      return `(${feature}: ${value})`;
    }).join(' and ');
  }).join(', ');
}
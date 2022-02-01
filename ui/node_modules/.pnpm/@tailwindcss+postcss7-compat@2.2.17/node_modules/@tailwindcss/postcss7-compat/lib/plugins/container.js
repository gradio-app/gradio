"use strict";

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-shadow */
function extractMinWidths(breakpoints) {
  return _lodash.default.flatMap(breakpoints, breakpoints => {
    if (_lodash.default.isString(breakpoints)) {
      breakpoints = {
        min: breakpoints
      };
    }

    if (!Array.isArray(breakpoints)) {
      breakpoints = [breakpoints];
    }

    return (0, _lodash.default)(breakpoints).filter(breakpoint => {
      return _lodash.default.has(breakpoint, 'min') || _lodash.default.has(breakpoint, 'min-width');
    }).map(breakpoint => {
      return _lodash.default.get(breakpoint, 'min-width', breakpoint.min);
    }).value();
  });
}

function mapMinWidthsToPadding(minWidths, screens, paddings) {
  if (typeof paddings === 'undefined') {
    return [];
  }

  if (!_lodash.default.isObject(paddings)) {
    return [{
      screen: 'DEFAULT',
      minWidth: 0,
      padding: paddings
    }];
  }

  const mapping = [];

  if (paddings.DEFAULT) {
    mapping.push({
      screen: 'DEFAULT',
      minWidth: 0,
      padding: paddings.DEFAULT
    });
  }

  _lodash.default.each(minWidths, minWidth => {
    Object.keys(screens).forEach(screen => {
      const screenMinWidth = _lodash.default.isPlainObject(screens[screen]) ? screens[screen].min || screens[screen]['min-width'] : screens[screen];

      if (`${screenMinWidth}` === `${minWidth}`) {
        mapping.push({
          screen,
          minWidth,
          padding: paddings[screen]
        });
      }
    });
  });

  return mapping;
}

module.exports = function () {
  return function ({
    addComponents,
    theme,
    variants
  }) {
    const screens = theme('container.screens', theme('screens'));
    const minWidths = extractMinWidths(screens);
    const paddings = mapMinWidthsToPadding(minWidths, screens, theme('container.padding'));

    const generatePaddingFor = minWidth => {
      const paddingConfig = _lodash.default.find(paddings, padding => `${padding.minWidth}` === `${minWidth}`);

      if (!paddingConfig) {
        return {};
      }

      return {
        paddingRight: paddingConfig.padding,
        paddingLeft: paddingConfig.padding
      };
    };

    const atRules = (0, _lodash.default)(minWidths).sortBy(minWidth => parseInt(minWidth)).sortedUniq().map(minWidth => {
      return {
        [`@media (min-width: ${minWidth})`]: {
          '.container': {
            'max-width': minWidth,
            ...generatePaddingFor(minWidth)
          }
        }
      };
    }).value();
    addComponents([{
      '.container': Object.assign({
        width: '100%'
      }, theme('container.center', false) ? {
        marginRight: 'auto',
        marginLeft: 'auto'
      } : {}, generatePaddingFor(0))
    }, ...atRules], variants('container'));
  };
};
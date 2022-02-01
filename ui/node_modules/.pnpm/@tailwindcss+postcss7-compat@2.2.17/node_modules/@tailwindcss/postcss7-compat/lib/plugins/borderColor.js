"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _flattenColorPalette = _interopRequireDefault(require("../util/flattenColorPalette"));

var _withAlphaVariable = _interopRequireDefault(require("../util/withAlphaVariable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return function ({
    config,
    addBase,
    matchUtilities,
    theme,
    variants,
    corePlugins
  }) {
    if (config('mode') === 'jit') {
      if (!corePlugins('borderOpacity')) {
        addBase({
          '@defaults border-width': {
            'border-color': theme('borderColor.DEFAULT', 'currentColor')
          }
        });
      } else {
        addBase({
          '@defaults border-width': (0, _withAlphaVariable.default)({
            color: theme('borderColor.DEFAULT', 'currentColor'),
            property: 'border-color',
            variable: '--tw-border-opacity'
          })
        });
      }
    } else {
      if (!corePlugins('borderOpacity')) {
        addBase({
          '*, ::before, ::after': {
            'border-color': theme('borderColor.DEFAULT', 'currentColor')
          }
        });
      } else {
        addBase({
          '*, ::before, ::after': (0, _withAlphaVariable.default)({
            color: theme('borderColor.DEFAULT', 'currentColor'),
            property: 'border-color',
            variable: '--tw-border-opacity'
          })
        });
      }
    }

    matchUtilities({
      border: value => {
        if (!corePlugins('borderOpacity')) {
          return {
            'border-color': value
          };
        }

        return (0, _withAlphaVariable.default)({
          color: value,
          property: 'border-color',
          variable: '--tw-border-opacity'
        });
      }
    }, {
      values: (({
        DEFAULT: _,
        ...colors
      }) => colors)((0, _flattenColorPalette.default)(theme('borderColor'))),
      variants: variants('borderColor'),
      type: 'color'
    });

    if (config('mode') === 'jit') {
      matchUtilities({
        'border-t': value => {
          if (!corePlugins('borderOpacity')) {
            return {
              'border-top-color': value
            };
          }

          return (0, _withAlphaVariable.default)({
            color: value,
            property: 'border-top-color',
            variable: '--tw-border-opacity'
          });
        },
        'border-r': value => {
          if (!corePlugins('borderOpacity')) {
            return {
              'border-right-color': value
            };
          }

          return (0, _withAlphaVariable.default)({
            color: value,
            property: 'border-right-color',
            variable: '--tw-border-opacity'
          });
        },
        'border-b': value => {
          if (!corePlugins('borderOpacity')) {
            return {
              'border-bottom-color': value
            };
          }

          return (0, _withAlphaVariable.default)({
            color: value,
            property: 'border-bottom-color',
            variable: '--tw-border-opacity'
          });
        },
        'border-l': value => {
          if (!corePlugins('borderOpacity')) {
            return {
              'border-left-color': value
            };
          }

          return (0, _withAlphaVariable.default)({
            color: value,
            property: 'border-left-color',
            variable: '--tw-border-opacity'
          });
        }
      }, {
        values: (({
          DEFAULT: _,
          ...colors
        }) => colors)((0, _flattenColorPalette.default)(theme('borderColor'))),
        variants: variants('borderColor'),
        type: 'color'
      });
    }
  };
}
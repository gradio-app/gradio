"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createUtilityPlugin;

var _transformThemeValue = _interopRequireDefault(require("./transformThemeValue"));

var _pluginUtils = require("../util/pluginUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let asMap = new Map([[_pluginUtils.asValue, 'any'], [_pluginUtils.asList, 'list'], [_pluginUtils.asColor, 'color'], [_pluginUtils.asAngle, 'angle'], [_pluginUtils.asLength, 'length'], [_pluginUtils.asLookupValue, 'lookup']]);

function createUtilityPlugin(themeKey, utilityVariations = [[themeKey, [themeKey]]], {
  filterDefault = false,
  resolveArbitraryValue = _pluginUtils.asValue
} = {}) {
  let transformValue = (0, _transformThemeValue.default)(themeKey);
  return function ({
    matchUtilities,
    variants,
    theme
  }) {
    for (let utilityVariation of utilityVariations) {
      var _asMap$get;

      let group = Array.isArray(utilityVariation[0]) ? utilityVariation : [utilityVariation];
      matchUtilities(group.reduce((obj, [classPrefix, properties]) => {
        return Object.assign(obj, {
          [classPrefix]: value => {
            return properties.reduce((obj, name) => {
              if (Array.isArray(name)) {
                return Object.assign(obj, {
                  [name[0]]: name[1]
                });
              }

              return Object.assign(obj, {
                [name]: transformValue(value)
              });
            }, {});
          }
        });
      }, {}), {
        values: filterDefault ? Object.fromEntries(Object.entries(theme(themeKey) || {}).filter(([modifier]) => modifier !== 'DEFAULT')) : theme(themeKey),
        variants: variants(themeKey),
        type: (_asMap$get = asMap.get(resolveArbitraryValue)) !== null && _asMap$get !== void 0 ? _asMap$get : 'any'
      });
    }
  };
}
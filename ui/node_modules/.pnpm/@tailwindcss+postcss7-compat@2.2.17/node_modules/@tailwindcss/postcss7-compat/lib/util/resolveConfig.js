"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveConfig;

var _some = _interopRequireDefault(require("lodash/some"));

var _mergeWith = _interopRequireDefault(require("lodash/mergeWith"));

var _isFunction = _interopRequireDefault(require("lodash/isFunction"));

var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));

var _defaults = _interopRequireDefault(require("lodash/defaults"));

var _map = _interopRequireDefault(require("lodash/map"));

var _get = _interopRequireDefault(require("lodash/get"));

var _uniq = _interopRequireDefault(require("lodash/uniq"));

var _toPath = _interopRequireDefault(require("lodash/toPath"));

var _head = _interopRequireDefault(require("lodash/head"));

var _isPlainObject = _interopRequireDefault(require("lodash/isPlainObject"));

var _negateValue = _interopRequireDefault(require("./negateValue"));

var _corePluginList = _interopRequireDefault(require("../corePluginList"));

var _configurePlugins = _interopRequireDefault(require("./configurePlugins"));

var _defaultConfig = _interopRequireDefault(require("../../stubs/defaultConfig.stub"));

var _colors = _interopRequireDefault(require("../../colors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const configUtils = {
  colors: _colors.default,

  negative(scale) {
    return Object.keys(scale).filter(key => scale[key] !== '0').reduce((negativeScale, key) => ({ ...negativeScale,
      [`-${key}`]: (0, _negateValue.default)(scale[key])
    }), {});
  },

  breakpoints(screens) {
    return Object.keys(screens).filter(key => typeof screens[key] === 'string').reduce((breakpoints, key) => ({ ...breakpoints,
      [`screen-${key}`]: screens[key]
    }), {});
  }

};

function value(valueToResolve, ...args) {
  return (0, _isFunction.default)(valueToResolve) ? valueToResolve(...args) : valueToResolve;
}

function collectExtends(items) {
  return items.reduce((merged, {
    extend
  }) => {
    return (0, _mergeWith.default)(merged, extend, (mergedValue, extendValue) => {
      if ((0, _isUndefined.default)(mergedValue)) {
        return [extendValue];
      }

      if (Array.isArray(mergedValue)) {
        return [extendValue, ...mergedValue];
      }

      return [extendValue, mergedValue];
    });
  }, {});
}

function mergeThemes(themes) {
  return { ...themes.reduce((merged, theme) => (0, _defaults.default)(merged, theme), {}),
    // In order to resolve n config objects, we combine all of their `extend` properties
    // into arrays instead of objects so they aren't overridden.
    extend: collectExtends(themes)
  };
}

function mergeExtensionCustomizer(merged, value) {
  // When we have an array of objects, we do want to merge it
  if (Array.isArray(merged) && (0, _isPlainObject.default)((0, _head.default)(merged))) {
    return merged.concat(value);
  } // When the incoming value is an array, and the existing config is an object, prepend the existing object


  if (Array.isArray(value) && (0, _isPlainObject.default)((0, _head.default)(value)) && (0, _isPlainObject.default)(merged)) {
    return [merged, ...value];
  } // Override arrays (for example for font-families, box-shadows, ...)


  if (Array.isArray(value)) {
    return value;
  } // Execute default behaviour


  return undefined;
}

function mergeExtensions({
  extend,
  ...theme
}) {
  return (0, _mergeWith.default)(theme, extend, (themeValue, extensions) => {
    // The `extend` property is an array, so we need to check if it contains any functions
    if (!(0, _isFunction.default)(themeValue) && !(0, _some.default)(extensions, _isFunction.default)) {
      return (0, _mergeWith.default)({}, themeValue, ...extensions, mergeExtensionCustomizer);
    }

    return (resolveThemePath, utils) => (0, _mergeWith.default)({}, ...[themeValue, ...extensions].map(e => value(e, resolveThemePath, utils)), mergeExtensionCustomizer);
  });
}

function resolveFunctionKeys(object) {
  const resolvePath = (key, defaultValue) => {
    const path = (0, _toPath.default)(key);
    let index = 0;
    let val = object;

    while (val !== undefined && val !== null && index < path.length) {
      val = val[path[index++]];
      val = (0, _isFunction.default)(val) ? val(resolvePath, configUtils) : val;
    }

    return val === undefined ? defaultValue : val;
  };

  return Object.keys(object).reduce((resolved, key) => {
    return { ...resolved,
      [key]: (0, _isFunction.default)(object[key]) ? object[key](resolvePath, configUtils) : object[key]
    };
  }, {});
}

function extractPluginConfigs(configs) {
  let allConfigs = [];
  configs.forEach(config => {
    allConfigs = [...allConfigs, config];
    const plugins = (0, _get.default)(config, 'plugins', []);

    if (plugins.length === 0) {
      return;
    }

    plugins.forEach(plugin => {
      if (plugin.__isOptionsFunction) {
        plugin = plugin();
      }

      allConfigs = [...allConfigs, ...extractPluginConfigs([(0, _get.default)(plugin, 'config', {})])];
    });
  });
  return allConfigs;
}

function mergeVariants(variants) {
  const mergedVariants = variants.reduce((resolved, variants) => {
    Object.entries(variants || {}).forEach(([plugin, pluginVariants]) => {
      if ((0, _isFunction.default)(pluginVariants)) {
        resolved[plugin] = pluginVariants({
          variants(path) {
            return (0, _get.default)(resolved, path, []);
          },

          before(toInsert, variant, existingPluginVariants = (0, _get.default)(resolved, plugin, [])) {
            if (variant === undefined) {
              return [...toInsert, ...existingPluginVariants];
            }

            const index = existingPluginVariants.indexOf(variant);

            if (index === -1) {
              return [...existingPluginVariants, ...toInsert];
            }

            return [...existingPluginVariants.slice(0, index), ...toInsert, ...existingPluginVariants.slice(index)];
          },

          after(toInsert, variant, existingPluginVariants = (0, _get.default)(resolved, plugin, [])) {
            if (variant === undefined) {
              return [...existingPluginVariants, ...toInsert];
            }

            const index = existingPluginVariants.indexOf(variant);

            if (index === -1) {
              return [...toInsert, ...existingPluginVariants];
            }

            return [...existingPluginVariants.slice(0, index + 1), ...toInsert, ...existingPluginVariants.slice(index + 1)];
          },

          without(toRemove, existingPluginVariants = (0, _get.default)(resolved, plugin, [])) {
            return existingPluginVariants.filter(v => !toRemove.includes(v));
          }

        });
      } else {
        resolved[plugin] = pluginVariants;
      }
    });
    return resolved;
  }, {});
  return { ...mergedVariants,
    extend: collectExtends(variants)
  };
}

function mergeVariantExtensions({
  extend,
  ...variants
}, variantOrder) {
  return (0, _mergeWith.default)(variants, extend, (variantsValue, extensions) => {
    const merged = (0, _uniq.default)([...(variantsValue || []), ...extensions].flat());

    if (extensions.flat().length === 0) {
      return merged;
    }

    return merged.sort((a, z) => variantOrder.indexOf(a) - variantOrder.indexOf(z));
  });
}

function resolveVariants([firstConfig, ...variantConfigs], variantOrder) {
  // Global variants configuration like `variants: ['hover', 'focus']`
  if (Array.isArray(firstConfig)) {
    return firstConfig;
  }

  return mergeVariantExtensions(mergeVariants([firstConfig, ...variantConfigs].reverse()), variantOrder);
}

function resolveCorePlugins(corePluginConfigs) {
  const result = [...corePluginConfigs].reduceRight((resolved, corePluginConfig) => {
    if ((0, _isFunction.default)(corePluginConfig)) {
      return corePluginConfig({
        corePlugins: resolved
      });
    }

    return (0, _configurePlugins.default)(corePluginConfig, resolved);
  }, _corePluginList.default);
  return result;
}

function resolvePluginLists(pluginLists) {
  const result = [...pluginLists].reduceRight((resolved, pluginList) => {
    return [...resolved, ...pluginList];
  }, []);
  return result;
}

function resolveConfig(configs) {
  const allConfigs = [...extractPluginConfigs(configs), {
    darkMode: false,
    prefix: '',
    important: false,
    separator: ':',
    variantOrder: _defaultConfig.default.variantOrder
  }];
  const {
    variantOrder
  } = allConfigs.find(c => c.variantOrder);
  return (0, _defaults.default)({
    theme: resolveFunctionKeys(mergeExtensions(mergeThemes((0, _map.default)(allConfigs, t => (0, _get.default)(t, 'theme', {}))))),
    variants: resolveVariants(allConfigs.map(c => (0, _get.default)(c, 'variants', {})), variantOrder),
    corePlugins: resolveCorePlugins(allConfigs.map(c => c.corePlugins)),
    plugins: resolvePluginLists(configs.map(c => (0, _get.default)(c, 'plugins', [])))
  }, ...allConfigs);
}
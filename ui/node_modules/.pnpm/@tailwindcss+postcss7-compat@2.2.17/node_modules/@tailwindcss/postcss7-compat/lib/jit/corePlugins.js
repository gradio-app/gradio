"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postcss = _interopRequireDefault(require("postcss"));

var corePlugins = _interopRequireWildcard(require("../plugins"));

var _buildMediaQuery = _interopRequireDefault(require("../util/buildMediaQuery"));

var _prefixSelector = _interopRequireDefault(require("../util/prefixSelector"));

var _pluginUtils = require("../util/pluginUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  pseudoElementVariants: function ({
    config,
    addVariant
  }) {
    addVariant('first-letter', (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`first-letter${config('separator')}${className}`, '::first-letter');
      });
    }));
    addVariant('first-line', (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`first-line${config('separator')}${className}`, '::first-line');
      });
    }));
    addVariant('marker', [(0, _pluginUtils.transformAllSelectors)(selector => {
      let variantSelector = (0, _pluginUtils.updateAllClasses)(selector, className => {
        return `marker${config('separator')}${className}`;
      });
      return `${variantSelector} *::marker`;
    }), (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`marker${config('separator')}${className}`, '::marker');
      });
    })]);
    addVariant('selection', [(0, _pluginUtils.transformAllSelectors)(selector => {
      let variantSelector = (0, _pluginUtils.updateAllClasses)(selector, className => {
        return `selection${config('separator')}${className}`;
      });
      return `${variantSelector} *::selection`;
    }), (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`selection${config('separator')}${className}`, '::selection');
      });
    })]);
    addVariant('before', (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`before${config('separator')}${className}`, '::before');
      });
    }, {
      withRule: rule => {
        let foundContent = false;
        rule.walkDecls('content', () => {
          foundContent = true;
        });

        if (!foundContent) {
          rule.prepend(_postcss.default.decl({
            prop: 'content',
            value: '""'
          }));
        }
      }
    }));
    addVariant('after', (0, _pluginUtils.transformAllSelectors)(selector => {
      return (0, _pluginUtils.updateAllClasses)(selector, (className, {
        withPseudo
      }) => {
        return withPseudo(`after${config('separator')}${className}`, '::after');
      });
    }, {
      withRule: rule => {
        let foundContent = false;
        rule.walkDecls('content', () => {
          foundContent = true;
        });

        if (!foundContent) {
          rule.prepend(_postcss.default.decl({
            prop: 'content',
            value: '""'
          }));
        }
      }
    }));
  },
  pseudoClassVariants: function ({
    config,
    addVariant
  }) {
    let pseudoVariants = [// Positional
    ['first', 'first-child'], ['last', 'last-child'], ['only', 'only-child'], ['odd', 'nth-child(odd)'], ['even', 'nth-child(even)'], 'first-of-type', 'last-of-type', 'only-of-type', // State
    'visited', 'target', // Forms
    'default', 'checked', 'indeterminate', 'placeholder-shown', 'autofill', 'required', 'valid', 'invalid', 'in-range', 'out-of-range', 'read-only', // Content
    'empty', // Interactive
    'focus-within', 'hover', 'focus', 'focus-visible', 'active', 'disabled'];

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant];
      addVariant(variantName, (0, _pluginUtils.transformAllClasses)((className, {
        withPseudo
      }) => {
        return withPseudo(`${variantName}${config('separator')}${className}`, `:${state}`);
      }));
    }

    let groupMarker = (0, _prefixSelector.default)(config('prefix'), '.group');

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant];
      let groupVariantName = `group-${variantName}`;
      addVariant(groupVariantName, (0, _pluginUtils.transformAllSelectors)(selector => {
        let variantSelector = (0, _pluginUtils.updateAllClasses)(selector, className => {
          if (`.${className}` === groupMarker) return className;
          return `${groupVariantName}${config('separator')}${className}`;
        });

        if (variantSelector === selector) {
          return null;
        }

        return (0, _pluginUtils.applyPseudoToMarker)(variantSelector, groupMarker, state, (marker, selector) => `${marker} ${selector}`);
      }));
    }

    let peerMarker = (0, _prefixSelector.default)(config('prefix'), '.peer');

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant];
      let peerVariantName = `peer-${variantName}`;
      addVariant(peerVariantName, (0, _pluginUtils.transformAllSelectors)(selector => {
        let variantSelector = (0, _pluginUtils.updateAllClasses)(selector, className => {
          if (`.${className}` === peerMarker) return className;
          return `${peerVariantName}${config('separator')}${className}`;
        });

        if (variantSelector === selector) {
          return null;
        }

        return (0, _pluginUtils.applyPseudoToMarker)(variantSelector, peerMarker, state, (marker, selector) => selector.trim().startsWith('~') ? `${marker}${selector}` : `${marker} ~ ${selector}`);
      }));
    }
  },
  directionVariants: function ({
    config,
    addVariant
  }) {
    addVariant('ltr', (0, _pluginUtils.transformAllSelectors)(selector => `[dir="ltr"] ${(0, _pluginUtils.updateAllClasses)(selector, className => `ltr${config('separator')}${className}`)}`));
    addVariant('rtl', (0, _pluginUtils.transformAllSelectors)(selector => `[dir="rtl"] ${(0, _pluginUtils.updateAllClasses)(selector, className => `rtl${config('separator')}${className}`)}`));
  },
  reducedMotionVariants: function ({
    config,
    addVariant
  }) {
    addVariant('motion-safe', (0, _pluginUtils.transformLastClasses)(className => {
      return `motion-safe${config('separator')}${className}`;
    }, {
      wrap: () => _postcss.default.atRule({
        name: 'media',
        params: '(prefers-reduced-motion: no-preference)'
      })
    }));
    addVariant('motion-reduce', (0, _pluginUtils.transformLastClasses)(className => {
      return `motion-reduce${config('separator')}${className}`;
    }, {
      wrap: () => _postcss.default.atRule({
        name: 'media',
        params: '(prefers-reduced-motion: reduce)'
      })
    }));
  },
  darkVariants: function ({
    config,
    addVariant
  }) {
    if (config('darkMode') === 'class') {
      addVariant('dark', (0, _pluginUtils.transformAllSelectors)(selector => {
        let variantSelector = (0, _pluginUtils.updateLastClasses)(selector, className => {
          return `dark${config('separator')}${className}`;
        });

        if (variantSelector === selector) {
          return null;
        }

        let darkSelector = (0, _prefixSelector.default)(config('prefix'), `.dark`);
        return `${darkSelector} ${variantSelector}`;
      }));
    } else if (config('darkMode') === 'media') {
      addVariant('dark', (0, _pluginUtils.transformLastClasses)(className => {
        return `dark${config('separator')}${className}`;
      }, {
        wrap: () => _postcss.default.atRule({
          name: 'media',
          params: '(prefers-color-scheme: dark)'
        })
      }));
    }
  },
  screenVariants: function ({
    config,
    theme,
    addVariant
  }) {
    for (let screen in theme('screens')) {
      let size = theme('screens')[screen];
      let query = (0, _buildMediaQuery.default)(size);
      addVariant(screen, (0, _pluginUtils.transformLastClasses)(className => {
        return `${screen}${config('separator')}${className}`;
      }, {
        wrap: () => _postcss.default.atRule({
          name: 'media',
          params: query
        })
      }));
    }
  },
  ...Object.fromEntries(Object.entries(corePlugins).map(([pluginName, plugin]) => {
    return [pluginName, plugin()];
  }))
};
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _generateVariantFunction = _interopRequireDefault(require("../util/generateVariantFunction"));

var _prefixSelector = _interopRequireDefault(require("../util/prefixSelector"));

var _buildSelectorVariant = _interopRequireDefault(require("../util/buildSelectorVariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generatePseudoClassVariant(pseudoClass, selectorPrefix = pseudoClass) {
  return (0, _generateVariantFunction.default)(({
    modifySelectors,
    separator
  }) => {
    const parser = (0, _postcssSelectorParser.default)(selectors => {
      selectors.walkClasses(sel => {
        sel.value = `${selectorPrefix}${separator}${sel.value}`;
        sel.parent.insertAfter(sel, _postcssSelectorParser.default.pseudo({
          value: `:${pseudoClass}`
        }));
      });
    });
    return modifySelectors(({
      selector
    }) => parser.processSync(selector));
  });
}

function ensureIncludesDefault(variants) {
  return variants.includes('DEFAULT') ? variants : ['DEFAULT', ...variants];
}

const defaultVariantGenerators = config => ({
  DEFAULT: (0, _generateVariantFunction.default)(() => {}),
  dark: (0, _generateVariantFunction.default)(({
    container,
    separator,
    modifySelectors
  }) => {
    if (config.darkMode === false) {
      return _postcss.default.root();
    }

    if (config.darkMode === 'media') {
      const modified = modifySelectors(({
        selector
      }) => {
        return (0, _buildSelectorVariant.default)(selector, 'dark', separator, message => {
          throw container.error(message);
        });
      });

      const mediaQuery = _postcss.default.atRule({
        name: 'media',
        params: '(prefers-color-scheme: dark)'
      });

      mediaQuery.append(modified);
      container.append(mediaQuery);
      return container;
    }

    if (config.darkMode === 'class') {
      const modified = modifySelectors(({
        selector
      }) => {
        return (0, _buildSelectorVariant.default)(selector, 'dark', separator, message => {
          throw container.error(message);
        });
      });
      modified.walkRules(rule => {
        rule.selectors = rule.selectors.map(selector => {
          return `${(0, _prefixSelector.default)(config.prefix, '.dark')} ${selector}`;
        });
      });
      return modified;
    }

    throw new Error("The `darkMode` config option must be either 'media' or 'class'.");
  }, {
    unstable_stack: true
  }),
  'motion-safe': (0, _generateVariantFunction.default)(({
    container,
    separator,
    modifySelectors
  }) => {
    const modified = modifySelectors(({
      selector
    }) => {
      return (0, _buildSelectorVariant.default)(selector, 'motion-safe', separator, message => {
        throw container.error(message);
      });
    });

    const mediaQuery = _postcss.default.atRule({
      name: 'media',
      params: '(prefers-reduced-motion: no-preference)'
    });

    mediaQuery.append(modified);
    container.append(mediaQuery);
  }, {
    unstable_stack: true
  }),
  'motion-reduce': (0, _generateVariantFunction.default)(({
    container,
    separator,
    modifySelectors
  }) => {
    const modified = modifySelectors(({
      selector
    }) => {
      return (0, _buildSelectorVariant.default)(selector, 'motion-reduce', separator, message => {
        throw container.error(message);
      });
    });

    const mediaQuery = _postcss.default.atRule({
      name: 'media',
      params: '(prefers-reduced-motion: reduce)'
    });

    mediaQuery.append(modified);
    container.append(mediaQuery);
  }, {
    unstable_stack: true
  }),
  'group-hover': (0, _generateVariantFunction.default)(({
    modifySelectors,
    separator
  }) => {
    const parser = (0, _postcssSelectorParser.default)(selectors => {
      selectors.walkClasses(sel => {
        sel.value = `group-hover${separator}${sel.value}`;
        sel.parent.insertBefore(sel, (0, _postcssSelectorParser.default)().astSync((0, _prefixSelector.default)(config.prefix, '.group:hover ')));
      });
    });
    return modifySelectors(({
      selector
    }) => parser.processSync(selector));
  }),
  'group-focus': (0, _generateVariantFunction.default)(({
    modifySelectors,
    separator
  }) => {
    const parser = (0, _postcssSelectorParser.default)(selectors => {
      selectors.walkClasses(sel => {
        sel.value = `group-focus${separator}${sel.value}`;
        sel.parent.insertBefore(sel, (0, _postcssSelectorParser.default)().astSync((0, _prefixSelector.default)(config.prefix, '.group:focus ')));
      });
    });
    return modifySelectors(({
      selector
    }) => parser.processSync(selector));
  }),
  hover: generatePseudoClassVariant('hover'),
  'focus-within': generatePseudoClassVariant('focus-within'),
  'focus-visible': generatePseudoClassVariant('focus-visible'),
  'read-only': generatePseudoClassVariant('read-only'),
  focus: generatePseudoClassVariant('focus'),
  active: generatePseudoClassVariant('active'),
  visited: generatePseudoClassVariant('visited'),
  disabled: generatePseudoClassVariant('disabled'),
  checked: generatePseudoClassVariant('checked'),
  first: generatePseudoClassVariant('first-child', 'first'),
  last: generatePseudoClassVariant('last-child', 'last'),
  odd: generatePseudoClassVariant('nth-child(odd)', 'odd'),
  even: generatePseudoClassVariant('nth-child(even)', 'even'),
  empty: generatePseudoClassVariant('empty')
});

function prependStackableVariants(atRule, variants, stackableVariants) {
  if (!_lodash.default.some(variants, v => stackableVariants.includes(v))) {
    return variants;
  }

  if (_lodash.default.every(variants, v => stackableVariants.includes(v))) {
    return variants;
  }

  const variantsParent = _postcss.default.atRule({
    name: 'variants',
    params: variants.filter(v => stackableVariants.includes(v)).join(', ')
  });

  atRule.before(variantsParent);
  variantsParent.append(atRule);
  variants = _lodash.default.without(variants, ...stackableVariants);
  return variants;
}

function _default(config, {
  variantGenerators: pluginVariantGenerators
}) {
  return function (css) {
    const variantGenerators = { ...defaultVariantGenerators(config),
      ...pluginVariantGenerators
    };
    const stackableVariants = Object.entries(variantGenerators).filter(([_variant, {
      options
    }]) => options.unstable_stack).map(([variant]) => variant);
    let variantsFound = false;

    do {
      variantsFound = false;
      css.walkAtRules('variants', atRule => {
        variantsFound = true;

        let variants = _postcss.default.list.comma(atRule.params).filter(variant => variant !== '');

        if (variants.includes('responsive')) {
          const responsiveParent = _postcss.default.atRule({
            name: 'responsive'
          });

          atRule.before(responsiveParent);
          responsiveParent.append(atRule);
        }

        const remainingVariants = prependStackableVariants(atRule, variants, stackableVariants);

        _lodash.default.forEach(_lodash.default.without(ensureIncludesDefault(remainingVariants), 'responsive'), variant => {
          if (!variantGenerators[variant]) {
            throw new Error(`Your config mentions the "${variant}" variant, but "${variant}" doesn't appear to be a variant. Did you forget or misconfigure a plugin that supplies that variant?`);
          }

          variantGenerators[variant].handler(atRule, config);
        });

        atRule.remove();
      });
    } while (variantsFound);
  };
}
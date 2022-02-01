"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateVariantFunction;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _useMemo = require("./useMemo");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const classNameParser = (0, _postcssSelectorParser.default)(selectors => {
  return selectors.first.filter(({
    type
  }) => type === 'class').pop().value;
});
const getClassNameFromSelector = (0, _useMemo.useMemo)(selector => classNameParser.transformSync(selector), selector => selector);

function generateVariantFunction(generator, options = {}) {
  return {
    options,
    handler: (container, config) => {
      const cloned = _postcss.default.root({
        nodes: container.clone().nodes
      });

      container.before(_lodash.default.defaultTo(generator({
        container: cloned,
        separator: config.separator,
        modifySelectors: modifierFunction => {
          cloned.each(rule => {
            if (rule.type !== 'rule') {
              return;
            }

            rule.selectors = rule.selectors.map(selector => {
              return modifierFunction({
                get className() {
                  return getClassNameFromSelector(selector);
                },

                selector
              });
            });
          });
          return cloned;
        }
      }), cloned).nodes);
    }
  };
}
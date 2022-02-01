"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyPseudoToMarker = applyPseudoToMarker;
exports.updateAllClasses = updateAllClasses;
exports.updateLastClasses = updateLastClasses;
exports.transformAllSelectors = transformAllSelectors;
exports.transformAllClasses = transformAllClasses;
exports.transformLastClasses = transformLastClasses;
exports.asValue = asValue;
exports.asUnit = asUnit;
exports.asList = asList;
exports.asColor = asColor;
exports.asAngle = asAngle;
exports.asLength = asLength;
exports.asLookupValue = asLookupValue;
exports.coerceValue = coerceValue;

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _postcss = _interopRequireDefault(require("postcss"));

var _color = _interopRequireDefault(require("color"));

var _escapeCommas = _interopRequireDefault(require("./escapeCommas"));

var _withAlphaVariable = require("./withAlphaVariable");

var _isKeyframeRule = _interopRequireDefault(require("./isKeyframeRule"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function applyPseudoToMarker(selector, marker, state, join) {
  let states = [state];
  let markerIdx = selector.indexOf(marker + ':');

  if (markerIdx !== -1) {
    let existingMarker = selector.slice(markerIdx, selector.indexOf(' ', markerIdx));
    states = states.concat(selector.slice(markerIdx + marker.length + 1, existingMarker.length).split(':'));
    selector = selector.replace(existingMarker, '');
  }

  return join(`${[marker, ...states].join(':')}`, selector);
}

function updateAllClasses(selectors, updateClass) {
  let parser = (0, _postcssSelectorParser.default)(selectors => {
    selectors.walkClasses(sel => {
      let updatedClass = updateClass(sel.value, {
        withPseudo(className, pseudo) {
          sel.parent.insertAfter(sel, _postcssSelectorParser.default.pseudo({
            value: `${pseudo}`
          }));
          return className;
        }

      });
      sel.value = updatedClass;

      if (sel.raws && sel.raws.value) {
        sel.raws.value = (0, _escapeCommas.default)(sel.raws.value);
      }
    });
  });
  let result = parser.processSync(selectors);
  return result;
}

function updateLastClasses(selectors, updateClass) {
  let parser = (0, _postcssSelectorParser.default)(selectors => {
    selectors.each(sel => {
      let lastClass = sel.filter(({
        type
      }) => type === 'class').pop();

      if (lastClass === undefined) {
        return;
      }

      let updatedClass = updateClass(lastClass.value, {
        withPseudo(className, pseudo) {
          lastClass.parent.insertAfter(lastClass, _postcssSelectorParser.default.pseudo({
            value: `${pseudo}`
          }));
          return className;
        }

      });
      lastClass.value = updatedClass;

      if (lastClass.raws && lastClass.raws.value) {
        lastClass.raws.value = (0, _escapeCommas.default)(lastClass.raws.value);
      }
    });
  });
  let result = parser.processSync(selectors);
  return result;
}

function splitByNotEscapedCommas(str) {
  let chunks = [];
  let currentChunk = '';

  for (let i = 0; i < str.length; i++) {
    if (str[i] === ',' && str[i - 1] !== '\\') {
      chunks.push(currentChunk);
      currentChunk = '';
    } else {
      currentChunk += str[i];
    }
  }

  chunks.push(currentChunk);
  return chunks;
}

function transformAllSelectors(transformSelector, {
  wrap,
  withRule
} = {}) {
  return ({
    container
  }) => {
    container.walkRules(rule => {
      if ((0, _isKeyframeRule.default)(rule)) {
        return rule;
      }

      let transformed = splitByNotEscapedCommas(rule.selector).map(transformSelector).join(',');
      rule.selector = transformed;

      if (withRule) {
        withRule(rule);
      }

      return rule;
    });

    if (wrap) {
      let wrapper = wrap();
      let nodes = container.nodes;
      container.removeAll();
      wrapper.append(nodes);
      container.append(wrapper);
    }
  };
}

function transformAllClasses(transformClass, {
  wrap,
  withRule
} = {}) {
  return ({
    container
  }) => {
    container.walkRules(rule => {
      let selector = rule.selector;
      let variantSelector = updateAllClasses(selector, transformClass);
      rule.selector = variantSelector;

      if (withRule) {
        withRule(rule);
      }

      return rule;
    });

    if (wrap) {
      let wrapper = wrap();
      let nodes = container.nodes;
      container.removeAll();
      wrapper.append(nodes);
      container.append(wrapper);
    }
  };
}

function transformLastClasses(transformClass, {
  wrap,
  withRule
} = {}) {
  return ({
    container
  }) => {
    container.walkRules(rule => {
      let selector = rule.selector;
      let variantSelector = updateLastClasses(selector, transformClass);
      rule.selector = variantSelector;

      if (withRule) {
        withRule(rule);
      }

      return rule;
    });

    if (wrap) {
      let wrapper = wrap();
      let nodes = container.nodes;
      container.removeAll();
      wrapper.append(nodes);
      container.append(wrapper);
    }
  };
}

function asValue(modifier, lookup = {}, {
  validate = () => true,
  transform = v => v
} = {}) {
  let value = lookup[modifier];

  if (value !== undefined) {
    return value;
  }

  if (modifier[0] !== '[' || modifier[modifier.length - 1] !== ']') {
    return undefined;
  }

  value = modifier.slice(1, -1);

  if (!validate(value)) {
    return undefined;
  } // add spaces around operators inside calc() that do not follow an operator or (


  return transform(value).replace(/(-?\d*\.?\d(?!\b-.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, '$1 $2 ');
}

function asUnit(modifier, units, lookup = {}) {
  return asValue(modifier, lookup, {
    validate: value => {
      let unitsPattern = `(?:${units.join('|')})`;
      return new RegExp(`${unitsPattern}$`).test(value) || new RegExp(`^calc\\(.+?${unitsPattern}`).test(value);
    },
    transform: value => {
      return value;
    }
  });
}

function asList(modifier, lookup = {}) {
  return asValue(modifier, lookup, {
    transform: value => {
      return _postcss.default.list.comma(value).map(v => v.replace(/,/g, ', ')).join(' ');
    }
  });
}

function isArbitraryValue(input) {
  return input.startsWith('[') && input.endsWith(']');
}

function splitAlpha(modifier) {
  let slashIdx = modifier.lastIndexOf('/');

  if (slashIdx === -1 || slashIdx === modifier.length - 1) {
    return [modifier];
  }

  return [modifier.slice(0, slashIdx), modifier.slice(slashIdx + 1)];
}

function isColor(value) {
  try {
    (0, _color.default)(value);
    return true;
  } catch (e) {
    return false;
  }
}

function asColor(modifier, lookup = {}, tailwindConfig = {}) {
  if (lookup[modifier] !== undefined) {
    return lookup[modifier];
  }

  let [color, alpha] = splitAlpha(modifier);

  if (lookup[color] !== undefined) {
    var _tailwindConfig$theme, _tailwindConfig$theme2;

    if (isArbitraryValue(alpha)) {
      return (0, _withAlphaVariable.withAlphaValue)(lookup[color], alpha.slice(1, -1));
    }

    if (((_tailwindConfig$theme = tailwindConfig.theme) === null || _tailwindConfig$theme === void 0 ? void 0 : (_tailwindConfig$theme2 = _tailwindConfig$theme.opacity) === null || _tailwindConfig$theme2 === void 0 ? void 0 : _tailwindConfig$theme2[alpha]) === undefined) {
      return undefined;
    }

    return (0, _withAlphaVariable.withAlphaValue)(lookup[color], tailwindConfig.theme.opacity[alpha]);
  }

  return asValue(modifier, lookup, {
    validate: isColor
  });
}

function asAngle(modifier, lookup = {}) {
  return asUnit(modifier, ['deg', 'grad', 'rad', 'turn'], lookup);
}

function asLength(modifier, lookup = {}) {
  return asUnit(modifier, ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'ex', 'ch', 'rem', 'lh', 'vw', 'vh', 'vmin', 'vmax', '%'], lookup);
}

function asLookupValue(modifier, lookup = {}) {
  return lookup[modifier];
}

let typeMap = {
  any: asValue,
  list: asList,
  color: asColor,
  angle: asAngle,
  length: asLength,
  lookup: asLookupValue
};

function splitAtFirst(input, delim) {
  return (([first, ...rest]) => [first, rest.join(delim)])(input.split(delim));
}

function coerceValue(type, modifier, values, tailwindConfig) {
  let [scaleType, arbitraryType = scaleType] = [].concat(type);

  if (isArbitraryValue(modifier)) {
    let [explicitType, value] = splitAtFirst(modifier.slice(1, -1), ':');

    if (value.length > 0 && Object.keys(typeMap).includes(explicitType)) {
      return [asValue(`[${value}]`, values, tailwindConfig), explicitType];
    }

    return [typeMap[arbitraryType](modifier, values, tailwindConfig), arbitraryType];
  }

  return [typeMap[scaleType](modifier, values, tailwindConfig), scaleType];
}
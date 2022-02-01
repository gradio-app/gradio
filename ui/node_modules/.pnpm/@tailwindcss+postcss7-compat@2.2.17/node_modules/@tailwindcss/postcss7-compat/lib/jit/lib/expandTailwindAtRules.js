"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = expandTailwindAtRules;

var sharedState = _interopRequireWildcard(require("./sharedState"));

var _generateRules = require("./generateRules");

var _bigSign = _interopRequireDefault(require("../../util/bigSign"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let env = sharedState.env;
let contentMatchCache = sharedState.contentMatchCache;
const PATTERNS = ["([^<>\"'`\\s]*\\['[^<>\"'`\\s]*'\\])", // `content-['hello']` but not `content-['hello']']`
'([^<>"\'`\\s]*\\["[^<>"\'`\\s]*"\\])', // `content-["hello"]` but not `content-["hello"]"]`
'([^<>"\'`\\s]*\\[[^<>"\'`\\s]+\\])', // `fill-[#bada55]`
'([^<>"\'`\\s]*[^<>"\'`\\s:])' // `px-1.5`, `uppercase` but not `uppercase:`
].join('|');
const BROAD_MATCH_GLOBAL_REGEXP = new RegExp(PATTERNS, 'g');
const INNER_MATCH_GLOBAL_REGEXP = /[^<>"'`\s.(){}[\]#=%]*[^<>"'`\s.(){}[\]#=%:]/g;
const builtInExtractors = {
  DEFAULT: content => {
    let broadMatches = content.match(BROAD_MATCH_GLOBAL_REGEXP) || [];
    let innerMatches = content.match(INNER_MATCH_GLOBAL_REGEXP) || [];
    return [...broadMatches, ...innerMatches];
  }
};
const builtInTransformers = {
  DEFAULT: content => content,
  svelte: content => content.replace(/(?:^|\s)class:/g, ' ')
};

function getExtractor(tailwindConfig, fileExtension) {
  let extractors = tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.extract || {};
  const purgeOptions = tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.options || {};

  if (typeof extractors === 'function') {
    extractors = {
      DEFAULT: extractors
    };
  }

  if (purgeOptions.defaultExtractor) {
    extractors.DEFAULT = purgeOptions.defaultExtractor;
  }

  for (let {
    extensions,
    extractor
  } of purgeOptions.extractors || []) {
    for (let extension of extensions) {
      extractors[extension] = extractor;
    }
  }

  return extractors[fileExtension] || extractors.DEFAULT || builtInExtractors[fileExtension] || builtInExtractors.DEFAULT;
}

function getTransformer(tailwindConfig, fileExtension) {
  let transformers = tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.transform || {};

  if (typeof transformers === 'function') {
    transformers = {
      DEFAULT: transformers
    };
  }

  return transformers[fileExtension] || transformers.DEFAULT || builtInTransformers[fileExtension] || builtInTransformers.DEFAULT;
} // Scans template contents for possible classes. This is a hot path on initial build but
// not too important for subsequent builds. The faster the better though — if we can speed
// up these regexes by 50% that could cut initial build time by like 20%.


function getClassCandidates(content, extractor, contentMatchCache, candidates, seen) {
  for (let line of content.split('\n')) {
    line = line.trim();

    if (seen.has(line)) {
      continue;
    }

    seen.add(line);

    if (contentMatchCache.has(line)) {
      for (let match of contentMatchCache.get(line)) {
        candidates.add(match);
      }
    } else {
      let extractorMatches = extractor(line).filter(s => s !== '!*');
      let lineMatchesSet = new Set(extractorMatches);

      for (let match of lineMatchesSet) {
        candidates.add(match);
      }

      contentMatchCache.set(line, lineMatchesSet);
    }
  }
}

function buildStylesheet(rules, context) {
  let sortedRules = rules.sort(([a], [z]) => (0, _bigSign.default)(a - z));
  let returnValue = {
    base: new Set(),
    components: new Set(),
    utilities: new Set(),
    variants: new Set()
  };

  for (let [sort, rule] of sortedRules) {
    if (sort >= context.minimumScreen) {
      returnValue.variants.add(rule);
      continue;
    }

    if (sort & context.layerOrder.base) {
      returnValue.base.add(rule);
      continue;
    }

    if (sort & context.layerOrder.components) {
      returnValue.components.add(rule);
      continue;
    }

    if (sort & context.layerOrder.utilities) {
      returnValue.utilities.add(rule);
      continue;
    }
  }

  return returnValue;
}

function expandTailwindAtRules(context) {
  return root => {
    let layerNodes = {
      base: null,
      components: null,
      utilities: null,
      variants: null
    }; // Make sure this file contains Tailwind directives. If not, we can save
    // a lot of work and bail early. Also we don't have to register our touch
    // file as a dependency since the output of this CSS does not depend on
    // the source of any templates. Think Vue <style> blocks for example.

    root.walkAtRules('tailwind', rule => {
      if (Object.keys(layerNodes).includes(rule.params)) {
        layerNodes[rule.params] = rule;
      }
    });

    if (Object.values(layerNodes).every(n => n === null)) {
      return root;
    } // ---
    // Find potential rules in changed files


    let candidates = new Set(['*']);
    let seen = new Set();
    env.DEBUG && console.time('Reading changed files');

    for (let {
      content,
      extension
    } of context.changedContent) {
      let transformer = getTransformer(context.tailwindConfig, extension);
      let extractor = getExtractor(context.tailwindConfig, extension);
      getClassCandidates(transformer(content), extractor, contentMatchCache, candidates, seen);
    } // ---
    // Generate the actual CSS


    let classCacheCount = context.classCache.size;
    env.DEBUG && console.time('Generate rules');
    let rules = (0, _generateRules.generateRules)(candidates, context);
    env.DEBUG && console.timeEnd('Generate rules'); // We only ever add to the classCache, so if it didn't grow, there is nothing new.

    env.DEBUG && console.time('Build stylesheet');

    if (context.stylesheetCache === null || context.classCache.size !== classCacheCount) {
      for (let rule of rules) {
        context.ruleCache.add(rule);
      }

      context.stylesheetCache = buildStylesheet([...context.ruleCache], context);
    }

    env.DEBUG && console.timeEnd('Build stylesheet');
    let {
      base: baseNodes,
      components: componentNodes,
      utilities: utilityNodes,
      variants: screenNodes
    } = context.stylesheetCache; // ---
    // Replace any Tailwind directives with generated CSS

    if (layerNodes.base) {
      layerNodes.base.before((0, _cloneNodes.default)([...baseNodes], layerNodes.base.source));
      layerNodes.base.remove();
    }

    if (layerNodes.components) {
      layerNodes.components.before((0, _cloneNodes.default)([...componentNodes], layerNodes.components.source));
      layerNodes.components.remove();
    }

    if (layerNodes.utilities) {
      layerNodes.utilities.before((0, _cloneNodes.default)([...utilityNodes], layerNodes.utilities.source));
      layerNodes.utilities.remove();
    }

    if (layerNodes.variants) {
      layerNodes.variants.before((0, _cloneNodes.default)([...screenNodes], layerNodes.variants.source));
      layerNodes.variants.remove();
    } else {
      root.append((0, _cloneNodes.default)([...screenNodes], root.source));
    } // ---


    if (env.DEBUG) {
      console.log('Potential classes: ', candidates.size);
      console.log('Active contexts: ', sharedState.contextSourcesMap.size);
      console.log('Content match entries', contentMatchCache.size);
    } // Clear the cache for the changed files


    context.changedContent = []; // Cleanup any leftover @layer atrules

    root.walkAtRules('layer', rule => {
      if (Object.keys(layerNodes).includes(rule.params)) {
        rule.remove();
      }
    });
  };
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tailwindExtractor = tailwindExtractor;
exports.default = purgeUnusedUtilities;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _purgecss = _interopRequireWildcard(require("purgecss"));

var _log = _interopRequireDefault(require("../util/log"));

var _htmlTags = _interopRequireDefault(require("html-tags"));

var _path = _interopRequireDefault(require("path"));

var _parseDependency = _interopRequireDefault(require("../util/parseDependency"));

var _normalizePath = _interopRequireDefault(require("normalize-path"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeTailwindMarkers(css) {
  css.walkAtRules('tailwind', rule => rule.remove());
  css.walkComments(comment => {
    switch (comment.text.trim()) {
      case 'tailwind start base':
      case 'tailwind end base':
      case 'tailwind start components':
      case 'tailwind start utilities':
      case 'tailwind end components':
      case 'tailwind end utilities':
        comment.remove();
        break;

      default:
        break;
    }
  });
}

function tailwindExtractor(content) {
  // Capture as liberally as possible, including things like `h-(screen-1.5)`
  const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
  const broadMatchesWithoutTrailingSlash = broadMatches.map(match => _lodash.default.trimEnd(match, '\\')); // Capture classes within other delimiters like .block(class="w-1/2") in Pug

  const innerMatches = content.match(/[^<>"'`\s.(){}[\]#=%]*[^<>"'`\s.(){}[\]#=%:]/g) || [];
  return broadMatches.concat(broadMatchesWithoutTrailingSlash).concat(innerMatches);
}

function getTransformer(config, fileExtension) {
  let transformers = config.purge && config.purge.transform || {};

  if (typeof transformers === 'function') {
    transformers = {
      DEFAULT: transformers
    };
  }

  return transformers[fileExtension] || transformers.DEFAULT || (content => content);
}

function purgeUnusedUtilities(config, configChanged, registerDependency) {
  var _config$purge;

  const purgeEnabled = _lodash.default.get(config, 'purge.enabled', config.purge !== false && config.purge !== undefined && process.env.NODE_ENV === 'production');

  if (!purgeEnabled) {
    return removeTailwindMarkers;
  } // Skip if `purge: []` since that's part of the default config


  if (Array.isArray(config.purge) && config.purge.length === 0) {
    if (configChanged) {
      _log.default.warn(['Tailwind is not purging unused styles because no template paths have been provided.', 'If you have manually configured PurgeCSS outside of Tailwind or are deliberately not removing unused styles, set `purge: false` in your Tailwind config file to silence this warning.', 'https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css']);
    }

    return removeTailwindMarkers;
  }

  const extractors = config.purge.extract || {};
  const transformers = config.purge.transform || {};
  let {
    defaultExtractor: originalDefaultExtractor,
    ...purgeOptions
  } = config.purge.options || {};

  if ((_config$purge = config.purge) !== null && _config$purge !== void 0 && _config$purge.safelist && !purgeOptions.hasOwnProperty('safelist')) {
    purgeOptions.safelist = config.purge.safelist;
  }

  if (!originalDefaultExtractor) {
    originalDefaultExtractor = typeof extractors === 'function' ? extractors : extractors.DEFAULT || tailwindExtractor;
  }

  const defaultExtractor = content => {
    const preserved = originalDefaultExtractor(content);

    if (_lodash.default.get(config, 'purge.preserveHtmlElements', true)) {
      preserved.push(..._htmlTags.default);
    }

    return preserved;
  }; // If `extractors` is a function then we don't have any file-specific extractors,
  // only a default one.


  let fileSpecificExtractors = typeof extractors === 'function' ? {} : extractors; // PurgeCSS doesn't support "transformers," so we implement those using extractors.
  // If we have a custom transformer for an extension, but not a matching extractor,
  // then we need to create an extractor that we can augment later.

  if (typeof transformers !== 'function') {
    for (let [extension] of Object.entries(transformers)) {
      if (!fileSpecificExtractors[extension]) {
        fileSpecificExtractors[extension] = defaultExtractor;
      }
    }
  } // Augment file-specific extractors by running the transformer before we extract classes.


  fileSpecificExtractors = Object.entries(fileSpecificExtractors).map(([extension, extractor]) => {
    return {
      extensions: [extension],
      extractor: content => {
        const transformer = getTransformer(config, extension);
        return extractor(transformer(content));
      }
    };
  });
  let content = (Array.isArray(config.purge) ? config.purge : config.purge.content || purgeOptions.content || []).map(item => {
    if (typeof item === 'string') {
      return (0, _normalizePath.default)(_path.default.resolve(item));
    }

    return item;
  });

  for (let fileOrGlob of content.filter(item => typeof item === 'string')) {
    registerDependency((0, _parseDependency.default)(fileOrGlob));
  }

  let hasLayers = false;

  const mode = _lodash.default.get(config, 'purge.mode', 'layers');

  return (0, _postcss.default)([function (css) {
    if (!['all', 'layers'].includes(mode)) {
      throw new Error('Purge `mode` must be one of `layers` or `all`.');
    }

    if (mode === 'all') {
      return;
    }

    const layers = _lodash.default.get(config, 'purge.layers', ['base', 'components', 'utilities']);

    css.walkComments(comment => {
      switch (comment.text.trim()) {
        case `purgecss start ignore`:
          comment.before(_postcss.default.comment({
            text: 'purgecss end ignore'
          }));
          break;

        case `purgecss end ignore`:
          comment.before(_postcss.default.comment({
            text: 'purgecss end ignore'
          }));
          comment.text = 'purgecss start ignore';
          break;

        default:
          break;
      }

      layers.forEach(layer => {
        switch (comment.text.trim()) {
          case `tailwind start ${layer}`:
            comment.text = 'purgecss end ignore';
            hasLayers = true;
            break;

          case `tailwind end ${layer}`:
            comment.text = 'purgecss start ignore';
            break;

          default:
            break;
        }
      });
    });
    css.prepend(_postcss.default.comment({
      text: 'purgecss start ignore'
    }));
    css.append(_postcss.default.comment({
      text: 'purgecss end ignore'
    }));
  }, removeTailwindMarkers, async function (css) {
    if (mode === 'layers' && !hasLayers) {
      return;
    }

    const purgeCSS = new _purgecss.default();
    purgeCSS.options = { ..._purgecss.defaultOptions,
      defaultExtractor: content => {
        const transformer = getTransformer(config);
        return defaultExtractor(transformer(content));
      },
      extractors: fileSpecificExtractors,
      ...purgeOptions,
      safelist: (0, _purgecss.standardizeSafelist)(purgeOptions.safelist)
    };

    if (purgeCSS.options.variables) {
      purgeCSS.variablesStructure.safelist = purgeCSS.options.safelist.variables || [];
    }

    const fileFormatContents = content.filter(o => typeof o === 'string');
    const rawFormatContents = content.filter(o => typeof o === 'object');
    const cssFileSelectors = await purgeCSS.extractSelectorsFromFiles(fileFormatContents, purgeCSS.options.extractors);
    const cssRawSelectors = await purgeCSS.extractSelectorsFromString(rawFormatContents, purgeCSS.options.extractors);
    const cssSelectors = (0, _purgecss.mergeExtractorSelectors)(cssFileSelectors, cssRawSelectors);
    purgeCSS.walkThroughCSS(css, cssSelectors);
    if (purgeCSS.options.fontFace) purgeCSS.removeUnusedFontFaces();
    if (purgeCSS.options.keyframes) purgeCSS.removeUnusedKeyframes();
    if (purgeCSS.options.variables) purgeCSS.removeUnusedCSSVariables();
  }]);
}
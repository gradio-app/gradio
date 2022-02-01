/* global CSSRule */

/**
 * Split URL
 * @param  {string} url
 * @return {object}
 */
function splitUrl (url) {
  let hash = '';
  let params = '';
  let index = url.indexOf('#');

  if (index >= 0) {
    hash = url.slice(index);
    url = url.slice(0, index);
  }

  // http://your.domain.com/path/to/combo/??file1.css,file2,css
  const comboSign = url.indexOf('??');

  if (comboSign >= 0) {
    if ((comboSign + 1) !== url.lastIndexOf('?')) {
      index = url.lastIndexOf('?');
    }
  } else {
    index = url.indexOf('?');
  }

  if (index >= 0) {
    params = url.slice(index);
    url = url.slice(0, index);
  }

  return { url, params, hash };
};

/**
 * Get path from URL (remove protocol, host, port)
 * @param  {string} url
 * @return {string}
 */
function pathFromUrl (url) {
  if (!url) {
    return '';
  }

  let path;

  ({ url } = splitUrl(url));

  if (url.indexOf('file://') === 0) {
    // eslint-disable-next-line prefer-regex-literals
    path = url.replace(new RegExp('^file://(localhost)?'), '');
  } else {
    //                        http  :   // hostname  :8080  /
    // eslint-disable-next-line prefer-regex-literals
    path = url.replace(new RegExp('^([^:]+:)?//([^:/]+)(:\\d*)?/'), '/');
  }

  // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
  return decodeURIComponent(path);
}

/**
 * Get number of matching path segments
 * @param  {string} left
 * @param  {string} right
 * @return {int}
 */
function numberOfMatchingSegments (left, right) {
  // get rid of leading slashes and normalize to lower case
  left = left.replace(/^\/+/, '').toLowerCase();
  right = right.replace(/^\/+/, '').toLowerCase();

  if (left === right) {
    return 10000;
  }

  const comps1 = left.split(/\/|\\/).reverse();
  const comps2 = right.split(/\/|\\/).reverse();
  const len = Math.min(comps1.length, comps2.length);

  let eqCount = 0;

  while ((eqCount < len) && (comps1[eqCount] === comps2[eqCount])) {
    ++eqCount;
  }

  return eqCount;
}

/**
 * Pick best matching path from a collection
 * @param  {string} path         Path to match
 * @param  {array} objects       Collection of paths
 * @param  {function} [pathFunc] Transform applied to each item in collection
 * @return {object}
 */
function pickBestMatch (path, objects, pathFunc = s => s) {
  let score;
  let bestMatch = { score: 0 };

  for (const object of objects) {
    score = numberOfMatchingSegments(path, pathFunc(object));

    if (score > bestMatch.score) {
      bestMatch = { object, score };
    }
  }

  if (bestMatch.score === 0) {
    return null;
  }

  return bestMatch;
}

/**
 * Test if paths match
 * @param  {string} left
 * @param  {string} right
 * @return {bool}
 */
function pathsMatch (left, right) {
  return numberOfMatchingSegments(left, right) > 0;
}

const IMAGE_STYLES = [
  { selector: 'background', styleNames: ['backgroundImage'] },
  { selector: 'border', styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage'] }
];

const DEFAULT_OPTIONS = {
  stylesheetReloadTimeout: 15000
};

class Reloader {
  constructor (window, console, Timer) {
    this.window = window;
    this.console = console;
    this.Timer = Timer;
    this.document = this.window.document;
    this.importCacheWaitPeriod = 200;
    this.plugins = [];
  }

  addPlugin (plugin) {
    return this.plugins.push(plugin);
  }

  analyze (callback) {
  }

  reload (path, options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    }; // avoid passing it through all the funcs

    if (this.options.pluginOrder && this.options.pluginOrder.length) {
      this.runPluginsByOrder(path, options);
      return;
    }

    for (const plugin of Array.from(this.plugins)) {
      if (plugin.reload && plugin.reload(path, options)) {
        return;
      }
    }

    if (options.liveCSS && path.match(/\.css(?:\.map)?$/i)) {
      if (this.reloadStylesheet(path)) {
        return;
      }
    }

    if (options.liveImg && path.match(/\.(jpe?g|png|gif)$/i)) {
      this.reloadImages(path);
      return;
    }

    if (options.isChromeExtension) {
      this.reloadChromeExtension();
      return;
    }

    return this.reloadPage();
  }

  runPluginsByOrder (path, options) {
    options.pluginOrder.some(pluginId => {
      if (pluginId === 'css') {
        if (options.liveCSS && path.match(/\.css(?:\.map)?$/i)) {
          if (this.reloadStylesheet(path)) {
            return true;
          }
        }
      }

      if (pluginId === 'img') {
        if (options.liveImg && path.match(/\.(jpe?g|png|gif)$/i)) {
          this.reloadImages(path);
          return true;
        }
      }

      if (pluginId === 'extension') {
        if (options.isChromeExtension) {
          this.reloadChromeExtension();
          return true;
        }
      }

      if (pluginId === 'others') {
        this.reloadPage();
        return true;
      }

      if (pluginId === 'external') {
        return this.plugins.some(
          plugin => plugin.reload && plugin.reload(path, options)
        );
      }

      return this.plugins.filter(plugin => plugin.constructor.identifier === pluginId)
        .some(plugin => plugin.reload && plugin.reload(path, options));
    });
  }

  reloadPage () {
    return this.window.document.location.reload();
  }

  reloadChromeExtension () {
    return this.window.chrome.runtime.reload();
  }

  reloadImages (path) {
    let img;
    const expando = this.generateUniqueString();

    for (img of Array.from(this.document.images)) {
      if (pathsMatch(path, pathFromUrl(img.src))) {
        img.src = this.generateCacheBustUrl(img.src, expando);
      }
    }

    if (this.document.querySelectorAll) {
      for (const { selector, styleNames } of IMAGE_STYLES) {
        for (img of Array.from(this.document.querySelectorAll(`[style*=${selector}]`))) {
          this.reloadStyleImages(img.style, styleNames, path, expando);
        }
      }
    }

    if (this.document.styleSheets) {
      return Array.from(this.document.styleSheets).map(styleSheet =>
        this.reloadStylesheetImages(styleSheet, path, expando)
      );
    }
  }

  reloadStylesheetImages (styleSheet, path, expando) {
    let rules;

    try {
      rules = (styleSheet || {}).cssRules;
    } catch (e) {}

    if (!rules) {
      return;
    }

    for (const rule of Array.from(rules)) {
      switch (rule.type) {
        case CSSRule.IMPORT_RULE:
          this.reloadStylesheetImages(rule.styleSheet, path, expando);
          break;
        case CSSRule.STYLE_RULE:
          for (const { styleNames } of IMAGE_STYLES) {
            this.reloadStyleImages(rule.style, styleNames, path, expando);
          }
          break;
        case CSSRule.MEDIA_RULE:
          this.reloadStylesheetImages(rule, path, expando);
          break;
      }
    }
  }

  reloadStyleImages (style, styleNames, path, expando) {
    for (const styleName of styleNames) {
      const value = style[styleName];

      if (typeof value === 'string') {
        // eslint-disable-next-line prefer-regex-literals
        const newValue = value.replace(new RegExp('\\burl\\s*\\(([^)]*)\\)'), (match, src) => {
          if (pathsMatch(path, pathFromUrl(src))) {
            return `url(${this.generateCacheBustUrl(src, expando)})`;
          }

          return match;
        });

        if (newValue !== value) {
          style[styleName] = newValue;
        }
      }
    }
  }

  reloadStylesheet (path) {
    const options = this.options || DEFAULT_OPTIONS;

    // has to be a real array, because DOMNodeList will be modified
    let style;
    let link;

    const links = ((() => {
      const result = [];

      for (link of Array.from(this.document.getElementsByTagName('link'))) {
        if (link.rel.match(/^stylesheet$/i) && !link.__LiveReload_pendingRemoval) {
          result.push(link);
        }
      }

      return result;
    })());

    // find all imported stylesheets
    const imported = [];

    for (style of Array.from(this.document.getElementsByTagName('style'))) {
      if (style.sheet) {
        this.collectImportedStylesheets(style, style.sheet, imported);
      }
    }

    for (link of Array.from(links)) {
      this.collectImportedStylesheets(link, link.sheet, imported);
    }

    // handle prefixfree
    if (this.window.StyleFix && this.document.querySelectorAll) {
      for (style of Array.from(this.document.querySelectorAll('style[data-href]'))) {
        links.push(style);
      }
    }

    this.console.log(`LiveReload found ${links.length} LINKed stylesheets, ${imported.length} @imported stylesheets`);

    const match = pickBestMatch(
      path,
      links.concat(imported),
      link => pathFromUrl(this.linkHref(link))
    );

    if (match) {
      if (match.object.rule) {
        this.console.log(`LiveReload is reloading imported stylesheet: ${match.object.href}`);
        this.reattachImportedRule(match.object);
      } else {
        this.console.log(`LiveReload is reloading stylesheet: ${this.linkHref(match.object)}`);
        this.reattachStylesheetLink(match.object);
      }
    } else {
      if (options.reloadMissingCSS) {
        this.console.log(`LiveReload will reload all stylesheets because path '${path}' did not match any specific one. \
To disable this behavior, set 'options.reloadMissingCSS' to 'false'.`
        );

        for (link of Array.from(links)) {
          this.reattachStylesheetLink(link);
        }
      } else {
        this.console.log(`LiveReload will not reload path '${path}' because the stylesheet was not found on the page \
and 'options.reloadMissingCSS' was set to 'false'.`
        );
      }
    }

    return true;
  }

  collectImportedStylesheets (link, styleSheet, result) {
    // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
    // Firefox/Opera may throw exceptions
    let rules;

    try {
      rules = (styleSheet || {}).cssRules;
    } catch (e) {}

    if (rules && rules.length) {
      for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];

        switch (rule.type) {
          case CSSRule.CHARSET_RULE:
            continue; // do nothing
          case CSSRule.IMPORT_RULE:
            result.push({ link, rule, index, href: rule.href });
            this.collectImportedStylesheets(link, rule.styleSheet, result);
            break;
          default:
            break; // import rules can only be preceded by charset rules
        }
      }
    }
  }

  waitUntilCssLoads (clone, func) {
    const options = this.options || DEFAULT_OPTIONS;
    let callbackExecuted = false;

    const executeCallback = () => {
      if (callbackExecuted) {
        return;
      }

      callbackExecuted = true;

      return func();
    };

    // supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
    // http://www.zachleat.com/web/load-css-dynamically/
    // http://pieisgood.org/test/script-link-events/
    clone.onload = () => {
      this.console.log('LiveReload: the new stylesheet has finished loading');
      this.knownToSupportCssOnLoad = true;

      return executeCallback();
    };

    if (!this.knownToSupportCssOnLoad) {
      // polling
      let poll;
      (poll = () => {
        if (clone.sheet) {
          this.console.log('LiveReload is polling until the new CSS finishes loading...');

          return executeCallback();
        }

        return this.Timer.start(50, poll);
      })();
    }

    // fail safe
    return this.Timer.start(options.stylesheetReloadTimeout, executeCallback);
  }

  linkHref (link) {
    // prefixfree uses data-href when it turns LINK into STYLE
    return link.href || (link.getAttribute && link.getAttribute('data-href'));
  }

  reattachStylesheetLink (link) {
    // ignore LINKs that will be removed by LR soon
    let clone;

    if (link.__LiveReload_pendingRemoval) {
      return;
    }

    link.__LiveReload_pendingRemoval = true;

    if (link.tagName === 'STYLE') {
      // prefixfree
      clone = this.document.createElement('link');
      clone.rel = 'stylesheet';
      clone.media = link.media;
      clone.disabled = link.disabled;
    } else {
      clone = link.cloneNode(false);
    }

    clone.href = this.generateCacheBustUrl(this.linkHref(link));

    // insert the new LINK before the old one
    const parent = link.parentNode;

    if (parent.lastChild === link) {
      parent.appendChild(clone);
    } else {
      parent.insertBefore(clone, link.nextSibling);
    }

    return this.waitUntilCssLoads(clone, () => {
      let additionalWaitingTime;

      if (/AppleWebKit/.test(this.window.navigator.userAgent)) {
        additionalWaitingTime = 5;
      } else {
        additionalWaitingTime = 200;
      }

      return this.Timer.start(additionalWaitingTime, () => {
        if (!link.parentNode) {
          return;
        }

        link.parentNode.removeChild(link);
        clone.onreadystatechange = null;

        return (this.window.StyleFix ? this.window.StyleFix.link(clone) : undefined);
      });
    }); // prefixfree
  }

  reattachImportedRule ({ rule, index, link }) {
    const parent = rule.parentStyleSheet;
    const href = this.generateCacheBustUrl(rule.href);
    const media = rule.media.length ? [].join.call(rule.media, ', ') : '';
    const newRule = `@import url("${href}") ${media};`;

    // used to detect if reattachImportedRule has been called again on the same rule
    rule.__LiveReload_newHref = href;

    // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
    // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
    // stylesheet by temporarily adding it as a LINK tag.
    const tempLink = this.document.createElement('link');
    tempLink.rel = 'stylesheet';
    tempLink.href = href;
    tempLink.__LiveReload_pendingRemoval = true; // exclude from path matching

    if (link.parentNode) {
      link.parentNode.insertBefore(tempLink, link);
    }

    // wait for it to load
    return this.Timer.start(this.importCacheWaitPeriod, () => {
      if (tempLink.parentNode) {
        tempLink.parentNode.removeChild(tempLink);
      }

      // if another reattachImportedRule call is in progress, abandon this one
      if (rule.__LiveReload_newHref !== href) {
        return;
      }

      parent.insertRule(newRule, index);
      parent.deleteRule(index + 1);

      // save the new rule, so that we can detect another reattachImportedRule call
      rule = parent.cssRules[index];
      rule.__LiveReload_newHref = href;

      // repeat again for good measure
      return this.Timer.start(this.importCacheWaitPeriod, () => {
        // if another reattachImportedRule call is in progress, abandon this one
        if (rule.__LiveReload_newHref !== href) {
          return;
        }

        parent.insertRule(newRule, index);

        return parent.deleteRule(index + 1);
      });
    });
  }

  generateUniqueString () {
    return `livereload=${Date.now()}`;
  }

  generateCacheBustUrl (url, expando) {
    const options = this.options || DEFAULT_OPTIONS;
    let hash, oldParams;

    if (!expando) {
      expando = this.generateUniqueString();
    }

    ({ url, hash, params: oldParams } = splitUrl(url));

    if (options.overrideURL) {
      if (url.indexOf(options.serverURL) < 0) {
        const originalUrl = url;

        url = options.serverURL + options.overrideURL + '?url=' + encodeURIComponent(url);

        this.console.log(`LiveReload is overriding source URL ${originalUrl} with ${url}`);
      }
    }

    let params = oldParams.replace(/(\?|&)livereload=(\d+)/, (match, sep) => `${sep}${expando}`);

    if (params === oldParams) {
      if (oldParams.length === 0) {
        params = `?${expando}`;
      } else {
        params = `${oldParams}&${expando}`;
      }
    }

    return url + params + hash;
  }
};

exports.splitUrl = splitUrl;
exports.pathFromUrl = pathFromUrl;
exports.numberOfMatchingSegments = numberOfMatchingSegments;
exports.pickBestMatch = pickBestMatch;
exports.pathsMatch = pathsMatch;
exports.Reloader = Reloader;

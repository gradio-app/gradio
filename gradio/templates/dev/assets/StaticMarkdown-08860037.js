import { SvelteComponentDev, init, safe_not_equal, dispatch_dev, validate_slots, afterUpdate, createEventDispatcher, element, attr_dev, toggle_class, add_location, insert_dev, noop, detach_dev, binding_callbacks, create_component, mount_component, action_destroyer, transition_in, transition_out, destroy_component, assign, space, get_spread_update, get_spread_object } from './svelte/svelte-internal.js';
import { d as copy, B as Block } from './Button-153ea7e7.js';
import { c as commonjsGlobal, g as getDefaultExportFromCjs, S as Static } from './index-30423ace.js';

/*! @license DOMPurify 3.0.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.3/LICENSE */

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object; // eslint-disable-line import/no-mutable-exports

let {
  apply,
  construct
} = typeof Reflect !== 'undefined' && Reflect;

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}

if (!seal) {
  seal = function seal(x) {
    return x;
  };
}

if (!construct) {
  construct = function construct(Func, args) {
    return new Func(...args);
  };
}

const arrayForEach = unapply(Array.prototype.forEach);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return apply(func, thisArg, args);
  };
}
function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return construct(func, args);
  };
}
/* Add properties to a lookup table */

function addToSet(set, array, transformCaseFunc) {
  var _transformCaseFunc;

  transformCaseFunc = (_transformCaseFunc = transformCaseFunc) !== null && _transformCaseFunc !== void 0 ? _transformCaseFunc : stringToLowerCase;

  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  let l = array.length;

  while (l--) {
    let element = array[l];

    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);

      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}
/* Shallow clone an object */

function clone(object) {
  const newObject = create(null);

  for (const [property, value] of entries(object)) {
    newObject[property] = value;
  }

  return newObject;
}
/* This method automatically checks if the prop is function
 * or getter and behaves accordingly. */

function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);

    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }

      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }

    object = getPrototypeOf(object);
  }

  function fallbackValue(element) {
    console.warn('fallback value for', element);
    return null;
  }

  return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']); // SVG

const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']); // List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.

const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']); // Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.

const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  MUSTACHE_EXPR: MUSTACHE_EXPR,
  ERB_EXPR: ERB_EXPR,
  TMPLIT_EXPR: TMPLIT_EXPR,
  DATA_ATTR: DATA_ATTR,
  ARIA_ATTR: ARIA_ATTR,
  IS_ALLOWED_URI: IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
  ATTR_WHITESPACE: ATTR_WHITESPACE,
  DOCTYPE_NAME: DOCTYPE_NAME
});

const getGlobal = () => typeof window === 'undefined' ? null : window;
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */


const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  } // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.


  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';

  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }

  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },

      createScriptURL(scriptUrl) {
        return scriptUrl;
      }

    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};

function createDOMPurify() {
  let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  const DOMPurify = root => createDOMPurify(root);
  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */


  DOMPurify.version = '3.0.3';
  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */

  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  const originalDocument = window.document;
  const currentScript = originalDocument.currentScript;
  let {
    document
  } = window;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode'); // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');

    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  let trustedTypesPolicy;
  let emptyHTML = '';
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document;
  const {
    importNode
  } = originalDocument;
  let hooks = {};
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */

  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  /* Allowed attribute names */

  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  /*
   * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */

  let CUSTOM_ELEMENT_HANDLING = Object.seal(Object.create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

  let FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

  let FORBID_ATTR = null;
  /* Decide if ARIA attributes are okay */

  let ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */

  let ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */

  let ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */

  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */

  let SAFE_FOR_TEMPLATES = false;
  /* Decide if document with <html>... should be returned */

  let WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */

  let SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */

  let FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */

  let RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */

  let RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */

  let RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */

  let SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */

  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */

  let KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */

  let IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */

  let USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */

  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */

  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */

  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */

  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */

  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  /* Parsing of strict XHTML documents */

  let PARSER_MEDIA_TYPE;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc;
  /* Keep a reference to config to pass to hooks */

  let CONFIG = null;
  /* Ideally, do not touch anything below this line */

  /* ______________________________________________ */

  const formElement = document.createElement('form');

  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity


  const _parseConfig = function _parseConfig(cfg) {
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */


    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */


    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */

    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = 'ALLOWED_NAMESPACES' in cfg ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
    cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
    transformCaseFunc // eslint-disable-line indent
    ) // eslint-disable-line indent
    : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
    cfg.ADD_DATA_URI_TAGS, // eslint-disable-line indent
    transformCaseFunc // eslint-disable-line indent
    ) // eslint-disable-line indent
    : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true

    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

    RETURN_DOM = cfg.RETURN_DOM || false; // Default false

    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false

    FORCE_BODY = cfg.FORCE_BODY || false; // Default false

    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false

    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

    IN_PLACE = cfg.IN_PLACE || false; // Default false

    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};

    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }

    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }

    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */


    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [...text]);
      ALLOWED_ATTR = [];

      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }

      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */


    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }

      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
    }

    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }

      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
    }

    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }

    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }

      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */


    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */


    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */


    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }

    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }

      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      } // Overwrite existing TrustedTypes policy.


      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY; // Sign local variables required by `sanitize`.

      emptyHTML = trustedTypesPolicy.createHTML('');
    } else {
      // Uninitialized policy, attempt to initialize the internal dompurify policy.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      } // If creating the internal policy succeeded sign internal variables.


      if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
        emptyHTML = trustedTypesPolicy.createHTML('');
      }
    } // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.


    if (freeze) {
      freeze(cfg);
    }

    CONFIG = cfg;
  };

  const MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  const HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']); // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.

  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */

  const ALL_SVG_TAGS = addToSet({}, svg$1);
  addToSet(ALL_SVG_TAGS, svgFilters);
  addToSet(ALL_SVG_TAGS, svgDisallowed);
  const ALL_MATHML_TAGS = addToSet({}, mathMl$1);
  addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
  /**
   *
   *
   * @param  {Element} element a DOM element whose namespace is being checked
   * @returns {boolean} Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */

  const _checkValidNamespace = function _checkValidNamespace(element) {
    let parent = getParentNode(element); // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.

    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }

    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);

    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }

    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      } // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.


      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      } // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.


      return Boolean(ALL_SVG_TAGS[tagName]);
    }

    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      } // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points


      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      } // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.


      return Boolean(ALL_MATHML_TAGS[tagName]);
    }

    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }

      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      } // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace


      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    } // For XHTML and XML documents that support custom namespaces


    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    } // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.


    return false;
  };
  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */


  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });

    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      node.parentNode.removeChild(node);
    } catch (_) {
      node.remove();
    }
  };
  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */


  const _removeAttribute = function _removeAttribute(name, node) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: node
      });
    }

    node.removeAttribute(name); // We void attribute values for unremovable "is"" attributes

    if (name === 'is' && !ALLOWED_ATTR[name]) {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(node);
        } catch (_) {}
      } else {
        try {
          node.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */


  const _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    let doc;
    let leadingWhitespace;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }

    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }

    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */

    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */


    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);

      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {// Syntax error if dirtyPayload is invalid xml
      }
    }

    const body = doc.body || doc.documentElement;

    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */


    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }

    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */


  const _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
  };
  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */


  const _isClobbered = function _isClobbered(elm) {
    return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
  };
  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */


  const _isNode = function _isNode(object) {
    return typeof Node === 'object' ? object instanceof Node : object && typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
  };
  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */


  const _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    arrayForEach(hooks[entryPoint], hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */


  const _sanitizeElements = function _sanitizeElements(currentNode) {
    let content;
    /* Execute a hook if present */

    _executeHook('beforeSanitizeElements', currentNode, null);
    /* Check if element is clobbered or can clobber */


    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Now let's check the element's type and name */


    const tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */

    _executeHook('uponSanitizeElement', currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */


    if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Remove element if anything forbids its presence */


    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _basicCustomElementTest(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) return false;
      }
      /* Keep content except for bad-listed elements */


      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;

        if (childNodes && parentNode) {
          const childCount = childNodes.length;

          for (let i = childCount - 1; i >= 0; --i) {
            parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
          }
        }
      }

      _forceRemove(currentNode);

      return true;
    }
    /* Check whether element has a valid namespace */


    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Make sure that older browsers don't get noscript mXSS */


    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Sanitize element content to be template-safe */


    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = stringReplace(content, MUSTACHE_EXPR, ' ');
      content = stringReplace(content, ERB_EXPR, ' ');
      content = stringReplace(content, TMPLIT_EXPR, ' ');

      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity


  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */


    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if ( // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _basicCustomElementTest(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) || // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */

    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
      return false;
    } else ;

    return true;
  };
  /**
   * _basicCustomElementCheck
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   * @param {string} tagName name of the tag of the node to sanitize
   */


  const _basicCustomElementTest = function _basicCustomElementTest(tagName) {
    return tagName.indexOf('-') > 0;
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} currentNode to sanitize
   */


  const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    let attr;
    let value;
    let lcName;
    let l;
    /* Execute a hook if present */

    _executeHook('beforeSanitizeAttributes', currentNode, null);

    const {
      attributes
    } = currentNode;
    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */

    while (l--) {
      attr = attributes[l];
      const {
        name,
        namespaceURI
      } = attr;
      value = name === 'value' ? attr.value : stringTrim(attr.value);
      lcName = transformCaseFunc(name);
      /* Execute a hook if present */

      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set

      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);

      value = hookEvent.attrValue;
      /* Did the hooks approve of the attribute? */

      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Remove attribute */


      _removeAttribute(name, currentNode);
      /* Did the hooks approve of the attribute? */


      if (!hookEvent.keepAttr) {
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */


      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);

        continue;
      }
      /* Sanitize attribute content to be template-safe */


      if (SAFE_FOR_TEMPLATES) {
        value = stringReplace(value, MUSTACHE_EXPR, ' ');
        value = stringReplace(value, ERB_EXPR, ' ');
        value = stringReplace(value, TMPLIT_EXPR, ' ');
      }
      /* Is `value` valid for this attribute? */


      const lcTag = transformCaseFunc(currentNode.nodeName);

      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */


      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode); // Prefix the value and later re-create the attribute with the sanitized value


        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Handle attributes that require Trusted Types */


      if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              {
                value = trustedTypesPolicy.createHTML(value);
                break;
              }

            case 'TrustedScriptURL':
              {
                value = trustedTypesPolicy.createScriptURL(value);
                break;
              }
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */


      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }

        arrayPop(DOMPurify.removed);
      } catch (_) {}
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeAttributes', currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */


  const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    let shadowNode;

    const shadowIterator = _createIterator(fragment);
    /* Execute a hook if present */


    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);
      /* Sanitize tags and elements */


      if (_sanitizeElements(shadowNode)) {
        continue;
      }
      /* Deep shadow DOM detected */


      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
      /* Check attributes, sanitize if necessary */


      _sanitizeAttributes(shadowNode);
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };
  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity


  DOMPurify.sanitize = function (dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body;
    let importedNode;
    let currentNode;
    let returnNode;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */

    IS_EMPTY_INPUT = !dirty;

    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */


    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString === 'function') {
        dirty = dirty.toString();

        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      } else {
        throw typeErrorCreate('toString is not a function');
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */


    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */


    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */


    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */

    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }

    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);

        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);

      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */


      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */

      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */


    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */


    const nodeIterator = _createIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */


    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }
      /* Shadow DOM detected, sanitize it */


      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
      /* Check attributes, sanitize if necessary */


      _sanitizeAttributes(currentNode);
    }
    /* If we sanitized `dirty` in-place, return it. */


    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */


    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmod) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */

    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */


    if (SAFE_FOR_TEMPLATES) {
      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR, ' ');
      serializedHTML = stringReplace(serializedHTML, ERB_EXPR, ' ');
      serializedHTML = stringReplace(serializedHTML, TMPLIT_EXPR, ' ');
    }

    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */


  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);

    SET_CONFIG = true;
  };
  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */


  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */


  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */


  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }

    hooks[entryPoint] = hooks[entryPoint] || [];
    arrayPush(hooks[entryPoint], hookFunction);
  };
  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   * @return {Function} removed(popped) hook
   */


  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      return arrayPop(hooks[entryPoint]);
    }
  };
  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */


  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };
  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */


  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

var autoRender = {exports: {}};

var katex = {exports: {}};

var hasRequiredKatex;

function requireKatex () {
	if (hasRequiredKatex) return katex.exports;
	hasRequiredKatex = 1;
	(function (module, exports) {
		(function webpackUniversalModuleDefinition(root, factory) {
			module.exports = factory();
		})((typeof self !== 'undefined' ? self : commonjsGlobal), function() {
		return /******/ (function() { // webpackBootstrap
		/******/ 	// The require scope
		/******/ 	var __webpack_require__ = {};
		/******/ 	
		/************************************************************************/
		/******/ 	/* webpack/runtime/define property getters */
		/******/ 	!function() {
		/******/ 		// define getter functions for harmony exports
		/******/ 		__webpack_require__.d = function(exports, definition) {
		/******/ 			for(var key in definition) {
		/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
		/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
		/******/ 				}
		/******/ 			}
		/******/ 		};
		/******/ 	}();
		/******/ 	
		/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
		/******/ 	!function() {
		/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
		/******/ 	}();
		/******/ 	
		/************************************************************************/
		var __webpack_exports__ = {};

		// EXPORTS
		__webpack_require__.d(__webpack_exports__, {
		  "default": function() { return /* binding */ katex_webpack; }
		});


		/**
		 * This is the ParseError class, which is the main error thrown by KaTeX
		 * functions when something has gone wrong. This is used to distinguish internal
		 * errors from errors in the expression that the user provided.
		 *
		 * If possible, a caller should provide a Token or ParseNode with information
		 * about where in the source string the problem occurred.
		 */
		var ParseError = // Error position based on passed-in Token or ParseNode.
		function ParseError(message, // The error message
		token // An object providing position information
		) {
		  this.position = void 0;
		  var error = "KaTeX parse error: " + message;
		  var start;
		  var loc = token && token.loc;

		  if (loc && loc.start <= loc.end) {
		    // If we have the input and a position, make the error a bit fancier
		    // Get the input
		    var input = loc.lexer.input; // Prepend some information

		    start = loc.start;
		    var end = loc.end;

		    if (start === input.length) {
		      error += " at end of input: ";
		    } else {
		      error += " at position " + (start + 1) + ": ";
		    } // Underline token in question using combining underscores


		    var underlined = input.slice(start, end).replace(/[^]/g, "$&\u0332"); // Extract some context from the input and add it to the error

		    var left;

		    if (start > 15) {
		      left = "…" + input.slice(start - 15, start);
		    } else {
		      left = input.slice(0, start);
		    }

		    var right;

		    if (end + 15 < input.length) {
		      right = input.slice(end, end + 15) + "…";
		    } else {
		      right = input.slice(end);
		    }

		    error += left + underlined + right;
		  } // Some hackery to make ParseError a prototype of Error
		  // See http://stackoverflow.com/a/8460753


		  var self = new Error(error);
		  self.name = "ParseError"; // $FlowFixMe

		  self.__proto__ = ParseError.prototype; // $FlowFixMe

		  self.position = start;
		  return self;
		}; // $FlowFixMe More hackery


		ParseError.prototype.__proto__ = Error.prototype;
		/* harmony default export */ var src_ParseError = (ParseError);
		/**
		 * This file contains a list of utility functions which are useful in other
		 * files.
		 */

		/**
		 * Return whether an element is contained in a list
		 */
		var contains = function contains(list, elem) {
		  return list.indexOf(elem) !== -1;
		};
		/**
		 * Provide a default value if a setting is undefined
		 * NOTE: Couldn't use `T` as the output type due to facebook/flow#5022.
		 */


		var deflt = function deflt(setting, defaultIfUndefined) {
		  return setting === undefined ? defaultIfUndefined : setting;
		}; // hyphenate and escape adapted from Facebook's React under Apache 2 license


		var uppercase = /([A-Z])/g;

		var hyphenate = function hyphenate(str) {
		  return str.replace(uppercase, "-$1").toLowerCase();
		};

		var ESCAPE_LOOKUP = {
		  "&": "&amp;",
		  ">": "&gt;",
		  "<": "&lt;",
		  "\"": "&quot;",
		  "'": "&#x27;"
		};
		var ESCAPE_REGEX = /[&><"']/g;
		/**
		 * Escapes text to prevent scripting attacks.
		 */

		function utils_escape(text) {
		  return String(text).replace(ESCAPE_REGEX, function (match) {
		    return ESCAPE_LOOKUP[match];
		  });
		}
		/**
		 * Sometimes we want to pull out the innermost element of a group. In most
		 * cases, this will just be the group itself, but when ordgroups and colors have
		 * a single element, we want to pull that out.
		 */


		var getBaseElem = function getBaseElem(group) {
		  if (group.type === "ordgroup") {
		    if (group.body.length === 1) {
		      return getBaseElem(group.body[0]);
		    } else {
		      return group;
		    }
		  } else if (group.type === "color") {
		    if (group.body.length === 1) {
		      return getBaseElem(group.body[0]);
		    } else {
		      return group;
		    }
		  } else if (group.type === "font") {
		    return getBaseElem(group.body);
		  } else {
		    return group;
		  }
		};
		/**
		 * TeXbook algorithms often reference "character boxes", which are simply groups
		 * with a single character in them. To decide if something is a character box,
		 * we find its innermost group, and see if it is a single character.
		 */


		var isCharacterBox = function isCharacterBox(group) {
		  var baseElem = getBaseElem(group); // These are all they types of groups which hold single characters

		  return baseElem.type === "mathord" || baseElem.type === "textord" || baseElem.type === "atom";
		};

		var assert = function assert(value) {
		  if (!value) {
		    throw new Error('Expected non-null, but got ' + String(value));
		  }

		  return value;
		};
		/**
		 * Return the protocol of a URL, or "_relative" if the URL does not specify a
		 * protocol (and thus is relative).
		 */

		var protocolFromUrl = function protocolFromUrl(url) {
		  var protocol = /^\s*([^\\/#]*?)(?::|&#0*58|&#x0*3a)/i.exec(url);
		  return protocol != null ? protocol[1] : "_relative";
		};
		/* harmony default export */ var utils = ({
		  contains: contains,
		  deflt: deflt,
		  escape: utils_escape,
		  hyphenate: hyphenate,
		  getBaseElem: getBaseElem,
		  isCharacterBox: isCharacterBox,
		  protocolFromUrl: protocolFromUrl
		});
		/* eslint no-console:0 */

		/**
		 * This is a module for storing settings passed into KaTeX. It correctly handles
		 * default settings.
		 */



		// TODO: automatically generate documentation
		// TODO: check all properties on Settings exist
		// TODO: check the type of a property on Settings matches
		var SETTINGS_SCHEMA = {
		  displayMode: {
		    type: "boolean",
		    description: "Render math in display mode, which puts the math in " + "display style (so \\int and \\sum are large, for example), and " + "centers the math on the page on its own line.",
		    cli: "-d, --display-mode"
		  },
		  output: {
		    type: {
		      enum: ["htmlAndMathml", "html", "mathml"]
		    },
		    description: "Determines the markup language of the output.",
		    cli: "-F, --format <type>"
		  },
		  leqno: {
		    type: "boolean",
		    description: "Render display math in leqno style (left-justified tags)."
		  },
		  fleqn: {
		    type: "boolean",
		    description: "Render display math flush left."
		  },
		  throwOnError: {
		    type: "boolean",
		    default: true,
		    cli: "-t, --no-throw-on-error",
		    cliDescription: "Render errors (in the color given by --error-color) ins" + "tead of throwing a ParseError exception when encountering an error."
		  },
		  errorColor: {
		    type: "string",
		    default: "#cc0000",
		    cli: "-c, --error-color <color>",
		    cliDescription: "A color string given in the format 'rgb' or 'rrggbb' " + "(no #). This option determines the color of errors rendered by the " + "-t option.",
		    cliProcessor: function cliProcessor(color) {
		      return "#" + color;
		    }
		  },
		  macros: {
		    type: "object",
		    cli: "-m, --macro <def>",
		    cliDescription: "Define custom macro of the form '\\foo:expansion' (use " + "multiple -m arguments for multiple macros).",
		    cliDefault: [],
		    cliProcessor: function cliProcessor(def, defs) {
		      defs.push(def);
		      return defs;
		    }
		  },
		  minRuleThickness: {
		    type: "number",
		    description: "Specifies a minimum thickness, in ems, for fraction lines," + " `\\sqrt` top lines, `{array}` vertical lines, `\\hline`, " + "`\\hdashline`, `\\underline`, `\\overline`, and the borders of " + "`\\fbox`, `\\boxed`, and `\\fcolorbox`.",
		    processor: function processor(t) {
		      return Math.max(0, t);
		    },
		    cli: "--min-rule-thickness <size>",
		    cliProcessor: parseFloat
		  },
		  colorIsTextColor: {
		    type: "boolean",
		    description: "Makes \\color behave like LaTeX's 2-argument \\textcolor, " + "instead of LaTeX's one-argument \\color mode change.",
		    cli: "-b, --color-is-text-color"
		  },
		  strict: {
		    type: [{
		      enum: ["warn", "ignore", "error"]
		    }, "boolean", "function"],
		    description: "Turn on strict / LaTeX faithfulness mode, which throws an " + "error if the input uses features that are not supported by LaTeX.",
		    cli: "-S, --strict",
		    cliDefault: false
		  },
		  trust: {
		    type: ["boolean", "function"],
		    description: "Trust the input, enabling all HTML features such as \\url.",
		    cli: "-T, --trust"
		  },
		  maxSize: {
		    type: "number",
		    default: Infinity,
		    description: "If non-zero, all user-specified sizes, e.g. in " + "\\rule{500em}{500em}, will be capped to maxSize ems. Otherwise, " + "elements and spaces can be arbitrarily large",
		    processor: function processor(s) {
		      return Math.max(0, s);
		    },
		    cli: "-s, --max-size <n>",
		    cliProcessor: parseInt
		  },
		  maxExpand: {
		    type: "number",
		    default: 1000,
		    description: "Limit the number of macro expansions to the specified " + "number, to prevent e.g. infinite macro loops. If set to Infinity, " + "the macro expander will try to fully expand as in LaTeX.",
		    processor: function processor(n) {
		      return Math.max(0, n);
		    },
		    cli: "-e, --max-expand <n>",
		    cliProcessor: function cliProcessor(n) {
		      return n === "Infinity" ? Infinity : parseInt(n);
		    }
		  },
		  globalGroup: {
		    type: "boolean",
		    cli: false
		  }
		};

		function getDefaultValue(schema) {
		  if (schema.default) {
		    return schema.default;
		  }

		  var type = schema.type;
		  var defaultType = Array.isArray(type) ? type[0] : type;

		  if (typeof defaultType !== 'string') {
		    return defaultType.enum[0];
		  }

		  switch (defaultType) {
		    case 'boolean':
		      return false;

		    case 'string':
		      return '';

		    case 'number':
		      return 0;

		    case 'object':
		      return {};
		  }
		}
		/**
		 * The main Settings object
		 *
		 * The current options stored are:
		 *  - displayMode: Whether the expression should be typeset as inline math
		 *                 (false, the default), meaning that the math starts in
		 *                 \textstyle and is placed in an inline-block); or as display
		 *                 math (true), meaning that the math starts in \displaystyle
		 *                 and is placed in a block with vertical margin.
		 */


		var Settings = /*#__PURE__*/function () {
		  function Settings(options) {
		    this.displayMode = void 0;
		    this.output = void 0;
		    this.leqno = void 0;
		    this.fleqn = void 0;
		    this.throwOnError = void 0;
		    this.errorColor = void 0;
		    this.macros = void 0;
		    this.minRuleThickness = void 0;
		    this.colorIsTextColor = void 0;
		    this.strict = void 0;
		    this.trust = void 0;
		    this.maxSize = void 0;
		    this.maxExpand = void 0;
		    this.globalGroup = void 0;
		    // allow null options
		    options = options || {};

		    for (var prop in SETTINGS_SCHEMA) {
		      if (SETTINGS_SCHEMA.hasOwnProperty(prop)) {
		        // $FlowFixMe
		        var schema = SETTINGS_SCHEMA[prop]; // TODO: validate options
		        // $FlowFixMe

		        this[prop] = options[prop] !== undefined ? schema.processor ? schema.processor(options[prop]) : options[prop] : getDefaultValue(schema);
		      }
		    }
		  }
		  /**
		   * Report nonstrict (non-LaTeX-compatible) input.
		   * Can safely not be called if `this.strict` is false in JavaScript.
		   */


		  var _proto = Settings.prototype;

		  _proto.reportNonstrict = function reportNonstrict(errorCode, errorMsg, token) {
		    var strict = this.strict;

		    if (typeof strict === "function") {
		      // Allow return value of strict function to be boolean or string
		      // (or null/undefined, meaning no further processing).
		      strict = strict(errorCode, errorMsg, token);
		    }

		    if (!strict || strict === "ignore") {
		      return;
		    } else if (strict === true || strict === "error") {
		      throw new src_ParseError("LaTeX-incompatible input and strict mode is set to 'error': " + (errorMsg + " [" + errorCode + "]"), token);
		    } else if (strict === "warn") {
		      typeof console !== "undefined" && console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (errorMsg + " [" + errorCode + "]"));
		    } else {
		      // won't happen in type-safe code
		      typeof console !== "undefined" && console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + strict + "': " + errorMsg + " [" + errorCode + "]"));
		    }
		  }
		  /**
		   * Check whether to apply strict (LaTeX-adhering) behavior for unusual
		   * input (like `\\`).  Unlike `nonstrict`, will not throw an error;
		   * instead, "error" translates to a return value of `true`, while "ignore"
		   * translates to a return value of `false`.  May still print a warning:
		   * "warn" prints a warning and returns `false`.
		   * This is for the second category of `errorCode`s listed in the README.
		   */
		  ;

		  _proto.useStrictBehavior = function useStrictBehavior(errorCode, errorMsg, token) {
		    var strict = this.strict;

		    if (typeof strict === "function") {
		      // Allow return value of strict function to be boolean or string
		      // (or null/undefined, meaning no further processing).
		      // But catch any exceptions thrown by function, treating them
		      // like "error".
		      try {
		        strict = strict(errorCode, errorMsg, token);
		      } catch (error) {
		        strict = "error";
		      }
		    }

		    if (!strict || strict === "ignore") {
		      return false;
		    } else if (strict === true || strict === "error") {
		      return true;
		    } else if (strict === "warn") {
		      typeof console !== "undefined" && console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (errorMsg + " [" + errorCode + "]"));
		      return false;
		    } else {
		      // won't happen in type-safe code
		      typeof console !== "undefined" && console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + strict + "': " + errorMsg + " [" + errorCode + "]"));
		      return false;
		    }
		  }
		  /**
		   * Check whether to test potentially dangerous input, and return
		   * `true` (trusted) or `false` (untrusted).  The sole argument `context`
		   * should be an object with `command` field specifying the relevant LaTeX
		   * command (as a string starting with `\`), and any other arguments, etc.
		   * If `context` has a `url` field, a `protocol` field will automatically
		   * get added by this function (changing the specified object).
		   */
		  ;

		  _proto.isTrusted = function isTrusted(context) {
		    if (context.url && !context.protocol) {
		      context.protocol = utils.protocolFromUrl(context.url);
		    }

		    var trust = typeof this.trust === "function" ? this.trust(context) : this.trust;
		    return Boolean(trust);
		  };

		  return Settings;
		}();
		/**
		 * This file contains information and classes for the various kinds of styles
		 * used in TeX. It provides a generic `Style` class, which holds information
		 * about a specific style. It then provides instances of all the different kinds
		 * of styles possible, and provides functions to move between them and get
		 * information about them.
		 */

		/**
		 * The main style class. Contains a unique id for the style, a size (which is
		 * the same for cramped and uncramped version of a style), and a cramped flag.
		 */
		var Style = /*#__PURE__*/function () {
		  function Style(id, size, cramped) {
		    this.id = void 0;
		    this.size = void 0;
		    this.cramped = void 0;
		    this.id = id;
		    this.size = size;
		    this.cramped = cramped;
		  }
		  /**
		   * Get the style of a superscript given a base in the current style.
		   */


		  var _proto = Style.prototype;

		  _proto.sup = function sup() {
		    return styles[_sup[this.id]];
		  }
		  /**
		   * Get the style of a subscript given a base in the current style.
		   */
		  ;

		  _proto.sub = function sub() {
		    return styles[_sub[this.id]];
		  }
		  /**
		   * Get the style of a fraction numerator given the fraction in the current
		   * style.
		   */
		  ;

		  _proto.fracNum = function fracNum() {
		    return styles[_fracNum[this.id]];
		  }
		  /**
		   * Get the style of a fraction denominator given the fraction in the current
		   * style.
		   */
		  ;

		  _proto.fracDen = function fracDen() {
		    return styles[_fracDen[this.id]];
		  }
		  /**
		   * Get the cramped version of a style (in particular, cramping a cramped style
		   * doesn't change the style).
		   */
		  ;

		  _proto.cramp = function cramp() {
		    return styles[_cramp[this.id]];
		  }
		  /**
		   * Get a text or display version of this style.
		   */
		  ;

		  _proto.text = function text() {
		    return styles[_text[this.id]];
		  }
		  /**
		   * Return true if this style is tightly spaced (scriptstyle/scriptscriptstyle)
		   */
		  ;

		  _proto.isTight = function isTight() {
		    return this.size >= 2;
		  };

		  return Style;
		}(); // Export an interface for type checking, but don't expose the implementation.
		// This way, no more styles can be generated.


		// IDs of the different styles
		var D = 0;
		var Dc = 1;
		var T = 2;
		var Tc = 3;
		var S = 4;
		var Sc = 5;
		var SS = 6;
		var SSc = 7; // Instances of the different styles

		var styles = [new Style(D, 0, false), new Style(Dc, 0, true), new Style(T, 1, false), new Style(Tc, 1, true), new Style(S, 2, false), new Style(Sc, 2, true), new Style(SS, 3, false), new Style(SSc, 3, true)]; // Lookup tables for switching from one style to another

		var _sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
		var _sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
		var _fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
		var _fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
		var _cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];
		var _text = [D, Dc, T, Tc, T, Tc, T, Tc]; // We only export some of the styles.

		/* harmony default export */ var src_Style = ({
		  DISPLAY: styles[D],
		  TEXT: styles[T],
		  SCRIPT: styles[S],
		  SCRIPTSCRIPT: styles[SS]
		});
		/*
		 * This file defines the Unicode scripts and script families that we
		 * support. To add new scripts or families, just add a new entry to the
		 * scriptData array below. Adding scripts to the scriptData array allows
		 * characters from that script to appear in \text{} environments.
		 */

		/**
		 * Each script or script family has a name and an array of blocks.
		 * Each block is an array of two numbers which specify the start and
		 * end points (inclusive) of a block of Unicode codepoints.
		 */

		/**
		 * Unicode block data for the families of scripts we support in \text{}.
		 * Scripts only need to appear here if they do not have font metrics.
		 */
		var scriptData = [{
		  // Latin characters beyond the Latin-1 characters we have metrics for.
		  // Needed for Czech, Hungarian and Turkish text, for example.
		  name: 'latin',
		  blocks: [[0x0100, 0x024f], // Latin Extended-A and Latin Extended-B
		  [0x0300, 0x036f] // Combining Diacritical marks
		  ]
		}, {
		  // The Cyrillic script used by Russian and related languages.
		  // A Cyrillic subset used to be supported as explicitly defined
		  // symbols in symbols.js
		  name: 'cyrillic',
		  blocks: [[0x0400, 0x04ff]]
		}, {
		  // Armenian
		  name: 'armenian',
		  blocks: [[0x0530, 0x058F]]
		}, {
		  // The Brahmic scripts of South and Southeast Asia
		  // Devanagari (0900–097F)
		  // Bengali (0980–09FF)
		  // Gurmukhi (0A00–0A7F)
		  // Gujarati (0A80–0AFF)
		  // Oriya (0B00–0B7F)
		  // Tamil (0B80–0BFF)
		  // Telugu (0C00–0C7F)
		  // Kannada (0C80–0CFF)
		  // Malayalam (0D00–0D7F)
		  // Sinhala (0D80–0DFF)
		  // Thai (0E00–0E7F)
		  // Lao (0E80–0EFF)
		  // Tibetan (0F00–0FFF)
		  // Myanmar (1000–109F)
		  name: 'brahmic',
		  blocks: [[0x0900, 0x109F]]
		}, {
		  name: 'georgian',
		  blocks: [[0x10A0, 0x10ff]]
		}, {
		  // Chinese and Japanese.
		  // The "k" in cjk is for Korean, but we've separated Korean out
		  name: "cjk",
		  blocks: [[0x3000, 0x30FF], // CJK symbols and punctuation, Hiragana, Katakana
		  [0x4E00, 0x9FAF], // CJK ideograms
		  [0xFF00, 0xFF60] // Fullwidth punctuation
		  // TODO: add halfwidth Katakana and Romanji glyphs
		  ]
		}, {
		  // Korean
		  name: 'hangul',
		  blocks: [[0xAC00, 0xD7AF]]
		}];
		/**
		 * Given a codepoint, return the name of the script or script family
		 * it is from, or null if it is not part of a known block
		 */

		function scriptFromCodepoint(codepoint) {
		  for (var i = 0; i < scriptData.length; i++) {
		    var script = scriptData[i];

		    for (var _i = 0; _i < script.blocks.length; _i++) {
		      var block = script.blocks[_i];

		      if (codepoint >= block[0] && codepoint <= block[1]) {
		        return script.name;
		      }
		    }
		  }

		  return null;
		}
		/**
		 * A flattened version of all the supported blocks in a single array.
		 * This is an optimization to make supportedCodepoint() fast.
		 */

		var allBlocks = [];
		scriptData.forEach(function (s) {
		  return s.blocks.forEach(function (b) {
		    return allBlocks.push.apply(allBlocks, b);
		  });
		});
		/**
		 * Given a codepoint, return true if it falls within one of the
		 * scripts or script families defined above and false otherwise.
		 *
		 * Micro benchmarks shows that this is faster than
		 * /[\u3000-\u30FF\u4E00-\u9FAF\uFF00-\uFF60\uAC00-\uD7AF\u0900-\u109F]/.test()
		 * in Firefox, Chrome and Node.
		 */

		function supportedCodepoint(codepoint) {
		  for (var i = 0; i < allBlocks.length; i += 2) {
		    if (codepoint >= allBlocks[i] && codepoint <= allBlocks[i + 1]) {
		      return true;
		    }
		  }

		  return false;
		}
		/**
		 * This file provides support to domTree.js and delimiter.js.
		 * It's a storehouse of path geometry for SVG images.
		 */
		// In all paths below, the viewBox-to-em scale is 1000:1.
		var hLinePad = 80; // padding above a sqrt vinculum. Prevents image cropping.
		// The vinculum of a \sqrt can be made thicker by a KaTeX rendering option.
		// Think of variable extraVinculum as two detours in the SVG path.
		// The detour begins at the lower left of the area labeled extraVinculum below.
		// The detour proceeds one extraVinculum distance up and slightly to the right,
		// displacing the radiused corner between surd and vinculum. The radius is
		// traversed as usual, then the detour resumes. It goes right, to the end of
		// the very long vinculum, then down one extraVinculum distance,
		// after which it resumes regular path geometry for the radical.

		/*                                                  vinculum
		                                                   /
		         /▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒←extraVinculum
		        / █████████████████████←0.04em (40 unit) std vinculum thickness
		       / /
		      / /
		     / /\
		    / / surd
		*/

		var sqrtMain = function sqrtMain(extraVinculum, hLinePad) {
		  // sqrtMain path geometry is from glyph U221A in the font KaTeX Main
		  return "M95," + (622 + extraVinculum + hLinePad) + "\nc-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14\nc0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54\nc44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10\ns173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429\nc69,-144,104.5,-217.7,106.5,-221\nl" + extraVinculum / 2.075 + " -" + extraVinculum + "\nc5.3,-9.3,12,-14,20,-14\nH400000v" + (40 + extraVinculum) + "H845.2724\ns-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7\nc-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z\nM" + (834 + extraVinculum) + " " + hLinePad + "h400000v" + (40 + extraVinculum) + "h-400000z";
		};

		var sqrtSize1 = function sqrtSize1(extraVinculum, hLinePad) {
		  // size1 is from glyph U221A in the font KaTeX_Size1-Regular
		  return "M263," + (601 + extraVinculum + hLinePad) + "c0.7,0,18,39.7,52,119\nc34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120\nc340,-704.7,510.7,-1060.3,512,-1067\nl" + extraVinculum / 2.084 + " -" + extraVinculum + "\nc4.7,-7.3,11,-11,19,-11\nH40000v" + (40 + extraVinculum) + "H1012.3\ns-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232\nc-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1\ns-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26\nc-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z\nM" + (1001 + extraVinculum) + " " + hLinePad + "h400000v" + (40 + extraVinculum) + "h-400000z";
		};

		var sqrtSize2 = function sqrtSize2(extraVinculum, hLinePad) {
		  // size2 is from glyph U221A in the font KaTeX_Size2-Regular
		  return "M983 " + (10 + extraVinculum + hLinePad) + "\nl" + extraVinculum / 3.13 + " -" + extraVinculum + "\nc4,-6.7,10,-10,18,-10 H400000v" + (40 + extraVinculum) + "\nH1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7\ns-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744\nc-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30\nc26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722\nc56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5\nc53.7,-170.3,84.5,-266.8,92.5,-289.5z\nM" + (1001 + extraVinculum) + " " + hLinePad + "h400000v" + (40 + extraVinculum) + "h-400000z";
		};

		var sqrtSize3 = function sqrtSize3(extraVinculum, hLinePad) {
		  // size3 is from glyph U221A in the font KaTeX_Size3-Regular
		  return "M424," + (2398 + extraVinculum + hLinePad) + "\nc-1.3,-0.7,-38.5,-172,-111.5,-514c-73,-342,-109.8,-513.3,-110.5,-514\nc0,-2,-10.7,14.3,-32,49c-4.7,7.3,-9.8,15.7,-15.5,25c-5.7,9.3,-9.8,16,-12.5,20\ns-5,7,-5,7c-4,-3.3,-8.3,-7.7,-13,-13s-13,-13,-13,-13s76,-122,76,-122s77,-121,77,-121\ns209,968,209,968c0,-2,84.7,-361.7,254,-1079c169.3,-717.3,254.7,-1077.7,256,-1081\nl" + extraVinculum / 4.223 + " -" + extraVinculum + "c4,-6.7,10,-10,18,-10 H400000\nv" + (40 + extraVinculum) + "H1014.6\ns-87.3,378.7,-272.6,1166c-185.3,787.3,-279.3,1182.3,-282,1185\nc-2,6,-10,9,-24,9\nc-8,0,-12,-0.7,-12,-2z M" + (1001 + extraVinculum) + " " + hLinePad + "\nh400000v" + (40 + extraVinculum) + "h-400000z";
		};

		var sqrtSize4 = function sqrtSize4(extraVinculum, hLinePad) {
		  // size4 is from glyph U221A in the font KaTeX_Size4-Regular
		  return "M473," + (2713 + extraVinculum + hLinePad) + "\nc339.3,-1799.3,509.3,-2700,510,-2702 l" + extraVinculum / 5.298 + " -" + extraVinculum + "\nc3.3,-7.3,9.3,-11,18,-11 H400000v" + (40 + extraVinculum) + "H1017.7\ns-90.5,478,-276.2,1466c-185.7,988,-279.5,1483,-281.5,1485c-2,6,-10,9,-24,9\nc-8,0,-12,-0.7,-12,-2c0,-1.3,-5.3,-32,-16,-92c-50.7,-293.3,-119.7,-693.3,-207,-1200\nc0,-1.3,-5.3,8.7,-16,30c-10.7,21.3,-21.3,42.7,-32,64s-16,33,-16,33s-26,-26,-26,-26\ns76,-153,76,-153s77,-151,77,-151c0.7,0.7,35.7,202,105,604c67.3,400.7,102,602.7,104,\n606zM" + (1001 + extraVinculum) + " " + hLinePad + "h400000v" + (40 + extraVinculum) + "H1017.7z";
		};

		var phasePath = function phasePath(y) {
		  var x = y / 2; // x coordinate at top of angle

		  return "M400000 " + y + " H0 L" + x + " 0 l65 45 L145 " + (y - 80) + " H400000z";
		};

		var sqrtTall = function sqrtTall(extraVinculum, hLinePad, viewBoxHeight) {
		  // sqrtTall is from glyph U23B7 in the font KaTeX_Size4-Regular
		  // One path edge has a variable length. It runs vertically from the vinculum
		  // to a point near (14 units) the bottom of the surd. The vinculum
		  // is normally 40 units thick. So the length of the line in question is:
		  var vertSegment = viewBoxHeight - 54 - hLinePad - extraVinculum;
		  return "M702 " + (extraVinculum + hLinePad) + "H400000" + (40 + extraVinculum) + "\nH742v" + vertSegment + "l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1\nh-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170\nc-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667\n219 661 l218 661zM702 " + hLinePad + "H400000v" + (40 + extraVinculum) + "H742z";
		};

		var sqrtPath = function sqrtPath(size, extraVinculum, viewBoxHeight) {
		  extraVinculum = 1000 * extraVinculum; // Convert from document ems to viewBox.

		  var path = "";

		  switch (size) {
		    case "sqrtMain":
		      path = sqrtMain(extraVinculum, hLinePad);
		      break;

		    case "sqrtSize1":
		      path = sqrtSize1(extraVinculum, hLinePad);
		      break;

		    case "sqrtSize2":
		      path = sqrtSize2(extraVinculum, hLinePad);
		      break;

		    case "sqrtSize3":
		      path = sqrtSize3(extraVinculum, hLinePad);
		      break;

		    case "sqrtSize4":
		      path = sqrtSize4(extraVinculum, hLinePad);
		      break;

		    case "sqrtTall":
		      path = sqrtTall(extraVinculum, hLinePad, viewBoxHeight);
		  }

		  return path;
		};
		var innerPath = function innerPath(name, height) {
		  // The inner part of stretchy tall delimiters
		  switch (name) {
		    case "\u239C":
		      return "M291 0 H417 V" + height + " H291z M291 0 H417 V" + height + " H291z";

		    case "\u2223":
		      return "M145 0 H188 V" + height + " H145z M145 0 H188 V" + height + " H145z";

		    case "\u2225":
		      return "M145 0 H188 V" + height + " H145z M145 0 H188 V" + height + " H145z" + ("M367 0 H410 V" + height + " H367z M367 0 H410 V" + height + " H367z");

		    case "\u239F":
		      return "M457 0 H583 V" + height + " H457z M457 0 H583 V" + height + " H457z";

		    case "\u23A2":
		      return "M319 0 H403 V" + height + " H319z M319 0 H403 V" + height + " H319z";

		    case "\u23A5":
		      return "M263 0 H347 V" + height + " H263z M263 0 H347 V" + height + " H263z";

		    case "\u23AA":
		      return "M384 0 H504 V" + height + " H384z M384 0 H504 V" + height + " H384z";

		    case "\u23D0":
		      return "M312 0 H355 V" + height + " H312z M312 0 H355 V" + height + " H312z";

		    case "\u2016":
		      return "M257 0 H300 V" + height + " H257z M257 0 H300 V" + height + " H257z" + ("M478 0 H521 V" + height + " H478z M478 0 H521 V" + height + " H478z");

		    default:
		      return "";
		  }
		};
		var path = {
		  // The doubleleftarrow geometry is from glyph U+21D0 in the font KaTeX Main
		  doubleleftarrow: "M262 157\nl10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3\n 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28\n 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5\nc2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5\n 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87\n-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7\n-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z\nm8 0v40h399730v-40zm0 194v40h399730v-40z",
		  // doublerightarrow is from glyph U+21D2 in font KaTeX Main
		  doublerightarrow: "M399738 392l\n-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5\n 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88\n-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68\n-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18\n-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782\nc-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3\n-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z",
		  // leftarrow is from glyph U+2190 in font KaTeX Main
		  leftarrow: "M400000 241H110l3-3c68.7-52.7 113.7-120\n 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8\n-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247\nc-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208\n 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3\n 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202\n l-3-3h399890zM100 241v40h399900v-40z",
		  // overbrace is from glyphs U+23A9/23A8/23A7 in font KaTeX_Size4-Regular
		  leftbrace: "M6 548l-6-6v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117\n-45 179-50h399577v120H403c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7\n 5-6 9-10 13-.7 1-7.3 1-20 1H6z",
		  leftbraceunder: "M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13\n 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688\n 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7\n-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z",
		  // overgroup is from the MnSymbol package (public domain)
		  leftgroup: "M400000 80\nH435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0\n 435 0h399565z",
		  leftgroupunder: "M400000 262\nH435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219\n 435 219h399565z",
		  // Harpoons are from glyph U+21BD in font KaTeX Main
		  leftharpoon: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3\n-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5\n-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7\n-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z",
		  leftharpoonplus: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5\n 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3\n-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7-196 228-6.7 4.7\n-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40zM0 435v40h400000v-40z\nm0 0v40h400000v-40z",
		  leftharpoondown: "M7 241c-4 4-6.333 8.667-7 14 0 5.333.667 9 2 11s5.333\n 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667 6.333 16.333 9 17 2 .667 5\n 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21-32-87.333-82.667-157.667\n-152-211l-3-3h399907v-40zM93 281 H400000 v-40L7 241z",
		  leftharpoondownplus: "M7 435c-4 4-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12\n 10c90.7 54 156 130 196 228 3.3 10.7 6.3 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7\n-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7-157.7-152-211l-3-3h399907v-40H7zm93 0\nv40h399900v-40zM0 241v40h399900v-40zm0 0v40h399900v-40z",
		  // hook is from glyph U+21A9 in font KaTeX Main
		  lefthook: "M400000 281 H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5\n-83.5C70.8 58.2 104 47 142 47 c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3\n-68.7 15.7-86 37-10 12-15 25.3-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21\n 71.5 23h399859zM103 281v-40h399897v40z",
		  leftlinesegment: "M40 281 V428 H0 V94 H40 V241 H400000 v40z\nM40 281 V428 H0 V94 H40 V241 H400000 v40z",
		  leftmapsto: "M40 281 V448H0V74H40V241H400000v40z\nM40 281 V448H0V74H40V241H400000v40z",
		  // tofrom is from glyph U+21C4 in font KaTeX AMS Regular
		  leftToFrom: "M0 147h400000v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23\n-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8\nc28.7-32 52-65.7 70-101 10.7-23.3 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3\n 68 321 0 361zm0-174v-40h399900v40zm100 154v40h399900v-40z",
		  longequal: "M0 50 h400000 v40H0z m0 194h40000v40H0z\nM0 50 h400000 v40H0z m0 194h40000v40H0z",
		  midbrace: "M200428 334\nc-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14\n-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7\n 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11\n 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z",
		  midbraceunder: "M199572 214\nc100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14\n 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3\n 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0\n-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z",
		  oiintSize1: "M512.6 71.6c272.6 0 320.3 106.8 320.3 178.2 0 70.8-47.7 177.6\n-320.3 177.6S193.1 320.6 193.1 249.8c0-71.4 46.9-178.2 319.5-178.2z\nm368.1 178.2c0-86.4-60.9-215.4-368.1-215.4-306.4 0-367.3 129-367.3 215.4 0 85.8\n60.9 214.8 367.3 214.8 307.2 0 368.1-129 368.1-214.8z",
		  oiintSize2: "M757.8 100.1c384.7 0 451.1 137.6 451.1 230 0 91.3-66.4 228.8\n-451.1 228.8-386.3 0-452.7-137.5-452.7-228.8 0-92.4 66.4-230 452.7-230z\nm502.4 230c0-111.2-82.4-277.2-502.4-277.2s-504 166-504 277.2\nc0 110 84 276 504 276s502.4-166 502.4-276z",
		  oiiintSize1: "M681.4 71.6c408.9 0 480.5 106.8 480.5 178.2 0 70.8-71.6 177.6\n-480.5 177.6S202.1 320.6 202.1 249.8c0-71.4 70.5-178.2 479.3-178.2z\nm525.8 178.2c0-86.4-86.8-215.4-525.7-215.4-437.9 0-524.7 129-524.7 215.4 0\n85.8 86.8 214.8 524.7 214.8 438.9 0 525.7-129 525.7-214.8z",
		  oiiintSize2: "M1021.2 53c603.6 0 707.8 165.8 707.8 277.2 0 110-104.2 275.8\n-707.8 275.8-606 0-710.2-165.8-710.2-275.8C311 218.8 415.2 53 1021.2 53z\nm770.4 277.1c0-131.2-126.4-327.6-770.5-327.6S248.4 198.9 248.4 330.1\nc0 130 128.8 326.4 772.7 326.4s770.5-196.4 770.5-326.4z",
		  rightarrow: "M0 241v40h399891c-47.3 35.3-84 78-110 128\n-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20\n 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7\n 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85\n-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5\n-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67\n 151.7 139 205zm0 0v40h399900v-40z",
		  rightbrace: "M400000 542l\n-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5\ns-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1\nc124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z",
		  rightbraceunder: "M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3\n 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237\n-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z",
		  rightgroup: "M0 80h399565c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0\n 3-1 3-3v-38c-76-158-257-219-435-219H0z",
		  rightgroupunder: "M0 262h399565c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18\n 0 2 0 3 1 3 3v38c-76 158-257 219-435 219H0z",
		  rightharpoon: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3\n-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2\n-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58\n 69.2 92 94.5zm0 0v40h399900v-40z",
		  rightharpoonplus: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11\n-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7\n 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5z\nm0 0v40h399900v-40z m100 194v40h399900v-40zm0 0v40h399900v-40z",
		  rightharpoondown: "M399747 511c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8\n 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5\n-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95\n-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 241v40h399900v-40z",
		  rightharpoondownplus: "M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8\n 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3\n 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3\n-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z\nm0-194v40h400000v-40zm0 0v40h400000v-40z",
		  righthook: "M399859 241c-764 0 0 0 0 0 40-3.3 68.7-15.7 86-37 10-12 15-25.3\n 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5-23-17.3-1.3-26-8-26-20 0\n-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21 16.7 14 11.2 21 33.5 21\n 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z M0 281v-40h399859v40z",
		  rightlinesegment: "M399960 241 V94 h40 V428 h-40 V281 H0 v-40z\nM399960 241 V94 h40 V428 h-40 V281 H0 v-40z",
		  rightToFrom: "M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23\n 1 0 1.3 5.3 13.7 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32\n-52 65.7-70 101-10.7 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142\n-167z M100 147v40h399900v-40zM0 341v40h399900v-40z",
		  // twoheadleftarrow is from glyph U+219E in font KaTeX AMS Regular
		  twoheadleftarrow: "M0 167c68 40\n 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69\n-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3\n-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19\n-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101\n 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z",
		  twoheadrightarrow: "M400000 167\nc-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3\n 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42\n 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333\n-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70\n 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z",
		  // tilde1 is a modified version of a glyph from the MnSymbol package
		  tilde1: "M200 55.538c-77 0-168 73.953-177 73.953-3 0-7\n-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0\n 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0\n 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128\n-68.267.847-113-73.952-191-73.952z",
		  // ditto tilde2, tilde3, & tilde4
		  tilde2: "M344 55.266c-142 0-300.638 81.316-311.5 86.418\n-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9\n 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114\nc1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751\n 181.476 676 181.476c-149 0-189-126.21-332-126.21z",
		  tilde3: "M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457\n-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0\n 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697\n 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696\n -338 0-409-156.573-744-156.573z",
		  tilde4: "M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345\n-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409\n 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9\n 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409\n -175.236-744-175.236z",
		  // vec is from glyph U+20D7 in font KaTeX Main
		  vec: "M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5\n3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11\n10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63\n-1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1\n-7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59\nH213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359\nc-16-25.333-24-45-24-59z",
		  // widehat1 is a modified version of a glyph from the MnSymbol package
		  widehat1: "M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22\nc-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z",
		  // ditto widehat2, widehat3, & widehat4
		  widehat2: "M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
		  widehat3: "M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
		  widehat4: "M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
		  // widecheck paths are all inverted versions of widehat
		  widecheck1: "M529,159h5l519,-115c5,-1,9,-5,9,-10c0,-1,-1,-2,-1,-3l-4,-22c-1,\n-5,-5,-9,-11,-9h-2l-512,92l-513,-92h-2c-5,0,-9,4,-11,9l-5,22c-1,6,2,12,8,13z",
		  widecheck2: "M1181,220h2l1171,-176c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,153l-1167,-153h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
		  widecheck3: "M1181,280h2l1171,-236c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,213l-1167,-213h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
		  widecheck4: "M1181,340h2l1171,-296c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,273l-1167,-273h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
		  // The next ten paths support reaction arrows from the mhchem package.
		  // Arrows for \ce{<-->} are offset from xAxis by 0.22ex, per mhchem in LaTeX
		  // baraboveleftarrow is mostly from glyph U+2190 in font KaTeX Main
		  baraboveleftarrow: "M400000 620h-399890l3 -3c68.7 -52.7 113.7 -120 135 -202\nc4 -14.7 6 -23 6 -25c0 -7.3 -7 -11 -21 -11c-8 0 -13.2 0.8 -15.5 2.5\nc-2.3 1.7 -4.2 5.8 -5.5 12.5c-1.3 4.7 -2.7 10.3 -4 17c-12 48.7 -34.8 92 -68.5 130\ns-74.2 66.3 -121.5 85c-10 4 -16 7.7 -18 11c0 8.7 6 14.3 18 17c47.3 18.7 87.8 47\n121.5 85s56.5 81.3 68.5 130c0.7 2 1.3 5 2 9s1.2 6.7 1.5 8c0.3 1.3 1 3.3 2 6\ns2.2 4.5 3.5 5.5c1.3 1 3.3 1.8 6 2.5s6 1 10 1c14 0 21 -3.7 21 -11\nc0 -2 -2 -10.3 -6 -25c-20 -79.3 -65 -146.7 -135 -202l-3 -3h399890z\nM100 620v40h399900v-40z M0 241v40h399900v-40zM0 241v40h399900v-40z",
		  // rightarrowabovebar is mostly from glyph U+2192, KaTeX Main
		  rightarrowabovebar: "M0 241v40h399891c-47.3 35.3-84 78-110 128-16.7 32\n-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20 11 8 0\n13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7 39\n-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85-40.5\n-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5\n-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67\n151.7 139 205zm96 379h399894v40H0zm0 0h399904v40H0z",
		  // The short left harpoon has 0.5em (i.e. 500 units) kern on the left end.
		  // Ref from mhchem.sty: \rlap{\raisebox{-.22ex}{$\kern0.5em
		  baraboveshortleftharpoon: "M507,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11\nc1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17\nc2,0.7,5,1,9,1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21\nc-32,-87.3,-82.7,-157.7,-152,-211c0,0,-3,-3,-3,-3l399351,0l0,-40\nc-398570,0,-399437,0,-399437,0z M593 435 v40 H399500 v-40z\nM0 281 v-40 H399908 v40z M0 281 v-40 H399908 v40z",
		  rightharpoonaboveshortbar: "M0,241 l0,40c399126,0,399993,0,399993,0\nc4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,\n-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6\nc-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z\nM0 241 v40 H399908 v-40z M0 475 v-40 H399500 v40z M0 475 v-40 H399500 v40z",
		  shortbaraboveleftharpoon: "M7,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11\nc1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17c2,0.7,5,1,9,\n1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21c-32,-87.3,-82.7,-157.7,\n-152,-211c0,0,-3,-3,-3,-3l399907,0l0,-40c-399126,0,-399993,0,-399993,0z\nM93 435 v40 H400000 v-40z M500 241 v40 H400000 v-40z M500 241 v40 H400000 v-40z",
		  shortrightharpoonabovebar: "M53,241l0,40c398570,0,399437,0,399437,0\nc4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,\n-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6\nc-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z\nM500 241 v40 H399408 v-40z M500 435 v40 H400000 v-40z"
		};
		var tallDelim = function tallDelim(label, midHeight) {
		  switch (label) {
		    case "lbrack":
		      return "M403 1759 V84 H666 V0 H319 V1759 v" + midHeight + " v1759 h347 v-84\nH403z M403 1759 V0 H319 V1759 v" + midHeight + " v1759 h84z";

		    case "rbrack":
		      return "M347 1759 V0 H0 V84 H263 V1759 v" + midHeight + " v1759 H0 v84 H347z\nM347 1759 V0 H263 V1759 v" + midHeight + " v1759 h84z";

		    case "vert":
		      return "M145 15 v585 v" + midHeight + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -midHeight + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M188 15 H145 v585 v" + midHeight + " v585 h43z";

		    case "doublevert":
		      return "M145 15 v585 v" + midHeight + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -midHeight + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M188 15 H145 v585 v" + midHeight + " v585 h43z\nM367 15 v585 v" + midHeight + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -midHeight + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M410 15 H367 v585 v" + midHeight + " v585 h43z";

		    case "lfloor":
		      return "M319 602 V0 H403 V602 v" + midHeight + " v1715 h263 v84 H319z\nMM319 602 V0 H403 V602 v" + midHeight + " v1715 H319z";

		    case "rfloor":
		      return "M319 602 V0 H403 V602 v" + midHeight + " v1799 H0 v-84 H319z\nMM319 602 V0 H403 V602 v" + midHeight + " v1715 H319z";

		    case "lceil":
		      return "M403 1759 V84 H666 V0 H319 V1759 v" + midHeight + " v602 h84z\nM403 1759 V0 H319 V1759 v" + midHeight + " v602 h84z";

		    case "rceil":
		      return "M347 1759 V0 H0 V84 H263 V1759 v" + midHeight + " v602 h84z\nM347 1759 V0 h-84 V1759 v" + midHeight + " v602 h84z";

		    case "lparen":
		      return "M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1\nc-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,\n-36,557 l0," + (midHeight + 84) + "c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,\n949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9\nc0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,\n-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189\nl0,-" + (midHeight + 92) + "c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,\n-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z";

		    case "rparen":
		      return "M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,\n63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5\nc11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0," + (midHeight + 9) + "\nc-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664\nc-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11\nc0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17\nc242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558\nl0,-" + (midHeight + 144) + "c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,\n-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z";

		    default:
		      // We should not ever get here.
		      throw new Error("Unknown stretchy delimiter.");
		  }
		};


		/**
		 * This node represents a document fragment, which contains elements, but when
		 * placed into the DOM doesn't have any representation itself. It only contains
		 * children and doesn't have any DOM node properties.
		 */
		var DocumentFragment = /*#__PURE__*/function () {
		  // HtmlDomNode
		  // Never used; needed for satisfying interface.
		  function DocumentFragment(children) {
		    this.children = void 0;
		    this.classes = void 0;
		    this.height = void 0;
		    this.depth = void 0;
		    this.maxFontSize = void 0;
		    this.style = void 0;
		    this.children = children;
		    this.classes = [];
		    this.height = 0;
		    this.depth = 0;
		    this.maxFontSize = 0;
		    this.style = {};
		  }

		  var _proto = DocumentFragment.prototype;

		  _proto.hasClass = function hasClass(className) {
		    return utils.contains(this.classes, className);
		  }
		  /** Convert the fragment into a node. */
		  ;

		  _proto.toNode = function toNode() {
		    var frag = document.createDocumentFragment();

		    for (var i = 0; i < this.children.length; i++) {
		      frag.appendChild(this.children[i].toNode());
		    }

		    return frag;
		  }
		  /** Convert the fragment into HTML markup. */
		  ;

		  _proto.toMarkup = function toMarkup() {
		    var markup = ""; // Simply concatenate the markup for the children together.

		    for (var i = 0; i < this.children.length; i++) {
		      markup += this.children[i].toMarkup();
		    }

		    return markup;
		  }
		  /**
		   * Converts the math node into a string, similar to innerText. Applies to
		   * MathDomNode's only.
		   */
		  ;

		  _proto.toText = function toText() {
		    // To avoid this, we would subclass documentFragment separately for
		    // MathML, but polyfills for subclassing is expensive per PR 1469.
		    // $FlowFixMe: Only works for ChildType = MathDomNode.
		    var toText = function toText(child) {
		      return child.toText();
		    };

		    return this.children.map(toText).join("");
		  };

		  return DocumentFragment;
		}();
		// This file is GENERATED by buildMetrics.sh. DO NOT MODIFY.
		/* harmony default export */ var fontMetricsData = ({
		  "AMS-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "65": [0, 0.68889, 0, 0, 0.72222],
		    "66": [0, 0.68889, 0, 0, 0.66667],
		    "67": [0, 0.68889, 0, 0, 0.72222],
		    "68": [0, 0.68889, 0, 0, 0.72222],
		    "69": [0, 0.68889, 0, 0, 0.66667],
		    "70": [0, 0.68889, 0, 0, 0.61111],
		    "71": [0, 0.68889, 0, 0, 0.77778],
		    "72": [0, 0.68889, 0, 0, 0.77778],
		    "73": [0, 0.68889, 0, 0, 0.38889],
		    "74": [0.16667, 0.68889, 0, 0, 0.5],
		    "75": [0, 0.68889, 0, 0, 0.77778],
		    "76": [0, 0.68889, 0, 0, 0.66667],
		    "77": [0, 0.68889, 0, 0, 0.94445],
		    "78": [0, 0.68889, 0, 0, 0.72222],
		    "79": [0.16667, 0.68889, 0, 0, 0.77778],
		    "80": [0, 0.68889, 0, 0, 0.61111],
		    "81": [0.16667, 0.68889, 0, 0, 0.77778],
		    "82": [0, 0.68889, 0, 0, 0.72222],
		    "83": [0, 0.68889, 0, 0, 0.55556],
		    "84": [0, 0.68889, 0, 0, 0.66667],
		    "85": [0, 0.68889, 0, 0, 0.72222],
		    "86": [0, 0.68889, 0, 0, 0.72222],
		    "87": [0, 0.68889, 0, 0, 1.0],
		    "88": [0, 0.68889, 0, 0, 0.72222],
		    "89": [0, 0.68889, 0, 0, 0.72222],
		    "90": [0, 0.68889, 0, 0, 0.66667],
		    "107": [0, 0.68889, 0, 0, 0.55556],
		    "160": [0, 0, 0, 0, 0.25],
		    "165": [0, 0.675, 0.025, 0, 0.75],
		    "174": [0.15559, 0.69224, 0, 0, 0.94666],
		    "240": [0, 0.68889, 0, 0, 0.55556],
		    "295": [0, 0.68889, 0, 0, 0.54028],
		    "710": [0, 0.825, 0, 0, 2.33334],
		    "732": [0, 0.9, 0, 0, 2.33334],
		    "770": [0, 0.825, 0, 0, 2.33334],
		    "771": [0, 0.9, 0, 0, 2.33334],
		    "989": [0.08167, 0.58167, 0, 0, 0.77778],
		    "1008": [0, 0.43056, 0.04028, 0, 0.66667],
		    "8245": [0, 0.54986, 0, 0, 0.275],
		    "8463": [0, 0.68889, 0, 0, 0.54028],
		    "8487": [0, 0.68889, 0, 0, 0.72222],
		    "8498": [0, 0.68889, 0, 0, 0.55556],
		    "8502": [0, 0.68889, 0, 0, 0.66667],
		    "8503": [0, 0.68889, 0, 0, 0.44445],
		    "8504": [0, 0.68889, 0, 0, 0.66667],
		    "8513": [0, 0.68889, 0, 0, 0.63889],
		    "8592": [-0.03598, 0.46402, 0, 0, 0.5],
		    "8594": [-0.03598, 0.46402, 0, 0, 0.5],
		    "8602": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8603": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8606": [0.01354, 0.52239, 0, 0, 1.0],
		    "8608": [0.01354, 0.52239, 0, 0, 1.0],
		    "8610": [0.01354, 0.52239, 0, 0, 1.11111],
		    "8611": [0.01354, 0.52239, 0, 0, 1.11111],
		    "8619": [0, 0.54986, 0, 0, 1.0],
		    "8620": [0, 0.54986, 0, 0, 1.0],
		    "8621": [-0.13313, 0.37788, 0, 0, 1.38889],
		    "8622": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8624": [0, 0.69224, 0, 0, 0.5],
		    "8625": [0, 0.69224, 0, 0, 0.5],
		    "8630": [0, 0.43056, 0, 0, 1.0],
		    "8631": [0, 0.43056, 0, 0, 1.0],
		    "8634": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8635": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8638": [0.19444, 0.69224, 0, 0, 0.41667],
		    "8639": [0.19444, 0.69224, 0, 0, 0.41667],
		    "8642": [0.19444, 0.69224, 0, 0, 0.41667],
		    "8643": [0.19444, 0.69224, 0, 0, 0.41667],
		    "8644": [0.1808, 0.675, 0, 0, 1.0],
		    "8646": [0.1808, 0.675, 0, 0, 1.0],
		    "8647": [0.1808, 0.675, 0, 0, 1.0],
		    "8648": [0.19444, 0.69224, 0, 0, 0.83334],
		    "8649": [0.1808, 0.675, 0, 0, 1.0],
		    "8650": [0.19444, 0.69224, 0, 0, 0.83334],
		    "8651": [0.01354, 0.52239, 0, 0, 1.0],
		    "8652": [0.01354, 0.52239, 0, 0, 1.0],
		    "8653": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8654": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8655": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8666": [0.13667, 0.63667, 0, 0, 1.0],
		    "8667": [0.13667, 0.63667, 0, 0, 1.0],
		    "8669": [-0.13313, 0.37788, 0, 0, 1.0],
		    "8672": [-0.064, 0.437, 0, 0, 1.334],
		    "8674": [-0.064, 0.437, 0, 0, 1.334],
		    "8705": [0, 0.825, 0, 0, 0.5],
		    "8708": [0, 0.68889, 0, 0, 0.55556],
		    "8709": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8717": [0, 0.43056, 0, 0, 0.42917],
		    "8722": [-0.03598, 0.46402, 0, 0, 0.5],
		    "8724": [0.08198, 0.69224, 0, 0, 0.77778],
		    "8726": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8733": [0, 0.69224, 0, 0, 0.77778],
		    "8736": [0, 0.69224, 0, 0, 0.72222],
		    "8737": [0, 0.69224, 0, 0, 0.72222],
		    "8738": [0.03517, 0.52239, 0, 0, 0.72222],
		    "8739": [0.08167, 0.58167, 0, 0, 0.22222],
		    "8740": [0.25142, 0.74111, 0, 0, 0.27778],
		    "8741": [0.08167, 0.58167, 0, 0, 0.38889],
		    "8742": [0.25142, 0.74111, 0, 0, 0.5],
		    "8756": [0, 0.69224, 0, 0, 0.66667],
		    "8757": [0, 0.69224, 0, 0, 0.66667],
		    "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
		    "8765": [-0.13313, 0.37788, 0, 0, 0.77778],
		    "8769": [-0.13313, 0.36687, 0, 0, 0.77778],
		    "8770": [-0.03625, 0.46375, 0, 0, 0.77778],
		    "8774": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
		    "8778": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8782": [0.06062, 0.54986, 0, 0, 0.77778],
		    "8783": [0.06062, 0.54986, 0, 0, 0.77778],
		    "8785": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8786": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8787": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8790": [0, 0.69224, 0, 0, 0.77778],
		    "8791": [0.22958, 0.72958, 0, 0, 0.77778],
		    "8796": [0.08198, 0.91667, 0, 0, 0.77778],
		    "8806": [0.25583, 0.75583, 0, 0, 0.77778],
		    "8807": [0.25583, 0.75583, 0, 0, 0.77778],
		    "8808": [0.25142, 0.75726, 0, 0, 0.77778],
		    "8809": [0.25142, 0.75726, 0, 0, 0.77778],
		    "8812": [0.25583, 0.75583, 0, 0, 0.5],
		    "8814": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8815": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8816": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8817": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8818": [0.22958, 0.72958, 0, 0, 0.77778],
		    "8819": [0.22958, 0.72958, 0, 0, 0.77778],
		    "8822": [0.1808, 0.675, 0, 0, 0.77778],
		    "8823": [0.1808, 0.675, 0, 0, 0.77778],
		    "8828": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8829": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8830": [0.22958, 0.72958, 0, 0, 0.77778],
		    "8831": [0.22958, 0.72958, 0, 0, 0.77778],
		    "8832": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8833": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8840": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8841": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8842": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8843": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8847": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8848": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8858": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8859": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8861": [0.08198, 0.58198, 0, 0, 0.77778],
		    "8862": [0, 0.675, 0, 0, 0.77778],
		    "8863": [0, 0.675, 0, 0, 0.77778],
		    "8864": [0, 0.675, 0, 0, 0.77778],
		    "8865": [0, 0.675, 0, 0, 0.77778],
		    "8872": [0, 0.69224, 0, 0, 0.61111],
		    "8873": [0, 0.69224, 0, 0, 0.72222],
		    "8874": [0, 0.69224, 0, 0, 0.88889],
		    "8876": [0, 0.68889, 0, 0, 0.61111],
		    "8877": [0, 0.68889, 0, 0, 0.61111],
		    "8878": [0, 0.68889, 0, 0, 0.72222],
		    "8879": [0, 0.68889, 0, 0, 0.72222],
		    "8882": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8883": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8884": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8885": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8888": [0, 0.54986, 0, 0, 1.11111],
		    "8890": [0.19444, 0.43056, 0, 0, 0.55556],
		    "8891": [0.19444, 0.69224, 0, 0, 0.61111],
		    "8892": [0.19444, 0.69224, 0, 0, 0.61111],
		    "8901": [0, 0.54986, 0, 0, 0.27778],
		    "8903": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8905": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8906": [0.08167, 0.58167, 0, 0, 0.77778],
		    "8907": [0, 0.69224, 0, 0, 0.77778],
		    "8908": [0, 0.69224, 0, 0, 0.77778],
		    "8909": [-0.03598, 0.46402, 0, 0, 0.77778],
		    "8910": [0, 0.54986, 0, 0, 0.76042],
		    "8911": [0, 0.54986, 0, 0, 0.76042],
		    "8912": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8913": [0.03517, 0.54986, 0, 0, 0.77778],
		    "8914": [0, 0.54986, 0, 0, 0.66667],
		    "8915": [0, 0.54986, 0, 0, 0.66667],
		    "8916": [0, 0.69224, 0, 0, 0.66667],
		    "8918": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8919": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8920": [0.03517, 0.54986, 0, 0, 1.33334],
		    "8921": [0.03517, 0.54986, 0, 0, 1.33334],
		    "8922": [0.38569, 0.88569, 0, 0, 0.77778],
		    "8923": [0.38569, 0.88569, 0, 0, 0.77778],
		    "8926": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8927": [0.13667, 0.63667, 0, 0, 0.77778],
		    "8928": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8929": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8934": [0.23222, 0.74111, 0, 0, 0.77778],
		    "8935": [0.23222, 0.74111, 0, 0, 0.77778],
		    "8936": [0.23222, 0.74111, 0, 0, 0.77778],
		    "8937": [0.23222, 0.74111, 0, 0, 0.77778],
		    "8938": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8939": [0.20576, 0.70576, 0, 0, 0.77778],
		    "8940": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8941": [0.30274, 0.79383, 0, 0, 0.77778],
		    "8994": [0.19444, 0.69224, 0, 0, 0.77778],
		    "8995": [0.19444, 0.69224, 0, 0, 0.77778],
		    "9416": [0.15559, 0.69224, 0, 0, 0.90222],
		    "9484": [0, 0.69224, 0, 0, 0.5],
		    "9488": [0, 0.69224, 0, 0, 0.5],
		    "9492": [0, 0.37788, 0, 0, 0.5],
		    "9496": [0, 0.37788, 0, 0, 0.5],
		    "9585": [0.19444, 0.68889, 0, 0, 0.88889],
		    "9586": [0.19444, 0.74111, 0, 0, 0.88889],
		    "9632": [0, 0.675, 0, 0, 0.77778],
		    "9633": [0, 0.675, 0, 0, 0.77778],
		    "9650": [0, 0.54986, 0, 0, 0.72222],
		    "9651": [0, 0.54986, 0, 0, 0.72222],
		    "9654": [0.03517, 0.54986, 0, 0, 0.77778],
		    "9660": [0, 0.54986, 0, 0, 0.72222],
		    "9661": [0, 0.54986, 0, 0, 0.72222],
		    "9664": [0.03517, 0.54986, 0, 0, 0.77778],
		    "9674": [0.11111, 0.69224, 0, 0, 0.66667],
		    "9733": [0.19444, 0.69224, 0, 0, 0.94445],
		    "10003": [0, 0.69224, 0, 0, 0.83334],
		    "10016": [0, 0.69224, 0, 0, 0.83334],
		    "10731": [0.11111, 0.69224, 0, 0, 0.66667],
		    "10846": [0.19444, 0.75583, 0, 0, 0.61111],
		    "10877": [0.13667, 0.63667, 0, 0, 0.77778],
		    "10878": [0.13667, 0.63667, 0, 0, 0.77778],
		    "10885": [0.25583, 0.75583, 0, 0, 0.77778],
		    "10886": [0.25583, 0.75583, 0, 0, 0.77778],
		    "10887": [0.13597, 0.63597, 0, 0, 0.77778],
		    "10888": [0.13597, 0.63597, 0, 0, 0.77778],
		    "10889": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10890": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10891": [0.48256, 0.98256, 0, 0, 0.77778],
		    "10892": [0.48256, 0.98256, 0, 0, 0.77778],
		    "10901": [0.13667, 0.63667, 0, 0, 0.77778],
		    "10902": [0.13667, 0.63667, 0, 0, 0.77778],
		    "10933": [0.25142, 0.75726, 0, 0, 0.77778],
		    "10934": [0.25142, 0.75726, 0, 0, 0.77778],
		    "10935": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10936": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10937": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10938": [0.26167, 0.75726, 0, 0, 0.77778],
		    "10949": [0.25583, 0.75583, 0, 0, 0.77778],
		    "10950": [0.25583, 0.75583, 0, 0, 0.77778],
		    "10955": [0.28481, 0.79383, 0, 0, 0.77778],
		    "10956": [0.28481, 0.79383, 0, 0, 0.77778],
		    "57350": [0.08167, 0.58167, 0, 0, 0.22222],
		    "57351": [0.08167, 0.58167, 0, 0, 0.38889],
		    "57352": [0.08167, 0.58167, 0, 0, 0.77778],
		    "57353": [0, 0.43056, 0.04028, 0, 0.66667],
		    "57356": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57357": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57358": [0.41951, 0.91951, 0, 0, 0.77778],
		    "57359": [0.30274, 0.79383, 0, 0, 0.77778],
		    "57360": [0.30274, 0.79383, 0, 0, 0.77778],
		    "57361": [0.41951, 0.91951, 0, 0, 0.77778],
		    "57366": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57367": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57368": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57369": [0.25142, 0.75726, 0, 0, 0.77778],
		    "57370": [0.13597, 0.63597, 0, 0, 0.77778],
		    "57371": [0.13597, 0.63597, 0, 0, 0.77778]
		  },
		  "Caligraphic-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "65": [0, 0.68333, 0, 0.19445, 0.79847],
		    "66": [0, 0.68333, 0.03041, 0.13889, 0.65681],
		    "67": [0, 0.68333, 0.05834, 0.13889, 0.52653],
		    "68": [0, 0.68333, 0.02778, 0.08334, 0.77139],
		    "69": [0, 0.68333, 0.08944, 0.11111, 0.52778],
		    "70": [0, 0.68333, 0.09931, 0.11111, 0.71875],
		    "71": [0.09722, 0.68333, 0.0593, 0.11111, 0.59487],
		    "72": [0, 0.68333, 0.00965, 0.11111, 0.84452],
		    "73": [0, 0.68333, 0.07382, 0, 0.54452],
		    "74": [0.09722, 0.68333, 0.18472, 0.16667, 0.67778],
		    "75": [0, 0.68333, 0.01445, 0.05556, 0.76195],
		    "76": [0, 0.68333, 0, 0.13889, 0.68972],
		    "77": [0, 0.68333, 0, 0.13889, 1.2009],
		    "78": [0, 0.68333, 0.14736, 0.08334, 0.82049],
		    "79": [0, 0.68333, 0.02778, 0.11111, 0.79611],
		    "80": [0, 0.68333, 0.08222, 0.08334, 0.69556],
		    "81": [0.09722, 0.68333, 0, 0.11111, 0.81667],
		    "82": [0, 0.68333, 0, 0.08334, 0.8475],
		    "83": [0, 0.68333, 0.075, 0.13889, 0.60556],
		    "84": [0, 0.68333, 0.25417, 0, 0.54464],
		    "85": [0, 0.68333, 0.09931, 0.08334, 0.62583],
		    "86": [0, 0.68333, 0.08222, 0, 0.61278],
		    "87": [0, 0.68333, 0.08222, 0.08334, 0.98778],
		    "88": [0, 0.68333, 0.14643, 0.13889, 0.7133],
		    "89": [0.09722, 0.68333, 0.08222, 0.08334, 0.66834],
		    "90": [0, 0.68333, 0.07944, 0.13889, 0.72473],
		    "160": [0, 0, 0, 0, 0.25]
		  },
		  "Fraktur-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69141, 0, 0, 0.29574],
		    "34": [0, 0.69141, 0, 0, 0.21471],
		    "38": [0, 0.69141, 0, 0, 0.73786],
		    "39": [0, 0.69141, 0, 0, 0.21201],
		    "40": [0.24982, 0.74947, 0, 0, 0.38865],
		    "41": [0.24982, 0.74947, 0, 0, 0.38865],
		    "42": [0, 0.62119, 0, 0, 0.27764],
		    "43": [0.08319, 0.58283, 0, 0, 0.75623],
		    "44": [0, 0.10803, 0, 0, 0.27764],
		    "45": [0.08319, 0.58283, 0, 0, 0.75623],
		    "46": [0, 0.10803, 0, 0, 0.27764],
		    "47": [0.24982, 0.74947, 0, 0, 0.50181],
		    "48": [0, 0.47534, 0, 0, 0.50181],
		    "49": [0, 0.47534, 0, 0, 0.50181],
		    "50": [0, 0.47534, 0, 0, 0.50181],
		    "51": [0.18906, 0.47534, 0, 0, 0.50181],
		    "52": [0.18906, 0.47534, 0, 0, 0.50181],
		    "53": [0.18906, 0.47534, 0, 0, 0.50181],
		    "54": [0, 0.69141, 0, 0, 0.50181],
		    "55": [0.18906, 0.47534, 0, 0, 0.50181],
		    "56": [0, 0.69141, 0, 0, 0.50181],
		    "57": [0.18906, 0.47534, 0, 0, 0.50181],
		    "58": [0, 0.47534, 0, 0, 0.21606],
		    "59": [0.12604, 0.47534, 0, 0, 0.21606],
		    "61": [-0.13099, 0.36866, 0, 0, 0.75623],
		    "63": [0, 0.69141, 0, 0, 0.36245],
		    "65": [0, 0.69141, 0, 0, 0.7176],
		    "66": [0, 0.69141, 0, 0, 0.88397],
		    "67": [0, 0.69141, 0, 0, 0.61254],
		    "68": [0, 0.69141, 0, 0, 0.83158],
		    "69": [0, 0.69141, 0, 0, 0.66278],
		    "70": [0.12604, 0.69141, 0, 0, 0.61119],
		    "71": [0, 0.69141, 0, 0, 0.78539],
		    "72": [0.06302, 0.69141, 0, 0, 0.7203],
		    "73": [0, 0.69141, 0, 0, 0.55448],
		    "74": [0.12604, 0.69141, 0, 0, 0.55231],
		    "75": [0, 0.69141, 0, 0, 0.66845],
		    "76": [0, 0.69141, 0, 0, 0.66602],
		    "77": [0, 0.69141, 0, 0, 1.04953],
		    "78": [0, 0.69141, 0, 0, 0.83212],
		    "79": [0, 0.69141, 0, 0, 0.82699],
		    "80": [0.18906, 0.69141, 0, 0, 0.82753],
		    "81": [0.03781, 0.69141, 0, 0, 0.82699],
		    "82": [0, 0.69141, 0, 0, 0.82807],
		    "83": [0, 0.69141, 0, 0, 0.82861],
		    "84": [0, 0.69141, 0, 0, 0.66899],
		    "85": [0, 0.69141, 0, 0, 0.64576],
		    "86": [0, 0.69141, 0, 0, 0.83131],
		    "87": [0, 0.69141, 0, 0, 1.04602],
		    "88": [0, 0.69141, 0, 0, 0.71922],
		    "89": [0.18906, 0.69141, 0, 0, 0.83293],
		    "90": [0.12604, 0.69141, 0, 0, 0.60201],
		    "91": [0.24982, 0.74947, 0, 0, 0.27764],
		    "93": [0.24982, 0.74947, 0, 0, 0.27764],
		    "94": [0, 0.69141, 0, 0, 0.49965],
		    "97": [0, 0.47534, 0, 0, 0.50046],
		    "98": [0, 0.69141, 0, 0, 0.51315],
		    "99": [0, 0.47534, 0, 0, 0.38946],
		    "100": [0, 0.62119, 0, 0, 0.49857],
		    "101": [0, 0.47534, 0, 0, 0.40053],
		    "102": [0.18906, 0.69141, 0, 0, 0.32626],
		    "103": [0.18906, 0.47534, 0, 0, 0.5037],
		    "104": [0.18906, 0.69141, 0, 0, 0.52126],
		    "105": [0, 0.69141, 0, 0, 0.27899],
		    "106": [0, 0.69141, 0, 0, 0.28088],
		    "107": [0, 0.69141, 0, 0, 0.38946],
		    "108": [0, 0.69141, 0, 0, 0.27953],
		    "109": [0, 0.47534, 0, 0, 0.76676],
		    "110": [0, 0.47534, 0, 0, 0.52666],
		    "111": [0, 0.47534, 0, 0, 0.48885],
		    "112": [0.18906, 0.52396, 0, 0, 0.50046],
		    "113": [0.18906, 0.47534, 0, 0, 0.48912],
		    "114": [0, 0.47534, 0, 0, 0.38919],
		    "115": [0, 0.47534, 0, 0, 0.44266],
		    "116": [0, 0.62119, 0, 0, 0.33301],
		    "117": [0, 0.47534, 0, 0, 0.5172],
		    "118": [0, 0.52396, 0, 0, 0.5118],
		    "119": [0, 0.52396, 0, 0, 0.77351],
		    "120": [0.18906, 0.47534, 0, 0, 0.38865],
		    "121": [0.18906, 0.47534, 0, 0, 0.49884],
		    "122": [0.18906, 0.47534, 0, 0, 0.39054],
		    "160": [0, 0, 0, 0, 0.25],
		    "8216": [0, 0.69141, 0, 0, 0.21471],
		    "8217": [0, 0.69141, 0, 0, 0.21471],
		    "58112": [0, 0.62119, 0, 0, 0.49749],
		    "58113": [0, 0.62119, 0, 0, 0.4983],
		    "58114": [0.18906, 0.69141, 0, 0, 0.33328],
		    "58115": [0.18906, 0.69141, 0, 0, 0.32923],
		    "58116": [0.18906, 0.47534, 0, 0, 0.50343],
		    "58117": [0, 0.69141, 0, 0, 0.33301],
		    "58118": [0, 0.62119, 0, 0, 0.33409],
		    "58119": [0, 0.47534, 0, 0, 0.50073]
		  },
		  "Main-Bold": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0, 0, 0.35],
		    "34": [0, 0.69444, 0, 0, 0.60278],
		    "35": [0.19444, 0.69444, 0, 0, 0.95833],
		    "36": [0.05556, 0.75, 0, 0, 0.575],
		    "37": [0.05556, 0.75, 0, 0, 0.95833],
		    "38": [0, 0.69444, 0, 0, 0.89444],
		    "39": [0, 0.69444, 0, 0, 0.31944],
		    "40": [0.25, 0.75, 0, 0, 0.44722],
		    "41": [0.25, 0.75, 0, 0, 0.44722],
		    "42": [0, 0.75, 0, 0, 0.575],
		    "43": [0.13333, 0.63333, 0, 0, 0.89444],
		    "44": [0.19444, 0.15556, 0, 0, 0.31944],
		    "45": [0, 0.44444, 0, 0, 0.38333],
		    "46": [0, 0.15556, 0, 0, 0.31944],
		    "47": [0.25, 0.75, 0, 0, 0.575],
		    "48": [0, 0.64444, 0, 0, 0.575],
		    "49": [0, 0.64444, 0, 0, 0.575],
		    "50": [0, 0.64444, 0, 0, 0.575],
		    "51": [0, 0.64444, 0, 0, 0.575],
		    "52": [0, 0.64444, 0, 0, 0.575],
		    "53": [0, 0.64444, 0, 0, 0.575],
		    "54": [0, 0.64444, 0, 0, 0.575],
		    "55": [0, 0.64444, 0, 0, 0.575],
		    "56": [0, 0.64444, 0, 0, 0.575],
		    "57": [0, 0.64444, 0, 0, 0.575],
		    "58": [0, 0.44444, 0, 0, 0.31944],
		    "59": [0.19444, 0.44444, 0, 0, 0.31944],
		    "60": [0.08556, 0.58556, 0, 0, 0.89444],
		    "61": [-0.10889, 0.39111, 0, 0, 0.89444],
		    "62": [0.08556, 0.58556, 0, 0, 0.89444],
		    "63": [0, 0.69444, 0, 0, 0.54305],
		    "64": [0, 0.69444, 0, 0, 0.89444],
		    "65": [0, 0.68611, 0, 0, 0.86944],
		    "66": [0, 0.68611, 0, 0, 0.81805],
		    "67": [0, 0.68611, 0, 0, 0.83055],
		    "68": [0, 0.68611, 0, 0, 0.88194],
		    "69": [0, 0.68611, 0, 0, 0.75555],
		    "70": [0, 0.68611, 0, 0, 0.72361],
		    "71": [0, 0.68611, 0, 0, 0.90416],
		    "72": [0, 0.68611, 0, 0, 0.9],
		    "73": [0, 0.68611, 0, 0, 0.43611],
		    "74": [0, 0.68611, 0, 0, 0.59444],
		    "75": [0, 0.68611, 0, 0, 0.90138],
		    "76": [0, 0.68611, 0, 0, 0.69166],
		    "77": [0, 0.68611, 0, 0, 1.09166],
		    "78": [0, 0.68611, 0, 0, 0.9],
		    "79": [0, 0.68611, 0, 0, 0.86388],
		    "80": [0, 0.68611, 0, 0, 0.78611],
		    "81": [0.19444, 0.68611, 0, 0, 0.86388],
		    "82": [0, 0.68611, 0, 0, 0.8625],
		    "83": [0, 0.68611, 0, 0, 0.63889],
		    "84": [0, 0.68611, 0, 0, 0.8],
		    "85": [0, 0.68611, 0, 0, 0.88472],
		    "86": [0, 0.68611, 0.01597, 0, 0.86944],
		    "87": [0, 0.68611, 0.01597, 0, 1.18888],
		    "88": [0, 0.68611, 0, 0, 0.86944],
		    "89": [0, 0.68611, 0.02875, 0, 0.86944],
		    "90": [0, 0.68611, 0, 0, 0.70277],
		    "91": [0.25, 0.75, 0, 0, 0.31944],
		    "92": [0.25, 0.75, 0, 0, 0.575],
		    "93": [0.25, 0.75, 0, 0, 0.31944],
		    "94": [0, 0.69444, 0, 0, 0.575],
		    "95": [0.31, 0.13444, 0.03194, 0, 0.575],
		    "97": [0, 0.44444, 0, 0, 0.55902],
		    "98": [0, 0.69444, 0, 0, 0.63889],
		    "99": [0, 0.44444, 0, 0, 0.51111],
		    "100": [0, 0.69444, 0, 0, 0.63889],
		    "101": [0, 0.44444, 0, 0, 0.52708],
		    "102": [0, 0.69444, 0.10903, 0, 0.35139],
		    "103": [0.19444, 0.44444, 0.01597, 0, 0.575],
		    "104": [0, 0.69444, 0, 0, 0.63889],
		    "105": [0, 0.69444, 0, 0, 0.31944],
		    "106": [0.19444, 0.69444, 0, 0, 0.35139],
		    "107": [0, 0.69444, 0, 0, 0.60694],
		    "108": [0, 0.69444, 0, 0, 0.31944],
		    "109": [0, 0.44444, 0, 0, 0.95833],
		    "110": [0, 0.44444, 0, 0, 0.63889],
		    "111": [0, 0.44444, 0, 0, 0.575],
		    "112": [0.19444, 0.44444, 0, 0, 0.63889],
		    "113": [0.19444, 0.44444, 0, 0, 0.60694],
		    "114": [0, 0.44444, 0, 0, 0.47361],
		    "115": [0, 0.44444, 0, 0, 0.45361],
		    "116": [0, 0.63492, 0, 0, 0.44722],
		    "117": [0, 0.44444, 0, 0, 0.63889],
		    "118": [0, 0.44444, 0.01597, 0, 0.60694],
		    "119": [0, 0.44444, 0.01597, 0, 0.83055],
		    "120": [0, 0.44444, 0, 0, 0.60694],
		    "121": [0.19444, 0.44444, 0.01597, 0, 0.60694],
		    "122": [0, 0.44444, 0, 0, 0.51111],
		    "123": [0.25, 0.75, 0, 0, 0.575],
		    "124": [0.25, 0.75, 0, 0, 0.31944],
		    "125": [0.25, 0.75, 0, 0, 0.575],
		    "126": [0.35, 0.34444, 0, 0, 0.575],
		    "160": [0, 0, 0, 0, 0.25],
		    "163": [0, 0.69444, 0, 0, 0.86853],
		    "168": [0, 0.69444, 0, 0, 0.575],
		    "172": [0, 0.44444, 0, 0, 0.76666],
		    "176": [0, 0.69444, 0, 0, 0.86944],
		    "177": [0.13333, 0.63333, 0, 0, 0.89444],
		    "184": [0.17014, 0, 0, 0, 0.51111],
		    "198": [0, 0.68611, 0, 0, 1.04166],
		    "215": [0.13333, 0.63333, 0, 0, 0.89444],
		    "216": [0.04861, 0.73472, 0, 0, 0.89444],
		    "223": [0, 0.69444, 0, 0, 0.59722],
		    "230": [0, 0.44444, 0, 0, 0.83055],
		    "247": [0.13333, 0.63333, 0, 0, 0.89444],
		    "248": [0.09722, 0.54167, 0, 0, 0.575],
		    "305": [0, 0.44444, 0, 0, 0.31944],
		    "338": [0, 0.68611, 0, 0, 1.16944],
		    "339": [0, 0.44444, 0, 0, 0.89444],
		    "567": [0.19444, 0.44444, 0, 0, 0.35139],
		    "710": [0, 0.69444, 0, 0, 0.575],
		    "711": [0, 0.63194, 0, 0, 0.575],
		    "713": [0, 0.59611, 0, 0, 0.575],
		    "714": [0, 0.69444, 0, 0, 0.575],
		    "715": [0, 0.69444, 0, 0, 0.575],
		    "728": [0, 0.69444, 0, 0, 0.575],
		    "729": [0, 0.69444, 0, 0, 0.31944],
		    "730": [0, 0.69444, 0, 0, 0.86944],
		    "732": [0, 0.69444, 0, 0, 0.575],
		    "733": [0, 0.69444, 0, 0, 0.575],
		    "915": [0, 0.68611, 0, 0, 0.69166],
		    "916": [0, 0.68611, 0, 0, 0.95833],
		    "920": [0, 0.68611, 0, 0, 0.89444],
		    "923": [0, 0.68611, 0, 0, 0.80555],
		    "926": [0, 0.68611, 0, 0, 0.76666],
		    "928": [0, 0.68611, 0, 0, 0.9],
		    "931": [0, 0.68611, 0, 0, 0.83055],
		    "933": [0, 0.68611, 0, 0, 0.89444],
		    "934": [0, 0.68611, 0, 0, 0.83055],
		    "936": [0, 0.68611, 0, 0, 0.89444],
		    "937": [0, 0.68611, 0, 0, 0.83055],
		    "8211": [0, 0.44444, 0.03194, 0, 0.575],
		    "8212": [0, 0.44444, 0.03194, 0, 1.14999],
		    "8216": [0, 0.69444, 0, 0, 0.31944],
		    "8217": [0, 0.69444, 0, 0, 0.31944],
		    "8220": [0, 0.69444, 0, 0, 0.60278],
		    "8221": [0, 0.69444, 0, 0, 0.60278],
		    "8224": [0.19444, 0.69444, 0, 0, 0.51111],
		    "8225": [0.19444, 0.69444, 0, 0, 0.51111],
		    "8242": [0, 0.55556, 0, 0, 0.34444],
		    "8407": [0, 0.72444, 0.15486, 0, 0.575],
		    "8463": [0, 0.69444, 0, 0, 0.66759],
		    "8465": [0, 0.69444, 0, 0, 0.83055],
		    "8467": [0, 0.69444, 0, 0, 0.47361],
		    "8472": [0.19444, 0.44444, 0, 0, 0.74027],
		    "8476": [0, 0.69444, 0, 0, 0.83055],
		    "8501": [0, 0.69444, 0, 0, 0.70277],
		    "8592": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8593": [0.19444, 0.69444, 0, 0, 0.575],
		    "8594": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8595": [0.19444, 0.69444, 0, 0, 0.575],
		    "8596": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8597": [0.25, 0.75, 0, 0, 0.575],
		    "8598": [0.19444, 0.69444, 0, 0, 1.14999],
		    "8599": [0.19444, 0.69444, 0, 0, 1.14999],
		    "8600": [0.19444, 0.69444, 0, 0, 1.14999],
		    "8601": [0.19444, 0.69444, 0, 0, 1.14999],
		    "8636": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8637": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8640": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8641": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8656": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8657": [0.19444, 0.69444, 0, 0, 0.70277],
		    "8658": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8659": [0.19444, 0.69444, 0, 0, 0.70277],
		    "8660": [-0.10889, 0.39111, 0, 0, 1.14999],
		    "8661": [0.25, 0.75, 0, 0, 0.70277],
		    "8704": [0, 0.69444, 0, 0, 0.63889],
		    "8706": [0, 0.69444, 0.06389, 0, 0.62847],
		    "8707": [0, 0.69444, 0, 0, 0.63889],
		    "8709": [0.05556, 0.75, 0, 0, 0.575],
		    "8711": [0, 0.68611, 0, 0, 0.95833],
		    "8712": [0.08556, 0.58556, 0, 0, 0.76666],
		    "8715": [0.08556, 0.58556, 0, 0, 0.76666],
		    "8722": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8723": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8725": [0.25, 0.75, 0, 0, 0.575],
		    "8726": [0.25, 0.75, 0, 0, 0.575],
		    "8727": [-0.02778, 0.47222, 0, 0, 0.575],
		    "8728": [-0.02639, 0.47361, 0, 0, 0.575],
		    "8729": [-0.02639, 0.47361, 0, 0, 0.575],
		    "8730": [0.18, 0.82, 0, 0, 0.95833],
		    "8733": [0, 0.44444, 0, 0, 0.89444],
		    "8734": [0, 0.44444, 0, 0, 1.14999],
		    "8736": [0, 0.69224, 0, 0, 0.72222],
		    "8739": [0.25, 0.75, 0, 0, 0.31944],
		    "8741": [0.25, 0.75, 0, 0, 0.575],
		    "8743": [0, 0.55556, 0, 0, 0.76666],
		    "8744": [0, 0.55556, 0, 0, 0.76666],
		    "8745": [0, 0.55556, 0, 0, 0.76666],
		    "8746": [0, 0.55556, 0, 0, 0.76666],
		    "8747": [0.19444, 0.69444, 0.12778, 0, 0.56875],
		    "8764": [-0.10889, 0.39111, 0, 0, 0.89444],
		    "8768": [0.19444, 0.69444, 0, 0, 0.31944],
		    "8771": [0.00222, 0.50222, 0, 0, 0.89444],
		    "8773": [0.027, 0.638, 0, 0, 0.894],
		    "8776": [0.02444, 0.52444, 0, 0, 0.89444],
		    "8781": [0.00222, 0.50222, 0, 0, 0.89444],
		    "8801": [0.00222, 0.50222, 0, 0, 0.89444],
		    "8804": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8805": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8810": [0.08556, 0.58556, 0, 0, 1.14999],
		    "8811": [0.08556, 0.58556, 0, 0, 1.14999],
		    "8826": [0.08556, 0.58556, 0, 0, 0.89444],
		    "8827": [0.08556, 0.58556, 0, 0, 0.89444],
		    "8834": [0.08556, 0.58556, 0, 0, 0.89444],
		    "8835": [0.08556, 0.58556, 0, 0, 0.89444],
		    "8838": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8839": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8846": [0, 0.55556, 0, 0, 0.76666],
		    "8849": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8850": [0.19667, 0.69667, 0, 0, 0.89444],
		    "8851": [0, 0.55556, 0, 0, 0.76666],
		    "8852": [0, 0.55556, 0, 0, 0.76666],
		    "8853": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8854": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8855": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8856": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8857": [0.13333, 0.63333, 0, 0, 0.89444],
		    "8866": [0, 0.69444, 0, 0, 0.70277],
		    "8867": [0, 0.69444, 0, 0, 0.70277],
		    "8868": [0, 0.69444, 0, 0, 0.89444],
		    "8869": [0, 0.69444, 0, 0, 0.89444],
		    "8900": [-0.02639, 0.47361, 0, 0, 0.575],
		    "8901": [-0.02639, 0.47361, 0, 0, 0.31944],
		    "8902": [-0.02778, 0.47222, 0, 0, 0.575],
		    "8968": [0.25, 0.75, 0, 0, 0.51111],
		    "8969": [0.25, 0.75, 0, 0, 0.51111],
		    "8970": [0.25, 0.75, 0, 0, 0.51111],
		    "8971": [0.25, 0.75, 0, 0, 0.51111],
		    "8994": [-0.13889, 0.36111, 0, 0, 1.14999],
		    "8995": [-0.13889, 0.36111, 0, 0, 1.14999],
		    "9651": [0.19444, 0.69444, 0, 0, 1.02222],
		    "9657": [-0.02778, 0.47222, 0, 0, 0.575],
		    "9661": [0.19444, 0.69444, 0, 0, 1.02222],
		    "9667": [-0.02778, 0.47222, 0, 0, 0.575],
		    "9711": [0.19444, 0.69444, 0, 0, 1.14999],
		    "9824": [0.12963, 0.69444, 0, 0, 0.89444],
		    "9825": [0.12963, 0.69444, 0, 0, 0.89444],
		    "9826": [0.12963, 0.69444, 0, 0, 0.89444],
		    "9827": [0.12963, 0.69444, 0, 0, 0.89444],
		    "9837": [0, 0.75, 0, 0, 0.44722],
		    "9838": [0.19444, 0.69444, 0, 0, 0.44722],
		    "9839": [0.19444, 0.69444, 0, 0, 0.44722],
		    "10216": [0.25, 0.75, 0, 0, 0.44722],
		    "10217": [0.25, 0.75, 0, 0, 0.44722],
		    "10815": [0, 0.68611, 0, 0, 0.9],
		    "10927": [0.19667, 0.69667, 0, 0, 0.89444],
		    "10928": [0.19667, 0.69667, 0, 0, 0.89444],
		    "57376": [0.19444, 0.69444, 0, 0, 0]
		  },
		  "Main-BoldItalic": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0.11417, 0, 0.38611],
		    "34": [0, 0.69444, 0.07939, 0, 0.62055],
		    "35": [0.19444, 0.69444, 0.06833, 0, 0.94444],
		    "37": [0.05556, 0.75, 0.12861, 0, 0.94444],
		    "38": [0, 0.69444, 0.08528, 0, 0.88555],
		    "39": [0, 0.69444, 0.12945, 0, 0.35555],
		    "40": [0.25, 0.75, 0.15806, 0, 0.47333],
		    "41": [0.25, 0.75, 0.03306, 0, 0.47333],
		    "42": [0, 0.75, 0.14333, 0, 0.59111],
		    "43": [0.10333, 0.60333, 0.03306, 0, 0.88555],
		    "44": [0.19444, 0.14722, 0, 0, 0.35555],
		    "45": [0, 0.44444, 0.02611, 0, 0.41444],
		    "46": [0, 0.14722, 0, 0, 0.35555],
		    "47": [0.25, 0.75, 0.15806, 0, 0.59111],
		    "48": [0, 0.64444, 0.13167, 0, 0.59111],
		    "49": [0, 0.64444, 0.13167, 0, 0.59111],
		    "50": [0, 0.64444, 0.13167, 0, 0.59111],
		    "51": [0, 0.64444, 0.13167, 0, 0.59111],
		    "52": [0.19444, 0.64444, 0.13167, 0, 0.59111],
		    "53": [0, 0.64444, 0.13167, 0, 0.59111],
		    "54": [0, 0.64444, 0.13167, 0, 0.59111],
		    "55": [0.19444, 0.64444, 0.13167, 0, 0.59111],
		    "56": [0, 0.64444, 0.13167, 0, 0.59111],
		    "57": [0, 0.64444, 0.13167, 0, 0.59111],
		    "58": [0, 0.44444, 0.06695, 0, 0.35555],
		    "59": [0.19444, 0.44444, 0.06695, 0, 0.35555],
		    "61": [-0.10889, 0.39111, 0.06833, 0, 0.88555],
		    "63": [0, 0.69444, 0.11472, 0, 0.59111],
		    "64": [0, 0.69444, 0.09208, 0, 0.88555],
		    "65": [0, 0.68611, 0, 0, 0.86555],
		    "66": [0, 0.68611, 0.0992, 0, 0.81666],
		    "67": [0, 0.68611, 0.14208, 0, 0.82666],
		    "68": [0, 0.68611, 0.09062, 0, 0.87555],
		    "69": [0, 0.68611, 0.11431, 0, 0.75666],
		    "70": [0, 0.68611, 0.12903, 0, 0.72722],
		    "71": [0, 0.68611, 0.07347, 0, 0.89527],
		    "72": [0, 0.68611, 0.17208, 0, 0.8961],
		    "73": [0, 0.68611, 0.15681, 0, 0.47166],
		    "74": [0, 0.68611, 0.145, 0, 0.61055],
		    "75": [0, 0.68611, 0.14208, 0, 0.89499],
		    "76": [0, 0.68611, 0, 0, 0.69777],
		    "77": [0, 0.68611, 0.17208, 0, 1.07277],
		    "78": [0, 0.68611, 0.17208, 0, 0.8961],
		    "79": [0, 0.68611, 0.09062, 0, 0.85499],
		    "80": [0, 0.68611, 0.0992, 0, 0.78721],
		    "81": [0.19444, 0.68611, 0.09062, 0, 0.85499],
		    "82": [0, 0.68611, 0.02559, 0, 0.85944],
		    "83": [0, 0.68611, 0.11264, 0, 0.64999],
		    "84": [0, 0.68611, 0.12903, 0, 0.7961],
		    "85": [0, 0.68611, 0.17208, 0, 0.88083],
		    "86": [0, 0.68611, 0.18625, 0, 0.86555],
		    "87": [0, 0.68611, 0.18625, 0, 1.15999],
		    "88": [0, 0.68611, 0.15681, 0, 0.86555],
		    "89": [0, 0.68611, 0.19803, 0, 0.86555],
		    "90": [0, 0.68611, 0.14208, 0, 0.70888],
		    "91": [0.25, 0.75, 0.1875, 0, 0.35611],
		    "93": [0.25, 0.75, 0.09972, 0, 0.35611],
		    "94": [0, 0.69444, 0.06709, 0, 0.59111],
		    "95": [0.31, 0.13444, 0.09811, 0, 0.59111],
		    "97": [0, 0.44444, 0.09426, 0, 0.59111],
		    "98": [0, 0.69444, 0.07861, 0, 0.53222],
		    "99": [0, 0.44444, 0.05222, 0, 0.53222],
		    "100": [0, 0.69444, 0.10861, 0, 0.59111],
		    "101": [0, 0.44444, 0.085, 0, 0.53222],
		    "102": [0.19444, 0.69444, 0.21778, 0, 0.4],
		    "103": [0.19444, 0.44444, 0.105, 0, 0.53222],
		    "104": [0, 0.69444, 0.09426, 0, 0.59111],
		    "105": [0, 0.69326, 0.11387, 0, 0.35555],
		    "106": [0.19444, 0.69326, 0.1672, 0, 0.35555],
		    "107": [0, 0.69444, 0.11111, 0, 0.53222],
		    "108": [0, 0.69444, 0.10861, 0, 0.29666],
		    "109": [0, 0.44444, 0.09426, 0, 0.94444],
		    "110": [0, 0.44444, 0.09426, 0, 0.64999],
		    "111": [0, 0.44444, 0.07861, 0, 0.59111],
		    "112": [0.19444, 0.44444, 0.07861, 0, 0.59111],
		    "113": [0.19444, 0.44444, 0.105, 0, 0.53222],
		    "114": [0, 0.44444, 0.11111, 0, 0.50167],
		    "115": [0, 0.44444, 0.08167, 0, 0.48694],
		    "116": [0, 0.63492, 0.09639, 0, 0.385],
		    "117": [0, 0.44444, 0.09426, 0, 0.62055],
		    "118": [0, 0.44444, 0.11111, 0, 0.53222],
		    "119": [0, 0.44444, 0.11111, 0, 0.76777],
		    "120": [0, 0.44444, 0.12583, 0, 0.56055],
		    "121": [0.19444, 0.44444, 0.105, 0, 0.56166],
		    "122": [0, 0.44444, 0.13889, 0, 0.49055],
		    "126": [0.35, 0.34444, 0.11472, 0, 0.59111],
		    "160": [0, 0, 0, 0, 0.25],
		    "168": [0, 0.69444, 0.11473, 0, 0.59111],
		    "176": [0, 0.69444, 0, 0, 0.94888],
		    "184": [0.17014, 0, 0, 0, 0.53222],
		    "198": [0, 0.68611, 0.11431, 0, 1.02277],
		    "216": [0.04861, 0.73472, 0.09062, 0, 0.88555],
		    "223": [0.19444, 0.69444, 0.09736, 0, 0.665],
		    "230": [0, 0.44444, 0.085, 0, 0.82666],
		    "248": [0.09722, 0.54167, 0.09458, 0, 0.59111],
		    "305": [0, 0.44444, 0.09426, 0, 0.35555],
		    "338": [0, 0.68611, 0.11431, 0, 1.14054],
		    "339": [0, 0.44444, 0.085, 0, 0.82666],
		    "567": [0.19444, 0.44444, 0.04611, 0, 0.385],
		    "710": [0, 0.69444, 0.06709, 0, 0.59111],
		    "711": [0, 0.63194, 0.08271, 0, 0.59111],
		    "713": [0, 0.59444, 0.10444, 0, 0.59111],
		    "714": [0, 0.69444, 0.08528, 0, 0.59111],
		    "715": [0, 0.69444, 0, 0, 0.59111],
		    "728": [0, 0.69444, 0.10333, 0, 0.59111],
		    "729": [0, 0.69444, 0.12945, 0, 0.35555],
		    "730": [0, 0.69444, 0, 0, 0.94888],
		    "732": [0, 0.69444, 0.11472, 0, 0.59111],
		    "733": [0, 0.69444, 0.11472, 0, 0.59111],
		    "915": [0, 0.68611, 0.12903, 0, 0.69777],
		    "916": [0, 0.68611, 0, 0, 0.94444],
		    "920": [0, 0.68611, 0.09062, 0, 0.88555],
		    "923": [0, 0.68611, 0, 0, 0.80666],
		    "926": [0, 0.68611, 0.15092, 0, 0.76777],
		    "928": [0, 0.68611, 0.17208, 0, 0.8961],
		    "931": [0, 0.68611, 0.11431, 0, 0.82666],
		    "933": [0, 0.68611, 0.10778, 0, 0.88555],
		    "934": [0, 0.68611, 0.05632, 0, 0.82666],
		    "936": [0, 0.68611, 0.10778, 0, 0.88555],
		    "937": [0, 0.68611, 0.0992, 0, 0.82666],
		    "8211": [0, 0.44444, 0.09811, 0, 0.59111],
		    "8212": [0, 0.44444, 0.09811, 0, 1.18221],
		    "8216": [0, 0.69444, 0.12945, 0, 0.35555],
		    "8217": [0, 0.69444, 0.12945, 0, 0.35555],
		    "8220": [0, 0.69444, 0.16772, 0, 0.62055],
		    "8221": [0, 0.69444, 0.07939, 0, 0.62055]
		  },
		  "Main-Italic": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0.12417, 0, 0.30667],
		    "34": [0, 0.69444, 0.06961, 0, 0.51444],
		    "35": [0.19444, 0.69444, 0.06616, 0, 0.81777],
		    "37": [0.05556, 0.75, 0.13639, 0, 0.81777],
		    "38": [0, 0.69444, 0.09694, 0, 0.76666],
		    "39": [0, 0.69444, 0.12417, 0, 0.30667],
		    "40": [0.25, 0.75, 0.16194, 0, 0.40889],
		    "41": [0.25, 0.75, 0.03694, 0, 0.40889],
		    "42": [0, 0.75, 0.14917, 0, 0.51111],
		    "43": [0.05667, 0.56167, 0.03694, 0, 0.76666],
		    "44": [0.19444, 0.10556, 0, 0, 0.30667],
		    "45": [0, 0.43056, 0.02826, 0, 0.35778],
		    "46": [0, 0.10556, 0, 0, 0.30667],
		    "47": [0.25, 0.75, 0.16194, 0, 0.51111],
		    "48": [0, 0.64444, 0.13556, 0, 0.51111],
		    "49": [0, 0.64444, 0.13556, 0, 0.51111],
		    "50": [0, 0.64444, 0.13556, 0, 0.51111],
		    "51": [0, 0.64444, 0.13556, 0, 0.51111],
		    "52": [0.19444, 0.64444, 0.13556, 0, 0.51111],
		    "53": [0, 0.64444, 0.13556, 0, 0.51111],
		    "54": [0, 0.64444, 0.13556, 0, 0.51111],
		    "55": [0.19444, 0.64444, 0.13556, 0, 0.51111],
		    "56": [0, 0.64444, 0.13556, 0, 0.51111],
		    "57": [0, 0.64444, 0.13556, 0, 0.51111],
		    "58": [0, 0.43056, 0.0582, 0, 0.30667],
		    "59": [0.19444, 0.43056, 0.0582, 0, 0.30667],
		    "61": [-0.13313, 0.36687, 0.06616, 0, 0.76666],
		    "63": [0, 0.69444, 0.1225, 0, 0.51111],
		    "64": [0, 0.69444, 0.09597, 0, 0.76666],
		    "65": [0, 0.68333, 0, 0, 0.74333],
		    "66": [0, 0.68333, 0.10257, 0, 0.70389],
		    "67": [0, 0.68333, 0.14528, 0, 0.71555],
		    "68": [0, 0.68333, 0.09403, 0, 0.755],
		    "69": [0, 0.68333, 0.12028, 0, 0.67833],
		    "70": [0, 0.68333, 0.13305, 0, 0.65277],
		    "71": [0, 0.68333, 0.08722, 0, 0.77361],
		    "72": [0, 0.68333, 0.16389, 0, 0.74333],
		    "73": [0, 0.68333, 0.15806, 0, 0.38555],
		    "74": [0, 0.68333, 0.14028, 0, 0.525],
		    "75": [0, 0.68333, 0.14528, 0, 0.76888],
		    "76": [0, 0.68333, 0, 0, 0.62722],
		    "77": [0, 0.68333, 0.16389, 0, 0.89666],
		    "78": [0, 0.68333, 0.16389, 0, 0.74333],
		    "79": [0, 0.68333, 0.09403, 0, 0.76666],
		    "80": [0, 0.68333, 0.10257, 0, 0.67833],
		    "81": [0.19444, 0.68333, 0.09403, 0, 0.76666],
		    "82": [0, 0.68333, 0.03868, 0, 0.72944],
		    "83": [0, 0.68333, 0.11972, 0, 0.56222],
		    "84": [0, 0.68333, 0.13305, 0, 0.71555],
		    "85": [0, 0.68333, 0.16389, 0, 0.74333],
		    "86": [0, 0.68333, 0.18361, 0, 0.74333],
		    "87": [0, 0.68333, 0.18361, 0, 0.99888],
		    "88": [0, 0.68333, 0.15806, 0, 0.74333],
		    "89": [0, 0.68333, 0.19383, 0, 0.74333],
		    "90": [0, 0.68333, 0.14528, 0, 0.61333],
		    "91": [0.25, 0.75, 0.1875, 0, 0.30667],
		    "93": [0.25, 0.75, 0.10528, 0, 0.30667],
		    "94": [0, 0.69444, 0.06646, 0, 0.51111],
		    "95": [0.31, 0.12056, 0.09208, 0, 0.51111],
		    "97": [0, 0.43056, 0.07671, 0, 0.51111],
		    "98": [0, 0.69444, 0.06312, 0, 0.46],
		    "99": [0, 0.43056, 0.05653, 0, 0.46],
		    "100": [0, 0.69444, 0.10333, 0, 0.51111],
		    "101": [0, 0.43056, 0.07514, 0, 0.46],
		    "102": [0.19444, 0.69444, 0.21194, 0, 0.30667],
		    "103": [0.19444, 0.43056, 0.08847, 0, 0.46],
		    "104": [0, 0.69444, 0.07671, 0, 0.51111],
		    "105": [0, 0.65536, 0.1019, 0, 0.30667],
		    "106": [0.19444, 0.65536, 0.14467, 0, 0.30667],
		    "107": [0, 0.69444, 0.10764, 0, 0.46],
		    "108": [0, 0.69444, 0.10333, 0, 0.25555],
		    "109": [0, 0.43056, 0.07671, 0, 0.81777],
		    "110": [0, 0.43056, 0.07671, 0, 0.56222],
		    "111": [0, 0.43056, 0.06312, 0, 0.51111],
		    "112": [0.19444, 0.43056, 0.06312, 0, 0.51111],
		    "113": [0.19444, 0.43056, 0.08847, 0, 0.46],
		    "114": [0, 0.43056, 0.10764, 0, 0.42166],
		    "115": [0, 0.43056, 0.08208, 0, 0.40889],
		    "116": [0, 0.61508, 0.09486, 0, 0.33222],
		    "117": [0, 0.43056, 0.07671, 0, 0.53666],
		    "118": [0, 0.43056, 0.10764, 0, 0.46],
		    "119": [0, 0.43056, 0.10764, 0, 0.66444],
		    "120": [0, 0.43056, 0.12042, 0, 0.46389],
		    "121": [0.19444, 0.43056, 0.08847, 0, 0.48555],
		    "122": [0, 0.43056, 0.12292, 0, 0.40889],
		    "126": [0.35, 0.31786, 0.11585, 0, 0.51111],
		    "160": [0, 0, 0, 0, 0.25],
		    "168": [0, 0.66786, 0.10474, 0, 0.51111],
		    "176": [0, 0.69444, 0, 0, 0.83129],
		    "184": [0.17014, 0, 0, 0, 0.46],
		    "198": [0, 0.68333, 0.12028, 0, 0.88277],
		    "216": [0.04861, 0.73194, 0.09403, 0, 0.76666],
		    "223": [0.19444, 0.69444, 0.10514, 0, 0.53666],
		    "230": [0, 0.43056, 0.07514, 0, 0.71555],
		    "248": [0.09722, 0.52778, 0.09194, 0, 0.51111],
		    "338": [0, 0.68333, 0.12028, 0, 0.98499],
		    "339": [0, 0.43056, 0.07514, 0, 0.71555],
		    "710": [0, 0.69444, 0.06646, 0, 0.51111],
		    "711": [0, 0.62847, 0.08295, 0, 0.51111],
		    "713": [0, 0.56167, 0.10333, 0, 0.51111],
		    "714": [0, 0.69444, 0.09694, 0, 0.51111],
		    "715": [0, 0.69444, 0, 0, 0.51111],
		    "728": [0, 0.69444, 0.10806, 0, 0.51111],
		    "729": [0, 0.66786, 0.11752, 0, 0.30667],
		    "730": [0, 0.69444, 0, 0, 0.83129],
		    "732": [0, 0.66786, 0.11585, 0, 0.51111],
		    "733": [0, 0.69444, 0.1225, 0, 0.51111],
		    "915": [0, 0.68333, 0.13305, 0, 0.62722],
		    "916": [0, 0.68333, 0, 0, 0.81777],
		    "920": [0, 0.68333, 0.09403, 0, 0.76666],
		    "923": [0, 0.68333, 0, 0, 0.69222],
		    "926": [0, 0.68333, 0.15294, 0, 0.66444],
		    "928": [0, 0.68333, 0.16389, 0, 0.74333],
		    "931": [0, 0.68333, 0.12028, 0, 0.71555],
		    "933": [0, 0.68333, 0.11111, 0, 0.76666],
		    "934": [0, 0.68333, 0.05986, 0, 0.71555],
		    "936": [0, 0.68333, 0.11111, 0, 0.76666],
		    "937": [0, 0.68333, 0.10257, 0, 0.71555],
		    "8211": [0, 0.43056, 0.09208, 0, 0.51111],
		    "8212": [0, 0.43056, 0.09208, 0, 1.02222],
		    "8216": [0, 0.69444, 0.12417, 0, 0.30667],
		    "8217": [0, 0.69444, 0.12417, 0, 0.30667],
		    "8220": [0, 0.69444, 0.1685, 0, 0.51444],
		    "8221": [0, 0.69444, 0.06961, 0, 0.51444],
		    "8463": [0, 0.68889, 0, 0, 0.54028]
		  },
		  "Main-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0, 0, 0.27778],
		    "34": [0, 0.69444, 0, 0, 0.5],
		    "35": [0.19444, 0.69444, 0, 0, 0.83334],
		    "36": [0.05556, 0.75, 0, 0, 0.5],
		    "37": [0.05556, 0.75, 0, 0, 0.83334],
		    "38": [0, 0.69444, 0, 0, 0.77778],
		    "39": [0, 0.69444, 0, 0, 0.27778],
		    "40": [0.25, 0.75, 0, 0, 0.38889],
		    "41": [0.25, 0.75, 0, 0, 0.38889],
		    "42": [0, 0.75, 0, 0, 0.5],
		    "43": [0.08333, 0.58333, 0, 0, 0.77778],
		    "44": [0.19444, 0.10556, 0, 0, 0.27778],
		    "45": [0, 0.43056, 0, 0, 0.33333],
		    "46": [0, 0.10556, 0, 0, 0.27778],
		    "47": [0.25, 0.75, 0, 0, 0.5],
		    "48": [0, 0.64444, 0, 0, 0.5],
		    "49": [0, 0.64444, 0, 0, 0.5],
		    "50": [0, 0.64444, 0, 0, 0.5],
		    "51": [0, 0.64444, 0, 0, 0.5],
		    "52": [0, 0.64444, 0, 0, 0.5],
		    "53": [0, 0.64444, 0, 0, 0.5],
		    "54": [0, 0.64444, 0, 0, 0.5],
		    "55": [0, 0.64444, 0, 0, 0.5],
		    "56": [0, 0.64444, 0, 0, 0.5],
		    "57": [0, 0.64444, 0, 0, 0.5],
		    "58": [0, 0.43056, 0, 0, 0.27778],
		    "59": [0.19444, 0.43056, 0, 0, 0.27778],
		    "60": [0.0391, 0.5391, 0, 0, 0.77778],
		    "61": [-0.13313, 0.36687, 0, 0, 0.77778],
		    "62": [0.0391, 0.5391, 0, 0, 0.77778],
		    "63": [0, 0.69444, 0, 0, 0.47222],
		    "64": [0, 0.69444, 0, 0, 0.77778],
		    "65": [0, 0.68333, 0, 0, 0.75],
		    "66": [0, 0.68333, 0, 0, 0.70834],
		    "67": [0, 0.68333, 0, 0, 0.72222],
		    "68": [0, 0.68333, 0, 0, 0.76389],
		    "69": [0, 0.68333, 0, 0, 0.68056],
		    "70": [0, 0.68333, 0, 0, 0.65278],
		    "71": [0, 0.68333, 0, 0, 0.78472],
		    "72": [0, 0.68333, 0, 0, 0.75],
		    "73": [0, 0.68333, 0, 0, 0.36111],
		    "74": [0, 0.68333, 0, 0, 0.51389],
		    "75": [0, 0.68333, 0, 0, 0.77778],
		    "76": [0, 0.68333, 0, 0, 0.625],
		    "77": [0, 0.68333, 0, 0, 0.91667],
		    "78": [0, 0.68333, 0, 0, 0.75],
		    "79": [0, 0.68333, 0, 0, 0.77778],
		    "80": [0, 0.68333, 0, 0, 0.68056],
		    "81": [0.19444, 0.68333, 0, 0, 0.77778],
		    "82": [0, 0.68333, 0, 0, 0.73611],
		    "83": [0, 0.68333, 0, 0, 0.55556],
		    "84": [0, 0.68333, 0, 0, 0.72222],
		    "85": [0, 0.68333, 0, 0, 0.75],
		    "86": [0, 0.68333, 0.01389, 0, 0.75],
		    "87": [0, 0.68333, 0.01389, 0, 1.02778],
		    "88": [0, 0.68333, 0, 0, 0.75],
		    "89": [0, 0.68333, 0.025, 0, 0.75],
		    "90": [0, 0.68333, 0, 0, 0.61111],
		    "91": [0.25, 0.75, 0, 0, 0.27778],
		    "92": [0.25, 0.75, 0, 0, 0.5],
		    "93": [0.25, 0.75, 0, 0, 0.27778],
		    "94": [0, 0.69444, 0, 0, 0.5],
		    "95": [0.31, 0.12056, 0.02778, 0, 0.5],
		    "97": [0, 0.43056, 0, 0, 0.5],
		    "98": [0, 0.69444, 0, 0, 0.55556],
		    "99": [0, 0.43056, 0, 0, 0.44445],
		    "100": [0, 0.69444, 0, 0, 0.55556],
		    "101": [0, 0.43056, 0, 0, 0.44445],
		    "102": [0, 0.69444, 0.07778, 0, 0.30556],
		    "103": [0.19444, 0.43056, 0.01389, 0, 0.5],
		    "104": [0, 0.69444, 0, 0, 0.55556],
		    "105": [0, 0.66786, 0, 0, 0.27778],
		    "106": [0.19444, 0.66786, 0, 0, 0.30556],
		    "107": [0, 0.69444, 0, 0, 0.52778],
		    "108": [0, 0.69444, 0, 0, 0.27778],
		    "109": [0, 0.43056, 0, 0, 0.83334],
		    "110": [0, 0.43056, 0, 0, 0.55556],
		    "111": [0, 0.43056, 0, 0, 0.5],
		    "112": [0.19444, 0.43056, 0, 0, 0.55556],
		    "113": [0.19444, 0.43056, 0, 0, 0.52778],
		    "114": [0, 0.43056, 0, 0, 0.39167],
		    "115": [0, 0.43056, 0, 0, 0.39445],
		    "116": [0, 0.61508, 0, 0, 0.38889],
		    "117": [0, 0.43056, 0, 0, 0.55556],
		    "118": [0, 0.43056, 0.01389, 0, 0.52778],
		    "119": [0, 0.43056, 0.01389, 0, 0.72222],
		    "120": [0, 0.43056, 0, 0, 0.52778],
		    "121": [0.19444, 0.43056, 0.01389, 0, 0.52778],
		    "122": [0, 0.43056, 0, 0, 0.44445],
		    "123": [0.25, 0.75, 0, 0, 0.5],
		    "124": [0.25, 0.75, 0, 0, 0.27778],
		    "125": [0.25, 0.75, 0, 0, 0.5],
		    "126": [0.35, 0.31786, 0, 0, 0.5],
		    "160": [0, 0, 0, 0, 0.25],
		    "163": [0, 0.69444, 0, 0, 0.76909],
		    "167": [0.19444, 0.69444, 0, 0, 0.44445],
		    "168": [0, 0.66786, 0, 0, 0.5],
		    "172": [0, 0.43056, 0, 0, 0.66667],
		    "176": [0, 0.69444, 0, 0, 0.75],
		    "177": [0.08333, 0.58333, 0, 0, 0.77778],
		    "182": [0.19444, 0.69444, 0, 0, 0.61111],
		    "184": [0.17014, 0, 0, 0, 0.44445],
		    "198": [0, 0.68333, 0, 0, 0.90278],
		    "215": [0.08333, 0.58333, 0, 0, 0.77778],
		    "216": [0.04861, 0.73194, 0, 0, 0.77778],
		    "223": [0, 0.69444, 0, 0, 0.5],
		    "230": [0, 0.43056, 0, 0, 0.72222],
		    "247": [0.08333, 0.58333, 0, 0, 0.77778],
		    "248": [0.09722, 0.52778, 0, 0, 0.5],
		    "305": [0, 0.43056, 0, 0, 0.27778],
		    "338": [0, 0.68333, 0, 0, 1.01389],
		    "339": [0, 0.43056, 0, 0, 0.77778],
		    "567": [0.19444, 0.43056, 0, 0, 0.30556],
		    "710": [0, 0.69444, 0, 0, 0.5],
		    "711": [0, 0.62847, 0, 0, 0.5],
		    "713": [0, 0.56778, 0, 0, 0.5],
		    "714": [0, 0.69444, 0, 0, 0.5],
		    "715": [0, 0.69444, 0, 0, 0.5],
		    "728": [0, 0.69444, 0, 0, 0.5],
		    "729": [0, 0.66786, 0, 0, 0.27778],
		    "730": [0, 0.69444, 0, 0, 0.75],
		    "732": [0, 0.66786, 0, 0, 0.5],
		    "733": [0, 0.69444, 0, 0, 0.5],
		    "915": [0, 0.68333, 0, 0, 0.625],
		    "916": [0, 0.68333, 0, 0, 0.83334],
		    "920": [0, 0.68333, 0, 0, 0.77778],
		    "923": [0, 0.68333, 0, 0, 0.69445],
		    "926": [0, 0.68333, 0, 0, 0.66667],
		    "928": [0, 0.68333, 0, 0, 0.75],
		    "931": [0, 0.68333, 0, 0, 0.72222],
		    "933": [0, 0.68333, 0, 0, 0.77778],
		    "934": [0, 0.68333, 0, 0, 0.72222],
		    "936": [0, 0.68333, 0, 0, 0.77778],
		    "937": [0, 0.68333, 0, 0, 0.72222],
		    "8211": [0, 0.43056, 0.02778, 0, 0.5],
		    "8212": [0, 0.43056, 0.02778, 0, 1.0],
		    "8216": [0, 0.69444, 0, 0, 0.27778],
		    "8217": [0, 0.69444, 0, 0, 0.27778],
		    "8220": [0, 0.69444, 0, 0, 0.5],
		    "8221": [0, 0.69444, 0, 0, 0.5],
		    "8224": [0.19444, 0.69444, 0, 0, 0.44445],
		    "8225": [0.19444, 0.69444, 0, 0, 0.44445],
		    "8230": [0, 0.123, 0, 0, 1.172],
		    "8242": [0, 0.55556, 0, 0, 0.275],
		    "8407": [0, 0.71444, 0.15382, 0, 0.5],
		    "8463": [0, 0.68889, 0, 0, 0.54028],
		    "8465": [0, 0.69444, 0, 0, 0.72222],
		    "8467": [0, 0.69444, 0, 0.11111, 0.41667],
		    "8472": [0.19444, 0.43056, 0, 0.11111, 0.63646],
		    "8476": [0, 0.69444, 0, 0, 0.72222],
		    "8501": [0, 0.69444, 0, 0, 0.61111],
		    "8592": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8593": [0.19444, 0.69444, 0, 0, 0.5],
		    "8594": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8595": [0.19444, 0.69444, 0, 0, 0.5],
		    "8596": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8597": [0.25, 0.75, 0, 0, 0.5],
		    "8598": [0.19444, 0.69444, 0, 0, 1.0],
		    "8599": [0.19444, 0.69444, 0, 0, 1.0],
		    "8600": [0.19444, 0.69444, 0, 0, 1.0],
		    "8601": [0.19444, 0.69444, 0, 0, 1.0],
		    "8614": [0.011, 0.511, 0, 0, 1.0],
		    "8617": [0.011, 0.511, 0, 0, 1.126],
		    "8618": [0.011, 0.511, 0, 0, 1.126],
		    "8636": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8637": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8640": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8641": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8652": [0.011, 0.671, 0, 0, 1.0],
		    "8656": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8657": [0.19444, 0.69444, 0, 0, 0.61111],
		    "8658": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8659": [0.19444, 0.69444, 0, 0, 0.61111],
		    "8660": [-0.13313, 0.36687, 0, 0, 1.0],
		    "8661": [0.25, 0.75, 0, 0, 0.61111],
		    "8704": [0, 0.69444, 0, 0, 0.55556],
		    "8706": [0, 0.69444, 0.05556, 0.08334, 0.5309],
		    "8707": [0, 0.69444, 0, 0, 0.55556],
		    "8709": [0.05556, 0.75, 0, 0, 0.5],
		    "8711": [0, 0.68333, 0, 0, 0.83334],
		    "8712": [0.0391, 0.5391, 0, 0, 0.66667],
		    "8715": [0.0391, 0.5391, 0, 0, 0.66667],
		    "8722": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8723": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8725": [0.25, 0.75, 0, 0, 0.5],
		    "8726": [0.25, 0.75, 0, 0, 0.5],
		    "8727": [-0.03472, 0.46528, 0, 0, 0.5],
		    "8728": [-0.05555, 0.44445, 0, 0, 0.5],
		    "8729": [-0.05555, 0.44445, 0, 0, 0.5],
		    "8730": [0.2, 0.8, 0, 0, 0.83334],
		    "8733": [0, 0.43056, 0, 0, 0.77778],
		    "8734": [0, 0.43056, 0, 0, 1.0],
		    "8736": [0, 0.69224, 0, 0, 0.72222],
		    "8739": [0.25, 0.75, 0, 0, 0.27778],
		    "8741": [0.25, 0.75, 0, 0, 0.5],
		    "8743": [0, 0.55556, 0, 0, 0.66667],
		    "8744": [0, 0.55556, 0, 0, 0.66667],
		    "8745": [0, 0.55556, 0, 0, 0.66667],
		    "8746": [0, 0.55556, 0, 0, 0.66667],
		    "8747": [0.19444, 0.69444, 0.11111, 0, 0.41667],
		    "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
		    "8768": [0.19444, 0.69444, 0, 0, 0.27778],
		    "8771": [-0.03625, 0.46375, 0, 0, 0.77778],
		    "8773": [-0.022, 0.589, 0, 0, 0.778],
		    "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
		    "8781": [-0.03625, 0.46375, 0, 0, 0.77778],
		    "8784": [-0.133, 0.673, 0, 0, 0.778],
		    "8801": [-0.03625, 0.46375, 0, 0, 0.77778],
		    "8804": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8805": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8810": [0.0391, 0.5391, 0, 0, 1.0],
		    "8811": [0.0391, 0.5391, 0, 0, 1.0],
		    "8826": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8827": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8834": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8835": [0.0391, 0.5391, 0, 0, 0.77778],
		    "8838": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8839": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8846": [0, 0.55556, 0, 0, 0.66667],
		    "8849": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8850": [0.13597, 0.63597, 0, 0, 0.77778],
		    "8851": [0, 0.55556, 0, 0, 0.66667],
		    "8852": [0, 0.55556, 0, 0, 0.66667],
		    "8853": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8854": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8855": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8856": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8857": [0.08333, 0.58333, 0, 0, 0.77778],
		    "8866": [0, 0.69444, 0, 0, 0.61111],
		    "8867": [0, 0.69444, 0, 0, 0.61111],
		    "8868": [0, 0.69444, 0, 0, 0.77778],
		    "8869": [0, 0.69444, 0, 0, 0.77778],
		    "8872": [0.249, 0.75, 0, 0, 0.867],
		    "8900": [-0.05555, 0.44445, 0, 0, 0.5],
		    "8901": [-0.05555, 0.44445, 0, 0, 0.27778],
		    "8902": [-0.03472, 0.46528, 0, 0, 0.5],
		    "8904": [0.005, 0.505, 0, 0, 0.9],
		    "8942": [0.03, 0.903, 0, 0, 0.278],
		    "8943": [-0.19, 0.313, 0, 0, 1.172],
		    "8945": [-0.1, 0.823, 0, 0, 1.282],
		    "8968": [0.25, 0.75, 0, 0, 0.44445],
		    "8969": [0.25, 0.75, 0, 0, 0.44445],
		    "8970": [0.25, 0.75, 0, 0, 0.44445],
		    "8971": [0.25, 0.75, 0, 0, 0.44445],
		    "8994": [-0.14236, 0.35764, 0, 0, 1.0],
		    "8995": [-0.14236, 0.35764, 0, 0, 1.0],
		    "9136": [0.244, 0.744, 0, 0, 0.412],
		    "9137": [0.244, 0.745, 0, 0, 0.412],
		    "9651": [0.19444, 0.69444, 0, 0, 0.88889],
		    "9657": [-0.03472, 0.46528, 0, 0, 0.5],
		    "9661": [0.19444, 0.69444, 0, 0, 0.88889],
		    "9667": [-0.03472, 0.46528, 0, 0, 0.5],
		    "9711": [0.19444, 0.69444, 0, 0, 1.0],
		    "9824": [0.12963, 0.69444, 0, 0, 0.77778],
		    "9825": [0.12963, 0.69444, 0, 0, 0.77778],
		    "9826": [0.12963, 0.69444, 0, 0, 0.77778],
		    "9827": [0.12963, 0.69444, 0, 0, 0.77778],
		    "9837": [0, 0.75, 0, 0, 0.38889],
		    "9838": [0.19444, 0.69444, 0, 0, 0.38889],
		    "9839": [0.19444, 0.69444, 0, 0, 0.38889],
		    "10216": [0.25, 0.75, 0, 0, 0.38889],
		    "10217": [0.25, 0.75, 0, 0, 0.38889],
		    "10222": [0.244, 0.744, 0, 0, 0.412],
		    "10223": [0.244, 0.745, 0, 0, 0.412],
		    "10229": [0.011, 0.511, 0, 0, 1.609],
		    "10230": [0.011, 0.511, 0, 0, 1.638],
		    "10231": [0.011, 0.511, 0, 0, 1.859],
		    "10232": [0.024, 0.525, 0, 0, 1.609],
		    "10233": [0.024, 0.525, 0, 0, 1.638],
		    "10234": [0.024, 0.525, 0, 0, 1.858],
		    "10236": [0.011, 0.511, 0, 0, 1.638],
		    "10815": [0, 0.68333, 0, 0, 0.75],
		    "10927": [0.13597, 0.63597, 0, 0, 0.77778],
		    "10928": [0.13597, 0.63597, 0, 0, 0.77778],
		    "57376": [0.19444, 0.69444, 0, 0, 0]
		  },
		  "Math-BoldItalic": {
		    "32": [0, 0, 0, 0, 0.25],
		    "48": [0, 0.44444, 0, 0, 0.575],
		    "49": [0, 0.44444, 0, 0, 0.575],
		    "50": [0, 0.44444, 0, 0, 0.575],
		    "51": [0.19444, 0.44444, 0, 0, 0.575],
		    "52": [0.19444, 0.44444, 0, 0, 0.575],
		    "53": [0.19444, 0.44444, 0, 0, 0.575],
		    "54": [0, 0.64444, 0, 0, 0.575],
		    "55": [0.19444, 0.44444, 0, 0, 0.575],
		    "56": [0, 0.64444, 0, 0, 0.575],
		    "57": [0.19444, 0.44444, 0, 0, 0.575],
		    "65": [0, 0.68611, 0, 0, 0.86944],
		    "66": [0, 0.68611, 0.04835, 0, 0.8664],
		    "67": [0, 0.68611, 0.06979, 0, 0.81694],
		    "68": [0, 0.68611, 0.03194, 0, 0.93812],
		    "69": [0, 0.68611, 0.05451, 0, 0.81007],
		    "70": [0, 0.68611, 0.15972, 0, 0.68889],
		    "71": [0, 0.68611, 0, 0, 0.88673],
		    "72": [0, 0.68611, 0.08229, 0, 0.98229],
		    "73": [0, 0.68611, 0.07778, 0, 0.51111],
		    "74": [0, 0.68611, 0.10069, 0, 0.63125],
		    "75": [0, 0.68611, 0.06979, 0, 0.97118],
		    "76": [0, 0.68611, 0, 0, 0.75555],
		    "77": [0, 0.68611, 0.11424, 0, 1.14201],
		    "78": [0, 0.68611, 0.11424, 0, 0.95034],
		    "79": [0, 0.68611, 0.03194, 0, 0.83666],
		    "80": [0, 0.68611, 0.15972, 0, 0.72309],
		    "81": [0.19444, 0.68611, 0, 0, 0.86861],
		    "82": [0, 0.68611, 0.00421, 0, 0.87235],
		    "83": [0, 0.68611, 0.05382, 0, 0.69271],
		    "84": [0, 0.68611, 0.15972, 0, 0.63663],
		    "85": [0, 0.68611, 0.11424, 0, 0.80027],
		    "86": [0, 0.68611, 0.25555, 0, 0.67778],
		    "87": [0, 0.68611, 0.15972, 0, 1.09305],
		    "88": [0, 0.68611, 0.07778, 0, 0.94722],
		    "89": [0, 0.68611, 0.25555, 0, 0.67458],
		    "90": [0, 0.68611, 0.06979, 0, 0.77257],
		    "97": [0, 0.44444, 0, 0, 0.63287],
		    "98": [0, 0.69444, 0, 0, 0.52083],
		    "99": [0, 0.44444, 0, 0, 0.51342],
		    "100": [0, 0.69444, 0, 0, 0.60972],
		    "101": [0, 0.44444, 0, 0, 0.55361],
		    "102": [0.19444, 0.69444, 0.11042, 0, 0.56806],
		    "103": [0.19444, 0.44444, 0.03704, 0, 0.5449],
		    "104": [0, 0.69444, 0, 0, 0.66759],
		    "105": [0, 0.69326, 0, 0, 0.4048],
		    "106": [0.19444, 0.69326, 0.0622, 0, 0.47083],
		    "107": [0, 0.69444, 0.01852, 0, 0.6037],
		    "108": [0, 0.69444, 0.0088, 0, 0.34815],
		    "109": [0, 0.44444, 0, 0, 1.0324],
		    "110": [0, 0.44444, 0, 0, 0.71296],
		    "111": [0, 0.44444, 0, 0, 0.58472],
		    "112": [0.19444, 0.44444, 0, 0, 0.60092],
		    "113": [0.19444, 0.44444, 0.03704, 0, 0.54213],
		    "114": [0, 0.44444, 0.03194, 0, 0.5287],
		    "115": [0, 0.44444, 0, 0, 0.53125],
		    "116": [0, 0.63492, 0, 0, 0.41528],
		    "117": [0, 0.44444, 0, 0, 0.68102],
		    "118": [0, 0.44444, 0.03704, 0, 0.56666],
		    "119": [0, 0.44444, 0.02778, 0, 0.83148],
		    "120": [0, 0.44444, 0, 0, 0.65903],
		    "121": [0.19444, 0.44444, 0.03704, 0, 0.59028],
		    "122": [0, 0.44444, 0.04213, 0, 0.55509],
		    "160": [0, 0, 0, 0, 0.25],
		    "915": [0, 0.68611, 0.15972, 0, 0.65694],
		    "916": [0, 0.68611, 0, 0, 0.95833],
		    "920": [0, 0.68611, 0.03194, 0, 0.86722],
		    "923": [0, 0.68611, 0, 0, 0.80555],
		    "926": [0, 0.68611, 0.07458, 0, 0.84125],
		    "928": [0, 0.68611, 0.08229, 0, 0.98229],
		    "931": [0, 0.68611, 0.05451, 0, 0.88507],
		    "933": [0, 0.68611, 0.15972, 0, 0.67083],
		    "934": [0, 0.68611, 0, 0, 0.76666],
		    "936": [0, 0.68611, 0.11653, 0, 0.71402],
		    "937": [0, 0.68611, 0.04835, 0, 0.8789],
		    "945": [0, 0.44444, 0, 0, 0.76064],
		    "946": [0.19444, 0.69444, 0.03403, 0, 0.65972],
		    "947": [0.19444, 0.44444, 0.06389, 0, 0.59003],
		    "948": [0, 0.69444, 0.03819, 0, 0.52222],
		    "949": [0, 0.44444, 0, 0, 0.52882],
		    "950": [0.19444, 0.69444, 0.06215, 0, 0.50833],
		    "951": [0.19444, 0.44444, 0.03704, 0, 0.6],
		    "952": [0, 0.69444, 0.03194, 0, 0.5618],
		    "953": [0, 0.44444, 0, 0, 0.41204],
		    "954": [0, 0.44444, 0, 0, 0.66759],
		    "955": [0, 0.69444, 0, 0, 0.67083],
		    "956": [0.19444, 0.44444, 0, 0, 0.70787],
		    "957": [0, 0.44444, 0.06898, 0, 0.57685],
		    "958": [0.19444, 0.69444, 0.03021, 0, 0.50833],
		    "959": [0, 0.44444, 0, 0, 0.58472],
		    "960": [0, 0.44444, 0.03704, 0, 0.68241],
		    "961": [0.19444, 0.44444, 0, 0, 0.6118],
		    "962": [0.09722, 0.44444, 0.07917, 0, 0.42361],
		    "963": [0, 0.44444, 0.03704, 0, 0.68588],
		    "964": [0, 0.44444, 0.13472, 0, 0.52083],
		    "965": [0, 0.44444, 0.03704, 0, 0.63055],
		    "966": [0.19444, 0.44444, 0, 0, 0.74722],
		    "967": [0.19444, 0.44444, 0, 0, 0.71805],
		    "968": [0.19444, 0.69444, 0.03704, 0, 0.75833],
		    "969": [0, 0.44444, 0.03704, 0, 0.71782],
		    "977": [0, 0.69444, 0, 0, 0.69155],
		    "981": [0.19444, 0.69444, 0, 0, 0.7125],
		    "982": [0, 0.44444, 0.03194, 0, 0.975],
		    "1009": [0.19444, 0.44444, 0, 0, 0.6118],
		    "1013": [0, 0.44444, 0, 0, 0.48333],
		    "57649": [0, 0.44444, 0, 0, 0.39352],
		    "57911": [0.19444, 0.44444, 0, 0, 0.43889]
		  },
		  "Math-Italic": {
		    "32": [0, 0, 0, 0, 0.25],
		    "48": [0, 0.43056, 0, 0, 0.5],
		    "49": [0, 0.43056, 0, 0, 0.5],
		    "50": [0, 0.43056, 0, 0, 0.5],
		    "51": [0.19444, 0.43056, 0, 0, 0.5],
		    "52": [0.19444, 0.43056, 0, 0, 0.5],
		    "53": [0.19444, 0.43056, 0, 0, 0.5],
		    "54": [0, 0.64444, 0, 0, 0.5],
		    "55": [0.19444, 0.43056, 0, 0, 0.5],
		    "56": [0, 0.64444, 0, 0, 0.5],
		    "57": [0.19444, 0.43056, 0, 0, 0.5],
		    "65": [0, 0.68333, 0, 0.13889, 0.75],
		    "66": [0, 0.68333, 0.05017, 0.08334, 0.75851],
		    "67": [0, 0.68333, 0.07153, 0.08334, 0.71472],
		    "68": [0, 0.68333, 0.02778, 0.05556, 0.82792],
		    "69": [0, 0.68333, 0.05764, 0.08334, 0.7382],
		    "70": [0, 0.68333, 0.13889, 0.08334, 0.64306],
		    "71": [0, 0.68333, 0, 0.08334, 0.78625],
		    "72": [0, 0.68333, 0.08125, 0.05556, 0.83125],
		    "73": [0, 0.68333, 0.07847, 0.11111, 0.43958],
		    "74": [0, 0.68333, 0.09618, 0.16667, 0.55451],
		    "75": [0, 0.68333, 0.07153, 0.05556, 0.84931],
		    "76": [0, 0.68333, 0, 0.02778, 0.68056],
		    "77": [0, 0.68333, 0.10903, 0.08334, 0.97014],
		    "78": [0, 0.68333, 0.10903, 0.08334, 0.80347],
		    "79": [0, 0.68333, 0.02778, 0.08334, 0.76278],
		    "80": [0, 0.68333, 0.13889, 0.08334, 0.64201],
		    "81": [0.19444, 0.68333, 0, 0.08334, 0.79056],
		    "82": [0, 0.68333, 0.00773, 0.08334, 0.75929],
		    "83": [0, 0.68333, 0.05764, 0.08334, 0.6132],
		    "84": [0, 0.68333, 0.13889, 0.08334, 0.58438],
		    "85": [0, 0.68333, 0.10903, 0.02778, 0.68278],
		    "86": [0, 0.68333, 0.22222, 0, 0.58333],
		    "87": [0, 0.68333, 0.13889, 0, 0.94445],
		    "88": [0, 0.68333, 0.07847, 0.08334, 0.82847],
		    "89": [0, 0.68333, 0.22222, 0, 0.58056],
		    "90": [0, 0.68333, 0.07153, 0.08334, 0.68264],
		    "97": [0, 0.43056, 0, 0, 0.52859],
		    "98": [0, 0.69444, 0, 0, 0.42917],
		    "99": [0, 0.43056, 0, 0.05556, 0.43276],
		    "100": [0, 0.69444, 0, 0.16667, 0.52049],
		    "101": [0, 0.43056, 0, 0.05556, 0.46563],
		    "102": [0.19444, 0.69444, 0.10764, 0.16667, 0.48959],
		    "103": [0.19444, 0.43056, 0.03588, 0.02778, 0.47697],
		    "104": [0, 0.69444, 0, 0, 0.57616],
		    "105": [0, 0.65952, 0, 0, 0.34451],
		    "106": [0.19444, 0.65952, 0.05724, 0, 0.41181],
		    "107": [0, 0.69444, 0.03148, 0, 0.5206],
		    "108": [0, 0.69444, 0.01968, 0.08334, 0.29838],
		    "109": [0, 0.43056, 0, 0, 0.87801],
		    "110": [0, 0.43056, 0, 0, 0.60023],
		    "111": [0, 0.43056, 0, 0.05556, 0.48472],
		    "112": [0.19444, 0.43056, 0, 0.08334, 0.50313],
		    "113": [0.19444, 0.43056, 0.03588, 0.08334, 0.44641],
		    "114": [0, 0.43056, 0.02778, 0.05556, 0.45116],
		    "115": [0, 0.43056, 0, 0.05556, 0.46875],
		    "116": [0, 0.61508, 0, 0.08334, 0.36111],
		    "117": [0, 0.43056, 0, 0.02778, 0.57246],
		    "118": [0, 0.43056, 0.03588, 0.02778, 0.48472],
		    "119": [0, 0.43056, 0.02691, 0.08334, 0.71592],
		    "120": [0, 0.43056, 0, 0.02778, 0.57153],
		    "121": [0.19444, 0.43056, 0.03588, 0.05556, 0.49028],
		    "122": [0, 0.43056, 0.04398, 0.05556, 0.46505],
		    "160": [0, 0, 0, 0, 0.25],
		    "915": [0, 0.68333, 0.13889, 0.08334, 0.61528],
		    "916": [0, 0.68333, 0, 0.16667, 0.83334],
		    "920": [0, 0.68333, 0.02778, 0.08334, 0.76278],
		    "923": [0, 0.68333, 0, 0.16667, 0.69445],
		    "926": [0, 0.68333, 0.07569, 0.08334, 0.74236],
		    "928": [0, 0.68333, 0.08125, 0.05556, 0.83125],
		    "931": [0, 0.68333, 0.05764, 0.08334, 0.77986],
		    "933": [0, 0.68333, 0.13889, 0.05556, 0.58333],
		    "934": [0, 0.68333, 0, 0.08334, 0.66667],
		    "936": [0, 0.68333, 0.11, 0.05556, 0.61222],
		    "937": [0, 0.68333, 0.05017, 0.08334, 0.7724],
		    "945": [0, 0.43056, 0.0037, 0.02778, 0.6397],
		    "946": [0.19444, 0.69444, 0.05278, 0.08334, 0.56563],
		    "947": [0.19444, 0.43056, 0.05556, 0, 0.51773],
		    "948": [0, 0.69444, 0.03785, 0.05556, 0.44444],
		    "949": [0, 0.43056, 0, 0.08334, 0.46632],
		    "950": [0.19444, 0.69444, 0.07378, 0.08334, 0.4375],
		    "951": [0.19444, 0.43056, 0.03588, 0.05556, 0.49653],
		    "952": [0, 0.69444, 0.02778, 0.08334, 0.46944],
		    "953": [0, 0.43056, 0, 0.05556, 0.35394],
		    "954": [0, 0.43056, 0, 0, 0.57616],
		    "955": [0, 0.69444, 0, 0, 0.58334],
		    "956": [0.19444, 0.43056, 0, 0.02778, 0.60255],
		    "957": [0, 0.43056, 0.06366, 0.02778, 0.49398],
		    "958": [0.19444, 0.69444, 0.04601, 0.11111, 0.4375],
		    "959": [0, 0.43056, 0, 0.05556, 0.48472],
		    "960": [0, 0.43056, 0.03588, 0, 0.57003],
		    "961": [0.19444, 0.43056, 0, 0.08334, 0.51702],
		    "962": [0.09722, 0.43056, 0.07986, 0.08334, 0.36285],
		    "963": [0, 0.43056, 0.03588, 0, 0.57141],
		    "964": [0, 0.43056, 0.1132, 0.02778, 0.43715],
		    "965": [0, 0.43056, 0.03588, 0.02778, 0.54028],
		    "966": [0.19444, 0.43056, 0, 0.08334, 0.65417],
		    "967": [0.19444, 0.43056, 0, 0.05556, 0.62569],
		    "968": [0.19444, 0.69444, 0.03588, 0.11111, 0.65139],
		    "969": [0, 0.43056, 0.03588, 0, 0.62245],
		    "977": [0, 0.69444, 0, 0.08334, 0.59144],
		    "981": [0.19444, 0.69444, 0, 0.08334, 0.59583],
		    "982": [0, 0.43056, 0.02778, 0, 0.82813],
		    "1009": [0.19444, 0.43056, 0, 0.08334, 0.51702],
		    "1013": [0, 0.43056, 0, 0.05556, 0.4059],
		    "57649": [0, 0.43056, 0, 0.02778, 0.32246],
		    "57911": [0.19444, 0.43056, 0, 0.08334, 0.38403]
		  },
		  "SansSerif-Bold": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0, 0, 0.36667],
		    "34": [0, 0.69444, 0, 0, 0.55834],
		    "35": [0.19444, 0.69444, 0, 0, 0.91667],
		    "36": [0.05556, 0.75, 0, 0, 0.55],
		    "37": [0.05556, 0.75, 0, 0, 1.02912],
		    "38": [0, 0.69444, 0, 0, 0.83056],
		    "39": [0, 0.69444, 0, 0, 0.30556],
		    "40": [0.25, 0.75, 0, 0, 0.42778],
		    "41": [0.25, 0.75, 0, 0, 0.42778],
		    "42": [0, 0.75, 0, 0, 0.55],
		    "43": [0.11667, 0.61667, 0, 0, 0.85556],
		    "44": [0.10556, 0.13056, 0, 0, 0.30556],
		    "45": [0, 0.45833, 0, 0, 0.36667],
		    "46": [0, 0.13056, 0, 0, 0.30556],
		    "47": [0.25, 0.75, 0, 0, 0.55],
		    "48": [0, 0.69444, 0, 0, 0.55],
		    "49": [0, 0.69444, 0, 0, 0.55],
		    "50": [0, 0.69444, 0, 0, 0.55],
		    "51": [0, 0.69444, 0, 0, 0.55],
		    "52": [0, 0.69444, 0, 0, 0.55],
		    "53": [0, 0.69444, 0, 0, 0.55],
		    "54": [0, 0.69444, 0, 0, 0.55],
		    "55": [0, 0.69444, 0, 0, 0.55],
		    "56": [0, 0.69444, 0, 0, 0.55],
		    "57": [0, 0.69444, 0, 0, 0.55],
		    "58": [0, 0.45833, 0, 0, 0.30556],
		    "59": [0.10556, 0.45833, 0, 0, 0.30556],
		    "61": [-0.09375, 0.40625, 0, 0, 0.85556],
		    "63": [0, 0.69444, 0, 0, 0.51945],
		    "64": [0, 0.69444, 0, 0, 0.73334],
		    "65": [0, 0.69444, 0, 0, 0.73334],
		    "66": [0, 0.69444, 0, 0, 0.73334],
		    "67": [0, 0.69444, 0, 0, 0.70278],
		    "68": [0, 0.69444, 0, 0, 0.79445],
		    "69": [0, 0.69444, 0, 0, 0.64167],
		    "70": [0, 0.69444, 0, 0, 0.61111],
		    "71": [0, 0.69444, 0, 0, 0.73334],
		    "72": [0, 0.69444, 0, 0, 0.79445],
		    "73": [0, 0.69444, 0, 0, 0.33056],
		    "74": [0, 0.69444, 0, 0, 0.51945],
		    "75": [0, 0.69444, 0, 0, 0.76389],
		    "76": [0, 0.69444, 0, 0, 0.58056],
		    "77": [0, 0.69444, 0, 0, 0.97778],
		    "78": [0, 0.69444, 0, 0, 0.79445],
		    "79": [0, 0.69444, 0, 0, 0.79445],
		    "80": [0, 0.69444, 0, 0, 0.70278],
		    "81": [0.10556, 0.69444, 0, 0, 0.79445],
		    "82": [0, 0.69444, 0, 0, 0.70278],
		    "83": [0, 0.69444, 0, 0, 0.61111],
		    "84": [0, 0.69444, 0, 0, 0.73334],
		    "85": [0, 0.69444, 0, 0, 0.76389],
		    "86": [0, 0.69444, 0.01528, 0, 0.73334],
		    "87": [0, 0.69444, 0.01528, 0, 1.03889],
		    "88": [0, 0.69444, 0, 0, 0.73334],
		    "89": [0, 0.69444, 0.0275, 0, 0.73334],
		    "90": [0, 0.69444, 0, 0, 0.67223],
		    "91": [0.25, 0.75, 0, 0, 0.34306],
		    "93": [0.25, 0.75, 0, 0, 0.34306],
		    "94": [0, 0.69444, 0, 0, 0.55],
		    "95": [0.35, 0.10833, 0.03056, 0, 0.55],
		    "97": [0, 0.45833, 0, 0, 0.525],
		    "98": [0, 0.69444, 0, 0, 0.56111],
		    "99": [0, 0.45833, 0, 0, 0.48889],
		    "100": [0, 0.69444, 0, 0, 0.56111],
		    "101": [0, 0.45833, 0, 0, 0.51111],
		    "102": [0, 0.69444, 0.07639, 0, 0.33611],
		    "103": [0.19444, 0.45833, 0.01528, 0, 0.55],
		    "104": [0, 0.69444, 0, 0, 0.56111],
		    "105": [0, 0.69444, 0, 0, 0.25556],
		    "106": [0.19444, 0.69444, 0, 0, 0.28611],
		    "107": [0, 0.69444, 0, 0, 0.53056],
		    "108": [0, 0.69444, 0, 0, 0.25556],
		    "109": [0, 0.45833, 0, 0, 0.86667],
		    "110": [0, 0.45833, 0, 0, 0.56111],
		    "111": [0, 0.45833, 0, 0, 0.55],
		    "112": [0.19444, 0.45833, 0, 0, 0.56111],
		    "113": [0.19444, 0.45833, 0, 0, 0.56111],
		    "114": [0, 0.45833, 0.01528, 0, 0.37222],
		    "115": [0, 0.45833, 0, 0, 0.42167],
		    "116": [0, 0.58929, 0, 0, 0.40417],
		    "117": [0, 0.45833, 0, 0, 0.56111],
		    "118": [0, 0.45833, 0.01528, 0, 0.5],
		    "119": [0, 0.45833, 0.01528, 0, 0.74445],
		    "120": [0, 0.45833, 0, 0, 0.5],
		    "121": [0.19444, 0.45833, 0.01528, 0, 0.5],
		    "122": [0, 0.45833, 0, 0, 0.47639],
		    "126": [0.35, 0.34444, 0, 0, 0.55],
		    "160": [0, 0, 0, 0, 0.25],
		    "168": [0, 0.69444, 0, 0, 0.55],
		    "176": [0, 0.69444, 0, 0, 0.73334],
		    "180": [0, 0.69444, 0, 0, 0.55],
		    "184": [0.17014, 0, 0, 0, 0.48889],
		    "305": [0, 0.45833, 0, 0, 0.25556],
		    "567": [0.19444, 0.45833, 0, 0, 0.28611],
		    "710": [0, 0.69444, 0, 0, 0.55],
		    "711": [0, 0.63542, 0, 0, 0.55],
		    "713": [0, 0.63778, 0, 0, 0.55],
		    "728": [0, 0.69444, 0, 0, 0.55],
		    "729": [0, 0.69444, 0, 0, 0.30556],
		    "730": [0, 0.69444, 0, 0, 0.73334],
		    "732": [0, 0.69444, 0, 0, 0.55],
		    "733": [0, 0.69444, 0, 0, 0.55],
		    "915": [0, 0.69444, 0, 0, 0.58056],
		    "916": [0, 0.69444, 0, 0, 0.91667],
		    "920": [0, 0.69444, 0, 0, 0.85556],
		    "923": [0, 0.69444, 0, 0, 0.67223],
		    "926": [0, 0.69444, 0, 0, 0.73334],
		    "928": [0, 0.69444, 0, 0, 0.79445],
		    "931": [0, 0.69444, 0, 0, 0.79445],
		    "933": [0, 0.69444, 0, 0, 0.85556],
		    "934": [0, 0.69444, 0, 0, 0.79445],
		    "936": [0, 0.69444, 0, 0, 0.85556],
		    "937": [0, 0.69444, 0, 0, 0.79445],
		    "8211": [0, 0.45833, 0.03056, 0, 0.55],
		    "8212": [0, 0.45833, 0.03056, 0, 1.10001],
		    "8216": [0, 0.69444, 0, 0, 0.30556],
		    "8217": [0, 0.69444, 0, 0, 0.30556],
		    "8220": [0, 0.69444, 0, 0, 0.55834],
		    "8221": [0, 0.69444, 0, 0, 0.55834]
		  },
		  "SansSerif-Italic": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0.05733, 0, 0.31945],
		    "34": [0, 0.69444, 0.00316, 0, 0.5],
		    "35": [0.19444, 0.69444, 0.05087, 0, 0.83334],
		    "36": [0.05556, 0.75, 0.11156, 0, 0.5],
		    "37": [0.05556, 0.75, 0.03126, 0, 0.83334],
		    "38": [0, 0.69444, 0.03058, 0, 0.75834],
		    "39": [0, 0.69444, 0.07816, 0, 0.27778],
		    "40": [0.25, 0.75, 0.13164, 0, 0.38889],
		    "41": [0.25, 0.75, 0.02536, 0, 0.38889],
		    "42": [0, 0.75, 0.11775, 0, 0.5],
		    "43": [0.08333, 0.58333, 0.02536, 0, 0.77778],
		    "44": [0.125, 0.08333, 0, 0, 0.27778],
		    "45": [0, 0.44444, 0.01946, 0, 0.33333],
		    "46": [0, 0.08333, 0, 0, 0.27778],
		    "47": [0.25, 0.75, 0.13164, 0, 0.5],
		    "48": [0, 0.65556, 0.11156, 0, 0.5],
		    "49": [0, 0.65556, 0.11156, 0, 0.5],
		    "50": [0, 0.65556, 0.11156, 0, 0.5],
		    "51": [0, 0.65556, 0.11156, 0, 0.5],
		    "52": [0, 0.65556, 0.11156, 0, 0.5],
		    "53": [0, 0.65556, 0.11156, 0, 0.5],
		    "54": [0, 0.65556, 0.11156, 0, 0.5],
		    "55": [0, 0.65556, 0.11156, 0, 0.5],
		    "56": [0, 0.65556, 0.11156, 0, 0.5],
		    "57": [0, 0.65556, 0.11156, 0, 0.5],
		    "58": [0, 0.44444, 0.02502, 0, 0.27778],
		    "59": [0.125, 0.44444, 0.02502, 0, 0.27778],
		    "61": [-0.13, 0.37, 0.05087, 0, 0.77778],
		    "63": [0, 0.69444, 0.11809, 0, 0.47222],
		    "64": [0, 0.69444, 0.07555, 0, 0.66667],
		    "65": [0, 0.69444, 0, 0, 0.66667],
		    "66": [0, 0.69444, 0.08293, 0, 0.66667],
		    "67": [0, 0.69444, 0.11983, 0, 0.63889],
		    "68": [0, 0.69444, 0.07555, 0, 0.72223],
		    "69": [0, 0.69444, 0.11983, 0, 0.59722],
		    "70": [0, 0.69444, 0.13372, 0, 0.56945],
		    "71": [0, 0.69444, 0.11983, 0, 0.66667],
		    "72": [0, 0.69444, 0.08094, 0, 0.70834],
		    "73": [0, 0.69444, 0.13372, 0, 0.27778],
		    "74": [0, 0.69444, 0.08094, 0, 0.47222],
		    "75": [0, 0.69444, 0.11983, 0, 0.69445],
		    "76": [0, 0.69444, 0, 0, 0.54167],
		    "77": [0, 0.69444, 0.08094, 0, 0.875],
		    "78": [0, 0.69444, 0.08094, 0, 0.70834],
		    "79": [0, 0.69444, 0.07555, 0, 0.73611],
		    "80": [0, 0.69444, 0.08293, 0, 0.63889],
		    "81": [0.125, 0.69444, 0.07555, 0, 0.73611],
		    "82": [0, 0.69444, 0.08293, 0, 0.64584],
		    "83": [0, 0.69444, 0.09205, 0, 0.55556],
		    "84": [0, 0.69444, 0.13372, 0, 0.68056],
		    "85": [0, 0.69444, 0.08094, 0, 0.6875],
		    "86": [0, 0.69444, 0.1615, 0, 0.66667],
		    "87": [0, 0.69444, 0.1615, 0, 0.94445],
		    "88": [0, 0.69444, 0.13372, 0, 0.66667],
		    "89": [0, 0.69444, 0.17261, 0, 0.66667],
		    "90": [0, 0.69444, 0.11983, 0, 0.61111],
		    "91": [0.25, 0.75, 0.15942, 0, 0.28889],
		    "93": [0.25, 0.75, 0.08719, 0, 0.28889],
		    "94": [0, 0.69444, 0.0799, 0, 0.5],
		    "95": [0.35, 0.09444, 0.08616, 0, 0.5],
		    "97": [0, 0.44444, 0.00981, 0, 0.48056],
		    "98": [0, 0.69444, 0.03057, 0, 0.51667],
		    "99": [0, 0.44444, 0.08336, 0, 0.44445],
		    "100": [0, 0.69444, 0.09483, 0, 0.51667],
		    "101": [0, 0.44444, 0.06778, 0, 0.44445],
		    "102": [0, 0.69444, 0.21705, 0, 0.30556],
		    "103": [0.19444, 0.44444, 0.10836, 0, 0.5],
		    "104": [0, 0.69444, 0.01778, 0, 0.51667],
		    "105": [0, 0.67937, 0.09718, 0, 0.23889],
		    "106": [0.19444, 0.67937, 0.09162, 0, 0.26667],
		    "107": [0, 0.69444, 0.08336, 0, 0.48889],
		    "108": [0, 0.69444, 0.09483, 0, 0.23889],
		    "109": [0, 0.44444, 0.01778, 0, 0.79445],
		    "110": [0, 0.44444, 0.01778, 0, 0.51667],
		    "111": [0, 0.44444, 0.06613, 0, 0.5],
		    "112": [0.19444, 0.44444, 0.0389, 0, 0.51667],
		    "113": [0.19444, 0.44444, 0.04169, 0, 0.51667],
		    "114": [0, 0.44444, 0.10836, 0, 0.34167],
		    "115": [0, 0.44444, 0.0778, 0, 0.38333],
		    "116": [0, 0.57143, 0.07225, 0, 0.36111],
		    "117": [0, 0.44444, 0.04169, 0, 0.51667],
		    "118": [0, 0.44444, 0.10836, 0, 0.46111],
		    "119": [0, 0.44444, 0.10836, 0, 0.68334],
		    "120": [0, 0.44444, 0.09169, 0, 0.46111],
		    "121": [0.19444, 0.44444, 0.10836, 0, 0.46111],
		    "122": [0, 0.44444, 0.08752, 0, 0.43472],
		    "126": [0.35, 0.32659, 0.08826, 0, 0.5],
		    "160": [0, 0, 0, 0, 0.25],
		    "168": [0, 0.67937, 0.06385, 0, 0.5],
		    "176": [0, 0.69444, 0, 0, 0.73752],
		    "184": [0.17014, 0, 0, 0, 0.44445],
		    "305": [0, 0.44444, 0.04169, 0, 0.23889],
		    "567": [0.19444, 0.44444, 0.04169, 0, 0.26667],
		    "710": [0, 0.69444, 0.0799, 0, 0.5],
		    "711": [0, 0.63194, 0.08432, 0, 0.5],
		    "713": [0, 0.60889, 0.08776, 0, 0.5],
		    "714": [0, 0.69444, 0.09205, 0, 0.5],
		    "715": [0, 0.69444, 0, 0, 0.5],
		    "728": [0, 0.69444, 0.09483, 0, 0.5],
		    "729": [0, 0.67937, 0.07774, 0, 0.27778],
		    "730": [0, 0.69444, 0, 0, 0.73752],
		    "732": [0, 0.67659, 0.08826, 0, 0.5],
		    "733": [0, 0.69444, 0.09205, 0, 0.5],
		    "915": [0, 0.69444, 0.13372, 0, 0.54167],
		    "916": [0, 0.69444, 0, 0, 0.83334],
		    "920": [0, 0.69444, 0.07555, 0, 0.77778],
		    "923": [0, 0.69444, 0, 0, 0.61111],
		    "926": [0, 0.69444, 0.12816, 0, 0.66667],
		    "928": [0, 0.69444, 0.08094, 0, 0.70834],
		    "931": [0, 0.69444, 0.11983, 0, 0.72222],
		    "933": [0, 0.69444, 0.09031, 0, 0.77778],
		    "934": [0, 0.69444, 0.04603, 0, 0.72222],
		    "936": [0, 0.69444, 0.09031, 0, 0.77778],
		    "937": [0, 0.69444, 0.08293, 0, 0.72222],
		    "8211": [0, 0.44444, 0.08616, 0, 0.5],
		    "8212": [0, 0.44444, 0.08616, 0, 1.0],
		    "8216": [0, 0.69444, 0.07816, 0, 0.27778],
		    "8217": [0, 0.69444, 0.07816, 0, 0.27778],
		    "8220": [0, 0.69444, 0.14205, 0, 0.5],
		    "8221": [0, 0.69444, 0.00316, 0, 0.5]
		  },
		  "SansSerif-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "33": [0, 0.69444, 0, 0, 0.31945],
		    "34": [0, 0.69444, 0, 0, 0.5],
		    "35": [0.19444, 0.69444, 0, 0, 0.83334],
		    "36": [0.05556, 0.75, 0, 0, 0.5],
		    "37": [0.05556, 0.75, 0, 0, 0.83334],
		    "38": [0, 0.69444, 0, 0, 0.75834],
		    "39": [0, 0.69444, 0, 0, 0.27778],
		    "40": [0.25, 0.75, 0, 0, 0.38889],
		    "41": [0.25, 0.75, 0, 0, 0.38889],
		    "42": [0, 0.75, 0, 0, 0.5],
		    "43": [0.08333, 0.58333, 0, 0, 0.77778],
		    "44": [0.125, 0.08333, 0, 0, 0.27778],
		    "45": [0, 0.44444, 0, 0, 0.33333],
		    "46": [0, 0.08333, 0, 0, 0.27778],
		    "47": [0.25, 0.75, 0, 0, 0.5],
		    "48": [0, 0.65556, 0, 0, 0.5],
		    "49": [0, 0.65556, 0, 0, 0.5],
		    "50": [0, 0.65556, 0, 0, 0.5],
		    "51": [0, 0.65556, 0, 0, 0.5],
		    "52": [0, 0.65556, 0, 0, 0.5],
		    "53": [0, 0.65556, 0, 0, 0.5],
		    "54": [0, 0.65556, 0, 0, 0.5],
		    "55": [0, 0.65556, 0, 0, 0.5],
		    "56": [0, 0.65556, 0, 0, 0.5],
		    "57": [0, 0.65556, 0, 0, 0.5],
		    "58": [0, 0.44444, 0, 0, 0.27778],
		    "59": [0.125, 0.44444, 0, 0, 0.27778],
		    "61": [-0.13, 0.37, 0, 0, 0.77778],
		    "63": [0, 0.69444, 0, 0, 0.47222],
		    "64": [0, 0.69444, 0, 0, 0.66667],
		    "65": [0, 0.69444, 0, 0, 0.66667],
		    "66": [0, 0.69444, 0, 0, 0.66667],
		    "67": [0, 0.69444, 0, 0, 0.63889],
		    "68": [0, 0.69444, 0, 0, 0.72223],
		    "69": [0, 0.69444, 0, 0, 0.59722],
		    "70": [0, 0.69444, 0, 0, 0.56945],
		    "71": [0, 0.69444, 0, 0, 0.66667],
		    "72": [0, 0.69444, 0, 0, 0.70834],
		    "73": [0, 0.69444, 0, 0, 0.27778],
		    "74": [0, 0.69444, 0, 0, 0.47222],
		    "75": [0, 0.69444, 0, 0, 0.69445],
		    "76": [0, 0.69444, 0, 0, 0.54167],
		    "77": [0, 0.69444, 0, 0, 0.875],
		    "78": [0, 0.69444, 0, 0, 0.70834],
		    "79": [0, 0.69444, 0, 0, 0.73611],
		    "80": [0, 0.69444, 0, 0, 0.63889],
		    "81": [0.125, 0.69444, 0, 0, 0.73611],
		    "82": [0, 0.69444, 0, 0, 0.64584],
		    "83": [0, 0.69444, 0, 0, 0.55556],
		    "84": [0, 0.69444, 0, 0, 0.68056],
		    "85": [0, 0.69444, 0, 0, 0.6875],
		    "86": [0, 0.69444, 0.01389, 0, 0.66667],
		    "87": [0, 0.69444, 0.01389, 0, 0.94445],
		    "88": [0, 0.69444, 0, 0, 0.66667],
		    "89": [0, 0.69444, 0.025, 0, 0.66667],
		    "90": [0, 0.69444, 0, 0, 0.61111],
		    "91": [0.25, 0.75, 0, 0, 0.28889],
		    "93": [0.25, 0.75, 0, 0, 0.28889],
		    "94": [0, 0.69444, 0, 0, 0.5],
		    "95": [0.35, 0.09444, 0.02778, 0, 0.5],
		    "97": [0, 0.44444, 0, 0, 0.48056],
		    "98": [0, 0.69444, 0, 0, 0.51667],
		    "99": [0, 0.44444, 0, 0, 0.44445],
		    "100": [0, 0.69444, 0, 0, 0.51667],
		    "101": [0, 0.44444, 0, 0, 0.44445],
		    "102": [0, 0.69444, 0.06944, 0, 0.30556],
		    "103": [0.19444, 0.44444, 0.01389, 0, 0.5],
		    "104": [0, 0.69444, 0, 0, 0.51667],
		    "105": [0, 0.67937, 0, 0, 0.23889],
		    "106": [0.19444, 0.67937, 0, 0, 0.26667],
		    "107": [0, 0.69444, 0, 0, 0.48889],
		    "108": [0, 0.69444, 0, 0, 0.23889],
		    "109": [0, 0.44444, 0, 0, 0.79445],
		    "110": [0, 0.44444, 0, 0, 0.51667],
		    "111": [0, 0.44444, 0, 0, 0.5],
		    "112": [0.19444, 0.44444, 0, 0, 0.51667],
		    "113": [0.19444, 0.44444, 0, 0, 0.51667],
		    "114": [0, 0.44444, 0.01389, 0, 0.34167],
		    "115": [0, 0.44444, 0, 0, 0.38333],
		    "116": [0, 0.57143, 0, 0, 0.36111],
		    "117": [0, 0.44444, 0, 0, 0.51667],
		    "118": [0, 0.44444, 0.01389, 0, 0.46111],
		    "119": [0, 0.44444, 0.01389, 0, 0.68334],
		    "120": [0, 0.44444, 0, 0, 0.46111],
		    "121": [0.19444, 0.44444, 0.01389, 0, 0.46111],
		    "122": [0, 0.44444, 0, 0, 0.43472],
		    "126": [0.35, 0.32659, 0, 0, 0.5],
		    "160": [0, 0, 0, 0, 0.25],
		    "168": [0, 0.67937, 0, 0, 0.5],
		    "176": [0, 0.69444, 0, 0, 0.66667],
		    "184": [0.17014, 0, 0, 0, 0.44445],
		    "305": [0, 0.44444, 0, 0, 0.23889],
		    "567": [0.19444, 0.44444, 0, 0, 0.26667],
		    "710": [0, 0.69444, 0, 0, 0.5],
		    "711": [0, 0.63194, 0, 0, 0.5],
		    "713": [0, 0.60889, 0, 0, 0.5],
		    "714": [0, 0.69444, 0, 0, 0.5],
		    "715": [0, 0.69444, 0, 0, 0.5],
		    "728": [0, 0.69444, 0, 0, 0.5],
		    "729": [0, 0.67937, 0, 0, 0.27778],
		    "730": [0, 0.69444, 0, 0, 0.66667],
		    "732": [0, 0.67659, 0, 0, 0.5],
		    "733": [0, 0.69444, 0, 0, 0.5],
		    "915": [0, 0.69444, 0, 0, 0.54167],
		    "916": [0, 0.69444, 0, 0, 0.83334],
		    "920": [0, 0.69444, 0, 0, 0.77778],
		    "923": [0, 0.69444, 0, 0, 0.61111],
		    "926": [0, 0.69444, 0, 0, 0.66667],
		    "928": [0, 0.69444, 0, 0, 0.70834],
		    "931": [0, 0.69444, 0, 0, 0.72222],
		    "933": [0, 0.69444, 0, 0, 0.77778],
		    "934": [0, 0.69444, 0, 0, 0.72222],
		    "936": [0, 0.69444, 0, 0, 0.77778],
		    "937": [0, 0.69444, 0, 0, 0.72222],
		    "8211": [0, 0.44444, 0.02778, 0, 0.5],
		    "8212": [0, 0.44444, 0.02778, 0, 1.0],
		    "8216": [0, 0.69444, 0, 0, 0.27778],
		    "8217": [0, 0.69444, 0, 0, 0.27778],
		    "8220": [0, 0.69444, 0, 0, 0.5],
		    "8221": [0, 0.69444, 0, 0, 0.5]
		  },
		  "Script-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "65": [0, 0.7, 0.22925, 0, 0.80253],
		    "66": [0, 0.7, 0.04087, 0, 0.90757],
		    "67": [0, 0.7, 0.1689, 0, 0.66619],
		    "68": [0, 0.7, 0.09371, 0, 0.77443],
		    "69": [0, 0.7, 0.18583, 0, 0.56162],
		    "70": [0, 0.7, 0.13634, 0, 0.89544],
		    "71": [0, 0.7, 0.17322, 0, 0.60961],
		    "72": [0, 0.7, 0.29694, 0, 0.96919],
		    "73": [0, 0.7, 0.19189, 0, 0.80907],
		    "74": [0.27778, 0.7, 0.19189, 0, 1.05159],
		    "75": [0, 0.7, 0.31259, 0, 0.91364],
		    "76": [0, 0.7, 0.19189, 0, 0.87373],
		    "77": [0, 0.7, 0.15981, 0, 1.08031],
		    "78": [0, 0.7, 0.3525, 0, 0.9015],
		    "79": [0, 0.7, 0.08078, 0, 0.73787],
		    "80": [0, 0.7, 0.08078, 0, 1.01262],
		    "81": [0, 0.7, 0.03305, 0, 0.88282],
		    "82": [0, 0.7, 0.06259, 0, 0.85],
		    "83": [0, 0.7, 0.19189, 0, 0.86767],
		    "84": [0, 0.7, 0.29087, 0, 0.74697],
		    "85": [0, 0.7, 0.25815, 0, 0.79996],
		    "86": [0, 0.7, 0.27523, 0, 0.62204],
		    "87": [0, 0.7, 0.27523, 0, 0.80532],
		    "88": [0, 0.7, 0.26006, 0, 0.94445],
		    "89": [0, 0.7, 0.2939, 0, 0.70961],
		    "90": [0, 0.7, 0.24037, 0, 0.8212],
		    "160": [0, 0, 0, 0, 0.25]
		  },
		  "Size1-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "40": [0.35001, 0.85, 0, 0, 0.45834],
		    "41": [0.35001, 0.85, 0, 0, 0.45834],
		    "47": [0.35001, 0.85, 0, 0, 0.57778],
		    "91": [0.35001, 0.85, 0, 0, 0.41667],
		    "92": [0.35001, 0.85, 0, 0, 0.57778],
		    "93": [0.35001, 0.85, 0, 0, 0.41667],
		    "123": [0.35001, 0.85, 0, 0, 0.58334],
		    "125": [0.35001, 0.85, 0, 0, 0.58334],
		    "160": [0, 0, 0, 0, 0.25],
		    "710": [0, 0.72222, 0, 0, 0.55556],
		    "732": [0, 0.72222, 0, 0, 0.55556],
		    "770": [0, 0.72222, 0, 0, 0.55556],
		    "771": [0, 0.72222, 0, 0, 0.55556],
		    "8214": [-0.00099, 0.601, 0, 0, 0.77778],
		    "8593": [1e-05, 0.6, 0, 0, 0.66667],
		    "8595": [1e-05, 0.6, 0, 0, 0.66667],
		    "8657": [1e-05, 0.6, 0, 0, 0.77778],
		    "8659": [1e-05, 0.6, 0, 0, 0.77778],
		    "8719": [0.25001, 0.75, 0, 0, 0.94445],
		    "8720": [0.25001, 0.75, 0, 0, 0.94445],
		    "8721": [0.25001, 0.75, 0, 0, 1.05556],
		    "8730": [0.35001, 0.85, 0, 0, 1.0],
		    "8739": [-0.00599, 0.606, 0, 0, 0.33333],
		    "8741": [-0.00599, 0.606, 0, 0, 0.55556],
		    "8747": [0.30612, 0.805, 0.19445, 0, 0.47222],
		    "8748": [0.306, 0.805, 0.19445, 0, 0.47222],
		    "8749": [0.306, 0.805, 0.19445, 0, 0.47222],
		    "8750": [0.30612, 0.805, 0.19445, 0, 0.47222],
		    "8896": [0.25001, 0.75, 0, 0, 0.83334],
		    "8897": [0.25001, 0.75, 0, 0, 0.83334],
		    "8898": [0.25001, 0.75, 0, 0, 0.83334],
		    "8899": [0.25001, 0.75, 0, 0, 0.83334],
		    "8968": [0.35001, 0.85, 0, 0, 0.47222],
		    "8969": [0.35001, 0.85, 0, 0, 0.47222],
		    "8970": [0.35001, 0.85, 0, 0, 0.47222],
		    "8971": [0.35001, 0.85, 0, 0, 0.47222],
		    "9168": [-0.00099, 0.601, 0, 0, 0.66667],
		    "10216": [0.35001, 0.85, 0, 0, 0.47222],
		    "10217": [0.35001, 0.85, 0, 0, 0.47222],
		    "10752": [0.25001, 0.75, 0, 0, 1.11111],
		    "10753": [0.25001, 0.75, 0, 0, 1.11111],
		    "10754": [0.25001, 0.75, 0, 0, 1.11111],
		    "10756": [0.25001, 0.75, 0, 0, 0.83334],
		    "10758": [0.25001, 0.75, 0, 0, 0.83334]
		  },
		  "Size2-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "40": [0.65002, 1.15, 0, 0, 0.59722],
		    "41": [0.65002, 1.15, 0, 0, 0.59722],
		    "47": [0.65002, 1.15, 0, 0, 0.81111],
		    "91": [0.65002, 1.15, 0, 0, 0.47222],
		    "92": [0.65002, 1.15, 0, 0, 0.81111],
		    "93": [0.65002, 1.15, 0, 0, 0.47222],
		    "123": [0.65002, 1.15, 0, 0, 0.66667],
		    "125": [0.65002, 1.15, 0, 0, 0.66667],
		    "160": [0, 0, 0, 0, 0.25],
		    "710": [0, 0.75, 0, 0, 1.0],
		    "732": [0, 0.75, 0, 0, 1.0],
		    "770": [0, 0.75, 0, 0, 1.0],
		    "771": [0, 0.75, 0, 0, 1.0],
		    "8719": [0.55001, 1.05, 0, 0, 1.27778],
		    "8720": [0.55001, 1.05, 0, 0, 1.27778],
		    "8721": [0.55001, 1.05, 0, 0, 1.44445],
		    "8730": [0.65002, 1.15, 0, 0, 1.0],
		    "8747": [0.86225, 1.36, 0.44445, 0, 0.55556],
		    "8748": [0.862, 1.36, 0.44445, 0, 0.55556],
		    "8749": [0.862, 1.36, 0.44445, 0, 0.55556],
		    "8750": [0.86225, 1.36, 0.44445, 0, 0.55556],
		    "8896": [0.55001, 1.05, 0, 0, 1.11111],
		    "8897": [0.55001, 1.05, 0, 0, 1.11111],
		    "8898": [0.55001, 1.05, 0, 0, 1.11111],
		    "8899": [0.55001, 1.05, 0, 0, 1.11111],
		    "8968": [0.65002, 1.15, 0, 0, 0.52778],
		    "8969": [0.65002, 1.15, 0, 0, 0.52778],
		    "8970": [0.65002, 1.15, 0, 0, 0.52778],
		    "8971": [0.65002, 1.15, 0, 0, 0.52778],
		    "10216": [0.65002, 1.15, 0, 0, 0.61111],
		    "10217": [0.65002, 1.15, 0, 0, 0.61111],
		    "10752": [0.55001, 1.05, 0, 0, 1.51112],
		    "10753": [0.55001, 1.05, 0, 0, 1.51112],
		    "10754": [0.55001, 1.05, 0, 0, 1.51112],
		    "10756": [0.55001, 1.05, 0, 0, 1.11111],
		    "10758": [0.55001, 1.05, 0, 0, 1.11111]
		  },
		  "Size3-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "40": [0.95003, 1.45, 0, 0, 0.73611],
		    "41": [0.95003, 1.45, 0, 0, 0.73611],
		    "47": [0.95003, 1.45, 0, 0, 1.04445],
		    "91": [0.95003, 1.45, 0, 0, 0.52778],
		    "92": [0.95003, 1.45, 0, 0, 1.04445],
		    "93": [0.95003, 1.45, 0, 0, 0.52778],
		    "123": [0.95003, 1.45, 0, 0, 0.75],
		    "125": [0.95003, 1.45, 0, 0, 0.75],
		    "160": [0, 0, 0, 0, 0.25],
		    "710": [0, 0.75, 0, 0, 1.44445],
		    "732": [0, 0.75, 0, 0, 1.44445],
		    "770": [0, 0.75, 0, 0, 1.44445],
		    "771": [0, 0.75, 0, 0, 1.44445],
		    "8730": [0.95003, 1.45, 0, 0, 1.0],
		    "8968": [0.95003, 1.45, 0, 0, 0.58334],
		    "8969": [0.95003, 1.45, 0, 0, 0.58334],
		    "8970": [0.95003, 1.45, 0, 0, 0.58334],
		    "8971": [0.95003, 1.45, 0, 0, 0.58334],
		    "10216": [0.95003, 1.45, 0, 0, 0.75],
		    "10217": [0.95003, 1.45, 0, 0, 0.75]
		  },
		  "Size4-Regular": {
		    "32": [0, 0, 0, 0, 0.25],
		    "40": [1.25003, 1.75, 0, 0, 0.79167],
		    "41": [1.25003, 1.75, 0, 0, 0.79167],
		    "47": [1.25003, 1.75, 0, 0, 1.27778],
		    "91": [1.25003, 1.75, 0, 0, 0.58334],
		    "92": [1.25003, 1.75, 0, 0, 1.27778],
		    "93": [1.25003, 1.75, 0, 0, 0.58334],
		    "123": [1.25003, 1.75, 0, 0, 0.80556],
		    "125": [1.25003, 1.75, 0, 0, 0.80556],
		    "160": [0, 0, 0, 0, 0.25],
		    "710": [0, 0.825, 0, 0, 1.8889],
		    "732": [0, 0.825, 0, 0, 1.8889],
		    "770": [0, 0.825, 0, 0, 1.8889],
		    "771": [0, 0.825, 0, 0, 1.8889],
		    "8730": [1.25003, 1.75, 0, 0, 1.0],
		    "8968": [1.25003, 1.75, 0, 0, 0.63889],
		    "8969": [1.25003, 1.75, 0, 0, 0.63889],
		    "8970": [1.25003, 1.75, 0, 0, 0.63889],
		    "8971": [1.25003, 1.75, 0, 0, 0.63889],
		    "9115": [0.64502, 1.155, 0, 0, 0.875],
		    "9116": [1e-05, 0.6, 0, 0, 0.875],
		    "9117": [0.64502, 1.155, 0, 0, 0.875],
		    "9118": [0.64502, 1.155, 0, 0, 0.875],
		    "9119": [1e-05, 0.6, 0, 0, 0.875],
		    "9120": [0.64502, 1.155, 0, 0, 0.875],
		    "9121": [0.64502, 1.155, 0, 0, 0.66667],
		    "9122": [-0.00099, 0.601, 0, 0, 0.66667],
		    "9123": [0.64502, 1.155, 0, 0, 0.66667],
		    "9124": [0.64502, 1.155, 0, 0, 0.66667],
		    "9125": [-0.00099, 0.601, 0, 0, 0.66667],
		    "9126": [0.64502, 1.155, 0, 0, 0.66667],
		    "9127": [1e-05, 0.9, 0, 0, 0.88889],
		    "9128": [0.65002, 1.15, 0, 0, 0.88889],
		    "9129": [0.90001, 0, 0, 0, 0.88889],
		    "9130": [0, 0.3, 0, 0, 0.88889],
		    "9131": [1e-05, 0.9, 0, 0, 0.88889],
		    "9132": [0.65002, 1.15, 0, 0, 0.88889],
		    "9133": [0.90001, 0, 0, 0, 0.88889],
		    "9143": [0.88502, 0.915, 0, 0, 1.05556],
		    "10216": [1.25003, 1.75, 0, 0, 0.80556],
		    "10217": [1.25003, 1.75, 0, 0, 0.80556],
		    "57344": [-0.00499, 0.605, 0, 0, 1.05556],
		    "57345": [-0.00499, 0.605, 0, 0, 1.05556],
		    "57680": [0, 0.12, 0, 0, 0.45],
		    "57681": [0, 0.12, 0, 0, 0.45],
		    "57682": [0, 0.12, 0, 0, 0.45],
		    "57683": [0, 0.12, 0, 0, 0.45]
		  },
		  "Typewriter-Regular": {
		    "32": [0, 0, 0, 0, 0.525],
		    "33": [0, 0.61111, 0, 0, 0.525],
		    "34": [0, 0.61111, 0, 0, 0.525],
		    "35": [0, 0.61111, 0, 0, 0.525],
		    "36": [0.08333, 0.69444, 0, 0, 0.525],
		    "37": [0.08333, 0.69444, 0, 0, 0.525],
		    "38": [0, 0.61111, 0, 0, 0.525],
		    "39": [0, 0.61111, 0, 0, 0.525],
		    "40": [0.08333, 0.69444, 0, 0, 0.525],
		    "41": [0.08333, 0.69444, 0, 0, 0.525],
		    "42": [0, 0.52083, 0, 0, 0.525],
		    "43": [-0.08056, 0.53055, 0, 0, 0.525],
		    "44": [0.13889, 0.125, 0, 0, 0.525],
		    "45": [-0.08056, 0.53055, 0, 0, 0.525],
		    "46": [0, 0.125, 0, 0, 0.525],
		    "47": [0.08333, 0.69444, 0, 0, 0.525],
		    "48": [0, 0.61111, 0, 0, 0.525],
		    "49": [0, 0.61111, 0, 0, 0.525],
		    "50": [0, 0.61111, 0, 0, 0.525],
		    "51": [0, 0.61111, 0, 0, 0.525],
		    "52": [0, 0.61111, 0, 0, 0.525],
		    "53": [0, 0.61111, 0, 0, 0.525],
		    "54": [0, 0.61111, 0, 0, 0.525],
		    "55": [0, 0.61111, 0, 0, 0.525],
		    "56": [0, 0.61111, 0, 0, 0.525],
		    "57": [0, 0.61111, 0, 0, 0.525],
		    "58": [0, 0.43056, 0, 0, 0.525],
		    "59": [0.13889, 0.43056, 0, 0, 0.525],
		    "60": [-0.05556, 0.55556, 0, 0, 0.525],
		    "61": [-0.19549, 0.41562, 0, 0, 0.525],
		    "62": [-0.05556, 0.55556, 0, 0, 0.525],
		    "63": [0, 0.61111, 0, 0, 0.525],
		    "64": [0, 0.61111, 0, 0, 0.525],
		    "65": [0, 0.61111, 0, 0, 0.525],
		    "66": [0, 0.61111, 0, 0, 0.525],
		    "67": [0, 0.61111, 0, 0, 0.525],
		    "68": [0, 0.61111, 0, 0, 0.525],
		    "69": [0, 0.61111, 0, 0, 0.525],
		    "70": [0, 0.61111, 0, 0, 0.525],
		    "71": [0, 0.61111, 0, 0, 0.525],
		    "72": [0, 0.61111, 0, 0, 0.525],
		    "73": [0, 0.61111, 0, 0, 0.525],
		    "74": [0, 0.61111, 0, 0, 0.525],
		    "75": [0, 0.61111, 0, 0, 0.525],
		    "76": [0, 0.61111, 0, 0, 0.525],
		    "77": [0, 0.61111, 0, 0, 0.525],
		    "78": [0, 0.61111, 0, 0, 0.525],
		    "79": [0, 0.61111, 0, 0, 0.525],
		    "80": [0, 0.61111, 0, 0, 0.525],
		    "81": [0.13889, 0.61111, 0, 0, 0.525],
		    "82": [0, 0.61111, 0, 0, 0.525],
		    "83": [0, 0.61111, 0, 0, 0.525],
		    "84": [0, 0.61111, 0, 0, 0.525],
		    "85": [0, 0.61111, 0, 0, 0.525],
		    "86": [0, 0.61111, 0, 0, 0.525],
		    "87": [0, 0.61111, 0, 0, 0.525],
		    "88": [0, 0.61111, 0, 0, 0.525],
		    "89": [0, 0.61111, 0, 0, 0.525],
		    "90": [0, 0.61111, 0, 0, 0.525],
		    "91": [0.08333, 0.69444, 0, 0, 0.525],
		    "92": [0.08333, 0.69444, 0, 0, 0.525],
		    "93": [0.08333, 0.69444, 0, 0, 0.525],
		    "94": [0, 0.61111, 0, 0, 0.525],
		    "95": [0.09514, 0, 0, 0, 0.525],
		    "96": [0, 0.61111, 0, 0, 0.525],
		    "97": [0, 0.43056, 0, 0, 0.525],
		    "98": [0, 0.61111, 0, 0, 0.525],
		    "99": [0, 0.43056, 0, 0, 0.525],
		    "100": [0, 0.61111, 0, 0, 0.525],
		    "101": [0, 0.43056, 0, 0, 0.525],
		    "102": [0, 0.61111, 0, 0, 0.525],
		    "103": [0.22222, 0.43056, 0, 0, 0.525],
		    "104": [0, 0.61111, 0, 0, 0.525],
		    "105": [0, 0.61111, 0, 0, 0.525],
		    "106": [0.22222, 0.61111, 0, 0, 0.525],
		    "107": [0, 0.61111, 0, 0, 0.525],
		    "108": [0, 0.61111, 0, 0, 0.525],
		    "109": [0, 0.43056, 0, 0, 0.525],
		    "110": [0, 0.43056, 0, 0, 0.525],
		    "111": [0, 0.43056, 0, 0, 0.525],
		    "112": [0.22222, 0.43056, 0, 0, 0.525],
		    "113": [0.22222, 0.43056, 0, 0, 0.525],
		    "114": [0, 0.43056, 0, 0, 0.525],
		    "115": [0, 0.43056, 0, 0, 0.525],
		    "116": [0, 0.55358, 0, 0, 0.525],
		    "117": [0, 0.43056, 0, 0, 0.525],
		    "118": [0, 0.43056, 0, 0, 0.525],
		    "119": [0, 0.43056, 0, 0, 0.525],
		    "120": [0, 0.43056, 0, 0, 0.525],
		    "121": [0.22222, 0.43056, 0, 0, 0.525],
		    "122": [0, 0.43056, 0, 0, 0.525],
		    "123": [0.08333, 0.69444, 0, 0, 0.525],
		    "124": [0.08333, 0.69444, 0, 0, 0.525],
		    "125": [0.08333, 0.69444, 0, 0, 0.525],
		    "126": [0, 0.61111, 0, 0, 0.525],
		    "127": [0, 0.61111, 0, 0, 0.525],
		    "160": [0, 0, 0, 0, 0.525],
		    "176": [0, 0.61111, 0, 0, 0.525],
		    "184": [0.19445, 0, 0, 0, 0.525],
		    "305": [0, 0.43056, 0, 0, 0.525],
		    "567": [0.22222, 0.43056, 0, 0, 0.525],
		    "711": [0, 0.56597, 0, 0, 0.525],
		    "713": [0, 0.56555, 0, 0, 0.525],
		    "714": [0, 0.61111, 0, 0, 0.525],
		    "715": [0, 0.61111, 0, 0, 0.525],
		    "728": [0, 0.61111, 0, 0, 0.525],
		    "730": [0, 0.61111, 0, 0, 0.525],
		    "770": [0, 0.61111, 0, 0, 0.525],
		    "771": [0, 0.61111, 0, 0, 0.525],
		    "776": [0, 0.61111, 0, 0, 0.525],
		    "915": [0, 0.61111, 0, 0, 0.525],
		    "916": [0, 0.61111, 0, 0, 0.525],
		    "920": [0, 0.61111, 0, 0, 0.525],
		    "923": [0, 0.61111, 0, 0, 0.525],
		    "926": [0, 0.61111, 0, 0, 0.525],
		    "928": [0, 0.61111, 0, 0, 0.525],
		    "931": [0, 0.61111, 0, 0, 0.525],
		    "933": [0, 0.61111, 0, 0, 0.525],
		    "934": [0, 0.61111, 0, 0, 0.525],
		    "936": [0, 0.61111, 0, 0, 0.525],
		    "937": [0, 0.61111, 0, 0, 0.525],
		    "8216": [0, 0.61111, 0, 0, 0.525],
		    "8217": [0, 0.61111, 0, 0, 0.525],
		    "8242": [0, 0.61111, 0, 0, 0.525],
		    "9251": [0.11111, 0.21944, 0, 0, 0.525]
		  }
		});


		/**
		 * This file contains metrics regarding fonts and individual symbols. The sigma
		 * and xi variables, as well as the metricMap map contain data extracted from
		 * TeX, TeX font metrics, and the TTF files. These data are then exposed via the
		 * `metrics` variable and the getCharacterMetrics function.
		 */
		// In TeX, there are actually three sets of dimensions, one for each of
		// textstyle (size index 5 and higher: >=9pt), scriptstyle (size index 3 and 4:
		// 7-8pt), and scriptscriptstyle (size index 1 and 2: 5-6pt).  These are
		// provided in the arrays below, in that order.
		//
		// The font metrics are stored in fonts cmsy10, cmsy7, and cmsy5 respectively.
		// This was determined by running the following script:
		//
		//     latex -interaction=nonstopmode \
		//     '\documentclass{article}\usepackage{amsmath}\begin{document}' \
		//     '$a$ \expandafter\show\the\textfont2' \
		//     '\expandafter\show\the\scriptfont2' \
		//     '\expandafter\show\the\scriptscriptfont2' \
		//     '\stop'
		//
		// The metrics themselves were retrieved using the following commands:
		//
		//     tftopl cmsy10
		//     tftopl cmsy7
		//     tftopl cmsy5
		//
		// The output of each of these commands is quite lengthy.  The only part we
		// care about is the FONTDIMEN section. Each value is measured in EMs.
		var sigmasAndXis = {
		  slant: [0.250, 0.250, 0.250],
		  // sigma1
		  space: [0.000, 0.000, 0.000],
		  // sigma2
		  stretch: [0.000, 0.000, 0.000],
		  // sigma3
		  shrink: [0.000, 0.000, 0.000],
		  // sigma4
		  xHeight: [0.431, 0.431, 0.431],
		  // sigma5
		  quad: [1.000, 1.171, 1.472],
		  // sigma6
		  extraSpace: [0.000, 0.000, 0.000],
		  // sigma7
		  num1: [0.677, 0.732, 0.925],
		  // sigma8
		  num2: [0.394, 0.384, 0.387],
		  // sigma9
		  num3: [0.444, 0.471, 0.504],
		  // sigma10
		  denom1: [0.686, 0.752, 1.025],
		  // sigma11
		  denom2: [0.345, 0.344, 0.532],
		  // sigma12
		  sup1: [0.413, 0.503, 0.504],
		  // sigma13
		  sup2: [0.363, 0.431, 0.404],
		  // sigma14
		  sup3: [0.289, 0.286, 0.294],
		  // sigma15
		  sub1: [0.150, 0.143, 0.200],
		  // sigma16
		  sub2: [0.247, 0.286, 0.400],
		  // sigma17
		  supDrop: [0.386, 0.353, 0.494],
		  // sigma18
		  subDrop: [0.050, 0.071, 0.100],
		  // sigma19
		  delim1: [2.390, 1.700, 1.980],
		  // sigma20
		  delim2: [1.010, 1.157, 1.420],
		  // sigma21
		  axisHeight: [0.250, 0.250, 0.250],
		  // sigma22
		  // These font metrics are extracted from TeX by using tftopl on cmex10.tfm;
		  // they correspond to the font parameters of the extension fonts (family 3).
		  // See the TeXbook, page 441. In AMSTeX, the extension fonts scale; to
		  // match cmex7, we'd use cmex7.tfm values for script and scriptscript
		  // values.
		  defaultRuleThickness: [0.04, 0.049, 0.049],
		  // xi8; cmex7: 0.049
		  bigOpSpacing1: [0.111, 0.111, 0.111],
		  // xi9
		  bigOpSpacing2: [0.166, 0.166, 0.166],
		  // xi10
		  bigOpSpacing3: [0.2, 0.2, 0.2],
		  // xi11
		  bigOpSpacing4: [0.6, 0.611, 0.611],
		  // xi12; cmex7: 0.611
		  bigOpSpacing5: [0.1, 0.143, 0.143],
		  // xi13; cmex7: 0.143
		  // The \sqrt rule width is taken from the height of the surd character.
		  // Since we use the same font at all sizes, this thickness doesn't scale.
		  sqrtRuleThickness: [0.04, 0.04, 0.04],
		  // This value determines how large a pt is, for metrics which are defined
		  // in terms of pts.
		  // This value is also used in katex.less; if you change it make sure the
		  // values match.
		  ptPerEm: [10.0, 10.0, 10.0],
		  // The space between adjacent `|` columns in an array definition. From
		  // `\showthe\doublerulesep` in LaTeX. Equals 2.0 / ptPerEm.
		  doubleRuleSep: [0.2, 0.2, 0.2],
		  // The width of separator lines in {array} environments. From
		  // `\showthe\arrayrulewidth` in LaTeX. Equals 0.4 / ptPerEm.
		  arrayRuleWidth: [0.04, 0.04, 0.04],
		  // Two values from LaTeX source2e:
		  fboxsep: [0.3, 0.3, 0.3],
		  //        3 pt / ptPerEm
		  fboxrule: [0.04, 0.04, 0.04] // 0.4 pt / ptPerEm

		}; // This map contains a mapping from font name and character code to character
		// metrics, including height, depth, italic correction, and skew (kern from the
		// character to the corresponding \skewchar)
		// This map is generated via `make metrics`. It should not be changed manually.

		 // These are very rough approximations.  We default to Times New Roman which
		// should have Latin-1 and Cyrillic characters, but may not depending on the
		// operating system.  The metrics do not account for extra height from the
		// accents.  In the case of Cyrillic characters which have both ascenders and
		// descenders we prefer approximations with ascenders, primarily to prevent
		// the fraction bar or root line from intersecting the glyph.
		// TODO(kevinb) allow union of multiple glyph metrics for better accuracy.

		var extraCharacterMap = {
		  // Latin-1
		  'Å': 'A',
		  'Ð': 'D',
		  'Þ': 'o',
		  'å': 'a',
		  'ð': 'd',
		  'þ': 'o',
		  // Cyrillic
		  'А': 'A',
		  'Б': 'B',
		  'В': 'B',
		  'Г': 'F',
		  'Д': 'A',
		  'Е': 'E',
		  'Ж': 'K',
		  'З': '3',
		  'И': 'N',
		  'Й': 'N',
		  'К': 'K',
		  'Л': 'N',
		  'М': 'M',
		  'Н': 'H',
		  'О': 'O',
		  'П': 'N',
		  'Р': 'P',
		  'С': 'C',
		  'Т': 'T',
		  'У': 'y',
		  'Ф': 'O',
		  'Х': 'X',
		  'Ц': 'U',
		  'Ч': 'h',
		  'Ш': 'W',
		  'Щ': 'W',
		  'Ъ': 'B',
		  'Ы': 'X',
		  'Ь': 'B',
		  'Э': '3',
		  'Ю': 'X',
		  'Я': 'R',
		  'а': 'a',
		  'б': 'b',
		  'в': 'a',
		  'г': 'r',
		  'д': 'y',
		  'е': 'e',
		  'ж': 'm',
		  'з': 'e',
		  'и': 'n',
		  'й': 'n',
		  'к': 'n',
		  'л': 'n',
		  'м': 'm',
		  'н': 'n',
		  'о': 'o',
		  'п': 'n',
		  'р': 'p',
		  'с': 'c',
		  'т': 'o',
		  'у': 'y',
		  'ф': 'b',
		  'х': 'x',
		  'ц': 'n',
		  'ч': 'n',
		  'ш': 'w',
		  'щ': 'w',
		  'ъ': 'a',
		  'ы': 'm',
		  'ь': 'a',
		  'э': 'e',
		  'ю': 'm',
		  'я': 'r'
		};

		/**
		 * This function adds new font metrics to default metricMap
		 * It can also override existing metrics
		 */
		function setFontMetrics(fontName, metrics) {
		  fontMetricsData[fontName] = metrics;
		}
		/**
		 * This function is a convenience function for looking up information in the
		 * metricMap table. It takes a character as a string, and a font.
		 *
		 * Note: the `width` property may be undefined if fontMetricsData.js wasn't
		 * built using `Make extended_metrics`.
		 */

		function getCharacterMetrics(character, font, mode) {
		  if (!fontMetricsData[font]) {
		    throw new Error("Font metrics not found for font: " + font + ".");
		  }

		  var ch = character.charCodeAt(0);
		  var metrics = fontMetricsData[font][ch];

		  if (!metrics && character[0] in extraCharacterMap) {
		    ch = extraCharacterMap[character[0]].charCodeAt(0);
		    metrics = fontMetricsData[font][ch];
		  }

		  if (!metrics && mode === 'text') {
		    // We don't typically have font metrics for Asian scripts.
		    // But since we support them in text mode, we need to return
		    // some sort of metrics.
		    // So if the character is in a script we support but we
		    // don't have metrics for it, just use the metrics for
		    // the Latin capital letter M. This is close enough because
		    // we (currently) only care about the height of the glyph
		    // not its width.
		    if (supportedCodepoint(ch)) {
		      metrics = fontMetricsData[font][77]; // 77 is the charcode for 'M'
		    }
		  }

		  if (metrics) {
		    return {
		      depth: metrics[0],
		      height: metrics[1],
		      italic: metrics[2],
		      skew: metrics[3],
		      width: metrics[4]
		    };
		  }
		}
		var fontMetricsBySizeIndex = {};
		/**
		 * Get the font metrics for a given size.
		 */

		function getGlobalMetrics(size) {
		  var sizeIndex;

		  if (size >= 5) {
		    sizeIndex = 0;
		  } else if (size >= 3) {
		    sizeIndex = 1;
		  } else {
		    sizeIndex = 2;
		  }

		  if (!fontMetricsBySizeIndex[sizeIndex]) {
		    var metrics = fontMetricsBySizeIndex[sizeIndex] = {
		      cssEmPerMu: sigmasAndXis.quad[sizeIndex] / 18
		    };

		    for (var key in sigmasAndXis) {
		      if (sigmasAndXis.hasOwnProperty(key)) {
		        metrics[key] = sigmasAndXis[key][sizeIndex];
		      }
		    }
		  }

		  return fontMetricsBySizeIndex[sizeIndex];
		}
		/**
		 * This file contains information about the options that the Parser carries
		 * around with it while parsing. Data is held in an `Options` object, and when
		 * recursing, a new `Options` object can be created with the `.with*` and
		 * `.reset` functions.
		 */

		var sizeStyleMap = [// Each element contains [textsize, scriptsize, scriptscriptsize].
		// The size mappings are taken from TeX with \normalsize=10pt.
		[1, 1, 1], // size1: [5, 5, 5]              \tiny
		[2, 1, 1], // size2: [6, 5, 5]
		[3, 1, 1], // size3: [7, 5, 5]              \scriptsize
		[4, 2, 1], // size4: [8, 6, 5]              \footnotesize
		[5, 2, 1], // size5: [9, 6, 5]              \small
		[6, 3, 1], // size6: [10, 7, 5]             \normalsize
		[7, 4, 2], // size7: [12, 8, 6]             \large
		[8, 6, 3], // size8: [14.4, 10, 7]          \Large
		[9, 7, 6], // size9: [17.28, 12, 10]        \LARGE
		[10, 8, 7], // size10: [20.74, 14.4, 12]     \huge
		[11, 10, 9] // size11: [24.88, 20.74, 17.28] \HUGE
		];
		var sizeMultipliers = [// fontMetrics.js:getGlobalMetrics also uses size indexes, so if
		// you change size indexes, change that function.
		0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.44, 1.728, 2.074, 2.488];

		var sizeAtStyle = function sizeAtStyle(size, style) {
		  return style.size < 2 ? size : sizeStyleMap[size - 1][style.size - 1];
		}; // In these types, "" (empty string) means "no change".


		/**
		 * This is the main options class. It contains the current style, size, color,
		 * and font.
		 *
		 * Options objects should not be modified. To create a new Options with
		 * different properties, call a `.having*` method.
		 */
		var Options = /*#__PURE__*/function () {
		  // A font family applies to a group of fonts (i.e. SansSerif), while a font
		  // represents a specific font (i.e. SansSerif Bold).
		  // See: https://tex.stackexchange.com/questions/22350/difference-between-textrm-and-mathrm

		  /**
		   * The base size index.
		   */
		  function Options(data) {
		    this.style = void 0;
		    this.color = void 0;
		    this.size = void 0;
		    this.textSize = void 0;
		    this.phantom = void 0;
		    this.font = void 0;
		    this.fontFamily = void 0;
		    this.fontWeight = void 0;
		    this.fontShape = void 0;
		    this.sizeMultiplier = void 0;
		    this.maxSize = void 0;
		    this.minRuleThickness = void 0;
		    this._fontMetrics = void 0;
		    this.style = data.style;
		    this.color = data.color;
		    this.size = data.size || Options.BASESIZE;
		    this.textSize = data.textSize || this.size;
		    this.phantom = !!data.phantom;
		    this.font = data.font || "";
		    this.fontFamily = data.fontFamily || "";
		    this.fontWeight = data.fontWeight || '';
		    this.fontShape = data.fontShape || '';
		    this.sizeMultiplier = sizeMultipliers[this.size - 1];
		    this.maxSize = data.maxSize;
		    this.minRuleThickness = data.minRuleThickness;
		    this._fontMetrics = undefined;
		  }
		  /**
		   * Returns a new options object with the same properties as "this".  Properties
		   * from "extension" will be copied to the new options object.
		   */


		  var _proto = Options.prototype;

		  _proto.extend = function extend(extension) {
		    var data = {
		      style: this.style,
		      size: this.size,
		      textSize: this.textSize,
		      color: this.color,
		      phantom: this.phantom,
		      font: this.font,
		      fontFamily: this.fontFamily,
		      fontWeight: this.fontWeight,
		      fontShape: this.fontShape,
		      maxSize: this.maxSize,
		      minRuleThickness: this.minRuleThickness
		    };

		    for (var key in extension) {
		      if (extension.hasOwnProperty(key)) {
		        data[key] = extension[key];
		      }
		    }

		    return new Options(data);
		  }
		  /**
		   * Return an options object with the given style. If `this.style === style`,
		   * returns `this`.
		   */
		  ;

		  _proto.havingStyle = function havingStyle(style) {
		    if (this.style === style) {
		      return this;
		    } else {
		      return this.extend({
		        style: style,
		        size: sizeAtStyle(this.textSize, style)
		      });
		    }
		  }
		  /**
		   * Return an options object with a cramped version of the current style. If
		   * the current style is cramped, returns `this`.
		   */
		  ;

		  _proto.havingCrampedStyle = function havingCrampedStyle() {
		    return this.havingStyle(this.style.cramp());
		  }
		  /**
		   * Return an options object with the given size and in at least `\textstyle`.
		   * Returns `this` if appropriate.
		   */
		  ;

		  _proto.havingSize = function havingSize(size) {
		    if (this.size === size && this.textSize === size) {
		      return this;
		    } else {
		      return this.extend({
		        style: this.style.text(),
		        size: size,
		        textSize: size,
		        sizeMultiplier: sizeMultipliers[size - 1]
		      });
		    }
		  }
		  /**
		   * Like `this.havingSize(BASESIZE).havingStyle(style)`. If `style` is omitted,
		   * changes to at least `\textstyle`.
		   */
		  ;

		  _proto.havingBaseStyle = function havingBaseStyle(style) {
		    style = style || this.style.text();
		    var wantSize = sizeAtStyle(Options.BASESIZE, style);

		    if (this.size === wantSize && this.textSize === Options.BASESIZE && this.style === style) {
		      return this;
		    } else {
		      return this.extend({
		        style: style,
		        size: wantSize
		      });
		    }
		  }
		  /**
		   * Remove the effect of sizing changes such as \Huge.
		   * Keep the effect of the current style, such as \scriptstyle.
		   */
		  ;

		  _proto.havingBaseSizing = function havingBaseSizing() {
		    var size;

		    switch (this.style.id) {
		      case 4:
		      case 5:
		        size = 3; // normalsize in scriptstyle

		        break;

		      case 6:
		      case 7:
		        size = 1; // normalsize in scriptscriptstyle

		        break;

		      default:
		        size = 6;
		      // normalsize in textstyle or displaystyle
		    }

		    return this.extend({
		      style: this.style.text(),
		      size: size
		    });
		  }
		  /**
		   * Create a new options object with the given color.
		   */
		  ;

		  _proto.withColor = function withColor(color) {
		    return this.extend({
		      color: color
		    });
		  }
		  /**
		   * Create a new options object with "phantom" set to true.
		   */
		  ;

		  _proto.withPhantom = function withPhantom() {
		    return this.extend({
		      phantom: true
		    });
		  }
		  /**
		   * Creates a new options object with the given math font or old text font.
		   * @type {[type]}
		   */
		  ;

		  _proto.withFont = function withFont(font) {
		    return this.extend({
		      font: font
		    });
		  }
		  /**
		   * Create a new options objects with the given fontFamily.
		   */
		  ;

		  _proto.withTextFontFamily = function withTextFontFamily(fontFamily) {
		    return this.extend({
		      fontFamily: fontFamily,
		      font: ""
		    });
		  }
		  /**
		   * Creates a new options object with the given font weight
		   */
		  ;

		  _proto.withTextFontWeight = function withTextFontWeight(fontWeight) {
		    return this.extend({
		      fontWeight: fontWeight,
		      font: ""
		    });
		  }
		  /**
		   * Creates a new options object with the given font weight
		   */
		  ;

		  _proto.withTextFontShape = function withTextFontShape(fontShape) {
		    return this.extend({
		      fontShape: fontShape,
		      font: ""
		    });
		  }
		  /**
		   * Return the CSS sizing classes required to switch from enclosing options
		   * `oldOptions` to `this`. Returns an array of classes.
		   */
		  ;

		  _proto.sizingClasses = function sizingClasses(oldOptions) {
		    if (oldOptions.size !== this.size) {
		      return ["sizing", "reset-size" + oldOptions.size, "size" + this.size];
		    } else {
		      return [];
		    }
		  }
		  /**
		   * Return the CSS sizing classes required to switch to the base size. Like
		   * `this.havingSize(BASESIZE).sizingClasses(this)`.
		   */
		  ;

		  _proto.baseSizingClasses = function baseSizingClasses() {
		    if (this.size !== Options.BASESIZE) {
		      return ["sizing", "reset-size" + this.size, "size" + Options.BASESIZE];
		    } else {
		      return [];
		    }
		  }
		  /**
		   * Return the font metrics for this size.
		   */
		  ;

		  _proto.fontMetrics = function fontMetrics() {
		    if (!this._fontMetrics) {
		      this._fontMetrics = getGlobalMetrics(this.size);
		    }

		    return this._fontMetrics;
		  }
		  /**
		   * Gets the CSS color of the current options object
		   */
		  ;

		  _proto.getColor = function getColor() {
		    if (this.phantom) {
		      return "transparent";
		    } else {
		      return this.color;
		    }
		  };

		  return Options;
		}();

		Options.BASESIZE = 6;
		/* harmony default export */ var src_Options = (Options);
		/**
		 * This file does conversion between units.  In particular, it provides
		 * calculateSize to convert other units into ems.
		 */

		 // This table gives the number of TeX pts in one of each *absolute* TeX unit.
		// Thus, multiplying a length by this number converts the length from units
		// into pts.  Dividing the result by ptPerEm gives the number of ems
		// *assuming* a font size of ptPerEm (normal size, normal style).

		var ptPerUnit = {
		  // https://en.wikibooks.org/wiki/LaTeX/Lengths and
		  // https://tex.stackexchange.com/a/8263
		  "pt": 1,
		  // TeX point
		  "mm": 7227 / 2540,
		  // millimeter
		  "cm": 7227 / 254,
		  // centimeter
		  "in": 72.27,
		  // inch
		  "bp": 803 / 800,
		  // big (PostScript) points
		  "pc": 12,
		  // pica
		  "dd": 1238 / 1157,
		  // didot
		  "cc": 14856 / 1157,
		  // cicero (12 didot)
		  "nd": 685 / 642,
		  // new didot
		  "nc": 1370 / 107,
		  // new cicero (12 new didot)
		  "sp": 1 / 65536,
		  // scaled point (TeX's internal smallest unit)
		  // https://tex.stackexchange.com/a/41371
		  "px": 803 / 800 // \pdfpxdimen defaults to 1 bp in pdfTeX and LuaTeX

		}; // Dictionary of relative units, for fast validity testing.

		var relativeUnit = {
		  "ex": true,
		  "em": true,
		  "mu": true
		};

		/**
		 * Determine whether the specified unit (either a string defining the unit
		 * or a "size" parse node containing a unit field) is valid.
		 */
		var validUnit = function validUnit(unit) {
		  if (typeof unit !== "string") {
		    unit = unit.unit;
		  }

		  return unit in ptPerUnit || unit in relativeUnit || unit === "ex";
		};
		/*
		 * Convert a "size" parse node (with numeric "number" and string "unit" fields,
		 * as parsed by functions.js argType "size") into a CSS em value for the
		 * current style/scale.  `options` gives the current options.
		 */

		var calculateSize = function calculateSize(sizeValue, options) {
		  var scale;

		  if (sizeValue.unit in ptPerUnit) {
		    // Absolute units
		    scale = ptPerUnit[sizeValue.unit] // Convert unit to pt
		    / options.fontMetrics().ptPerEm // Convert pt to CSS em
		    / options.sizeMultiplier; // Unscale to make absolute units
		  } else if (sizeValue.unit === "mu") {
		    // `mu` units scale with scriptstyle/scriptscriptstyle.
		    scale = options.fontMetrics().cssEmPerMu;
		  } else {
		    // Other relative units always refer to the *textstyle* font
		    // in the current size.
		    var unitOptions;

		    if (options.style.isTight()) {
		      // isTight() means current style is script/scriptscript.
		      unitOptions = options.havingStyle(options.style.text());
		    } else {
		      unitOptions = options;
		    } // TODO: In TeX these units are relative to the quad of the current
		    // *text* font, e.g. cmr10. KaTeX instead uses values from the
		    // comparably-sized *Computer Modern symbol* font. At 10pt, these
		    // match. At 7pt and 5pt, they differ: cmr7=1.138894, cmsy7=1.170641;
		    // cmr5=1.361133, cmsy5=1.472241. Consider $\scriptsize a\kern1emb$.
		    // TeX \showlists shows a kern of 1.13889 * fontsize;
		    // KaTeX shows a kern of 1.171 * fontsize.


		    if (sizeValue.unit === "ex") {
		      scale = unitOptions.fontMetrics().xHeight;
		    } else if (sizeValue.unit === "em") {
		      scale = unitOptions.fontMetrics().quad;
		    } else {
		      throw new src_ParseError("Invalid unit: '" + sizeValue.unit + "'");
		    }

		    if (unitOptions !== options) {
		      scale *= unitOptions.sizeMultiplier / options.sizeMultiplier;
		    }
		  }

		  return Math.min(sizeValue.number * scale, options.maxSize);
		};
		/**
		 * Round `n` to 4 decimal places, or to the nearest 1/10,000th em. See
		 * https://github.com/KaTeX/KaTeX/pull/2460.
		 */

		var makeEm = function makeEm(n) {
		  return +n.toFixed(4) + "em";
		};
		/**
		 * These objects store the data about the DOM nodes we create, as well as some
		 * extra data. They can then be transformed into real DOM nodes with the
		 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
		 * storing extra properties on the nodes, as well as providing a way to easily
		 * work with the DOM.
		 *
		 * Similar functions for working with MathML nodes exist in mathMLTree.js.
		 *
		 * TODO: refactor `span` and `anchor` into common superclass when
		 * target environments support class inheritance
		 */






		/**
		 * Create an HTML className based on a list of classes. In addition to joining
		 * with spaces, we also remove empty classes.
		 */
		var createClass = function createClass(classes) {
		  return classes.filter(function (cls) {
		    return cls;
		  }).join(" ");
		};

		var initNode = function initNode(classes, options, style) {
		  this.classes = classes || [];
		  this.attributes = {};
		  this.height = 0;
		  this.depth = 0;
		  this.maxFontSize = 0;
		  this.style = style || {};

		  if (options) {
		    if (options.style.isTight()) {
		      this.classes.push("mtight");
		    }

		    var color = options.getColor();

		    if (color) {
		      this.style.color = color;
		    }
		  }
		};
		/**
		 * Convert into an HTML node
		 */


		var _toNode = function toNode(tagName) {
		  var node = document.createElement(tagName); // Apply the class

		  node.className = createClass(this.classes); // Apply inline styles

		  for (var style in this.style) {
		    if (this.style.hasOwnProperty(style)) {
		      // $FlowFixMe Flow doesn't seem to understand span.style's type.
		      node.style[style] = this.style[style];
		    }
		  } // Apply attributes


		  for (var attr in this.attributes) {
		    if (this.attributes.hasOwnProperty(attr)) {
		      node.setAttribute(attr, this.attributes[attr]);
		    }
		  } // Append the children, also as HTML nodes


		  for (var i = 0; i < this.children.length; i++) {
		    node.appendChild(this.children[i].toNode());
		  }

		  return node;
		};
		/**
		 * Convert into an HTML markup string
		 */


		var _toMarkup = function toMarkup(tagName) {
		  var markup = "<" + tagName; // Add the class

		  if (this.classes.length) {
		    markup += " class=\"" + utils.escape(createClass(this.classes)) + "\"";
		  }

		  var styles = ""; // Add the styles, after hyphenation

		  for (var style in this.style) {
		    if (this.style.hasOwnProperty(style)) {
		      styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
		    }
		  }

		  if (styles) {
		    markup += " style=\"" + utils.escape(styles) + "\"";
		  } // Add the attributes


		  for (var attr in this.attributes) {
		    if (this.attributes.hasOwnProperty(attr)) {
		      markup += " " + attr + "=\"" + utils.escape(this.attributes[attr]) + "\"";
		    }
		  }

		  markup += ">"; // Add the markup of the children, also as markup

		  for (var i = 0; i < this.children.length; i++) {
		    markup += this.children[i].toMarkup();
		  }

		  markup += "</" + tagName + ">";
		  return markup;
		}; // Making the type below exact with all optional fields doesn't work due to
		// - https://github.com/facebook/flow/issues/4582
		// - https://github.com/facebook/flow/issues/5688
		// However, since *all* fields are optional, $Shape<> works as suggested in 5688
		// above.
		// This type does not include all CSS properties. Additional properties should
		// be added as needed.


		/**
		 * This node represents a span node, with a className, a list of children, and
		 * an inline style. It also contains information about its height, depth, and
		 * maxFontSize.
		 *
		 * Represents two types with different uses: SvgSpan to wrap an SVG and DomSpan
		 * otherwise. This typesafety is important when HTML builders access a span's
		 * children.
		 */
		var Span = /*#__PURE__*/function () {
		  function Span(classes, children, options, style) {
		    this.children = void 0;
		    this.attributes = void 0;
		    this.classes = void 0;
		    this.height = void 0;
		    this.depth = void 0;
		    this.width = void 0;
		    this.maxFontSize = void 0;
		    this.style = void 0;
		    initNode.call(this, classes, options, style);
		    this.children = children || [];
		  }
		  /**
		   * Sets an arbitrary attribute on the span. Warning: use this wisely. Not
		   * all browsers support attributes the same, and having too many custom
		   * attributes is probably bad.
		   */


		  var _proto = Span.prototype;

		  _proto.setAttribute = function setAttribute(attribute, value) {
		    this.attributes[attribute] = value;
		  };

		  _proto.hasClass = function hasClass(className) {
		    return utils.contains(this.classes, className);
		  };

		  _proto.toNode = function toNode() {
		    return _toNode.call(this, "span");
		  };

		  _proto.toMarkup = function toMarkup() {
		    return _toMarkup.call(this, "span");
		  };

		  return Span;
		}();
		/**
		 * This node represents an anchor (<a>) element with a hyperlink.  See `span`
		 * for further details.
		 */

		var Anchor = /*#__PURE__*/function () {
		  function Anchor(href, classes, children, options) {
		    this.children = void 0;
		    this.attributes = void 0;
		    this.classes = void 0;
		    this.height = void 0;
		    this.depth = void 0;
		    this.maxFontSize = void 0;
		    this.style = void 0;
		    initNode.call(this, classes, options);
		    this.children = children || [];
		    this.setAttribute('href', href);
		  }

		  var _proto2 = Anchor.prototype;

		  _proto2.setAttribute = function setAttribute(attribute, value) {
		    this.attributes[attribute] = value;
		  };

		  _proto2.hasClass = function hasClass(className) {
		    return utils.contains(this.classes, className);
		  };

		  _proto2.toNode = function toNode() {
		    return _toNode.call(this, "a");
		  };

		  _proto2.toMarkup = function toMarkup() {
		    return _toMarkup.call(this, "a");
		  };

		  return Anchor;
		}();
		/**
		 * This node represents an image embed (<img>) element.
		 */

		var Img = /*#__PURE__*/function () {
		  function Img(src, alt, style) {
		    this.src = void 0;
		    this.alt = void 0;
		    this.classes = void 0;
		    this.height = void 0;
		    this.depth = void 0;
		    this.maxFontSize = void 0;
		    this.style = void 0;
		    this.alt = alt;
		    this.src = src;
		    this.classes = ["mord"];
		    this.style = style;
		  }

		  var _proto3 = Img.prototype;

		  _proto3.hasClass = function hasClass(className) {
		    return utils.contains(this.classes, className);
		  };

		  _proto3.toNode = function toNode() {
		    var node = document.createElement("img");
		    node.src = this.src;
		    node.alt = this.alt;
		    node.className = "mord"; // Apply inline styles

		    for (var style in this.style) {
		      if (this.style.hasOwnProperty(style)) {
		        // $FlowFixMe
		        node.style[style] = this.style[style];
		      }
		    }

		    return node;
		  };

		  _proto3.toMarkup = function toMarkup() {
		    var markup = "<img  src='" + this.src + " 'alt='" + this.alt + "' "; // Add the styles, after hyphenation

		    var styles = "";

		    for (var style in this.style) {
		      if (this.style.hasOwnProperty(style)) {
		        styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
		      }
		    }

		    if (styles) {
		      markup += " style=\"" + utils.escape(styles) + "\"";
		    }

		    markup += "'/>";
		    return markup;
		  };

		  return Img;
		}();
		var iCombinations = {
		  'î': "\u0131\u0302",
		  'ï': "\u0131\u0308",
		  'í': "\u0131\u0301",
		  // 'ī': '\u0131\u0304', // enable when we add Extended Latin
		  'ì': "\u0131\u0300"
		};
		/**
		 * A symbol node contains information about a single symbol. It either renders
		 * to a single text node, or a span with a single text node in it, depending on
		 * whether it has CSS classes, styles, or needs italic correction.
		 */

		var SymbolNode = /*#__PURE__*/function () {
		  function SymbolNode(text, height, depth, italic, skew, width, classes, style) {
		    this.text = void 0;
		    this.height = void 0;
		    this.depth = void 0;
		    this.italic = void 0;
		    this.skew = void 0;
		    this.width = void 0;
		    this.maxFontSize = void 0;
		    this.classes = void 0;
		    this.style = void 0;
		    this.text = text;
		    this.height = height || 0;
		    this.depth = depth || 0;
		    this.italic = italic || 0;
		    this.skew = skew || 0;
		    this.width = width || 0;
		    this.classes = classes || [];
		    this.style = style || {};
		    this.maxFontSize = 0; // Mark text from non-Latin scripts with specific classes so that we
		    // can specify which fonts to use.  This allows us to render these
		    // characters with a serif font in situations where the browser would
		    // either default to a sans serif or render a placeholder character.
		    // We use CSS class names like cjk_fallback, hangul_fallback and
		    // brahmic_fallback. See ./unicodeScripts.js for the set of possible
		    // script names

		    var script = scriptFromCodepoint(this.text.charCodeAt(0));

		    if (script) {
		      this.classes.push(script + "_fallback");
		    }

		    if (/[îïíì]/.test(this.text)) {
		      // add ī when we add Extended Latin
		      this.text = iCombinations[this.text];
		    }
		  }

		  var _proto4 = SymbolNode.prototype;

		  _proto4.hasClass = function hasClass(className) {
		    return utils.contains(this.classes, className);
		  }
		  /**
		   * Creates a text node or span from a symbol node. Note that a span is only
		   * created if it is needed.
		   */
		  ;

		  _proto4.toNode = function toNode() {
		    var node = document.createTextNode(this.text);
		    var span = null;

		    if (this.italic > 0) {
		      span = document.createElement("span");
		      span.style.marginRight = makeEm(this.italic);
		    }

		    if (this.classes.length > 0) {
		      span = span || document.createElement("span");
		      span.className = createClass(this.classes);
		    }

		    for (var style in this.style) {
		      if (this.style.hasOwnProperty(style)) {
		        span = span || document.createElement("span"); // $FlowFixMe Flow doesn't seem to understand span.style's type.

		        span.style[style] = this.style[style];
		      }
		    }

		    if (span) {
		      span.appendChild(node);
		      return span;
		    } else {
		      return node;
		    }
		  }
		  /**
		   * Creates markup for a symbol node.
		   */
		  ;

		  _proto4.toMarkup = function toMarkup() {
		    // TODO(alpert): More duplication than I'd like from
		    // span.prototype.toMarkup and symbolNode.prototype.toNode...
		    var needsSpan = false;
		    var markup = "<span";

		    if (this.classes.length) {
		      needsSpan = true;
		      markup += " class=\"";
		      markup += utils.escape(createClass(this.classes));
		      markup += "\"";
		    }

		    var styles = "";

		    if (this.italic > 0) {
		      styles += "margin-right:" + this.italic + "em;";
		    }

		    for (var style in this.style) {
		      if (this.style.hasOwnProperty(style)) {
		        styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
		      }
		    }

		    if (styles) {
		      needsSpan = true;
		      markup += " style=\"" + utils.escape(styles) + "\"";
		    }

		    var escaped = utils.escape(this.text);

		    if (needsSpan) {
		      markup += ">";
		      markup += escaped;
		      markup += "</span>";
		      return markup;
		    } else {
		      return escaped;
		    }
		  };

		  return SymbolNode;
		}();
		/**
		 * SVG nodes are used to render stretchy wide elements.
		 */

		var SvgNode = /*#__PURE__*/function () {
		  function SvgNode(children, attributes) {
		    this.children = void 0;
		    this.attributes = void 0;
		    this.children = children || [];
		    this.attributes = attributes || {};
		  }

		  var _proto5 = SvgNode.prototype;

		  _proto5.toNode = function toNode() {
		    var svgNS = "http://www.w3.org/2000/svg";
		    var node = document.createElementNS(svgNS, "svg"); // Apply attributes

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        node.setAttribute(attr, this.attributes[attr]);
		      }
		    }

		    for (var i = 0; i < this.children.length; i++) {
		      node.appendChild(this.children[i].toNode());
		    }

		    return node;
		  };

		  _proto5.toMarkup = function toMarkup() {
		    var markup = "<svg xmlns=\"http://www.w3.org/2000/svg\""; // Apply attributes

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        markup += " " + attr + "='" + this.attributes[attr] + "'";
		      }
		    }

		    markup += ">";

		    for (var i = 0; i < this.children.length; i++) {
		      markup += this.children[i].toMarkup();
		    }

		    markup += "</svg>";
		    return markup;
		  };

		  return SvgNode;
		}();
		var PathNode = /*#__PURE__*/function () {
		  function PathNode(pathName, alternate) {
		    this.pathName = void 0;
		    this.alternate = void 0;
		    this.pathName = pathName;
		    this.alternate = alternate; // Used only for \sqrt, \phase, & tall delims
		  }

		  var _proto6 = PathNode.prototype;

		  _proto6.toNode = function toNode() {
		    var svgNS = "http://www.w3.org/2000/svg";
		    var node = document.createElementNS(svgNS, "path");

		    if (this.alternate) {
		      node.setAttribute("d", this.alternate);
		    } else {
		      node.setAttribute("d", path[this.pathName]);
		    }

		    return node;
		  };

		  _proto6.toMarkup = function toMarkup() {
		    if (this.alternate) {
		      return "<path d='" + this.alternate + "'/>";
		    } else {
		      return "<path d='" + path[this.pathName] + "'/>";
		    }
		  };

		  return PathNode;
		}();
		var LineNode = /*#__PURE__*/function () {
		  function LineNode(attributes) {
		    this.attributes = void 0;
		    this.attributes = attributes || {};
		  }

		  var _proto7 = LineNode.prototype;

		  _proto7.toNode = function toNode() {
		    var svgNS = "http://www.w3.org/2000/svg";
		    var node = document.createElementNS(svgNS, "line"); // Apply attributes

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        node.setAttribute(attr, this.attributes[attr]);
		      }
		    }

		    return node;
		  };

		  _proto7.toMarkup = function toMarkup() {
		    var markup = "<line";

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        markup += " " + attr + "='" + this.attributes[attr] + "'";
		      }
		    }

		    markup += "/>";
		    return markup;
		  };

		  return LineNode;
		}();
		function assertSymbolDomNode(group) {
		  if (group instanceof SymbolNode) {
		    return group;
		  } else {
		    throw new Error("Expected symbolNode but got " + String(group) + ".");
		  }
		}
		function assertSpan(group) {
		  if (group instanceof Span) {
		    return group;
		  } else {
		    throw new Error("Expected span<HtmlDomNode> but got " + String(group) + ".");
		  }
		}
		/**
		 * This file holds a list of all no-argument functions and single-character
		 * symbols (like 'a' or ';').
		 *
		 * For each of the symbols, there are three properties they can have:
		 * - font (required): the font to be used for this symbol. Either "main" (the
		     normal font), or "ams" (the ams fonts).
		 * - group (required): the ParseNode group type the symbol should have (i.e.
		     "textord", "mathord", etc).
		     See https://github.com/KaTeX/KaTeX/wiki/Examining-TeX#group-types
		 * - replace: the character that this symbol or function should be
		 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
		 *   character in the main font).
		 *
		 * The outermost map in the table indicates what mode the symbols should be
		 * accepted in (e.g. "math" or "text").
		 */
		// Some of these have a "-token" suffix since these are also used as `ParseNode`
		// types for raw text tokens, and we want to avoid conflicts with higher-level
		// `ParseNode` types. These `ParseNode`s are constructed within `Parser` by
		// looking up the `symbols` map.
		var ATOMS = {
		  "bin": 1,
		  "close": 1,
		  "inner": 1,
		  "open": 1,
		  "punct": 1,
		  "rel": 1
		};
		var NON_ATOMS = {
		  "accent-token": 1,
		  "mathord": 1,
		  "op-token": 1,
		  "spacing": 1,
		  "textord": 1
		};
		var symbols = {
		  "math": {},
		  "text": {}
		};
		/* harmony default export */ var src_symbols = (symbols);
		/** `acceptUnicodeChar = true` is only applicable if `replace` is set. */

		function defineSymbol(mode, font, group, replace, name, acceptUnicodeChar) {
		  symbols[mode][name] = {
		    font: font,
		    group: group,
		    replace: replace
		  };

		  if (acceptUnicodeChar && replace) {
		    symbols[mode][replace] = symbols[mode][name];
		  }
		} // Some abbreviations for commonly used strings.
		// This helps minify the code, and also spotting typos using jshint.
		// modes:

		var math = "math";
		var symbols_text = "text"; // fonts:

		var main = "main";
		var ams = "ams"; // groups:

		var accent = "accent-token";
		var bin = "bin";
		var symbols_close = "close";
		var inner = "inner";
		var mathord = "mathord";
		var op = "op-token";
		var symbols_open = "open";
		var punct = "punct";
		var rel = "rel";
		var spacing = "spacing";
		var textord = "textord"; // Now comes the symbol table
		// Relation Symbols

		defineSymbol(math, main, rel, "\u2261", "\\equiv", true);
		defineSymbol(math, main, rel, "\u227A", "\\prec", true);
		defineSymbol(math, main, rel, "\u227B", "\\succ", true);
		defineSymbol(math, main, rel, "\u223C", "\\sim", true);
		defineSymbol(math, main, rel, "\u22A5", "\\perp");
		defineSymbol(math, main, rel, "\u2AAF", "\\preceq", true);
		defineSymbol(math, main, rel, "\u2AB0", "\\succeq", true);
		defineSymbol(math, main, rel, "\u2243", "\\simeq", true);
		defineSymbol(math, main, rel, "\u2223", "\\mid", true);
		defineSymbol(math, main, rel, "\u226A", "\\ll", true);
		defineSymbol(math, main, rel, "\u226B", "\\gg", true);
		defineSymbol(math, main, rel, "\u224D", "\\asymp", true);
		defineSymbol(math, main, rel, "\u2225", "\\parallel");
		defineSymbol(math, main, rel, "\u22C8", "\\bowtie", true);
		defineSymbol(math, main, rel, "\u2323", "\\smile", true);
		defineSymbol(math, main, rel, "\u2291", "\\sqsubseteq", true);
		defineSymbol(math, main, rel, "\u2292", "\\sqsupseteq", true);
		defineSymbol(math, main, rel, "\u2250", "\\doteq", true);
		defineSymbol(math, main, rel, "\u2322", "\\frown", true);
		defineSymbol(math, main, rel, "\u220B", "\\ni", true);
		defineSymbol(math, main, rel, "\u221D", "\\propto", true);
		defineSymbol(math, main, rel, "\u22A2", "\\vdash", true);
		defineSymbol(math, main, rel, "\u22A3", "\\dashv", true);
		defineSymbol(math, main, rel, "\u220B", "\\owns"); // Punctuation

		defineSymbol(math, main, punct, ".", "\\ldotp");
		defineSymbol(math, main, punct, "\u22C5", "\\cdotp"); // Misc Symbols

		defineSymbol(math, main, textord, "#", "\\#");
		defineSymbol(symbols_text, main, textord, "#", "\\#");
		defineSymbol(math, main, textord, "&", "\\&");
		defineSymbol(symbols_text, main, textord, "&", "\\&");
		defineSymbol(math, main, textord, "\u2135", "\\aleph", true);
		defineSymbol(math, main, textord, "\u2200", "\\forall", true);
		defineSymbol(math, main, textord, "\u210F", "\\hbar", true);
		defineSymbol(math, main, textord, "\u2203", "\\exists", true);
		defineSymbol(math, main, textord, "\u2207", "\\nabla", true);
		defineSymbol(math, main, textord, "\u266D", "\\flat", true);
		defineSymbol(math, main, textord, "\u2113", "\\ell", true);
		defineSymbol(math, main, textord, "\u266E", "\\natural", true);
		defineSymbol(math, main, textord, "\u2663", "\\clubsuit", true);
		defineSymbol(math, main, textord, "\u2118", "\\wp", true);
		defineSymbol(math, main, textord, "\u266F", "\\sharp", true);
		defineSymbol(math, main, textord, "\u2662", "\\diamondsuit", true);
		defineSymbol(math, main, textord, "\u211C", "\\Re", true);
		defineSymbol(math, main, textord, "\u2661", "\\heartsuit", true);
		defineSymbol(math, main, textord, "\u2111", "\\Im", true);
		defineSymbol(math, main, textord, "\u2660", "\\spadesuit", true);
		defineSymbol(math, main, textord, "\xA7", "\\S", true);
		defineSymbol(symbols_text, main, textord, "\xA7", "\\S");
		defineSymbol(math, main, textord, "\xB6", "\\P", true);
		defineSymbol(symbols_text, main, textord, "\xB6", "\\P"); // Math and Text

		defineSymbol(math, main, textord, "\u2020", "\\dag");
		defineSymbol(symbols_text, main, textord, "\u2020", "\\dag");
		defineSymbol(symbols_text, main, textord, "\u2020", "\\textdagger");
		defineSymbol(math, main, textord, "\u2021", "\\ddag");
		defineSymbol(symbols_text, main, textord, "\u2021", "\\ddag");
		defineSymbol(symbols_text, main, textord, "\u2021", "\\textdaggerdbl"); // Large Delimiters

		defineSymbol(math, main, symbols_close, "\u23B1", "\\rmoustache", true);
		defineSymbol(math, main, symbols_open, "\u23B0", "\\lmoustache", true);
		defineSymbol(math, main, symbols_close, "\u27EF", "\\rgroup", true);
		defineSymbol(math, main, symbols_open, "\u27EE", "\\lgroup", true); // Binary Operators

		defineSymbol(math, main, bin, "\u2213", "\\mp", true);
		defineSymbol(math, main, bin, "\u2296", "\\ominus", true);
		defineSymbol(math, main, bin, "\u228E", "\\uplus", true);
		defineSymbol(math, main, bin, "\u2293", "\\sqcap", true);
		defineSymbol(math, main, bin, "\u2217", "\\ast");
		defineSymbol(math, main, bin, "\u2294", "\\sqcup", true);
		defineSymbol(math, main, bin, "\u25EF", "\\bigcirc", true);
		defineSymbol(math, main, bin, "\u2219", "\\bullet", true);
		defineSymbol(math, main, bin, "\u2021", "\\ddagger");
		defineSymbol(math, main, bin, "\u2240", "\\wr", true);
		defineSymbol(math, main, bin, "\u2A3F", "\\amalg");
		defineSymbol(math, main, bin, "&", "\\And"); // from amsmath
		// Arrow Symbols

		defineSymbol(math, main, rel, "\u27F5", "\\longleftarrow", true);
		defineSymbol(math, main, rel, "\u21D0", "\\Leftarrow", true);
		defineSymbol(math, main, rel, "\u27F8", "\\Longleftarrow", true);
		defineSymbol(math, main, rel, "\u27F6", "\\longrightarrow", true);
		defineSymbol(math, main, rel, "\u21D2", "\\Rightarrow", true);
		defineSymbol(math, main, rel, "\u27F9", "\\Longrightarrow", true);
		defineSymbol(math, main, rel, "\u2194", "\\leftrightarrow", true);
		defineSymbol(math, main, rel, "\u27F7", "\\longleftrightarrow", true);
		defineSymbol(math, main, rel, "\u21D4", "\\Leftrightarrow", true);
		defineSymbol(math, main, rel, "\u27FA", "\\Longleftrightarrow", true);
		defineSymbol(math, main, rel, "\u21A6", "\\mapsto", true);
		defineSymbol(math, main, rel, "\u27FC", "\\longmapsto", true);
		defineSymbol(math, main, rel, "\u2197", "\\nearrow", true);
		defineSymbol(math, main, rel, "\u21A9", "\\hookleftarrow", true);
		defineSymbol(math, main, rel, "\u21AA", "\\hookrightarrow", true);
		defineSymbol(math, main, rel, "\u2198", "\\searrow", true);
		defineSymbol(math, main, rel, "\u21BC", "\\leftharpoonup", true);
		defineSymbol(math, main, rel, "\u21C0", "\\rightharpoonup", true);
		defineSymbol(math, main, rel, "\u2199", "\\swarrow", true);
		defineSymbol(math, main, rel, "\u21BD", "\\leftharpoondown", true);
		defineSymbol(math, main, rel, "\u21C1", "\\rightharpoondown", true);
		defineSymbol(math, main, rel, "\u2196", "\\nwarrow", true);
		defineSymbol(math, main, rel, "\u21CC", "\\rightleftharpoons", true); // AMS Negated Binary Relations

		defineSymbol(math, ams, rel, "\u226E", "\\nless", true); // Symbol names preceeded by "@" each have a corresponding macro.

		defineSymbol(math, ams, rel, "\uE010", "\\@nleqslant");
		defineSymbol(math, ams, rel, "\uE011", "\\@nleqq");
		defineSymbol(math, ams, rel, "\u2A87", "\\lneq", true);
		defineSymbol(math, ams, rel, "\u2268", "\\lneqq", true);
		defineSymbol(math, ams, rel, "\uE00C", "\\@lvertneqq");
		defineSymbol(math, ams, rel, "\u22E6", "\\lnsim", true);
		defineSymbol(math, ams, rel, "\u2A89", "\\lnapprox", true);
		defineSymbol(math, ams, rel, "\u2280", "\\nprec", true); // unicode-math maps \u22e0 to \npreccurlyeq. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u22E0", "\\npreceq", true);
		defineSymbol(math, ams, rel, "\u22E8", "\\precnsim", true);
		defineSymbol(math, ams, rel, "\u2AB9", "\\precnapprox", true);
		defineSymbol(math, ams, rel, "\u2241", "\\nsim", true);
		defineSymbol(math, ams, rel, "\uE006", "\\@nshortmid");
		defineSymbol(math, ams, rel, "\u2224", "\\nmid", true);
		defineSymbol(math, ams, rel, "\u22AC", "\\nvdash", true);
		defineSymbol(math, ams, rel, "\u22AD", "\\nvDash", true);
		defineSymbol(math, ams, rel, "\u22EA", "\\ntriangleleft");
		defineSymbol(math, ams, rel, "\u22EC", "\\ntrianglelefteq", true);
		defineSymbol(math, ams, rel, "\u228A", "\\subsetneq", true);
		defineSymbol(math, ams, rel, "\uE01A", "\\@varsubsetneq");
		defineSymbol(math, ams, rel, "\u2ACB", "\\subsetneqq", true);
		defineSymbol(math, ams, rel, "\uE017", "\\@varsubsetneqq");
		defineSymbol(math, ams, rel, "\u226F", "\\ngtr", true);
		defineSymbol(math, ams, rel, "\uE00F", "\\@ngeqslant");
		defineSymbol(math, ams, rel, "\uE00E", "\\@ngeqq");
		defineSymbol(math, ams, rel, "\u2A88", "\\gneq", true);
		defineSymbol(math, ams, rel, "\u2269", "\\gneqq", true);
		defineSymbol(math, ams, rel, "\uE00D", "\\@gvertneqq");
		defineSymbol(math, ams, rel, "\u22E7", "\\gnsim", true);
		defineSymbol(math, ams, rel, "\u2A8A", "\\gnapprox", true);
		defineSymbol(math, ams, rel, "\u2281", "\\nsucc", true); // unicode-math maps \u22e1 to \nsucccurlyeq. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u22E1", "\\nsucceq", true);
		defineSymbol(math, ams, rel, "\u22E9", "\\succnsim", true);
		defineSymbol(math, ams, rel, "\u2ABA", "\\succnapprox", true); // unicode-math maps \u2246 to \simneqq. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u2246", "\\ncong", true);
		defineSymbol(math, ams, rel, "\uE007", "\\@nshortparallel");
		defineSymbol(math, ams, rel, "\u2226", "\\nparallel", true);
		defineSymbol(math, ams, rel, "\u22AF", "\\nVDash", true);
		defineSymbol(math, ams, rel, "\u22EB", "\\ntriangleright");
		defineSymbol(math, ams, rel, "\u22ED", "\\ntrianglerighteq", true);
		defineSymbol(math, ams, rel, "\uE018", "\\@nsupseteqq");
		defineSymbol(math, ams, rel, "\u228B", "\\supsetneq", true);
		defineSymbol(math, ams, rel, "\uE01B", "\\@varsupsetneq");
		defineSymbol(math, ams, rel, "\u2ACC", "\\supsetneqq", true);
		defineSymbol(math, ams, rel, "\uE019", "\\@varsupsetneqq");
		defineSymbol(math, ams, rel, "\u22AE", "\\nVdash", true);
		defineSymbol(math, ams, rel, "\u2AB5", "\\precneqq", true);
		defineSymbol(math, ams, rel, "\u2AB6", "\\succneqq", true);
		defineSymbol(math, ams, rel, "\uE016", "\\@nsubseteqq");
		defineSymbol(math, ams, bin, "\u22B4", "\\unlhd");
		defineSymbol(math, ams, bin, "\u22B5", "\\unrhd"); // AMS Negated Arrows

		defineSymbol(math, ams, rel, "\u219A", "\\nleftarrow", true);
		defineSymbol(math, ams, rel, "\u219B", "\\nrightarrow", true);
		defineSymbol(math, ams, rel, "\u21CD", "\\nLeftarrow", true);
		defineSymbol(math, ams, rel, "\u21CF", "\\nRightarrow", true);
		defineSymbol(math, ams, rel, "\u21AE", "\\nleftrightarrow", true);
		defineSymbol(math, ams, rel, "\u21CE", "\\nLeftrightarrow", true); // AMS Misc

		defineSymbol(math, ams, rel, "\u25B3", "\\vartriangle");
		defineSymbol(math, ams, textord, "\u210F", "\\hslash");
		defineSymbol(math, ams, textord, "\u25BD", "\\triangledown");
		defineSymbol(math, ams, textord, "\u25CA", "\\lozenge");
		defineSymbol(math, ams, textord, "\u24C8", "\\circledS");
		defineSymbol(math, ams, textord, "\xAE", "\\circledR");
		defineSymbol(symbols_text, ams, textord, "\xAE", "\\circledR");
		defineSymbol(math, ams, textord, "\u2221", "\\measuredangle", true);
		defineSymbol(math, ams, textord, "\u2204", "\\nexists");
		defineSymbol(math, ams, textord, "\u2127", "\\mho");
		defineSymbol(math, ams, textord, "\u2132", "\\Finv", true);
		defineSymbol(math, ams, textord, "\u2141", "\\Game", true);
		defineSymbol(math, ams, textord, "\u2035", "\\backprime");
		defineSymbol(math, ams, textord, "\u25B2", "\\blacktriangle");
		defineSymbol(math, ams, textord, "\u25BC", "\\blacktriangledown");
		defineSymbol(math, ams, textord, "\u25A0", "\\blacksquare");
		defineSymbol(math, ams, textord, "\u29EB", "\\blacklozenge");
		defineSymbol(math, ams, textord, "\u2605", "\\bigstar");
		defineSymbol(math, ams, textord, "\u2222", "\\sphericalangle", true);
		defineSymbol(math, ams, textord, "\u2201", "\\complement", true); // unicode-math maps U+F0 to \matheth. We map to AMS function \eth

		defineSymbol(math, ams, textord, "\xF0", "\\eth", true);
		defineSymbol(symbols_text, main, textord, "\xF0", "\xF0");
		defineSymbol(math, ams, textord, "\u2571", "\\diagup");
		defineSymbol(math, ams, textord, "\u2572", "\\diagdown");
		defineSymbol(math, ams, textord, "\u25A1", "\\square");
		defineSymbol(math, ams, textord, "\u25A1", "\\Box");
		defineSymbol(math, ams, textord, "\u25CA", "\\Diamond"); // unicode-math maps U+A5 to \mathyen. We map to AMS function \yen

		defineSymbol(math, ams, textord, "\xA5", "\\yen", true);
		defineSymbol(symbols_text, ams, textord, "\xA5", "\\yen", true);
		defineSymbol(math, ams, textord, "\u2713", "\\checkmark", true);
		defineSymbol(symbols_text, ams, textord, "\u2713", "\\checkmark"); // AMS Hebrew

		defineSymbol(math, ams, textord, "\u2136", "\\beth", true);
		defineSymbol(math, ams, textord, "\u2138", "\\daleth", true);
		defineSymbol(math, ams, textord, "\u2137", "\\gimel", true); // AMS Greek

		defineSymbol(math, ams, textord, "\u03DD", "\\digamma", true);
		defineSymbol(math, ams, textord, "\u03F0", "\\varkappa"); // AMS Delimiters

		defineSymbol(math, ams, symbols_open, "\u250C", "\\@ulcorner", true);
		defineSymbol(math, ams, symbols_close, "\u2510", "\\@urcorner", true);
		defineSymbol(math, ams, symbols_open, "\u2514", "\\@llcorner", true);
		defineSymbol(math, ams, symbols_close, "\u2518", "\\@lrcorner", true); // AMS Binary Relations

		defineSymbol(math, ams, rel, "\u2266", "\\leqq", true);
		defineSymbol(math, ams, rel, "\u2A7D", "\\leqslant", true);
		defineSymbol(math, ams, rel, "\u2A95", "\\eqslantless", true);
		defineSymbol(math, ams, rel, "\u2272", "\\lesssim", true);
		defineSymbol(math, ams, rel, "\u2A85", "\\lessapprox", true);
		defineSymbol(math, ams, rel, "\u224A", "\\approxeq", true);
		defineSymbol(math, ams, bin, "\u22D6", "\\lessdot");
		defineSymbol(math, ams, rel, "\u22D8", "\\lll", true);
		defineSymbol(math, ams, rel, "\u2276", "\\lessgtr", true);
		defineSymbol(math, ams, rel, "\u22DA", "\\lesseqgtr", true);
		defineSymbol(math, ams, rel, "\u2A8B", "\\lesseqqgtr", true);
		defineSymbol(math, ams, rel, "\u2251", "\\doteqdot");
		defineSymbol(math, ams, rel, "\u2253", "\\risingdotseq", true);
		defineSymbol(math, ams, rel, "\u2252", "\\fallingdotseq", true);
		defineSymbol(math, ams, rel, "\u223D", "\\backsim", true);
		defineSymbol(math, ams, rel, "\u22CD", "\\backsimeq", true);
		defineSymbol(math, ams, rel, "\u2AC5", "\\subseteqq", true);
		defineSymbol(math, ams, rel, "\u22D0", "\\Subset", true);
		defineSymbol(math, ams, rel, "\u228F", "\\sqsubset", true);
		defineSymbol(math, ams, rel, "\u227C", "\\preccurlyeq", true);
		defineSymbol(math, ams, rel, "\u22DE", "\\curlyeqprec", true);
		defineSymbol(math, ams, rel, "\u227E", "\\precsim", true);
		defineSymbol(math, ams, rel, "\u2AB7", "\\precapprox", true);
		defineSymbol(math, ams, rel, "\u22B2", "\\vartriangleleft");
		defineSymbol(math, ams, rel, "\u22B4", "\\trianglelefteq");
		defineSymbol(math, ams, rel, "\u22A8", "\\vDash", true);
		defineSymbol(math, ams, rel, "\u22AA", "\\Vvdash", true);
		defineSymbol(math, ams, rel, "\u2323", "\\smallsmile");
		defineSymbol(math, ams, rel, "\u2322", "\\smallfrown");
		defineSymbol(math, ams, rel, "\u224F", "\\bumpeq", true);
		defineSymbol(math, ams, rel, "\u224E", "\\Bumpeq", true);
		defineSymbol(math, ams, rel, "\u2267", "\\geqq", true);
		defineSymbol(math, ams, rel, "\u2A7E", "\\geqslant", true);
		defineSymbol(math, ams, rel, "\u2A96", "\\eqslantgtr", true);
		defineSymbol(math, ams, rel, "\u2273", "\\gtrsim", true);
		defineSymbol(math, ams, rel, "\u2A86", "\\gtrapprox", true);
		defineSymbol(math, ams, bin, "\u22D7", "\\gtrdot");
		defineSymbol(math, ams, rel, "\u22D9", "\\ggg", true);
		defineSymbol(math, ams, rel, "\u2277", "\\gtrless", true);
		defineSymbol(math, ams, rel, "\u22DB", "\\gtreqless", true);
		defineSymbol(math, ams, rel, "\u2A8C", "\\gtreqqless", true);
		defineSymbol(math, ams, rel, "\u2256", "\\eqcirc", true);
		defineSymbol(math, ams, rel, "\u2257", "\\circeq", true);
		defineSymbol(math, ams, rel, "\u225C", "\\triangleq", true);
		defineSymbol(math, ams, rel, "\u223C", "\\thicksim");
		defineSymbol(math, ams, rel, "\u2248", "\\thickapprox");
		defineSymbol(math, ams, rel, "\u2AC6", "\\supseteqq", true);
		defineSymbol(math, ams, rel, "\u22D1", "\\Supset", true);
		defineSymbol(math, ams, rel, "\u2290", "\\sqsupset", true);
		defineSymbol(math, ams, rel, "\u227D", "\\succcurlyeq", true);
		defineSymbol(math, ams, rel, "\u22DF", "\\curlyeqsucc", true);
		defineSymbol(math, ams, rel, "\u227F", "\\succsim", true);
		defineSymbol(math, ams, rel, "\u2AB8", "\\succapprox", true);
		defineSymbol(math, ams, rel, "\u22B3", "\\vartriangleright");
		defineSymbol(math, ams, rel, "\u22B5", "\\trianglerighteq");
		defineSymbol(math, ams, rel, "\u22A9", "\\Vdash", true);
		defineSymbol(math, ams, rel, "\u2223", "\\shortmid");
		defineSymbol(math, ams, rel, "\u2225", "\\shortparallel");
		defineSymbol(math, ams, rel, "\u226C", "\\between", true);
		defineSymbol(math, ams, rel, "\u22D4", "\\pitchfork", true);
		defineSymbol(math, ams, rel, "\u221D", "\\varpropto");
		defineSymbol(math, ams, rel, "\u25C0", "\\blacktriangleleft"); // unicode-math says that \therefore is a mathord atom.
		// We kept the amssymb atom type, which is rel.

		defineSymbol(math, ams, rel, "\u2234", "\\therefore", true);
		defineSymbol(math, ams, rel, "\u220D", "\\backepsilon");
		defineSymbol(math, ams, rel, "\u25B6", "\\blacktriangleright"); // unicode-math says that \because is a mathord atom.
		// We kept the amssymb atom type, which is rel.

		defineSymbol(math, ams, rel, "\u2235", "\\because", true);
		defineSymbol(math, ams, rel, "\u22D8", "\\llless");
		defineSymbol(math, ams, rel, "\u22D9", "\\gggtr");
		defineSymbol(math, ams, bin, "\u22B2", "\\lhd");
		defineSymbol(math, ams, bin, "\u22B3", "\\rhd");
		defineSymbol(math, ams, rel, "\u2242", "\\eqsim", true);
		defineSymbol(math, main, rel, "\u22C8", "\\Join");
		defineSymbol(math, ams, rel, "\u2251", "\\Doteq", true); // AMS Binary Operators

		defineSymbol(math, ams, bin, "\u2214", "\\dotplus", true);
		defineSymbol(math, ams, bin, "\u2216", "\\smallsetminus");
		defineSymbol(math, ams, bin, "\u22D2", "\\Cap", true);
		defineSymbol(math, ams, bin, "\u22D3", "\\Cup", true);
		defineSymbol(math, ams, bin, "\u2A5E", "\\doublebarwedge", true);
		defineSymbol(math, ams, bin, "\u229F", "\\boxminus", true);
		defineSymbol(math, ams, bin, "\u229E", "\\boxplus", true);
		defineSymbol(math, ams, bin, "\u22C7", "\\divideontimes", true);
		defineSymbol(math, ams, bin, "\u22C9", "\\ltimes", true);
		defineSymbol(math, ams, bin, "\u22CA", "\\rtimes", true);
		defineSymbol(math, ams, bin, "\u22CB", "\\leftthreetimes", true);
		defineSymbol(math, ams, bin, "\u22CC", "\\rightthreetimes", true);
		defineSymbol(math, ams, bin, "\u22CF", "\\curlywedge", true);
		defineSymbol(math, ams, bin, "\u22CE", "\\curlyvee", true);
		defineSymbol(math, ams, bin, "\u229D", "\\circleddash", true);
		defineSymbol(math, ams, bin, "\u229B", "\\circledast", true);
		defineSymbol(math, ams, bin, "\u22C5", "\\centerdot");
		defineSymbol(math, ams, bin, "\u22BA", "\\intercal", true);
		defineSymbol(math, ams, bin, "\u22D2", "\\doublecap");
		defineSymbol(math, ams, bin, "\u22D3", "\\doublecup");
		defineSymbol(math, ams, bin, "\u22A0", "\\boxtimes", true); // AMS Arrows
		// Note: unicode-math maps \u21e2 to their own function \rightdasharrow.
		// We'll map it to AMS function \dashrightarrow. It produces the same atom.

		defineSymbol(math, ams, rel, "\u21E2", "\\dashrightarrow", true); // unicode-math maps \u21e0 to \leftdasharrow. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u21E0", "\\dashleftarrow", true);
		defineSymbol(math, ams, rel, "\u21C7", "\\leftleftarrows", true);
		defineSymbol(math, ams, rel, "\u21C6", "\\leftrightarrows", true);
		defineSymbol(math, ams, rel, "\u21DA", "\\Lleftarrow", true);
		defineSymbol(math, ams, rel, "\u219E", "\\twoheadleftarrow", true);
		defineSymbol(math, ams, rel, "\u21A2", "\\leftarrowtail", true);
		defineSymbol(math, ams, rel, "\u21AB", "\\looparrowleft", true);
		defineSymbol(math, ams, rel, "\u21CB", "\\leftrightharpoons", true);
		defineSymbol(math, ams, rel, "\u21B6", "\\curvearrowleft", true); // unicode-math maps \u21ba to \acwopencirclearrow. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u21BA", "\\circlearrowleft", true);
		defineSymbol(math, ams, rel, "\u21B0", "\\Lsh", true);
		defineSymbol(math, ams, rel, "\u21C8", "\\upuparrows", true);
		defineSymbol(math, ams, rel, "\u21BF", "\\upharpoonleft", true);
		defineSymbol(math, ams, rel, "\u21C3", "\\downharpoonleft", true);
		defineSymbol(math, main, rel, "\u22B6", "\\origof", true); // not in font

		defineSymbol(math, main, rel, "\u22B7", "\\imageof", true); // not in font

		defineSymbol(math, ams, rel, "\u22B8", "\\multimap", true);
		defineSymbol(math, ams, rel, "\u21AD", "\\leftrightsquigarrow", true);
		defineSymbol(math, ams, rel, "\u21C9", "\\rightrightarrows", true);
		defineSymbol(math, ams, rel, "\u21C4", "\\rightleftarrows", true);
		defineSymbol(math, ams, rel, "\u21A0", "\\twoheadrightarrow", true);
		defineSymbol(math, ams, rel, "\u21A3", "\\rightarrowtail", true);
		defineSymbol(math, ams, rel, "\u21AC", "\\looparrowright", true);
		defineSymbol(math, ams, rel, "\u21B7", "\\curvearrowright", true); // unicode-math maps \u21bb to \cwopencirclearrow. We'll use the AMS synonym.

		defineSymbol(math, ams, rel, "\u21BB", "\\circlearrowright", true);
		defineSymbol(math, ams, rel, "\u21B1", "\\Rsh", true);
		defineSymbol(math, ams, rel, "\u21CA", "\\downdownarrows", true);
		defineSymbol(math, ams, rel, "\u21BE", "\\upharpoonright", true);
		defineSymbol(math, ams, rel, "\u21C2", "\\downharpoonright", true);
		defineSymbol(math, ams, rel, "\u21DD", "\\rightsquigarrow", true);
		defineSymbol(math, ams, rel, "\u21DD", "\\leadsto");
		defineSymbol(math, ams, rel, "\u21DB", "\\Rrightarrow", true);
		defineSymbol(math, ams, rel, "\u21BE", "\\restriction");
		defineSymbol(math, main, textord, "\u2018", "`");
		defineSymbol(math, main, textord, "$", "\\$");
		defineSymbol(symbols_text, main, textord, "$", "\\$");
		defineSymbol(symbols_text, main, textord, "$", "\\textdollar");
		defineSymbol(math, main, textord, "%", "\\%");
		defineSymbol(symbols_text, main, textord, "%", "\\%");
		defineSymbol(math, main, textord, "_", "\\_");
		defineSymbol(symbols_text, main, textord, "_", "\\_");
		defineSymbol(symbols_text, main, textord, "_", "\\textunderscore");
		defineSymbol(math, main, textord, "\u2220", "\\angle", true);
		defineSymbol(math, main, textord, "\u221E", "\\infty", true);
		defineSymbol(math, main, textord, "\u2032", "\\prime");
		defineSymbol(math, main, textord, "\u25B3", "\\triangle");
		defineSymbol(math, main, textord, "\u0393", "\\Gamma", true);
		defineSymbol(math, main, textord, "\u0394", "\\Delta", true);
		defineSymbol(math, main, textord, "\u0398", "\\Theta", true);
		defineSymbol(math, main, textord, "\u039B", "\\Lambda", true);
		defineSymbol(math, main, textord, "\u039E", "\\Xi", true);
		defineSymbol(math, main, textord, "\u03A0", "\\Pi", true);
		defineSymbol(math, main, textord, "\u03A3", "\\Sigma", true);
		defineSymbol(math, main, textord, "\u03A5", "\\Upsilon", true);
		defineSymbol(math, main, textord, "\u03A6", "\\Phi", true);
		defineSymbol(math, main, textord, "\u03A8", "\\Psi", true);
		defineSymbol(math, main, textord, "\u03A9", "\\Omega", true);
		defineSymbol(math, main, textord, "A", "\u0391");
		defineSymbol(math, main, textord, "B", "\u0392");
		defineSymbol(math, main, textord, "E", "\u0395");
		defineSymbol(math, main, textord, "Z", "\u0396");
		defineSymbol(math, main, textord, "H", "\u0397");
		defineSymbol(math, main, textord, "I", "\u0399");
		defineSymbol(math, main, textord, "K", "\u039A");
		defineSymbol(math, main, textord, "M", "\u039C");
		defineSymbol(math, main, textord, "N", "\u039D");
		defineSymbol(math, main, textord, "O", "\u039F");
		defineSymbol(math, main, textord, "P", "\u03A1");
		defineSymbol(math, main, textord, "T", "\u03A4");
		defineSymbol(math, main, textord, "X", "\u03A7");
		defineSymbol(math, main, textord, "\xAC", "\\neg", true);
		defineSymbol(math, main, textord, "\xAC", "\\lnot");
		defineSymbol(math, main, textord, "\u22A4", "\\top");
		defineSymbol(math, main, textord, "\u22A5", "\\bot");
		defineSymbol(math, main, textord, "\u2205", "\\emptyset");
		defineSymbol(math, ams, textord, "\u2205", "\\varnothing");
		defineSymbol(math, main, mathord, "\u03B1", "\\alpha", true);
		defineSymbol(math, main, mathord, "\u03B2", "\\beta", true);
		defineSymbol(math, main, mathord, "\u03B3", "\\gamma", true);
		defineSymbol(math, main, mathord, "\u03B4", "\\delta", true);
		defineSymbol(math, main, mathord, "\u03F5", "\\epsilon", true);
		defineSymbol(math, main, mathord, "\u03B6", "\\zeta", true);
		defineSymbol(math, main, mathord, "\u03B7", "\\eta", true);
		defineSymbol(math, main, mathord, "\u03B8", "\\theta", true);
		defineSymbol(math, main, mathord, "\u03B9", "\\iota", true);
		defineSymbol(math, main, mathord, "\u03BA", "\\kappa", true);
		defineSymbol(math, main, mathord, "\u03BB", "\\lambda", true);
		defineSymbol(math, main, mathord, "\u03BC", "\\mu", true);
		defineSymbol(math, main, mathord, "\u03BD", "\\nu", true);
		defineSymbol(math, main, mathord, "\u03BE", "\\xi", true);
		defineSymbol(math, main, mathord, "\u03BF", "\\omicron", true);
		defineSymbol(math, main, mathord, "\u03C0", "\\pi", true);
		defineSymbol(math, main, mathord, "\u03C1", "\\rho", true);
		defineSymbol(math, main, mathord, "\u03C3", "\\sigma", true);
		defineSymbol(math, main, mathord, "\u03C4", "\\tau", true);
		defineSymbol(math, main, mathord, "\u03C5", "\\upsilon", true);
		defineSymbol(math, main, mathord, "\u03D5", "\\phi", true);
		defineSymbol(math, main, mathord, "\u03C7", "\\chi", true);
		defineSymbol(math, main, mathord, "\u03C8", "\\psi", true);
		defineSymbol(math, main, mathord, "\u03C9", "\\omega", true);
		defineSymbol(math, main, mathord, "\u03B5", "\\varepsilon", true);
		defineSymbol(math, main, mathord, "\u03D1", "\\vartheta", true);
		defineSymbol(math, main, mathord, "\u03D6", "\\varpi", true);
		defineSymbol(math, main, mathord, "\u03F1", "\\varrho", true);
		defineSymbol(math, main, mathord, "\u03C2", "\\varsigma", true);
		defineSymbol(math, main, mathord, "\u03C6", "\\varphi", true);
		defineSymbol(math, main, bin, "\u2217", "*", true);
		defineSymbol(math, main, bin, "+", "+");
		defineSymbol(math, main, bin, "\u2212", "-", true);
		defineSymbol(math, main, bin, "\u22C5", "\\cdot", true);
		defineSymbol(math, main, bin, "\u2218", "\\circ", true);
		defineSymbol(math, main, bin, "\xF7", "\\div", true);
		defineSymbol(math, main, bin, "\xB1", "\\pm", true);
		defineSymbol(math, main, bin, "\xD7", "\\times", true);
		defineSymbol(math, main, bin, "\u2229", "\\cap", true);
		defineSymbol(math, main, bin, "\u222A", "\\cup", true);
		defineSymbol(math, main, bin, "\u2216", "\\setminus", true);
		defineSymbol(math, main, bin, "\u2227", "\\land");
		defineSymbol(math, main, bin, "\u2228", "\\lor");
		defineSymbol(math, main, bin, "\u2227", "\\wedge", true);
		defineSymbol(math, main, bin, "\u2228", "\\vee", true);
		defineSymbol(math, main, textord, "\u221A", "\\surd");
		defineSymbol(math, main, symbols_open, "\u27E8", "\\langle", true);
		defineSymbol(math, main, symbols_open, "\u2223", "\\lvert");
		defineSymbol(math, main, symbols_open, "\u2225", "\\lVert");
		defineSymbol(math, main, symbols_close, "?", "?");
		defineSymbol(math, main, symbols_close, "!", "!");
		defineSymbol(math, main, symbols_close, "\u27E9", "\\rangle", true);
		defineSymbol(math, main, symbols_close, "\u2223", "\\rvert");
		defineSymbol(math, main, symbols_close, "\u2225", "\\rVert");
		defineSymbol(math, main, rel, "=", "=");
		defineSymbol(math, main, rel, ":", ":");
		defineSymbol(math, main, rel, "\u2248", "\\approx", true);
		defineSymbol(math, main, rel, "\u2245", "\\cong", true);
		defineSymbol(math, main, rel, "\u2265", "\\ge");
		defineSymbol(math, main, rel, "\u2265", "\\geq", true);
		defineSymbol(math, main, rel, "\u2190", "\\gets");
		defineSymbol(math, main, rel, ">", "\\gt", true);
		defineSymbol(math, main, rel, "\u2208", "\\in", true);
		defineSymbol(math, main, rel, "\uE020", "\\@not");
		defineSymbol(math, main, rel, "\u2282", "\\subset", true);
		defineSymbol(math, main, rel, "\u2283", "\\supset", true);
		defineSymbol(math, main, rel, "\u2286", "\\subseteq", true);
		defineSymbol(math, main, rel, "\u2287", "\\supseteq", true);
		defineSymbol(math, ams, rel, "\u2288", "\\nsubseteq", true);
		defineSymbol(math, ams, rel, "\u2289", "\\nsupseteq", true);
		defineSymbol(math, main, rel, "\u22A8", "\\models");
		defineSymbol(math, main, rel, "\u2190", "\\leftarrow", true);
		defineSymbol(math, main, rel, "\u2264", "\\le");
		defineSymbol(math, main, rel, "\u2264", "\\leq", true);
		defineSymbol(math, main, rel, "<", "\\lt", true);
		defineSymbol(math, main, rel, "\u2192", "\\rightarrow", true);
		defineSymbol(math, main, rel, "\u2192", "\\to");
		defineSymbol(math, ams, rel, "\u2271", "\\ngeq", true);
		defineSymbol(math, ams, rel, "\u2270", "\\nleq", true);
		defineSymbol(math, main, spacing, "\xA0", "\\ ");
		defineSymbol(math, main, spacing, "\xA0", "\\space"); // Ref: LaTeX Source 2e: \DeclareRobustCommand{\nobreakspace}{%

		defineSymbol(math, main, spacing, "\xA0", "\\nobreakspace");
		defineSymbol(symbols_text, main, spacing, "\xA0", "\\ ");
		defineSymbol(symbols_text, main, spacing, "\xA0", " ");
		defineSymbol(symbols_text, main, spacing, "\xA0", "\\space");
		defineSymbol(symbols_text, main, spacing, "\xA0", "\\nobreakspace");
		defineSymbol(math, main, spacing, null, "\\nobreak");
		defineSymbol(math, main, spacing, null, "\\allowbreak");
		defineSymbol(math, main, punct, ",", ",");
		defineSymbol(math, main, punct, ";", ";");
		defineSymbol(math, ams, bin, "\u22BC", "\\barwedge", true);
		defineSymbol(math, ams, bin, "\u22BB", "\\veebar", true);
		defineSymbol(math, main, bin, "\u2299", "\\odot", true);
		defineSymbol(math, main, bin, "\u2295", "\\oplus", true);
		defineSymbol(math, main, bin, "\u2297", "\\otimes", true);
		defineSymbol(math, main, textord, "\u2202", "\\partial", true);
		defineSymbol(math, main, bin, "\u2298", "\\oslash", true);
		defineSymbol(math, ams, bin, "\u229A", "\\circledcirc", true);
		defineSymbol(math, ams, bin, "\u22A1", "\\boxdot", true);
		defineSymbol(math, main, bin, "\u25B3", "\\bigtriangleup");
		defineSymbol(math, main, bin, "\u25BD", "\\bigtriangledown");
		defineSymbol(math, main, bin, "\u2020", "\\dagger");
		defineSymbol(math, main, bin, "\u22C4", "\\diamond");
		defineSymbol(math, main, bin, "\u22C6", "\\star");
		defineSymbol(math, main, bin, "\u25C3", "\\triangleleft");
		defineSymbol(math, main, bin, "\u25B9", "\\triangleright");
		defineSymbol(math, main, symbols_open, "{", "\\{");
		defineSymbol(symbols_text, main, textord, "{", "\\{");
		defineSymbol(symbols_text, main, textord, "{", "\\textbraceleft");
		defineSymbol(math, main, symbols_close, "}", "\\}");
		defineSymbol(symbols_text, main, textord, "}", "\\}");
		defineSymbol(symbols_text, main, textord, "}", "\\textbraceright");
		defineSymbol(math, main, symbols_open, "{", "\\lbrace");
		defineSymbol(math, main, symbols_close, "}", "\\rbrace");
		defineSymbol(math, main, symbols_open, "[", "\\lbrack", true);
		defineSymbol(symbols_text, main, textord, "[", "\\lbrack", true);
		defineSymbol(math, main, symbols_close, "]", "\\rbrack", true);
		defineSymbol(symbols_text, main, textord, "]", "\\rbrack", true);
		defineSymbol(math, main, symbols_open, "(", "\\lparen", true);
		defineSymbol(math, main, symbols_close, ")", "\\rparen", true);
		defineSymbol(symbols_text, main, textord, "<", "\\textless", true); // in T1 fontenc

		defineSymbol(symbols_text, main, textord, ">", "\\textgreater", true); // in T1 fontenc

		defineSymbol(math, main, symbols_open, "\u230A", "\\lfloor", true);
		defineSymbol(math, main, symbols_close, "\u230B", "\\rfloor", true);
		defineSymbol(math, main, symbols_open, "\u2308", "\\lceil", true);
		defineSymbol(math, main, symbols_close, "\u2309", "\\rceil", true);
		defineSymbol(math, main, textord, "\\", "\\backslash");
		defineSymbol(math, main, textord, "\u2223", "|");
		defineSymbol(math, main, textord, "\u2223", "\\vert");
		defineSymbol(symbols_text, main, textord, "|", "\\textbar", true); // in T1 fontenc

		defineSymbol(math, main, textord, "\u2225", "\\|");
		defineSymbol(math, main, textord, "\u2225", "\\Vert");
		defineSymbol(symbols_text, main, textord, "\u2225", "\\textbardbl");
		defineSymbol(symbols_text, main, textord, "~", "\\textasciitilde");
		defineSymbol(symbols_text, main, textord, "\\", "\\textbackslash");
		defineSymbol(symbols_text, main, textord, "^", "\\textasciicircum");
		defineSymbol(math, main, rel, "\u2191", "\\uparrow", true);
		defineSymbol(math, main, rel, "\u21D1", "\\Uparrow", true);
		defineSymbol(math, main, rel, "\u2193", "\\downarrow", true);
		defineSymbol(math, main, rel, "\u21D3", "\\Downarrow", true);
		defineSymbol(math, main, rel, "\u2195", "\\updownarrow", true);
		defineSymbol(math, main, rel, "\u21D5", "\\Updownarrow", true);
		defineSymbol(math, main, op, "\u2210", "\\coprod");
		defineSymbol(math, main, op, "\u22C1", "\\bigvee");
		defineSymbol(math, main, op, "\u22C0", "\\bigwedge");
		defineSymbol(math, main, op, "\u2A04", "\\biguplus");
		defineSymbol(math, main, op, "\u22C2", "\\bigcap");
		defineSymbol(math, main, op, "\u22C3", "\\bigcup");
		defineSymbol(math, main, op, "\u222B", "\\int");
		defineSymbol(math, main, op, "\u222B", "\\intop");
		defineSymbol(math, main, op, "\u222C", "\\iint");
		defineSymbol(math, main, op, "\u222D", "\\iiint");
		defineSymbol(math, main, op, "\u220F", "\\prod");
		defineSymbol(math, main, op, "\u2211", "\\sum");
		defineSymbol(math, main, op, "\u2A02", "\\bigotimes");
		defineSymbol(math, main, op, "\u2A01", "\\bigoplus");
		defineSymbol(math, main, op, "\u2A00", "\\bigodot");
		defineSymbol(math, main, op, "\u222E", "\\oint");
		defineSymbol(math, main, op, "\u222F", "\\oiint");
		defineSymbol(math, main, op, "\u2230", "\\oiiint");
		defineSymbol(math, main, op, "\u2A06", "\\bigsqcup");
		defineSymbol(math, main, op, "\u222B", "\\smallint");
		defineSymbol(symbols_text, main, inner, "\u2026", "\\textellipsis");
		defineSymbol(math, main, inner, "\u2026", "\\mathellipsis");
		defineSymbol(symbols_text, main, inner, "\u2026", "\\ldots", true);
		defineSymbol(math, main, inner, "\u2026", "\\ldots", true);
		defineSymbol(math, main, inner, "\u22EF", "\\@cdots", true);
		defineSymbol(math, main, inner, "\u22F1", "\\ddots", true);
		defineSymbol(math, main, textord, "\u22EE", "\\varvdots"); // \vdots is a macro

		defineSymbol(math, main, accent, "\u02CA", "\\acute");
		defineSymbol(math, main, accent, "\u02CB", "\\grave");
		defineSymbol(math, main, accent, "\xA8", "\\ddot");
		defineSymbol(math, main, accent, "~", "\\tilde");
		defineSymbol(math, main, accent, "\u02C9", "\\bar");
		defineSymbol(math, main, accent, "\u02D8", "\\breve");
		defineSymbol(math, main, accent, "\u02C7", "\\check");
		defineSymbol(math, main, accent, "^", "\\hat");
		defineSymbol(math, main, accent, "\u20D7", "\\vec");
		defineSymbol(math, main, accent, "\u02D9", "\\dot");
		defineSymbol(math, main, accent, "\u02DA", "\\mathring"); // \imath and \jmath should be invariant to \mathrm, \mathbf, etc., so use PUA

		defineSymbol(math, main, mathord, "\uE131", "\\@imath");
		defineSymbol(math, main, mathord, "\uE237", "\\@jmath");
		defineSymbol(math, main, textord, "\u0131", "\u0131");
		defineSymbol(math, main, textord, "\u0237", "\u0237");
		defineSymbol(symbols_text, main, textord, "\u0131", "\\i", true);
		defineSymbol(symbols_text, main, textord, "\u0237", "\\j", true);
		defineSymbol(symbols_text, main, textord, "\xDF", "\\ss", true);
		defineSymbol(symbols_text, main, textord, "\xE6", "\\ae", true);
		defineSymbol(symbols_text, main, textord, "\u0153", "\\oe", true);
		defineSymbol(symbols_text, main, textord, "\xF8", "\\o", true);
		defineSymbol(symbols_text, main, textord, "\xC6", "\\AE", true);
		defineSymbol(symbols_text, main, textord, "\u0152", "\\OE", true);
		defineSymbol(symbols_text, main, textord, "\xD8", "\\O", true);
		defineSymbol(symbols_text, main, accent, "\u02CA", "\\'"); // acute

		defineSymbol(symbols_text, main, accent, "\u02CB", "\\`"); // grave

		defineSymbol(symbols_text, main, accent, "\u02C6", "\\^"); // circumflex

		defineSymbol(symbols_text, main, accent, "\u02DC", "\\~"); // tilde

		defineSymbol(symbols_text, main, accent, "\u02C9", "\\="); // macron

		defineSymbol(symbols_text, main, accent, "\u02D8", "\\u"); // breve

		defineSymbol(symbols_text, main, accent, "\u02D9", "\\."); // dot above

		defineSymbol(symbols_text, main, accent, "\xB8", "\\c"); // cedilla

		defineSymbol(symbols_text, main, accent, "\u02DA", "\\r"); // ring above

		defineSymbol(symbols_text, main, accent, "\u02C7", "\\v"); // caron

		defineSymbol(symbols_text, main, accent, "\xA8", '\\"'); // diaresis

		defineSymbol(symbols_text, main, accent, "\u02DD", "\\H"); // double acute

		defineSymbol(symbols_text, main, accent, "\u25EF", "\\textcircled"); // \bigcirc glyph
		// These ligatures are detected and created in Parser.js's `formLigatures`.

		var ligatures = {
		  "--": true,
		  "---": true,
		  "``": true,
		  "''": true
		};
		defineSymbol(symbols_text, main, textord, "\u2013", "--", true);
		defineSymbol(symbols_text, main, textord, "\u2013", "\\textendash");
		defineSymbol(symbols_text, main, textord, "\u2014", "---", true);
		defineSymbol(symbols_text, main, textord, "\u2014", "\\textemdash");
		defineSymbol(symbols_text, main, textord, "\u2018", "`", true);
		defineSymbol(symbols_text, main, textord, "\u2018", "\\textquoteleft");
		defineSymbol(symbols_text, main, textord, "\u2019", "'", true);
		defineSymbol(symbols_text, main, textord, "\u2019", "\\textquoteright");
		defineSymbol(symbols_text, main, textord, "\u201C", "``", true);
		defineSymbol(symbols_text, main, textord, "\u201C", "\\textquotedblleft");
		defineSymbol(symbols_text, main, textord, "\u201D", "''", true);
		defineSymbol(symbols_text, main, textord, "\u201D", "\\textquotedblright"); //  \degree from gensymb package

		defineSymbol(math, main, textord, "\xB0", "\\degree", true);
		defineSymbol(symbols_text, main, textord, "\xB0", "\\degree"); // \textdegree from inputenc package

		defineSymbol(symbols_text, main, textord, "\xB0", "\\textdegree", true); // TODO: In LaTeX, \pounds can generate a different character in text and math
		// mode, but among our fonts, only Main-Regular defines this character "163".

		defineSymbol(math, main, textord, "\xA3", "\\pounds");
		defineSymbol(math, main, textord, "\xA3", "\\mathsterling", true);
		defineSymbol(symbols_text, main, textord, "\xA3", "\\pounds");
		defineSymbol(symbols_text, main, textord, "\xA3", "\\textsterling", true);
		defineSymbol(math, ams, textord, "\u2720", "\\maltese");
		defineSymbol(symbols_text, ams, textord, "\u2720", "\\maltese"); // There are lots of symbols which are the same, so we add them in afterwards.
		// All of these are textords in math mode

		var mathTextSymbols = "0123456789/@.\"";

		for (var i = 0; i < mathTextSymbols.length; i++) {
		  var ch = mathTextSymbols.charAt(i);
		  defineSymbol(math, main, textord, ch, ch);
		} // All of these are textords in text mode


		var textSymbols = "0123456789!@*()-=+\";:?/.,";

		for (var _i = 0; _i < textSymbols.length; _i++) {
		  var _ch = textSymbols.charAt(_i);

		  defineSymbol(symbols_text, main, textord, _ch, _ch);
		} // All of these are textords in text mode, and mathords in math mode


		var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

		for (var _i2 = 0; _i2 < letters.length; _i2++) {
		  var _ch2 = letters.charAt(_i2);

		  defineSymbol(math, main, mathord, _ch2, _ch2);
		  defineSymbol(symbols_text, main, textord, _ch2, _ch2);
		} // Blackboard bold and script letters in Unicode range


		defineSymbol(math, ams, textord, "C", "\u2102"); // blackboard bold

		defineSymbol(symbols_text, ams, textord, "C", "\u2102");
		defineSymbol(math, ams, textord, "H", "\u210D");
		defineSymbol(symbols_text, ams, textord, "H", "\u210D");
		defineSymbol(math, ams, textord, "N", "\u2115");
		defineSymbol(symbols_text, ams, textord, "N", "\u2115");
		defineSymbol(math, ams, textord, "P", "\u2119");
		defineSymbol(symbols_text, ams, textord, "P", "\u2119");
		defineSymbol(math, ams, textord, "Q", "\u211A");
		defineSymbol(symbols_text, ams, textord, "Q", "\u211A");
		defineSymbol(math, ams, textord, "R", "\u211D");
		defineSymbol(symbols_text, ams, textord, "R", "\u211D");
		defineSymbol(math, ams, textord, "Z", "\u2124");
		defineSymbol(symbols_text, ams, textord, "Z", "\u2124");
		defineSymbol(math, main, mathord, "h", "\u210E"); // italic h, Planck constant

		defineSymbol(symbols_text, main, mathord, "h", "\u210E"); // The next loop loads wide (surrogate pair) characters.
		// We support some letters in the Unicode range U+1D400 to U+1D7FF,
		// Mathematical Alphanumeric Symbols.
		// Some editors do not deal well with wide characters. So don't write the
		// string into this file. Instead, create the string from the surrogate pair.

		var wideChar = "";

		for (var _i3 = 0; _i3 < letters.length; _i3++) {
		  var _ch3 = letters.charAt(_i3); // The hex numbers in the next line are a surrogate pair.
		  // 0xD835 is the high surrogate for all letters in the range we support.
		  // 0xDC00 is the low surrogate for bold A.


		  wideChar = String.fromCharCode(0xD835, 0xDC00 + _i3); // A-Z a-z bold

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDC34 + _i3); // A-Z a-z italic

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDC68 + _i3); // A-Z a-z bold italic

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDD04 + _i3); // A-Z a-z Fractur

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDDA0 + _i3); // A-Z a-z sans-serif

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDDD4 + _i3); // A-Z a-z sans bold

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDE08 + _i3); // A-Z a-z sans italic

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDE70 + _i3); // A-Z a-z monospace

		  defineSymbol(math, main, mathord, _ch3, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch3, wideChar);

		  if (_i3 < 26) {
		    // KaTeX fonts have only capital letters for blackboard bold and script.
		    // See exception for k below.
		    wideChar = String.fromCharCode(0xD835, 0xDD38 + _i3); // A-Z double struck

		    defineSymbol(math, main, mathord, _ch3, wideChar);
		    defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		    wideChar = String.fromCharCode(0xD835, 0xDC9C + _i3); // A-Z script

		    defineSymbol(math, main, mathord, _ch3, wideChar);
		    defineSymbol(symbols_text, main, textord, _ch3, wideChar);
		  } // TODO: Add bold script when it is supported by a KaTeX font.

		} // "k" is the only double struck lower case letter in the KaTeX fonts.


		wideChar = String.fromCharCode(0xD835, 0xDD5C); // k double struck

		defineSymbol(math, main, mathord, "k", wideChar);
		defineSymbol(symbols_text, main, textord, "k", wideChar); // Next, some wide character numerals

		for (var _i4 = 0; _i4 < 10; _i4++) {
		  var _ch4 = _i4.toString();

		  wideChar = String.fromCharCode(0xD835, 0xDFCE + _i4); // 0-9 bold

		  defineSymbol(math, main, mathord, _ch4, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch4, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDFE2 + _i4); // 0-9 sans serif

		  defineSymbol(math, main, mathord, _ch4, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch4, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDFEC + _i4); // 0-9 bold sans

		  defineSymbol(math, main, mathord, _ch4, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch4, wideChar);
		  wideChar = String.fromCharCode(0xD835, 0xDFF6 + _i4); // 0-9 monospace

		  defineSymbol(math, main, mathord, _ch4, wideChar);
		  defineSymbol(symbols_text, main, textord, _ch4, wideChar);
		} // We add these Latin-1 letters as symbols for backwards-compatibility,
		// but they are not actually in the font, nor are they supported by the
		// Unicode accent mechanism, so they fall back to Times font and look ugly.
		// TODO(edemaine): Fix this.


		var extraLatin = "\xD0\xDE\xFE";

		for (var _i5 = 0; _i5 < extraLatin.length; _i5++) {
		  var _ch5 = extraLatin.charAt(_i5);

		  defineSymbol(math, main, mathord, _ch5, _ch5);
		  defineSymbol(symbols_text, main, textord, _ch5, _ch5);
		}
		/**
		 * This file provides support for Unicode range U+1D400 to U+1D7FF,
		 * Mathematical Alphanumeric Symbols.
		 *
		 * Function wideCharacterFont takes a wide character as input and returns
		 * the font information necessary to render it properly.
		 */

		/**
		 * Data below is from https://www.unicode.org/charts/PDF/U1D400.pdf
		 * That document sorts characters into groups by font type, say bold or italic.
		 *
		 * In the arrays below, each subarray consists three elements:
		 *      * The CSS class of that group when in math mode.
		 *      * The CSS class of that group when in text mode.
		 *      * The font name, so that KaTeX can get font metrics.
		 */

		var wideLatinLetterData = [["mathbf", "textbf", "Main-Bold"], // A-Z bold upright
		["mathbf", "textbf", "Main-Bold"], // a-z bold upright
		["mathnormal", "textit", "Math-Italic"], // A-Z italic
		["mathnormal", "textit", "Math-Italic"], // a-z italic
		["boldsymbol", "boldsymbol", "Main-BoldItalic"], // A-Z bold italic
		["boldsymbol", "boldsymbol", "Main-BoldItalic"], // a-z bold italic
		// Map fancy A-Z letters to script, not calligraphic.
		// This aligns with unicode-math and math fonts (except Cambria Math).
		["mathscr", "textscr", "Script-Regular"], // A-Z script
		["", "", ""], // a-z script.  No font
		["", "", ""], // A-Z bold script. No font
		["", "", ""], // a-z bold script. No font
		["mathfrak", "textfrak", "Fraktur-Regular"], // A-Z Fraktur
		["mathfrak", "textfrak", "Fraktur-Regular"], // a-z Fraktur
		["mathbb", "textbb", "AMS-Regular"], // A-Z double-struck
		["mathbb", "textbb", "AMS-Regular"], // k double-struck
		["", "", ""], // A-Z bold Fraktur No font metrics
		["", "", ""], // a-z bold Fraktur.   No font.
		["mathsf", "textsf", "SansSerif-Regular"], // A-Z sans-serif
		["mathsf", "textsf", "SansSerif-Regular"], // a-z sans-serif
		["mathboldsf", "textboldsf", "SansSerif-Bold"], // A-Z bold sans-serif
		["mathboldsf", "textboldsf", "SansSerif-Bold"], // a-z bold sans-serif
		["mathitsf", "textitsf", "SansSerif-Italic"], // A-Z italic sans-serif
		["mathitsf", "textitsf", "SansSerif-Italic"], // a-z italic sans-serif
		["", "", ""], // A-Z bold italic sans. No font
		["", "", ""], // a-z bold italic sans. No font
		["mathtt", "texttt", "Typewriter-Regular"], // A-Z monospace
		["mathtt", "texttt", "Typewriter-Regular"] // a-z monospace
		];
		var wideNumeralData = [["mathbf", "textbf", "Main-Bold"], // 0-9 bold
		["", "", ""], // 0-9 double-struck. No KaTeX font.
		["mathsf", "textsf", "SansSerif-Regular"], // 0-9 sans-serif
		["mathboldsf", "textboldsf", "SansSerif-Bold"], // 0-9 bold sans-serif
		["mathtt", "texttt", "Typewriter-Regular"] // 0-9 monospace
		];
		var wideCharacterFont = function wideCharacterFont(wideChar, mode) {
		  // IE doesn't support codePointAt(). So work with the surrogate pair.
		  var H = wideChar.charCodeAt(0); // high surrogate

		  var L = wideChar.charCodeAt(1); // low surrogate

		  var codePoint = (H - 0xD800) * 0x400 + (L - 0xDC00) + 0x10000;
		  var j = mode === "math" ? 0 : 1; // column index for CSS class.

		  if (0x1D400 <= codePoint && codePoint < 0x1D6A4) {
		    // wideLatinLetterData contains exactly 26 chars on each row.
		    // So we can calculate the relevant row. No traverse necessary.
		    var i = Math.floor((codePoint - 0x1D400) / 26);
		    return [wideLatinLetterData[i][2], wideLatinLetterData[i][j]];
		  } else if (0x1D7CE <= codePoint && codePoint <= 0x1D7FF) {
		    // Numerals, ten per row.
		    var _i = Math.floor((codePoint - 0x1D7CE) / 10);

		    return [wideNumeralData[_i][2], wideNumeralData[_i][j]];
		  } else if (codePoint === 0x1D6A5 || codePoint === 0x1D6A6) {
		    // dotless i or j
		    return [wideLatinLetterData[0][2], wideLatinLetterData[0][j]];
		  } else if (0x1D6A6 < codePoint && codePoint < 0x1D7CE) {
		    // Greek letters. Not supported, yet.
		    return ["", ""];
		  } else {
		    // We don't support any wide characters outside 1D400–1D7FF.
		    throw new src_ParseError("Unsupported character: " + wideChar);
		  }
		};
		/* eslint no-console:0 */

		/**
		 * This module contains general functions that can be used for building
		 * different kinds of domTree nodes in a consistent manner.
		 */







		/**
		 * Looks up the given symbol in fontMetrics, after applying any symbol
		 * replacements defined in symbol.js
		 */
		var lookupSymbol = function lookupSymbol(value, // TODO(#963): Use a union type for this.
		fontName, mode) {
		  // Replace the value with its replaced value from symbol.js
		  if (src_symbols[mode][value] && src_symbols[mode][value].replace) {
		    value = src_symbols[mode][value].replace;
		  }

		  return {
		    value: value,
		    metrics: getCharacterMetrics(value, fontName, mode)
		  };
		};
		/**
		 * Makes a symbolNode after translation via the list of symbols in symbols.js.
		 * Correctly pulls out metrics for the character, and optionally takes a list of
		 * classes to be attached to the node.
		 *
		 * TODO: make argument order closer to makeSpan
		 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
		 * should if present come first in `classes`.
		 * TODO(#953): Make `options` mandatory and always pass it in.
		 */


		var makeSymbol = function makeSymbol(value, fontName, mode, options, classes) {
		  var lookup = lookupSymbol(value, fontName, mode);
		  var metrics = lookup.metrics;
		  value = lookup.value;
		  var symbolNode;

		  if (metrics) {
		    var italic = metrics.italic;

		    if (mode === "text" || options && options.font === "mathit") {
		      italic = 0;
		    }

		    symbolNode = new SymbolNode(value, metrics.height, metrics.depth, italic, metrics.skew, metrics.width, classes);
		  } else {
		    // TODO(emily): Figure out a good way to only print this in development
		    typeof console !== "undefined" && console.warn("No character metrics " + ("for '" + value + "' in style '" + fontName + "' and mode '" + mode + "'"));
		    symbolNode = new SymbolNode(value, 0, 0, 0, 0, 0, classes);
		  }

		  if (options) {
		    symbolNode.maxFontSize = options.sizeMultiplier;

		    if (options.style.isTight()) {
		      symbolNode.classes.push("mtight");
		    }

		    var color = options.getColor();

		    if (color) {
		      symbolNode.style.color = color;
		    }
		  }

		  return symbolNode;
		};
		/**
		 * Makes a symbol in Main-Regular or AMS-Regular.
		 * Used for rel, bin, open, close, inner, and punct.
		 */


		var mathsym = function mathsym(value, mode, options, classes) {
		  if (classes === void 0) {
		    classes = [];
		  }

		  // Decide what font to render the symbol in by its entry in the symbols
		  // table.
		  // Have a special case for when the value = \ because the \ is used as a
		  // textord in unsupported command errors but cannot be parsed as a regular
		  // text ordinal and is therefore not present as a symbol in the symbols
		  // table for text, as well as a special case for boldsymbol because it
		  // can be used for bold + and -
		  if (options.font === "boldsymbol" && lookupSymbol(value, "Main-Bold", mode).metrics) {
		    return makeSymbol(value, "Main-Bold", mode, options, classes.concat(["mathbf"]));
		  } else if (value === "\\" || src_symbols[mode][value].font === "main") {
		    return makeSymbol(value, "Main-Regular", mode, options, classes);
		  } else {
		    return makeSymbol(value, "AMS-Regular", mode, options, classes.concat(["amsrm"]));
		  }
		};
		/**
		 * Determines which of the two font names (Main-Bold and Math-BoldItalic) and
		 * corresponding style tags (mathbf or boldsymbol) to use for font "boldsymbol",
		 * depending on the symbol.  Use this function instead of fontMap for font
		 * "boldsymbol".
		 */


		var boldsymbol = function boldsymbol(value, mode, options, classes, type) {
		  if (type !== "textord" && lookupSymbol(value, "Math-BoldItalic", mode).metrics) {
		    return {
		      fontName: "Math-BoldItalic",
		      fontClass: "boldsymbol"
		    };
		  } else {
		    // Some glyphs do not exist in Math-BoldItalic so we need to use
		    // Main-Bold instead.
		    return {
		      fontName: "Main-Bold",
		      fontClass: "mathbf"
		    };
		  }
		};
		/**
		 * Makes either a mathord or textord in the correct font and color.
		 */


		var makeOrd = function makeOrd(group, options, type) {
		  var mode = group.mode;
		  var text = group.text;
		  var classes = ["mord"]; // Math mode or Old font (i.e. \rm)

		  var isFont = mode === "math" || mode === "text" && options.font;
		  var fontOrFamily = isFont ? options.font : options.fontFamily;

		  if (text.charCodeAt(0) === 0xD835) {
		    // surrogate pairs get special treatment
		    var _wideCharacterFont = wideCharacterFont(text, mode),
		        wideFontName = _wideCharacterFont[0],
		        wideFontClass = _wideCharacterFont[1];

		    return makeSymbol(text, wideFontName, mode, options, classes.concat(wideFontClass));
		  } else if (fontOrFamily) {
		    var fontName;
		    var fontClasses;

		    if (fontOrFamily === "boldsymbol") {
		      var fontData = boldsymbol(text, mode, options, classes, type);
		      fontName = fontData.fontName;
		      fontClasses = [fontData.fontClass];
		    } else if (isFont) {
		      fontName = fontMap[fontOrFamily].fontName;
		      fontClasses = [fontOrFamily];
		    } else {
		      fontName = retrieveTextFontName(fontOrFamily, options.fontWeight, options.fontShape);
		      fontClasses = [fontOrFamily, options.fontWeight, options.fontShape];
		    }

		    if (lookupSymbol(text, fontName, mode).metrics) {
		      return makeSymbol(text, fontName, mode, options, classes.concat(fontClasses));
		    } else if (ligatures.hasOwnProperty(text) && fontName.slice(0, 10) === "Typewriter") {
		      // Deconstruct ligatures in monospace fonts (\texttt, \tt).
		      var parts = [];

		      for (var i = 0; i < text.length; i++) {
		        parts.push(makeSymbol(text[i], fontName, mode, options, classes.concat(fontClasses)));
		      }

		      return makeFragment(parts);
		    }
		  } // Makes a symbol in the default font for mathords and textords.


		  if (type === "mathord") {
		    return makeSymbol(text, "Math-Italic", mode, options, classes.concat(["mathnormal"]));
		  } else if (type === "textord") {
		    var font = src_symbols[mode][text] && src_symbols[mode][text].font;

		    if (font === "ams") {
		      var _fontName = retrieveTextFontName("amsrm", options.fontWeight, options.fontShape);

		      return makeSymbol(text, _fontName, mode, options, classes.concat("amsrm", options.fontWeight, options.fontShape));
		    } else if (font === "main" || !font) {
		      var _fontName2 = retrieveTextFontName("textrm", options.fontWeight, options.fontShape);

		      return makeSymbol(text, _fontName2, mode, options, classes.concat(options.fontWeight, options.fontShape));
		    } else {
		      // fonts added by plugins
		      var _fontName3 = retrieveTextFontName(font, options.fontWeight, options.fontShape); // We add font name as a css class


		      return makeSymbol(text, _fontName3, mode, options, classes.concat(_fontName3, options.fontWeight, options.fontShape));
		    }
		  } else {
		    throw new Error("unexpected type: " + type + " in makeOrd");
		  }
		};
		/**
		 * Returns true if subsequent symbolNodes have the same classes, skew, maxFont,
		 * and styles.
		 */


		var canCombine = function canCombine(prev, next) {
		  if (createClass(prev.classes) !== createClass(next.classes) || prev.skew !== next.skew || prev.maxFontSize !== next.maxFontSize) {
		    return false;
		  } // If prev and next both are just "mbin"s or "mord"s we don't combine them
		  // so that the proper spacing can be preserved.


		  if (prev.classes.length === 1) {
		    var cls = prev.classes[0];

		    if (cls === "mbin" || cls === "mord") {
		      return false;
		    }
		  }

		  for (var style in prev.style) {
		    if (prev.style.hasOwnProperty(style) && prev.style[style] !== next.style[style]) {
		      return false;
		    }
		  }

		  for (var _style in next.style) {
		    if (next.style.hasOwnProperty(_style) && prev.style[_style] !== next.style[_style]) {
		      return false;
		    }
		  }

		  return true;
		};
		/**
		 * Combine consecutive domTree.symbolNodes into a single symbolNode.
		 * Note: this function mutates the argument.
		 */


		var tryCombineChars = function tryCombineChars(chars) {
		  for (var i = 0; i < chars.length - 1; i++) {
		    var prev = chars[i];
		    var next = chars[i + 1];

		    if (prev instanceof SymbolNode && next instanceof SymbolNode && canCombine(prev, next)) {
		      prev.text += next.text;
		      prev.height = Math.max(prev.height, next.height);
		      prev.depth = Math.max(prev.depth, next.depth); // Use the last character's italic correction since we use
		      // it to add padding to the right of the span created from
		      // the combined characters.

		      prev.italic = next.italic;
		      chars.splice(i + 1, 1);
		      i--;
		    }
		  }

		  return chars;
		};
		/**
		 * Calculate the height, depth, and maxFontSize of an element based on its
		 * children.
		 */


		var sizeElementFromChildren = function sizeElementFromChildren(elem) {
		  var height = 0;
		  var depth = 0;
		  var maxFontSize = 0;

		  for (var i = 0; i < elem.children.length; i++) {
		    var child = elem.children[i];

		    if (child.height > height) {
		      height = child.height;
		    }

		    if (child.depth > depth) {
		      depth = child.depth;
		    }

		    if (child.maxFontSize > maxFontSize) {
		      maxFontSize = child.maxFontSize;
		    }
		  }

		  elem.height = height;
		  elem.depth = depth;
		  elem.maxFontSize = maxFontSize;
		};
		/**
		 * Makes a span with the given list of classes, list of children, and options.
		 *
		 * TODO(#953): Ensure that `options` is always provided (currently some call
		 * sites don't pass it) and make the type below mandatory.
		 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
		 * should if present come first in `classes`.
		 */


		var makeSpan = function makeSpan(classes, children, options, style) {
		  var span = new Span(classes, children, options, style);
		  sizeElementFromChildren(span);
		  return span;
		}; // SVG one is simpler -- doesn't require height, depth, max-font setting.
		// This is also a separate method for typesafety.


		var makeSvgSpan = function makeSvgSpan(classes, children, options, style) {
		  return new Span(classes, children, options, style);
		};

		var makeLineSpan = function makeLineSpan(className, options, thickness) {
		  var line = makeSpan([className], [], options);
		  line.height = Math.max(thickness || options.fontMetrics().defaultRuleThickness, options.minRuleThickness);
		  line.style.borderBottomWidth = makeEm(line.height);
		  line.maxFontSize = 1.0;
		  return line;
		};
		/**
		 * Makes an anchor with the given href, list of classes, list of children,
		 * and options.
		 */


		var makeAnchor = function makeAnchor(href, classes, children, options) {
		  var anchor = new Anchor(href, classes, children, options);
		  sizeElementFromChildren(anchor);
		  return anchor;
		};
		/**
		 * Makes a document fragment with the given list of children.
		 */


		var makeFragment = function makeFragment(children) {
		  var fragment = new DocumentFragment(children);
		  sizeElementFromChildren(fragment);
		  return fragment;
		};
		/**
		 * Wraps group in a span if it's a document fragment, allowing to apply classes
		 * and styles
		 */


		var wrapFragment = function wrapFragment(group, options) {
		  if (group instanceof DocumentFragment) {
		    return makeSpan([], [group], options);
		  }

		  return group;
		}; // These are exact object types to catch typos in the names of the optional fields.


		// Computes the updated `children` list and the overall depth.
		//
		// This helper function for makeVList makes it easier to enforce type safety by
		// allowing early exits (returns) in the logic.
		var getVListChildrenAndDepth = function getVListChildrenAndDepth(params) {
		  if (params.positionType === "individualShift") {
		    var oldChildren = params.children;
		    var children = [oldChildren[0]]; // Add in kerns to the list of params.children to get each element to be
		    // shifted to the correct specified shift

		    var _depth = -oldChildren[0].shift - oldChildren[0].elem.depth;

		    var currPos = _depth;

		    for (var i = 1; i < oldChildren.length; i++) {
		      var diff = -oldChildren[i].shift - currPos - oldChildren[i].elem.depth;
		      var size = diff - (oldChildren[i - 1].elem.height + oldChildren[i - 1].elem.depth);
		      currPos = currPos + diff;
		      children.push({
		        type: "kern",
		        size: size
		      });
		      children.push(oldChildren[i]);
		    }

		    return {
		      children: children,
		      depth: _depth
		    };
		  }

		  var depth;

		  if (params.positionType === "top") {
		    // We always start at the bottom, so calculate the bottom by adding up
		    // all the sizes
		    var bottom = params.positionData;

		    for (var _i = 0; _i < params.children.length; _i++) {
		      var child = params.children[_i];
		      bottom -= child.type === "kern" ? child.size : child.elem.height + child.elem.depth;
		    }

		    depth = bottom;
		  } else if (params.positionType === "bottom") {
		    depth = -params.positionData;
		  } else {
		    var firstChild = params.children[0];

		    if (firstChild.type !== "elem") {
		      throw new Error('First child must have type "elem".');
		    }

		    if (params.positionType === "shift") {
		      depth = -firstChild.elem.depth - params.positionData;
		    } else if (params.positionType === "firstBaseline") {
		      depth = -firstChild.elem.depth;
		    } else {
		      throw new Error("Invalid positionType " + params.positionType + ".");
		    }
		  }

		  return {
		    children: params.children,
		    depth: depth
		  };
		};
		/**
		 * Makes a vertical list by stacking elements and kerns on top of each other.
		 * Allows for many different ways of specifying the positioning method.
		 *
		 * See VListParam documentation above.
		 */


		var makeVList = function makeVList(params, options) {
		  var _getVListChildrenAndD = getVListChildrenAndDepth(params),
		      children = _getVListChildrenAndD.children,
		      depth = _getVListChildrenAndD.depth; // Create a strut that is taller than any list item. The strut is added to
		  // each item, where it will determine the item's baseline. Since it has
		  // `overflow:hidden`, the strut's top edge will sit on the item's line box's
		  // top edge and the strut's bottom edge will sit on the item's baseline,
		  // with no additional line-height spacing. This allows the item baseline to
		  // be positioned precisely without worrying about font ascent and
		  // line-height.


		  var pstrutSize = 0;

		  for (var i = 0; i < children.length; i++) {
		    var child = children[i];

		    if (child.type === "elem") {
		      var elem = child.elem;
		      pstrutSize = Math.max(pstrutSize, elem.maxFontSize, elem.height);
		    }
		  }

		  pstrutSize += 2;
		  var pstrut = makeSpan(["pstrut"], []);
		  pstrut.style.height = makeEm(pstrutSize); // Create a new list of actual children at the correct offsets

		  var realChildren = [];
		  var minPos = depth;
		  var maxPos = depth;
		  var currPos = depth;

		  for (var _i2 = 0; _i2 < children.length; _i2++) {
		    var _child = children[_i2];

		    if (_child.type === "kern") {
		      currPos += _child.size;
		    } else {
		      var _elem = _child.elem;
		      var classes = _child.wrapperClasses || [];
		      var style = _child.wrapperStyle || {};
		      var childWrap = makeSpan(classes, [pstrut, _elem], undefined, style);
		      childWrap.style.top = makeEm(-pstrutSize - currPos - _elem.depth);

		      if (_child.marginLeft) {
		        childWrap.style.marginLeft = _child.marginLeft;
		      }

		      if (_child.marginRight) {
		        childWrap.style.marginRight = _child.marginRight;
		      }

		      realChildren.push(childWrap);
		      currPos += _elem.height + _elem.depth;
		    }

		    minPos = Math.min(minPos, currPos);
		    maxPos = Math.max(maxPos, currPos);
		  } // The vlist contents go in a table-cell with `vertical-align:bottom`.
		  // This cell's bottom edge will determine the containing table's baseline
		  // without overly expanding the containing line-box.


		  var vlist = makeSpan(["vlist"], realChildren);
		  vlist.style.height = makeEm(maxPos); // A second row is used if necessary to represent the vlist's depth.

		  var rows;

		  if (minPos < 0) {
		    // We will define depth in an empty span with display: table-cell.
		    // It should render with the height that we define. But Chrome, in
		    // contenteditable mode only, treats that span as if it contains some
		    // text content. And that min-height over-rides our desired height.
		    // So we put another empty span inside the depth strut span.
		    var emptySpan = makeSpan([], []);
		    var depthStrut = makeSpan(["vlist"], [emptySpan]);
		    depthStrut.style.height = makeEm(-minPos); // Safari wants the first row to have inline content; otherwise it
		    // puts the bottom of the *second* row on the baseline.

		    var topStrut = makeSpan(["vlist-s"], [new SymbolNode("\u200B")]);
		    rows = [makeSpan(["vlist-r"], [vlist, topStrut]), makeSpan(["vlist-r"], [depthStrut])];
		  } else {
		    rows = [makeSpan(["vlist-r"], [vlist])];
		  }

		  var vtable = makeSpan(["vlist-t"], rows);

		  if (rows.length === 2) {
		    vtable.classes.push("vlist-t2");
		  }

		  vtable.height = maxPos;
		  vtable.depth = -minPos;
		  return vtable;
		}; // Glue is a concept from TeX which is a flexible space between elements in
		// either a vertical or horizontal list. In KaTeX, at least for now, it's
		// static space between elements in a horizontal layout.


		var makeGlue = function makeGlue(measurement, options) {
		  // Make an empty span for the space
		  var rule = makeSpan(["mspace"], [], options);
		  var size = calculateSize(measurement, options);
		  rule.style.marginRight = makeEm(size);
		  return rule;
		}; // Takes font options, and returns the appropriate fontLookup name


		var retrieveTextFontName = function retrieveTextFontName(fontFamily, fontWeight, fontShape) {
		  var baseFontName = "";

		  switch (fontFamily) {
		    case "amsrm":
		      baseFontName = "AMS";
		      break;

		    case "textrm":
		      baseFontName = "Main";
		      break;

		    case "textsf":
		      baseFontName = "SansSerif";
		      break;

		    case "texttt":
		      baseFontName = "Typewriter";
		      break;

		    default:
		      baseFontName = fontFamily;
		    // use fonts added by a plugin
		  }

		  var fontStylesName;

		  if (fontWeight === "textbf" && fontShape === "textit") {
		    fontStylesName = "BoldItalic";
		  } else if (fontWeight === "textbf") {
		    fontStylesName = "Bold";
		  } else if (fontWeight === "textit") {
		    fontStylesName = "Italic";
		  } else {
		    fontStylesName = "Regular";
		  }

		  return baseFontName + "-" + fontStylesName;
		};
		/**
		 * Maps TeX font commands to objects containing:
		 * - variant: string used for "mathvariant" attribute in buildMathML.js
		 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
		 */
		// A map between tex font commands an MathML mathvariant attribute values


		var fontMap = {
		  // styles
		  "mathbf": {
		    variant: "bold",
		    fontName: "Main-Bold"
		  },
		  "mathrm": {
		    variant: "normal",
		    fontName: "Main-Regular"
		  },
		  "textit": {
		    variant: "italic",
		    fontName: "Main-Italic"
		  },
		  "mathit": {
		    variant: "italic",
		    fontName: "Main-Italic"
		  },
		  "mathnormal": {
		    variant: "italic",
		    fontName: "Math-Italic"
		  },
		  // "boldsymbol" is missing because they require the use of multiple fonts:
		  // Math-BoldItalic and Main-Bold.  This is handled by a special case in
		  // makeOrd which ends up calling boldsymbol.
		  // families
		  "mathbb": {
		    variant: "double-struck",
		    fontName: "AMS-Regular"
		  },
		  "mathcal": {
		    variant: "script",
		    fontName: "Caligraphic-Regular"
		  },
		  "mathfrak": {
		    variant: "fraktur",
		    fontName: "Fraktur-Regular"
		  },
		  "mathscr": {
		    variant: "script",
		    fontName: "Script-Regular"
		  },
		  "mathsf": {
		    variant: "sans-serif",
		    fontName: "SansSerif-Regular"
		  },
		  "mathtt": {
		    variant: "monospace",
		    fontName: "Typewriter-Regular"
		  }
		};
		var svgData = {
		  //   path, width, height
		  vec: ["vec", 0.471, 0.714],
		  // values from the font glyph
		  oiintSize1: ["oiintSize1", 0.957, 0.499],
		  // oval to overlay the integrand
		  oiintSize2: ["oiintSize2", 1.472, 0.659],
		  oiiintSize1: ["oiiintSize1", 1.304, 0.499],
		  oiiintSize2: ["oiiintSize2", 1.98, 0.659]
		};

		var staticSvg = function staticSvg(value, options) {
		  // Create a span with inline SVG for the element.
		  var _svgData$value = svgData[value],
		      pathName = _svgData$value[0],
		      width = _svgData$value[1],
		      height = _svgData$value[2];
		  var path = new PathNode(pathName);
		  var svgNode = new SvgNode([path], {
		    "width": makeEm(width),
		    "height": makeEm(height),
		    // Override CSS rule `.katex svg { width: 100% }`
		    "style": "width:" + makeEm(width),
		    "viewBox": "0 0 " + 1000 * width + " " + 1000 * height,
		    "preserveAspectRatio": "xMinYMin"
		  });
		  var span = makeSvgSpan(["overlay"], [svgNode], options);
		  span.height = height;
		  span.style.height = makeEm(height);
		  span.style.width = makeEm(width);
		  return span;
		};

		/* harmony default export */ var buildCommon = ({
		  fontMap: fontMap,
		  makeSymbol: makeSymbol,
		  mathsym: mathsym,
		  makeSpan: makeSpan,
		  makeSvgSpan: makeSvgSpan,
		  makeLineSpan: makeLineSpan,
		  makeAnchor: makeAnchor,
		  makeFragment: makeFragment,
		  wrapFragment: wrapFragment,
		  makeVList: makeVList,
		  makeOrd: makeOrd,
		  makeGlue: makeGlue,
		  staticSvg: staticSvg,
		  svgData: svgData,
		  tryCombineChars: tryCombineChars
		});
		/**
		 * Describes spaces between different classes of atoms.
		 */
		var thinspace = {
		  number: 3,
		  unit: "mu"
		};
		var mediumspace = {
		  number: 4,
		  unit: "mu"
		};
		var thickspace = {
		  number: 5,
		  unit: "mu"
		}; // Making the type below exact with all optional fields doesn't work due to
		// - https://github.com/facebook/flow/issues/4582
		// - https://github.com/facebook/flow/issues/5688
		// However, since *all* fields are optional, $Shape<> works as suggested in 5688
		// above.

		// Spacing relationships for display and text styles
		var spacings = {
		  mord: {
		    mop: thinspace,
		    mbin: mediumspace,
		    mrel: thickspace,
		    minner: thinspace
		  },
		  mop: {
		    mord: thinspace,
		    mop: thinspace,
		    mrel: thickspace,
		    minner: thinspace
		  },
		  mbin: {
		    mord: mediumspace,
		    mop: mediumspace,
		    mopen: mediumspace,
		    minner: mediumspace
		  },
		  mrel: {
		    mord: thickspace,
		    mop: thickspace,
		    mopen: thickspace,
		    minner: thickspace
		  },
		  mopen: {},
		  mclose: {
		    mop: thinspace,
		    mbin: mediumspace,
		    mrel: thickspace,
		    minner: thinspace
		  },
		  mpunct: {
		    mord: thinspace,
		    mop: thinspace,
		    mrel: thickspace,
		    mopen: thinspace,
		    mclose: thinspace,
		    mpunct: thinspace,
		    minner: thinspace
		  },
		  minner: {
		    mord: thinspace,
		    mop: thinspace,
		    mbin: mediumspace,
		    mrel: thickspace,
		    mopen: thinspace,
		    mpunct: thinspace,
		    minner: thinspace
		  }
		}; // Spacing relationships for script and scriptscript styles

		var tightSpacings = {
		  mord: {
		    mop: thinspace
		  },
		  mop: {
		    mord: thinspace,
		    mop: thinspace
		  },
		  mbin: {},
		  mrel: {},
		  mopen: {},
		  mclose: {
		    mop: thinspace
		  },
		  mpunct: {},
		  minner: {
		    mop: thinspace
		  }
		};
		/** Context provided to function handlers for error messages. */
		// Note: reverse the order of the return type union will cause a flow error.
		// See https://github.com/facebook/flow/issues/3663.
		// More general version of `HtmlBuilder` for nodes (e.g. \sum, accent types)
		// whose presence impacts super/subscripting. In this case, ParseNode<"supsub">
		// delegates its HTML building to the HtmlBuilder corresponding to these nodes.

		/**
		 * Final function spec for use at parse time.
		 * This is almost identical to `FunctionPropSpec`, except it
		 * 1. includes the function handler, and
		 * 2. requires all arguments except argTypes.
		 * It is generated by `defineFunction()` below.
		 */

		/**
		 * All registered functions.
		 * `functions.js` just exports this same dictionary again and makes it public.
		 * `Parser.js` requires this dictionary.
		 */
		var _functions = {};
		/**
		 * All HTML builders. Should be only used in the `define*` and the `build*ML`
		 * functions.
		 */

		var _htmlGroupBuilders = {};
		/**
		 * All MathML builders. Should be only used in the `define*` and the `build*ML`
		 * functions.
		 */

		var _mathmlGroupBuilders = {};
		function defineFunction(_ref) {
		  var type = _ref.type,
		      names = _ref.names,
		      props = _ref.props,
		      handler = _ref.handler,
		      htmlBuilder = _ref.htmlBuilder,
		      mathmlBuilder = _ref.mathmlBuilder;
		  // Set default values of functions
		  var data = {
		    type: type,
		    numArgs: props.numArgs,
		    argTypes: props.argTypes,
		    allowedInArgument: !!props.allowedInArgument,
		    allowedInText: !!props.allowedInText,
		    allowedInMath: props.allowedInMath === undefined ? true : props.allowedInMath,
		    numOptionalArgs: props.numOptionalArgs || 0,
		    infix: !!props.infix,
		    primitive: !!props.primitive,
		    handler: handler
		  };

		  for (var i = 0; i < names.length; ++i) {
		    _functions[names[i]] = data;
		  }

		  if (type) {
		    if (htmlBuilder) {
		      _htmlGroupBuilders[type] = htmlBuilder;
		    }

		    if (mathmlBuilder) {
		      _mathmlGroupBuilders[type] = mathmlBuilder;
		    }
		  }
		}
		/**
		 * Use this to register only the HTML and MathML builders for a function (e.g.
		 * if the function's ParseNode is generated in Parser.js rather than via a
		 * stand-alone handler provided to `defineFunction`).
		 */

		function defineFunctionBuilders(_ref2) {
		  var type = _ref2.type,
		      htmlBuilder = _ref2.htmlBuilder,
		      mathmlBuilder = _ref2.mathmlBuilder;
		  defineFunction({
		    type: type,
		    names: [],
		    props: {
		      numArgs: 0
		    },
		    handler: function handler() {
		      throw new Error('Should never be called.');
		    },
		    htmlBuilder: htmlBuilder,
		    mathmlBuilder: mathmlBuilder
		  });
		}
		var normalizeArgument = function normalizeArgument(arg) {
		  return arg.type === "ordgroup" && arg.body.length === 1 ? arg.body[0] : arg;
		}; // Since the corresponding buildHTML/buildMathML function expects a
		// list of elements, we normalize for different kinds of arguments

		var ordargument = function ordargument(arg) {
		  return arg.type === "ordgroup" ? arg.body : [arg];
		};
		/**
		 * This file does the main work of building a domTree structure from a parse
		 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
		 * Then, the buildExpression, buildGroup, and various groupBuilders functions
		 * are called, to produce a final HTML tree.
		 */









		var buildHTML_makeSpan = buildCommon.makeSpan; // Binary atoms (first class `mbin`) change into ordinary atoms (`mord`)
		// depending on their surroundings. See TeXbook pg. 442-446, Rules 5 and 6,
		// and the text before Rule 19.

		var binLeftCanceller = ["leftmost", "mbin", "mopen", "mrel", "mop", "mpunct"];
		var binRightCanceller = ["rightmost", "mrel", "mclose", "mpunct"];
		var styleMap = {
		  "display": src_Style.DISPLAY,
		  "text": src_Style.TEXT,
		  "script": src_Style.SCRIPT,
		  "scriptscript": src_Style.SCRIPTSCRIPT
		};
		var DomEnum = {
		  mord: "mord",
		  mop: "mop",
		  mbin: "mbin",
		  mrel: "mrel",
		  mopen: "mopen",
		  mclose: "mclose",
		  mpunct: "mpunct",
		  minner: "minner"
		};

		/**
		 * Take a list of nodes, build them in order, and return a list of the built
		 * nodes. documentFragments are flattened into their contents, so the
		 * returned list contains no fragments. `isRealGroup` is true if `expression`
		 * is a real group (no atoms will be added on either side), as opposed to
		 * a partial group (e.g. one created by \color). `surrounding` is an array
		 * consisting type of nodes that will be added to the left and right.
		 */
		var buildExpression = function buildExpression(expression, options, isRealGroup, surrounding) {
		  if (surrounding === void 0) {
		    surrounding = [null, null];
		  }

		  // Parse expressions into `groups`.
		  var groups = [];

		  for (var i = 0; i < expression.length; i++) {
		    var output = buildGroup(expression[i], options);

		    if (output instanceof DocumentFragment) {
		      var children = output.children;
		      groups.push.apply(groups, children);
		    } else {
		      groups.push(output);
		    }
		  } // Combine consecutive domTree.symbolNodes into a single symbolNode.


		  buildCommon.tryCombineChars(groups); // If `expression` is a partial group, let the parent handle spacings
		  // to avoid processing groups multiple times.

		  if (!isRealGroup) {
		    return groups;
		  }

		  var glueOptions = options;

		  if (expression.length === 1) {
		    var node = expression[0];

		    if (node.type === "sizing") {
		      glueOptions = options.havingSize(node.size);
		    } else if (node.type === "styling") {
		      glueOptions = options.havingStyle(styleMap[node.style]);
		    }
		  } // Dummy spans for determining spacings between surrounding atoms.
		  // If `expression` has no atoms on the left or right, class "leftmost"
		  // or "rightmost", respectively, is used to indicate it.


		  var dummyPrev = buildHTML_makeSpan([surrounding[0] || "leftmost"], [], options);
		  var dummyNext = buildHTML_makeSpan([surrounding[1] || "rightmost"], [], options); // TODO: These code assumes that a node's math class is the first element
		  // of its `classes` array. A later cleanup should ensure this, for
		  // instance by changing the signature of `makeSpan`.
		  // Before determining what spaces to insert, perform bin cancellation.
		  // Binary operators change to ordinary symbols in some contexts.

		  var isRoot = isRealGroup === "root";
		  traverseNonSpaceNodes(groups, function (node, prev) {
		    var prevType = prev.classes[0];
		    var type = node.classes[0];

		    if (prevType === "mbin" && utils.contains(binRightCanceller, type)) {
		      prev.classes[0] = "mord";
		    } else if (type === "mbin" && utils.contains(binLeftCanceller, prevType)) {
		      node.classes[0] = "mord";
		    }
		  }, {
		    node: dummyPrev
		  }, dummyNext, isRoot);
		  traverseNonSpaceNodes(groups, function (node, prev) {
		    var prevType = getTypeOfDomTree(prev);
		    var type = getTypeOfDomTree(node); // 'mtight' indicates that the node is script or scriptscript style.

		    var space = prevType && type ? node.hasClass("mtight") ? tightSpacings[prevType][type] : spacings[prevType][type] : null;

		    if (space) {
		      // Insert glue (spacing) after the `prev`.
		      return buildCommon.makeGlue(space, glueOptions);
		    }
		  }, {
		    node: dummyPrev
		  }, dummyNext, isRoot);
		  return groups;
		}; // Depth-first traverse non-space `nodes`, calling `callback` with the current and
		// previous node as arguments, optionally returning a node to insert after the
		// previous node. `prev` is an object with the previous node and `insertAfter`
		// function to insert after it. `next` is a node that will be added to the right.
		// Used for bin cancellation and inserting spacings.

		var traverseNonSpaceNodes = function traverseNonSpaceNodes(nodes, callback, prev, next, isRoot) {
		  if (next) {
		    // temporarily append the right node, if exists
		    nodes.push(next);
		  }

		  var i = 0;

		  for (; i < nodes.length; i++) {
		    var node = nodes[i];
		    var partialGroup = checkPartialGroup(node);

		    if (partialGroup) {
		      // Recursive DFS
		      // $FlowFixMe: make nodes a $ReadOnlyArray by returning a new array
		      traverseNonSpaceNodes(partialGroup.children, callback, prev, null, isRoot);
		      continue;
		    } // Ignore explicit spaces (e.g., \;, \,) when determining what implicit
		    // spacing should go between atoms of different classes


		    var nonspace = !node.hasClass("mspace");

		    if (nonspace) {
		      var result = callback(node, prev.node);

		      if (result) {
		        if (prev.insertAfter) {
		          prev.insertAfter(result);
		        } else {
		          // insert at front
		          nodes.unshift(result);
		          i++;
		        }
		      }
		    }

		    if (nonspace) {
		      prev.node = node;
		    } else if (isRoot && node.hasClass("newline")) {
		      prev.node = buildHTML_makeSpan(["leftmost"]); // treat like beginning of line
		    }

		    prev.insertAfter = function (index) {
		      return function (n) {
		        nodes.splice(index + 1, 0, n);
		        i++;
		      };
		    }(i);
		  }

		  if (next) {
		    nodes.pop();
		  }
		}; // Check if given node is a partial group, i.e., does not affect spacing around.


		var checkPartialGroup = function checkPartialGroup(node) {
		  if (node instanceof DocumentFragment || node instanceof Anchor || node instanceof Span && node.hasClass("enclosing")) {
		    return node;
		  }

		  return null;
		}; // Return the outermost node of a domTree.


		var getOutermostNode = function getOutermostNode(node, side) {
		  var partialGroup = checkPartialGroup(node);

		  if (partialGroup) {
		    var children = partialGroup.children;

		    if (children.length) {
		      if (side === "right") {
		        return getOutermostNode(children[children.length - 1], "right");
		      } else if (side === "left") {
		        return getOutermostNode(children[0], "left");
		      }
		    }
		  }

		  return node;
		}; // Return math atom class (mclass) of a domTree.
		// If `side` is given, it will get the type of the outermost node at given side.


		var getTypeOfDomTree = function getTypeOfDomTree(node, side) {
		  if (!node) {
		    return null;
		  }

		  if (side) {
		    node = getOutermostNode(node, side);
		  } // This makes a lot of assumptions as to where the type of atom
		  // appears.  We should do a better job of enforcing this.


		  return DomEnum[node.classes[0]] || null;
		};
		var makeNullDelimiter = function makeNullDelimiter(options, classes) {
		  var moreClasses = ["nulldelimiter"].concat(options.baseSizingClasses());
		  return buildHTML_makeSpan(classes.concat(moreClasses));
		};
		/**
		 * buildGroup is the function that takes a group and calls the correct groupType
		 * function for it. It also handles the interaction of size and style changes
		 * between parents and children.
		 */

		var buildGroup = function buildGroup(group, options, baseOptions) {
		  if (!group) {
		    return buildHTML_makeSpan();
		  }

		  if (_htmlGroupBuilders[group.type]) {
		    // Call the groupBuilders function
		    // $FlowFixMe
		    var groupNode = _htmlGroupBuilders[group.type](group, options); // If the size changed between the parent and the current group, account
		    // for that size difference.

		    if (baseOptions && options.size !== baseOptions.size) {
		      groupNode = buildHTML_makeSpan(options.sizingClasses(baseOptions), [groupNode], options);
		      var multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier;
		      groupNode.height *= multiplier;
		      groupNode.depth *= multiplier;
		    }

		    return groupNode;
		  } else {
		    throw new src_ParseError("Got group of unknown type: '" + group.type + "'");
		  }
		};
		/**
		 * Combine an array of HTML DOM nodes (e.g., the output of `buildExpression`)
		 * into an unbreakable HTML node of class .base, with proper struts to
		 * guarantee correct vertical extent.  `buildHTML` calls this repeatedly to
		 * make up the entire expression as a sequence of unbreakable units.
		 */

		function buildHTMLUnbreakable(children, options) {
		  // Compute height and depth of this chunk.
		  var body = buildHTML_makeSpan(["base"], children, options); // Add strut, which ensures that the top of the HTML element falls at
		  // the height of the expression, and the bottom of the HTML element
		  // falls at the depth of the expression.

		  var strut = buildHTML_makeSpan(["strut"]);
		  strut.style.height = makeEm(body.height + body.depth);

		  if (body.depth) {
		    strut.style.verticalAlign = makeEm(-body.depth);
		  }

		  body.children.unshift(strut);
		  return body;
		}
		/**
		 * Take an entire parse tree, and build it into an appropriate set of HTML
		 * nodes.
		 */


		function buildHTML(tree, options) {
		  // Strip off outer tag wrapper for processing below.
		  var tag = null;

		  if (tree.length === 1 && tree[0].type === "tag") {
		    tag = tree[0].tag;
		    tree = tree[0].body;
		  } // Build the expression contained in the tree


		  var expression = buildExpression(tree, options, "root");
		  var eqnNum;

		  if (expression.length === 2 && expression[1].hasClass("tag")) {
		    // An environment with automatic equation numbers, e.g. {gather}.
		    eqnNum = expression.pop();
		  }

		  var children = []; // Create one base node for each chunk between potential line breaks.
		  // The TeXBook [p.173] says "A formula will be broken only after a
		  // relation symbol like $=$ or $<$ or $\rightarrow$, or after a binary
		  // operation symbol like $+$ or $-$ or $\times$, where the relation or
		  // binary operation is on the ``outer level'' of the formula (i.e., not
		  // enclosed in {...} and not part of an \over construction)."

		  var parts = [];

		  for (var i = 0; i < expression.length; i++) {
		    parts.push(expression[i]);

		    if (expression[i].hasClass("mbin") || expression[i].hasClass("mrel") || expression[i].hasClass("allowbreak")) {
		      // Put any post-operator glue on same line as operator.
		      // Watch for \nobreak along the way, and stop at \newline.
		      var nobreak = false;

		      while (i < expression.length - 1 && expression[i + 1].hasClass("mspace") && !expression[i + 1].hasClass("newline")) {
		        i++;
		        parts.push(expression[i]);

		        if (expression[i].hasClass("nobreak")) {
		          nobreak = true;
		        }
		      } // Don't allow break if \nobreak among the post-operator glue.


		      if (!nobreak) {
		        children.push(buildHTMLUnbreakable(parts, options));
		        parts = [];
		      }
		    } else if (expression[i].hasClass("newline")) {
		      // Write the line except the newline
		      parts.pop();

		      if (parts.length > 0) {
		        children.push(buildHTMLUnbreakable(parts, options));
		        parts = [];
		      } // Put the newline at the top level


		      children.push(expression[i]);
		    }
		  }

		  if (parts.length > 0) {
		    children.push(buildHTMLUnbreakable(parts, options));
		  } // Now, if there was a tag, build it too and append it as a final child.


		  var tagChild;

		  if (tag) {
		    tagChild = buildHTMLUnbreakable(buildExpression(tag, options, true));
		    tagChild.classes = ["tag"];
		    children.push(tagChild);
		  } else if (eqnNum) {
		    children.push(eqnNum);
		  }

		  var htmlNode = buildHTML_makeSpan(["katex-html"], children);
		  htmlNode.setAttribute("aria-hidden", "true"); // Adjust the strut of the tag to be the maximum height of all children
		  // (the height of the enclosing htmlNode) for proper vertical alignment.

		  if (tagChild) {
		    var strut = tagChild.children[0];
		    strut.style.height = makeEm(htmlNode.height + htmlNode.depth);

		    if (htmlNode.depth) {
		      strut.style.verticalAlign = makeEm(-htmlNode.depth);
		    }
		  }

		  return htmlNode;
		}
		/**
		 * These objects store data about MathML nodes. This is the MathML equivalent
		 * of the types in domTree.js. Since MathML handles its own rendering, and
		 * since we're mainly using MathML to improve accessibility, we don't manage
		 * any of the styling state that the plain DOM nodes do.
		 *
		 * The `toNode` and `toMarkup` functions work similarly to how they do in
		 * domTree.js, creating namespaced DOM nodes and HTML text markup respectively.
		 */




		function newDocumentFragment(children) {
		  return new DocumentFragment(children);
		}
		/**
		 * This node represents a general purpose MathML node of any type. The
		 * constructor requires the type of node to create (for example, `"mo"` or
		 * `"mspace"`, corresponding to `<mo>` and `<mspace>` tags).
		 */

		var MathNode = /*#__PURE__*/function () {
		  function MathNode(type, children, classes) {
		    this.type = void 0;
		    this.attributes = void 0;
		    this.children = void 0;
		    this.classes = void 0;
		    this.type = type;
		    this.attributes = {};
		    this.children = children || [];
		    this.classes = classes || [];
		  }
		  /**
		   * Sets an attribute on a MathML node. MathML depends on attributes to convey a
		   * semantic content, so this is used heavily.
		   */


		  var _proto = MathNode.prototype;

		  _proto.setAttribute = function setAttribute(name, value) {
		    this.attributes[name] = value;
		  }
		  /**
		   * Gets an attribute on a MathML node.
		   */
		  ;

		  _proto.getAttribute = function getAttribute(name) {
		    return this.attributes[name];
		  }
		  /**
		   * Converts the math node into a MathML-namespaced DOM element.
		   */
		  ;

		  _proto.toNode = function toNode() {
		    var node = document.createElementNS("http://www.w3.org/1998/Math/MathML", this.type);

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        node.setAttribute(attr, this.attributes[attr]);
		      }
		    }

		    if (this.classes.length > 0) {
		      node.className = createClass(this.classes);
		    }

		    for (var i = 0; i < this.children.length; i++) {
		      node.appendChild(this.children[i].toNode());
		    }

		    return node;
		  }
		  /**
		   * Converts the math node into an HTML markup string.
		   */
		  ;

		  _proto.toMarkup = function toMarkup() {
		    var markup = "<" + this.type; // Add the attributes

		    for (var attr in this.attributes) {
		      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
		        markup += " " + attr + "=\"";
		        markup += utils.escape(this.attributes[attr]);
		        markup += "\"";
		      }
		    }

		    if (this.classes.length > 0) {
		      markup += " class =\"" + utils.escape(createClass(this.classes)) + "\"";
		    }

		    markup += ">";

		    for (var i = 0; i < this.children.length; i++) {
		      markup += this.children[i].toMarkup();
		    }

		    markup += "</" + this.type + ">";
		    return markup;
		  }
		  /**
		   * Converts the math node into a string, similar to innerText, but escaped.
		   */
		  ;

		  _proto.toText = function toText() {
		    return this.children.map(function (child) {
		      return child.toText();
		    }).join("");
		  };

		  return MathNode;
		}();
		/**
		 * This node represents a piece of text.
		 */

		var TextNode = /*#__PURE__*/function () {
		  function TextNode(text) {
		    this.text = void 0;
		    this.text = text;
		  }
		  /**
		   * Converts the text node into a DOM text node.
		   */


		  var _proto2 = TextNode.prototype;

		  _proto2.toNode = function toNode() {
		    return document.createTextNode(this.text);
		  }
		  /**
		   * Converts the text node into escaped HTML markup
		   * (representing the text itself).
		   */
		  ;

		  _proto2.toMarkup = function toMarkup() {
		    return utils.escape(this.toText());
		  }
		  /**
		   * Converts the text node into a string
		   * (representing the text itself).
		   */
		  ;

		  _proto2.toText = function toText() {
		    return this.text;
		  };

		  return TextNode;
		}();
		/**
		 * This node represents a space, but may render as <mspace.../> or as text,
		 * depending on the width.
		 */

		var SpaceNode = /*#__PURE__*/function () {
		  /**
		   * Create a Space node with width given in CSS ems.
		   */
		  function SpaceNode(width) {
		    this.width = void 0;
		    this.character = void 0;
		    this.width = width; // See https://www.w3.org/TR/2000/WD-MathML2-20000328/chapter6.html
		    // for a table of space-like characters.  We use Unicode
		    // representations instead of &LongNames; as it's not clear how to
		    // make the latter via document.createTextNode.

		    if (width >= 0.05555 && width <= 0.05556) {
		      this.character = "\u200A"; // &VeryThinSpace;
		    } else if (width >= 0.1666 && width <= 0.1667) {
		      this.character = "\u2009"; // &ThinSpace;
		    } else if (width >= 0.2222 && width <= 0.2223) {
		      this.character = "\u2005"; // &MediumSpace;
		    } else if (width >= 0.2777 && width <= 0.2778) {
		      this.character = "\u2005\u200A"; // &ThickSpace;
		    } else if (width >= -0.05556 && width <= -0.05555) {
		      this.character = "\u200A\u2063"; // &NegativeVeryThinSpace;
		    } else if (width >= -0.1667 && width <= -0.1666) {
		      this.character = "\u2009\u2063"; // &NegativeThinSpace;
		    } else if (width >= -0.2223 && width <= -0.2222) {
		      this.character = "\u205F\u2063"; // &NegativeMediumSpace;
		    } else if (width >= -0.2778 && width <= -0.2777) {
		      this.character = "\u2005\u2063"; // &NegativeThickSpace;
		    } else {
		      this.character = null;
		    }
		  }
		  /**
		   * Converts the math node into a MathML-namespaced DOM element.
		   */


		  var _proto3 = SpaceNode.prototype;

		  _proto3.toNode = function toNode() {
		    if (this.character) {
		      return document.createTextNode(this.character);
		    } else {
		      var node = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mspace");
		      node.setAttribute("width", makeEm(this.width));
		      return node;
		    }
		  }
		  /**
		   * Converts the math node into an HTML markup string.
		   */
		  ;

		  _proto3.toMarkup = function toMarkup() {
		    if (this.character) {
		      return "<mtext>" + this.character + "</mtext>";
		    } else {
		      return "<mspace width=\"" + makeEm(this.width) + "\"/>";
		    }
		  }
		  /**
		   * Converts the math node into a string, similar to innerText.
		   */
		  ;

		  _proto3.toText = function toText() {
		    if (this.character) {
		      return this.character;
		    } else {
		      return " ";
		    }
		  };

		  return SpaceNode;
		}();

		/* harmony default export */ var mathMLTree = ({
		  MathNode: MathNode,
		  TextNode: TextNode,
		  SpaceNode: SpaceNode,
		  newDocumentFragment: newDocumentFragment
		});
		/**
		 * This file converts a parse tree into a corresponding MathML tree. The main
		 * entry point is the `buildMathML` function, which takes a parse tree from the
		 * parser.
		 */









		/**
		 * Takes a symbol and converts it into a MathML text node after performing
		 * optional replacement from symbols.js.
		 */
		var makeText = function makeText(text, mode, options) {
		  if (src_symbols[mode][text] && src_symbols[mode][text].replace && text.charCodeAt(0) !== 0xD835 && !(ligatures.hasOwnProperty(text) && options && (options.fontFamily && options.fontFamily.slice(4, 6) === "tt" || options.font && options.font.slice(4, 6) === "tt"))) {
		    text = src_symbols[mode][text].replace;
		  }

		  return new mathMLTree.TextNode(text);
		};
		/**
		 * Wrap the given array of nodes in an <mrow> node if needed, i.e.,
		 * unless the array has length 1.  Always returns a single node.
		 */

		var makeRow = function makeRow(body) {
		  if (body.length === 1) {
		    return body[0];
		  } else {
		    return new mathMLTree.MathNode("mrow", body);
		  }
		};
		/**
		 * Returns the math variant as a string or null if none is required.
		 */

		var getVariant = function getVariant(group, options) {
		  // Handle \text... font specifiers as best we can.
		  // MathML has a limited list of allowable mathvariant specifiers; see
		  // https://www.w3.org/TR/MathML3/chapter3.html#presm.commatt
		  if (options.fontFamily === "texttt") {
		    return "monospace";
		  } else if (options.fontFamily === "textsf") {
		    if (options.fontShape === "textit" && options.fontWeight === "textbf") {
		      return "sans-serif-bold-italic";
		    } else if (options.fontShape === "textit") {
		      return "sans-serif-italic";
		    } else if (options.fontWeight === "textbf") {
		      return "bold-sans-serif";
		    } else {
		      return "sans-serif";
		    }
		  } else if (options.fontShape === "textit" && options.fontWeight === "textbf") {
		    return "bold-italic";
		  } else if (options.fontShape === "textit") {
		    return "italic";
		  } else if (options.fontWeight === "textbf") {
		    return "bold";
		  }

		  var font = options.font;

		  if (!font || font === "mathnormal") {
		    return null;
		  }

		  var mode = group.mode;

		  if (font === "mathit") {
		    return "italic";
		  } else if (font === "boldsymbol") {
		    return group.type === "textord" ? "bold" : "bold-italic";
		  } else if (font === "mathbf") {
		    return "bold";
		  } else if (font === "mathbb") {
		    return "double-struck";
		  } else if (font === "mathfrak") {
		    return "fraktur";
		  } else if (font === "mathscr" || font === "mathcal") {
		    // MathML makes no distinction between script and calligraphic
		    return "script";
		  } else if (font === "mathsf") {
		    return "sans-serif";
		  } else if (font === "mathtt") {
		    return "monospace";
		  }

		  var text = group.text;

		  if (utils.contains(["\\imath", "\\jmath"], text)) {
		    return null;
		  }

		  if (src_symbols[mode][text] && src_symbols[mode][text].replace) {
		    text = src_symbols[mode][text].replace;
		  }

		  var fontName = buildCommon.fontMap[font].fontName;

		  if (getCharacterMetrics(text, fontName, mode)) {
		    return buildCommon.fontMap[font].variant;
		  }

		  return null;
		};
		/**
		 * Takes a list of nodes, builds them, and returns a list of the generated
		 * MathML nodes.  Also combine consecutive <mtext> outputs into a single
		 * <mtext> tag.
		 */

		var buildMathML_buildExpression = function buildExpression(expression, options, isOrdgroup) {
		  if (expression.length === 1) {
		    var group = buildMathML_buildGroup(expression[0], options);

		    if (isOrdgroup && group instanceof MathNode && group.type === "mo") {
		      // When TeX writers want to suppress spacing on an operator,
		      // they often put the operator by itself inside braces.
		      group.setAttribute("lspace", "0em");
		      group.setAttribute("rspace", "0em");
		    }

		    return [group];
		  }

		  var groups = [];
		  var lastGroup;

		  for (var i = 0; i < expression.length; i++) {
		    var _group = buildMathML_buildGroup(expression[i], options);

		    if (_group instanceof MathNode && lastGroup instanceof MathNode) {
		      // Concatenate adjacent <mtext>s
		      if (_group.type === 'mtext' && lastGroup.type === 'mtext' && _group.getAttribute('mathvariant') === lastGroup.getAttribute('mathvariant')) {
		        var _lastGroup$children;

		        (_lastGroup$children = lastGroup.children).push.apply(_lastGroup$children, _group.children);

		        continue; // Concatenate adjacent <mn>s
		      } else if (_group.type === 'mn' && lastGroup.type === 'mn') {
		        var _lastGroup$children2;

		        (_lastGroup$children2 = lastGroup.children).push.apply(_lastGroup$children2, _group.children);

		        continue; // Concatenate <mn>...</mn> followed by <mi>.</mi>
		      } else if (_group.type === 'mi' && _group.children.length === 1 && lastGroup.type === 'mn') {
		        var child = _group.children[0];

		        if (child instanceof TextNode && child.text === '.') {
		          var _lastGroup$children3;

		          (_lastGroup$children3 = lastGroup.children).push.apply(_lastGroup$children3, _group.children);

		          continue;
		        }
		      } else if (lastGroup.type === 'mi' && lastGroup.children.length === 1) {
		        var lastChild = lastGroup.children[0];

		        if (lastChild instanceof TextNode && lastChild.text === "\u0338" && (_group.type === 'mo' || _group.type === 'mi' || _group.type === 'mn')) {
		          var _child = _group.children[0];

		          if (_child instanceof TextNode && _child.text.length > 0) {
		            // Overlay with combining character long solidus
		            _child.text = _child.text.slice(0, 1) + "\u0338" + _child.text.slice(1);
		            groups.pop();
		          }
		        }
		      }
		    }

		    groups.push(_group);
		    lastGroup = _group;
		  }

		  return groups;
		};
		/**
		 * Equivalent to buildExpression, but wraps the elements in an <mrow>
		 * if there's more than one.  Returns a single node instead of an array.
		 */

		var buildExpressionRow = function buildExpressionRow(expression, options, isOrdgroup) {
		  return makeRow(buildMathML_buildExpression(expression, options, isOrdgroup));
		};
		/**
		 * Takes a group from the parser and calls the appropriate groupBuilders function
		 * on it to produce a MathML node.
		 */

		var buildMathML_buildGroup = function buildGroup(group, options) {
		  if (!group) {
		    return new mathMLTree.MathNode("mrow");
		  }

		  if (_mathmlGroupBuilders[group.type]) {
		    // Call the groupBuilders function
		    // $FlowFixMe
		    var result = _mathmlGroupBuilders[group.type](group, options); // $FlowFixMe

		    return result;
		  } else {
		    throw new src_ParseError("Got group of unknown type: '" + group.type + "'");
		  }
		};
		/**
		 * Takes a full parse tree and settings and builds a MathML representation of
		 * it. In particular, we put the elements from building the parse tree into a
		 * <semantics> tag so we can also include that TeX source as an annotation.
		 *
		 * Note that we actually return a domTree element with a `<math>` inside it so
		 * we can do appropriate styling.
		 */

		function buildMathML(tree, texExpression, options, isDisplayMode, forMathmlOnly) {
		  var expression = buildMathML_buildExpression(tree, options); // TODO: Make a pass thru the MathML similar to buildHTML.traverseNonSpaceNodes
		  // and add spacing nodes. This is necessary only adjacent to math operators
		  // like \sin or \lim or to subsup elements that contain math operators.
		  // MathML takes care of the other spacing issues.
		  // Wrap up the expression in an mrow so it is presented in the semantics
		  // tag correctly, unless it's a single <mrow> or <mtable>.

		  var wrapper;

		  if (expression.length === 1 && expression[0] instanceof MathNode && utils.contains(["mrow", "mtable"], expression[0].type)) {
		    wrapper = expression[0];
		  } else {
		    wrapper = new mathMLTree.MathNode("mrow", expression);
		  } // Build a TeX annotation of the source


		  var annotation = new mathMLTree.MathNode("annotation", [new mathMLTree.TextNode(texExpression)]);
		  annotation.setAttribute("encoding", "application/x-tex");
		  var semantics = new mathMLTree.MathNode("semantics", [wrapper, annotation]);
		  var math = new mathMLTree.MathNode("math", [semantics]);
		  math.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");

		  if (isDisplayMode) {
		    math.setAttribute("display", "block");
		  } // You can't style <math> nodes, so we wrap the node in a span.
		  // NOTE: The span class is not typed to have <math> nodes as children, and
		  // we don't want to make the children type more generic since the children
		  // of span are expected to have more fields in `buildHtml` contexts.


		  var wrapperClass = forMathmlOnly ? "katex" : "katex-mathml"; // $FlowFixMe

		  return buildCommon.makeSpan([wrapperClass], [math]);
		}







		var optionsFromSettings = function optionsFromSettings(settings) {
		  return new src_Options({
		    style: settings.displayMode ? src_Style.DISPLAY : src_Style.TEXT,
		    maxSize: settings.maxSize,
		    minRuleThickness: settings.minRuleThickness
		  });
		};

		var displayWrap = function displayWrap(node, settings) {
		  if (settings.displayMode) {
		    var classes = ["katex-display"];

		    if (settings.leqno) {
		      classes.push("leqno");
		    }

		    if (settings.fleqn) {
		      classes.push("fleqn");
		    }

		    node = buildCommon.makeSpan(classes, [node]);
		  }

		  return node;
		};

		var buildTree = function buildTree(tree, expression, settings) {
		  var options = optionsFromSettings(settings);
		  var katexNode;

		  if (settings.output === "mathml") {
		    return buildMathML(tree, expression, options, settings.displayMode, true);
		  } else if (settings.output === "html") {
		    var htmlNode = buildHTML(tree, options);
		    katexNode = buildCommon.makeSpan(["katex"], [htmlNode]);
		  } else {
		    var mathMLNode = buildMathML(tree, expression, options, settings.displayMode, false);

		    var _htmlNode = buildHTML(tree, options);

		    katexNode = buildCommon.makeSpan(["katex"], [mathMLNode, _htmlNode]);
		  }

		  return displayWrap(katexNode, settings);
		};
		var buildHTMLTree = function buildHTMLTree(tree, expression, settings) {
		  var options = optionsFromSettings(settings);
		  var htmlNode = buildHTML(tree, options);
		  var katexNode = buildCommon.makeSpan(["katex"], [htmlNode]);
		  return displayWrap(katexNode, settings);
		};
		/**
		 * This file provides support to buildMathML.js and buildHTML.js
		 * for stretchy wide elements rendered from SVG files
		 * and other CSS trickery.
		 */





		var stretchyCodePoint = {
		  widehat: "^",
		  widecheck: "ˇ",
		  widetilde: "~",
		  utilde: "~",
		  overleftarrow: "\u2190",
		  underleftarrow: "\u2190",
		  xleftarrow: "\u2190",
		  overrightarrow: "\u2192",
		  underrightarrow: "\u2192",
		  xrightarrow: "\u2192",
		  underbrace: "\u23DF",
		  overbrace: "\u23DE",
		  overgroup: "\u23E0",
		  undergroup: "\u23E1",
		  overleftrightarrow: "\u2194",
		  underleftrightarrow: "\u2194",
		  xleftrightarrow: "\u2194",
		  Overrightarrow: "\u21D2",
		  xRightarrow: "\u21D2",
		  overleftharpoon: "\u21BC",
		  xleftharpoonup: "\u21BC",
		  overrightharpoon: "\u21C0",
		  xrightharpoonup: "\u21C0",
		  xLeftarrow: "\u21D0",
		  xLeftrightarrow: "\u21D4",
		  xhookleftarrow: "\u21A9",
		  xhookrightarrow: "\u21AA",
		  xmapsto: "\u21A6",
		  xrightharpoondown: "\u21C1",
		  xleftharpoondown: "\u21BD",
		  xrightleftharpoons: "\u21CC",
		  xleftrightharpoons: "\u21CB",
		  xtwoheadleftarrow: "\u219E",
		  xtwoheadrightarrow: "\u21A0",
		  xlongequal: "=",
		  xtofrom: "\u21C4",
		  xrightleftarrows: "\u21C4",
		  xrightequilibrium: "\u21CC",
		  // Not a perfect match.
		  xleftequilibrium: "\u21CB",
		  // None better available.
		  "\\cdrightarrow": "\u2192",
		  "\\cdleftarrow": "\u2190",
		  "\\cdlongequal": "="
		};

		var mathMLnode = function mathMLnode(label) {
		  var node = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode(stretchyCodePoint[label.replace(/^\\/, '')])]);
		  node.setAttribute("stretchy", "true");
		  return node;
		}; // Many of the KaTeX SVG images have been adapted from glyphs in KaTeX fonts.
		// Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
		// Copyright (c) 2014-2017 Khan Academy (<www.khanacademy.org>)
		// Licensed under the SIL Open Font License, Version 1.1.
		// See \nhttp://scripts.sil.org/OFL
		// Very Long SVGs
		//    Many of the KaTeX stretchy wide elements use a long SVG image and an
		//    overflow: hidden tactic to achieve a stretchy image while avoiding
		//    distortion of arrowheads or brace corners.
		//    The SVG typically contains a very long (400 em) arrow.
		//    The SVG is in a container span that has overflow: hidden, so the span
		//    acts like a window that exposes only part of the  SVG.
		//    The SVG always has a longer, thinner aspect ratio than the container span.
		//    After the SVG fills 100% of the height of the container span,
		//    there is a long arrow shaft left over. That left-over shaft is not shown.
		//    Instead, it is sliced off because the span's CSS has overflow: hidden.
		//    Thus, the reader sees an arrow that matches the subject matter width
		//    without distortion.
		//    Some functions, such as \cancel, need to vary their aspect ratio. These
		//    functions do not get the overflow SVG treatment.
		// Second Brush Stroke
		//    Low resolution monitors struggle to display images in fine detail.
		//    So browsers apply anti-aliasing. A long straight arrow shaft therefore
		//    will sometimes appear as if it has a blurred edge.
		//    To mitigate this, these SVG files contain a second "brush-stroke" on the
		//    arrow shafts. That is, a second long thin rectangular SVG path has been
		//    written directly on top of each arrow shaft. This reinforcement causes
		//    some of the screen pixels to display as black instead of the anti-aliased
		//    gray pixel that a  single path would generate. So we get arrow shafts
		//    whose edges appear to be sharper.
		// In the katexImagesData object just below, the dimensions all
		// correspond to path geometry inside the relevant SVG.
		// For example, \overrightarrow uses the same arrowhead as glyph U+2192
		// from the KaTeX Main font. The scaling factor is 1000.
		// That is, inside the font, that arrowhead is 522 units tall, which
		// corresponds to 0.522 em inside the document.


		var katexImagesData = {
		  //   path(s), minWidth, height, align
		  overrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
		  overleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
		  underrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
		  underleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
		  xrightarrow: [["rightarrow"], 1.469, 522, "xMaxYMin"],
		  "\\cdrightarrow": [["rightarrow"], 3.0, 522, "xMaxYMin"],
		  // CD minwwidth2.5pc
		  xleftarrow: [["leftarrow"], 1.469, 522, "xMinYMin"],
		  "\\cdleftarrow": [["leftarrow"], 3.0, 522, "xMinYMin"],
		  Overrightarrow: [["doublerightarrow"], 0.888, 560, "xMaxYMin"],
		  xRightarrow: [["doublerightarrow"], 1.526, 560, "xMaxYMin"],
		  xLeftarrow: [["doubleleftarrow"], 1.526, 560, "xMinYMin"],
		  overleftharpoon: [["leftharpoon"], 0.888, 522, "xMinYMin"],
		  xleftharpoonup: [["leftharpoon"], 0.888, 522, "xMinYMin"],
		  xleftharpoondown: [["leftharpoondown"], 0.888, 522, "xMinYMin"],
		  overrightharpoon: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
		  xrightharpoonup: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
		  xrightharpoondown: [["rightharpoondown"], 0.888, 522, "xMaxYMin"],
		  xlongequal: [["longequal"], 0.888, 334, "xMinYMin"],
		  "\\cdlongequal": [["longequal"], 3.0, 334, "xMinYMin"],
		  xtwoheadleftarrow: [["twoheadleftarrow"], 0.888, 334, "xMinYMin"],
		  xtwoheadrightarrow: [["twoheadrightarrow"], 0.888, 334, "xMaxYMin"],
		  overleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
		  overbrace: [["leftbrace", "midbrace", "rightbrace"], 1.6, 548],
		  underbrace: [["leftbraceunder", "midbraceunder", "rightbraceunder"], 1.6, 548],
		  underleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
		  xleftrightarrow: [["leftarrow", "rightarrow"], 1.75, 522],
		  xLeftrightarrow: [["doubleleftarrow", "doublerightarrow"], 1.75, 560],
		  xrightleftharpoons: [["leftharpoondownplus", "rightharpoonplus"], 1.75, 716],
		  xleftrightharpoons: [["leftharpoonplus", "rightharpoondownplus"], 1.75, 716],
		  xhookleftarrow: [["leftarrow", "righthook"], 1.08, 522],
		  xhookrightarrow: [["lefthook", "rightarrow"], 1.08, 522],
		  overlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
		  underlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
		  overgroup: [["leftgroup", "rightgroup"], 0.888, 342],
		  undergroup: [["leftgroupunder", "rightgroupunder"], 0.888, 342],
		  xmapsto: [["leftmapsto", "rightarrow"], 1.5, 522],
		  xtofrom: [["leftToFrom", "rightToFrom"], 1.75, 528],
		  // The next three arrows are from the mhchem package.
		  // In mhchem.sty, min-length is 2.0em. But these arrows might appear in the
		  // document as \xrightarrow or \xrightleftharpoons. Those have
		  // min-length = 1.75em, so we set min-length on these next three to match.
		  xrightleftarrows: [["baraboveleftarrow", "rightarrowabovebar"], 1.75, 901],
		  xrightequilibrium: [["baraboveshortleftharpoon", "rightharpoonaboveshortbar"], 1.75, 716],
		  xleftequilibrium: [["shortbaraboveleftharpoon", "shortrightharpoonabovebar"], 1.75, 716]
		};

		var groupLength = function groupLength(arg) {
		  if (arg.type === "ordgroup") {
		    return arg.body.length;
		  } else {
		    return 1;
		  }
		};

		var svgSpan = function svgSpan(group, options) {
		  // Create a span with inline SVG for the element.
		  function buildSvgSpan_() {
		    var viewBoxWidth = 400000; // default

		    var label = group.label.slice(1);

		    if (utils.contains(["widehat", "widecheck", "widetilde", "utilde"], label)) {
		      // Each type in the `if` statement corresponds to one of the ParseNode
		      // types below. This narrowing is required to access `grp.base`.
		      // $FlowFixMe
		      var grp = group; // There are four SVG images available for each function.
		      // Choose a taller image when there are more characters.

		      var numChars = groupLength(grp.base);
		      var viewBoxHeight;
		      var pathName;

		      var _height;

		      if (numChars > 5) {
		        if (label === "widehat" || label === "widecheck") {
		          viewBoxHeight = 420;
		          viewBoxWidth = 2364;
		          _height = 0.42;
		          pathName = label + "4";
		        } else {
		          viewBoxHeight = 312;
		          viewBoxWidth = 2340;
		          _height = 0.34;
		          pathName = "tilde4";
		        }
		      } else {
		        var imgIndex = [1, 1, 2, 2, 3, 3][numChars];

		        if (label === "widehat" || label === "widecheck") {
		          viewBoxWidth = [0, 1062, 2364, 2364, 2364][imgIndex];
		          viewBoxHeight = [0, 239, 300, 360, 420][imgIndex];
		          _height = [0, 0.24, 0.3, 0.3, 0.36, 0.42][imgIndex];
		          pathName = label + imgIndex;
		        } else {
		          viewBoxWidth = [0, 600, 1033, 2339, 2340][imgIndex];
		          viewBoxHeight = [0, 260, 286, 306, 312][imgIndex];
		          _height = [0, 0.26, 0.286, 0.3, 0.306, 0.34][imgIndex];
		          pathName = "tilde" + imgIndex;
		        }
		      }

		      var path = new PathNode(pathName);
		      var svgNode = new SvgNode([path], {
		        "width": "100%",
		        "height": makeEm(_height),
		        "viewBox": "0 0 " + viewBoxWidth + " " + viewBoxHeight,
		        "preserveAspectRatio": "none"
		      });
		      return {
		        span: buildCommon.makeSvgSpan([], [svgNode], options),
		        minWidth: 0,
		        height: _height
		      };
		    } else {
		      var spans = [];
		      var data = katexImagesData[label];
		      var paths = data[0],
		          _minWidth = data[1],
		          _viewBoxHeight = data[2];

		      var _height2 = _viewBoxHeight / 1000;

		      var numSvgChildren = paths.length;
		      var widthClasses;
		      var aligns;

		      if (numSvgChildren === 1) {
		        // $FlowFixMe: All these cases must be of the 4-tuple type.
		        var align1 = data[3];
		        widthClasses = ["hide-tail"];
		        aligns = [align1];
		      } else if (numSvgChildren === 2) {
		        widthClasses = ["halfarrow-left", "halfarrow-right"];
		        aligns = ["xMinYMin", "xMaxYMin"];
		      } else if (numSvgChildren === 3) {
		        widthClasses = ["brace-left", "brace-center", "brace-right"];
		        aligns = ["xMinYMin", "xMidYMin", "xMaxYMin"];
		      } else {
		        throw new Error("Correct katexImagesData or update code here to support\n                    " + numSvgChildren + " children.");
		      }

		      for (var i = 0; i < numSvgChildren; i++) {
		        var _path = new PathNode(paths[i]);

		        var _svgNode = new SvgNode([_path], {
		          "width": "400em",
		          "height": makeEm(_height2),
		          "viewBox": "0 0 " + viewBoxWidth + " " + _viewBoxHeight,
		          "preserveAspectRatio": aligns[i] + " slice"
		        });

		        var _span = buildCommon.makeSvgSpan([widthClasses[i]], [_svgNode], options);

		        if (numSvgChildren === 1) {
		          return {
		            span: _span,
		            minWidth: _minWidth,
		            height: _height2
		          };
		        } else {
		          _span.style.height = makeEm(_height2);
		          spans.push(_span);
		        }
		      }

		      return {
		        span: buildCommon.makeSpan(["stretchy"], spans, options),
		        minWidth: _minWidth,
		        height: _height2
		      };
		    }
		  } // buildSvgSpan_()


		  var _buildSvgSpan_ = buildSvgSpan_(),
		      span = _buildSvgSpan_.span,
		      minWidth = _buildSvgSpan_.minWidth,
		      height = _buildSvgSpan_.height; // Note that we are returning span.depth = 0.
		  // Any adjustments relative to the baseline must be done in buildHTML.


		  span.height = height;
		  span.style.height = makeEm(height);

		  if (minWidth > 0) {
		    span.style.minWidth = makeEm(minWidth);
		  }

		  return span;
		};

		var encloseSpan = function encloseSpan(inner, label, topPad, bottomPad, options) {
		  // Return an image span for \cancel, \bcancel, \xcancel, \fbox, or \angl
		  var img;
		  var totalHeight = inner.height + inner.depth + topPad + bottomPad;

		  if (/fbox|color|angl/.test(label)) {
		    img = buildCommon.makeSpan(["stretchy", label], [], options);

		    if (label === "fbox") {
		      var color = options.color && options.getColor();

		      if (color) {
		        img.style.borderColor = color;
		      }
		    }
		  } else {
		    // \cancel, \bcancel, or \xcancel
		    // Since \cancel's SVG is inline and it omits the viewBox attribute,
		    // its stroke-width will not vary with span area.
		    var lines = [];

		    if (/^[bx]cancel$/.test(label)) {
		      lines.push(new LineNode({
		        "x1": "0",
		        "y1": "0",
		        "x2": "100%",
		        "y2": "100%",
		        "stroke-width": "0.046em"
		      }));
		    }

		    if (/^x?cancel$/.test(label)) {
		      lines.push(new LineNode({
		        "x1": "0",
		        "y1": "100%",
		        "x2": "100%",
		        "y2": "0",
		        "stroke-width": "0.046em"
		      }));
		    }

		    var svgNode = new SvgNode(lines, {
		      "width": "100%",
		      "height": makeEm(totalHeight)
		    });
		    img = buildCommon.makeSvgSpan([], [svgNode], options);
		  }

		  img.height = totalHeight;
		  img.style.height = makeEm(totalHeight);
		  return img;
		};

		/* harmony default export */ var stretchy = ({
		  encloseSpan: encloseSpan,
		  mathMLnode: mathMLnode,
		  svgSpan: svgSpan
		});


		/**
		 * Asserts that the node is of the given type and returns it with stricter
		 * typing. Throws if the node's type does not match.
		 */
		function assertNodeType(node, type) {
		  if (!node || node.type !== type) {
		    throw new Error("Expected node of type " + type + ", but got " + (node ? "node of type " + node.type : String(node)));
		  } // $FlowFixMe, >=0.125


		  return node;
		}
		/**
		 * Returns the node more strictly typed iff it is of the given type. Otherwise,
		 * returns null.
		 */

		function assertSymbolNodeType(node) {
		  var typedNode = checkSymbolNodeType(node);

		  if (!typedNode) {
		    throw new Error("Expected node of symbol group type, but got " + (node ? "node of type " + node.type : String(node)));
		  }

		  return typedNode;
		}
		/**
		 * Returns the node more strictly typed iff it is of the given type. Otherwise,
		 * returns null.
		 */

		function checkSymbolNodeType(node) {
		  if (node && (node.type === "atom" || NON_ATOMS.hasOwnProperty(node.type))) {
		    // $FlowFixMe
		    return node;
		  }

		  return null;
		}










		// NOTE: Unlike most `htmlBuilder`s, this one handles not only "accent", but
		// also "supsub" since an accent can affect super/subscripting.
		var htmlBuilder = function htmlBuilder(grp, options) {
		  // Accents are handled in the TeXbook pg. 443, rule 12.
		  var base;
		  var group;
		  var supSubGroup;

		  if (grp && grp.type === "supsub") {
		    // If our base is a character box, and we have superscripts and
		    // subscripts, the supsub will defer to us. In particular, we want
		    // to attach the superscripts and subscripts to the inner body (so
		    // that the position of the superscripts and subscripts won't be
		    // affected by the height of the accent). We accomplish this by
		    // sticking the base of the accent into the base of the supsub, and
		    // rendering that, while keeping track of where the accent is.
		    // The real accent group is the base of the supsub group
		    group = assertNodeType(grp.base, "accent"); // The character box is the base of the accent group

		    base = group.base; // Stick the character box into the base of the supsub group

		    grp.base = base; // Rerender the supsub group with its new base, and store that
		    // result.

		    supSubGroup = assertSpan(buildGroup(grp, options)); // reset original base

		    grp.base = group;
		  } else {
		    group = assertNodeType(grp, "accent");
		    base = group.base;
		  } // Build the base group


		  var body = buildGroup(base, options.havingCrampedStyle()); // Does the accent need to shift for the skew of a character?

		  var mustShift = group.isShifty && utils.isCharacterBox(base); // Calculate the skew of the accent. This is based on the line "If the
		  // nucleus is not a single character, let s = 0; otherwise set s to the
		  // kern amount for the nucleus followed by the \skewchar of its font."
		  // Note that our skew metrics are just the kern between each character
		  // and the skewchar.

		  var skew = 0;

		  if (mustShift) {
		    // If the base is a character box, then we want the skew of the
		    // innermost character. To do that, we find the innermost character:
		    var baseChar = utils.getBaseElem(base); // Then, we render its group to get the symbol inside it

		    var baseGroup = buildGroup(baseChar, options.havingCrampedStyle()); // Finally, we pull the skew off of the symbol.

		    skew = assertSymbolDomNode(baseGroup).skew; // Note that we now throw away baseGroup, because the layers we
		    // removed with getBaseElem might contain things like \color which
		    // we can't get rid of.
		    // TODO(emily): Find a better way to get the skew
		  }

		  var accentBelow = group.label === "\\c"; // calculate the amount of space between the body and the accent

		  var clearance = accentBelow ? body.height + body.depth : Math.min(body.height, options.fontMetrics().xHeight); // Build the accent

		  var accentBody;

		  if (!group.isStretchy) {
		    var accent;
		    var width;

		    if (group.label === "\\vec") {
		      // Before version 0.9, \vec used the combining font glyph U+20D7.
		      // But browsers, especially Safari, are not consistent in how they
		      // render combining characters when not preceded by a character.
		      // So now we use an SVG.
		      // If Safari reforms, we should consider reverting to the glyph.
		      accent = buildCommon.staticSvg("vec", options);
		      width = buildCommon.svgData.vec[1];
		    } else {
		      accent = buildCommon.makeOrd({
		        mode: group.mode,
		        text: group.label
		      }, options, "textord");
		      accent = assertSymbolDomNode(accent); // Remove the italic correction of the accent, because it only serves to
		      // shift the accent over to a place we don't want.

		      accent.italic = 0;
		      width = accent.width;

		      if (accentBelow) {
		        clearance += accent.depth;
		      }
		    }

		    accentBody = buildCommon.makeSpan(["accent-body"], [accent]); // "Full" accents expand the width of the resulting symbol to be
		    // at least the width of the accent, and overlap directly onto the
		    // character without any vertical offset.

		    var accentFull = group.label === "\\textcircled";

		    if (accentFull) {
		      accentBody.classes.push('accent-full');
		      clearance = body.height;
		    } // Shift the accent over by the skew.


		    var left = skew; // CSS defines `.katex .accent .accent-body:not(.accent-full) { width: 0 }`
		    // so that the accent doesn't contribute to the bounding box.
		    // We need to shift the character by its width (effectively half
		    // its width) to compensate.

		    if (!accentFull) {
		      left -= width / 2;
		    }

		    accentBody.style.left = makeEm(left); // \textcircled uses the \bigcirc glyph, so it needs some
		    // vertical adjustment to match LaTeX.

		    if (group.label === "\\textcircled") {
		      accentBody.style.top = ".2em";
		    }

		    accentBody = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: body
		      }, {
		        type: "kern",
		        size: -clearance
		      }, {
		        type: "elem",
		        elem: accentBody
		      }]
		    }, options);
		  } else {
		    accentBody = stretchy.svgSpan(group, options);
		    accentBody = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: body
		      }, {
		        type: "elem",
		        elem: accentBody,
		        wrapperClasses: ["svg-align"],
		        wrapperStyle: skew > 0 ? {
		          width: "calc(100% - " + makeEm(2 * skew) + ")",
		          marginLeft: makeEm(2 * skew)
		        } : undefined
		      }]
		    }, options);
		  }

		  var accentWrap = buildCommon.makeSpan(["mord", "accent"], [accentBody], options);

		  if (supSubGroup) {
		    // Here, we replace the "base" child of the supsub with our newly
		    // generated accent.
		    supSubGroup.children[0] = accentWrap; // Since we don't rerun the height calculation after replacing the
		    // accent, we manually recalculate height.

		    supSubGroup.height = Math.max(accentWrap.height, supSubGroup.height); // Accents should always be ords, even when their innards are not.

		    supSubGroup.classes[0] = "mord";
		    return supSubGroup;
		  } else {
		    return accentWrap;
		  }
		};

		var mathmlBuilder = function mathmlBuilder(group, options) {
		  var accentNode = group.isStretchy ? stretchy.mathMLnode(group.label) : new mathMLTree.MathNode("mo", [makeText(group.label, group.mode)]);
		  var node = new mathMLTree.MathNode("mover", [buildMathML_buildGroup(group.base, options), accentNode]);
		  node.setAttribute("accent", "true");
		  return node;
		};

		var NON_STRETCHY_ACCENT_REGEX = new RegExp(["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring"].map(function (accent) {
		  return "\\" + accent;
		}).join("|")); // Accents

		defineFunction({
		  type: "accent",
		  names: ["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring", "\\widecheck", "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow", "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup", "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(context, args) {
		    var base = normalizeArgument(args[0]);
		    var isStretchy = !NON_STRETCHY_ACCENT_REGEX.test(context.funcName);
		    var isShifty = !isStretchy || context.funcName === "\\widehat" || context.funcName === "\\widetilde" || context.funcName === "\\widecheck";
		    return {
		      type: "accent",
		      mode: context.parser.mode,
		      label: context.funcName,
		      isStretchy: isStretchy,
		      isShifty: isShifty,
		      base: base
		    };
		  },
		  htmlBuilder: htmlBuilder,
		  mathmlBuilder: mathmlBuilder
		}); // Text-mode accents

		defineFunction({
		  type: "accent",
		  names: ["\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"', "\\c", "\\r", "\\H", "\\v", "\\textcircled"],
		  props: {
		    numArgs: 1,
		    allowedInText: true,
		    allowedInMath: true,
		    // unless in strict mode
		    argTypes: ["primitive"]
		  },
		  handler: function handler(context, args) {
		    var base = args[0];
		    var mode = context.parser.mode;

		    if (mode === "math") {
		      context.parser.settings.reportNonstrict("mathVsTextAccents", "LaTeX's accent " + context.funcName + " works only in text mode");
		      mode = "text";
		    }

		    return {
		      type: "accent",
		      mode: mode,
		      label: context.funcName,
		      isStretchy: false,
		      isShifty: true,
		      base: base
		    };
		  },
		  htmlBuilder: htmlBuilder,
		  mathmlBuilder: mathmlBuilder
		});
		// Horizontal overlap functions






		defineFunction({
		  type: "accentUnder",
		  names: ["\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow", "\\undergroup", "\\underlinesegment", "\\utilde"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var base = args[0];
		    return {
		      type: "accentUnder",
		      mode: parser.mode,
		      label: funcName,
		      base: base
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Treat under accents much like underlines.
		    var innerGroup = buildGroup(group.base, options);
		    var accentBody = stretchy.svgSpan(group, options);
		    var kern = group.label === "\\utilde" ? 0.12 : 0; // Generate the vlist, with the appropriate kerns

		    var vlist = buildCommon.makeVList({
		      positionType: "top",
		      positionData: innerGroup.height,
		      children: [{
		        type: "elem",
		        elem: accentBody,
		        wrapperClasses: ["svg-align"]
		      }, {
		        type: "kern",
		        size: kern
		      }, {
		        type: "elem",
		        elem: innerGroup
		      }]
		    }, options);
		    return buildCommon.makeSpan(["mord", "accentunder"], [vlist], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var accentNode = stretchy.mathMLnode(group.label);
		    var node = new mathMLTree.MathNode("munder", [buildMathML_buildGroup(group.base, options), accentNode]);
		    node.setAttribute("accentunder", "true");
		    return node;
		  }
		});







		// Helper function
		var paddedNode = function paddedNode(group) {
		  var node = new mathMLTree.MathNode("mpadded", group ? [group] : []);
		  node.setAttribute("width", "+0.6em");
		  node.setAttribute("lspace", "0.3em");
		  return node;
		}; // Stretchy arrows with an optional argument


		defineFunction({
		  type: "xArrow",
		  names: ["\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow", "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow", "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown", "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup", "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xlongequal", "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom", // The next 3 functions are here to support the mhchem extension.
		  // Direct use of these functions is discouraged and may break someday.
		  "\\xrightleftarrows", "\\xrightequilibrium", "\\xleftequilibrium", // The next 3 functions are here only to support the {CD} environment.
		  "\\\\cdrightarrow", "\\\\cdleftarrow", "\\\\cdlongequal"],
		  props: {
		    numArgs: 1,
		    numOptionalArgs: 1
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    return {
		      type: "xArrow",
		      mode: parser.mode,
		      label: funcName,
		      body: args[0],
		      below: optArgs[0]
		    };
		  },
		  // Flow is unable to correctly infer the type of `group`, even though it's
		  // unambiguously determined from the passed-in `type` above.
		  htmlBuilder: function htmlBuilder(group, options) {
		    var style = options.style; // Build the argument groups in the appropriate style.
		    // Ref: amsmath.dtx:   \hbox{$\scriptstyle\mkern#3mu{#6}\mkern#4mu$}%
		    // Some groups can return document fragments.  Handle those by wrapping
		    // them in a span.

		    var newOptions = options.havingStyle(style.sup());
		    var upperGroup = buildCommon.wrapFragment(buildGroup(group.body, newOptions, options), options);
		    var arrowPrefix = group.label.slice(0, 2) === "\\x" ? "x" : "cd";
		    upperGroup.classes.push(arrowPrefix + "-arrow-pad");
		    var lowerGroup;

		    if (group.below) {
		      // Build the lower group
		      newOptions = options.havingStyle(style.sub());
		      lowerGroup = buildCommon.wrapFragment(buildGroup(group.below, newOptions, options), options);
		      lowerGroup.classes.push(arrowPrefix + "-arrow-pad");
		    }

		    var arrowBody = stretchy.svgSpan(group, options); // Re shift: Note that stretchy.svgSpan returned arrowBody.depth = 0.
		    // The point we want on the math axis is at 0.5 * arrowBody.height.

		    var arrowShift = -options.fontMetrics().axisHeight + 0.5 * arrowBody.height; // 2 mu kern. Ref: amsmath.dtx: #7\if0#2\else\mkern#2mu\fi

		    var upperShift = -options.fontMetrics().axisHeight - 0.5 * arrowBody.height - 0.111; // 0.111 em = 2 mu

		    if (upperGroup.depth > 0.25 || group.label === "\\xleftequilibrium") {
		      upperShift -= upperGroup.depth; // shift up if depth encroaches
		    } // Generate the vlist


		    var vlist;

		    if (lowerGroup) {
		      var lowerShift = -options.fontMetrics().axisHeight + lowerGroup.height + 0.5 * arrowBody.height + 0.111;
		      vlist = buildCommon.makeVList({
		        positionType: "individualShift",
		        children: [{
		          type: "elem",
		          elem: upperGroup,
		          shift: upperShift
		        }, {
		          type: "elem",
		          elem: arrowBody,
		          shift: arrowShift
		        }, {
		          type: "elem",
		          elem: lowerGroup,
		          shift: lowerShift
		        }]
		      }, options);
		    } else {
		      vlist = buildCommon.makeVList({
		        positionType: "individualShift",
		        children: [{
		          type: "elem",
		          elem: upperGroup,
		          shift: upperShift
		        }, {
		          type: "elem",
		          elem: arrowBody,
		          shift: arrowShift
		        }]
		      }, options);
		    } // $FlowFixMe: Replace this with passing "svg-align" into makeVList.


		    vlist.children[0].children[0].children[1].classes.push("svg-align");
		    return buildCommon.makeSpan(["mrel", "x-arrow"], [vlist], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var arrowNode = stretchy.mathMLnode(group.label);
		    arrowNode.setAttribute("minsize", group.label.charAt(0) === "x" ? "1.75em" : "3.0em");
		    var node;

		    if (group.body) {
		      var upperNode = paddedNode(buildMathML_buildGroup(group.body, options));

		      if (group.below) {
		        var lowerNode = paddedNode(buildMathML_buildGroup(group.below, options));
		        node = new mathMLTree.MathNode("munderover", [arrowNode, lowerNode, upperNode]);
		      } else {
		        node = new mathMLTree.MathNode("mover", [arrowNode, upperNode]);
		      }
		    } else if (group.below) {
		      var _lowerNode = paddedNode(buildMathML_buildGroup(group.below, options));

		      node = new mathMLTree.MathNode("munder", [arrowNode, _lowerNode]);
		    } else {
		      // This should never happen.
		      // Parser.js throws an error if there is no argument.
		      node = paddedNode();
		      node = new mathMLTree.MathNode("mover", [arrowNode, node]);
		    }

		    return node;
		  }
		});






		var mclass_makeSpan = buildCommon.makeSpan;

		function mclass_htmlBuilder(group, options) {
		  var elements = buildExpression(group.body, options, true);
		  return mclass_makeSpan([group.mclass], elements, options);
		}

		function mclass_mathmlBuilder(group, options) {
		  var node;
		  var inner = buildMathML_buildExpression(group.body, options);

		  if (group.mclass === "minner") {
		    node = new mathMLTree.MathNode("mpadded", inner);
		  } else if (group.mclass === "mord") {
		    if (group.isCharacterBox) {
		      node = inner[0];
		      node.type = "mi";
		    } else {
		      node = new mathMLTree.MathNode("mi", inner);
		    }
		  } else {
		    if (group.isCharacterBox) {
		      node = inner[0];
		      node.type = "mo";
		    } else {
		      node = new mathMLTree.MathNode("mo", inner);
		    } // Set spacing based on what is the most likely adjacent atom type.
		    // See TeXbook p170.


		    if (group.mclass === "mbin") {
		      node.attributes.lspace = "0.22em"; // medium space

		      node.attributes.rspace = "0.22em";
		    } else if (group.mclass === "mpunct") {
		      node.attributes.lspace = "0em";
		      node.attributes.rspace = "0.17em"; // thinspace
		    } else if (group.mclass === "mopen" || group.mclass === "mclose") {
		      node.attributes.lspace = "0em";
		      node.attributes.rspace = "0em";
		    } else if (group.mclass === "minner") {
		      node.attributes.lspace = "0.0556em"; // 1 mu is the most likely option

		      node.attributes.width = "+0.1111em";
		    } // MathML <mo> default space is 5/18 em, so <mrel> needs no action.
		    // Ref: https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mo

		  }

		  return node;
		} // Math class commands except \mathop


		defineFunction({
		  type: "mclass",
		  names: ["\\mathord", "\\mathbin", "\\mathrel", "\\mathopen", "\\mathclose", "\\mathpunct", "\\mathinner"],
		  props: {
		    numArgs: 1,
		    primitive: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var body = args[0];
		    return {
		      type: "mclass",
		      mode: parser.mode,
		      mclass: "m" + funcName.slice(5),
		      // TODO(kevinb): don't prefix with 'm'
		      body: ordargument(body),
		      isCharacterBox: utils.isCharacterBox(body)
		    };
		  },
		  htmlBuilder: mclass_htmlBuilder,
		  mathmlBuilder: mclass_mathmlBuilder
		});
		var binrelClass = function binrelClass(arg) {
		  // \binrel@ spacing varies with (bin|rel|ord) of the atom in the argument.
		  // (by rendering separately and with {}s before and after, and measuring
		  // the change in spacing).  We'll do roughly the same by detecting the
		  // atom type directly.
		  var atom = arg.type === "ordgroup" && arg.body.length ? arg.body[0] : arg;

		  if (atom.type === "atom" && (atom.family === "bin" || atom.family === "rel")) {
		    return "m" + atom.family;
		  } else {
		    return "mord";
		  }
		}; // \@binrel{x}{y} renders like y but as mbin/mrel/mord if x is mbin/mrel/mord.
		// This is equivalent to \binrel@{x}\binrel@@{y} in AMSTeX.

		defineFunction({
		  type: "mclass",
		  names: ["\\@binrel"],
		  props: {
		    numArgs: 2
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    return {
		      type: "mclass",
		      mode: parser.mode,
		      mclass: binrelClass(args[0]),
		      body: ordargument(args[1]),
		      isCharacterBox: utils.isCharacterBox(args[1])
		    };
		  }
		}); // Build a relation or stacked op by placing one symbol on top of another

		defineFunction({
		  type: "mclass",
		  names: ["\\stackrel", "\\overset", "\\underset"],
		  props: {
		    numArgs: 2
		  },
		  handler: function handler(_ref3, args) {
		    var parser = _ref3.parser,
		        funcName = _ref3.funcName;
		    var baseArg = args[1];
		    var shiftedArg = args[0];
		    var mclass;

		    if (funcName !== "\\stackrel") {
		      // LaTeX applies \binrel spacing to \overset and \underset.
		      mclass = binrelClass(baseArg);
		    } else {
		      mclass = "mrel"; // for \stackrel
		    }

		    var baseOp = {
		      type: "op",
		      mode: baseArg.mode,
		      limits: true,
		      alwaysHandleSupSub: true,
		      parentIsSupSub: false,
		      symbol: false,
		      suppressBaseShift: funcName !== "\\stackrel",
		      body: ordargument(baseArg)
		    };
		    var supsub = {
		      type: "supsub",
		      mode: shiftedArg.mode,
		      base: baseOp,
		      sup: funcName === "\\underset" ? null : shiftedArg,
		      sub: funcName === "\\underset" ? shiftedArg : null
		    };
		    return {
		      type: "mclass",
		      mode: parser.mode,
		      mclass: mclass,
		      body: [supsub],
		      isCharacterBox: utils.isCharacterBox(supsub)
		    };
		  },
		  htmlBuilder: mclass_htmlBuilder,
		  mathmlBuilder: mclass_mathmlBuilder
		});






		// \pmb is a simulation of bold font.
		// The version of \pmb in ambsy.sty works by typesetting three copies
		// with small offsets. We use CSS text-shadow.
		// It's a hack. Not as good as a real bold font. Better than nothing.
		defineFunction({
		  type: "pmb",
		  names: ["\\pmb"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "pmb",
		      mode: parser.mode,
		      mclass: binrelClass(args[0]),
		      body: ordargument(args[0])
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.body, options, true);
		    var node = buildCommon.makeSpan([group.mclass], elements, options);
		    node.style.textShadow = "0.02em 0.01em 0.04px";
		    return node;
		  },
		  mathmlBuilder: function mathmlBuilder(group, style) {
		    var inner = buildMathML_buildExpression(group.body, style); // Wrap with an <mstyle> element.

		    var node = new mathMLTree.MathNode("mstyle", inner);
		    node.setAttribute("style", "text-shadow: 0.02em 0.01em 0.04px");
		    return node;
		  }
		});








		var cdArrowFunctionName = {
		  ">": "\\\\cdrightarrow",
		  "<": "\\\\cdleftarrow",
		  "=": "\\\\cdlongequal",
		  "A": "\\uparrow",
		  "V": "\\downarrow",
		  "|": "\\Vert",
		  ".": "no arrow"
		};

		var newCell = function newCell() {
		  // Create an empty cell, to be filled below with parse nodes.
		  // The parseTree from this module must be constructed like the
		  // one created by parseArray(), so an empty CD cell must
		  // be a ParseNode<"styling">. And CD is always displaystyle.
		  // So these values are fixed and flow can do implicit typing.
		  return {
		    type: "styling",
		    body: [],
		    mode: "math",
		    style: "display"
		  };
		};

		var isStartOfArrow = function isStartOfArrow(node) {
		  return node.type === "textord" && node.text === "@";
		};

		var isLabelEnd = function isLabelEnd(node, endChar) {
		  return (node.type === "mathord" || node.type === "atom") && node.text === endChar;
		};

		function cdArrow(arrowChar, labels, parser) {
		  // Return a parse tree of an arrow and its labels.
		  // This acts in a way similar to a macro expansion.
		  var funcName = cdArrowFunctionName[arrowChar];

		  switch (funcName) {
		    case "\\\\cdrightarrow":
		    case "\\\\cdleftarrow":
		      return parser.callFunction(funcName, [labels[0]], [labels[1]]);

		    case "\\uparrow":
		    case "\\downarrow":
		      {
		        var leftLabel = parser.callFunction("\\\\cdleft", [labels[0]], []);
		        var bareArrow = {
		          type: "atom",
		          text: funcName,
		          mode: "math",
		          family: "rel"
		        };
		        var sizedArrow = parser.callFunction("\\Big", [bareArrow], []);
		        var rightLabel = parser.callFunction("\\\\cdright", [labels[1]], []);
		        var arrowGroup = {
		          type: "ordgroup",
		          mode: "math",
		          body: [leftLabel, sizedArrow, rightLabel]
		        };
		        return parser.callFunction("\\\\cdparent", [arrowGroup], []);
		      }

		    case "\\\\cdlongequal":
		      return parser.callFunction("\\\\cdlongequal", [], []);

		    case "\\Vert":
		      {
		        var arrow = {
		          type: "textord",
		          text: "\\Vert",
		          mode: "math"
		        };
		        return parser.callFunction("\\Big", [arrow], []);
		      }

		    default:
		      return {
		        type: "textord",
		        text: " ",
		        mode: "math"
		      };
		  }
		}

		function parseCD(parser) {
		  // Get the array's parse nodes with \\ temporarily mapped to \cr.
		  var parsedRows = [];
		  parser.gullet.beginGroup();
		  parser.gullet.macros.set("\\cr", "\\\\\\relax");
		  parser.gullet.beginGroup();

		  while (true) {
		    // eslint-disable-line no-constant-condition
		    // Get the parse nodes for the next row.
		    parsedRows.push(parser.parseExpression(false, "\\\\"));
		    parser.gullet.endGroup();
		    parser.gullet.beginGroup();
		    var next = parser.fetch().text;

		    if (next === "&" || next === "\\\\") {
		      parser.consume();
		    } else if (next === "\\end") {
		      if (parsedRows[parsedRows.length - 1].length === 0) {
		        parsedRows.pop(); // final row ended in \\
		      }

		      break;
		    } else {
		      throw new src_ParseError("Expected \\\\ or \\cr or \\end", parser.nextToken);
		    }
		  }

		  var row = [];
		  var body = [row]; // Loop thru the parse nodes. Collect them into cells and arrows.

		  for (var i = 0; i < parsedRows.length; i++) {
		    // Start a new row.
		    var rowNodes = parsedRows[i]; // Create the first cell.

		    var cell = newCell();

		    for (var j = 0; j < rowNodes.length; j++) {
		      if (!isStartOfArrow(rowNodes[j])) {
		        // If a parseNode is not an arrow, it goes into a cell.
		        cell.body.push(rowNodes[j]);
		      } else {
		        // Parse node j is an "@", the start of an arrow.
		        // Before starting on the arrow, push the cell into `row`.
		        row.push(cell); // Now collect parseNodes into an arrow.
		        // The character after "@" defines the arrow type.

		        j += 1;
		        var arrowChar = assertSymbolNodeType(rowNodes[j]).text; // Create two empty label nodes. We may or may not use them.

		        var labels = new Array(2);
		        labels[0] = {
		          type: "ordgroup",
		          mode: "math",
		          body: []
		        };
		        labels[1] = {
		          type: "ordgroup",
		          mode: "math",
		          body: []
		        }; // Process the arrow.

		        if ("=|.".indexOf(arrowChar) > -1) ; else if ("<>AV".indexOf(arrowChar) > -1) {
		          // Four arrows, `@>>>`, `@<<<`, `@AAA`, and `@VVV`, each take
		          // two optional labels. E.g. the right-point arrow syntax is
		          // really:  @>{optional label}>{optional label}>
		          // Collect parseNodes into labels.
		          for (var labelNum = 0; labelNum < 2; labelNum++) {
		            var inLabel = true;

		            for (var k = j + 1; k < rowNodes.length; k++) {
		              if (isLabelEnd(rowNodes[k], arrowChar)) {
		                inLabel = false;
		                j = k;
		                break;
		              }

		              if (isStartOfArrow(rowNodes[k])) {
		                throw new src_ParseError("Missing a " + arrowChar + " character to complete a CD arrow.", rowNodes[k]);
		              }

		              labels[labelNum].body.push(rowNodes[k]);
		            }

		            if (inLabel) {
		              // isLabelEnd never returned a true.
		              throw new src_ParseError("Missing a " + arrowChar + " character to complete a CD arrow.", rowNodes[j]);
		            }
		          }
		        } else {
		          throw new src_ParseError("Expected one of \"<>AV=|.\" after @", rowNodes[j]);
		        } // Now join the arrow to its labels.


		        var arrow = cdArrow(arrowChar, labels, parser); // Wrap the arrow in  ParseNode<"styling">.
		        // This is done to match parseArray() behavior.

		        var wrappedArrow = {
		          type: "styling",
		          body: [arrow],
		          mode: "math",
		          style: "display" // CD is always displaystyle.

		        };
		        row.push(wrappedArrow); // In CD's syntax, cells are implicit. That is, everything that
		        // is not an arrow gets collected into a cell. So create an empty
		        // cell now. It will collect upcoming parseNodes.

		        cell = newCell();
		      }
		    }

		    if (i % 2 === 0) {
		      // Even-numbered rows consist of: cell, arrow, cell, arrow, ... cell
		      // The last cell is not yet pushed into `row`, so:
		      row.push(cell);
		    } else {
		      // Odd-numbered rows consist of: vert arrow, empty cell, ... vert arrow
		      // Remove the empty cell that was placed at the beginning of `row`.
		      row.shift();
		    }

		    row = [];
		    body.push(row);
		  } // End row group


		  parser.gullet.endGroup(); // End array group defining \\

		  parser.gullet.endGroup(); // define column separation.

		  var cols = new Array(body[0].length).fill({
		    type: "align",
		    align: "c",
		    pregap: 0.25,
		    // CD package sets \enskip between columns.
		    postgap: 0.25 // So pre and post each get half an \enskip, i.e. 0.25em.

		  });
		  return {
		    type: "array",
		    mode: "math",
		    body: body,
		    arraystretch: 1,
		    addJot: true,
		    rowGaps: [null],
		    cols: cols,
		    colSeparationType: "CD",
		    hLinesBeforeRow: new Array(body.length + 1).fill([])
		  };
		} // The functions below are not available for general use.
		// They are here only for internal use by the {CD} environment in placing labels
		// next to vertical arrows.
		// We don't need any such functions for horizontal arrows because we can reuse
		// the functionality that already exists for extensible arrows.

		defineFunction({
		  type: "cdlabel",
		  names: ["\\\\cdleft", "\\\\cdright"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    return {
		      type: "cdlabel",
		      mode: parser.mode,
		      side: funcName.slice(4),
		      label: args[0]
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var newOptions = options.havingStyle(options.style.sup());
		    var label = buildCommon.wrapFragment(buildGroup(group.label, newOptions, options), options);
		    label.classes.push("cd-label-" + group.side);
		    label.style.bottom = makeEm(0.8 - label.depth); // Zero out label height & depth, so vertical align of arrow is set
		    // by the arrow height, not by the label.

		    label.height = 0;
		    label.depth = 0;
		    return label;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var label = new mathMLTree.MathNode("mrow", [buildMathML_buildGroup(group.label, options)]);
		    label = new mathMLTree.MathNode("mpadded", [label]);
		    label.setAttribute("width", "0");

		    if (group.side === "left") {
		      label.setAttribute("lspace", "-1width");
		    } // We have to guess at vertical alignment. We know the arrow is 1.8em tall,
		    // But we don't know the height or depth of the label.


		    label.setAttribute("voffset", "0.7em");
		    label = new mathMLTree.MathNode("mstyle", [label]);
		    label.setAttribute("displaystyle", "false");
		    label.setAttribute("scriptlevel", "1");
		    return label;
		  }
		});
		defineFunction({
		  type: "cdlabelparent",
		  names: ["\\\\cdparent"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    return {
		      type: "cdlabelparent",
		      mode: parser.mode,
		      fragment: args[0]
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Wrap the vertical arrow and its labels.
		    // The parent gets position: relative. The child gets position: absolute.
		    // So CSS can locate the label correctly.
		    var parent = buildCommon.wrapFragment(buildGroup(group.fragment, options), options);
		    parent.classes.push("cd-vert-arrow");
		    return parent;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    return new mathMLTree.MathNode("mrow", [buildMathML_buildGroup(group.fragment, options)]);
		  }
		});


		 // \@char is an internal function that takes a grouped decimal argument like
		// {123} and converts into symbol with code 123.  It is used by the *macro*
		// \char defined in macros.js.

		defineFunction({
		  type: "textord",
		  names: ["\\@char"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var arg = assertNodeType(args[0], "ordgroup");
		    var group = arg.body;
		    var number = "";

		    for (var i = 0; i < group.length; i++) {
		      var node = assertNodeType(group[i], "textord");
		      number += node.text;
		    }

		    var code = parseInt(number);
		    var text;

		    if (isNaN(code)) {
		      throw new src_ParseError("\\@char has non-numeric argument " + number); // If we drop IE support, the following code could be replaced with
		      // text = String.fromCodePoint(code)
		    } else if (code < 0 || code >= 0x10ffff) {
		      throw new src_ParseError("\\@char with invalid code point " + number);
		    } else if (code <= 0xffff) {
		      text = String.fromCharCode(code);
		    } else {
		      // Astral code point; split into surrogate halves
		      code -= 0x10000;
		      text = String.fromCharCode((code >> 10) + 0xd800, (code & 0x3ff) + 0xdc00);
		    }

		    return {
		      type: "textord",
		      mode: parser.mode,
		      text: text
		    };
		  }
		});







		var color_htmlBuilder = function htmlBuilder(group, options) {
		  var elements = buildExpression(group.body, options.withColor(group.color), false); // \color isn't supposed to affect the type of the elements it contains.
		  // To accomplish this, we wrap the results in a fragment, so the inner
		  // elements will be able to directly interact with their neighbors. For
		  // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`

		  return buildCommon.makeFragment(elements);
		};

		var color_mathmlBuilder = function mathmlBuilder(group, options) {
		  var inner = buildMathML_buildExpression(group.body, options.withColor(group.color));
		  var node = new mathMLTree.MathNode("mstyle", inner);
		  node.setAttribute("mathcolor", group.color);
		  return node;
		};

		defineFunction({
		  type: "color",
		  names: ["\\textcolor"],
		  props: {
		    numArgs: 2,
		    allowedInText: true,
		    argTypes: ["color", "original"]
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var color = assertNodeType(args[0], "color-token").color;
		    var body = args[1];
		    return {
		      type: "color",
		      mode: parser.mode,
		      color: color,
		      body: ordargument(body)
		    };
		  },
		  htmlBuilder: color_htmlBuilder,
		  mathmlBuilder: color_mathmlBuilder
		});
		defineFunction({
		  type: "color",
		  names: ["\\color"],
		  props: {
		    numArgs: 1,
		    allowedInText: true,
		    argTypes: ["color"]
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser,
		        breakOnTokenText = _ref2.breakOnTokenText;
		    var color = assertNodeType(args[0], "color-token").color; // Set macro \current@color in current namespace to store the current
		    // color, mimicking the behavior of color.sty.
		    // This is currently used just to correctly color a \right
		    // that follows a \color command.

		    parser.gullet.macros.set("\\current@color", color); // Parse out the implicit body that should be colored.

		    var body = parser.parseExpression(true, breakOnTokenText);
		    return {
		      type: "color",
		      mode: parser.mode,
		      color: color,
		      body: body
		    };
		  },
		  htmlBuilder: color_htmlBuilder,
		  mathmlBuilder: color_mathmlBuilder
		});
		// Row breaks within tabular environments, and line breaks at top level




		 // \DeclareRobustCommand\\{...\@xnewline}

		defineFunction({
		  type: "cr",
		  names: ["\\\\"],
		  props: {
		    numArgs: 0,
		    numOptionalArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser;
		    var size = parser.gullet.future().text === "[" ? parser.parseSizeGroup(true) : null;
		    var newLine = !parser.settings.displayMode || !parser.settings.useStrictBehavior("newLineInDisplayMode", "In LaTeX, \\\\ or \\newline " + "does nothing in display mode");
		    return {
		      type: "cr",
		      mode: parser.mode,
		      newLine: newLine,
		      size: size && assertNodeType(size, "size").value
		    };
		  },
		  // The following builders are called only at the top level,
		  // not within tabular/array environments.
		  htmlBuilder: function htmlBuilder(group, options) {
		    var span = buildCommon.makeSpan(["mspace"], [], options);

		    if (group.newLine) {
		      span.classes.push("newline");

		      if (group.size) {
		        span.style.marginTop = makeEm(calculateSize(group.size, options));
		      }
		    }

		    return span;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mspace");

		    if (group.newLine) {
		      node.setAttribute("linebreak", "newline");

		      if (group.size) {
		        node.setAttribute("height", makeEm(calculateSize(group.size, options)));
		      }
		    }

		    return node;
		  }
		});



		var globalMap = {
		  "\\global": "\\global",
		  "\\long": "\\\\globallong",
		  "\\\\globallong": "\\\\globallong",
		  "\\def": "\\gdef",
		  "\\gdef": "\\gdef",
		  "\\edef": "\\xdef",
		  "\\xdef": "\\xdef",
		  "\\let": "\\\\globallet",
		  "\\futurelet": "\\\\globalfuture"
		};

		var checkControlSequence = function checkControlSequence(tok) {
		  var name = tok.text;

		  if (/^(?:[\\{}$&#^_]|EOF)$/.test(name)) {
		    throw new src_ParseError("Expected a control sequence", tok);
		  }

		  return name;
		};

		var getRHS = function getRHS(parser) {
		  var tok = parser.gullet.popToken();

		  if (tok.text === "=") {
		    // consume optional equals
		    tok = parser.gullet.popToken();

		    if (tok.text === " ") {
		      // consume one optional space
		      tok = parser.gullet.popToken();
		    }
		  }

		  return tok;
		};

		var letCommand = function letCommand(parser, name, tok, global) {
		  var macro = parser.gullet.macros.get(tok.text);

		  if (macro == null) {
		    // don't expand it later even if a macro with the same name is defined
		    // e.g., \let\foo=\frac \def\frac{\relax} \frac12
		    tok.noexpand = true;
		    macro = {
		      tokens: [tok],
		      numArgs: 0,
		      // reproduce the same behavior in expansion
		      unexpandable: !parser.gullet.isExpandable(tok.text)
		    };
		  }

		  parser.gullet.macros.set(name, macro, global);
		}; // <assignment> -> <non-macro assignment>|<macro assignment>
		// <non-macro assignment> -> <simple assignment>|\global<non-macro assignment>
		// <macro assignment> -> <definition>|<prefix><macro assignment>
		// <prefix> -> \global|\long|\outer


		defineFunction({
		  type: "internal",
		  names: ["\\global", "\\long", "\\\\globallong" // can’t be entered directly
		  ],
		  props: {
		    numArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(_ref) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    parser.consumeSpaces();
		    var token = parser.fetch();

		    if (globalMap[token.text]) {
		      // KaTeX doesn't have \par, so ignore \long
		      if (funcName === "\\global" || funcName === "\\\\globallong") {
		        token.text = globalMap[token.text];
		      }

		      return assertNodeType(parser.parseFunction(), "internal");
		    }

		    throw new src_ParseError("Invalid token after macro prefix", token);
		  }
		}); // Basic support for macro definitions: \def, \gdef, \edef, \xdef
		// <definition> -> <def><control sequence><definition text>
		// <def> -> \def|\gdef|\edef|\xdef
		// <definition text> -> <parameter text><left brace><balanced text><right brace>

		defineFunction({
		  type: "internal",
		  names: ["\\def", "\\gdef", "\\edef", "\\xdef"],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    primitive: true
		  },
		  handler: function handler(_ref2) {
		    var parser = _ref2.parser,
		        funcName = _ref2.funcName;
		    var tok = parser.gullet.popToken();
		    var name = tok.text;

		    if (/^(?:[\\{}$&#^_]|EOF)$/.test(name)) {
		      throw new src_ParseError("Expected a control sequence", tok);
		    }

		    var numArgs = 0;
		    var insert;
		    var delimiters = [[]]; // <parameter text> contains no braces

		    while (parser.gullet.future().text !== "{") {
		      tok = parser.gullet.popToken();

		      if (tok.text === "#") {
		        // If the very last character of the <parameter text> is #, so that
		        // this # is immediately followed by {, TeX will behave as if the {
		        // had been inserted at the right end of both the parameter text
		        // and the replacement text.
		        if (parser.gullet.future().text === "{") {
		          insert = parser.gullet.future();
		          delimiters[numArgs].push("{");
		          break;
		        } // A parameter, the first appearance of # must be followed by 1,
		        // the next by 2, and so on; up to nine #’s are allowed


		        tok = parser.gullet.popToken();

		        if (!/^[1-9]$/.test(tok.text)) {
		          throw new src_ParseError("Invalid argument number \"" + tok.text + "\"");
		        }

		        if (parseInt(tok.text) !== numArgs + 1) {
		          throw new src_ParseError("Argument number \"" + tok.text + "\" out of order");
		        }

		        numArgs++;
		        delimiters.push([]);
		      } else if (tok.text === "EOF") {
		        throw new src_ParseError("Expected a macro definition");
		      } else {
		        delimiters[numArgs].push(tok.text);
		      }
		    } // replacement text, enclosed in '{' and '}' and properly nested


		    var _parser$gullet$consum = parser.gullet.consumeArg(),
		        tokens = _parser$gullet$consum.tokens;

		    if (insert) {
		      tokens.unshift(insert);
		    }

		    if (funcName === "\\edef" || funcName === "\\xdef") {
		      tokens = parser.gullet.expandTokens(tokens);
		      tokens.reverse(); // to fit in with stack order
		    } // Final arg is the expansion of the macro


		    parser.gullet.macros.set(name, {
		      tokens: tokens,
		      numArgs: numArgs,
		      delimiters: delimiters
		    }, funcName === globalMap[funcName]);
		    return {
		      type: "internal",
		      mode: parser.mode
		    };
		  }
		}); // <simple assignment> -> <let assignment>
		// <let assignment> -> \futurelet<control sequence><token><token>
		//     | \let<control sequence><equals><one optional space><token>
		// <equals> -> <optional spaces>|<optional spaces>=

		defineFunction({
		  type: "internal",
		  names: ["\\let", "\\\\globallet" // can’t be entered directly
		  ],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    primitive: true
		  },
		  handler: function handler(_ref3) {
		    var parser = _ref3.parser,
		        funcName = _ref3.funcName;
		    var name = checkControlSequence(parser.gullet.popToken());
		    parser.gullet.consumeSpaces();
		    var tok = getRHS(parser);
		    letCommand(parser, name, tok, funcName === "\\\\globallet");
		    return {
		      type: "internal",
		      mode: parser.mode
		    };
		  }
		}); // ref: https://www.tug.org/TUGboat/tb09-3/tb22bechtolsheim.pdf

		defineFunction({
		  type: "internal",
		  names: ["\\futurelet", "\\\\globalfuture" // can’t be entered directly
		  ],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    primitive: true
		  },
		  handler: function handler(_ref4) {
		    var parser = _ref4.parser,
		        funcName = _ref4.funcName;
		    var name = checkControlSequence(parser.gullet.popToken());
		    var middle = parser.gullet.popToken();
		    var tok = parser.gullet.popToken();
		    letCommand(parser, name, tok, funcName === "\\\\globalfuture");
		    parser.gullet.pushToken(tok);
		    parser.gullet.pushToken(middle);
		    return {
		      type: "internal",
		      mode: parser.mode
		    };
		  }
		});
		/**
		 * This file deals with creating delimiters of various sizes. The TeXbook
		 * discusses these routines on page 441-442, in the "Another subroutine sets box
		 * x to a specified variable delimiter" paragraph.
		 *
		 * There are three main routines here. `makeSmallDelim` makes a delimiter in the
		 * normal font, but in either text, script, or scriptscript style.
		 * `makeLargeDelim` makes a delimiter in textstyle, but in one of the Size1,
		 * Size2, Size3, or Size4 fonts. `makeStackedDelim` makes a delimiter out of
		 * smaller pieces that are stacked on top of one another.
		 *
		 * The functions take a parameter `center`, which determines if the delimiter
		 * should be centered around the axis.
		 *
		 * Then, there are three exposed functions. `sizedDelim` makes a delimiter in
		 * one of the given sizes. This is used for things like `\bigl`.
		 * `customSizedDelim` makes a delimiter with a given total height+depth. It is
		 * called in places like `\sqrt`. `leftRightDelim` makes an appropriate
		 * delimiter which surrounds an expression of a given height an depth. It is
		 * used in `\left` and `\right`.
		 */











		/**
		 * Get the metrics for a given symbol and font, after transformation (i.e.
		 * after following replacement from symbols.js)
		 */
		var getMetrics = function getMetrics(symbol, font, mode) {
		  var replace = src_symbols.math[symbol] && src_symbols.math[symbol].replace;
		  var metrics = getCharacterMetrics(replace || symbol, font, mode);

		  if (!metrics) {
		    throw new Error("Unsupported symbol " + symbol + " and font size " + font + ".");
		  }

		  return metrics;
		};
		/**
		 * Puts a delimiter span in a given style, and adds appropriate height, depth,
		 * and maxFontSizes.
		 */


		var styleWrap = function styleWrap(delim, toStyle, options, classes) {
		  var newOptions = options.havingBaseStyle(toStyle);
		  var span = buildCommon.makeSpan(classes.concat(newOptions.sizingClasses(options)), [delim], options);
		  var delimSizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;
		  span.height *= delimSizeMultiplier;
		  span.depth *= delimSizeMultiplier;
		  span.maxFontSize = newOptions.sizeMultiplier;
		  return span;
		};

		var centerSpan = function centerSpan(span, options, style) {
		  var newOptions = options.havingBaseStyle(style);
		  var shift = (1 - options.sizeMultiplier / newOptions.sizeMultiplier) * options.fontMetrics().axisHeight;
		  span.classes.push("delimcenter");
		  span.style.top = makeEm(shift);
		  span.height -= shift;
		  span.depth += shift;
		};
		/**
		 * Makes a small delimiter. This is a delimiter that comes in the Main-Regular
		 * font, but is restyled to either be in textstyle, scriptstyle, or
		 * scriptscriptstyle.
		 */


		var makeSmallDelim = function makeSmallDelim(delim, style, center, options, mode, classes) {
		  var text = buildCommon.makeSymbol(delim, "Main-Regular", mode, options);
		  var span = styleWrap(text, style, options, classes);

		  if (center) {
		    centerSpan(span, options, style);
		  }

		  return span;
		};
		/**
		 * Builds a symbol in the given font size (note size is an integer)
		 */


		var mathrmSize = function mathrmSize(value, size, mode, options) {
		  return buildCommon.makeSymbol(value, "Size" + size + "-Regular", mode, options);
		};
		/**
		 * Makes a large delimiter. This is a delimiter that comes in the Size1, Size2,
		 * Size3, or Size4 fonts. It is always rendered in textstyle.
		 */


		var makeLargeDelim = function makeLargeDelim(delim, size, center, options, mode, classes) {
		  var inner = mathrmSize(delim, size, mode, options);
		  var span = styleWrap(buildCommon.makeSpan(["delimsizing", "size" + size], [inner], options), src_Style.TEXT, options, classes);

		  if (center) {
		    centerSpan(span, options, src_Style.TEXT);
		  }

		  return span;
		};
		/**
		 * Make a span from a font glyph with the given offset and in the given font.
		 * This is used in makeStackedDelim to make the stacking pieces for the delimiter.
		 */


		var makeGlyphSpan = function makeGlyphSpan(symbol, font, mode) {
		  var sizeClass; // Apply the correct CSS class to choose the right font.

		  if (font === "Size1-Regular") {
		    sizeClass = "delim-size1";
		  } else
		    /* if (font === "Size4-Regular") */
		    {
		      sizeClass = "delim-size4";
		    }

		  var corner = buildCommon.makeSpan(["delimsizinginner", sizeClass], [buildCommon.makeSpan([], [buildCommon.makeSymbol(symbol, font, mode)])]); // Since this will be passed into `makeVList` in the end, wrap the element
		  // in the appropriate tag that VList uses.

		  return {
		    type: "elem",
		    elem: corner
		  };
		};

		var makeInner = function makeInner(ch, height, options) {
		  // Create a span with inline SVG for the inner part of a tall stacked delimiter.
		  var width = fontMetricsData["Size4-Regular"][ch.charCodeAt(0)] ? fontMetricsData["Size4-Regular"][ch.charCodeAt(0)][4] : fontMetricsData["Size1-Regular"][ch.charCodeAt(0)][4];
		  var path = new PathNode("inner", innerPath(ch, Math.round(1000 * height)));
		  var svgNode = new SvgNode([path], {
		    "width": makeEm(width),
		    "height": makeEm(height),
		    // Override CSS rule `.katex svg { width: 100% }`
		    "style": "width:" + makeEm(width),
		    "viewBox": "0 0 " + 1000 * width + " " + Math.round(1000 * height),
		    "preserveAspectRatio": "xMinYMin"
		  });
		  var span = buildCommon.makeSvgSpan([], [svgNode], options);
		  span.height = height;
		  span.style.height = makeEm(height);
		  span.style.width = makeEm(width);
		  return {
		    type: "elem",
		    elem: span
		  };
		}; // Helpers for makeStackedDelim


		var lapInEms = 0.008;
		var lap = {
		  type: "kern",
		  size: -1 * lapInEms
		};
		var verts = ["|", "\\lvert", "\\rvert", "\\vert"];
		var doubleVerts = ["\\|", "\\lVert", "\\rVert", "\\Vert"];
		/**
		 * Make a stacked delimiter out of a given delimiter, with the total height at
		 * least `heightTotal`. This routine is mentioned on page 442 of the TeXbook.
		 */

		var makeStackedDelim = function makeStackedDelim(delim, heightTotal, center, options, mode, classes) {
		  // There are four parts, the top, an optional middle, a repeated part, and a
		  // bottom.
		  var top;
		  var middle;
		  var repeat;
		  var bottom;
		  var svgLabel = "";
		  var viewBoxWidth = 0;
		  top = repeat = bottom = delim;
		  middle = null; // Also keep track of what font the delimiters are in

		  var font = "Size1-Regular"; // We set the parts and font based on the symbol. Note that we use
		  // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
		  // repeats of the arrows

		  if (delim === "\\uparrow") {
		    repeat = bottom = "\u23D0";
		  } else if (delim === "\\Uparrow") {
		    repeat = bottom = "\u2016";
		  } else if (delim === "\\downarrow") {
		    top = repeat = "\u23D0";
		  } else if (delim === "\\Downarrow") {
		    top = repeat = "\u2016";
		  } else if (delim === "\\updownarrow") {
		    top = "\\uparrow";
		    repeat = "\u23D0";
		    bottom = "\\downarrow";
		  } else if (delim === "\\Updownarrow") {
		    top = "\\Uparrow";
		    repeat = "\u2016";
		    bottom = "\\Downarrow";
		  } else if (utils.contains(verts, delim)) {
		    repeat = "\u2223";
		    svgLabel = "vert";
		    viewBoxWidth = 333;
		  } else if (utils.contains(doubleVerts, delim)) {
		    repeat = "\u2225";
		    svgLabel = "doublevert";
		    viewBoxWidth = 556;
		  } else if (delim === "[" || delim === "\\lbrack") {
		    top = "\u23A1";
		    repeat = "\u23A2";
		    bottom = "\u23A3";
		    font = "Size4-Regular";
		    svgLabel = "lbrack";
		    viewBoxWidth = 667;
		  } else if (delim === "]" || delim === "\\rbrack") {
		    top = "\u23A4";
		    repeat = "\u23A5";
		    bottom = "\u23A6";
		    font = "Size4-Regular";
		    svgLabel = "rbrack";
		    viewBoxWidth = 667;
		  } else if (delim === "\\lfloor" || delim === "\u230A") {
		    repeat = top = "\u23A2";
		    bottom = "\u23A3";
		    font = "Size4-Regular";
		    svgLabel = "lfloor";
		    viewBoxWidth = 667;
		  } else if (delim === "\\lceil" || delim === "\u2308") {
		    top = "\u23A1";
		    repeat = bottom = "\u23A2";
		    font = "Size4-Regular";
		    svgLabel = "lceil";
		    viewBoxWidth = 667;
		  } else if (delim === "\\rfloor" || delim === "\u230B") {
		    repeat = top = "\u23A5";
		    bottom = "\u23A6";
		    font = "Size4-Regular";
		    svgLabel = "rfloor";
		    viewBoxWidth = 667;
		  } else if (delim === "\\rceil" || delim === "\u2309") {
		    top = "\u23A4";
		    repeat = bottom = "\u23A5";
		    font = "Size4-Regular";
		    svgLabel = "rceil";
		    viewBoxWidth = 667;
		  } else if (delim === "(" || delim === "\\lparen") {
		    top = "\u239B";
		    repeat = "\u239C";
		    bottom = "\u239D";
		    font = "Size4-Regular";
		    svgLabel = "lparen";
		    viewBoxWidth = 875;
		  } else if (delim === ")" || delim === "\\rparen") {
		    top = "\u239E";
		    repeat = "\u239F";
		    bottom = "\u23A0";
		    font = "Size4-Regular";
		    svgLabel = "rparen";
		    viewBoxWidth = 875;
		  } else if (delim === "\\{" || delim === "\\lbrace") {
		    top = "\u23A7";
		    middle = "\u23A8";
		    bottom = "\u23A9";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } else if (delim === "\\}" || delim === "\\rbrace") {
		    top = "\u23AB";
		    middle = "\u23AC";
		    bottom = "\u23AD";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } else if (delim === "\\lgroup" || delim === "\u27EE") {
		    top = "\u23A7";
		    bottom = "\u23A9";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } else if (delim === "\\rgroup" || delim === "\u27EF") {
		    top = "\u23AB";
		    bottom = "\u23AD";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } else if (delim === "\\lmoustache" || delim === "\u23B0") {
		    top = "\u23A7";
		    bottom = "\u23AD";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } else if (delim === "\\rmoustache" || delim === "\u23B1") {
		    top = "\u23AB";
		    bottom = "\u23A9";
		    repeat = "\u23AA";
		    font = "Size4-Regular";
		  } // Get the metrics of the four sections


		  var topMetrics = getMetrics(top, font, mode);
		  var topHeightTotal = topMetrics.height + topMetrics.depth;
		  var repeatMetrics = getMetrics(repeat, font, mode);
		  var repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
		  var bottomMetrics = getMetrics(bottom, font, mode);
		  var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
		  var middleHeightTotal = 0;
		  var middleFactor = 1;

		  if (middle !== null) {
		    var middleMetrics = getMetrics(middle, font, mode);
		    middleHeightTotal = middleMetrics.height + middleMetrics.depth;
		    middleFactor = 2; // repeat symmetrically above and below middle
		  } // Calculate the minimal height that the delimiter can have.
		  // It is at least the size of the top, bottom, and optional middle combined.


		  var minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal; // Compute the number of copies of the repeat symbol we will need

		  var repeatCount = Math.max(0, Math.ceil((heightTotal - minHeight) / (middleFactor * repeatHeightTotal))); // Compute the total height of the delimiter including all the symbols

		  var realHeightTotal = minHeight + repeatCount * middleFactor * repeatHeightTotal; // The center of the delimiter is placed at the center of the axis. Note
		  // that in this context, "center" means that the delimiter should be
		  // centered around the axis in the current style, while normally it is
		  // centered around the axis in textstyle.

		  var axisHeight = options.fontMetrics().axisHeight;

		  if (center) {
		    axisHeight *= options.sizeMultiplier;
		  } // Calculate the depth


		  var depth = realHeightTotal / 2 - axisHeight; // Now, we start building the pieces that will go into the vlist
		  // Keep a list of the pieces of the stacked delimiter

		  var stack = [];

		  if (svgLabel.length > 0) {
		    // Instead of stacking glyphs, create a single SVG.
		    // This evades browser problems with imprecise positioning of spans.
		    var midHeight = realHeightTotal - topHeightTotal - bottomHeightTotal;
		    var viewBoxHeight = Math.round(realHeightTotal * 1000);
		    var pathStr = tallDelim(svgLabel, Math.round(midHeight * 1000));
		    var path = new PathNode(svgLabel, pathStr);
		    var width = (viewBoxWidth / 1000).toFixed(3) + "em";
		    var height = (viewBoxHeight / 1000).toFixed(3) + "em";
		    var svg = new SvgNode([path], {
		      "width": width,
		      "height": height,
		      "viewBox": "0 0 " + viewBoxWidth + " " + viewBoxHeight
		    });
		    var wrapper = buildCommon.makeSvgSpan([], [svg], options);
		    wrapper.height = viewBoxHeight / 1000;
		    wrapper.style.width = width;
		    wrapper.style.height = height;
		    stack.push({
		      type: "elem",
		      elem: wrapper
		    });
		  } else {
		    // Stack glyphs
		    // Start by adding the bottom symbol
		    stack.push(makeGlyphSpan(bottom, font, mode));
		    stack.push(lap); // overlap

		    if (middle === null) {
		      // The middle section will be an SVG. Make it an extra 0.016em tall.
		      // We'll overlap by 0.008em at top and bottom.
		      var innerHeight = realHeightTotal - topHeightTotal - bottomHeightTotal + 2 * lapInEms;
		      stack.push(makeInner(repeat, innerHeight, options));
		    } else {
		      // When there is a middle bit, we need the middle part and two repeated
		      // sections
		      var _innerHeight = (realHeightTotal - topHeightTotal - bottomHeightTotal - middleHeightTotal) / 2 + 2 * lapInEms;

		      stack.push(makeInner(repeat, _innerHeight, options)); // Now insert the middle of the brace.

		      stack.push(lap);
		      stack.push(makeGlyphSpan(middle, font, mode));
		      stack.push(lap);
		      stack.push(makeInner(repeat, _innerHeight, options));
		    } // Add the top symbol


		    stack.push(lap);
		    stack.push(makeGlyphSpan(top, font, mode));
		  } // Finally, build the vlist


		  var newOptions = options.havingBaseStyle(src_Style.TEXT);
		  var inner = buildCommon.makeVList({
		    positionType: "bottom",
		    positionData: depth,
		    children: stack
		  }, newOptions);
		  return styleWrap(buildCommon.makeSpan(["delimsizing", "mult"], [inner], newOptions), src_Style.TEXT, options, classes);
		}; // All surds have 0.08em padding above the vinculum inside the SVG.
		// That keeps browser span height rounding error from pinching the line.


		var vbPad = 80; // padding above the surd, measured inside the viewBox.

		var emPad = 0.08; // padding, in ems, measured in the document.

		var sqrtSvg = function sqrtSvg(sqrtName, height, viewBoxHeight, extraVinculum, options) {
		  var path = sqrtPath(sqrtName, extraVinculum, viewBoxHeight);
		  var pathNode = new PathNode(sqrtName, path);
		  var svg = new SvgNode([pathNode], {
		    // Note: 1000:1 ratio of viewBox to document em width.
		    "width": "400em",
		    "height": makeEm(height),
		    "viewBox": "0 0 400000 " + viewBoxHeight,
		    "preserveAspectRatio": "xMinYMin slice"
		  });
		  return buildCommon.makeSvgSpan(["hide-tail"], [svg], options);
		};
		/**
		 * Make a sqrt image of the given height,
		 */


		var makeSqrtImage = function makeSqrtImage(height, options) {
		  // Define a newOptions that removes the effect of size changes such as \Huge.
		  // We don't pick different a height surd for \Huge. For it, we scale up.
		  var newOptions = options.havingBaseSizing(); // Pick the desired surd glyph from a sequence of surds.

		  var delim = traverseSequence("\\surd", height * newOptions.sizeMultiplier, stackLargeDelimiterSequence, newOptions);
		  var sizeMultiplier = newOptions.sizeMultiplier; // default
		  // The standard sqrt SVGs each have a 0.04em thick vinculum.
		  // If Settings.minRuleThickness is larger than that, we add extraVinculum.

		  var extraVinculum = Math.max(0, options.minRuleThickness - options.fontMetrics().sqrtRuleThickness); // Create a span containing an SVG image of a sqrt symbol.

		  var span;
		  var spanHeight = 0;
		  var texHeight = 0;
		  var viewBoxHeight = 0;
		  var advanceWidth; // We create viewBoxes with 80 units of "padding" above each surd.
		  // Then browser rounding error on the parent span height will not
		  // encroach on the ink of the vinculum. But that padding is not
		  // included in the TeX-like `height` used for calculation of
		  // vertical alignment. So texHeight = span.height < span.style.height.

		  if (delim.type === "small") {
		    // Get an SVG that is derived from glyph U+221A in font KaTeX-Main.
		    // 1000 unit normal glyph height.
		    viewBoxHeight = 1000 + 1000 * extraVinculum + vbPad;

		    if (height < 1.0) {
		      sizeMultiplier = 1.0; // mimic a \textfont radical
		    } else if (height < 1.4) {
		      sizeMultiplier = 0.7; // mimic a \scriptfont radical
		    }

		    spanHeight = (1.0 + extraVinculum + emPad) / sizeMultiplier;
		    texHeight = (1.00 + extraVinculum) / sizeMultiplier;
		    span = sqrtSvg("sqrtMain", spanHeight, viewBoxHeight, extraVinculum, options);
		    span.style.minWidth = "0.853em";
		    advanceWidth = 0.833 / sizeMultiplier; // from the font.
		  } else if (delim.type === "large") {
		    // These SVGs come from fonts: KaTeX_Size1, _Size2, etc.
		    viewBoxHeight = (1000 + vbPad) * sizeToMaxHeight[delim.size];
		    texHeight = (sizeToMaxHeight[delim.size] + extraVinculum) / sizeMultiplier;
		    spanHeight = (sizeToMaxHeight[delim.size] + extraVinculum + emPad) / sizeMultiplier;
		    span = sqrtSvg("sqrtSize" + delim.size, spanHeight, viewBoxHeight, extraVinculum, options);
		    span.style.minWidth = "1.02em";
		    advanceWidth = 1.0 / sizeMultiplier; // 1.0 from the font.
		  } else {
		    // Tall sqrt. In TeX, this would be stacked using multiple glyphs.
		    // We'll use a single SVG to accomplish the same thing.
		    spanHeight = height + extraVinculum + emPad;
		    texHeight = height + extraVinculum;
		    viewBoxHeight = Math.floor(1000 * height + extraVinculum) + vbPad;
		    span = sqrtSvg("sqrtTall", spanHeight, viewBoxHeight, extraVinculum, options);
		    span.style.minWidth = "0.742em";
		    advanceWidth = 1.056;
		  }

		  span.height = texHeight;
		  span.style.height = makeEm(spanHeight);
		  return {
		    span: span,
		    advanceWidth: advanceWidth,
		    // Calculate the actual line width.
		    // This actually should depend on the chosen font -- e.g. \boldmath
		    // should use the thicker surd symbols from e.g. KaTeX_Main-Bold, and
		    // have thicker rules.
		    ruleWidth: (options.fontMetrics().sqrtRuleThickness + extraVinculum) * sizeMultiplier
		  };
		}; // There are three kinds of delimiters, delimiters that stack when they become
		// too large


		var stackLargeDelimiters = ["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\u230A", "\u230B", "\\lceil", "\\rceil", "\u2308", "\u2309", "\\surd"]; // delimiters that always stack

		var stackAlwaysDelimiters = ["\\uparrow", "\\downarrow", "\\updownarrow", "\\Uparrow", "\\Downarrow", "\\Updownarrow", "|", "\\|", "\\vert", "\\Vert", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\u27EE", "\u27EF", "\\lmoustache", "\\rmoustache", "\u23B0", "\u23B1"]; // and delimiters that never stack

		var stackNeverDelimiters = ["<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt"]; // Metrics of the different sizes. Found by looking at TeX's output of
		// $\bigl| // \Bigl| \biggl| \Biggl| \showlists$
		// Used to create stacked delimiters of appropriate sizes in makeSizedDelim.

		var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];
		/**
		 * Used to create a delimiter of a specific size, where `size` is 1, 2, 3, or 4.
		 */

		var makeSizedDelim = function makeSizedDelim(delim, size, options, mode, classes) {
		  // < and > turn into \langle and \rangle in delimiters
		  if (delim === "<" || delim === "\\lt" || delim === "\u27E8") {
		    delim = "\\langle";
		  } else if (delim === ">" || delim === "\\gt" || delim === "\u27E9") {
		    delim = "\\rangle";
		  } // Sized delimiters are never centered.


		  if (utils.contains(stackLargeDelimiters, delim) || utils.contains(stackNeverDelimiters, delim)) {
		    return makeLargeDelim(delim, size, false, options, mode, classes);
		  } else if (utils.contains(stackAlwaysDelimiters, delim)) {
		    return makeStackedDelim(delim, sizeToMaxHeight[size], false, options, mode, classes);
		  } else {
		    throw new src_ParseError("Illegal delimiter: '" + delim + "'");
		  }
		};
		/**
		 * There are three different sequences of delimiter sizes that the delimiters
		 * follow depending on the kind of delimiter. This is used when creating custom
		 * sized delimiters to decide whether to create a small, large, or stacked
		 * delimiter.
		 *
		 * In real TeX, these sequences aren't explicitly defined, but are instead
		 * defined inside the font metrics. Since there are only three sequences that
		 * are possible for the delimiters that TeX defines, it is easier to just encode
		 * them explicitly here.
		 */


		// Delimiters that never stack try small delimiters and large delimiters only
		var stackNeverDelimiterSequence = [{
		  type: "small",
		  style: src_Style.SCRIPTSCRIPT
		}, {
		  type: "small",
		  style: src_Style.SCRIPT
		}, {
		  type: "small",
		  style: src_Style.TEXT
		}, {
		  type: "large",
		  size: 1
		}, {
		  type: "large",
		  size: 2
		}, {
		  type: "large",
		  size: 3
		}, {
		  type: "large",
		  size: 4
		}]; // Delimiters that always stack try the small delimiters first, then stack

		var stackAlwaysDelimiterSequence = [{
		  type: "small",
		  style: src_Style.SCRIPTSCRIPT
		}, {
		  type: "small",
		  style: src_Style.SCRIPT
		}, {
		  type: "small",
		  style: src_Style.TEXT
		}, {
		  type: "stack"
		}]; // Delimiters that stack when large try the small and then large delimiters, and
		// stack afterwards

		var stackLargeDelimiterSequence = [{
		  type: "small",
		  style: src_Style.SCRIPTSCRIPT
		}, {
		  type: "small",
		  style: src_Style.SCRIPT
		}, {
		  type: "small",
		  style: src_Style.TEXT
		}, {
		  type: "large",
		  size: 1
		}, {
		  type: "large",
		  size: 2
		}, {
		  type: "large",
		  size: 3
		}, {
		  type: "large",
		  size: 4
		}, {
		  type: "stack"
		}];
		/**
		 * Get the font used in a delimiter based on what kind of delimiter it is.
		 * TODO(#963) Use more specific font family return type once that is introduced.
		 */

		var delimTypeToFont = function delimTypeToFont(type) {
		  if (type.type === "small") {
		    return "Main-Regular";
		  } else if (type.type === "large") {
		    return "Size" + type.size + "-Regular";
		  } else if (type.type === "stack") {
		    return "Size4-Regular";
		  } else {
		    throw new Error("Add support for delim type '" + type.type + "' here.");
		  }
		};
		/**
		 * Traverse a sequence of types of delimiters to decide what kind of delimiter
		 * should be used to create a delimiter of the given height+depth.
		 */


		var traverseSequence = function traverseSequence(delim, height, sequence, options) {
		  // Here, we choose the index we should start at in the sequences. In smaller
		  // sizes (which correspond to larger numbers in style.size) we start earlier
		  // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
		  // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
		  var start = Math.min(2, 3 - options.style.size);

		  for (var i = start; i < sequence.length; i++) {
		    if (sequence[i].type === "stack") {
		      // This is always the last delimiter, so we just break the loop now.
		      break;
		    }

		    var metrics = getMetrics(delim, delimTypeToFont(sequence[i]), "math");
		    var heightDepth = metrics.height + metrics.depth; // Small delimiters are scaled down versions of the same font, so we
		    // account for the style change size.

		    if (sequence[i].type === "small") {
		      var newOptions = options.havingBaseStyle(sequence[i].style);
		      heightDepth *= newOptions.sizeMultiplier;
		    } // Check if the delimiter at this size works for the given height.


		    if (heightDepth > height) {
		      return sequence[i];
		    }
		  } // If we reached the end of the sequence, return the last sequence element.


		  return sequence[sequence.length - 1];
		};
		/**
		 * Make a delimiter of a given height+depth, with optional centering. Here, we
		 * traverse the sequences, and create a delimiter that the sequence tells us to.
		 */


		var makeCustomSizedDelim = function makeCustomSizedDelim(delim, height, center, options, mode, classes) {
		  if (delim === "<" || delim === "\\lt" || delim === "\u27E8") {
		    delim = "\\langle";
		  } else if (delim === ">" || delim === "\\gt" || delim === "\u27E9") {
		    delim = "\\rangle";
		  } // Decide what sequence to use


		  var sequence;

		  if (utils.contains(stackNeverDelimiters, delim)) {
		    sequence = stackNeverDelimiterSequence;
		  } else if (utils.contains(stackLargeDelimiters, delim)) {
		    sequence = stackLargeDelimiterSequence;
		  } else {
		    sequence = stackAlwaysDelimiterSequence;
		  } // Look through the sequence


		  var delimType = traverseSequence(delim, height, sequence, options); // Get the delimiter from font glyphs.
		  // Depending on the sequence element we decided on, call the
		  // appropriate function.

		  if (delimType.type === "small") {
		    return makeSmallDelim(delim, delimType.style, center, options, mode, classes);
		  } else if (delimType.type === "large") {
		    return makeLargeDelim(delim, delimType.size, center, options, mode, classes);
		  } else
		    /* if (delimType.type === "stack") */
		    {
		      return makeStackedDelim(delim, height, center, options, mode, classes);
		    }
		};
		/**
		 * Make a delimiter for use with `\left` and `\right`, given a height and depth
		 * of an expression that the delimiters surround.
		 */


		var makeLeftRightDelim = function makeLeftRightDelim(delim, height, depth, options, mode, classes) {
		  // We always center \left/\right delimiters, so the axis is always shifted
		  var axisHeight = options.fontMetrics().axisHeight * options.sizeMultiplier; // Taken from TeX source, tex.web, function make_left_right

		  var delimiterFactor = 901;
		  var delimiterExtend = 5.0 / options.fontMetrics().ptPerEm;
		  var maxDistFromAxis = Math.max(height - axisHeight, depth + axisHeight);
		  var totalHeight = Math.max( // In real TeX, calculations are done using integral values which are
		  // 65536 per pt, or 655360 per em. So, the division here truncates in
		  // TeX but doesn't here, producing different results. If we wanted to
		  // exactly match TeX's calculation, we could do
		  //   Math.floor(655360 * maxDistFromAxis / 500) *
		  //    delimiterFactor / 655360
		  // (To see the difference, compare
		  //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
		  // in TeX and KaTeX)
		  maxDistFromAxis / 500 * delimiterFactor, 2 * maxDistFromAxis - delimiterExtend); // Finally, we defer to `makeCustomSizedDelim` with our calculated total
		  // height

		  return makeCustomSizedDelim(delim, totalHeight, true, options, mode, classes);
		};

		/* harmony default export */ var delimiter = ({
		  sqrtImage: makeSqrtImage,
		  sizedDelim: makeSizedDelim,
		  sizeToMaxHeight: sizeToMaxHeight,
		  customSizedDelim: makeCustomSizedDelim,
		  leftRightDelim: makeLeftRightDelim
		});










		// Extra data needed for the delimiter handler down below
		var delimiterSizes = {
		  "\\bigl": {
		    mclass: "mopen",
		    size: 1
		  },
		  "\\Bigl": {
		    mclass: "mopen",
		    size: 2
		  },
		  "\\biggl": {
		    mclass: "mopen",
		    size: 3
		  },
		  "\\Biggl": {
		    mclass: "mopen",
		    size: 4
		  },
		  "\\bigr": {
		    mclass: "mclose",
		    size: 1
		  },
		  "\\Bigr": {
		    mclass: "mclose",
		    size: 2
		  },
		  "\\biggr": {
		    mclass: "mclose",
		    size: 3
		  },
		  "\\Biggr": {
		    mclass: "mclose",
		    size: 4
		  },
		  "\\bigm": {
		    mclass: "mrel",
		    size: 1
		  },
		  "\\Bigm": {
		    mclass: "mrel",
		    size: 2
		  },
		  "\\biggm": {
		    mclass: "mrel",
		    size: 3
		  },
		  "\\Biggm": {
		    mclass: "mrel",
		    size: 4
		  },
		  "\\big": {
		    mclass: "mord",
		    size: 1
		  },
		  "\\Big": {
		    mclass: "mord",
		    size: 2
		  },
		  "\\bigg": {
		    mclass: "mord",
		    size: 3
		  },
		  "\\Bigg": {
		    mclass: "mord",
		    size: 4
		  }
		};
		var delimiters = ["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\u230A", "\u230B", "\\lceil", "\\rceil", "\u2308", "\u2309", "<", ">", "\\langle", "\u27E8", "\\rangle", "\u27E9", "\\lt", "\\gt", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\u27EE", "\u27EF", "\\lmoustache", "\\rmoustache", "\u23B0", "\u23B1", "/", "\\backslash", "|", "\\vert", "\\|", "\\Vert", "\\uparrow", "\\Uparrow", "\\downarrow", "\\Downarrow", "\\updownarrow", "\\Updownarrow", "."];

		// Delimiter functions
		function checkDelimiter(delim, context) {
		  var symDelim = checkSymbolNodeType(delim);

		  if (symDelim && utils.contains(delimiters, symDelim.text)) {
		    return symDelim;
		  } else if (symDelim) {
		    throw new src_ParseError("Invalid delimiter '" + symDelim.text + "' after '" + context.funcName + "'", delim);
		  } else {
		    throw new src_ParseError("Invalid delimiter type '" + delim.type + "'", delim);
		  }
		}

		defineFunction({
		  type: "delimsizing",
		  names: ["\\bigl", "\\Bigl", "\\biggl", "\\Biggl", "\\bigr", "\\Bigr", "\\biggr", "\\Biggr", "\\bigm", "\\Bigm", "\\biggm", "\\Biggm", "\\big", "\\Big", "\\bigg", "\\Bigg"],
		  props: {
		    numArgs: 1,
		    argTypes: ["primitive"]
		  },
		  handler: function handler(context, args) {
		    var delim = checkDelimiter(args[0], context);
		    return {
		      type: "delimsizing",
		      mode: context.parser.mode,
		      size: delimiterSizes[context.funcName].size,
		      mclass: delimiterSizes[context.funcName].mclass,
		      delim: delim.text
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    if (group.delim === ".") {
		      // Empty delimiters still count as elements, even though they don't
		      // show anything.
		      return buildCommon.makeSpan([group.mclass]);
		    } // Use delimiter.sizedDelim to generate the delimiter.


		    return delimiter.sizedDelim(group.delim, group.size, options, group.mode, [group.mclass]);
		  },
		  mathmlBuilder: function mathmlBuilder(group) {
		    var children = [];

		    if (group.delim !== ".") {
		      children.push(makeText(group.delim, group.mode));
		    }

		    var node = new mathMLTree.MathNode("mo", children);

		    if (group.mclass === "mopen" || group.mclass === "mclose") {
		      // Only some of the delimsizing functions act as fences, and they
		      // return "mopen" or "mclose" mclass.
		      node.setAttribute("fence", "true");
		    } else {
		      // Explicitly disable fencing if it's not a fence, to override the
		      // defaults.
		      node.setAttribute("fence", "false");
		    }

		    node.setAttribute("stretchy", "true");
		    var size = makeEm(delimiter.sizeToMaxHeight[group.size]);
		    node.setAttribute("minsize", size);
		    node.setAttribute("maxsize", size);
		    return node;
		  }
		});

		function assertParsed(group) {
		  if (!group.body) {
		    throw new Error("Bug: The leftright ParseNode wasn't fully parsed.");
		  }
		}

		defineFunction({
		  type: "leftright-right",
		  names: ["\\right"],
		  props: {
		    numArgs: 1,
		    primitive: true
		  },
		  handler: function handler(context, args) {
		    // \left case below triggers parsing of \right in
		    //   `const right = parser.parseFunction();`
		    // uses this return value.
		    var color = context.parser.gullet.macros.get("\\current@color");

		    if (color && typeof color !== "string") {
		      throw new src_ParseError("\\current@color set to non-string in \\right");
		    }

		    return {
		      type: "leftright-right",
		      mode: context.parser.mode,
		      delim: checkDelimiter(args[0], context).text,
		      color: color // undefined if not set via \color

		    };
		  }
		});
		defineFunction({
		  type: "leftright",
		  names: ["\\left"],
		  props: {
		    numArgs: 1,
		    primitive: true
		  },
		  handler: function handler(context, args) {
		    var delim = checkDelimiter(args[0], context);
		    var parser = context.parser; // Parse out the implicit body

		    ++parser.leftrightDepth; // parseExpression stops before '\\right'

		    var body = parser.parseExpression(false);
		    --parser.leftrightDepth; // Check the next token

		    parser.expect("\\right", false);
		    var right = assertNodeType(parser.parseFunction(), "leftright-right");
		    return {
		      type: "leftright",
		      mode: parser.mode,
		      body: body,
		      left: delim.text,
		      right: right.delim,
		      rightColor: right.color
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    assertParsed(group); // Build the inner expression

		    var inner = buildExpression(group.body, options, true, ["mopen", "mclose"]);
		    var innerHeight = 0;
		    var innerDepth = 0;
		    var hadMiddle = false; // Calculate its height and depth

		    for (var i = 0; i < inner.length; i++) {
		      // Property `isMiddle` not defined on `span`. See comment in
		      // "middle"'s htmlBuilder.
		      // $FlowFixMe
		      if (inner[i].isMiddle) {
		        hadMiddle = true;
		      } else {
		        innerHeight = Math.max(inner[i].height, innerHeight);
		        innerDepth = Math.max(inner[i].depth, innerDepth);
		      }
		    } // The size of delimiters is the same, regardless of what style we are
		    // in. Thus, to correctly calculate the size of delimiter we need around
		    // a group, we scale down the inner size based on the size.


		    innerHeight *= options.sizeMultiplier;
		    innerDepth *= options.sizeMultiplier;
		    var leftDelim;

		    if (group.left === ".") {
		      // Empty delimiters in \left and \right make null delimiter spaces.
		      leftDelim = makeNullDelimiter(options, ["mopen"]);
		    } else {
		      // Otherwise, use leftRightDelim to generate the correct sized
		      // delimiter.
		      leftDelim = delimiter.leftRightDelim(group.left, innerHeight, innerDepth, options, group.mode, ["mopen"]);
		    } // Add it to the beginning of the expression


		    inner.unshift(leftDelim); // Handle middle delimiters

		    if (hadMiddle) {
		      for (var _i = 1; _i < inner.length; _i++) {
		        var middleDelim = inner[_i]; // Property `isMiddle` not defined on `span`. See comment in
		        // "middle"'s htmlBuilder.
		        // $FlowFixMe

		        var isMiddle = middleDelim.isMiddle;

		        if (isMiddle) {
		          // Apply the options that were active when \middle was called
		          inner[_i] = delimiter.leftRightDelim(isMiddle.delim, innerHeight, innerDepth, isMiddle.options, group.mode, []);
		        }
		      }
		    }

		    var rightDelim; // Same for the right delimiter, but using color specified by \color

		    if (group.right === ".") {
		      rightDelim = makeNullDelimiter(options, ["mclose"]);
		    } else {
		      var colorOptions = group.rightColor ? options.withColor(group.rightColor) : options;
		      rightDelim = delimiter.leftRightDelim(group.right, innerHeight, innerDepth, colorOptions, group.mode, ["mclose"]);
		    } // Add it to the end of the expression.


		    inner.push(rightDelim);
		    return buildCommon.makeSpan(["minner"], inner, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    assertParsed(group);
		    var inner = buildMathML_buildExpression(group.body, options);

		    if (group.left !== ".") {
		      var leftNode = new mathMLTree.MathNode("mo", [makeText(group.left, group.mode)]);
		      leftNode.setAttribute("fence", "true");
		      inner.unshift(leftNode);
		    }

		    if (group.right !== ".") {
		      var rightNode = new mathMLTree.MathNode("mo", [makeText(group.right, group.mode)]);
		      rightNode.setAttribute("fence", "true");

		      if (group.rightColor) {
		        rightNode.setAttribute("mathcolor", group.rightColor);
		      }

		      inner.push(rightNode);
		    }

		    return makeRow(inner);
		  }
		});
		defineFunction({
		  type: "middle",
		  names: ["\\middle"],
		  props: {
		    numArgs: 1,
		    primitive: true
		  },
		  handler: function handler(context, args) {
		    var delim = checkDelimiter(args[0], context);

		    if (!context.parser.leftrightDepth) {
		      throw new src_ParseError("\\middle without preceding \\left", delim);
		    }

		    return {
		      type: "middle",
		      mode: context.parser.mode,
		      delim: delim.text
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var middleDelim;

		    if (group.delim === ".") {
		      middleDelim = makeNullDelimiter(options, []);
		    } else {
		      middleDelim = delimiter.sizedDelim(group.delim, 1, options, group.mode, []);
		      var isMiddle = {
		        delim: group.delim,
		        options: options
		      }; // Property `isMiddle` not defined on `span`. It is only used in
		      // this file above.
		      // TODO: Fix this violation of the `span` type and possibly rename
		      // things since `isMiddle` sounds like a boolean, but is a struct.
		      // $FlowFixMe

		      middleDelim.isMiddle = isMiddle;
		    }

		    return middleDelim;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    // A Firefox \middle will stretch a character vertically only if it
		    // is in the fence part of the operator dictionary at:
		    // https://www.w3.org/TR/MathML3/appendixc.html.
		    // So we need to avoid U+2223 and use plain "|" instead.
		    var textNode = group.delim === "\\vert" || group.delim === "|" ? makeText("|", "text") : makeText(group.delim, group.mode);
		    var middleNode = new mathMLTree.MathNode("mo", [textNode]);
		    middleNode.setAttribute("fence", "true"); // MathML gives 5/18em spacing to each <mo> element.
		    // \middle should get delimiter spacing instead.

		    middleNode.setAttribute("lspace", "0.05em");
		    middleNode.setAttribute("rspace", "0.05em");
		    return middleNode;
		  }
		});












		var enclose_htmlBuilder = function htmlBuilder(group, options) {
		  // \cancel, \bcancel, \xcancel, \sout, \fbox, \colorbox, \fcolorbox, \phase
		  // Some groups can return document fragments.  Handle those by wrapping
		  // them in a span.
		  var inner = buildCommon.wrapFragment(buildGroup(group.body, options), options);
		  var label = group.label.slice(1);
		  var scale = options.sizeMultiplier;
		  var img;
		  var imgShift = 0; // In the LaTeX cancel package, line geometry is slightly different
		  // depending on whether the subject is wider than it is tall, or vice versa.
		  // We don't know the width of a group, so as a proxy, we test if
		  // the subject is a single character. This captures most of the
		  // subjects that should get the "tall" treatment.

		  var isSingleChar = utils.isCharacterBox(group.body);

		  if (label === "sout") {
		    img = buildCommon.makeSpan(["stretchy", "sout"]);
		    img.height = options.fontMetrics().defaultRuleThickness / scale;
		    imgShift = -0.5 * options.fontMetrics().xHeight;
		  } else if (label === "phase") {
		    // Set a couple of dimensions from the steinmetz package.
		    var lineWeight = calculateSize({
		      number: 0.6,
		      unit: "pt"
		    }, options);
		    var clearance = calculateSize({
		      number: 0.35,
		      unit: "ex"
		    }, options); // Prevent size changes like \Huge from affecting line thickness

		    var newOptions = options.havingBaseSizing();
		    scale = scale / newOptions.sizeMultiplier;
		    var angleHeight = inner.height + inner.depth + lineWeight + clearance; // Reserve a left pad for the angle.

		    inner.style.paddingLeft = makeEm(angleHeight / 2 + lineWeight); // Create an SVG

		    var viewBoxHeight = Math.floor(1000 * angleHeight * scale);
		    var path = phasePath(viewBoxHeight);
		    var svgNode = new SvgNode([new PathNode("phase", path)], {
		      "width": "400em",
		      "height": makeEm(viewBoxHeight / 1000),
		      "viewBox": "0 0 400000 " + viewBoxHeight,
		      "preserveAspectRatio": "xMinYMin slice"
		    }); // Wrap it in a span with overflow: hidden.

		    img = buildCommon.makeSvgSpan(["hide-tail"], [svgNode], options);
		    img.style.height = makeEm(angleHeight);
		    imgShift = inner.depth + lineWeight + clearance;
		  } else {
		    // Add horizontal padding
		    if (/cancel/.test(label)) {
		      if (!isSingleChar) {
		        inner.classes.push("cancel-pad");
		      }
		    } else if (label === "angl") {
		      inner.classes.push("anglpad");
		    } else {
		      inner.classes.push("boxpad");
		    } // Add vertical padding


		    var topPad = 0;
		    var bottomPad = 0;
		    var ruleThickness = 0; // ref: cancel package: \advance\totalheight2\p@ % "+2"

		    if (/box/.test(label)) {
		      ruleThickness = Math.max(options.fontMetrics().fboxrule, // default
		      options.minRuleThickness // User override.
		      );
		      topPad = options.fontMetrics().fboxsep + (label === "colorbox" ? 0 : ruleThickness);
		      bottomPad = topPad;
		    } else if (label === "angl") {
		      ruleThickness = Math.max(options.fontMetrics().defaultRuleThickness, options.minRuleThickness);
		      topPad = 4 * ruleThickness; // gap = 3 × line, plus the line itself.

		      bottomPad = Math.max(0, 0.25 - inner.depth);
		    } else {
		      topPad = isSingleChar ? 0.2 : 0;
		      bottomPad = topPad;
		    }

		    img = stretchy.encloseSpan(inner, label, topPad, bottomPad, options);

		    if (/fbox|boxed|fcolorbox/.test(label)) {
		      img.style.borderStyle = "solid";
		      img.style.borderWidth = makeEm(ruleThickness);
		    } else if (label === "angl" && ruleThickness !== 0.049) {
		      img.style.borderTopWidth = makeEm(ruleThickness);
		      img.style.borderRightWidth = makeEm(ruleThickness);
		    }

		    imgShift = inner.depth + bottomPad;

		    if (group.backgroundColor) {
		      img.style.backgroundColor = group.backgroundColor;

		      if (group.borderColor) {
		        img.style.borderColor = group.borderColor;
		      }
		    }
		  }

		  var vlist;

		  if (group.backgroundColor) {
		    vlist = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: [// Put the color background behind inner;
		      {
		        type: "elem",
		        elem: img,
		        shift: imgShift
		      }, {
		        type: "elem",
		        elem: inner,
		        shift: 0
		      }]
		    }, options);
		  } else {
		    var classes = /cancel|phase/.test(label) ? ["svg-align"] : [];
		    vlist = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: [// Write the \cancel stroke on top of inner.
		      {
		        type: "elem",
		        elem: inner,
		        shift: 0
		      }, {
		        type: "elem",
		        elem: img,
		        shift: imgShift,
		        wrapperClasses: classes
		      }]
		    }, options);
		  }

		  if (/cancel/.test(label)) {
		    // The cancel package documentation says that cancel lines add their height
		    // to the expression, but tests show that isn't how it actually works.
		    vlist.height = inner.height;
		    vlist.depth = inner.depth;
		  }

		  if (/cancel/.test(label) && !isSingleChar) {
		    // cancel does not create horiz space for its line extension.
		    return buildCommon.makeSpan(["mord", "cancel-lap"], [vlist], options);
		  } else {
		    return buildCommon.makeSpan(["mord"], [vlist], options);
		  }
		};

		var enclose_mathmlBuilder = function mathmlBuilder(group, options) {
		  var fboxsep = 0;
		  var node = new mathMLTree.MathNode(group.label.indexOf("colorbox") > -1 ? "mpadded" : "menclose", [buildMathML_buildGroup(group.body, options)]);

		  switch (group.label) {
		    case "\\cancel":
		      node.setAttribute("notation", "updiagonalstrike");
		      break;

		    case "\\bcancel":
		      node.setAttribute("notation", "downdiagonalstrike");
		      break;

		    case "\\phase":
		      node.setAttribute("notation", "phasorangle");
		      break;

		    case "\\sout":
		      node.setAttribute("notation", "horizontalstrike");
		      break;

		    case "\\fbox":
		      node.setAttribute("notation", "box");
		      break;

		    case "\\angl":
		      node.setAttribute("notation", "actuarial");
		      break;

		    case "\\fcolorbox":
		    case "\\colorbox":
		      // <menclose> doesn't have a good notation option. So use <mpadded>
		      // instead. Set some attributes that come included with <menclose>.
		      fboxsep = options.fontMetrics().fboxsep * options.fontMetrics().ptPerEm;
		      node.setAttribute("width", "+" + 2 * fboxsep + "pt");
		      node.setAttribute("height", "+" + 2 * fboxsep + "pt");
		      node.setAttribute("lspace", fboxsep + "pt"); //

		      node.setAttribute("voffset", fboxsep + "pt");

		      if (group.label === "\\fcolorbox") {
		        var thk = Math.max(options.fontMetrics().fboxrule, // default
		        options.minRuleThickness // user override
		        );
		        node.setAttribute("style", "border: " + thk + "em solid " + String(group.borderColor));
		      }

		      break;

		    case "\\xcancel":
		      node.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
		      break;
		  }

		  if (group.backgroundColor) {
		    node.setAttribute("mathbackground", group.backgroundColor);
		  }

		  return node;
		};

		defineFunction({
		  type: "enclose",
		  names: ["\\colorbox"],
		  props: {
		    numArgs: 2,
		    allowedInText: true,
		    argTypes: ["color", "text"]
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var color = assertNodeType(args[0], "color-token").color;
		    var body = args[1];
		    return {
		      type: "enclose",
		      mode: parser.mode,
		      label: funcName,
		      backgroundColor: color,
		      body: body
		    };
		  },
		  htmlBuilder: enclose_htmlBuilder,
		  mathmlBuilder: enclose_mathmlBuilder
		});
		defineFunction({
		  type: "enclose",
		  names: ["\\fcolorbox"],
		  props: {
		    numArgs: 3,
		    allowedInText: true,
		    argTypes: ["color", "color", "text"]
		  },
		  handler: function handler(_ref2, args, optArgs) {
		    var parser = _ref2.parser,
		        funcName = _ref2.funcName;
		    var borderColor = assertNodeType(args[0], "color-token").color;
		    var backgroundColor = assertNodeType(args[1], "color-token").color;
		    var body = args[2];
		    return {
		      type: "enclose",
		      mode: parser.mode,
		      label: funcName,
		      backgroundColor: backgroundColor,
		      borderColor: borderColor,
		      body: body
		    };
		  },
		  htmlBuilder: enclose_htmlBuilder,
		  mathmlBuilder: enclose_mathmlBuilder
		});
		defineFunction({
		  type: "enclose",
		  names: ["\\fbox"],
		  props: {
		    numArgs: 1,
		    argTypes: ["hbox"],
		    allowedInText: true
		  },
		  handler: function handler(_ref3, args) {
		    var parser = _ref3.parser;
		    return {
		      type: "enclose",
		      mode: parser.mode,
		      label: "\\fbox",
		      body: args[0]
		    };
		  }
		});
		defineFunction({
		  type: "enclose",
		  names: ["\\cancel", "\\bcancel", "\\xcancel", "\\sout", "\\phase"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref4, args) {
		    var parser = _ref4.parser,
		        funcName = _ref4.funcName;
		    var body = args[0];
		    return {
		      type: "enclose",
		      mode: parser.mode,
		      label: funcName,
		      body: body
		    };
		  },
		  htmlBuilder: enclose_htmlBuilder,
		  mathmlBuilder: enclose_mathmlBuilder
		});
		defineFunction({
		  type: "enclose",
		  names: ["\\angl"],
		  props: {
		    numArgs: 1,
		    argTypes: ["hbox"],
		    allowedInText: false
		  },
		  handler: function handler(_ref5, args) {
		    var parser = _ref5.parser;
		    return {
		      type: "enclose",
		      mode: parser.mode,
		      label: "\\angl",
		      body: args[0]
		    };
		  }
		});


		/**
		 * All registered environments.
		 * `environments.js` exports this same dictionary again and makes it public.
		 * `Parser.js` requires this dictionary via `environments.js`.
		 */
		var _environments = {};
		function defineEnvironment(_ref) {
		  var type = _ref.type,
		      names = _ref.names,
		      props = _ref.props,
		      handler = _ref.handler,
		      htmlBuilder = _ref.htmlBuilder,
		      mathmlBuilder = _ref.mathmlBuilder;
		  // Set default values of environments.
		  var data = {
		    type: type,
		    numArgs: props.numArgs || 0,
		    allowedInText: false,
		    numOptionalArgs: 0,
		    handler: handler
		  };

		  for (var i = 0; i < names.length; ++i) {
		    // TODO: The value type of _environments should be a type union of all
		    // possible `EnvSpec<>` possibilities instead of `EnvSpec<*>`, which is
		    // an existential type.
		    _environments[names[i]] = data;
		  }

		  if (htmlBuilder) {
		    _htmlGroupBuilders[type] = htmlBuilder;
		  }

		  if (mathmlBuilder) {
		    _mathmlGroupBuilders[type] = mathmlBuilder;
		  }
		}


		/**
		 * All registered global/built-in macros.
		 * `macros.js` exports this same dictionary again and makes it public.
		 * `Parser.js` requires this dictionary via `macros.js`.
		 */
		var _macros = {}; // This function might one day accept an additional argument and do more things.

		function defineMacro(name, body) {
		  _macros[name] = body;
		}
		/**
		 * Lexing or parsing positional information for error reporting.
		 * This object is immutable.
		 */
		var SourceLocation = /*#__PURE__*/function () {
		  // The + prefix indicates that these fields aren't writeable
		  // Lexer holding the input string.
		  // Start offset, zero-based inclusive.
		  // End offset, zero-based exclusive.
		  function SourceLocation(lexer, start, end) {
		    this.lexer = void 0;
		    this.start = void 0;
		    this.end = void 0;
		    this.lexer = lexer;
		    this.start = start;
		    this.end = end;
		  }
		  /**
		   * Merges two `SourceLocation`s from location providers, given they are
		   * provided in order of appearance.
		   * - Returns the first one's location if only the first is provided.
		   * - Returns a merged range of the first and the last if both are provided
		   *   and their lexers match.
		   * - Otherwise, returns null.
		   */


		  SourceLocation.range = function range(first, second) {
		    if (!second) {
		      return first && first.loc;
		    } else if (!first || !first.loc || !second.loc || first.loc.lexer !== second.loc.lexer) {
		      return null;
		    } else {
		      return new SourceLocation(first.loc.lexer, first.loc.start, second.loc.end);
		    }
		  };

		  return SourceLocation;
		}();

		/**
		 * Interface required to break circular dependency between Token, Lexer, and
		 * ParseError.
		 */

		/**
		 * The resulting token returned from `lex`.
		 *
		 * It consists of the token text plus some position information.
		 * The position information is essentially a range in an input string,
		 * but instead of referencing the bare input string, we refer to the lexer.
		 * That way it is possible to attach extra metadata to the input string,
		 * like for example a file name or similar.
		 *
		 * The position information is optional, so it is OK to construct synthetic
		 * tokens if appropriate. Not providing available position information may
		 * lead to degraded error reporting, though.
		 */
		var Token = /*#__PURE__*/function () {
		  // don't expand the token
		  // used in \noexpand
		  function Token(text, // the text of this token
		  loc) {
		    this.text = void 0;
		    this.loc = void 0;
		    this.noexpand = void 0;
		    this.treatAsRelax = void 0;
		    this.text = text;
		    this.loc = loc;
		  }
		  /**
		   * Given a pair of tokens (this and endToken), compute a `Token` encompassing
		   * the whole input range enclosed by these two.
		   */


		  var _proto = Token.prototype;

		  _proto.range = function range(endToken, // last token of the range, inclusive
		  text // the text of the newly constructed token
		  ) {
		    return new Token(text, SourceLocation.range(this, endToken));
		  };

		  return Token;
		}();
















		// Helper functions
		function getHLines(parser) {
		  // Return an array. The array length = number of hlines.
		  // Each element in the array tells if the line is dashed.
		  var hlineInfo = [];
		  parser.consumeSpaces();
		  var nxt = parser.fetch().text;

		  if (nxt === "\\relax") {
		    // \relax is an artifact of the \cr macro below
		    parser.consume();
		    parser.consumeSpaces();
		    nxt = parser.fetch().text;
		  }

		  while (nxt === "\\hline" || nxt === "\\hdashline") {
		    parser.consume();
		    hlineInfo.push(nxt === "\\hdashline");
		    parser.consumeSpaces();
		    nxt = parser.fetch().text;
		  }

		  return hlineInfo;
		}

		var validateAmsEnvironmentContext = function validateAmsEnvironmentContext(context) {
		  var settings = context.parser.settings;

		  if (!settings.displayMode) {
		    throw new src_ParseError("{" + context.envName + "} can be used only in" + " display mode.");
		  }
		}; // autoTag (an argument to parseArray) can be one of three values:
		// * undefined: Regular (not-top-level) array; no tags on each row
		// * true: Automatic equation numbering, overridable by \tag
		// * false: Tags allowed on each row, but no automatic numbering
		// This function *doesn't* work with the "split" environment name.


		function getAutoTag(name) {
		  if (name.indexOf("ed") === -1) {
		    return name.indexOf("*") === -1;
		  } // return undefined;

		}
		/**
		 * Parse the body of the environment, with rows delimited by \\ and
		 * columns delimited by &, and create a nested list in row-major order
		 * with one group per cell.  If given an optional argument style
		 * ("text", "display", etc.), then each cell is cast into that style.
		 */


		function parseArray(parser, _ref, style) {
		  var hskipBeforeAndAfter = _ref.hskipBeforeAndAfter,
		      addJot = _ref.addJot,
		      cols = _ref.cols,
		      arraystretch = _ref.arraystretch,
		      colSeparationType = _ref.colSeparationType,
		      autoTag = _ref.autoTag,
		      singleRow = _ref.singleRow,
		      emptySingleRow = _ref.emptySingleRow,
		      maxNumCols = _ref.maxNumCols,
		      leqno = _ref.leqno;
		  parser.gullet.beginGroup();

		  if (!singleRow) {
		    // \cr is equivalent to \\ without the optional size argument (see below)
		    // TODO: provide helpful error when \cr is used outside array environment
		    parser.gullet.macros.set("\\cr", "\\\\\\relax");
		  } // Get current arraystretch if it's not set by the environment


		  if (!arraystretch) {
		    var stretch = parser.gullet.expandMacroAsText("\\arraystretch");

		    if (stretch == null) {
		      // Default \arraystretch from lttab.dtx
		      arraystretch = 1;
		    } else {
		      arraystretch = parseFloat(stretch);

		      if (!arraystretch || arraystretch < 0) {
		        throw new src_ParseError("Invalid \\arraystretch: " + stretch);
		      }
		    }
		  } // Start group for first cell


		  parser.gullet.beginGroup();
		  var row = [];
		  var body = [row];
		  var rowGaps = [];
		  var hLinesBeforeRow = [];
		  var tags = autoTag != null ? [] : undefined; // amsmath uses \global\@eqnswtrue and \global\@eqnswfalse to represent
		  // whether this row should have an equation number.  Simulate this with
		  // a \@eqnsw macro set to 1 or 0.

		  function beginRow() {
		    if (autoTag) {
		      parser.gullet.macros.set("\\@eqnsw", "1", true);
		    }
		  }

		  function endRow() {
		    if (tags) {
		      if (parser.gullet.macros.get("\\df@tag")) {
		        tags.push(parser.subparse([new Token("\\df@tag")]));
		        parser.gullet.macros.set("\\df@tag", undefined, true);
		      } else {
		        tags.push(Boolean(autoTag) && parser.gullet.macros.get("\\@eqnsw") === "1");
		      }
		    }
		  }

		  beginRow(); // Test for \hline at the top of the array.

		  hLinesBeforeRow.push(getHLines(parser));

		  while (true) {
		    // eslint-disable-line no-constant-condition
		    // Parse each cell in its own group (namespace)
		    var cell = parser.parseExpression(false, singleRow ? "\\end" : "\\\\");
		    parser.gullet.endGroup();
		    parser.gullet.beginGroup();
		    cell = {
		      type: "ordgroup",
		      mode: parser.mode,
		      body: cell
		    };

		    if (style) {
		      cell = {
		        type: "styling",
		        mode: parser.mode,
		        style: style,
		        body: [cell]
		      };
		    }

		    row.push(cell);
		    var next = parser.fetch().text;

		    if (next === "&") {
		      if (maxNumCols && row.length === maxNumCols) {
		        if (singleRow || colSeparationType) {
		          // {equation} or {split}
		          throw new src_ParseError("Too many tab characters: &", parser.nextToken);
		        } else {
		          // {array} environment
		          parser.settings.reportNonstrict("textEnv", "Too few columns " + "specified in the {array} column argument.");
		        }
		      }

		      parser.consume();
		    } else if (next === "\\end") {
		      endRow(); // Arrays terminate newlines with `\crcr` which consumes a `\cr` if
		      // the last line is empty.  However, AMS environments keep the
		      // empty row if it's the only one.
		      // NOTE: Currently, `cell` is the last item added into `row`.

		      if (row.length === 1 && cell.type === "styling" && cell.body[0].body.length === 0 && (body.length > 1 || !emptySingleRow)) {
		        body.pop();
		      }

		      if (hLinesBeforeRow.length < body.length + 1) {
		        hLinesBeforeRow.push([]);
		      }

		      break;
		    } else if (next === "\\\\") {
		      parser.consume();
		      var size = void 0; // \def\Let@{\let\\\math@cr}
		      // \def\math@cr{...\math@cr@}
		      // \def\math@cr@{\new@ifnextchar[\math@cr@@{\math@cr@@[\z@]}}
		      // \def\math@cr@@[#1]{...\math@cr@@@...}
		      // \def\math@cr@@@{\cr}

		      if (parser.gullet.future().text !== " ") {
		        size = parser.parseSizeGroup(true);
		      }

		      rowGaps.push(size ? size.value : null);
		      endRow(); // check for \hline(s) following the row separator

		      hLinesBeforeRow.push(getHLines(parser));
		      row = [];
		      body.push(row);
		      beginRow();
		    } else {
		      throw new src_ParseError("Expected & or \\\\ or \\cr or \\end", parser.nextToken);
		    }
		  } // End cell group


		  parser.gullet.endGroup(); // End array group defining \cr

		  parser.gullet.endGroup();
		  return {
		    type: "array",
		    mode: parser.mode,
		    addJot: addJot,
		    arraystretch: arraystretch,
		    body: body,
		    cols: cols,
		    rowGaps: rowGaps,
		    hskipBeforeAndAfter: hskipBeforeAndAfter,
		    hLinesBeforeRow: hLinesBeforeRow,
		    colSeparationType: colSeparationType,
		    tags: tags,
		    leqno: leqno
		  };
		} // Decides on a style for cells in an array according to whether the given
		// environment name starts with the letter 'd'.


		function dCellStyle(envName) {
		  if (envName.slice(0, 1) === "d") {
		    return "display";
		  } else {
		    return "text";
		  }
		}

		var array_htmlBuilder = function htmlBuilder(group, options) {
		  var r;
		  var c;
		  var nr = group.body.length;
		  var hLinesBeforeRow = group.hLinesBeforeRow;
		  var nc = 0;
		  var body = new Array(nr);
		  var hlines = [];
		  var ruleThickness = Math.max( // From LaTeX \showthe\arrayrulewidth. Equals 0.04 em.
		  options.fontMetrics().arrayRuleWidth, options.minRuleThickness // User override.
		  ); // Horizontal spacing

		  var pt = 1 / options.fontMetrics().ptPerEm;
		  var arraycolsep = 5 * pt; // default value, i.e. \arraycolsep in article.cls

		  if (group.colSeparationType && group.colSeparationType === "small") {
		    // We're in a {smallmatrix}. Default column space is \thickspace,
		    // i.e. 5/18em = 0.2778em, per amsmath.dtx for {smallmatrix}.
		    // But that needs adjustment because LaTeX applies \scriptstyle to the
		    // entire array, including the colspace, but this function applies
		    // \scriptstyle only inside each element.
		    var localMultiplier = options.havingStyle(src_Style.SCRIPT).sizeMultiplier;
		    arraycolsep = 0.2778 * (localMultiplier / options.sizeMultiplier);
		  } // Vertical spacing


		  var baselineskip = group.colSeparationType === "CD" ? calculateSize({
		    number: 3,
		    unit: "ex"
		  }, options) : 12 * pt; // see size10.clo
		  // Default \jot from ltmath.dtx
		  // TODO(edemaine): allow overriding \jot via \setlength (#687)

		  var jot = 3 * pt;
		  var arrayskip = group.arraystretch * baselineskip;
		  var arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and

		  var arstrutDepth = 0.3 * arrayskip; // \@arstrutbox in lttab.dtx

		  var totalHeight = 0; // Set a position for \hline(s) at the top of the array, if any.

		  function setHLinePos(hlinesInGap) {
		    for (var i = 0; i < hlinesInGap.length; ++i) {
		      if (i > 0) {
		        totalHeight += 0.25;
		      }

		      hlines.push({
		        pos: totalHeight,
		        isDashed: hlinesInGap[i]
		      });
		    }
		  }

		  setHLinePos(hLinesBeforeRow[0]);

		  for (r = 0; r < group.body.length; ++r) {
		    var inrow = group.body[r];
		    var height = arstrutHeight; // \@array adds an \@arstrut

		    var depth = arstrutDepth; // to each tow (via the template)

		    if (nc < inrow.length) {
		      nc = inrow.length;
		    }

		    var outrow = new Array(inrow.length);

		    for (c = 0; c < inrow.length; ++c) {
		      var elt = buildGroup(inrow[c], options);

		      if (depth < elt.depth) {
		        depth = elt.depth;
		      }

		      if (height < elt.height) {
		        height = elt.height;
		      }

		      outrow[c] = elt;
		    }

		    var rowGap = group.rowGaps[r];
		    var gap = 0;

		    if (rowGap) {
		      gap = calculateSize(rowGap, options);

		      if (gap > 0) {
		        // \@argarraycr
		        gap += arstrutDepth;

		        if (depth < gap) {
		          depth = gap; // \@xargarraycr
		        }

		        gap = 0;
		      }
		    } // In AMS multiline environments such as aligned and gathered, rows
		    // correspond to lines that have additional \jot added to the
		    // \baselineskip via \openup.


		    if (group.addJot) {
		      depth += jot;
		    }

		    outrow.height = height;
		    outrow.depth = depth;
		    totalHeight += height;
		    outrow.pos = totalHeight;
		    totalHeight += depth + gap; // \@yargarraycr

		    body[r] = outrow; // Set a position for \hline(s), if any.

		    setHLinePos(hLinesBeforeRow[r + 1]);
		  }

		  var offset = totalHeight / 2 + options.fontMetrics().axisHeight;
		  var colDescriptions = group.cols || [];
		  var cols = [];
		  var colSep;
		  var colDescrNum;
		  var tagSpans = [];

		  if (group.tags && group.tags.some(function (tag) {
		    return tag;
		  })) {
		    // An environment with manual tags and/or automatic equation numbers.
		    // Create node(s), the latter of which trigger CSS counter increment.
		    for (r = 0; r < nr; ++r) {
		      var rw = body[r];
		      var shift = rw.pos - offset;
		      var tag = group.tags[r];
		      var tagSpan = void 0;

		      if (tag === true) {
		        // automatic numbering
		        tagSpan = buildCommon.makeSpan(["eqn-num"], [], options);
		      } else if (tag === false) {
		        // \nonumber/\notag or starred environment
		        tagSpan = buildCommon.makeSpan([], [], options);
		      } else {
		        // manual \tag
		        tagSpan = buildCommon.makeSpan([], buildExpression(tag, options, true), options);
		      }

		      tagSpan.depth = rw.depth;
		      tagSpan.height = rw.height;
		      tagSpans.push({
		        type: "elem",
		        elem: tagSpan,
		        shift: shift
		      });
		    }
		  }

		  for (c = 0, colDescrNum = 0; // Continue while either there are more columns or more column
		  // descriptions, so trailing separators don't get lost.
		  c < nc || colDescrNum < colDescriptions.length; ++c, ++colDescrNum) {
		    var colDescr = colDescriptions[colDescrNum] || {};
		    var firstSeparator = true;

		    while (colDescr.type === "separator") {
		      // If there is more than one separator in a row, add a space
		      // between them.
		      if (!firstSeparator) {
		        colSep = buildCommon.makeSpan(["arraycolsep"], []);
		        colSep.style.width = makeEm(options.fontMetrics().doubleRuleSep);
		        cols.push(colSep);
		      }

		      if (colDescr.separator === "|" || colDescr.separator === ":") {
		        var lineType = colDescr.separator === "|" ? "solid" : "dashed";
		        var separator = buildCommon.makeSpan(["vertical-separator"], [], options);
		        separator.style.height = makeEm(totalHeight);
		        separator.style.borderRightWidth = makeEm(ruleThickness);
		        separator.style.borderRightStyle = lineType;
		        separator.style.margin = "0 " + makeEm(-ruleThickness / 2);

		        var _shift = totalHeight - offset;

		        if (_shift) {
		          separator.style.verticalAlign = makeEm(-_shift);
		        }

		        cols.push(separator);
		      } else {
		        throw new src_ParseError("Invalid separator type: " + colDescr.separator);
		      }

		      colDescrNum++;
		      colDescr = colDescriptions[colDescrNum] || {};
		      firstSeparator = false;
		    }

		    if (c >= nc) {
		      continue;
		    }

		    var sepwidth = void 0;

		    if (c > 0 || group.hskipBeforeAndAfter) {
		      sepwidth = utils.deflt(colDescr.pregap, arraycolsep);

		      if (sepwidth !== 0) {
		        colSep = buildCommon.makeSpan(["arraycolsep"], []);
		        colSep.style.width = makeEm(sepwidth);
		        cols.push(colSep);
		      }
		    }

		    var col = [];

		    for (r = 0; r < nr; ++r) {
		      var row = body[r];
		      var elem = row[c];

		      if (!elem) {
		        continue;
		      }

		      var _shift2 = row.pos - offset;

		      elem.depth = row.depth;
		      elem.height = row.height;
		      col.push({
		        type: "elem",
		        elem: elem,
		        shift: _shift2
		      });
		    }

		    col = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: col
		    }, options);
		    col = buildCommon.makeSpan(["col-align-" + (colDescr.align || "c")], [col]);
		    cols.push(col);

		    if (c < nc - 1 || group.hskipBeforeAndAfter) {
		      sepwidth = utils.deflt(colDescr.postgap, arraycolsep);

		      if (sepwidth !== 0) {
		        colSep = buildCommon.makeSpan(["arraycolsep"], []);
		        colSep.style.width = makeEm(sepwidth);
		        cols.push(colSep);
		      }
		    }
		  }

		  body = buildCommon.makeSpan(["mtable"], cols); // Add \hline(s), if any.

		  if (hlines.length > 0) {
		    var line = buildCommon.makeLineSpan("hline", options, ruleThickness);
		    var dashes = buildCommon.makeLineSpan("hdashline", options, ruleThickness);
		    var vListElems = [{
		      type: "elem",
		      elem: body,
		      shift: 0
		    }];

		    while (hlines.length > 0) {
		      var hline = hlines.pop();
		      var lineShift = hline.pos - offset;

		      if (hline.isDashed) {
		        vListElems.push({
		          type: "elem",
		          elem: dashes,
		          shift: lineShift
		        });
		      } else {
		        vListElems.push({
		          type: "elem",
		          elem: line,
		          shift: lineShift
		        });
		      }
		    }

		    body = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: vListElems
		    }, options);
		  }

		  if (tagSpans.length === 0) {
		    return buildCommon.makeSpan(["mord"], [body], options);
		  } else {
		    var eqnNumCol = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: tagSpans
		    }, options);
		    eqnNumCol = buildCommon.makeSpan(["tag"], [eqnNumCol], options);
		    return buildCommon.makeFragment([body, eqnNumCol]);
		  }
		};

		var alignMap = {
		  c: "center ",
		  l: "left ",
		  r: "right "
		};

		var array_mathmlBuilder = function mathmlBuilder(group, options) {
		  var tbl = [];
		  var glue = new mathMLTree.MathNode("mtd", [], ["mtr-glue"]);
		  var tag = new mathMLTree.MathNode("mtd", [], ["mml-eqn-num"]);

		  for (var i = 0; i < group.body.length; i++) {
		    var rw = group.body[i];
		    var row = [];

		    for (var j = 0; j < rw.length; j++) {
		      row.push(new mathMLTree.MathNode("mtd", [buildMathML_buildGroup(rw[j], options)]));
		    }

		    if (group.tags && group.tags[i]) {
		      row.unshift(glue);
		      row.push(glue);

		      if (group.leqno) {
		        row.unshift(tag);
		      } else {
		        row.push(tag);
		      }
		    }

		    tbl.push(new mathMLTree.MathNode("mtr", row));
		  }

		  var table = new mathMLTree.MathNode("mtable", tbl); // Set column alignment, row spacing, column spacing, and
		  // array lines by setting attributes on the table element.
		  // Set the row spacing. In MathML, we specify a gap distance.
		  // We do not use rowGap[] because MathML automatically increases
		  // cell height with the height/depth of the element content.
		  // LaTeX \arraystretch multiplies the row baseline-to-baseline distance.
		  // We simulate this by adding (arraystretch - 1)em to the gap. This
		  // does a reasonable job of adjusting arrays containing 1 em tall content.
		  // The 0.16 and 0.09 values are found empirically. They produce an array
		  // similar to LaTeX and in which content does not interfere with \hlines.

		  var gap = group.arraystretch === 0.5 ? 0.1 // {smallmatrix}, {subarray}
		  : 0.16 + group.arraystretch - 1 + (group.addJot ? 0.09 : 0);
		  table.setAttribute("rowspacing", makeEm(gap)); // MathML table lines go only between cells.
		  // To place a line on an edge we'll use <menclose>, if necessary.

		  var menclose = "";
		  var align = "";

		  if (group.cols && group.cols.length > 0) {
		    // Find column alignment, column spacing, and  vertical lines.
		    var cols = group.cols;
		    var columnLines = "";
		    var prevTypeWasAlign = false;
		    var iStart = 0;
		    var iEnd = cols.length;

		    if (cols[0].type === "separator") {
		      menclose += "top ";
		      iStart = 1;
		    }

		    if (cols[cols.length - 1].type === "separator") {
		      menclose += "bottom ";
		      iEnd -= 1;
		    }

		    for (var _i = iStart; _i < iEnd; _i++) {
		      if (cols[_i].type === "align") {
		        align += alignMap[cols[_i].align];

		        if (prevTypeWasAlign) {
		          columnLines += "none ";
		        }

		        prevTypeWasAlign = true;
		      } else if (cols[_i].type === "separator") {
		        // MathML accepts only single lines between cells.
		        // So we read only the first of consecutive separators.
		        if (prevTypeWasAlign) {
		          columnLines += cols[_i].separator === "|" ? "solid " : "dashed ";
		          prevTypeWasAlign = false;
		        }
		      }
		    }

		    table.setAttribute("columnalign", align.trim());

		    if (/[sd]/.test(columnLines)) {
		      table.setAttribute("columnlines", columnLines.trim());
		    }
		  } // Set column spacing.


		  if (group.colSeparationType === "align") {
		    var _cols = group.cols || [];

		    var spacing = "";

		    for (var _i2 = 1; _i2 < _cols.length; _i2++) {
		      spacing += _i2 % 2 ? "0em " : "1em ";
		    }

		    table.setAttribute("columnspacing", spacing.trim());
		  } else if (group.colSeparationType === "alignat" || group.colSeparationType === "gather") {
		    table.setAttribute("columnspacing", "0em");
		  } else if (group.colSeparationType === "small") {
		    table.setAttribute("columnspacing", "0.2778em");
		  } else if (group.colSeparationType === "CD") {
		    table.setAttribute("columnspacing", "0.5em");
		  } else {
		    table.setAttribute("columnspacing", "1em");
		  } // Address \hline and \hdashline


		  var rowLines = "";
		  var hlines = group.hLinesBeforeRow;
		  menclose += hlines[0].length > 0 ? "left " : "";
		  menclose += hlines[hlines.length - 1].length > 0 ? "right " : "";

		  for (var _i3 = 1; _i3 < hlines.length - 1; _i3++) {
		    rowLines += hlines[_i3].length === 0 ? "none " // MathML accepts only a single line between rows. Read one element.
		    : hlines[_i3][0] ? "dashed " : "solid ";
		  }

		  if (/[sd]/.test(rowLines)) {
		    table.setAttribute("rowlines", rowLines.trim());
		  }

		  if (menclose !== "") {
		    table = new mathMLTree.MathNode("menclose", [table]);
		    table.setAttribute("notation", menclose.trim());
		  }

		  if (group.arraystretch && group.arraystretch < 1) {
		    // A small array. Wrap in scriptstyle so row gap is not too large.
		    table = new mathMLTree.MathNode("mstyle", [table]);
		    table.setAttribute("scriptlevel", "1");
		  }

		  return table;
		}; // Convenience function for align, align*, aligned, alignat, alignat*, alignedat.


		var alignedHandler = function alignedHandler(context, args) {
		  if (context.envName.indexOf("ed") === -1) {
		    validateAmsEnvironmentContext(context);
		  }

		  var cols = [];
		  var separationType = context.envName.indexOf("at") > -1 ? "alignat" : "align";
		  var isSplit = context.envName === "split";
		  var res = parseArray(context.parser, {
		    cols: cols,
		    addJot: true,
		    autoTag: isSplit ? undefined : getAutoTag(context.envName),
		    emptySingleRow: true,
		    colSeparationType: separationType,
		    maxNumCols: isSplit ? 2 : undefined,
		    leqno: context.parser.settings.leqno
		  }, "display"); // Determining number of columns.
		  // 1. If the first argument is given, we use it as a number of columns,
		  //    and makes sure that each row doesn't exceed that number.
		  // 2. Otherwise, just count number of columns = maximum number
		  //    of cells in each row ("aligned" mode -- isAligned will be true).
		  //
		  // At the same time, prepend empty group {} at beginning of every second
		  // cell in each row (starting with second cell) so that operators become
		  // binary.  This behavior is implemented in amsmath's \start@aligned.

		  var numMaths;
		  var numCols = 0;
		  var emptyGroup = {
		    type: "ordgroup",
		    mode: context.mode,
		    body: []
		  };

		  if (args[0] && args[0].type === "ordgroup") {
		    var arg0 = "";

		    for (var i = 0; i < args[0].body.length; i++) {
		      var textord = assertNodeType(args[0].body[i], "textord");
		      arg0 += textord.text;
		    }

		    numMaths = Number(arg0);
		    numCols = numMaths * 2;
		  }

		  var isAligned = !numCols;
		  res.body.forEach(function (row) {
		    for (var _i4 = 1; _i4 < row.length; _i4 += 2) {
		      // Modify ordgroup node within styling node
		      var styling = assertNodeType(row[_i4], "styling");
		      var ordgroup = assertNodeType(styling.body[0], "ordgroup");
		      ordgroup.body.unshift(emptyGroup);
		    }

		    if (!isAligned) {
		      // Case 1
		      var curMaths = row.length / 2;

		      if (numMaths < curMaths) {
		        throw new src_ParseError("Too many math in a row: " + ("expected " + numMaths + ", but got " + curMaths), row[0]);
		      }
		    } else if (numCols < row.length) {
		      // Case 2
		      numCols = row.length;
		    }
		  }); // Adjusting alignment.
		  // In aligned mode, we add one \qquad between columns;
		  // otherwise we add nothing.

		  for (var _i5 = 0; _i5 < numCols; ++_i5) {
		    var align = "r";
		    var pregap = 0;

		    if (_i5 % 2 === 1) {
		      align = "l";
		    } else if (_i5 > 0 && isAligned) {
		      // "aligned" mode.
		      pregap = 1; // add one \quad
		    }

		    cols[_i5] = {
		      type: "align",
		      align: align,
		      pregap: pregap,
		      postgap: 0
		    };
		  }

		  res.colSeparationType = isAligned ? "align" : "alignat";
		  return res;
		}; // Arrays are part of LaTeX, defined in lttab.dtx so its documentation
		// is part of the source2e.pdf file of LaTeX2e source documentation.
		// {darray} is an {array} environment where cells are set in \displaystyle,
		// as defined in nccmath.sty.


		defineEnvironment({
		  type: "array",
		  names: ["array", "darray"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(context, args) {
		    // Since no types are specified above, the two possibilities are
		    // - The argument is wrapped in {} or [], in which case Parser's
		    //   parseGroup() returns an "ordgroup" wrapping some symbol node.
		    // - The argument is a bare symbol node.
		    var symNode = checkSymbolNodeType(args[0]);
		    var colalign = symNode ? [args[0]] : assertNodeType(args[0], "ordgroup").body;
		    var cols = colalign.map(function (nde) {
		      var node = assertSymbolNodeType(nde);
		      var ca = node.text;

		      if ("lcr".indexOf(ca) !== -1) {
		        return {
		          type: "align",
		          align: ca
		        };
		      } else if (ca === "|") {
		        return {
		          type: "separator",
		          separator: "|"
		        };
		      } else if (ca === ":") {
		        return {
		          type: "separator",
		          separator: ":"
		        };
		      }

		      throw new src_ParseError("Unknown column alignment: " + ca, nde);
		    });
		    var res = {
		      cols: cols,
		      hskipBeforeAndAfter: true,
		      // \@preamble in lttab.dtx
		      maxNumCols: cols.length
		    };
		    return parseArray(context.parser, res, dCellStyle(context.envName));
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		}); // The matrix environments of amsmath builds on the array environment
		// of LaTeX, which is discussed above.
		// The mathtools package adds starred versions of the same environments.
		// These have an optional argument to choose left|center|right justification.

		defineEnvironment({
		  type: "array",
		  names: ["matrix", "pmatrix", "bmatrix", "Bmatrix", "vmatrix", "Vmatrix", "matrix*", "pmatrix*", "bmatrix*", "Bmatrix*", "vmatrix*", "Vmatrix*"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    var delimiters = {
		      "matrix": null,
		      "pmatrix": ["(", ")"],
		      "bmatrix": ["[", "]"],
		      "Bmatrix": ["\\{", "\\}"],
		      "vmatrix": ["|", "|"],
		      "Vmatrix": ["\\Vert", "\\Vert"]
		    }[context.envName.replace("*", "")]; // \hskip -\arraycolsep in amsmath

		    var colAlign = "c";
		    var payload = {
		      hskipBeforeAndAfter: false,
		      cols: [{
		        type: "align",
		        align: colAlign
		      }]
		    };

		    if (context.envName.charAt(context.envName.length - 1) === "*") {
		      // It's one of the mathtools starred functions.
		      // Parse the optional alignment argument.
		      var parser = context.parser;
		      parser.consumeSpaces();

		      if (parser.fetch().text === "[") {
		        parser.consume();
		        parser.consumeSpaces();
		        colAlign = parser.fetch().text;

		        if ("lcr".indexOf(colAlign) === -1) {
		          throw new src_ParseError("Expected l or c or r", parser.nextToken);
		        }

		        parser.consume();
		        parser.consumeSpaces();
		        parser.expect("]");
		        parser.consume();
		        payload.cols = [{
		          type: "align",
		          align: colAlign
		        }];
		      }
		    }

		    var res = parseArray(context.parser, payload, dCellStyle(context.envName)); // Populate cols with the correct number of column alignment specs.

		    var numCols = Math.max.apply(Math, [0].concat(res.body.map(function (row) {
		      return row.length;
		    })));
		    res.cols = new Array(numCols).fill({
		      type: "align",
		      align: colAlign
		    });
		    return delimiters ? {
		      type: "leftright",
		      mode: context.mode,
		      body: [res],
		      left: delimiters[0],
		      right: delimiters[1],
		      rightColor: undefined // \right uninfluenced by \color in array

		    } : res;
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		});
		defineEnvironment({
		  type: "array",
		  names: ["smallmatrix"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    var payload = {
		      arraystretch: 0.5
		    };
		    var res = parseArray(context.parser, payload, "script");
		    res.colSeparationType = "small";
		    return res;
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		});
		defineEnvironment({
		  type: "array",
		  names: ["subarray"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(context, args) {
		    // Parsing of {subarray} is similar to {array}
		    var symNode = checkSymbolNodeType(args[0]);
		    var colalign = symNode ? [args[0]] : assertNodeType(args[0], "ordgroup").body;
		    var cols = colalign.map(function (nde) {
		      var node = assertSymbolNodeType(nde);
		      var ca = node.text; // {subarray} only recognizes "l" & "c"

		      if ("lc".indexOf(ca) !== -1) {
		        return {
		          type: "align",
		          align: ca
		        };
		      }

		      throw new src_ParseError("Unknown column alignment: " + ca, nde);
		    });

		    if (cols.length > 1) {
		      throw new src_ParseError("{subarray} can contain only one column");
		    }

		    var res = {
		      cols: cols,
		      hskipBeforeAndAfter: false,
		      arraystretch: 0.5
		    };
		    res = parseArray(context.parser, res, "script");

		    if (res.body.length > 0 && res.body[0].length > 1) {
		      throw new src_ParseError("{subarray} can contain only one column");
		    }

		    return res;
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		}); // A cases environment (in amsmath.sty) is almost equivalent to
		// \def\arraystretch{1.2}%
		// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
		// {dcases} is a {cases} environment where cells are set in \displaystyle,
		// as defined in mathtools.sty.
		// {rcases} is another mathtools environment. It's brace is on the right side.

		defineEnvironment({
		  type: "array",
		  names: ["cases", "dcases", "rcases", "drcases"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    var payload = {
		      arraystretch: 1.2,
		      cols: [{
		        type: "align",
		        align: "l",
		        pregap: 0,
		        // TODO(kevinb) get the current style.
		        // For now we use the metrics for TEXT style which is what we were
		        // doing before.  Before attempting to get the current style we
		        // should look at TeX's behavior especially for \over and matrices.
		        postgap: 1.0
		        /* 1em quad */

		      }, {
		        type: "align",
		        align: "l",
		        pregap: 0,
		        postgap: 0
		      }]
		    };
		    var res = parseArray(context.parser, payload, dCellStyle(context.envName));
		    return {
		      type: "leftright",
		      mode: context.mode,
		      body: [res],
		      left: context.envName.indexOf("r") > -1 ? "." : "\\{",
		      right: context.envName.indexOf("r") > -1 ? "\\}" : ".",
		      rightColor: undefined
		    };
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		}); // In the align environment, one uses ampersands, &, to specify number of
		// columns in each row, and to locate spacing between each column.
		// align gets automatic numbering. align* and aligned do not.
		// The alignedat environment can be used in math mode.
		// Note that we assume \nomallineskiplimit to be zero,
		// so that \strut@ is the same as \strut.

		defineEnvironment({
		  type: "array",
		  names: ["align", "align*", "aligned", "split"],
		  props: {
		    numArgs: 0
		  },
		  handler: alignedHandler,
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		}); // A gathered environment is like an array environment with one centered
		// column, but where rows are considered lines so get \jot line spacing
		// and contents are set in \displaystyle.

		defineEnvironment({
		  type: "array",
		  names: ["gathered", "gather", "gather*"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    if (utils.contains(["gather", "gather*"], context.envName)) {
		      validateAmsEnvironmentContext(context);
		    }

		    var res = {
		      cols: [{
		        type: "align",
		        align: "c"
		      }],
		      addJot: true,
		      colSeparationType: "gather",
		      autoTag: getAutoTag(context.envName),
		      emptySingleRow: true,
		      leqno: context.parser.settings.leqno
		    };
		    return parseArray(context.parser, res, "display");
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		}); // alignat environment is like an align environment, but one must explicitly
		// specify maximum number of columns in each row, and can adjust spacing between
		// each columns.

		defineEnvironment({
		  type: "array",
		  names: ["alignat", "alignat*", "alignedat"],
		  props: {
		    numArgs: 1
		  },
		  handler: alignedHandler,
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		});
		defineEnvironment({
		  type: "array",
		  names: ["equation", "equation*"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    validateAmsEnvironmentContext(context);
		    var res = {
		      autoTag: getAutoTag(context.envName),
		      emptySingleRow: true,
		      singleRow: true,
		      maxNumCols: 1,
		      leqno: context.parser.settings.leqno
		    };
		    return parseArray(context.parser, res, "display");
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		});
		defineEnvironment({
		  type: "array",
		  names: ["CD"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(context) {
		    validateAmsEnvironmentContext(context);
		    return parseCD(context.parser);
		  },
		  htmlBuilder: array_htmlBuilder,
		  mathmlBuilder: array_mathmlBuilder
		});
		defineMacro("\\nonumber", "\\gdef\\@eqnsw{0}");
		defineMacro("\\notag", "\\nonumber"); // Catch \hline outside array environment

		defineFunction({
		  type: "text",
		  // Doesn't matter what this is.
		  names: ["\\hline", "\\hdashline"],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    allowedInMath: true
		  },
		  handler: function handler(context, args) {
		    throw new src_ParseError(context.funcName + " valid only within array environment");
		  }
		});

		var environments = _environments;
		/* harmony default export */ var src_environments = (environments); // All environment definitions should be imported below



		 // Environment delimiters. HTML/MathML rendering is defined in the corresponding
		// defineEnvironment definitions.

		defineFunction({
		  type: "environment",
		  names: ["\\begin", "\\end"],
		  props: {
		    numArgs: 1,
		    argTypes: ["text"]
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var nameGroup = args[0];

		    if (nameGroup.type !== "ordgroup") {
		      throw new src_ParseError("Invalid environment name", nameGroup);
		    }

		    var envName = "";

		    for (var i = 0; i < nameGroup.body.length; ++i) {
		      envName += assertNodeType(nameGroup.body[i], "textord").text;
		    }

		    if (funcName === "\\begin") {
		      // begin...end is similar to left...right
		      if (!src_environments.hasOwnProperty(envName)) {
		        throw new src_ParseError("No such environment: " + envName, nameGroup);
		      } // Build the environment object. Arguments and other information will
		      // be made available to the begin and end methods using properties.


		      var env = src_environments[envName];

		      var _parser$parseArgument = parser.parseArguments("\\begin{" + envName + "}", env),
		          _args = _parser$parseArgument.args,
		          optArgs = _parser$parseArgument.optArgs;

		      var context = {
		        mode: parser.mode,
		        envName: envName,
		        parser: parser
		      };
		      var result = env.handler(context, _args, optArgs);
		      parser.expect("\\end", false);
		      var endNameToken = parser.nextToken;
		      var end = assertNodeType(parser.parseFunction(), "environment");

		      if (end.name !== envName) {
		        throw new src_ParseError("Mismatch: \\begin{" + envName + "} matched by \\end{" + end.name + "}", endNameToken);
		      } // $FlowFixMe, "environment" handler returns an environment ParseNode


		      return result;
		    }

		    return {
		      type: "environment",
		      mode: parser.mode,
		      name: envName,
		      nameGroup: nameGroup
		    };
		  }
		});
		// TODO(kevinb): implement \\sl and \\sc






		var font_htmlBuilder = function htmlBuilder(group, options) {
		  var font = group.font;
		  var newOptions = options.withFont(font);
		  return buildGroup(group.body, newOptions);
		};

		var font_mathmlBuilder = function mathmlBuilder(group, options) {
		  var font = group.font;
		  var newOptions = options.withFont(font);
		  return buildMathML_buildGroup(group.body, newOptions);
		};

		var fontAliases = {
		  "\\Bbb": "\\mathbb",
		  "\\bold": "\\mathbf",
		  "\\frak": "\\mathfrak",
		  "\\bm": "\\boldsymbol"
		};
		defineFunction({
		  type: "font",
		  names: [// styles, except \boldsymbol defined below
		  "\\mathrm", "\\mathit", "\\mathbf", "\\mathnormal", // families
		  "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf", "\\mathtt", // aliases, except \bm defined below
		  "\\Bbb", "\\bold", "\\frak"],
		  props: {
		    numArgs: 1,
		    allowedInArgument: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var body = normalizeArgument(args[0]);
		    var func = funcName;

		    if (func in fontAliases) {
		      func = fontAliases[func];
		    }

		    return {
		      type: "font",
		      mode: parser.mode,
		      font: func.slice(1),
		      body: body
		    };
		  },
		  htmlBuilder: font_htmlBuilder,
		  mathmlBuilder: font_mathmlBuilder
		});
		defineFunction({
		  type: "mclass",
		  names: ["\\boldsymbol", "\\bm"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    var body = args[0];
		    var isCharacterBox = utils.isCharacterBox(body); // amsbsy.sty's \boldsymbol uses \binrel spacing to inherit the
		    // argument's bin|rel|ord status

		    return {
		      type: "mclass",
		      mode: parser.mode,
		      mclass: binrelClass(body),
		      body: [{
		        type: "font",
		        mode: parser.mode,
		        font: "boldsymbol",
		        body: body
		      }],
		      isCharacterBox: isCharacterBox
		    };
		  }
		}); // Old font changing functions

		defineFunction({
		  type: "font",
		  names: ["\\rm", "\\sf", "\\tt", "\\bf", "\\it", "\\cal"],
		  props: {
		    numArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(_ref3, args) {
		    var parser = _ref3.parser,
		        funcName = _ref3.funcName,
		        breakOnTokenText = _ref3.breakOnTokenText;
		    var mode = parser.mode;
		    var body = parser.parseExpression(true, breakOnTokenText);
		    var style = "math" + funcName.slice(1);
		    return {
		      type: "font",
		      mode: mode,
		      font: style,
		      body: {
		        type: "ordgroup",
		        mode: parser.mode,
		        body: body
		      }
		    };
		  },
		  htmlBuilder: font_htmlBuilder,
		  mathmlBuilder: font_mathmlBuilder
		});











		var adjustStyle = function adjustStyle(size, originalStyle) {
		  // Figure out what style this fraction should be in based on the
		  // function used
		  var style = originalStyle;

		  if (size === "display") {
		    // Get display style as a default.
		    // If incoming style is sub/sup, use style.text() to get correct size.
		    style = style.id >= src_Style.SCRIPT.id ? style.text() : src_Style.DISPLAY;
		  } else if (size === "text" && style.size === src_Style.DISPLAY.size) {
		    // We're in a \tfrac but incoming style is displaystyle, so:
		    style = src_Style.TEXT;
		  } else if (size === "script") {
		    style = src_Style.SCRIPT;
		  } else if (size === "scriptscript") {
		    style = src_Style.SCRIPTSCRIPT;
		  }

		  return style;
		};

		var genfrac_htmlBuilder = function htmlBuilder(group, options) {
		  // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
		  var style = adjustStyle(group.size, options.style);
		  var nstyle = style.fracNum();
		  var dstyle = style.fracDen();
		  var newOptions;
		  newOptions = options.havingStyle(nstyle);
		  var numerm = buildGroup(group.numer, newOptions, options);

		  if (group.continued) {
		    // \cfrac inserts a \strut into the numerator.
		    // Get \strut dimensions from TeXbook page 353.
		    var hStrut = 8.5 / options.fontMetrics().ptPerEm;
		    var dStrut = 3.5 / options.fontMetrics().ptPerEm;
		    numerm.height = numerm.height < hStrut ? hStrut : numerm.height;
		    numerm.depth = numerm.depth < dStrut ? dStrut : numerm.depth;
		  }

		  newOptions = options.havingStyle(dstyle);
		  var denomm = buildGroup(group.denom, newOptions, options);
		  var rule;
		  var ruleWidth;
		  var ruleSpacing;

		  if (group.hasBarLine) {
		    if (group.barSize) {
		      ruleWidth = calculateSize(group.barSize, options);
		      rule = buildCommon.makeLineSpan("frac-line", options, ruleWidth);
		    } else {
		      rule = buildCommon.makeLineSpan("frac-line", options);
		    }

		    ruleWidth = rule.height;
		    ruleSpacing = rule.height;
		  } else {
		    rule = null;
		    ruleWidth = 0;
		    ruleSpacing = options.fontMetrics().defaultRuleThickness;
		  } // Rule 15b


		  var numShift;
		  var clearance;
		  var denomShift;

		  if (style.size === src_Style.DISPLAY.size || group.size === "display") {
		    numShift = options.fontMetrics().num1;

		    if (ruleWidth > 0) {
		      clearance = 3 * ruleSpacing;
		    } else {
		      clearance = 7 * ruleSpacing;
		    }

		    denomShift = options.fontMetrics().denom1;
		  } else {
		    if (ruleWidth > 0) {
		      numShift = options.fontMetrics().num2;
		      clearance = ruleSpacing;
		    } else {
		      numShift = options.fontMetrics().num3;
		      clearance = 3 * ruleSpacing;
		    }

		    denomShift = options.fontMetrics().denom2;
		  }

		  var frac;

		  if (!rule) {
		    // Rule 15c
		    var candidateClearance = numShift - numerm.depth - (denomm.height - denomShift);

		    if (candidateClearance < clearance) {
		      numShift += 0.5 * (clearance - candidateClearance);
		      denomShift += 0.5 * (clearance - candidateClearance);
		    }

		    frac = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: [{
		        type: "elem",
		        elem: denomm,
		        shift: denomShift
		      }, {
		        type: "elem",
		        elem: numerm,
		        shift: -numShift
		      }]
		    }, options);
		  } else {
		    // Rule 15d
		    var axisHeight = options.fontMetrics().axisHeight;

		    if (numShift - numerm.depth - (axisHeight + 0.5 * ruleWidth) < clearance) {
		      numShift += clearance - (numShift - numerm.depth - (axisHeight + 0.5 * ruleWidth));
		    }

		    if (axisHeight - 0.5 * ruleWidth - (denomm.height - denomShift) < clearance) {
		      denomShift += clearance - (axisHeight - 0.5 * ruleWidth - (denomm.height - denomShift));
		    }

		    var midShift = -(axisHeight - 0.5 * ruleWidth);
		    frac = buildCommon.makeVList({
		      positionType: "individualShift",
		      children: [{
		        type: "elem",
		        elem: denomm,
		        shift: denomShift
		      }, {
		        type: "elem",
		        elem: rule,
		        shift: midShift
		      }, {
		        type: "elem",
		        elem: numerm,
		        shift: -numShift
		      }]
		    }, options);
		  } // Since we manually change the style sometimes (with \dfrac or \tfrac),
		  // account for the possible size change here.


		  newOptions = options.havingStyle(style);
		  frac.height *= newOptions.sizeMultiplier / options.sizeMultiplier;
		  frac.depth *= newOptions.sizeMultiplier / options.sizeMultiplier; // Rule 15e

		  var delimSize;

		  if (style.size === src_Style.DISPLAY.size) {
		    delimSize = options.fontMetrics().delim1;
		  } else if (style.size === src_Style.SCRIPTSCRIPT.size) {
		    delimSize = options.havingStyle(src_Style.SCRIPT).fontMetrics().delim2;
		  } else {
		    delimSize = options.fontMetrics().delim2;
		  }

		  var leftDelim;
		  var rightDelim;

		  if (group.leftDelim == null) {
		    leftDelim = makeNullDelimiter(options, ["mopen"]);
		  } else {
		    leftDelim = delimiter.customSizedDelim(group.leftDelim, delimSize, true, options.havingStyle(style), group.mode, ["mopen"]);
		  }

		  if (group.continued) {
		    rightDelim = buildCommon.makeSpan([]); // zero width for \cfrac
		  } else if (group.rightDelim == null) {
		    rightDelim = makeNullDelimiter(options, ["mclose"]);
		  } else {
		    rightDelim = delimiter.customSizedDelim(group.rightDelim, delimSize, true, options.havingStyle(style), group.mode, ["mclose"]);
		  }

		  return buildCommon.makeSpan(["mord"].concat(newOptions.sizingClasses(options)), [leftDelim, buildCommon.makeSpan(["mfrac"], [frac]), rightDelim], options);
		};

		var genfrac_mathmlBuilder = function mathmlBuilder(group, options) {
		  var node = new mathMLTree.MathNode("mfrac", [buildMathML_buildGroup(group.numer, options), buildMathML_buildGroup(group.denom, options)]);

		  if (!group.hasBarLine) {
		    node.setAttribute("linethickness", "0px");
		  } else if (group.barSize) {
		    var ruleWidth = calculateSize(group.barSize, options);
		    node.setAttribute("linethickness", makeEm(ruleWidth));
		  }

		  var style = adjustStyle(group.size, options.style);

		  if (style.size !== options.style.size) {
		    node = new mathMLTree.MathNode("mstyle", [node]);
		    var isDisplay = style.size === src_Style.DISPLAY.size ? "true" : "false";
		    node.setAttribute("displaystyle", isDisplay);
		    node.setAttribute("scriptlevel", "0");
		  }

		  if (group.leftDelim != null || group.rightDelim != null) {
		    var withDelims = [];

		    if (group.leftDelim != null) {
		      var leftOp = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode(group.leftDelim.replace("\\", ""))]);
		      leftOp.setAttribute("fence", "true");
		      withDelims.push(leftOp);
		    }

		    withDelims.push(node);

		    if (group.rightDelim != null) {
		      var rightOp = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode(group.rightDelim.replace("\\", ""))]);
		      rightOp.setAttribute("fence", "true");
		      withDelims.push(rightOp);
		    }

		    return makeRow(withDelims);
		  }

		  return node;
		};

		defineFunction({
		  type: "genfrac",
		  names: ["\\dfrac", "\\frac", "\\tfrac", "\\dbinom", "\\binom", "\\tbinom", "\\\\atopfrac", // can’t be entered directly
		  "\\\\bracefrac", "\\\\brackfrac" // ditto
		  ],
		  props: {
		    numArgs: 2,
		    allowedInArgument: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var numer = args[0];
		    var denom = args[1];
		    var hasBarLine;
		    var leftDelim = null;
		    var rightDelim = null;
		    var size = "auto";

		    switch (funcName) {
		      case "\\dfrac":
		      case "\\frac":
		      case "\\tfrac":
		        hasBarLine = true;
		        break;

		      case "\\\\atopfrac":
		        hasBarLine = false;
		        break;

		      case "\\dbinom":
		      case "\\binom":
		      case "\\tbinom":
		        hasBarLine = false;
		        leftDelim = "(";
		        rightDelim = ")";
		        break;

		      case "\\\\bracefrac":
		        hasBarLine = false;
		        leftDelim = "\\{";
		        rightDelim = "\\}";
		        break;

		      case "\\\\brackfrac":
		        hasBarLine = false;
		        leftDelim = "[";
		        rightDelim = "]";
		        break;

		      default:
		        throw new Error("Unrecognized genfrac command");
		    }

		    switch (funcName) {
		      case "\\dfrac":
		      case "\\dbinom":
		        size = "display";
		        break;

		      case "\\tfrac":
		      case "\\tbinom":
		        size = "text";
		        break;
		    }

		    return {
		      type: "genfrac",
		      mode: parser.mode,
		      continued: false,
		      numer: numer,
		      denom: denom,
		      hasBarLine: hasBarLine,
		      leftDelim: leftDelim,
		      rightDelim: rightDelim,
		      size: size,
		      barSize: null
		    };
		  },
		  htmlBuilder: genfrac_htmlBuilder,
		  mathmlBuilder: genfrac_mathmlBuilder
		});
		defineFunction({
		  type: "genfrac",
		  names: ["\\cfrac"],
		  props: {
		    numArgs: 2
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		        _ref2.funcName;
		    var numer = args[0];
		    var denom = args[1];
		    return {
		      type: "genfrac",
		      mode: parser.mode,
		      continued: true,
		      numer: numer,
		      denom: denom,
		      hasBarLine: true,
		      leftDelim: null,
		      rightDelim: null,
		      size: "display",
		      barSize: null
		    };
		  }
		}); // Infix generalized fractions -- these are not rendered directly, but replaced
		// immediately by one of the variants above.

		defineFunction({
		  type: "infix",
		  names: ["\\over", "\\choose", "\\atop", "\\brace", "\\brack"],
		  props: {
		    numArgs: 0,
		    infix: true
		  },
		  handler: function handler(_ref3) {
		    var parser = _ref3.parser,
		        funcName = _ref3.funcName,
		        token = _ref3.token;
		    var replaceWith;

		    switch (funcName) {
		      case "\\over":
		        replaceWith = "\\frac";
		        break;

		      case "\\choose":
		        replaceWith = "\\binom";
		        break;

		      case "\\atop":
		        replaceWith = "\\\\atopfrac";
		        break;

		      case "\\brace":
		        replaceWith = "\\\\bracefrac";
		        break;

		      case "\\brack":
		        replaceWith = "\\\\brackfrac";
		        break;

		      default:
		        throw new Error("Unrecognized infix genfrac command");
		    }

		    return {
		      type: "infix",
		      mode: parser.mode,
		      replaceWith: replaceWith,
		      token: token
		    };
		  }
		});
		var stylArray = ["display", "text", "script", "scriptscript"];

		var delimFromValue = function delimFromValue(delimString) {
		  var delim = null;

		  if (delimString.length > 0) {
		    delim = delimString;
		    delim = delim === "." ? null : delim;
		  }

		  return delim;
		};

		defineFunction({
		  type: "genfrac",
		  names: ["\\genfrac"],
		  props: {
		    numArgs: 6,
		    allowedInArgument: true,
		    argTypes: ["math", "math", "size", "text", "math", "math"]
		  },
		  handler: function handler(_ref4, args) {
		    var parser = _ref4.parser;
		    var numer = args[4];
		    var denom = args[5]; // Look into the parse nodes to get the desired delimiters.

		    var leftNode = normalizeArgument(args[0]);
		    var leftDelim = leftNode.type === "atom" && leftNode.family === "open" ? delimFromValue(leftNode.text) : null;
		    var rightNode = normalizeArgument(args[1]);
		    var rightDelim = rightNode.type === "atom" && rightNode.family === "close" ? delimFromValue(rightNode.text) : null;
		    var barNode = assertNodeType(args[2], "size");
		    var hasBarLine;
		    var barSize = null;

		    if (barNode.isBlank) {
		      // \genfrac acts differently than \above.
		      // \genfrac treats an empty size group as a signal to use a
		      // standard bar size. \above would see size = 0 and omit the bar.
		      hasBarLine = true;
		    } else {
		      barSize = barNode.value;
		      hasBarLine = barSize.number > 0;
		    } // Find out if we want displaystyle, textstyle, etc.


		    var size = "auto";
		    var styl = args[3];

		    if (styl.type === "ordgroup") {
		      if (styl.body.length > 0) {
		        var textOrd = assertNodeType(styl.body[0], "textord");
		        size = stylArray[Number(textOrd.text)];
		      }
		    } else {
		      styl = assertNodeType(styl, "textord");
		      size = stylArray[Number(styl.text)];
		    }

		    return {
		      type: "genfrac",
		      mode: parser.mode,
		      numer: numer,
		      denom: denom,
		      continued: false,
		      hasBarLine: hasBarLine,
		      barSize: barSize,
		      leftDelim: leftDelim,
		      rightDelim: rightDelim,
		      size: size
		    };
		  },
		  htmlBuilder: genfrac_htmlBuilder,
		  mathmlBuilder: genfrac_mathmlBuilder
		}); // \above is an infix fraction that also defines a fraction bar size.

		defineFunction({
		  type: "infix",
		  names: ["\\above"],
		  props: {
		    numArgs: 1,
		    argTypes: ["size"],
		    infix: true
		  },
		  handler: function handler(_ref5, args) {
		    var parser = _ref5.parser;
		        _ref5.funcName;
		        var token = _ref5.token;
		    return {
		      type: "infix",
		      mode: parser.mode,
		      replaceWith: "\\\\abovefrac",
		      size: assertNodeType(args[0], "size").value,
		      token: token
		    };
		  }
		});
		defineFunction({
		  type: "genfrac",
		  names: ["\\\\abovefrac"],
		  props: {
		    numArgs: 3,
		    argTypes: ["math", "size", "math"]
		  },
		  handler: function handler(_ref6, args) {
		    var parser = _ref6.parser;
		        _ref6.funcName;
		    var numer = args[0];
		    var barSize = assert(assertNodeType(args[1], "infix").size);
		    var denom = args[2];
		    var hasBarLine = barSize.number > 0;
		    return {
		      type: "genfrac",
		      mode: parser.mode,
		      numer: numer,
		      denom: denom,
		      continued: false,
		      hasBarLine: hasBarLine,
		      barSize: barSize,
		      leftDelim: null,
		      rightDelim: null,
		      size: "auto"
		    };
		  },
		  htmlBuilder: genfrac_htmlBuilder,
		  mathmlBuilder: genfrac_mathmlBuilder
		});








		// NOTE: Unlike most `htmlBuilder`s, this one handles not only "horizBrace", but
		// also "supsub" since an over/underbrace can affect super/subscripting.
		var horizBrace_htmlBuilder = function htmlBuilder(grp, options) {
		  var style = options.style; // Pull out the `ParseNode<"horizBrace">` if `grp` is a "supsub" node.

		  var supSubGroup;
		  var group;

		  if (grp.type === "supsub") {
		    // Ref: LaTeX source2e: }}}}\limits}
		    // i.e. LaTeX treats the brace similar to an op and passes it
		    // with \limits, so we need to assign supsub style.
		    supSubGroup = grp.sup ? buildGroup(grp.sup, options.havingStyle(style.sup()), options) : buildGroup(grp.sub, options.havingStyle(style.sub()), options);
		    group = assertNodeType(grp.base, "horizBrace");
		  } else {
		    group = assertNodeType(grp, "horizBrace");
		  } // Build the base group


		  var body = buildGroup(group.base, options.havingBaseStyle(src_Style.DISPLAY)); // Create the stretchy element

		  var braceBody = stretchy.svgSpan(group, options); // Generate the vlist, with the appropriate kerns        ┏━━━━━━━━┓
		  // This first vlist contains the content and the brace:   equation

		  var vlist;

		  if (group.isOver) {
		    vlist = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: body
		      }, {
		        type: "kern",
		        size: 0.1
		      }, {
		        type: "elem",
		        elem: braceBody
		      }]
		    }, options); // $FlowFixMe: Replace this with passing "svg-align" into makeVList.

		    vlist.children[0].children[0].children[1].classes.push("svg-align");
		  } else {
		    vlist = buildCommon.makeVList({
		      positionType: "bottom",
		      positionData: body.depth + 0.1 + braceBody.height,
		      children: [{
		        type: "elem",
		        elem: braceBody
		      }, {
		        type: "kern",
		        size: 0.1
		      }, {
		        type: "elem",
		        elem: body
		      }]
		    }, options); // $FlowFixMe: Replace this with passing "svg-align" into makeVList.

		    vlist.children[0].children[0].children[0].classes.push("svg-align");
		  }

		  if (supSubGroup) {
		    // To write the supsub, wrap the first vlist in another vlist:
		    // They can't all go in the same vlist, because the note might be
		    // wider than the equation. We want the equation to control the
		    // brace width.
		    //      note          long note           long note
		    //   ┏━━━━━━━━┓   or    ┏━━━┓     not    ┏━━━━━━━━━┓
		    //    equation           eqn                 eqn
		    var vSpan = buildCommon.makeSpan(["mord", group.isOver ? "mover" : "munder"], [vlist], options);

		    if (group.isOver) {
		      vlist = buildCommon.makeVList({
		        positionType: "firstBaseline",
		        children: [{
		          type: "elem",
		          elem: vSpan
		        }, {
		          type: "kern",
		          size: 0.2
		        }, {
		          type: "elem",
		          elem: supSubGroup
		        }]
		      }, options);
		    } else {
		      vlist = buildCommon.makeVList({
		        positionType: "bottom",
		        positionData: vSpan.depth + 0.2 + supSubGroup.height + supSubGroup.depth,
		        children: [{
		          type: "elem",
		          elem: supSubGroup
		        }, {
		          type: "kern",
		          size: 0.2
		        }, {
		          type: "elem",
		          elem: vSpan
		        }]
		      }, options);
		    }
		  }

		  return buildCommon.makeSpan(["mord", group.isOver ? "mover" : "munder"], [vlist], options);
		};

		var horizBrace_mathmlBuilder = function mathmlBuilder(group, options) {
		  var accentNode = stretchy.mathMLnode(group.label);
		  return new mathMLTree.MathNode(group.isOver ? "mover" : "munder", [buildMathML_buildGroup(group.base, options), accentNode]);
		}; // Horizontal stretchy braces


		defineFunction({
		  type: "horizBrace",
		  names: ["\\overbrace", "\\underbrace"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    return {
		      type: "horizBrace",
		      mode: parser.mode,
		      label: funcName,
		      isOver: /^\\over/.test(funcName),
		      base: args[0]
		    };
		  },
		  htmlBuilder: horizBrace_htmlBuilder,
		  mathmlBuilder: horizBrace_mathmlBuilder
		});






		defineFunction({
		  type: "href",
		  names: ["\\href"],
		  props: {
		    numArgs: 2,
		    argTypes: ["url", "original"],
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var body = args[1];
		    var href = assertNodeType(args[0], "url").url;

		    if (!parser.settings.isTrusted({
		      command: "\\href",
		      url: href
		    })) {
		      return parser.formatUnsupportedCmd("\\href");
		    }

		    return {
		      type: "href",
		      mode: parser.mode,
		      href: href,
		      body: ordargument(body)
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.body, options, false);
		    return buildCommon.makeAnchor(group.href, [], elements, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var math = buildExpressionRow(group.body, options);

		    if (!(math instanceof MathNode)) {
		      math = new MathNode("mrow", [math]);
		    }

		    math.setAttribute("href", group.href);
		    return math;
		  }
		});
		defineFunction({
		  type: "href",
		  names: ["\\url"],
		  props: {
		    numArgs: 1,
		    argTypes: ["url"],
		    allowedInText: true
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    var href = assertNodeType(args[0], "url").url;

		    if (!parser.settings.isTrusted({
		      command: "\\url",
		      url: href
		    })) {
		      return parser.formatUnsupportedCmd("\\url");
		    }

		    var chars = [];

		    for (var i = 0; i < href.length; i++) {
		      var c = href[i];

		      if (c === "~") {
		        c = "\\textasciitilde";
		      }

		      chars.push({
		        type: "textord",
		        mode: "text",
		        text: c
		      });
		    }

		    var body = {
		      type: "text",
		      mode: parser.mode,
		      font: "\\texttt",
		      body: chars
		    };
		    return {
		      type: "href",
		      mode: parser.mode,
		      href: href,
		      body: ordargument(body)
		    };
		  }
		});




		 // \hbox is provided for compatibility with LaTeX \vcenter.
		// In LaTeX, \vcenter can act only on a box, as in
		// \vcenter{\hbox{$\frac{a+b}{\dfrac{c}{d}}$}}
		// This function by itself doesn't do anything but prevent a soft line break.

		defineFunction({
		  type: "hbox",
		  names: ["\\hbox"],
		  props: {
		    numArgs: 1,
		    argTypes: ["text"],
		    allowedInText: true,
		    primitive: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "hbox",
		      mode: parser.mode,
		      body: ordargument(args[0])
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.body, options, false);
		    return buildCommon.makeFragment(elements);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    return new mathMLTree.MathNode("mrow", buildMathML_buildExpression(group.body, options));
		  }
		});






		defineFunction({
		  type: "html",
		  names: ["\\htmlClass", "\\htmlId", "\\htmlStyle", "\\htmlData"],
		  props: {
		    numArgs: 2,
		    argTypes: ["raw", "original"],
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		        _ref.token;
		    var value = assertNodeType(args[0], "raw").string;
		    var body = args[1];

		    if (parser.settings.strict) {
		      parser.settings.reportNonstrict("htmlExtension", "HTML extension is disabled on strict mode");
		    }

		    var trustContext;
		    var attributes = {};

		    switch (funcName) {
		      case "\\htmlClass":
		        attributes.class = value;
		        trustContext = {
		          command: "\\htmlClass",
		          class: value
		        };
		        break;

		      case "\\htmlId":
		        attributes.id = value;
		        trustContext = {
		          command: "\\htmlId",
		          id: value
		        };
		        break;

		      case "\\htmlStyle":
		        attributes.style = value;
		        trustContext = {
		          command: "\\htmlStyle",
		          style: value
		        };
		        break;

		      case "\\htmlData":
		        {
		          var data = value.split(",");

		          for (var i = 0; i < data.length; i++) {
		            var keyVal = data[i].split("=");

		            if (keyVal.length !== 2) {
		              throw new src_ParseError("Error parsing key-value for \\htmlData");
		            }

		            attributes["data-" + keyVal[0].trim()] = keyVal[1].trim();
		          }

		          trustContext = {
		            command: "\\htmlData",
		            attributes: attributes
		          };
		          break;
		        }

		      default:
		        throw new Error("Unrecognized html command");
		    }

		    if (!parser.settings.isTrusted(trustContext)) {
		      return parser.formatUnsupportedCmd(funcName);
		    }

		    return {
		      type: "html",
		      mode: parser.mode,
		      attributes: attributes,
		      body: ordargument(body)
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.body, options, false);
		    var classes = ["enclosing"];

		    if (group.attributes.class) {
		      classes.push.apply(classes, group.attributes.class.trim().split(/\s+/));
		    }

		    var span = buildCommon.makeSpan(classes, elements, options);

		    for (var attr in group.attributes) {
		      if (attr !== "class" && group.attributes.hasOwnProperty(attr)) {
		        span.setAttribute(attr, group.attributes[attr]);
		      }
		    }

		    return span;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    return buildExpressionRow(group.body, options);
		  }
		});




		defineFunction({
		  type: "htmlmathml",
		  names: ["\\html@mathml"],
		  props: {
		    numArgs: 2,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "htmlmathml",
		      mode: parser.mode,
		      html: ordargument(args[0]),
		      mathml: ordargument(args[1])
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.html, options, false);
		    return buildCommon.makeFragment(elements);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    return buildExpressionRow(group.mathml, options);
		  }
		});







		var sizeData = function sizeData(str) {
		  if (/^[-+]? *(\d+(\.\d*)?|\.\d+)$/.test(str)) {
		    // str is a number with no unit specified.
		    // default unit is bp, per graphix package.
		    return {
		      number: +str,
		      unit: "bp"
		    };
		  } else {
		    var match = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(str);

		    if (!match) {
		      throw new src_ParseError("Invalid size: '" + str + "' in \\includegraphics");
		    }

		    var data = {
		      number: +(match[1] + match[2]),
		      // sign + magnitude, cast to number
		      unit: match[3]
		    };

		    if (!validUnit(data)) {
		      throw new src_ParseError("Invalid unit: '" + data.unit + "' in \\includegraphics.");
		    }

		    return data;
		  }
		};

		defineFunction({
		  type: "includegraphics",
		  names: ["\\includegraphics"],
		  props: {
		    numArgs: 1,
		    numOptionalArgs: 1,
		    argTypes: ["raw", "url"],
		    allowedInText: false
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser;
		    var width = {
		      number: 0,
		      unit: "em"
		    };
		    var height = {
		      number: 0.9,
		      unit: "em"
		    }; // sorta character sized.

		    var totalheight = {
		      number: 0,
		      unit: "em"
		    };
		    var alt = "";

		    if (optArgs[0]) {
		      var attributeStr = assertNodeType(optArgs[0], "raw").string; // Parser.js does not parse key/value pairs. We get a string.

		      var attributes = attributeStr.split(",");

		      for (var i = 0; i < attributes.length; i++) {
		        var keyVal = attributes[i].split("=");

		        if (keyVal.length === 2) {
		          var str = keyVal[1].trim();

		          switch (keyVal[0].trim()) {
		            case "alt":
		              alt = str;
		              break;

		            case "width":
		              width = sizeData(str);
		              break;

		            case "height":
		              height = sizeData(str);
		              break;

		            case "totalheight":
		              totalheight = sizeData(str);
		              break;

		            default:
		              throw new src_ParseError("Invalid key: '" + keyVal[0] + "' in \\includegraphics.");
		          }
		        }
		      }
		    }

		    var src = assertNodeType(args[0], "url").url;

		    if (alt === "") {
		      // No alt given. Use the file name. Strip away the path.
		      alt = src;
		      alt = alt.replace(/^.*[\\/]/, '');
		      alt = alt.substring(0, alt.lastIndexOf('.'));
		    }

		    if (!parser.settings.isTrusted({
		      command: "\\includegraphics",
		      url: src
		    })) {
		      return parser.formatUnsupportedCmd("\\includegraphics");
		    }

		    return {
		      type: "includegraphics",
		      mode: parser.mode,
		      alt: alt,
		      width: width,
		      height: height,
		      totalheight: totalheight,
		      src: src
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var height = calculateSize(group.height, options);
		    var depth = 0;

		    if (group.totalheight.number > 0) {
		      depth = calculateSize(group.totalheight, options) - height;
		    }

		    var width = 0;

		    if (group.width.number > 0) {
		      width = calculateSize(group.width, options);
		    }

		    var style = {
		      height: makeEm(height + depth)
		    };

		    if (width > 0) {
		      style.width = makeEm(width);
		    }

		    if (depth > 0) {
		      style.verticalAlign = makeEm(-depth);
		    }

		    var node = new Img(group.src, group.alt, style);
		    node.height = height;
		    node.depth = depth;
		    return node;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mglyph", []);
		    node.setAttribute("alt", group.alt);
		    var height = calculateSize(group.height, options);
		    var depth = 0;

		    if (group.totalheight.number > 0) {
		      depth = calculateSize(group.totalheight, options) - height;
		      node.setAttribute("valign", makeEm(-depth));
		    }

		    node.setAttribute("height", makeEm(height + depth));

		    if (group.width.number > 0) {
		      var width = calculateSize(group.width, options);
		      node.setAttribute("width", makeEm(width));
		    }

		    node.setAttribute("src", group.src);
		    return node;
		  }
		});
		// Horizontal spacing commands




		 // TODO: \hskip and \mskip should support plus and minus in lengths

		defineFunction({
		  type: "kern",
		  names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
		  props: {
		    numArgs: 1,
		    argTypes: ["size"],
		    primitive: true,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var size = assertNodeType(args[0], "size");

		    if (parser.settings.strict) {
		      var mathFunction = funcName[1] === 'm'; // \mkern, \mskip

		      var muUnit = size.value.unit === 'mu';

		      if (mathFunction) {
		        if (!muUnit) {
		          parser.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + funcName + " supports only mu units, " + ("not " + size.value.unit + " units"));
		        }

		        if (parser.mode !== "math") {
		          parser.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + funcName + " works only in math mode");
		        }
		      } else {
		        // !mathFunction
		        if (muUnit) {
		          parser.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + funcName + " doesn't support mu units");
		        }
		      }
		    }

		    return {
		      type: "kern",
		      mode: parser.mode,
		      dimension: size.value
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    return buildCommon.makeGlue(group.dimension, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var dimension = calculateSize(group.dimension, options);
		    return new mathMLTree.SpaceNode(dimension);
		  }
		});
		// Horizontal overlap functions






		defineFunction({
		  type: "lap",
		  names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var body = args[0];
		    return {
		      type: "lap",
		      mode: parser.mode,
		      alignment: funcName.slice(5),
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // mathllap, mathrlap, mathclap
		    var inner;

		    if (group.alignment === "clap") {
		      // ref: https://www.math.lsu.edu/~aperlis/publications/mathclap/
		      inner = buildCommon.makeSpan([], [buildGroup(group.body, options)]); // wrap, since CSS will center a .clap > .inner > span

		      inner = buildCommon.makeSpan(["inner"], [inner], options);
		    } else {
		      inner = buildCommon.makeSpan(["inner"], [buildGroup(group.body, options)]);
		    }

		    var fix = buildCommon.makeSpan(["fix"], []);
		    var node = buildCommon.makeSpan([group.alignment], [inner, fix], options); // At this point, we have correctly set horizontal alignment of the
		    // two items involved in the lap.
		    // Next, use a strut to set the height of the HTML bounding box.
		    // Otherwise, a tall argument may be misplaced.
		    // This code resolved issue #1153

		    var strut = buildCommon.makeSpan(["strut"]);
		    strut.style.height = makeEm(node.height + node.depth);

		    if (node.depth) {
		      strut.style.verticalAlign = makeEm(-node.depth);
		    }

		    node.children.unshift(strut); // Next, prevent vertical misplacement when next to something tall.
		    // This code resolves issue #1234

		    node = buildCommon.makeSpan(["thinbox"], [node], options);
		    return buildCommon.makeSpan(["mord", "vbox"], [node], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    // mathllap, mathrlap, mathclap
		    var node = new mathMLTree.MathNode("mpadded", [buildMathML_buildGroup(group.body, options)]);

		    if (group.alignment !== "rlap") {
		      var offset = group.alignment === "llap" ? "-1" : "-0.5";
		      node.setAttribute("lspace", offset + "width");
		    }

		    node.setAttribute("width", "0px");
		    return node;
		  }
		});

		 // Switching from text mode back to math mode

		defineFunction({
		  type: "styling",
		  names: ["\\(", "$"],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    allowedInMath: false
		  },
		  handler: function handler(_ref, args) {
		    var funcName = _ref.funcName,
		        parser = _ref.parser;
		    var outerMode = parser.mode;
		    parser.switchMode("math");
		    var close = funcName === "\\(" ? "\\)" : "$";
		    var body = parser.parseExpression(false, close);
		    parser.expect(close);
		    parser.switchMode(outerMode);
		    return {
		      type: "styling",
		      mode: parser.mode,
		      style: "text",
		      body: body
		    };
		  }
		}); // Check for extra closing math delimiters

		defineFunction({
		  type: "text",
		  // Doesn't matter what this is.
		  names: ["\\)", "\\]"],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    allowedInMath: false
		  },
		  handler: function handler(context, args) {
		    throw new src_ParseError("Mismatched " + context.funcName);
		  }
		});






		var chooseMathStyle = function chooseMathStyle(group, options) {
		  switch (options.style.size) {
		    case src_Style.DISPLAY.size:
		      return group.display;

		    case src_Style.TEXT.size:
		      return group.text;

		    case src_Style.SCRIPT.size:
		      return group.script;

		    case src_Style.SCRIPTSCRIPT.size:
		      return group.scriptscript;

		    default:
		      return group.text;
		  }
		};

		defineFunction({
		  type: "mathchoice",
		  names: ["\\mathchoice"],
		  props: {
		    numArgs: 4,
		    primitive: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "mathchoice",
		      mode: parser.mode,
		      display: ordargument(args[0]),
		      text: ordargument(args[1]),
		      script: ordargument(args[2]),
		      scriptscript: ordargument(args[3])
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var body = chooseMathStyle(group, options);
		    var elements = buildExpression(body, options, false);
		    return buildCommon.makeFragment(elements);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var body = chooseMathStyle(group, options);
		    return buildExpressionRow(body, options);
		  }
		});



		 // For an operator with limits, assemble the base, sup, and sub into a span.

		var assembleSupSub = function assembleSupSub(base, supGroup, subGroup, options, style, slant, baseShift) {
		  base = buildCommon.makeSpan([], [base]);
		  var subIsSingleCharacter = subGroup && utils.isCharacterBox(subGroup);
		  var sub;
		  var sup; // We manually have to handle the superscripts and subscripts. This,
		  // aside from the kern calculations, is copied from supsub.

		  if (supGroup) {
		    var elem = buildGroup(supGroup, options.havingStyle(style.sup()), options);
		    sup = {
		      elem: elem,
		      kern: Math.max(options.fontMetrics().bigOpSpacing1, options.fontMetrics().bigOpSpacing3 - elem.depth)
		    };
		  }

		  if (subGroup) {
		    var _elem = buildGroup(subGroup, options.havingStyle(style.sub()), options);

		    sub = {
		      elem: _elem,
		      kern: Math.max(options.fontMetrics().bigOpSpacing2, options.fontMetrics().bigOpSpacing4 - _elem.height)
		    };
		  } // Build the final group as a vlist of the possible subscript, base,
		  // and possible superscript.


		  var finalGroup;

		  if (sup && sub) {
		    var bottom = options.fontMetrics().bigOpSpacing5 + sub.elem.height + sub.elem.depth + sub.kern + base.depth + baseShift;
		    finalGroup = buildCommon.makeVList({
		      positionType: "bottom",
		      positionData: bottom,
		      children: [{
		        type: "kern",
		        size: options.fontMetrics().bigOpSpacing5
		      }, {
		        type: "elem",
		        elem: sub.elem,
		        marginLeft: makeEm(-slant)
		      }, {
		        type: "kern",
		        size: sub.kern
		      }, {
		        type: "elem",
		        elem: base
		      }, {
		        type: "kern",
		        size: sup.kern
		      }, {
		        type: "elem",
		        elem: sup.elem,
		        marginLeft: makeEm(slant)
		      }, {
		        type: "kern",
		        size: options.fontMetrics().bigOpSpacing5
		      }]
		    }, options);
		  } else if (sub) {
		    var top = base.height - baseShift; // Shift the limits by the slant of the symbol. Note
		    // that we are supposed to shift the limits by 1/2 of the slant,
		    // but since we are centering the limits adding a full slant of
		    // margin will shift by 1/2 that.

		    finalGroup = buildCommon.makeVList({
		      positionType: "top",
		      positionData: top,
		      children: [{
		        type: "kern",
		        size: options.fontMetrics().bigOpSpacing5
		      }, {
		        type: "elem",
		        elem: sub.elem,
		        marginLeft: makeEm(-slant)
		      }, {
		        type: "kern",
		        size: sub.kern
		      }, {
		        type: "elem",
		        elem: base
		      }]
		    }, options);
		  } else if (sup) {
		    var _bottom = base.depth + baseShift;

		    finalGroup = buildCommon.makeVList({
		      positionType: "bottom",
		      positionData: _bottom,
		      children: [{
		        type: "elem",
		        elem: base
		      }, {
		        type: "kern",
		        size: sup.kern
		      }, {
		        type: "elem",
		        elem: sup.elem,
		        marginLeft: makeEm(slant)
		      }, {
		        type: "kern",
		        size: options.fontMetrics().bigOpSpacing5
		      }]
		    }, options);
		  } else {
		    // This case probably shouldn't occur (this would mean the
		    // supsub was sending us a group with no superscript or
		    // subscript) but be safe.
		    return base;
		  }

		  var parts = [finalGroup];

		  if (sub && slant !== 0 && !subIsSingleCharacter) {
		    // A negative margin-left was applied to the lower limit.
		    // Avoid an overlap by placing a spacer on the left on the group.
		    var spacer = buildCommon.makeSpan(["mspace"], [], options);
		    spacer.style.marginRight = makeEm(slant);
		    parts.unshift(spacer);
		  }

		  return buildCommon.makeSpan(["mop", "op-limits"], parts, options);
		};
		// Limits, symbols











		// Most operators have a large successor symbol, but these don't.
		var noSuccessor = ["\\smallint"]; // NOTE: Unlike most `htmlBuilder`s, this one handles not only "op", but also
		// "supsub" since some of them (like \int) can affect super/subscripting.

		var op_htmlBuilder = function htmlBuilder(grp, options) {
		  // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
		  var supGroup;
		  var subGroup;
		  var hasLimits = false;
		  var group;

		  if (grp.type === "supsub") {
		    // If we have limits, supsub will pass us its group to handle. Pull
		    // out the superscript and subscript and set the group to the op in
		    // its base.
		    supGroup = grp.sup;
		    subGroup = grp.sub;
		    group = assertNodeType(grp.base, "op");
		    hasLimits = true;
		  } else {
		    group = assertNodeType(grp, "op");
		  }

		  var style = options.style;
		  var large = false;

		  if (style.size === src_Style.DISPLAY.size && group.symbol && !utils.contains(noSuccessor, group.name)) {
		    // Most symbol operators get larger in displaystyle (rule 13)
		    large = true;
		  }

		  var base;

		  if (group.symbol) {
		    // If this is a symbol, create the symbol.
		    var fontName = large ? "Size2-Regular" : "Size1-Regular";
		    var stash = "";

		    if (group.name === "\\oiint" || group.name === "\\oiiint") {
		      // No font glyphs yet, so use a glyph w/o the oval.
		      // TODO: When font glyphs are available, delete this code.
		      stash = group.name.slice(1);
		      group.name = stash === "oiint" ? "\\iint" : "\\iiint";
		    }

		    base = buildCommon.makeSymbol(group.name, fontName, "math", options, ["mop", "op-symbol", large ? "large-op" : "small-op"]);

		    if (stash.length > 0) {
		      // We're in \oiint or \oiiint. Overlay the oval.
		      // TODO: When font glyphs are available, delete this code.
		      var italic = base.italic;
		      var oval = buildCommon.staticSvg(stash + "Size" + (large ? "2" : "1"), options);
		      base = buildCommon.makeVList({
		        positionType: "individualShift",
		        children: [{
		          type: "elem",
		          elem: base,
		          shift: 0
		        }, {
		          type: "elem",
		          elem: oval,
		          shift: large ? 0.08 : 0
		        }]
		      }, options);
		      group.name = "\\" + stash;
		      base.classes.unshift("mop"); // $FlowFixMe

		      base.italic = italic;
		    }
		  } else if (group.body) {
		    // If this is a list, compose that list.
		    var inner = buildExpression(group.body, options, true);

		    if (inner.length === 1 && inner[0] instanceof SymbolNode) {
		      base = inner[0];
		      base.classes[0] = "mop"; // replace old mclass
		    } else {
		      base = buildCommon.makeSpan(["mop"], inner, options);
		    }
		  } else {
		    // Otherwise, this is a text operator. Build the text from the
		    // operator's name.
		    var output = [];

		    for (var i = 1; i < group.name.length; i++) {
		      output.push(buildCommon.mathsym(group.name[i], group.mode, options));
		    }

		    base = buildCommon.makeSpan(["mop"], output, options);
		  } // If content of op is a single symbol, shift it vertically.


		  var baseShift = 0;
		  var slant = 0;

		  if ((base instanceof SymbolNode || group.name === "\\oiint" || group.name === "\\oiiint") && !group.suppressBaseShift) {
		    // We suppress the shift of the base of \overset and \underset. Otherwise,
		    // shift the symbol so its center lies on the axis (rule 13). It
		    // appears that our fonts have the centers of the symbols already
		    // almost on the axis, so these numbers are very small. Note we
		    // don't actually apply this here, but instead it is used either in
		    // the vlist creation or separately when there are no limits.
		    baseShift = (base.height - base.depth) / 2 - options.fontMetrics().axisHeight; // The slant of the symbol is just its italic correction.
		    // $FlowFixMe

		    slant = base.italic;
		  }

		  if (hasLimits) {
		    return assembleSupSub(base, supGroup, subGroup, options, style, slant, baseShift);
		  } else {
		    if (baseShift) {
		      base.style.position = "relative";
		      base.style.top = makeEm(baseShift);
		    }

		    return base;
		  }
		};

		var op_mathmlBuilder = function mathmlBuilder(group, options) {
		  var node;

		  if (group.symbol) {
		    // This is a symbol. Just add the symbol.
		    node = new MathNode("mo", [makeText(group.name, group.mode)]);

		    if (utils.contains(noSuccessor, group.name)) {
		      node.setAttribute("largeop", "false");
		    }
		  } else if (group.body) {
		    // This is an operator with children. Add them.
		    node = new MathNode("mo", buildMathML_buildExpression(group.body, options));
		  } else {
		    // This is a text operator. Add all of the characters from the
		    // operator's name.
		    node = new MathNode("mi", [new TextNode(group.name.slice(1))]); // Append an <mo>&ApplyFunction;</mo>.
		    // ref: https://www.w3.org/TR/REC-MathML/chap3_2.html#sec3.2.4

		    var operator = new MathNode("mo", [makeText("\u2061", "text")]);

		    if (group.parentIsSupSub) {
		      node = new MathNode("mrow", [node, operator]);
		    } else {
		      node = newDocumentFragment([node, operator]);
		    }
		  }

		  return node;
		};

		var singleCharBigOps = {
		  "\u220F": "\\prod",
		  "\u2210": "\\coprod",
		  "\u2211": "\\sum",
		  "\u22C0": "\\bigwedge",
		  "\u22C1": "\\bigvee",
		  "\u22C2": "\\bigcap",
		  "\u22C3": "\\bigcup",
		  "\u2A00": "\\bigodot",
		  "\u2A01": "\\bigoplus",
		  "\u2A02": "\\bigotimes",
		  "\u2A04": "\\biguplus",
		  "\u2A06": "\\bigsqcup"
		};
		defineFunction({
		  type: "op",
		  names: ["\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap", "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes", "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint", "\u220F", "\u2210", "\u2211", "\u22C0", "\u22C1", "\u22C2", "\u22C3", "\u2A00", "\u2A01", "\u2A02", "\u2A04", "\u2A06"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var fName = funcName;

		    if (fName.length === 1) {
		      fName = singleCharBigOps[fName];
		    }

		    return {
		      type: "op",
		      mode: parser.mode,
		      limits: true,
		      parentIsSupSub: false,
		      symbol: true,
		      name: fName
		    };
		  },
		  htmlBuilder: op_htmlBuilder,
		  mathmlBuilder: op_mathmlBuilder
		}); // Note: calling defineFunction with a type that's already been defined only
		// works because the same htmlBuilder and mathmlBuilder are being used.

		defineFunction({
		  type: "op",
		  names: ["\\mathop"],
		  props: {
		    numArgs: 1,
		    primitive: true
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    var body = args[0];
		    return {
		      type: "op",
		      mode: parser.mode,
		      limits: false,
		      parentIsSupSub: false,
		      symbol: false,
		      body: ordargument(body)
		    };
		  },
		  htmlBuilder: op_htmlBuilder,
		  mathmlBuilder: op_mathmlBuilder
		}); // There are 2 flags for operators; whether they produce limits in
		// displaystyle, and whether they are symbols and should grow in
		// displaystyle. These four groups cover the four possible choices.

		var singleCharIntegrals = {
		  "\u222B": "\\int",
		  "\u222C": "\\iint",
		  "\u222D": "\\iiint",
		  "\u222E": "\\oint",
		  "\u222F": "\\oiint",
		  "\u2230": "\\oiiint"
		}; // No limits, not symbols

		defineFunction({
		  type: "op",
		  names: ["\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg", "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg", "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp", "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(_ref3) {
		    var parser = _ref3.parser,
		        funcName = _ref3.funcName;
		    return {
		      type: "op",
		      mode: parser.mode,
		      limits: false,
		      parentIsSupSub: false,
		      symbol: false,
		      name: funcName
		    };
		  },
		  htmlBuilder: op_htmlBuilder,
		  mathmlBuilder: op_mathmlBuilder
		}); // Limits, not symbols

		defineFunction({
		  type: "op",
		  names: ["\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(_ref4) {
		    var parser = _ref4.parser,
		        funcName = _ref4.funcName;
		    return {
		      type: "op",
		      mode: parser.mode,
		      limits: true,
		      parentIsSupSub: false,
		      symbol: false,
		      name: funcName
		    };
		  },
		  htmlBuilder: op_htmlBuilder,
		  mathmlBuilder: op_mathmlBuilder
		}); // No limits, symbols

		defineFunction({
		  type: "op",
		  names: ["\\int", "\\iint", "\\iiint", "\\oint", "\\oiint", "\\oiiint", "\u222B", "\u222C", "\u222D", "\u222E", "\u222F", "\u2230"],
		  props: {
		    numArgs: 0
		  },
		  handler: function handler(_ref5) {
		    var parser = _ref5.parser,
		        funcName = _ref5.funcName;
		    var fName = funcName;

		    if (fName.length === 1) {
		      fName = singleCharIntegrals[fName];
		    }

		    return {
		      type: "op",
		      mode: parser.mode,
		      limits: false,
		      parentIsSupSub: false,
		      symbol: true,
		      name: fName
		    };
		  },
		  htmlBuilder: op_htmlBuilder,
		  mathmlBuilder: op_mathmlBuilder
		});









		// NOTE: Unlike most `htmlBuilder`s, this one handles not only
		// "operatorname", but also  "supsub" since \operatorname* can
		// affect super/subscripting.
		var operatorname_htmlBuilder = function htmlBuilder(grp, options) {
		  // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
		  var supGroup;
		  var subGroup;
		  var hasLimits = false;
		  var group;

		  if (grp.type === "supsub") {
		    // If we have limits, supsub will pass us its group to handle. Pull
		    // out the superscript and subscript and set the group to the op in
		    // its base.
		    supGroup = grp.sup;
		    subGroup = grp.sub;
		    group = assertNodeType(grp.base, "operatorname");
		    hasLimits = true;
		  } else {
		    group = assertNodeType(grp, "operatorname");
		  }

		  var base;

		  if (group.body.length > 0) {
		    var body = group.body.map(function (child) {
		      // $FlowFixMe: Check if the node has a string `text` property.
		      var childText = child.text;

		      if (typeof childText === "string") {
		        return {
		          type: "textord",
		          mode: child.mode,
		          text: childText
		        };
		      } else {
		        return child;
		      }
		    }); // Consolidate function names into symbol characters.

		    var expression = buildExpression(body, options.withFont("mathrm"), true);

		    for (var i = 0; i < expression.length; i++) {
		      var child = expression[i];

		      if (child instanceof SymbolNode) {
		        // Per amsopn package,
		        // change minus to hyphen and \ast to asterisk
		        child.text = child.text.replace(/\u2212/, "-").replace(/\u2217/, "*");
		      }
		    }

		    base = buildCommon.makeSpan(["mop"], expression, options);
		  } else {
		    base = buildCommon.makeSpan(["mop"], [], options);
		  }

		  if (hasLimits) {
		    return assembleSupSub(base, supGroup, subGroup, options, options.style, 0, 0);
		  } else {
		    return base;
		  }
		};

		var operatorname_mathmlBuilder = function mathmlBuilder(group, options) {
		  // The steps taken here are similar to the html version.
		  var expression = buildMathML_buildExpression(group.body, options.withFont("mathrm")); // Is expression a string or has it something like a fraction?

		  var isAllString = true; // default

		  for (var i = 0; i < expression.length; i++) {
		    var node = expression[i];

		    if (node instanceof mathMLTree.SpaceNode) ; else if (node instanceof mathMLTree.MathNode) {
		      switch (node.type) {
		        case "mi":
		        case "mn":
		        case "ms":
		        case "mspace":
		        case "mtext":
		          break;
		        // Do nothing yet.

		        case "mo":
		          {
		            var child = node.children[0];

		            if (node.children.length === 1 && child instanceof mathMLTree.TextNode) {
		              child.text = child.text.replace(/\u2212/, "-").replace(/\u2217/, "*");
		            } else {
		              isAllString = false;
		            }

		            break;
		          }

		        default:
		          isAllString = false;
		      }
		    } else {
		      isAllString = false;
		    }
		  }

		  if (isAllString) {
		    // Write a single TextNode instead of multiple nested tags.
		    var word = expression.map(function (node) {
		      return node.toText();
		    }).join("");
		    expression = [new mathMLTree.TextNode(word)];
		  }

		  var identifier = new mathMLTree.MathNode("mi", expression);
		  identifier.setAttribute("mathvariant", "normal"); // \u2061 is the same as &ApplyFunction;
		  // ref: https://www.w3schools.com/charsets/ref_html_entities_a.asp

		  var operator = new mathMLTree.MathNode("mo", [makeText("\u2061", "text")]);

		  if (group.parentIsSupSub) {
		    return new mathMLTree.MathNode("mrow", [identifier, operator]);
		  } else {
		    return mathMLTree.newDocumentFragment([identifier, operator]);
		  }
		}; // \operatorname
		// amsopn.dtx: \mathop{#1\kern\z@\operator@font#3}\newmcodes@


		defineFunction({
		  type: "operatorname",
		  names: ["\\operatorname@", "\\operatornamewithlimits"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var body = args[0];
		    return {
		      type: "operatorname",
		      mode: parser.mode,
		      body: ordargument(body),
		      alwaysHandleSupSub: funcName === "\\operatornamewithlimits",
		      limits: false,
		      parentIsSupSub: false
		    };
		  },
		  htmlBuilder: operatorname_htmlBuilder,
		  mathmlBuilder: operatorname_mathmlBuilder
		});
		defineMacro("\\operatorname", "\\@ifstar\\operatornamewithlimits\\operatorname@");




		defineFunctionBuilders({
		  type: "ordgroup",
		  htmlBuilder: function htmlBuilder(group, options) {
		    if (group.semisimple) {
		      return buildCommon.makeFragment(buildExpression(group.body, options, false));
		    }

		    return buildCommon.makeSpan(["mord"], buildExpression(group.body, options, true), options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    return buildExpressionRow(group.body, options, true);
		  }
		});





		defineFunction({
		  type: "overline",
		  names: ["\\overline"],
		  props: {
		    numArgs: 1
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var body = args[0];
		    return {
		      type: "overline",
		      mode: parser.mode,
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Overlines are handled in the TeXbook pg 443, Rule 9.
		    // Build the inner group in the cramped style.
		    var innerGroup = buildGroup(group.body, options.havingCrampedStyle()); // Create the line above the body

		    var line = buildCommon.makeLineSpan("overline-line", options); // Generate the vlist, with the appropriate kerns

		    var defaultRuleThickness = options.fontMetrics().defaultRuleThickness;
		    var vlist = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: innerGroup
		      }, {
		        type: "kern",
		        size: 3 * defaultRuleThickness
		      }, {
		        type: "elem",
		        elem: line
		      }, {
		        type: "kern",
		        size: defaultRuleThickness
		      }]
		    }, options);
		    return buildCommon.makeSpan(["mord", "overline"], [vlist], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var operator = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode("\u203E")]);
		    operator.setAttribute("stretchy", "true");
		    var node = new mathMLTree.MathNode("mover", [buildMathML_buildGroup(group.body, options), operator]);
		    node.setAttribute("accent", "true");
		    return node;
		  }
		});





		defineFunction({
		  type: "phantom",
		  names: ["\\phantom"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var body = args[0];
		    return {
		      type: "phantom",
		      mode: parser.mode,
		      body: ordargument(body)
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var elements = buildExpression(group.body, options.withPhantom(), false); // \phantom isn't supposed to affect the elements it contains.
		    // See "color" for more details.

		    return buildCommon.makeFragment(elements);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var inner = buildMathML_buildExpression(group.body, options);
		    return new mathMLTree.MathNode("mphantom", inner);
		  }
		});
		defineFunction({
		  type: "hphantom",
		  names: ["\\hphantom"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref2, args) {
		    var parser = _ref2.parser;
		    var body = args[0];
		    return {
		      type: "hphantom",
		      mode: parser.mode,
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var node = buildCommon.makeSpan([], [buildGroup(group.body, options.withPhantom())]);
		    node.height = 0;
		    node.depth = 0;

		    if (node.children) {
		      for (var i = 0; i < node.children.length; i++) {
		        node.children[i].height = 0;
		        node.children[i].depth = 0;
		      }
		    } // See smash for comment re: use of makeVList


		    node = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: node
		      }]
		    }, options); // For spacing, TeX treats \smash as a math group (same spacing as ord).

		    return buildCommon.makeSpan(["mord"], [node], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var inner = buildMathML_buildExpression(ordargument(group.body), options);
		    var phantom = new mathMLTree.MathNode("mphantom", inner);
		    var node = new mathMLTree.MathNode("mpadded", [phantom]);
		    node.setAttribute("height", "0px");
		    node.setAttribute("depth", "0px");
		    return node;
		  }
		});
		defineFunction({
		  type: "vphantom",
		  names: ["\\vphantom"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref3, args) {
		    var parser = _ref3.parser;
		    var body = args[0];
		    return {
		      type: "vphantom",
		      mode: parser.mode,
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var inner = buildCommon.makeSpan(["inner"], [buildGroup(group.body, options.withPhantom())]);
		    var fix = buildCommon.makeSpan(["fix"], []);
		    return buildCommon.makeSpan(["mord", "rlap"], [inner, fix], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var inner = buildMathML_buildExpression(ordargument(group.body), options);
		    var phantom = new mathMLTree.MathNode("mphantom", inner);
		    var node = new mathMLTree.MathNode("mpadded", [phantom]);
		    node.setAttribute("width", "0px");
		    return node;
		  }
		});






		 // Box manipulation

		defineFunction({
		  type: "raisebox",
		  names: ["\\raisebox"],
		  props: {
		    numArgs: 2,
		    argTypes: ["size", "hbox"],
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    var amount = assertNodeType(args[0], "size").value;
		    var body = args[1];
		    return {
		      type: "raisebox",
		      mode: parser.mode,
		      dy: amount,
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var body = buildGroup(group.body, options);
		    var dy = calculateSize(group.dy, options);
		    return buildCommon.makeVList({
		      positionType: "shift",
		      positionData: -dy,
		      children: [{
		        type: "elem",
		        elem: body
		      }]
		    }, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mpadded", [buildMathML_buildGroup(group.body, options)]);
		    var dy = group.dy.number + group.dy.unit;
		    node.setAttribute("voffset", dy);
		    return node;
		  }
		});

		defineFunction({
		  type: "internal",
		  names: ["\\relax"],
		  props: {
		    numArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(_ref) {
		    var parser = _ref.parser;
		    return {
		      type: "internal",
		      mode: parser.mode
		    };
		  }
		});





		defineFunction({
		  type: "rule",
		  names: ["\\rule"],
		  props: {
		    numArgs: 2,
		    numOptionalArgs: 1,
		    argTypes: ["size", "size", "size"]
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser;
		    var shift = optArgs[0];
		    var width = assertNodeType(args[0], "size");
		    var height = assertNodeType(args[1], "size");
		    return {
		      type: "rule",
		      mode: parser.mode,
		      shift: shift && assertNodeType(shift, "size").value,
		      width: width.value,
		      height: height.value
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Make an empty span for the rule
		    var rule = buildCommon.makeSpan(["mord", "rule"], [], options); // Calculate the shift, width, and height of the rule, and account for units

		    var width = calculateSize(group.width, options);
		    var height = calculateSize(group.height, options);
		    var shift = group.shift ? calculateSize(group.shift, options) : 0; // Style the rule to the right size

		    rule.style.borderRightWidth = makeEm(width);
		    rule.style.borderTopWidth = makeEm(height);
		    rule.style.bottom = makeEm(shift); // Record the height and width

		    rule.width = width;
		    rule.height = height + shift;
		    rule.depth = -shift; // Font size is the number large enough that the browser will
		    // reserve at least `absHeight` space above the baseline.
		    // The 1.125 factor was empirically determined

		    rule.maxFontSize = height * 1.125 * options.sizeMultiplier;
		    return rule;
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var width = calculateSize(group.width, options);
		    var height = calculateSize(group.height, options);
		    var shift = group.shift ? calculateSize(group.shift, options) : 0;
		    var color = options.color && options.getColor() || "black";
		    var rule = new mathMLTree.MathNode("mspace");
		    rule.setAttribute("mathbackground", color);
		    rule.setAttribute("width", makeEm(width));
		    rule.setAttribute("height", makeEm(height));
		    var wrapper = new mathMLTree.MathNode("mpadded", [rule]);

		    if (shift >= 0) {
		      wrapper.setAttribute("height", makeEm(shift));
		    } else {
		      wrapper.setAttribute("height", makeEm(shift));
		      wrapper.setAttribute("depth", makeEm(-shift));
		    }

		    wrapper.setAttribute("voffset", makeEm(shift));
		    return wrapper;
		  }
		});






		function sizingGroup(value, options, baseOptions) {
		  var inner = buildExpression(value, options, false);
		  var multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier; // Add size-resetting classes to the inner list and set maxFontSize
		  // manually. Handle nested size changes.

		  for (var i = 0; i < inner.length; i++) {
		    var pos = inner[i].classes.indexOf("sizing");

		    if (pos < 0) {
		      Array.prototype.push.apply(inner[i].classes, options.sizingClasses(baseOptions));
		    } else if (inner[i].classes[pos + 1] === "reset-size" + options.size) {
		      // This is a nested size change: e.g., inner[i] is the "b" in
		      // `\Huge a \small b`. Override the old size (the `reset-` class)
		      // but not the new size.
		      inner[i].classes[pos + 1] = "reset-size" + baseOptions.size;
		    }

		    inner[i].height *= multiplier;
		    inner[i].depth *= multiplier;
		  }

		  return buildCommon.makeFragment(inner);
		}
		var sizeFuncs = ["\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"];
		var sizing_htmlBuilder = function htmlBuilder(group, options) {
		  // Handle sizing operators like \Huge. Real TeX doesn't actually allow
		  // these functions inside of math expressions, so we do some special
		  // handling.
		  var newOptions = options.havingSize(group.size);
		  return sizingGroup(group.body, newOptions, options);
		};
		defineFunction({
		  type: "sizing",
		  names: sizeFuncs,
		  props: {
		    numArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var breakOnTokenText = _ref.breakOnTokenText,
		        funcName = _ref.funcName,
		        parser = _ref.parser;
		    var body = parser.parseExpression(false, breakOnTokenText);
		    return {
		      type: "sizing",
		      mode: parser.mode,
		      // Figure out what size to use based on the list of functions above
		      size: sizeFuncs.indexOf(funcName) + 1,
		      body: body
		    };
		  },
		  htmlBuilder: sizing_htmlBuilder,
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var newOptions = options.havingSize(group.size);
		    var inner = buildMathML_buildExpression(group.body, newOptions);
		    var node = new mathMLTree.MathNode("mstyle", inner); // TODO(emily): This doesn't produce the correct size for nested size
		    // changes, because we don't keep state of what style we're currently
		    // in, so we can't reset the size to normal before changing it.  Now
		    // that we're passing an options parameter we should be able to fix
		    // this.

		    node.setAttribute("mathsize", makeEm(newOptions.sizeMultiplier));
		    return node;
		  }
		});
		// smash, with optional [tb], as in AMS






		defineFunction({
		  type: "smash",
		  names: ["\\smash"],
		  props: {
		    numArgs: 1,
		    numOptionalArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser;
		    var smashHeight = false;
		    var smashDepth = false;
		    var tbArg = optArgs[0] && assertNodeType(optArgs[0], "ordgroup");

		    if (tbArg) {
		      // Optional [tb] argument is engaged.
		      // ref: amsmath: \renewcommand{\smash}[1][tb]{%
		      //               def\mb@t{\ht}\def\mb@b{\dp}\def\mb@tb{\ht\z@\z@\dp}%
		      var letter = "";

		      for (var i = 0; i < tbArg.body.length; ++i) {
		        var node = tbArg.body[i]; // $FlowFixMe: Not every node type has a `text` property.

		        letter = node.text;

		        if (letter === "t") {
		          smashHeight = true;
		        } else if (letter === "b") {
		          smashDepth = true;
		        } else {
		          smashHeight = false;
		          smashDepth = false;
		          break;
		        }
		      }
		    } else {
		      smashHeight = true;
		      smashDepth = true;
		    }

		    var body = args[0];
		    return {
		      type: "smash",
		      mode: parser.mode,
		      body: body,
		      smashHeight: smashHeight,
		      smashDepth: smashDepth
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var node = buildCommon.makeSpan([], [buildGroup(group.body, options)]);

		    if (!group.smashHeight && !group.smashDepth) {
		      return node;
		    }

		    if (group.smashHeight) {
		      node.height = 0; // In order to influence makeVList, we have to reset the children.

		      if (node.children) {
		        for (var i = 0; i < node.children.length; i++) {
		          node.children[i].height = 0;
		        }
		      }
		    }

		    if (group.smashDepth) {
		      node.depth = 0;

		      if (node.children) {
		        for (var _i = 0; _i < node.children.length; _i++) {
		          node.children[_i].depth = 0;
		        }
		      }
		    } // At this point, we've reset the TeX-like height and depth values.
		    // But the span still has an HTML line height.
		    // makeVList applies "display: table-cell", which prevents the browser
		    // from acting on that line height. So we'll call makeVList now.


		    var smashedNode = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: node
		      }]
		    }, options); // For spacing, TeX treats \hphantom as a math group (same spacing as ord).

		    return buildCommon.makeSpan(["mord"], [smashedNode], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mpadded", [buildMathML_buildGroup(group.body, options)]);

		    if (group.smashHeight) {
		      node.setAttribute("height", "0px");
		    }

		    if (group.smashDepth) {
		      node.setAttribute("depth", "0px");
		    }

		    return node;
		  }
		});








		defineFunction({
		  type: "sqrt",
		  names: ["\\sqrt"],
		  props: {
		    numArgs: 1,
		    numOptionalArgs: 1
		  },
		  handler: function handler(_ref, args, optArgs) {
		    var parser = _ref.parser;
		    var index = optArgs[0];
		    var body = args[0];
		    return {
		      type: "sqrt",
		      mode: parser.mode,
		      body: body,
		      index: index
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Square roots are handled in the TeXbook pg. 443, Rule 11.
		    // First, we do the same steps as in overline to build the inner group
		    // and line
		    var inner = buildGroup(group.body, options.havingCrampedStyle());

		    if (inner.height === 0) {
		      // Render a small surd.
		      inner.height = options.fontMetrics().xHeight;
		    } // Some groups can return document fragments.  Handle those by wrapping
		    // them in a span.


		    inner = buildCommon.wrapFragment(inner, options); // Calculate the minimum size for the \surd delimiter

		    var metrics = options.fontMetrics();
		    var theta = metrics.defaultRuleThickness;
		    var phi = theta;

		    if (options.style.id < src_Style.TEXT.id) {
		      phi = options.fontMetrics().xHeight;
		    } // Calculate the clearance between the body and line


		    var lineClearance = theta + phi / 4;
		    var minDelimiterHeight = inner.height + inner.depth + lineClearance + theta; // Create a sqrt SVG of the required minimum size

		    var _delimiter$sqrtImage = delimiter.sqrtImage(minDelimiterHeight, options),
		        img = _delimiter$sqrtImage.span,
		        ruleWidth = _delimiter$sqrtImage.ruleWidth,
		        advanceWidth = _delimiter$sqrtImage.advanceWidth;

		    var delimDepth = img.height - ruleWidth; // Adjust the clearance based on the delimiter size

		    if (delimDepth > inner.height + inner.depth + lineClearance) {
		      lineClearance = (lineClearance + delimDepth - inner.height - inner.depth) / 2;
		    } // Shift the sqrt image


		    var imgShift = img.height - inner.height - lineClearance - ruleWidth;
		    inner.style.paddingLeft = makeEm(advanceWidth); // Overlay the image and the argument.

		    var body = buildCommon.makeVList({
		      positionType: "firstBaseline",
		      children: [{
		        type: "elem",
		        elem: inner,
		        wrapperClasses: ["svg-align"]
		      }, {
		        type: "kern",
		        size: -(inner.height + imgShift)
		      }, {
		        type: "elem",
		        elem: img
		      }, {
		        type: "kern",
		        size: ruleWidth
		      }]
		    }, options);

		    if (!group.index) {
		      return buildCommon.makeSpan(["mord", "sqrt"], [body], options);
		    } else {
		      // Handle the optional root index
		      // The index is always in scriptscript style
		      var newOptions = options.havingStyle(src_Style.SCRIPTSCRIPT);
		      var rootm = buildGroup(group.index, newOptions, options); // The amount the index is shifted by. This is taken from the TeX
		      // source, in the definition of `\r@@t`.

		      var toShift = 0.6 * (body.height - body.depth); // Build a VList with the superscript shifted up correctly

		      var rootVList = buildCommon.makeVList({
		        positionType: "shift",
		        positionData: -toShift,
		        children: [{
		          type: "elem",
		          elem: rootm
		        }]
		      }, options); // Add a class surrounding it so we can add on the appropriate
		      // kerning

		      var rootVListWrap = buildCommon.makeSpan(["root"], [rootVList]);
		      return buildCommon.makeSpan(["mord", "sqrt"], [rootVListWrap, body], options);
		    }
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var body = group.body,
		        index = group.index;
		    return index ? new mathMLTree.MathNode("mroot", [buildMathML_buildGroup(body, options), buildMathML_buildGroup(index, options)]) : new mathMLTree.MathNode("msqrt", [buildMathML_buildGroup(body, options)]);
		  }
		});





		var styling_styleMap = {
		  "display": src_Style.DISPLAY,
		  "text": src_Style.TEXT,
		  "script": src_Style.SCRIPT,
		  "scriptscript": src_Style.SCRIPTSCRIPT
		};
		defineFunction({
		  type: "styling",
		  names: ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"],
		  props: {
		    numArgs: 0,
		    allowedInText: true,
		    primitive: true
		  },
		  handler: function handler(_ref, args) {
		    var breakOnTokenText = _ref.breakOnTokenText,
		        funcName = _ref.funcName,
		        parser = _ref.parser;
		    // parse out the implicit body
		    var body = parser.parseExpression(true, breakOnTokenText); // TODO: Refactor to avoid duplicating styleMap in multiple places (e.g.
		    // here and in buildHTML and de-dupe the enumeration of all the styles).
		    // $FlowFixMe: The names above exactly match the styles.

		    var style = funcName.slice(1, funcName.length - 5);
		    return {
		      type: "styling",
		      mode: parser.mode,
		      // Figure out what style to use by pulling out the style from
		      // the function name
		      style: style,
		      body: body
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Style changes are handled in the TeXbook on pg. 442, Rule 3.
		    var newStyle = styling_styleMap[group.style];
		    var newOptions = options.havingStyle(newStyle).withFont('');
		    return sizingGroup(group.body, newOptions, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    // Figure out what style we're changing to.
		    var newStyle = styling_styleMap[group.style];
		    var newOptions = options.havingStyle(newStyle);
		    var inner = buildMathML_buildExpression(group.body, newOptions);
		    var node = new mathMLTree.MathNode("mstyle", inner);
		    var styleAttributes = {
		      "display": ["0", "true"],
		      "text": ["0", "false"],
		      "script": ["1", "false"],
		      "scriptscript": ["2", "false"]
		    };
		    var attr = styleAttributes[group.style];
		    node.setAttribute("scriptlevel", attr[0]);
		    node.setAttribute("displaystyle", attr[1]);
		    return node;
		  }
		});














		/**
		 * Sometimes, groups perform special rules when they have superscripts or
		 * subscripts attached to them. This function lets the `supsub` group know that
		 * Sometimes, groups perform special rules when they have superscripts or
		 * its inner element should handle the superscripts and subscripts instead of
		 * handling them itself.
		 */
		var htmlBuilderDelegate = function htmlBuilderDelegate(group, options) {
		  var base = group.base;

		  if (!base) {
		    return null;
		  } else if (base.type === "op") {
		    // Operators handle supsubs differently when they have limits
		    // (e.g. `\displaystyle\sum_2^3`)
		    var delegate = base.limits && (options.style.size === src_Style.DISPLAY.size || base.alwaysHandleSupSub);
		    return delegate ? op_htmlBuilder : null;
		  } else if (base.type === "operatorname") {
		    var _delegate = base.alwaysHandleSupSub && (options.style.size === src_Style.DISPLAY.size || base.limits);

		    return _delegate ? operatorname_htmlBuilder : null;
		  } else if (base.type === "accent") {
		    return utils.isCharacterBox(base.base) ? htmlBuilder : null;
		  } else if (base.type === "horizBrace") {
		    var isSup = !group.sub;
		    return isSup === base.isOver ? horizBrace_htmlBuilder : null;
		  } else {
		    return null;
		  }
		}; // Super scripts and subscripts, whose precise placement can depend on other
		// functions that precede them.


		defineFunctionBuilders({
		  type: "supsub",
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Superscript and subscripts are handled in the TeXbook on page
		    // 445-446, rules 18(a-f).
		    // Here is where we defer to the inner group if it should handle
		    // superscripts and subscripts itself.
		    var builderDelegate = htmlBuilderDelegate(group, options);

		    if (builderDelegate) {
		      return builderDelegate(group, options);
		    }

		    var valueBase = group.base,
		        valueSup = group.sup,
		        valueSub = group.sub;
		    var base = buildGroup(valueBase, options);
		    var supm;
		    var subm;
		    var metrics = options.fontMetrics(); // Rule 18a

		    var supShift = 0;
		    var subShift = 0;
		    var isCharacterBox = valueBase && utils.isCharacterBox(valueBase);

		    if (valueSup) {
		      var newOptions = options.havingStyle(options.style.sup());
		      supm = buildGroup(valueSup, newOptions, options);

		      if (!isCharacterBox) {
		        supShift = base.height - newOptions.fontMetrics().supDrop * newOptions.sizeMultiplier / options.sizeMultiplier;
		      }
		    }

		    if (valueSub) {
		      var _newOptions = options.havingStyle(options.style.sub());

		      subm = buildGroup(valueSub, _newOptions, options);

		      if (!isCharacterBox) {
		        subShift = base.depth + _newOptions.fontMetrics().subDrop * _newOptions.sizeMultiplier / options.sizeMultiplier;
		      }
		    } // Rule 18c


		    var minSupShift;

		    if (options.style === src_Style.DISPLAY) {
		      minSupShift = metrics.sup1;
		    } else if (options.style.cramped) {
		      minSupShift = metrics.sup3;
		    } else {
		      minSupShift = metrics.sup2;
		    } // scriptspace is a font-size-independent size, so scale it
		    // appropriately for use as the marginRight.


		    var multiplier = options.sizeMultiplier;
		    var marginRight = makeEm(0.5 / metrics.ptPerEm / multiplier);
		    var marginLeft = null;

		    if (subm) {
		      // Subscripts shouldn't be shifted by the base's italic correction.
		      // Account for that by shifting the subscript back the appropriate
		      // amount. Note we only do this when the base is a single symbol.
		      var isOiint = group.base && group.base.type === "op" && group.base.name && (group.base.name === "\\oiint" || group.base.name === "\\oiiint");

		      if (base instanceof SymbolNode || isOiint) {
		        // $FlowFixMe
		        marginLeft = makeEm(-base.italic);
		      }
		    }

		    var supsub;

		    if (supm && subm) {
		      supShift = Math.max(supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);
		      subShift = Math.max(subShift, metrics.sub2);
		      var ruleWidth = metrics.defaultRuleThickness; // Rule 18e

		      var maxWidth = 4 * ruleWidth;

		      if (supShift - supm.depth - (subm.height - subShift) < maxWidth) {
		        subShift = maxWidth - (supShift - supm.depth) + subm.height;
		        var psi = 0.8 * metrics.xHeight - (supShift - supm.depth);

		        if (psi > 0) {
		          supShift += psi;
		          subShift -= psi;
		        }
		      }

		      var vlistElem = [{
		        type: "elem",
		        elem: subm,
		        shift: subShift,
		        marginRight: marginRight,
		        marginLeft: marginLeft
		      }, {
		        type: "elem",
		        elem: supm,
		        shift: -supShift,
		        marginRight: marginRight
		      }];
		      supsub = buildCommon.makeVList({
		        positionType: "individualShift",
		        children: vlistElem
		      }, options);
		    } else if (subm) {
		      // Rule 18b
		      subShift = Math.max(subShift, metrics.sub1, subm.height - 0.8 * metrics.xHeight);
		      var _vlistElem = [{
		        type: "elem",
		        elem: subm,
		        marginLeft: marginLeft,
		        marginRight: marginRight
		      }];
		      supsub = buildCommon.makeVList({
		        positionType: "shift",
		        positionData: subShift,
		        children: _vlistElem
		      }, options);
		    } else if (supm) {
		      // Rule 18c, d
		      supShift = Math.max(supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);
		      supsub = buildCommon.makeVList({
		        positionType: "shift",
		        positionData: -supShift,
		        children: [{
		          type: "elem",
		          elem: supm,
		          marginRight: marginRight
		        }]
		      }, options);
		    } else {
		      throw new Error("supsub must have either sup or sub.");
		    } // Wrap the supsub vlist in a span.msupsub to reset text-align.


		    var mclass = getTypeOfDomTree(base, "right") || "mord";
		    return buildCommon.makeSpan([mclass], [base, buildCommon.makeSpan(["msupsub"], [supsub])], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    // Is the inner group a relevant horizonal brace?
		    var isBrace = false;
		    var isOver;
		    var isSup;

		    if (group.base && group.base.type === "horizBrace") {
		      isSup = !!group.sup;

		      if (isSup === group.base.isOver) {
		        isBrace = true;
		        isOver = group.base.isOver;
		      }
		    }

		    if (group.base && (group.base.type === "op" || group.base.type === "operatorname")) {
		      group.base.parentIsSupSub = true;
		    }

		    var children = [buildMathML_buildGroup(group.base, options)];

		    if (group.sub) {
		      children.push(buildMathML_buildGroup(group.sub, options));
		    }

		    if (group.sup) {
		      children.push(buildMathML_buildGroup(group.sup, options));
		    }

		    var nodeType;

		    if (isBrace) {
		      nodeType = isOver ? "mover" : "munder";
		    } else if (!group.sub) {
		      var base = group.base;

		      if (base && base.type === "op" && base.limits && (options.style === src_Style.DISPLAY || base.alwaysHandleSupSub)) {
		        nodeType = "mover";
		      } else if (base && base.type === "operatorname" && base.alwaysHandleSupSub && (base.limits || options.style === src_Style.DISPLAY)) {
		        nodeType = "mover";
		      } else {
		        nodeType = "msup";
		      }
		    } else if (!group.sup) {
		      var _base = group.base;

		      if (_base && _base.type === "op" && _base.limits && (options.style === src_Style.DISPLAY || _base.alwaysHandleSupSub)) {
		        nodeType = "munder";
		      } else if (_base && _base.type === "operatorname" && _base.alwaysHandleSupSub && (_base.limits || options.style === src_Style.DISPLAY)) {
		        nodeType = "munder";
		      } else {
		        nodeType = "msub";
		      }
		    } else {
		      var _base2 = group.base;

		      if (_base2 && _base2.type === "op" && _base2.limits && options.style === src_Style.DISPLAY) {
		        nodeType = "munderover";
		      } else if (_base2 && _base2.type === "operatorname" && _base2.alwaysHandleSupSub && (options.style === src_Style.DISPLAY || _base2.limits)) {
		        nodeType = "munderover";
		      } else {
		        nodeType = "msubsup";
		      }
		    }

		    return new mathMLTree.MathNode(nodeType, children);
		  }
		});



		 // Operator ParseNodes created in Parser.js from symbol Groups in src/symbols.js.

		defineFunctionBuilders({
		  type: "atom",
		  htmlBuilder: function htmlBuilder(group, options) {
		    return buildCommon.mathsym(group.text, group.mode, options, ["m" + group.family]);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mo", [makeText(group.text, group.mode)]);

		    if (group.family === "bin") {
		      var variant = getVariant(group, options);

		      if (variant === "bold-italic") {
		        node.setAttribute("mathvariant", variant);
		      }
		    } else if (group.family === "punct") {
		      node.setAttribute("separator", "true");
		    } else if (group.family === "open" || group.family === "close") {
		      // Delims built here should not stretch vertically.
		      // See delimsizing.js for stretchy delims.
		      node.setAttribute("stretchy", "false");
		    }

		    return node;
		  }
		});




		// "mathord" and "textord" ParseNodes created in Parser.js from symbol Groups in
		// src/symbols.js.
		var defaultVariant = {
		  "mi": "italic",
		  "mn": "normal",
		  "mtext": "normal"
		};
		defineFunctionBuilders({
		  type: "mathord",
		  htmlBuilder: function htmlBuilder(group, options) {
		    return buildCommon.makeOrd(group, options, "mathord");
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node = new mathMLTree.MathNode("mi", [makeText(group.text, group.mode, options)]);
		    var variant = getVariant(group, options) || "italic";

		    if (variant !== defaultVariant[node.type]) {
		      node.setAttribute("mathvariant", variant);
		    }

		    return node;
		  }
		});
		defineFunctionBuilders({
		  type: "textord",
		  htmlBuilder: function htmlBuilder(group, options) {
		    return buildCommon.makeOrd(group, options, "textord");
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var text = makeText(group.text, group.mode, options);
		    var variant = getVariant(group, options) || "normal";
		    var node;

		    if (group.mode === 'text') {
		      node = new mathMLTree.MathNode("mtext", [text]);
		    } else if (/[0-9]/.test(group.text)) {
		      node = new mathMLTree.MathNode("mn", [text]);
		    } else if (group.text === "\\prime") {
		      node = new mathMLTree.MathNode("mo", [text]);
		    } else {
		      node = new mathMLTree.MathNode("mi", [text]);
		    }

		    if (variant !== defaultVariant[node.type]) {
		      node.setAttribute("mathvariant", variant);
		    }

		    return node;
		  }
		});



		 // A map of CSS-based spacing functions to their CSS class.

		var cssSpace = {
		  "\\nobreak": "nobreak",
		  "\\allowbreak": "allowbreak"
		}; // A lookup table to determine whether a spacing function/symbol should be
		// treated like a regular space character.  If a symbol or command is a key
		// in this table, then it should be a regular space character.  Furthermore,
		// the associated value may have a `className` specifying an extra CSS class
		// to add to the created `span`.

		var regularSpace = {
		  " ": {},
		  "\\ ": {},
		  "~": {
		    className: "nobreak"
		  },
		  "\\space": {},
		  "\\nobreakspace": {
		    className: "nobreak"
		  }
		}; // ParseNode<"spacing"> created in Parser.js from the "spacing" symbol Groups in
		// src/symbols.js.

		defineFunctionBuilders({
		  type: "spacing",
		  htmlBuilder: function htmlBuilder(group, options) {
		    if (regularSpace.hasOwnProperty(group.text)) {
		      var className = regularSpace[group.text].className || ""; // Spaces are generated by adding an actual space. Each of these
		      // things has an entry in the symbols table, so these will be turned
		      // into appropriate outputs.

		      if (group.mode === "text") {
		        var ord = buildCommon.makeOrd(group, options, "textord");
		        ord.classes.push(className);
		        return ord;
		      } else {
		        return buildCommon.makeSpan(["mspace", className], [buildCommon.mathsym(group.text, group.mode, options)], options);
		      }
		    } else if (cssSpace.hasOwnProperty(group.text)) {
		      // Spaces based on just a CSS class.
		      return buildCommon.makeSpan(["mspace", cssSpace[group.text]], [], options);
		    } else {
		      throw new src_ParseError("Unknown type of space \"" + group.text + "\"");
		    }
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var node;

		    if (regularSpace.hasOwnProperty(group.text)) {
		      node = new mathMLTree.MathNode("mtext", [new mathMLTree.TextNode("\xA0")]);
		    } else if (cssSpace.hasOwnProperty(group.text)) {
		      // CSS-based MathML spaces (\nobreak, \allowbreak) are ignored
		      return new mathMLTree.MathNode("mspace");
		    } else {
		      throw new src_ParseError("Unknown type of space \"" + group.text + "\"");
		    }

		    return node;
		  }
		});




		var pad = function pad() {
		  var padNode = new mathMLTree.MathNode("mtd", []);
		  padNode.setAttribute("width", "50%");
		  return padNode;
		};

		defineFunctionBuilders({
		  type: "tag",
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var table = new mathMLTree.MathNode("mtable", [new mathMLTree.MathNode("mtr", [pad(), new mathMLTree.MathNode("mtd", [buildExpressionRow(group.body, options)]), pad(), new mathMLTree.MathNode("mtd", [buildExpressionRow(group.tag, options)])])]);
		    table.setAttribute("width", "100%");
		    return table; // TODO: Left-aligned tags.
		    // Currently, the group and options passed here do not contain
		    // enough info to set tag alignment. `leqno` is in Settings but it is
		    // not passed to Options. On the HTML side, leqno is
		    // set by a CSS class applied in buildTree.js. That would have worked
		    // in MathML if browsers supported <mlabeledtr>. Since they don't, we
		    // need to rewrite the way this function is called.
		  }
		});



		 // Non-mathy text, possibly in a font

		var textFontFamilies = {
		  "\\text": undefined,
		  "\\textrm": "textrm",
		  "\\textsf": "textsf",
		  "\\texttt": "texttt",
		  "\\textnormal": "textrm"
		};
		var textFontWeights = {
		  "\\textbf": "textbf",
		  "\\textmd": "textmd"
		};
		var textFontShapes = {
		  "\\textit": "textit",
		  "\\textup": "textup"
		};

		var optionsWithFont = function optionsWithFont(group, options) {
		  var font = group.font; // Checks if the argument is a font family or a font style.

		  if (!font) {
		    return options;
		  } else if (textFontFamilies[font]) {
		    return options.withTextFontFamily(textFontFamilies[font]);
		  } else if (textFontWeights[font]) {
		    return options.withTextFontWeight(textFontWeights[font]);
		  } else {
		    return options.withTextFontShape(textFontShapes[font]);
		  }
		};

		defineFunction({
		  type: "text",
		  names: [// Font families
		  "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal", // Font weights
		  "\\textbf", "\\textmd", // Font Shapes
		  "\\textit", "\\textup"],
		  props: {
		    numArgs: 1,
		    argTypes: ["text"],
		    allowedInArgument: true,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser,
		        funcName = _ref.funcName;
		    var body = args[0];
		    return {
		      type: "text",
		      mode: parser.mode,
		      body: ordargument(body),
		      font: funcName
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var newOptions = optionsWithFont(group, options);
		    var inner = buildExpression(group.body, newOptions, true);
		    return buildCommon.makeSpan(["mord", "text"], inner, newOptions);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var newOptions = optionsWithFont(group, options);
		    return buildExpressionRow(group.body, newOptions);
		  }
		});





		defineFunction({
		  type: "underline",
		  names: ["\\underline"],
		  props: {
		    numArgs: 1,
		    allowedInText: true
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "underline",
		      mode: parser.mode,
		      body: args[0]
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    // Underlines are handled in the TeXbook pg 443, Rule 10.
		    // Build the inner group.
		    var innerGroup = buildGroup(group.body, options); // Create the line to go below the body

		    var line = buildCommon.makeLineSpan("underline-line", options); // Generate the vlist, with the appropriate kerns

		    var defaultRuleThickness = options.fontMetrics().defaultRuleThickness;
		    var vlist = buildCommon.makeVList({
		      positionType: "top",
		      positionData: innerGroup.height,
		      children: [{
		        type: "kern",
		        size: defaultRuleThickness
		      }, {
		        type: "elem",
		        elem: line
		      }, {
		        type: "kern",
		        size: 3 * defaultRuleThickness
		      }, {
		        type: "elem",
		        elem: innerGroup
		      }]
		    }, options);
		    return buildCommon.makeSpan(["mord", "underline"], [vlist], options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var operator = new mathMLTree.MathNode("mo", [new mathMLTree.TextNode("\u203E")]);
		    operator.setAttribute("stretchy", "true");
		    var node = new mathMLTree.MathNode("munder", [buildMathML_buildGroup(group.body, options), operator]);
		    node.setAttribute("accentunder", "true");
		    return node;
		  }
		});




		 // \vcenter:  Vertically center the argument group on the math axis.

		defineFunction({
		  type: "vcenter",
		  names: ["\\vcenter"],
		  props: {
		    numArgs: 1,
		    argTypes: ["original"],
		    // In LaTeX, \vcenter can act only on a box.
		    allowedInText: false
		  },
		  handler: function handler(_ref, args) {
		    var parser = _ref.parser;
		    return {
		      type: "vcenter",
		      mode: parser.mode,
		      body: args[0]
		    };
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var body = buildGroup(group.body, options);
		    var axisHeight = options.fontMetrics().axisHeight;
		    var dy = 0.5 * (body.height - axisHeight - (body.depth + axisHeight));
		    return buildCommon.makeVList({
		      positionType: "shift",
		      positionData: dy,
		      children: [{
		        type: "elem",
		        elem: body
		      }]
		    }, options);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    // There is no way to do this in MathML.
		    // Write a class as a breadcrumb in case some post-processor wants
		    // to perform a vcenter adjustment.
		    return new mathMLTree.MathNode("mpadded", [buildMathML_buildGroup(group.body, options)], ["vcenter"]);
		  }
		});




		defineFunction({
		  type: "verb",
		  names: ["\\verb"],
		  props: {
		    numArgs: 0,
		    allowedInText: true
		  },
		  handler: function handler(context, args, optArgs) {
		    // \verb and \verb* are dealt with directly in Parser.js.
		    // If we end up here, it's because of a failure to match the two delimiters
		    // in the regex in Lexer.js.  LaTeX raises the following error when \verb is
		    // terminated by end of line (or file).
		    throw new src_ParseError("\\verb ended by end of line instead of matching delimiter");
		  },
		  htmlBuilder: function htmlBuilder(group, options) {
		    var text = makeVerb(group);
		    var body = []; // \verb enters text mode and therefore is sized like \textstyle

		    var newOptions = options.havingStyle(options.style.text());

		    for (var i = 0; i < text.length; i++) {
		      var c = text[i];

		      if (c === '~') {
		        c = '\\textasciitilde';
		      }

		      body.push(buildCommon.makeSymbol(c, "Typewriter-Regular", group.mode, newOptions, ["mord", "texttt"]));
		    }

		    return buildCommon.makeSpan(["mord", "text"].concat(newOptions.sizingClasses(options)), buildCommon.tryCombineChars(body), newOptions);
		  },
		  mathmlBuilder: function mathmlBuilder(group, options) {
		    var text = new mathMLTree.TextNode(makeVerb(group));
		    var node = new mathMLTree.MathNode("mtext", [text]);
		    node.setAttribute("mathvariant", "monospace");
		    return node;
		  }
		});
		/**
		 * Converts verb group into body string.
		 *
		 * \verb* replaces each space with an open box \u2423
		 * \verb replaces each space with a no-break space \xA0
		 */

		var makeVerb = function makeVerb(group) {
		  return group.body.replace(/ /g, group.star ? "\u2423" : '\xA0');
		};
		/** Include this to ensure that all functions are defined. */

		var functions = _functions;
		/* harmony default export */ var src_functions = (functions); // TODO(kevinb): have functions return an object and call defineFunction with
		/**
		 * The Lexer class handles tokenizing the input in various ways. Since our
		 * parser expects us to be able to backtrack, the lexer allows lexing from any
		 * given starting point.
		 *
		 * Its main exposed function is the `lex` function, which takes a position to
		 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
		 * function.
		 *
		 * The various `_innerLex` functions perform the actual lexing of different
		 * kinds.
		 */




		/* The following tokenRegex
		 * - matches typical whitespace (but not NBSP etc.) using its first group
		 * - does not match any control character \x00-\x1f except whitespace
		 * - does not match a bare backslash
		 * - matches any ASCII character except those just mentioned
		 * - does not match the BMP private use area \uE000-\uF8FF
		 * - does not match bare surrogate code units
		 * - matches any BMP character except for those just described
		 * - matches any valid Unicode surrogate pair
		 * - matches a backslash followed by one or more whitespace characters
		 * - matches a backslash followed by one or more letters then whitespace
		 * - matches a backslash followed by any BMP character
		 * Capturing groups:
		 *   [1] regular whitespace
		 *   [2] backslash followed by whitespace
		 *   [3] anything else, which may include:
		 *     [4] left character of \verb*
		 *     [5] left character of \verb
		 *     [6] backslash followed by word, excluding any trailing whitespace
		 * Just because the Lexer matches something doesn't mean it's valid input:
		 * If there is no matching function or symbol definition, the Parser will
		 * still reject the input.
		 */
		var spaceRegexString = "[ \r\n\t]";
		var controlWordRegexString = "\\\\[a-zA-Z@]+";
		var controlSymbolRegexString = "\\\\[^\uD800-\uDFFF]";
		var controlWordWhitespaceRegexString = "(" + controlWordRegexString + ")" + spaceRegexString + "*";
		var controlSpaceRegexString = "\\\\(\n|[ \r\t]+\n?)[ \r\t]*";
		var combiningDiacriticalMarkString = "[\u0300-\u036F]";
		var combiningDiacriticalMarksEndRegex = new RegExp(combiningDiacriticalMarkString + "+$");
		var tokenRegexString = "(" + spaceRegexString + "+)|" + ( // whitespace
		controlSpaceRegexString + "|") + // \whitespace
		"([!-\\[\\]-\u2027\u202A-\uD7FF\uF900-\uFFFF]" + ( // single codepoint
		combiningDiacriticalMarkString + "*") + // ...plus accents
		"|[\uD800-\uDBFF][\uDC00-\uDFFF]" + ( // surrogate pair
		combiningDiacriticalMarkString + "*") + // ...plus accents
		"|\\\\verb\\*([^]).*?\\4" + // \verb*
		"|\\\\verb([^*a-zA-Z]).*?\\5" + ( // \verb unstarred
		"|" + controlWordWhitespaceRegexString) + ( // \macroName + spaces
		"|" + controlSymbolRegexString + ")"); // \\, \', etc.

		/** Main Lexer class */

		var Lexer = /*#__PURE__*/function () {
		  // Category codes. The lexer only supports comment characters (14) for now.
		  // MacroExpander additionally distinguishes active (13).
		  function Lexer(input, settings) {
		    this.input = void 0;
		    this.settings = void 0;
		    this.tokenRegex = void 0;
		    this.catcodes = void 0;
		    // Separate accents from characters
		    this.input = input;
		    this.settings = settings;
		    this.tokenRegex = new RegExp(tokenRegexString, 'g');
		    this.catcodes = {
		      "%": 14,
		      // comment character
		      "~": 13 // active character

		    };
		  }

		  var _proto = Lexer.prototype;

		  _proto.setCatcode = function setCatcode(char, code) {
		    this.catcodes[char] = code;
		  }
		  /**
		   * This function lexes a single token.
		   */
		  ;

		  _proto.lex = function lex() {
		    var input = this.input;
		    var pos = this.tokenRegex.lastIndex;

		    if (pos === input.length) {
		      return new Token("EOF", new SourceLocation(this, pos, pos));
		    }

		    var match = this.tokenRegex.exec(input);

		    if (match === null || match.index !== pos) {
		      throw new src_ParseError("Unexpected character: '" + input[pos] + "'", new Token(input[pos], new SourceLocation(this, pos, pos + 1)));
		    }

		    var text = match[6] || match[3] || (match[2] ? "\\ " : " ");

		    if (this.catcodes[text] === 14) {
		      // comment character
		      var nlIndex = input.indexOf('\n', this.tokenRegex.lastIndex);

		      if (nlIndex === -1) {
		        this.tokenRegex.lastIndex = input.length; // EOF

		        this.settings.reportNonstrict("commentAtEnd", "% comment has no terminating newline; LaTeX would " + "fail because of commenting the end of math mode (e.g. $)");
		      } else {
		        this.tokenRegex.lastIndex = nlIndex + 1;
		      }

		      return this.lex();
		    }

		    return new Token(text, new SourceLocation(this, pos, this.tokenRegex.lastIndex));
		  };

		  return Lexer;
		}();
		/**
		 * A `Namespace` refers to a space of nameable things like macros or lengths,
		 * which can be `set` either globally or local to a nested group, using an
		 * undo stack similar to how TeX implements this functionality.
		 * Performance-wise, `get` and local `set` take constant time, while global
		 * `set` takes time proportional to the depth of group nesting.
		 */


		var Namespace = /*#__PURE__*/function () {
		  /**
		   * Both arguments are optional.  The first argument is an object of
		   * built-in mappings which never change.  The second argument is an object
		   * of initial (global-level) mappings, which will constantly change
		   * according to any global/top-level `set`s done.
		   */
		  function Namespace(builtins, globalMacros) {
		    if (builtins === void 0) {
		      builtins = {};
		    }

		    if (globalMacros === void 0) {
		      globalMacros = {};
		    }

		    this.current = void 0;
		    this.builtins = void 0;
		    this.undefStack = void 0;
		    this.current = globalMacros;
		    this.builtins = builtins;
		    this.undefStack = [];
		  }
		  /**
		   * Start a new nested group, affecting future local `set`s.
		   */


		  var _proto = Namespace.prototype;

		  _proto.beginGroup = function beginGroup() {
		    this.undefStack.push({});
		  }
		  /**
		   * End current nested group, restoring values before the group began.
		   */
		  ;

		  _proto.endGroup = function endGroup() {
		    if (this.undefStack.length === 0) {
		      throw new src_ParseError("Unbalanced namespace destruction: attempt " + "to pop global namespace; please report this as a bug");
		    }

		    var undefs = this.undefStack.pop();

		    for (var undef in undefs) {
		      if (undefs.hasOwnProperty(undef)) {
		        if (undefs[undef] == null) {
		          delete this.current[undef];
		        } else {
		          this.current[undef] = undefs[undef];
		        }
		      }
		    }
		  }
		  /**
		   * Ends all currently nested groups (if any), restoring values before the
		   * groups began.  Useful in case of an error in the middle of parsing.
		   */
		  ;

		  _proto.endGroups = function endGroups() {
		    while (this.undefStack.length > 0) {
		      this.endGroup();
		    }
		  }
		  /**
		   * Detect whether `name` has a definition.  Equivalent to
		   * `get(name) != null`.
		   */
		  ;

		  _proto.has = function has(name) {
		    return this.current.hasOwnProperty(name) || this.builtins.hasOwnProperty(name);
		  }
		  /**
		   * Get the current value of a name, or `undefined` if there is no value.
		   *
		   * Note: Do not use `if (namespace.get(...))` to detect whether a macro
		   * is defined, as the definition may be the empty string which evaluates
		   * to `false` in JavaScript.  Use `if (namespace.get(...) != null)` or
		   * `if (namespace.has(...))`.
		   */
		  ;

		  _proto.get = function get(name) {
		    if (this.current.hasOwnProperty(name)) {
		      return this.current[name];
		    } else {
		      return this.builtins[name];
		    }
		  }
		  /**
		   * Set the current value of a name, and optionally set it globally too.
		   * Local set() sets the current value and (when appropriate) adds an undo
		   * operation to the undo stack.  Global set() may change the undo
		   * operation at every level, so takes time linear in their number.
		   * A value of undefined means to delete existing definitions.
		   */
		  ;

		  _proto.set = function set(name, value, global) {
		    if (global === void 0) {
		      global = false;
		    }

		    if (global) {
		      // Global set is equivalent to setting in all groups.  Simulate this
		      // by destroying any undos currently scheduled for this name,
		      // and adding an undo with the *new* value (in case it later gets
		      // locally reset within this environment).
		      for (var i = 0; i < this.undefStack.length; i++) {
		        delete this.undefStack[i][name];
		      }

		      if (this.undefStack.length > 0) {
		        this.undefStack[this.undefStack.length - 1][name] = value;
		      }
		    } else {
		      // Undo this set at end of this group (possibly to `undefined`),
		      // unless an undo is already in place, in which case that older
		      // value is the correct one.
		      var top = this.undefStack[this.undefStack.length - 1];

		      if (top && !top.hasOwnProperty(name)) {
		        top[name] = this.current[name];
		      }
		    }

		    if (value == null) {
		      delete this.current[name];
		    } else {
		      this.current[name] = value;
		    }
		  };

		  return Namespace;
		}();
		/**
		 * Predefined macros for KaTeX.
		 * This can be used to define some commands in terms of others.
		 */
		// Export global macros object from defineMacro

		var macros = _macros;
		/* harmony default export */ var src_macros = (macros);





		 //////////////////////////////////////////////////////////////////////
		// macro tools

		defineMacro("\\noexpand", function (context) {
		  // The expansion is the token itself; but that token is interpreted
		  // as if its meaning were ‘\relax’ if it is a control sequence that
		  // would ordinarily be expanded by TeX’s expansion rules.
		  var t = context.popToken();

		  if (context.isExpandable(t.text)) {
		    t.noexpand = true;
		    t.treatAsRelax = true;
		  }

		  return {
		    tokens: [t],
		    numArgs: 0
		  };
		});
		defineMacro("\\expandafter", function (context) {
		  // TeX first reads the token that comes immediately after \expandafter,
		  // without expanding it; let’s call this token t. Then TeX reads the
		  // token that comes after t (and possibly more tokens, if that token
		  // has an argument), replacing it by its expansion. Finally TeX puts
		  // t back in front of that expansion.
		  var t = context.popToken();
		  context.expandOnce(true); // expand only an expandable token

		  return {
		    tokens: [t],
		    numArgs: 0
		  };
		}); // LaTeX's \@firstoftwo{#1}{#2} expands to #1, skipping #2
		// TeX source: \long\def\@firstoftwo#1#2{#1}

		defineMacro("\\@firstoftwo", function (context) {
		  var args = context.consumeArgs(2);
		  return {
		    tokens: args[0],
		    numArgs: 0
		  };
		}); // LaTeX's \@secondoftwo{#1}{#2} expands to #2, skipping #1
		// TeX source: \long\def\@secondoftwo#1#2{#2}

		defineMacro("\\@secondoftwo", function (context) {
		  var args = context.consumeArgs(2);
		  return {
		    tokens: args[1],
		    numArgs: 0
		  };
		}); // LaTeX's \@ifnextchar{#1}{#2}{#3} looks ahead to the next (unexpanded)
		// symbol that isn't a space, consuming any spaces but not consuming the
		// first nonspace character.  If that nonspace character matches #1, then
		// the macro expands to #2; otherwise, it expands to #3.

		defineMacro("\\@ifnextchar", function (context) {
		  var args = context.consumeArgs(3); // symbol, if, else

		  context.consumeSpaces();
		  var nextToken = context.future();

		  if (args[0].length === 1 && args[0][0].text === nextToken.text) {
		    return {
		      tokens: args[1],
		      numArgs: 0
		    };
		  } else {
		    return {
		      tokens: args[2],
		      numArgs: 0
		    };
		  }
		}); // LaTeX's \@ifstar{#1}{#2} looks ahead to the next (unexpanded) symbol.
		// If it is `*`, then it consumes the symbol, and the macro expands to #1;
		// otherwise, the macro expands to #2 (without consuming the symbol).
		// TeX source: \def\@ifstar#1{\@ifnextchar *{\@firstoftwo{#1}}}

		defineMacro("\\@ifstar", "\\@ifnextchar *{\\@firstoftwo{#1}}"); // LaTeX's \TextOrMath{#1}{#2} expands to #1 in text mode, #2 in math mode

		defineMacro("\\TextOrMath", function (context) {
		  var args = context.consumeArgs(2);

		  if (context.mode === 'text') {
		    return {
		      tokens: args[0],
		      numArgs: 0
		    };
		  } else {
		    return {
		      tokens: args[1],
		      numArgs: 0
		    };
		  }
		}); // Lookup table for parsing numbers in base 8 through 16

		var digitToNumber = {
		  "0": 0,
		  "1": 1,
		  "2": 2,
		  "3": 3,
		  "4": 4,
		  "5": 5,
		  "6": 6,
		  "7": 7,
		  "8": 8,
		  "9": 9,
		  "a": 10,
		  "A": 10,
		  "b": 11,
		  "B": 11,
		  "c": 12,
		  "C": 12,
		  "d": 13,
		  "D": 13,
		  "e": 14,
		  "E": 14,
		  "f": 15,
		  "F": 15
		}; // TeX \char makes a literal character (catcode 12) using the following forms:
		// (see The TeXBook, p. 43)
		//   \char123  -- decimal
		//   \char'123 -- octal
		//   \char"123 -- hex
		//   \char`x   -- character that can be written (i.e. isn't active)
		//   \char`\x  -- character that cannot be written (e.g. %)
		// These all refer to characters from the font, so we turn them into special
		// calls to a function \@char dealt with in the Parser.

		defineMacro("\\char", function (context) {
		  var token = context.popToken();
		  var base;
		  var number = '';

		  if (token.text === "'") {
		    base = 8;
		    token = context.popToken();
		  } else if (token.text === '"') {
		    base = 16;
		    token = context.popToken();
		  } else if (token.text === "`") {
		    token = context.popToken();

		    if (token.text[0] === "\\") {
		      number = token.text.charCodeAt(1);
		    } else if (token.text === "EOF") {
		      throw new src_ParseError("\\char` missing argument");
		    } else {
		      number = token.text.charCodeAt(0);
		    }
		  } else {
		    base = 10;
		  }

		  if (base) {
		    // Parse a number in the given base, starting with first `token`.
		    number = digitToNumber[token.text];

		    if (number == null || number >= base) {
		      throw new src_ParseError("Invalid base-" + base + " digit " + token.text);
		    }

		    var digit;

		    while ((digit = digitToNumber[context.future().text]) != null && digit < base) {
		      number *= base;
		      number += digit;
		      context.popToken();
		    }
		  }

		  return "\\@char{" + number + "}";
		}); // \newcommand{\macro}[args]{definition}
		// \renewcommand{\macro}[args]{definition}
		// TODO: Optional arguments: \newcommand{\macro}[args][default]{definition}

		var newcommand = function newcommand(context, existsOK, nonexistsOK) {
		  var arg = context.consumeArg().tokens;

		  if (arg.length !== 1) {
		    throw new src_ParseError("\\newcommand's first argument must be a macro name");
		  }

		  var name = arg[0].text;
		  var exists = context.isDefined(name);

		  if (exists && !existsOK) {
		    throw new src_ParseError("\\newcommand{" + name + "} attempting to redefine " + (name + "; use \\renewcommand"));
		  }

		  if (!exists && !nonexistsOK) {
		    throw new src_ParseError("\\renewcommand{" + name + "} when command " + name + " " + "does not yet exist; use \\newcommand");
		  }

		  var numArgs = 0;
		  arg = context.consumeArg().tokens;

		  if (arg.length === 1 && arg[0].text === "[") {
		    var argText = '';
		    var token = context.expandNextToken();

		    while (token.text !== "]" && token.text !== "EOF") {
		      // TODO: Should properly expand arg, e.g., ignore {}s
		      argText += token.text;
		      token = context.expandNextToken();
		    }

		    if (!argText.match(/^\s*[0-9]+\s*$/)) {
		      throw new src_ParseError("Invalid number of arguments: " + argText);
		    }

		    numArgs = parseInt(argText);
		    arg = context.consumeArg().tokens;
		  } // Final arg is the expansion of the macro


		  context.macros.set(name, {
		    tokens: arg,
		    numArgs: numArgs
		  });
		  return '';
		};

		defineMacro("\\newcommand", function (context) {
		  return newcommand(context, false, true);
		});
		defineMacro("\\renewcommand", function (context) {
		  return newcommand(context, true, false);
		});
		defineMacro("\\providecommand", function (context) {
		  return newcommand(context, true, true);
		}); // terminal (console) tools

		defineMacro("\\message", function (context) {
		  var arg = context.consumeArgs(1)[0]; // eslint-disable-next-line no-console

		  console.log(arg.reverse().map(function (token) {
		    return token.text;
		  }).join(""));
		  return '';
		});
		defineMacro("\\errmessage", function (context) {
		  var arg = context.consumeArgs(1)[0]; // eslint-disable-next-line no-console

		  console.error(arg.reverse().map(function (token) {
		    return token.text;
		  }).join(""));
		  return '';
		});
		defineMacro("\\show", function (context) {
		  var tok = context.popToken();
		  var name = tok.text; // eslint-disable-next-line no-console

		  console.log(tok, context.macros.get(name), src_functions[name], src_symbols.math[name], src_symbols.text[name]);
		  return '';
		}); //////////////////////////////////////////////////////////////////////
		// Grouping
		// \let\bgroup={ \let\egroup=}

		defineMacro("\\bgroup", "{");
		defineMacro("\\egroup", "}"); // Symbols from latex.ltx:
		// \def~{\nobreakspace{}}
		// \def\lq{`}
		// \def\rq{'}
		// \def \aa {\r a}
		// \def \AA {\r A}

		defineMacro("~", "\\nobreakspace");
		defineMacro("\\lq", "`");
		defineMacro("\\rq", "'");
		defineMacro("\\aa", "\\r a");
		defineMacro("\\AA", "\\r A"); // Copyright (C) and registered (R) symbols. Use raw symbol in MathML.
		// \DeclareTextCommandDefault{\textcopyright}{\textcircled{c}}
		// \DeclareTextCommandDefault{\textregistered}{\textcircled{%
		//      \check@mathfonts\fontsize\sf@size\z@\math@fontsfalse\selectfont R}}
		// \DeclareRobustCommand{\copyright}{%
		//    \ifmmode{\nfss@text{\textcopyright}}\else\textcopyright\fi}

		defineMacro("\\textcopyright", "\\html@mathml{\\textcircled{c}}{\\char`©}");
		defineMacro("\\copyright", "\\TextOrMath{\\textcopyright}{\\text{\\textcopyright}}");
		defineMacro("\\textregistered", "\\html@mathml{\\textcircled{\\scriptsize R}}{\\char`®}"); // Characters omitted from Unicode range 1D400–1D7FF

		defineMacro("\u212C", "\\mathscr{B}"); // script

		defineMacro("\u2130", "\\mathscr{E}");
		defineMacro("\u2131", "\\mathscr{F}");
		defineMacro("\u210B", "\\mathscr{H}");
		defineMacro("\u2110", "\\mathscr{I}");
		defineMacro("\u2112", "\\mathscr{L}");
		defineMacro("\u2133", "\\mathscr{M}");
		defineMacro("\u211B", "\\mathscr{R}");
		defineMacro("\u212D", "\\mathfrak{C}"); // Fraktur

		defineMacro("\u210C", "\\mathfrak{H}");
		defineMacro("\u2128", "\\mathfrak{Z}"); // Define \Bbbk with a macro that works in both HTML and MathML.

		defineMacro("\\Bbbk", "\\Bbb{k}"); // Unicode middle dot
		// The KaTeX fonts do not contain U+00B7. Instead, \cdotp displays
		// the dot at U+22C5 and gives it punct spacing.

		defineMacro("\xB7", "\\cdotp"); // \llap and \rlap render their contents in text mode

		defineMacro("\\llap", "\\mathllap{\\textrm{#1}}");
		defineMacro("\\rlap", "\\mathrlap{\\textrm{#1}}");
		defineMacro("\\clap", "\\mathclap{\\textrm{#1}}"); // \mathstrut from the TeXbook, p 360

		defineMacro("\\mathstrut", "\\vphantom{(}"); // \underbar from TeXbook p 353

		defineMacro("\\underbar", "\\underline{\\text{#1}}"); // \not is defined by base/fontmath.ltx via
		// \DeclareMathSymbol{\not}{\mathrel}{symbols}{"36}
		// It's thus treated like a \mathrel, but defined by a symbol that has zero
		// width but extends to the right.  We use \rlap to get that spacing.
		// For MathML we write U+0338 here. buildMathML.js will then do the overlay.

		defineMacro("\\not", '\\html@mathml{\\mathrel{\\mathrlap\\@not}}{\\char"338}'); // Negated symbols from base/fontmath.ltx:
		// \def\neq{\not=} \let\ne=\neq
		// \DeclareRobustCommand
		//   \notin{\mathrel{\m@th\mathpalette\c@ncel\in}}
		// \def\c@ncel#1#2{\m@th\ooalign{$\hfil#1\mkern1mu/\hfil$\crcr$#1#2$}}

		defineMacro("\\neq", "\\html@mathml{\\mathrel{\\not=}}{\\mathrel{\\char`≠}}");
		defineMacro("\\ne", "\\neq");
		defineMacro("\u2260", "\\neq");
		defineMacro("\\notin", "\\html@mathml{\\mathrel{{\\in}\\mathllap{/\\mskip1mu}}}" + "{\\mathrel{\\char`∉}}");
		defineMacro("\u2209", "\\notin"); // Unicode stacked relations

		defineMacro("\u2258", "\\html@mathml{" + "\\mathrel{=\\kern{-1em}\\raisebox{0.4em}{$\\scriptsize\\frown$}}" + "}{\\mathrel{\\char`\u2258}}");
		defineMacro("\u2259", "\\html@mathml{\\stackrel{\\tiny\\wedge}{=}}{\\mathrel{\\char`\u2258}}");
		defineMacro("\u225A", "\\html@mathml{\\stackrel{\\tiny\\vee}{=}}{\\mathrel{\\char`\u225A}}");
		defineMacro("\u225B", "\\html@mathml{\\stackrel{\\scriptsize\\star}{=}}" + "{\\mathrel{\\char`\u225B}}");
		defineMacro("\u225D", "\\html@mathml{\\stackrel{\\tiny\\mathrm{def}}{=}}" + "{\\mathrel{\\char`\u225D}}");
		defineMacro("\u225E", "\\html@mathml{\\stackrel{\\tiny\\mathrm{m}}{=}}" + "{\\mathrel{\\char`\u225E}}");
		defineMacro("\u225F", "\\html@mathml{\\stackrel{\\tiny?}{=}}{\\mathrel{\\char`\u225F}}"); // Misc Unicode

		defineMacro("\u27C2", "\\perp");
		defineMacro("\u203C", "\\mathclose{!\\mkern-0.8mu!}");
		defineMacro("\u220C", "\\notni");
		defineMacro("\u231C", "\\ulcorner");
		defineMacro("\u231D", "\\urcorner");
		defineMacro("\u231E", "\\llcorner");
		defineMacro("\u231F", "\\lrcorner");
		defineMacro("\xA9", "\\copyright");
		defineMacro("\xAE", "\\textregistered");
		defineMacro("\uFE0F", "\\textregistered"); // The KaTeX fonts have corners at codepoints that don't match Unicode.
		// For MathML purposes, use the Unicode code point.

		defineMacro("\\ulcorner", "\\html@mathml{\\@ulcorner}{\\mathop{\\char\"231c}}");
		defineMacro("\\urcorner", "\\html@mathml{\\@urcorner}{\\mathop{\\char\"231d}}");
		defineMacro("\\llcorner", "\\html@mathml{\\@llcorner}{\\mathop{\\char\"231e}}");
		defineMacro("\\lrcorner", "\\html@mathml{\\@lrcorner}{\\mathop{\\char\"231f}}"); //////////////////////////////////////////////////////////////////////
		// LaTeX_2ε
		// \vdots{\vbox{\baselineskip4\p@  \lineskiplimit\z@
		// \kern6\p@\hbox{.}\hbox{.}\hbox{.}}}
		// We'll call \varvdots, which gets a glyph from symbols.js.
		// The zero-width rule gets us an equivalent to the vertical 6pt kern.

		defineMacro("\\vdots", "\\mathord{\\varvdots\\rule{0pt}{15pt}}");
		defineMacro("\u22EE", "\\vdots"); //////////////////////////////////////////////////////////////////////
		// amsmath.sty
		// http://mirrors.concertpass.com/tex-archive/macros/latex/required/amsmath/amsmath.pdf
		// Italic Greek capital letters.  AMS defines these with \DeclareMathSymbol,
		// but they are equivalent to \mathit{\Letter}.

		defineMacro("\\varGamma", "\\mathit{\\Gamma}");
		defineMacro("\\varDelta", "\\mathit{\\Delta}");
		defineMacro("\\varTheta", "\\mathit{\\Theta}");
		defineMacro("\\varLambda", "\\mathit{\\Lambda}");
		defineMacro("\\varXi", "\\mathit{\\Xi}");
		defineMacro("\\varPi", "\\mathit{\\Pi}");
		defineMacro("\\varSigma", "\\mathit{\\Sigma}");
		defineMacro("\\varUpsilon", "\\mathit{\\Upsilon}");
		defineMacro("\\varPhi", "\\mathit{\\Phi}");
		defineMacro("\\varPsi", "\\mathit{\\Psi}");
		defineMacro("\\varOmega", "\\mathit{\\Omega}"); //\newcommand{\substack}[1]{\subarray{c}#1\endsubarray}

		defineMacro("\\substack", "\\begin{subarray}{c}#1\\end{subarray}"); // \renewcommand{\colon}{\nobreak\mskip2mu\mathpunct{}\nonscript
		// \mkern-\thinmuskip{:}\mskip6muplus1mu\relax}

		defineMacro("\\colon", "\\nobreak\\mskip2mu\\mathpunct{}" + "\\mathchoice{\\mkern-3mu}{\\mkern-3mu}{}{}{:}\\mskip6mu\\relax"); // \newcommand{\boxed}[1]{\fbox{\m@th$\displaystyle#1$}}

		defineMacro("\\boxed", "\\fbox{$\\displaystyle{#1}$}"); // \def\iff{\DOTSB\;\Longleftrightarrow\;}
		// \def\implies{\DOTSB\;\Longrightarrow\;}
		// \def\impliedby{\DOTSB\;\Longleftarrow\;}

		defineMacro("\\iff", "\\DOTSB\\;\\Longleftrightarrow\\;");
		defineMacro("\\implies", "\\DOTSB\\;\\Longrightarrow\\;");
		defineMacro("\\impliedby", "\\DOTSB\\;\\Longleftarrow\\;"); // AMSMath's automatic \dots, based on \mdots@@ macro.

		var dotsByToken = {
		  ',': '\\dotsc',
		  '\\not': '\\dotsb',
		  // \keybin@ checks for the following:
		  '+': '\\dotsb',
		  '=': '\\dotsb',
		  '<': '\\dotsb',
		  '>': '\\dotsb',
		  '-': '\\dotsb',
		  '*': '\\dotsb',
		  ':': '\\dotsb',
		  // Symbols whose definition starts with \DOTSB:
		  '\\DOTSB': '\\dotsb',
		  '\\coprod': '\\dotsb',
		  '\\bigvee': '\\dotsb',
		  '\\bigwedge': '\\dotsb',
		  '\\biguplus': '\\dotsb',
		  '\\bigcap': '\\dotsb',
		  '\\bigcup': '\\dotsb',
		  '\\prod': '\\dotsb',
		  '\\sum': '\\dotsb',
		  '\\bigotimes': '\\dotsb',
		  '\\bigoplus': '\\dotsb',
		  '\\bigodot': '\\dotsb',
		  '\\bigsqcup': '\\dotsb',
		  '\\And': '\\dotsb',
		  '\\longrightarrow': '\\dotsb',
		  '\\Longrightarrow': '\\dotsb',
		  '\\longleftarrow': '\\dotsb',
		  '\\Longleftarrow': '\\dotsb',
		  '\\longleftrightarrow': '\\dotsb',
		  '\\Longleftrightarrow': '\\dotsb',
		  '\\mapsto': '\\dotsb',
		  '\\longmapsto': '\\dotsb',
		  '\\hookrightarrow': '\\dotsb',
		  '\\doteq': '\\dotsb',
		  // Symbols whose definition starts with \mathbin:
		  '\\mathbin': '\\dotsb',
		  // Symbols whose definition starts with \mathrel:
		  '\\mathrel': '\\dotsb',
		  '\\relbar': '\\dotsb',
		  '\\Relbar': '\\dotsb',
		  '\\xrightarrow': '\\dotsb',
		  '\\xleftarrow': '\\dotsb',
		  // Symbols whose definition starts with \DOTSI:
		  '\\DOTSI': '\\dotsi',
		  '\\int': '\\dotsi',
		  '\\oint': '\\dotsi',
		  '\\iint': '\\dotsi',
		  '\\iiint': '\\dotsi',
		  '\\iiiint': '\\dotsi',
		  '\\idotsint': '\\dotsi',
		  // Symbols whose definition starts with \DOTSX:
		  '\\DOTSX': '\\dotsx'
		};
		defineMacro("\\dots", function (context) {
		  // TODO: If used in text mode, should expand to \textellipsis.
		  // However, in KaTeX, \textellipsis and \ldots behave the same
		  // (in text mode), and it's unlikely we'd see any of the math commands
		  // that affect the behavior of \dots when in text mode.  So fine for now
		  // (until we support \ifmmode ... \else ... \fi).
		  var thedots = '\\dotso';
		  var next = context.expandAfterFuture().text;

		  if (next in dotsByToken) {
		    thedots = dotsByToken[next];
		  } else if (next.slice(0, 4) === '\\not') {
		    thedots = '\\dotsb';
		  } else if (next in src_symbols.math) {
		    if (utils.contains(['bin', 'rel'], src_symbols.math[next].group)) {
		      thedots = '\\dotsb';
		    }
		  }

		  return thedots;
		});
		var spaceAfterDots = {
		  // \rightdelim@ checks for the following:
		  ')': true,
		  ']': true,
		  '\\rbrack': true,
		  '\\}': true,
		  '\\rbrace': true,
		  '\\rangle': true,
		  '\\rceil': true,
		  '\\rfloor': true,
		  '\\rgroup': true,
		  '\\rmoustache': true,
		  '\\right': true,
		  '\\bigr': true,
		  '\\biggr': true,
		  '\\Bigr': true,
		  '\\Biggr': true,
		  // \extra@ also tests for the following:
		  '$': true,
		  // \extrap@ checks for the following:
		  ';': true,
		  '.': true,
		  ',': true
		};
		defineMacro("\\dotso", function (context) {
		  var next = context.future().text;

		  if (next in spaceAfterDots) {
		    return "\\ldots\\,";
		  } else {
		    return "\\ldots";
		  }
		});
		defineMacro("\\dotsc", function (context) {
		  var next = context.future().text; // \dotsc uses \extra@ but not \extrap@, instead specially checking for
		  // ';' and '.', but doesn't check for ','.

		  if (next in spaceAfterDots && next !== ',') {
		    return "\\ldots\\,";
		  } else {
		    return "\\ldots";
		  }
		});
		defineMacro("\\cdots", function (context) {
		  var next = context.future().text;

		  if (next in spaceAfterDots) {
		    return "\\@cdots\\,";
		  } else {
		    return "\\@cdots";
		  }
		});
		defineMacro("\\dotsb", "\\cdots");
		defineMacro("\\dotsm", "\\cdots");
		defineMacro("\\dotsi", "\\!\\cdots"); // amsmath doesn't actually define \dotsx, but \dots followed by a macro
		// starting with \DOTSX implies \dotso, and then \extra@ detects this case
		// and forces the added `\,`.

		defineMacro("\\dotsx", "\\ldots\\,"); // \let\DOTSI\relax
		// \let\DOTSB\relax
		// \let\DOTSX\relax

		defineMacro("\\DOTSI", "\\relax");
		defineMacro("\\DOTSB", "\\relax");
		defineMacro("\\DOTSX", "\\relax"); // Spacing, based on amsmath.sty's override of LaTeX defaults
		// \DeclareRobustCommand{\tmspace}[3]{%
		//   \ifmmode\mskip#1#2\else\kern#1#3\fi\relax}

		defineMacro("\\tmspace", "\\TextOrMath{\\kern#1#3}{\\mskip#1#2}\\relax"); // \renewcommand{\,}{\tmspace+\thinmuskip{.1667em}}
		// TODO: math mode should use \thinmuskip

		defineMacro("\\,", "\\tmspace+{3mu}{.1667em}"); // \let\thinspace\,

		defineMacro("\\thinspace", "\\,"); // \def\>{\mskip\medmuskip}
		// \renewcommand{\:}{\tmspace+\medmuskip{.2222em}}
		// TODO: \> and math mode of \: should use \medmuskip = 4mu plus 2mu minus 4mu

		defineMacro("\\>", "\\mskip{4mu}");
		defineMacro("\\:", "\\tmspace+{4mu}{.2222em}"); // \let\medspace\:

		defineMacro("\\medspace", "\\:"); // \renewcommand{\;}{\tmspace+\thickmuskip{.2777em}}
		// TODO: math mode should use \thickmuskip = 5mu plus 5mu

		defineMacro("\\;", "\\tmspace+{5mu}{.2777em}"); // \let\thickspace\;

		defineMacro("\\thickspace", "\\;"); // \renewcommand{\!}{\tmspace-\thinmuskip{.1667em}}
		// TODO: math mode should use \thinmuskip

		defineMacro("\\!", "\\tmspace-{3mu}{.1667em}"); // \let\negthinspace\!

		defineMacro("\\negthinspace", "\\!"); // \newcommand{\negmedspace}{\tmspace-\medmuskip{.2222em}}
		// TODO: math mode should use \medmuskip

		defineMacro("\\negmedspace", "\\tmspace-{4mu}{.2222em}"); // \newcommand{\negthickspace}{\tmspace-\thickmuskip{.2777em}}
		// TODO: math mode should use \thickmuskip

		defineMacro("\\negthickspace", "\\tmspace-{5mu}{.277em}"); // \def\enspace{\kern.5em }

		defineMacro("\\enspace", "\\kern.5em "); // \def\enskip{\hskip.5em\relax}

		defineMacro("\\enskip", "\\hskip.5em\\relax"); // \def\quad{\hskip1em\relax}

		defineMacro("\\quad", "\\hskip1em\\relax"); // \def\qquad{\hskip2em\relax}

		defineMacro("\\qquad", "\\hskip2em\\relax"); // \tag@in@display form of \tag

		defineMacro("\\tag", "\\@ifstar\\tag@literal\\tag@paren");
		defineMacro("\\tag@paren", "\\tag@literal{({#1})}");
		defineMacro("\\tag@literal", function (context) {
		  if (context.macros.get("\\df@tag")) {
		    throw new src_ParseError("Multiple \\tag");
		  }

		  return "\\gdef\\df@tag{\\text{#1}}";
		}); // \renewcommand{\bmod}{\nonscript\mskip-\medmuskip\mkern5mu\mathbin
		//   {\operator@font mod}\penalty900
		//   \mkern5mu\nonscript\mskip-\medmuskip}
		// \newcommand{\pod}[1]{\allowbreak
		//   \if@display\mkern18mu\else\mkern8mu\fi(#1)}
		// \renewcommand{\pmod}[1]{\pod{{\operator@font mod}\mkern6mu#1}}
		// \newcommand{\mod}[1]{\allowbreak\if@display\mkern18mu
		//   \else\mkern12mu\fi{\operator@font mod}\,\,#1}
		// TODO: math mode should use \medmuskip = 4mu plus 2mu minus 4mu

		defineMacro("\\bmod", "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}" + "\\mathbin{\\rm mod}" + "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}");
		defineMacro("\\pod", "\\allowbreak" + "\\mathchoice{\\mkern18mu}{\\mkern8mu}{\\mkern8mu}{\\mkern8mu}(#1)");
		defineMacro("\\pmod", "\\pod{{\\rm mod}\\mkern6mu#1}");
		defineMacro("\\mod", "\\allowbreak" + "\\mathchoice{\\mkern18mu}{\\mkern12mu}{\\mkern12mu}{\\mkern12mu}" + "{\\rm mod}\\,\\,#1"); //////////////////////////////////////////////////////////////////////
		// LaTeX source2e
		// \expandafter\let\expandafter\@normalcr
		//     \csname\expandafter\@gobble\string\\ \endcsname
		// \DeclareRobustCommand\newline{\@normalcr\relax}

		defineMacro("\\newline", "\\\\\\relax"); // \def\TeX{T\kern-.1667em\lower.5ex\hbox{E}\kern-.125emX\@}
		// TODO: Doesn't normally work in math mode because \@ fails.  KaTeX doesn't
		// support \@ yet, so that's omitted, and we add \text so that the result
		// doesn't look funny in math mode.

		defineMacro("\\TeX", "\\textrm{\\html@mathml{" + "T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX" + "}{TeX}}"); // \DeclareRobustCommand{\LaTeX}{L\kern-.36em%
		//         {\sbox\z@ T%
		//          \vbox to\ht\z@{\hbox{\check@mathfonts
		//                               \fontsize\sf@size\z@
		//                               \math@fontsfalse\selectfont
		//                               A}%
		//                         \vss}%
		//         }%
		//         \kern-.15em%
		//         \TeX}
		// This code aligns the top of the A with the T (from the perspective of TeX's
		// boxes, though visually the A appears to extend above slightly).
		// We compute the corresponding \raisebox when A is rendered in \normalsize
		// \scriptstyle, which has a scale factor of 0.7 (see Options.js).

		var latexRaiseA = makeEm(fontMetricsData["Main-Regular"]["T".charCodeAt(0)][1] - 0.7 * fontMetricsData["Main-Regular"]["A".charCodeAt(0)][1]);
		defineMacro("\\LaTeX", "\\textrm{\\html@mathml{" + ("L\\kern-.36em\\raisebox{" + latexRaiseA + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{LaTeX}}"); // New KaTeX logo based on tweaking LaTeX logo

		defineMacro("\\KaTeX", "\\textrm{\\html@mathml{" + ("K\\kern-.17em\\raisebox{" + latexRaiseA + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{KaTeX}}"); // \DeclareRobustCommand\hspace{\@ifstar\@hspacer\@hspace}
		// \def\@hspace#1{\hskip  #1\relax}
		// \def\@hspacer#1{\vrule \@width\z@\nobreak
		//                 \hskip #1\hskip \z@skip}

		defineMacro("\\hspace", "\\@ifstar\\@hspacer\\@hspace");
		defineMacro("\\@hspace", "\\hskip #1\\relax");
		defineMacro("\\@hspacer", "\\rule{0pt}{0pt}\\hskip #1\\relax"); //////////////////////////////////////////////////////////////////////
		// mathtools.sty
		//\providecommand\ordinarycolon{:}

		defineMacro("\\ordinarycolon", ":"); //\def\vcentcolon{\mathrel{\mathop\ordinarycolon}}
		//TODO(edemaine): Not yet centered. Fix via \raisebox or #726

		defineMacro("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}"); // \providecommand*\dblcolon{\vcentcolon\mathrel{\mkern-.9mu}\vcentcolon}

		defineMacro("\\dblcolon", "\\html@mathml{" + "\\mathrel{\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon}}" + "{\\mathop{\\char\"2237}}"); // \providecommand*\coloneqq{\vcentcolon\mathrel{\mkern-1.2mu}=}

		defineMacro("\\coloneqq", "\\html@mathml{" + "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}=}}" + "{\\mathop{\\char\"2254}}"); // ≔
		// \providecommand*\Coloneqq{\dblcolon\mathrel{\mkern-1.2mu}=}

		defineMacro("\\Coloneqq", "\\html@mathml{" + "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}=}}" + "{\\mathop{\\char\"2237\\char\"3d}}"); // \providecommand*\coloneq{\vcentcolon\mathrel{\mkern-1.2mu}\mathrel{-}}

		defineMacro("\\coloneq", "\\html@mathml{" + "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}" + "{\\mathop{\\char\"3a\\char\"2212}}"); // \providecommand*\Coloneq{\dblcolon\mathrel{\mkern-1.2mu}\mathrel{-}}

		defineMacro("\\Coloneq", "\\html@mathml{" + "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}" + "{\\mathop{\\char\"2237\\char\"2212}}"); // \providecommand*\eqqcolon{=\mathrel{\mkern-1.2mu}\vcentcolon}

		defineMacro("\\eqqcolon", "\\html@mathml{" + "\\mathrel{=\\mathrel{\\mkern-1.2mu}\\vcentcolon}}" + "{\\mathop{\\char\"2255}}"); // ≕
		// \providecommand*\Eqqcolon{=\mathrel{\mkern-1.2mu}\dblcolon}

		defineMacro("\\Eqqcolon", "\\html@mathml{" + "\\mathrel{=\\mathrel{\\mkern-1.2mu}\\dblcolon}}" + "{\\mathop{\\char\"3d\\char\"2237}}"); // \providecommand*\eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\vcentcolon}

		defineMacro("\\eqcolon", "\\html@mathml{" + "\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon}}" + "{\\mathop{\\char\"2239}}"); // \providecommand*\Eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\dblcolon}

		defineMacro("\\Eqcolon", "\\html@mathml{" + "\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon}}" + "{\\mathop{\\char\"2212\\char\"2237}}"); // \providecommand*\colonapprox{\vcentcolon\mathrel{\mkern-1.2mu}\approx}

		defineMacro("\\colonapprox", "\\html@mathml{" + "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx}}" + "{\\mathop{\\char\"3a\\char\"2248}}"); // \providecommand*\Colonapprox{\dblcolon\mathrel{\mkern-1.2mu}\approx}

		defineMacro("\\Colonapprox", "\\html@mathml{" + "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx}}" + "{\\mathop{\\char\"2237\\char\"2248}}"); // \providecommand*\colonsim{\vcentcolon\mathrel{\mkern-1.2mu}\sim}

		defineMacro("\\colonsim", "\\html@mathml{" + "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim}}" + "{\\mathop{\\char\"3a\\char\"223c}}"); // \providecommand*\Colonsim{\dblcolon\mathrel{\mkern-1.2mu}\sim}

		defineMacro("\\Colonsim", "\\html@mathml{" + "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim}}" + "{\\mathop{\\char\"2237\\char\"223c}}"); // Some Unicode characters are implemented with macros to mathtools functions.

		defineMacro("\u2237", "\\dblcolon"); // ::

		defineMacro("\u2239", "\\eqcolon"); // -:

		defineMacro("\u2254", "\\coloneqq"); // :=

		defineMacro("\u2255", "\\eqqcolon"); // =:

		defineMacro("\u2A74", "\\Coloneqq"); // ::=
		//////////////////////////////////////////////////////////////////////
		// colonequals.sty
		// Alternate names for mathtools's macros:

		defineMacro("\\ratio", "\\vcentcolon");
		defineMacro("\\coloncolon", "\\dblcolon");
		defineMacro("\\colonequals", "\\coloneqq");
		defineMacro("\\coloncolonequals", "\\Coloneqq");
		defineMacro("\\equalscolon", "\\eqqcolon");
		defineMacro("\\equalscoloncolon", "\\Eqqcolon");
		defineMacro("\\colonminus", "\\coloneq");
		defineMacro("\\coloncolonminus", "\\Coloneq");
		defineMacro("\\minuscolon", "\\eqcolon");
		defineMacro("\\minuscoloncolon", "\\Eqcolon"); // \colonapprox name is same in mathtools and colonequals.

		defineMacro("\\coloncolonapprox", "\\Colonapprox"); // \colonsim name is same in mathtools and colonequals.

		defineMacro("\\coloncolonsim", "\\Colonsim"); // Additional macros, implemented by analogy with mathtools definitions:

		defineMacro("\\simcolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
		defineMacro("\\simcoloncolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon}");
		defineMacro("\\approxcolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
		defineMacro("\\approxcoloncolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon}"); // Present in newtxmath, pxfonts and txfonts

		defineMacro("\\notni", "\\html@mathml{\\not\\ni}{\\mathrel{\\char`\u220C}}");
		defineMacro("\\limsup", "\\DOTSB\\operatorname*{lim\\,sup}");
		defineMacro("\\liminf", "\\DOTSB\\operatorname*{lim\\,inf}"); //////////////////////////////////////////////////////////////////////
		// From amsopn.sty

		defineMacro("\\injlim", "\\DOTSB\\operatorname*{inj\\,lim}");
		defineMacro("\\projlim", "\\DOTSB\\operatorname*{proj\\,lim}");
		defineMacro("\\varlimsup", "\\DOTSB\\operatorname*{\\overline{lim}}");
		defineMacro("\\varliminf", "\\DOTSB\\operatorname*{\\underline{lim}}");
		defineMacro("\\varinjlim", "\\DOTSB\\operatorname*{\\underrightarrow{lim}}");
		defineMacro("\\varprojlim", "\\DOTSB\\operatorname*{\\underleftarrow{lim}}"); //////////////////////////////////////////////////////////////////////
		// MathML alternates for KaTeX glyphs in the Unicode private area

		defineMacro("\\gvertneqq", "\\html@mathml{\\@gvertneqq}{\u2269}");
		defineMacro("\\lvertneqq", "\\html@mathml{\\@lvertneqq}{\u2268}");
		defineMacro("\\ngeqq", "\\html@mathml{\\@ngeqq}{\u2271}");
		defineMacro("\\ngeqslant", "\\html@mathml{\\@ngeqslant}{\u2271}");
		defineMacro("\\nleqq", "\\html@mathml{\\@nleqq}{\u2270}");
		defineMacro("\\nleqslant", "\\html@mathml{\\@nleqslant}{\u2270}");
		defineMacro("\\nshortmid", "\\html@mathml{\\@nshortmid}{∤}");
		defineMacro("\\nshortparallel", "\\html@mathml{\\@nshortparallel}{∦}");
		defineMacro("\\nsubseteqq", "\\html@mathml{\\@nsubseteqq}{\u2288}");
		defineMacro("\\nsupseteqq", "\\html@mathml{\\@nsupseteqq}{\u2289}");
		defineMacro("\\varsubsetneq", "\\html@mathml{\\@varsubsetneq}{⊊}");
		defineMacro("\\varsubsetneqq", "\\html@mathml{\\@varsubsetneqq}{⫋}");
		defineMacro("\\varsupsetneq", "\\html@mathml{\\@varsupsetneq}{⊋}");
		defineMacro("\\varsupsetneqq", "\\html@mathml{\\@varsupsetneqq}{⫌}");
		defineMacro("\\imath", "\\html@mathml{\\@imath}{\u0131}");
		defineMacro("\\jmath", "\\html@mathml{\\@jmath}{\u0237}"); //////////////////////////////////////////////////////////////////////
		// stmaryrd and semantic
		// The stmaryrd and semantic packages render the next four items by calling a
		// glyph. Those glyphs do not exist in the KaTeX fonts. Hence the macros.

		defineMacro("\\llbracket", "\\html@mathml{" + "\\mathopen{[\\mkern-3.2mu[}}" + "{\\mathopen{\\char`\u27E6}}");
		defineMacro("\\rrbracket", "\\html@mathml{" + "\\mathclose{]\\mkern-3.2mu]}}" + "{\\mathclose{\\char`\u27E7}}");
		defineMacro("\u27E6", "\\llbracket"); // blackboard bold [

		defineMacro("\u27E7", "\\rrbracket"); // blackboard bold ]

		defineMacro("\\lBrace", "\\html@mathml{" + "\\mathopen{\\{\\mkern-3.2mu[}}" + "{\\mathopen{\\char`\u2983}}");
		defineMacro("\\rBrace", "\\html@mathml{" + "\\mathclose{]\\mkern-3.2mu\\}}}" + "{\\mathclose{\\char`\u2984}}");
		defineMacro("\u2983", "\\lBrace"); // blackboard bold {

		defineMacro("\u2984", "\\rBrace"); // blackboard bold }
		// TODO: Create variable sized versions of the last two items. I believe that
		// will require new font glyphs.
		// The stmaryrd function `\minuso` provides a "Plimsoll" symbol that
		// superimposes the characters \circ and \mathminus. Used in chemistry.

		defineMacro("\\minuso", "\\mathbin{\\html@mathml{" + "{\\mathrlap{\\mathchoice{\\kern{0.145em}}{\\kern{0.145em}}" + "{\\kern{0.1015em}}{\\kern{0.0725em}}\\circ}{-}}}" + "{\\char`⦵}}");
		defineMacro("⦵", "\\minuso"); //////////////////////////////////////////////////////////////////////
		// texvc.sty
		// The texvc package contains macros available in mediawiki pages.
		// We omit the functions deprecated at
		// https://en.wikipedia.org/wiki/Help:Displaying_a_formula#Deprecated_syntax
		// We also omit texvc's \O, which conflicts with \text{\O}

		defineMacro("\\darr", "\\downarrow");
		defineMacro("\\dArr", "\\Downarrow");
		defineMacro("\\Darr", "\\Downarrow");
		defineMacro("\\lang", "\\langle");
		defineMacro("\\rang", "\\rangle");
		defineMacro("\\uarr", "\\uparrow");
		defineMacro("\\uArr", "\\Uparrow");
		defineMacro("\\Uarr", "\\Uparrow");
		defineMacro("\\N", "\\mathbb{N}");
		defineMacro("\\R", "\\mathbb{R}");
		defineMacro("\\Z", "\\mathbb{Z}");
		defineMacro("\\alef", "\\aleph");
		defineMacro("\\alefsym", "\\aleph");
		defineMacro("\\Alpha", "\\mathrm{A}");
		defineMacro("\\Beta", "\\mathrm{B}");
		defineMacro("\\bull", "\\bullet");
		defineMacro("\\Chi", "\\mathrm{X}");
		defineMacro("\\clubs", "\\clubsuit");
		defineMacro("\\cnums", "\\mathbb{C}");
		defineMacro("\\Complex", "\\mathbb{C}");
		defineMacro("\\Dagger", "\\ddagger");
		defineMacro("\\diamonds", "\\diamondsuit");
		defineMacro("\\empty", "\\emptyset");
		defineMacro("\\Epsilon", "\\mathrm{E}");
		defineMacro("\\Eta", "\\mathrm{H}");
		defineMacro("\\exist", "\\exists");
		defineMacro("\\harr", "\\leftrightarrow");
		defineMacro("\\hArr", "\\Leftrightarrow");
		defineMacro("\\Harr", "\\Leftrightarrow");
		defineMacro("\\hearts", "\\heartsuit");
		defineMacro("\\image", "\\Im");
		defineMacro("\\infin", "\\infty");
		defineMacro("\\Iota", "\\mathrm{I}");
		defineMacro("\\isin", "\\in");
		defineMacro("\\Kappa", "\\mathrm{K}");
		defineMacro("\\larr", "\\leftarrow");
		defineMacro("\\lArr", "\\Leftarrow");
		defineMacro("\\Larr", "\\Leftarrow");
		defineMacro("\\lrarr", "\\leftrightarrow");
		defineMacro("\\lrArr", "\\Leftrightarrow");
		defineMacro("\\Lrarr", "\\Leftrightarrow");
		defineMacro("\\Mu", "\\mathrm{M}");
		defineMacro("\\natnums", "\\mathbb{N}");
		defineMacro("\\Nu", "\\mathrm{N}");
		defineMacro("\\Omicron", "\\mathrm{O}");
		defineMacro("\\plusmn", "\\pm");
		defineMacro("\\rarr", "\\rightarrow");
		defineMacro("\\rArr", "\\Rightarrow");
		defineMacro("\\Rarr", "\\Rightarrow");
		defineMacro("\\real", "\\Re");
		defineMacro("\\reals", "\\mathbb{R}");
		defineMacro("\\Reals", "\\mathbb{R}");
		defineMacro("\\Rho", "\\mathrm{P}");
		defineMacro("\\sdot", "\\cdot");
		defineMacro("\\sect", "\\S");
		defineMacro("\\spades", "\\spadesuit");
		defineMacro("\\sub", "\\subset");
		defineMacro("\\sube", "\\subseteq");
		defineMacro("\\supe", "\\supseteq");
		defineMacro("\\Tau", "\\mathrm{T}");
		defineMacro("\\thetasym", "\\vartheta"); // TODO: defineMacro("\\varcoppa", "\\\mbox{\\coppa}");

		defineMacro("\\weierp", "\\wp");
		defineMacro("\\Zeta", "\\mathrm{Z}"); //////////////////////////////////////////////////////////////////////
		// statmath.sty
		// https://ctan.math.illinois.edu/macros/latex/contrib/statmath/statmath.pdf

		defineMacro("\\argmin", "\\DOTSB\\operatorname*{arg\\,min}");
		defineMacro("\\argmax", "\\DOTSB\\operatorname*{arg\\,max}");
		defineMacro("\\plim", "\\DOTSB\\mathop{\\operatorname{plim}}\\limits"); //////////////////////////////////////////////////////////////////////
		// braket.sty
		// http://ctan.math.washington.edu/tex-archive/macros/latex/contrib/braket/braket.pdf

		defineMacro("\\bra", "\\mathinner{\\langle{#1}|}");
		defineMacro("\\ket", "\\mathinner{|{#1}\\rangle}");
		defineMacro("\\braket", "\\mathinner{\\langle{#1}\\rangle}");
		defineMacro("\\Bra", "\\left\\langle#1\\right|");
		defineMacro("\\Ket", "\\left|#1\\right\\rangle");

		var braketHelper = function braketHelper(one) {
		  return function (context) {
		    var left = context.consumeArg().tokens;
		    var middle = context.consumeArg().tokens;
		    var middleDouble = context.consumeArg().tokens;
		    var right = context.consumeArg().tokens;
		    var oldMiddle = context.macros.get("|");
		    var oldMiddleDouble = context.macros.get("\\|");
		    context.macros.beginGroup();

		    var midMacro = function midMacro(double) {
		      return function (context) {
		        if (one) {
		          // Only modify the first instance of | or \|
		          context.macros.set("|", oldMiddle);

		          if (middleDouble.length) {
		            context.macros.set("\\|", oldMiddleDouble);
		          }
		        }

		        var doubled = double;

		        if (!double && middleDouble.length) {
		          // Mimic \@ifnextchar
		          var nextToken = context.future();

		          if (nextToken.text === "|") {
		            context.popToken();
		            doubled = true;
		          }
		        }

		        return {
		          tokens: doubled ? middleDouble : middle,
		          numArgs: 0
		        };
		      };
		    };

		    context.macros.set("|", midMacro(false));

		    if (middleDouble.length) {
		      context.macros.set("\\|", midMacro(true));
		    }

		    var arg = context.consumeArg().tokens;
		    var expanded = context.expandTokens([].concat(right, arg, left));
		    context.macros.endGroup();
		    return {
		      tokens: expanded.reverse(),
		      numArgs: 0
		    };
		  };
		};

		defineMacro("\\bra@ket", braketHelper(false));
		defineMacro("\\bra@set", braketHelper(true));
		defineMacro("\\Braket", "\\bra@ket{\\left\\langle}" + "{\\,\\middle\\vert\\,}{\\,\\middle\\vert\\,}{\\right\\rangle}");
		defineMacro("\\Set", "\\bra@set{\\left\\{\\:}" + "{\\;\\middle\\vert\\;}{\\;\\middle\\Vert\\;}{\\:\\right\\}}");
		defineMacro("\\set", "\\bra@set{\\{\\,}{\\mid}{}{\\,\\}}"); // has no support for special || or \|
		//////////////////////////////////////////////////////////////////////
		// actuarialangle.dtx

		defineMacro("\\angln", "{\\angl n}"); // Custom Khan Academy colors, should be moved to an optional package

		defineMacro("\\blue", "\\textcolor{##6495ed}{#1}");
		defineMacro("\\orange", "\\textcolor{##ffa500}{#1}");
		defineMacro("\\pink", "\\textcolor{##ff00af}{#1}");
		defineMacro("\\red", "\\textcolor{##df0030}{#1}");
		defineMacro("\\green", "\\textcolor{##28ae7b}{#1}");
		defineMacro("\\gray", "\\textcolor{gray}{#1}");
		defineMacro("\\purple", "\\textcolor{##9d38bd}{#1}");
		defineMacro("\\blueA", "\\textcolor{##ccfaff}{#1}");
		defineMacro("\\blueB", "\\textcolor{##80f6ff}{#1}");
		defineMacro("\\blueC", "\\textcolor{##63d9ea}{#1}");
		defineMacro("\\blueD", "\\textcolor{##11accd}{#1}");
		defineMacro("\\blueE", "\\textcolor{##0c7f99}{#1}");
		defineMacro("\\tealA", "\\textcolor{##94fff5}{#1}");
		defineMacro("\\tealB", "\\textcolor{##26edd5}{#1}");
		defineMacro("\\tealC", "\\textcolor{##01d1c1}{#1}");
		defineMacro("\\tealD", "\\textcolor{##01a995}{#1}");
		defineMacro("\\tealE", "\\textcolor{##208170}{#1}");
		defineMacro("\\greenA", "\\textcolor{##b6ffb0}{#1}");
		defineMacro("\\greenB", "\\textcolor{##8af281}{#1}");
		defineMacro("\\greenC", "\\textcolor{##74cf70}{#1}");
		defineMacro("\\greenD", "\\textcolor{##1fab54}{#1}");
		defineMacro("\\greenE", "\\textcolor{##0d923f}{#1}");
		defineMacro("\\goldA", "\\textcolor{##ffd0a9}{#1}");
		defineMacro("\\goldB", "\\textcolor{##ffbb71}{#1}");
		defineMacro("\\goldC", "\\textcolor{##ff9c39}{#1}");
		defineMacro("\\goldD", "\\textcolor{##e07d10}{#1}");
		defineMacro("\\goldE", "\\textcolor{##a75a05}{#1}");
		defineMacro("\\redA", "\\textcolor{##fca9a9}{#1}");
		defineMacro("\\redB", "\\textcolor{##ff8482}{#1}");
		defineMacro("\\redC", "\\textcolor{##f9685d}{#1}");
		defineMacro("\\redD", "\\textcolor{##e84d39}{#1}");
		defineMacro("\\redE", "\\textcolor{##bc2612}{#1}");
		defineMacro("\\maroonA", "\\textcolor{##ffbde0}{#1}");
		defineMacro("\\maroonB", "\\textcolor{##ff92c6}{#1}");
		defineMacro("\\maroonC", "\\textcolor{##ed5fa6}{#1}");
		defineMacro("\\maroonD", "\\textcolor{##ca337c}{#1}");
		defineMacro("\\maroonE", "\\textcolor{##9e034e}{#1}");
		defineMacro("\\purpleA", "\\textcolor{##ddd7ff}{#1}");
		defineMacro("\\purpleB", "\\textcolor{##c6b9fc}{#1}");
		defineMacro("\\purpleC", "\\textcolor{##aa87ff}{#1}");
		defineMacro("\\purpleD", "\\textcolor{##7854ab}{#1}");
		defineMacro("\\purpleE", "\\textcolor{##543b78}{#1}");
		defineMacro("\\mintA", "\\textcolor{##f5f9e8}{#1}");
		defineMacro("\\mintB", "\\textcolor{##edf2df}{#1}");
		defineMacro("\\mintC", "\\textcolor{##e0e5cc}{#1}");
		defineMacro("\\grayA", "\\textcolor{##f6f7f7}{#1}");
		defineMacro("\\grayB", "\\textcolor{##f0f1f2}{#1}");
		defineMacro("\\grayC", "\\textcolor{##e3e5e6}{#1}");
		defineMacro("\\grayD", "\\textcolor{##d6d8da}{#1}");
		defineMacro("\\grayE", "\\textcolor{##babec2}{#1}");
		defineMacro("\\grayF", "\\textcolor{##888d93}{#1}");
		defineMacro("\\grayG", "\\textcolor{##626569}{#1}");
		defineMacro("\\grayH", "\\textcolor{##3b3e40}{#1}");
		defineMacro("\\grayI", "\\textcolor{##21242c}{#1}");
		defineMacro("\\kaBlue", "\\textcolor{##314453}{#1}");
		defineMacro("\\kaGreen", "\\textcolor{##71B307}{#1}");
		/**
		 * This file contains the “gullet” where macros are expanded
		 * until only non-macro tokens remain.
		 */







		// List of commands that act like macros but aren't defined as a macro,
		// function, or symbol.  Used in `isDefined`.
		var implicitCommands = {
		  "^": true,
		  // Parser.js
		  "_": true,
		  // Parser.js
		  "\\limits": true,
		  // Parser.js
		  "\\nolimits": true // Parser.js

		};

		var MacroExpander = /*#__PURE__*/function () {
		  function MacroExpander(input, settings, mode) {
		    this.settings = void 0;
		    this.expansionCount = void 0;
		    this.lexer = void 0;
		    this.macros = void 0;
		    this.stack = void 0;
		    this.mode = void 0;
		    this.settings = settings;
		    this.expansionCount = 0;
		    this.feed(input); // Make new global namespace

		    this.macros = new Namespace(src_macros, settings.macros);
		    this.mode = mode;
		    this.stack = []; // contains tokens in REVERSE order
		  }
		  /**
		   * Feed a new input string to the same MacroExpander
		   * (with existing macros etc.).
		   */


		  var _proto = MacroExpander.prototype;

		  _proto.feed = function feed(input) {
		    this.lexer = new Lexer(input, this.settings);
		  }
		  /**
		   * Switches between "text" and "math" modes.
		   */
		  ;

		  _proto.switchMode = function switchMode(newMode) {
		    this.mode = newMode;
		  }
		  /**
		   * Start a new group nesting within all namespaces.
		   */
		  ;

		  _proto.beginGroup = function beginGroup() {
		    this.macros.beginGroup();
		  }
		  /**
		   * End current group nesting within all namespaces.
		   */
		  ;

		  _proto.endGroup = function endGroup() {
		    this.macros.endGroup();
		  }
		  /**
		   * Ends all currently nested groups (if any), restoring values before the
		   * groups began.  Useful in case of an error in the middle of parsing.
		   */
		  ;

		  _proto.endGroups = function endGroups() {
		    this.macros.endGroups();
		  }
		  /**
		   * Returns the topmost token on the stack, without expanding it.
		   * Similar in behavior to TeX's `\futurelet`.
		   */
		  ;

		  _proto.future = function future() {
		    if (this.stack.length === 0) {
		      this.pushToken(this.lexer.lex());
		    }

		    return this.stack[this.stack.length - 1];
		  }
		  /**
		   * Remove and return the next unexpanded token.
		   */
		  ;

		  _proto.popToken = function popToken() {
		    this.future(); // ensure non-empty stack

		    return this.stack.pop();
		  }
		  /**
		   * Add a given token to the token stack.  In particular, this get be used
		   * to put back a token returned from one of the other methods.
		   */
		  ;

		  _proto.pushToken = function pushToken(token) {
		    this.stack.push(token);
		  }
		  /**
		   * Append an array of tokens to the token stack.
		   */
		  ;

		  _proto.pushTokens = function pushTokens(tokens) {
		    var _this$stack;

		    (_this$stack = this.stack).push.apply(_this$stack, tokens);
		  }
		  /**
		   * Find an macro argument without expanding tokens and append the array of
		   * tokens to the token stack. Uses Token as a container for the result.
		   */
		  ;

		  _proto.scanArgument = function scanArgument(isOptional) {
		    var start;
		    var end;
		    var tokens;

		    if (isOptional) {
		      this.consumeSpaces(); // \@ifnextchar gobbles any space following it

		      if (this.future().text !== "[") {
		        return null;
		      }

		      start = this.popToken(); // don't include [ in tokens

		      var _this$consumeArg = this.consumeArg(["]"]);

		      tokens = _this$consumeArg.tokens;
		      end = _this$consumeArg.end;
		    } else {
		      var _this$consumeArg2 = this.consumeArg();

		      tokens = _this$consumeArg2.tokens;
		      start = _this$consumeArg2.start;
		      end = _this$consumeArg2.end;
		    } // indicate the end of an argument


		    this.pushToken(new Token("EOF", end.loc));
		    this.pushTokens(tokens);
		    return start.range(end, "");
		  }
		  /**
		   * Consume all following space tokens, without expansion.
		   */
		  ;

		  _proto.consumeSpaces = function consumeSpaces() {
		    for (;;) {
		      var token = this.future();

		      if (token.text === " ") {
		        this.stack.pop();
		      } else {
		        break;
		      }
		    }
		  }
		  /**
		   * Consume an argument from the token stream, and return the resulting array
		   * of tokens and start/end token.
		   */
		  ;

		  _proto.consumeArg = function consumeArg(delims) {
		    // The argument for a delimited parameter is the shortest (possibly
		    // empty) sequence of tokens with properly nested {...} groups that is
		    // followed ... by this particular list of non-parameter tokens.
		    // The argument for an undelimited parameter is the next nonblank
		    // token, unless that token is ‘{’, when the argument will be the
		    // entire {...} group that follows.
		    var tokens = [];
		    var isDelimited = delims && delims.length > 0;

		    if (!isDelimited) {
		      // Ignore spaces between arguments.  As the TeXbook says:
		      // "After you have said ‘\def\row#1#2{...}’, you are allowed to
		      //  put spaces between the arguments (e.g., ‘\row x n’), because
		      //  TeX doesn’t use single spaces as undelimited arguments."
		      this.consumeSpaces();
		    }

		    var start = this.future();
		    var tok;
		    var depth = 0;
		    var match = 0;

		    do {
		      tok = this.popToken();
		      tokens.push(tok);

		      if (tok.text === "{") {
		        ++depth;
		      } else if (tok.text === "}") {
		        --depth;

		        if (depth === -1) {
		          throw new src_ParseError("Extra }", tok);
		        }
		      } else if (tok.text === "EOF") {
		        throw new src_ParseError("Unexpected end of input in a macro argument" + ", expected '" + (delims && isDelimited ? delims[match] : "}") + "'", tok);
		      }

		      if (delims && isDelimited) {
		        if ((depth === 0 || depth === 1 && delims[match] === "{") && tok.text === delims[match]) {
		          ++match;

		          if (match === delims.length) {
		            // don't include delims in tokens
		            tokens.splice(-match, match);
		            break;
		          }
		        } else {
		          match = 0;
		        }
		      }
		    } while (depth !== 0 || isDelimited); // If the argument found ... has the form ‘{<nested tokens>}’,
		    // ... the outermost braces enclosing the argument are removed


		    if (start.text === "{" && tokens[tokens.length - 1].text === "}") {
		      tokens.pop();
		      tokens.shift();
		    }

		    tokens.reverse(); // to fit in with stack order

		    return {
		      tokens: tokens,
		      start: start,
		      end: tok
		    };
		  }
		  /**
		   * Consume the specified number of (delimited) arguments from the token
		   * stream and return the resulting array of arguments.
		   */
		  ;

		  _proto.consumeArgs = function consumeArgs(numArgs, delimiters) {
		    if (delimiters) {
		      if (delimiters.length !== numArgs + 1) {
		        throw new src_ParseError("The length of delimiters doesn't match the number of args!");
		      }

		      var delims = delimiters[0];

		      for (var i = 0; i < delims.length; i++) {
		        var tok = this.popToken();

		        if (delims[i] !== tok.text) {
		          throw new src_ParseError("Use of the macro doesn't match its definition", tok);
		        }
		      }
		    }

		    var args = [];

		    for (var _i = 0; _i < numArgs; _i++) {
		      args.push(this.consumeArg(delimiters && delimiters[_i + 1]).tokens);
		    }

		    return args;
		  }
		  /**
		   * Expand the next token only once if possible.
		   *
		   * If the token is expanded, the resulting tokens will be pushed onto
		   * the stack in reverse order, and the number of such tokens will be
		   * returned.  This number might be zero or positive.
		   *
		   * If not, the return value is `false`, and the next token remains at the
		   * top of the stack.
		   *
		   * In either case, the next token will be on the top of the stack,
		   * or the stack will be empty (in case of empty expansion
		   * and no other tokens).
		   *
		   * Used to implement `expandAfterFuture` and `expandNextToken`.
		   *
		   * If expandableOnly, only expandable tokens are expanded and
		   * an undefined control sequence results in an error.
		   */
		  ;

		  _proto.expandOnce = function expandOnce(expandableOnly) {
		    var topToken = this.popToken();
		    var name = topToken.text;
		    var expansion = !topToken.noexpand ? this._getExpansion(name) : null;

		    if (expansion == null || expandableOnly && expansion.unexpandable) {
		      if (expandableOnly && expansion == null && name[0] === "\\" && !this.isDefined(name)) {
		        throw new src_ParseError("Undefined control sequence: " + name);
		      }

		      this.pushToken(topToken);
		      return false;
		    }

		    this.expansionCount++;

		    if (this.expansionCount > this.settings.maxExpand) {
		      throw new src_ParseError("Too many expansions: infinite loop or " + "need to increase maxExpand setting");
		    }

		    var tokens = expansion.tokens;
		    var args = this.consumeArgs(expansion.numArgs, expansion.delimiters);

		    if (expansion.numArgs) {
		      // paste arguments in place of the placeholders
		      tokens = tokens.slice(); // make a shallow copy

		      for (var i = tokens.length - 1; i >= 0; --i) {
		        var tok = tokens[i];

		        if (tok.text === "#") {
		          if (i === 0) {
		            throw new src_ParseError("Incomplete placeholder at end of macro body", tok);
		          }

		          tok = tokens[--i]; // next token on stack

		          if (tok.text === "#") {
		            // ## → #
		            tokens.splice(i + 1, 1); // drop first #
		          } else if (/^[1-9]$/.test(tok.text)) {
		            var _tokens;

		            // replace the placeholder with the indicated argument
		            (_tokens = tokens).splice.apply(_tokens, [i, 2].concat(args[+tok.text - 1]));
		          } else {
		            throw new src_ParseError("Not a valid argument number", tok);
		          }
		        }
		      }
		    } // Concatenate expansion onto top of stack.


		    this.pushTokens(tokens);
		    return tokens.length;
		  }
		  /**
		   * Expand the next token only once (if possible), and return the resulting
		   * top token on the stack (without removing anything from the stack).
		   * Similar in behavior to TeX's `\expandafter\futurelet`.
		   * Equivalent to expandOnce() followed by future().
		   */
		  ;

		  _proto.expandAfterFuture = function expandAfterFuture() {
		    this.expandOnce();
		    return this.future();
		  }
		  /**
		   * Recursively expand first token, then return first non-expandable token.
		   */
		  ;

		  _proto.expandNextToken = function expandNextToken() {
		    for (;;) {
		      if (this.expandOnce() === false) {
		        // fully expanded
		        var token = this.stack.pop(); // the token after \noexpand is interpreted as if its meaning
		        // were ‘\relax’

		        if (token.treatAsRelax) {
		          token.text = "\\relax";
		        }

		        return token;
		      }
		    } // Flow unable to figure out that this pathway is impossible.
		    // https://github.com/facebook/flow/issues/4808


		    throw new Error(); // eslint-disable-line no-unreachable
		  }
		  /**
		   * Fully expand the given macro name and return the resulting list of
		   * tokens, or return `undefined` if no such macro is defined.
		   */
		  ;

		  _proto.expandMacro = function expandMacro(name) {
		    return this.macros.has(name) ? this.expandTokens([new Token(name)]) : undefined;
		  }
		  /**
		   * Fully expand the given token stream and return the resulting list of
		   * tokens.  Note that the input tokens are in reverse order, but the
		   * output tokens are in forward order.
		   */
		  ;

		  _proto.expandTokens = function expandTokens(tokens) {
		    var output = [];
		    var oldStackLength = this.stack.length;
		    this.pushTokens(tokens);

		    while (this.stack.length > oldStackLength) {
		      // Expand only expandable tokens
		      if (this.expandOnce(true) === false) {
		        // fully expanded
		        var token = this.stack.pop();

		        if (token.treatAsRelax) {
		          // the expansion of \noexpand is the token itself
		          token.noexpand = false;
		          token.treatAsRelax = false;
		        }

		        output.push(token);
		      }
		    }

		    return output;
		  }
		  /**
		   * Fully expand the given macro name and return the result as a string,
		   * or return `undefined` if no such macro is defined.
		   */
		  ;

		  _proto.expandMacroAsText = function expandMacroAsText(name) {
		    var tokens = this.expandMacro(name);

		    if (tokens) {
		      return tokens.map(function (token) {
		        return token.text;
		      }).join("");
		    } else {
		      return tokens;
		    }
		  }
		  /**
		   * Returns the expanded macro as a reversed array of tokens and a macro
		   * argument count.  Or returns `null` if no such macro.
		   */
		  ;

		  _proto._getExpansion = function _getExpansion(name) {
		    var definition = this.macros.get(name);

		    if (definition == null) {
		      // mainly checking for undefined here
		      return definition;
		    } // If a single character has an associated catcode other than 13
		    // (active character), then don't expand it.


		    if (name.length === 1) {
		      var catcode = this.lexer.catcodes[name];

		      if (catcode != null && catcode !== 13) {
		        return;
		      }
		    }

		    var expansion = typeof definition === "function" ? definition(this) : definition;

		    if (typeof expansion === "string") {
		      var numArgs = 0;

		      if (expansion.indexOf("#") !== -1) {
		        var stripped = expansion.replace(/##/g, "");

		        while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
		          ++numArgs;
		        }
		      }

		      var bodyLexer = new Lexer(expansion, this.settings);
		      var tokens = [];
		      var tok = bodyLexer.lex();

		      while (tok.text !== "EOF") {
		        tokens.push(tok);
		        tok = bodyLexer.lex();
		      }

		      tokens.reverse(); // to fit in with stack using push and pop

		      var expanded = {
		        tokens: tokens,
		        numArgs: numArgs
		      };
		      return expanded;
		    }

		    return expansion;
		  }
		  /**
		   * Determine whether a command is currently "defined" (has some
		   * functionality), meaning that it's a macro (in the current group),
		   * a function, a symbol, or one of the special commands listed in
		   * `implicitCommands`.
		   */
		  ;

		  _proto.isDefined = function isDefined(name) {
		    return this.macros.has(name) || src_functions.hasOwnProperty(name) || src_symbols.math.hasOwnProperty(name) || src_symbols.text.hasOwnProperty(name) || implicitCommands.hasOwnProperty(name);
		  }
		  /**
		   * Determine whether a command is expandable.
		   */
		  ;

		  _proto.isExpandable = function isExpandable(name) {
		    var macro = this.macros.get(name);
		    return macro != null ? typeof macro === "string" || typeof macro === "function" || !macro.unexpandable : src_functions.hasOwnProperty(name) && !src_functions[name].primitive;
		  };

		  return MacroExpander;
		}();
		// Helpers for Parser.js handling of Unicode (sub|super)script characters.
		var unicodeSubRegEx = /^[₊₋₌₍₎₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓᵦᵧᵨᵩᵪ]/;
		var uSubsAndSups = Object.freeze({
		  '₊': '+',
		  '₋': '-',
		  '₌': '=',
		  '₍': '(',
		  '₎': ')',
		  '₀': '0',
		  '₁': '1',
		  '₂': '2',
		  '₃': '3',
		  '₄': '4',
		  '₅': '5',
		  '₆': '6',
		  '₇': '7',
		  '₈': '8',
		  '₉': '9',
		  "\u2090": 'a',
		  "\u2091": 'e',
		  "\u2095": 'h',
		  "\u1D62": 'i',
		  "\u2C7C": 'j',
		  "\u2096": 'k',
		  "\u2097": 'l',
		  "\u2098": 'm',
		  "\u2099": 'n',
		  "\u2092": 'o',
		  "\u209A": 'p',
		  "\u1D63": 'r',
		  "\u209B": 's',
		  "\u209C": 't',
		  "\u1D64": 'u',
		  "\u1D65": 'v',
		  "\u2093": 'x',
		  "\u1D66": 'β',
		  "\u1D67": 'γ',
		  "\u1D68": 'ρ',
		  "\u1D69": "\u03D5",
		  "\u1D6A": 'χ',
		  '⁺': '+',
		  '⁻': '-',
		  '⁼': '=',
		  '⁽': '(',
		  '⁾': ')',
		  '⁰': '0',
		  '¹': '1',
		  '²': '2',
		  '³': '3',
		  '⁴': '4',
		  '⁵': '5',
		  '⁶': '6',
		  '⁷': '7',
		  '⁸': '8',
		  '⁹': '9',
		  "\u1D2C": 'A',
		  "\u1D2E": 'B',
		  "\u1D30": 'D',
		  "\u1D31": 'E',
		  "\u1D33": 'G',
		  "\u1D34": 'H',
		  "\u1D35": 'I',
		  "\u1D36": 'J',
		  "\u1D37": 'K',
		  "\u1D38": 'L',
		  "\u1D39": 'M',
		  "\u1D3A": 'N',
		  "\u1D3C": 'O',
		  "\u1D3E": 'P',
		  "\u1D3F": 'R',
		  "\u1D40": 'T',
		  "\u1D41": 'U',
		  "\u2C7D": 'V',
		  "\u1D42": 'W',
		  "\u1D43": 'a',
		  "\u1D47": 'b',
		  "\u1D9C": 'c',
		  "\u1D48": 'd',
		  "\u1D49": 'e',
		  "\u1DA0": 'f',
		  "\u1D4D": 'g',
		  "\u02B0": 'h',
		  "\u2071": 'i',
		  "\u02B2": 'j',
		  "\u1D4F": 'k',
		  "\u02E1": 'l',
		  "\u1D50": 'm',
		  "\u207F": 'n',
		  "\u1D52": 'o',
		  "\u1D56": 'p',
		  "\u02B3": 'r',
		  "\u02E2": 's',
		  "\u1D57": 't',
		  "\u1D58": 'u',
		  "\u1D5B": 'v',
		  "\u02B7": 'w',
		  "\u02E3": 'x',
		  "\u02B8": 'y',
		  "\u1DBB": 'z',
		  "\u1D5D": 'β',
		  "\u1D5E": 'γ',
		  "\u1D5F": 'δ',
		  "\u1D60": "\u03D5",
		  "\u1D61": 'χ',
		  "\u1DBF": 'θ'
		});
		/* eslint no-constant-condition:0 */










		 // Pre-evaluate both modules as unicodeSymbols require String.normalize()

		var unicodeAccents = {
		  "́": {
		    "text": "\\'",
		    "math": "\\acute"
		  },
		  "̀": {
		    "text": "\\`",
		    "math": "\\grave"
		  },
		  "̈": {
		    "text": "\\\"",
		    "math": "\\ddot"
		  },
		  "̃": {
		    "text": "\\~",
		    "math": "\\tilde"
		  },
		  "̄": {
		    "text": "\\=",
		    "math": "\\bar"
		  },
		  "̆": {
		    "text": "\\u",
		    "math": "\\breve"
		  },
		  "̌": {
		    "text": "\\v",
		    "math": "\\check"
		  },
		  "̂": {
		    "text": "\\^",
		    "math": "\\hat"
		  },
		  "̇": {
		    "text": "\\.",
		    "math": "\\dot"
		  },
		  "̊": {
		    "text": "\\r",
		    "math": "\\mathring"
		  },
		  "̋": {
		    "text": "\\H"
		  },
		  "̧": {
		    "text": "\\c"
		  }
		};
		var unicodeSymbols = {
		  "á": "á",
		  "à": "à",
		  "ä": "ä",
		  "ǟ": "ǟ",
		  "ã": "ã",
		  "ā": "ā",
		  "ă": "ă",
		  "ắ": "ắ",
		  "ằ": "ằ",
		  "ẵ": "ẵ",
		  "ǎ": "ǎ",
		  "â": "â",
		  "ấ": "ấ",
		  "ầ": "ầ",
		  "ẫ": "ẫ",
		  "ȧ": "ȧ",
		  "ǡ": "ǡ",
		  "å": "å",
		  "ǻ": "ǻ",
		  "ḃ": "ḃ",
		  "ć": "ć",
		  "ḉ": "ḉ",
		  "č": "č",
		  "ĉ": "ĉ",
		  "ċ": "ċ",
		  "ç": "ç",
		  "ď": "ď",
		  "ḋ": "ḋ",
		  "ḑ": "ḑ",
		  "é": "é",
		  "è": "è",
		  "ë": "ë",
		  "ẽ": "ẽ",
		  "ē": "ē",
		  "ḗ": "ḗ",
		  "ḕ": "ḕ",
		  "ĕ": "ĕ",
		  "ḝ": "ḝ",
		  "ě": "ě",
		  "ê": "ê",
		  "ế": "ế",
		  "ề": "ề",
		  "ễ": "ễ",
		  "ė": "ė",
		  "ȩ": "ȩ",
		  "ḟ": "ḟ",
		  "ǵ": "ǵ",
		  "ḡ": "ḡ",
		  "ğ": "ğ",
		  "ǧ": "ǧ",
		  "ĝ": "ĝ",
		  "ġ": "ġ",
		  "ģ": "ģ",
		  "ḧ": "ḧ",
		  "ȟ": "ȟ",
		  "ĥ": "ĥ",
		  "ḣ": "ḣ",
		  "ḩ": "ḩ",
		  "í": "í",
		  "ì": "ì",
		  "ï": "ï",
		  "ḯ": "ḯ",
		  "ĩ": "ĩ",
		  "ī": "ī",
		  "ĭ": "ĭ",
		  "ǐ": "ǐ",
		  "î": "î",
		  "ǰ": "ǰ",
		  "ĵ": "ĵ",
		  "ḱ": "ḱ",
		  "ǩ": "ǩ",
		  "ķ": "ķ",
		  "ĺ": "ĺ",
		  "ľ": "ľ",
		  "ļ": "ļ",
		  "ḿ": "ḿ",
		  "ṁ": "ṁ",
		  "ń": "ń",
		  "ǹ": "ǹ",
		  "ñ": "ñ",
		  "ň": "ň",
		  "ṅ": "ṅ",
		  "ņ": "ņ",
		  "ó": "ó",
		  "ò": "ò",
		  "ö": "ö",
		  "ȫ": "ȫ",
		  "õ": "õ",
		  "ṍ": "ṍ",
		  "ṏ": "ṏ",
		  "ȭ": "ȭ",
		  "ō": "ō",
		  "ṓ": "ṓ",
		  "ṑ": "ṑ",
		  "ŏ": "ŏ",
		  "ǒ": "ǒ",
		  "ô": "ô",
		  "ố": "ố",
		  "ồ": "ồ",
		  "ỗ": "ỗ",
		  "ȯ": "ȯ",
		  "ȱ": "ȱ",
		  "ő": "ő",
		  "ṕ": "ṕ",
		  "ṗ": "ṗ",
		  "ŕ": "ŕ",
		  "ř": "ř",
		  "ṙ": "ṙ",
		  "ŗ": "ŗ",
		  "ś": "ś",
		  "ṥ": "ṥ",
		  "š": "š",
		  "ṧ": "ṧ",
		  "ŝ": "ŝ",
		  "ṡ": "ṡ",
		  "ş": "ş",
		  "ẗ": "ẗ",
		  "ť": "ť",
		  "ṫ": "ṫ",
		  "ţ": "ţ",
		  "ú": "ú",
		  "ù": "ù",
		  "ü": "ü",
		  "ǘ": "ǘ",
		  "ǜ": "ǜ",
		  "ǖ": "ǖ",
		  "ǚ": "ǚ",
		  "ũ": "ũ",
		  "ṹ": "ṹ",
		  "ū": "ū",
		  "ṻ": "ṻ",
		  "ŭ": "ŭ",
		  "ǔ": "ǔ",
		  "û": "û",
		  "ů": "ů",
		  "ű": "ű",
		  "ṽ": "ṽ",
		  "ẃ": "ẃ",
		  "ẁ": "ẁ",
		  "ẅ": "ẅ",
		  "ŵ": "ŵ",
		  "ẇ": "ẇ",
		  "ẘ": "ẘ",
		  "ẍ": "ẍ",
		  "ẋ": "ẋ",
		  "ý": "ý",
		  "ỳ": "ỳ",
		  "ÿ": "ÿ",
		  "ỹ": "ỹ",
		  "ȳ": "ȳ",
		  "ŷ": "ŷ",
		  "ẏ": "ẏ",
		  "ẙ": "ẙ",
		  "ź": "ź",
		  "ž": "ž",
		  "ẑ": "ẑ",
		  "ż": "ż",
		  "Á": "Á",
		  "À": "À",
		  "Ä": "Ä",
		  "Ǟ": "Ǟ",
		  "Ã": "Ã",
		  "Ā": "Ā",
		  "Ă": "Ă",
		  "Ắ": "Ắ",
		  "Ằ": "Ằ",
		  "Ẵ": "Ẵ",
		  "Ǎ": "Ǎ",
		  "Â": "Â",
		  "Ấ": "Ấ",
		  "Ầ": "Ầ",
		  "Ẫ": "Ẫ",
		  "Ȧ": "Ȧ",
		  "Ǡ": "Ǡ",
		  "Å": "Å",
		  "Ǻ": "Ǻ",
		  "Ḃ": "Ḃ",
		  "Ć": "Ć",
		  "Ḉ": "Ḉ",
		  "Č": "Č",
		  "Ĉ": "Ĉ",
		  "Ċ": "Ċ",
		  "Ç": "Ç",
		  "Ď": "Ď",
		  "Ḋ": "Ḋ",
		  "Ḑ": "Ḑ",
		  "É": "É",
		  "È": "È",
		  "Ë": "Ë",
		  "Ẽ": "Ẽ",
		  "Ē": "Ē",
		  "Ḗ": "Ḗ",
		  "Ḕ": "Ḕ",
		  "Ĕ": "Ĕ",
		  "Ḝ": "Ḝ",
		  "Ě": "Ě",
		  "Ê": "Ê",
		  "Ế": "Ế",
		  "Ề": "Ề",
		  "Ễ": "Ễ",
		  "Ė": "Ė",
		  "Ȩ": "Ȩ",
		  "Ḟ": "Ḟ",
		  "Ǵ": "Ǵ",
		  "Ḡ": "Ḡ",
		  "Ğ": "Ğ",
		  "Ǧ": "Ǧ",
		  "Ĝ": "Ĝ",
		  "Ġ": "Ġ",
		  "Ģ": "Ģ",
		  "Ḧ": "Ḧ",
		  "Ȟ": "Ȟ",
		  "Ĥ": "Ĥ",
		  "Ḣ": "Ḣ",
		  "Ḩ": "Ḩ",
		  "Í": "Í",
		  "Ì": "Ì",
		  "Ï": "Ï",
		  "Ḯ": "Ḯ",
		  "Ĩ": "Ĩ",
		  "Ī": "Ī",
		  "Ĭ": "Ĭ",
		  "Ǐ": "Ǐ",
		  "Î": "Î",
		  "İ": "İ",
		  "Ĵ": "Ĵ",
		  "Ḱ": "Ḱ",
		  "Ǩ": "Ǩ",
		  "Ķ": "Ķ",
		  "Ĺ": "Ĺ",
		  "Ľ": "Ľ",
		  "Ļ": "Ļ",
		  "Ḿ": "Ḿ",
		  "Ṁ": "Ṁ",
		  "Ń": "Ń",
		  "Ǹ": "Ǹ",
		  "Ñ": "Ñ",
		  "Ň": "Ň",
		  "Ṅ": "Ṅ",
		  "Ņ": "Ņ",
		  "Ó": "Ó",
		  "Ò": "Ò",
		  "Ö": "Ö",
		  "Ȫ": "Ȫ",
		  "Õ": "Õ",
		  "Ṍ": "Ṍ",
		  "Ṏ": "Ṏ",
		  "Ȭ": "Ȭ",
		  "Ō": "Ō",
		  "Ṓ": "Ṓ",
		  "Ṑ": "Ṑ",
		  "Ŏ": "Ŏ",
		  "Ǒ": "Ǒ",
		  "Ô": "Ô",
		  "Ố": "Ố",
		  "Ồ": "Ồ",
		  "Ỗ": "Ỗ",
		  "Ȯ": "Ȯ",
		  "Ȱ": "Ȱ",
		  "Ő": "Ő",
		  "Ṕ": "Ṕ",
		  "Ṗ": "Ṗ",
		  "Ŕ": "Ŕ",
		  "Ř": "Ř",
		  "Ṙ": "Ṙ",
		  "Ŗ": "Ŗ",
		  "Ś": "Ś",
		  "Ṥ": "Ṥ",
		  "Š": "Š",
		  "Ṧ": "Ṧ",
		  "Ŝ": "Ŝ",
		  "Ṡ": "Ṡ",
		  "Ş": "Ş",
		  "Ť": "Ť",
		  "Ṫ": "Ṫ",
		  "Ţ": "Ţ",
		  "Ú": "Ú",
		  "Ù": "Ù",
		  "Ü": "Ü",
		  "Ǘ": "Ǘ",
		  "Ǜ": "Ǜ",
		  "Ǖ": "Ǖ",
		  "Ǚ": "Ǚ",
		  "Ũ": "Ũ",
		  "Ṹ": "Ṹ",
		  "Ū": "Ū",
		  "Ṻ": "Ṻ",
		  "Ŭ": "Ŭ",
		  "Ǔ": "Ǔ",
		  "Û": "Û",
		  "Ů": "Ů",
		  "Ű": "Ű",
		  "Ṽ": "Ṽ",
		  "Ẃ": "Ẃ",
		  "Ẁ": "Ẁ",
		  "Ẅ": "Ẅ",
		  "Ŵ": "Ŵ",
		  "Ẇ": "Ẇ",
		  "Ẍ": "Ẍ",
		  "Ẋ": "Ẋ",
		  "Ý": "Ý",
		  "Ỳ": "Ỳ",
		  "Ÿ": "Ÿ",
		  "Ỹ": "Ỹ",
		  "Ȳ": "Ȳ",
		  "Ŷ": "Ŷ",
		  "Ẏ": "Ẏ",
		  "Ź": "Ź",
		  "Ž": "Ž",
		  "Ẑ": "Ẑ",
		  "Ż": "Ż",
		  "ά": "ά",
		  "ὰ": "ὰ",
		  "ᾱ": "ᾱ",
		  "ᾰ": "ᾰ",
		  "έ": "έ",
		  "ὲ": "ὲ",
		  "ή": "ή",
		  "ὴ": "ὴ",
		  "ί": "ί",
		  "ὶ": "ὶ",
		  "ϊ": "ϊ",
		  "ΐ": "ΐ",
		  "ῒ": "ῒ",
		  "ῑ": "ῑ",
		  "ῐ": "ῐ",
		  "ό": "ό",
		  "ὸ": "ὸ",
		  "ύ": "ύ",
		  "ὺ": "ὺ",
		  "ϋ": "ϋ",
		  "ΰ": "ΰ",
		  "ῢ": "ῢ",
		  "ῡ": "ῡ",
		  "ῠ": "ῠ",
		  "ώ": "ώ",
		  "ὼ": "ὼ",
		  "Ύ": "Ύ",
		  "Ὺ": "Ὺ",
		  "Ϋ": "Ϋ",
		  "Ῡ": "Ῡ",
		  "Ῠ": "Ῠ",
		  "Ώ": "Ώ",
		  "Ὼ": "Ὼ"
		};

		/**
		 * This file contains the parser used to parse out a TeX expression from the
		 * input. Since TeX isn't context-free, standard parsers don't work particularly
		 * well.
		 *
		 * The strategy of this parser is as such:
		 *
		 * The main functions (the `.parse...` ones) take a position in the current
		 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
		 * this.gullet.lexer) also supports pulling out tokens at arbitrary places. When
		 * individual tokens are needed at a position, the lexer is called to pull out a
		 * token, which is then used.
		 *
		 * The parser has a property called "mode" indicating the mode that
		 * the parser is currently in. Currently it has to be one of "math" or
		 * "text", which denotes whether the current environment is a math-y
		 * one or a text-y one (e.g. inside \text). Currently, this serves to
		 * limit the functions which can be used in text mode.
		 *
		 * The main functions then return an object which contains the useful data that
		 * was parsed at its given point, and a new position at the end of the parsed
		 * data. The main functions can call each other and continue the parsing by
		 * using the returned position as a new starting point.
		 *
		 * There are also extra `.handle...` functions, which pull out some reused
		 * functionality into self-contained functions.
		 *
		 * The functions return ParseNodes.
		 */
		var Parser = /*#__PURE__*/function () {
		  function Parser(input, settings) {
		    this.mode = void 0;
		    this.gullet = void 0;
		    this.settings = void 0;
		    this.leftrightDepth = void 0;
		    this.nextToken = void 0;
		    // Start in math mode
		    this.mode = "math"; // Create a new macro expander (gullet) and (indirectly via that) also a
		    // new lexer (mouth) for this parser (stomach, in the language of TeX)

		    this.gullet = new MacroExpander(input, settings, this.mode); // Store the settings for use in parsing

		    this.settings = settings; // Count leftright depth (for \middle errors)

		    this.leftrightDepth = 0;
		  }
		  /**
		   * Checks a result to make sure it has the right type, and throws an
		   * appropriate error otherwise.
		   */


		  var _proto = Parser.prototype;

		  _proto.expect = function expect(text, consume) {
		    if (consume === void 0) {
		      consume = true;
		    }

		    if (this.fetch().text !== text) {
		      throw new src_ParseError("Expected '" + text + "', got '" + this.fetch().text + "'", this.fetch());
		    }

		    if (consume) {
		      this.consume();
		    }
		  }
		  /**
		   * Discards the current lookahead token, considering it consumed.
		   */
		  ;

		  _proto.consume = function consume() {
		    this.nextToken = null;
		  }
		  /**
		   * Return the current lookahead token, or if there isn't one (at the
		   * beginning, or if the previous lookahead token was consume()d),
		   * fetch the next token as the new lookahead token and return it.
		   */
		  ;

		  _proto.fetch = function fetch() {
		    if (this.nextToken == null) {
		      this.nextToken = this.gullet.expandNextToken();
		    }

		    return this.nextToken;
		  }
		  /**
		   * Switches between "text" and "math" modes.
		   */
		  ;

		  _proto.switchMode = function switchMode(newMode) {
		    this.mode = newMode;
		    this.gullet.switchMode(newMode);
		  }
		  /**
		   * Main parsing function, which parses an entire input.
		   */
		  ;

		  _proto.parse = function parse() {
		    if (!this.settings.globalGroup) {
		      // Create a group namespace for the math expression.
		      // (LaTeX creates a new group for every $...$, $$...$$, \[...\].)
		      this.gullet.beginGroup();
		    } // Use old \color behavior (same as LaTeX's \textcolor) if requested.
		    // We do this within the group for the math expression, so it doesn't
		    // pollute settings.macros.


		    if (this.settings.colorIsTextColor) {
		      this.gullet.macros.set("\\color", "\\textcolor");
		    }

		    try {
		      // Try to parse the input
		      var parse = this.parseExpression(false); // If we succeeded, make sure there's an EOF at the end

		      this.expect("EOF"); // End the group namespace for the expression

		      if (!this.settings.globalGroup) {
		        this.gullet.endGroup();
		      }

		      return parse; // Close any leftover groups in case of a parse error.
		    } finally {
		      this.gullet.endGroups();
		    }
		  }
		  /**
		   * Fully parse a separate sequence of tokens as a separate job.
		   * Tokens should be specified in reverse order, as in a MacroDefinition.
		   */
		  ;

		  _proto.subparse = function subparse(tokens) {
		    // Save the next token from the current job.
		    var oldToken = this.nextToken;
		    this.consume(); // Run the new job, terminating it with an excess '}'

		    this.gullet.pushToken(new Token("}"));
		    this.gullet.pushTokens(tokens);
		    var parse = this.parseExpression(false);
		    this.expect("}"); // Restore the next token from the current job.

		    this.nextToken = oldToken;
		    return parse;
		  };

		  /**
		   * Parses an "expression", which is a list of atoms.
		   *
		   * `breakOnInfix`: Should the parsing stop when we hit infix nodes? This
		   *                 happens when functions have higher precedence han infix
		   *                 nodes in implicit parses.
		   *
		   * `breakOnTokenText`: The text of the token that the expression should end
		   *                     with, or `null` if something else should end the
		   *                     expression.
		   */
		  _proto.parseExpression = function parseExpression(breakOnInfix, breakOnTokenText) {
		    var body = []; // Keep adding atoms to the body until we can't parse any more atoms (either
		    // we reached the end, a }, or a \right)

		    while (true) {
		      // Ignore spaces in math mode
		      if (this.mode === "math") {
		        this.consumeSpaces();
		      }

		      var lex = this.fetch();

		      if (Parser.endOfExpression.indexOf(lex.text) !== -1) {
		        break;
		      }

		      if (breakOnTokenText && lex.text === breakOnTokenText) {
		        break;
		      }

		      if (breakOnInfix && src_functions[lex.text] && src_functions[lex.text].infix) {
		        break;
		      }

		      var atom = this.parseAtom(breakOnTokenText);

		      if (!atom) {
		        break;
		      } else if (atom.type === "internal") {
		        continue;
		      }

		      body.push(atom);
		    }

		    if (this.mode === "text") {
		      this.formLigatures(body);
		    }

		    return this.handleInfixNodes(body);
		  }
		  /**
		   * Rewrites infix operators such as \over with corresponding commands such
		   * as \frac.
		   *
		   * There can only be one infix operator per group.  If there's more than one
		   * then the expression is ambiguous.  This can be resolved by adding {}.
		   */
		  ;

		  _proto.handleInfixNodes = function handleInfixNodes(body) {
		    var overIndex = -1;
		    var funcName;

		    for (var i = 0; i < body.length; i++) {
		      if (body[i].type === "infix") {
		        if (overIndex !== -1) {
		          throw new src_ParseError("only one infix operator per group", body[i].token);
		        }

		        overIndex = i;
		        funcName = body[i].replaceWith;
		      }
		    }

		    if (overIndex !== -1 && funcName) {
		      var numerNode;
		      var denomNode;
		      var numerBody = body.slice(0, overIndex);
		      var denomBody = body.slice(overIndex + 1);

		      if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
		        numerNode = numerBody[0];
		      } else {
		        numerNode = {
		          type: "ordgroup",
		          mode: this.mode,
		          body: numerBody
		        };
		      }

		      if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
		        denomNode = denomBody[0];
		      } else {
		        denomNode = {
		          type: "ordgroup",
		          mode: this.mode,
		          body: denomBody
		        };
		      }

		      var node;

		      if (funcName === "\\\\abovefrac") {
		        node = this.callFunction(funcName, [numerNode, body[overIndex], denomNode], []);
		      } else {
		        node = this.callFunction(funcName, [numerNode, denomNode], []);
		      }

		      return [node];
		    } else {
		      return body;
		    }
		  }
		  /**
		   * Handle a subscript or superscript with nice errors.
		   */
		  ;

		  _proto.handleSupSubscript = function handleSupSubscript(name // For error reporting.
		  ) {
		    var symbolToken = this.fetch();
		    var symbol = symbolToken.text;
		    this.consume();
		    this.consumeSpaces(); // ignore spaces before sup/subscript argument

		    var group = this.parseGroup(name);

		    if (!group) {
		      throw new src_ParseError("Expected group after '" + symbol + "'", symbolToken);
		    }

		    return group;
		  }
		  /**
		   * Converts the textual input of an unsupported command into a text node
		   * contained within a color node whose color is determined by errorColor
		   */
		  ;

		  _proto.formatUnsupportedCmd = function formatUnsupportedCmd(text) {
		    var textordArray = [];

		    for (var i = 0; i < text.length; i++) {
		      textordArray.push({
		        type: "textord",
		        mode: "text",
		        text: text[i]
		      });
		    }

		    var textNode = {
		      type: "text",
		      mode: this.mode,
		      body: textordArray
		    };
		    var colorNode = {
		      type: "color",
		      mode: this.mode,
		      color: this.settings.errorColor,
		      body: [textNode]
		    };
		    return colorNode;
		  }
		  /**
		   * Parses a group with optional super/subscripts.
		   */
		  ;

		  _proto.parseAtom = function parseAtom(breakOnTokenText) {
		    // The body of an atom is an implicit group, so that things like
		    // \left(x\right)^2 work correctly.
		    var base = this.parseGroup("atom", breakOnTokenText); // In text mode, we don't have superscripts or subscripts

		    if (this.mode === "text") {
		      return base;
		    } // Note that base may be empty (i.e. null) at this point.


		    var superscript;
		    var subscript;

		    while (true) {
		      // Guaranteed in math mode, so eat any spaces first.
		      this.consumeSpaces(); // Lex the first token

		      var lex = this.fetch();

		      if (lex.text === "\\limits" || lex.text === "\\nolimits") {
		        // We got a limit control
		        if (base && base.type === "op") {
		          var limits = lex.text === "\\limits";
		          base.limits = limits;
		          base.alwaysHandleSupSub = true;
		        } else if (base && base.type === "operatorname") {
		          if (base.alwaysHandleSupSub) {
		            base.limits = lex.text === "\\limits";
		          }
		        } else {
		          throw new src_ParseError("Limit controls must follow a math operator", lex);
		        }

		        this.consume();
		      } else if (lex.text === "^") {
		        // We got a superscript start
		        if (superscript) {
		          throw new src_ParseError("Double superscript", lex);
		        }

		        superscript = this.handleSupSubscript("superscript");
		      } else if (lex.text === "_") {
		        // We got a subscript start
		        if (subscript) {
		          throw new src_ParseError("Double subscript", lex);
		        }

		        subscript = this.handleSupSubscript("subscript");
		      } else if (lex.text === "'") {
		        // We got a prime
		        if (superscript) {
		          throw new src_ParseError("Double superscript", lex);
		        }

		        var prime = {
		          type: "textord",
		          mode: this.mode,
		          text: "\\prime"
		        }; // Many primes can be grouped together, so we handle this here

		        var primes = [prime];
		        this.consume(); // Keep lexing tokens until we get something that's not a prime

		        while (this.fetch().text === "'") {
		          // For each one, add another prime to the list
		          primes.push(prime);
		          this.consume();
		        } // If there's a superscript following the primes, combine that
		        // superscript in with the primes.


		        if (this.fetch().text === "^") {
		          primes.push(this.handleSupSubscript("superscript"));
		        } // Put everything into an ordgroup as the superscript


		        superscript = {
		          type: "ordgroup",
		          mode: this.mode,
		          body: primes
		        };
		      } else if (uSubsAndSups[lex.text]) {
		        // A Unicode subscript or superscript character.
		        // We treat these similarly to the unicode-math package.
		        // So we render a string of Unicode (sub|super)scripts the
		        // same as a (sub|super)script of regular characters.
		        var str = uSubsAndSups[lex.text];
		        var isSub = unicodeSubRegEx.test(lex.text);
		        this.consume(); // Continue fetching tokens to fill out the string.

		        while (true) {
		          var token = this.fetch().text;

		          if (!uSubsAndSups[token]) {
		            break;
		          }

		          if (unicodeSubRegEx.test(token) !== isSub) {
		            break;
		          }

		          this.consume();
		          str += uSubsAndSups[token];
		        } // Now create a (sub|super)script.


		        var body = new Parser(str, this.settings).parse();

		        if (isSub) {
		          subscript = {
		            type: "ordgroup",
		            mode: "math",
		            body: body
		          };
		        } else {
		          superscript = {
		            type: "ordgroup",
		            mode: "math",
		            body: body
		          };
		        }
		      } else {
		        // If it wasn't ^, _, or ', stop parsing super/subscripts
		        break;
		      }
		    } // Base must be set if superscript or subscript are set per logic above,
		    // but need to check here for type check to pass.


		    if (superscript || subscript) {
		      // If we got either a superscript or subscript, create a supsub
		      return {
		        type: "supsub",
		        mode: this.mode,
		        base: base,
		        sup: superscript,
		        sub: subscript
		      };
		    } else {
		      // Otherwise return the original body
		      return base;
		    }
		  }
		  /**
		   * Parses an entire function, including its base and all of its arguments.
		   */
		  ;

		  _proto.parseFunction = function parseFunction(breakOnTokenText, name // For determining its context
		  ) {
		    var token = this.fetch();
		    var func = token.text;
		    var funcData = src_functions[func];

		    if (!funcData) {
		      return null;
		    }

		    this.consume(); // consume command token

		    if (name && name !== "atom" && !funcData.allowedInArgument) {
		      throw new src_ParseError("Got function '" + func + "' with no arguments" + (name ? " as " + name : ""), token);
		    } else if (this.mode === "text" && !funcData.allowedInText) {
		      throw new src_ParseError("Can't use function '" + func + "' in text mode", token);
		    } else if (this.mode === "math" && funcData.allowedInMath === false) {
		      throw new src_ParseError("Can't use function '" + func + "' in math mode", token);
		    }

		    var _this$parseArguments = this.parseArguments(func, funcData),
		        args = _this$parseArguments.args,
		        optArgs = _this$parseArguments.optArgs;

		    return this.callFunction(func, args, optArgs, token, breakOnTokenText);
		  }
		  /**
		   * Call a function handler with a suitable context and arguments.
		   */
		  ;

		  _proto.callFunction = function callFunction(name, args, optArgs, token, breakOnTokenText) {
		    var context = {
		      funcName: name,
		      parser: this,
		      token: token,
		      breakOnTokenText: breakOnTokenText
		    };
		    var func = src_functions[name];

		    if (func && func.handler) {
		      return func.handler(context, args, optArgs);
		    } else {
		      throw new src_ParseError("No function handler for " + name);
		    }
		  }
		  /**
		   * Parses the arguments of a function or environment
		   */
		  ;

		  _proto.parseArguments = function parseArguments(func, // Should look like "\name" or "\begin{name}".
		  funcData) {
		    var totalArgs = funcData.numArgs + funcData.numOptionalArgs;

		    if (totalArgs === 0) {
		      return {
		        args: [],
		        optArgs: []
		      };
		    }

		    var args = [];
		    var optArgs = [];

		    for (var i = 0; i < totalArgs; i++) {
		      var argType = funcData.argTypes && funcData.argTypes[i];
		      var isOptional = i < funcData.numOptionalArgs;

		      if (funcData.primitive && argType == null || // \sqrt expands into primitive if optional argument doesn't exist
		      funcData.type === "sqrt" && i === 1 && optArgs[0] == null) {
		        argType = "primitive";
		      }

		      var arg = this.parseGroupOfType("argument to '" + func + "'", argType, isOptional);

		      if (isOptional) {
		        optArgs.push(arg);
		      } else if (arg != null) {
		        args.push(arg);
		      } else {
		        // should be unreachable
		        throw new src_ParseError("Null argument, please report this as a bug");
		      }
		    }

		    return {
		      args: args,
		      optArgs: optArgs
		    };
		  }
		  /**
		   * Parses a group when the mode is changing.
		   */
		  ;

		  _proto.parseGroupOfType = function parseGroupOfType(name, type, optional) {
		    switch (type) {
		      case "color":
		        return this.parseColorGroup(optional);

		      case "size":
		        return this.parseSizeGroup(optional);

		      case "url":
		        return this.parseUrlGroup(optional);

		      case "math":
		      case "text":
		        return this.parseArgumentGroup(optional, type);

		      case "hbox":
		        {
		          // hbox argument type wraps the argument in the equivalent of
		          // \hbox, which is like \text but switching to \textstyle size.
		          var group = this.parseArgumentGroup(optional, "text");
		          return group != null ? {
		            type: "styling",
		            mode: group.mode,
		            body: [group],
		            style: "text" // simulate \textstyle

		          } : null;
		        }

		      case "raw":
		        {
		          var token = this.parseStringGroup("raw", optional);
		          return token != null ? {
		            type: "raw",
		            mode: "text",
		            string: token.text
		          } : null;
		        }

		      case "primitive":
		        {
		          if (optional) {
		            throw new src_ParseError("A primitive argument cannot be optional");
		          }

		          var _group = this.parseGroup(name);

		          if (_group == null) {
		            throw new src_ParseError("Expected group as " + name, this.fetch());
		          }

		          return _group;
		        }

		      case "original":
		      case null:
		      case undefined:
		        return this.parseArgumentGroup(optional);

		      default:
		        throw new src_ParseError("Unknown group type as " + name, this.fetch());
		    }
		  }
		  /**
		   * Discard any space tokens, fetching the next non-space token.
		   */
		  ;

		  _proto.consumeSpaces = function consumeSpaces() {
		    while (this.fetch().text === " ") {
		      this.consume();
		    }
		  }
		  /**
		   * Parses a group, essentially returning the string formed by the
		   * brace-enclosed tokens plus some position information.
		   */
		  ;

		  _proto.parseStringGroup = function parseStringGroup(modeName, // Used to describe the mode in error messages.
		  optional) {
		    var argToken = this.gullet.scanArgument(optional);

		    if (argToken == null) {
		      return null;
		    }

		    var str = "";
		    var nextToken;

		    while ((nextToken = this.fetch()).text !== "EOF") {
		      str += nextToken.text;
		      this.consume();
		    }

		    this.consume(); // consume the end of the argument

		    argToken.text = str;
		    return argToken;
		  }
		  /**
		   * Parses a regex-delimited group: the largest sequence of tokens
		   * whose concatenated strings match `regex`. Returns the string
		   * formed by the tokens plus some position information.
		   */
		  ;

		  _proto.parseRegexGroup = function parseRegexGroup(regex, modeName // Used to describe the mode in error messages.
		  ) {
		    var firstToken = this.fetch();
		    var lastToken = firstToken;
		    var str = "";
		    var nextToken;

		    while ((nextToken = this.fetch()).text !== "EOF" && regex.test(str + nextToken.text)) {
		      lastToken = nextToken;
		      str += lastToken.text;
		      this.consume();
		    }

		    if (str === "") {
		      throw new src_ParseError("Invalid " + modeName + ": '" + firstToken.text + "'", firstToken);
		    }

		    return firstToken.range(lastToken, str);
		  }
		  /**
		   * Parses a color description.
		   */
		  ;

		  _proto.parseColorGroup = function parseColorGroup(optional) {
		    var res = this.parseStringGroup("color", optional);

		    if (res == null) {
		      return null;
		    }

		    var match = /^(#[a-f0-9]{3}|#?[a-f0-9]{6}|[a-z]+)$/i.exec(res.text);

		    if (!match) {
		      throw new src_ParseError("Invalid color: '" + res.text + "'", res);
		    }

		    var color = match[0];

		    if (/^[0-9a-f]{6}$/i.test(color)) {
		      // We allow a 6-digit HTML color spec without a leading "#".
		      // This follows the xcolor package's HTML color model.
		      // Predefined color names are all missed by this RegEx pattern.
		      color = "#" + color;
		    }

		    return {
		      type: "color-token",
		      mode: this.mode,
		      color: color
		    };
		  }
		  /**
		   * Parses a size specification, consisting of magnitude and unit.
		   */
		  ;

		  _proto.parseSizeGroup = function parseSizeGroup(optional) {
		    var res;
		    var isBlank = false; // don't expand before parseStringGroup

		    this.gullet.consumeSpaces();

		    if (!optional && this.gullet.future().text !== "{") {
		      res = this.parseRegexGroup(/^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
		    } else {
		      res = this.parseStringGroup("size", optional);
		    }

		    if (!res) {
		      return null;
		    }

		    if (!optional && res.text.length === 0) {
		      // Because we've tested for what is !optional, this block won't
		      // affect \kern, \hspace, etc. It will capture the mandatory arguments
		      // to \genfrac and \above.
		      res.text = "0pt"; // Enable \above{}

		      isBlank = true; // This is here specifically for \genfrac
		    }

		    var match = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(res.text);

		    if (!match) {
		      throw new src_ParseError("Invalid size: '" + res.text + "'", res);
		    }

		    var data = {
		      number: +(match[1] + match[2]),
		      // sign + magnitude, cast to number
		      unit: match[3]
		    };

		    if (!validUnit(data)) {
		      throw new src_ParseError("Invalid unit: '" + data.unit + "'", res);
		    }

		    return {
		      type: "size",
		      mode: this.mode,
		      value: data,
		      isBlank: isBlank
		    };
		  }
		  /**
		   * Parses an URL, checking escaped letters and allowed protocols,
		   * and setting the catcode of % as an active character (as in \hyperref).
		   */
		  ;

		  _proto.parseUrlGroup = function parseUrlGroup(optional) {
		    this.gullet.lexer.setCatcode("%", 13); // active character

		    this.gullet.lexer.setCatcode("~", 12); // other character

		    var res = this.parseStringGroup("url", optional);
		    this.gullet.lexer.setCatcode("%", 14); // comment character

		    this.gullet.lexer.setCatcode("~", 13); // active character

		    if (res == null) {
		      return null;
		    } // hyperref package allows backslashes alone in href, but doesn't
		    // generate valid links in such cases; we interpret this as
		    // "undefined" behaviour, and keep them as-is. Some browser will
		    // replace backslashes with forward slashes.


		    var url = res.text.replace(/\\([#$%&~_^{}])/g, '$1');
		    return {
		      type: "url",
		      mode: this.mode,
		      url: url
		    };
		  }
		  /**
		   * Parses an argument with the mode specified.
		   */
		  ;

		  _proto.parseArgumentGroup = function parseArgumentGroup(optional, mode) {
		    var argToken = this.gullet.scanArgument(optional);

		    if (argToken == null) {
		      return null;
		    }

		    var outerMode = this.mode;

		    if (mode) {
		      // Switch to specified mode
		      this.switchMode(mode);
		    }

		    this.gullet.beginGroup();
		    var expression = this.parseExpression(false, "EOF"); // TODO: find an alternative way to denote the end

		    this.expect("EOF"); // expect the end of the argument

		    this.gullet.endGroup();
		    var result = {
		      type: "ordgroup",
		      mode: this.mode,
		      loc: argToken.loc,
		      body: expression
		    };

		    if (mode) {
		      // Switch mode back
		      this.switchMode(outerMode);
		    }

		    return result;
		  }
		  /**
		   * Parses an ordinary group, which is either a single nucleus (like "x")
		   * or an expression in braces (like "{x+y}") or an implicit group, a group
		   * that starts at the current position, and ends right before a higher explicit
		   * group ends, or at EOF.
		   */
		  ;

		  _proto.parseGroup = function parseGroup(name, // For error reporting.
		  breakOnTokenText) {
		    var firstToken = this.fetch();
		    var text = firstToken.text;
		    var result; // Try to parse an open brace or \begingroup

		    if (text === "{" || text === "\\begingroup") {
		      this.consume();
		      var groupEnd = text === "{" ? "}" : "\\endgroup";
		      this.gullet.beginGroup(); // If we get a brace, parse an expression

		      var expression = this.parseExpression(false, groupEnd);
		      var lastToken = this.fetch();
		      this.expect(groupEnd); // Check that we got a matching closing brace

		      this.gullet.endGroup();
		      result = {
		        type: "ordgroup",
		        mode: this.mode,
		        loc: SourceLocation.range(firstToken, lastToken),
		        body: expression,
		        // A group formed by \begingroup...\endgroup is a semi-simple group
		        // which doesn't affect spacing in math mode, i.e., is transparent.
		        // https://tex.stackexchange.com/questions/1930/when-should-one-
		        // use-begingroup-instead-of-bgroup
		        semisimple: text === "\\begingroup" || undefined
		      };
		    } else {
		      // If there exists a function with this name, parse the function.
		      // Otherwise, just return a nucleus
		      result = this.parseFunction(breakOnTokenText, name) || this.parseSymbol();

		      if (result == null && text[0] === "\\" && !implicitCommands.hasOwnProperty(text)) {
		        if (this.settings.throwOnError) {
		          throw new src_ParseError("Undefined control sequence: " + text, firstToken);
		        }

		        result = this.formatUnsupportedCmd(text);
		        this.consume();
		      }
		    }

		    return result;
		  }
		  /**
		   * Form ligature-like combinations of characters for text mode.
		   * This includes inputs like "--", "---", "``" and "''".
		   * The result will simply replace multiple textord nodes with a single
		   * character in each value by a single textord node having multiple
		   * characters in its value.  The representation is still ASCII source.
		   * The group will be modified in place.
		   */
		  ;

		  _proto.formLigatures = function formLigatures(group) {
		    var n = group.length - 1;

		    for (var i = 0; i < n; ++i) {
		      var a = group[i]; // $FlowFixMe: Not every node type has a `text` property.

		      var v = a.text;

		      if (v === "-" && group[i + 1].text === "-") {
		        if (i + 1 < n && group[i + 2].text === "-") {
		          group.splice(i, 3, {
		            type: "textord",
		            mode: "text",
		            loc: SourceLocation.range(a, group[i + 2]),
		            text: "---"
		          });
		          n -= 2;
		        } else {
		          group.splice(i, 2, {
		            type: "textord",
		            mode: "text",
		            loc: SourceLocation.range(a, group[i + 1]),
		            text: "--"
		          });
		          n -= 1;
		        }
		      }

		      if ((v === "'" || v === "`") && group[i + 1].text === v) {
		        group.splice(i, 2, {
		          type: "textord",
		          mode: "text",
		          loc: SourceLocation.range(a, group[i + 1]),
		          text: v + v
		        });
		        n -= 1;
		      }
		    }
		  }
		  /**
		   * Parse a single symbol out of the string. Here, we handle single character
		   * symbols and special functions like \verb.
		   */
		  ;

		  _proto.parseSymbol = function parseSymbol() {
		    var nucleus = this.fetch();
		    var text = nucleus.text;

		    if (/^\\verb[^a-zA-Z]/.test(text)) {
		      this.consume();
		      var arg = text.slice(5);
		      var star = arg.charAt(0) === "*";

		      if (star) {
		        arg = arg.slice(1);
		      } // Lexer's tokenRegex is constructed to always have matching
		      // first/last characters.


		      if (arg.length < 2 || arg.charAt(0) !== arg.slice(-1)) {
		        throw new src_ParseError("\\verb assertion failed --\n                    please report what input caused this bug");
		      }

		      arg = arg.slice(1, -1); // remove first and last char

		      return {
		        type: "verb",
		        mode: "text",
		        body: arg,
		        star: star
		      };
		    } // At this point, we should have a symbol, possibly with accents.
		    // First expand any accented base symbol according to unicodeSymbols.


		    if (unicodeSymbols.hasOwnProperty(text[0]) && !src_symbols[this.mode][text[0]]) {
		      // This behavior is not strict (XeTeX-compatible) in math mode.
		      if (this.settings.strict && this.mode === "math") {
		        this.settings.reportNonstrict("unicodeTextInMathMode", "Accented Unicode text character \"" + text[0] + "\" used in " + "math mode", nucleus);
		      }

		      text = unicodeSymbols[text[0]] + text.slice(1);
		    } // Strip off any combining characters


		    var match = combiningDiacriticalMarksEndRegex.exec(text);

		    if (match) {
		      text = text.substring(0, match.index);

		      if (text === 'i') {
		        text = "\u0131"; // dotless i, in math and text mode
		      } else if (text === 'j') {
		        text = "\u0237"; // dotless j, in math and text mode
		      }
		    } // Recognize base symbol


		    var symbol;

		    if (src_symbols[this.mode][text]) {
		      if (this.settings.strict && this.mode === 'math' && extraLatin.indexOf(text) >= 0) {
		        this.settings.reportNonstrict("unicodeTextInMathMode", "Latin-1/Unicode text character \"" + text[0] + "\" used in " + "math mode", nucleus);
		      }

		      var group = src_symbols[this.mode][text].group;
		      var loc = SourceLocation.range(nucleus);
		      var s;

		      if (ATOMS.hasOwnProperty(group)) {
		        // $FlowFixMe
		        var family = group;
		        s = {
		          type: "atom",
		          mode: this.mode,
		          family: family,
		          loc: loc,
		          text: text
		        };
		      } else {
		        // $FlowFixMe
		        s = {
		          type: group,
		          mode: this.mode,
		          loc: loc,
		          text: text
		        };
		      } // $FlowFixMe


		      symbol = s;
		    } else if (text.charCodeAt(0) >= 0x80) {
		      // no symbol for e.g. ^
		      if (this.settings.strict) {
		        if (!supportedCodepoint(text.charCodeAt(0))) {
		          this.settings.reportNonstrict("unknownSymbol", "Unrecognized Unicode character \"" + text[0] + "\"" + (" (" + text.charCodeAt(0) + ")"), nucleus);
		        } else if (this.mode === "math") {
		          this.settings.reportNonstrict("unicodeTextInMathMode", "Unicode text character \"" + text[0] + "\" used in math mode", nucleus);
		        }
		      } // All nonmathematical Unicode characters are rendered as if they
		      // are in text mode (wrapped in \text) because that's what it
		      // takes to render them in LaTeX.  Setting `mode: this.mode` is
		      // another natural choice (the user requested math mode), but
		      // this makes it more difficult for getCharacterMetrics() to
		      // distinguish Unicode characters without metrics and those for
		      // which we want to simulate the letter M.


		      symbol = {
		        type: "textord",
		        mode: "text",
		        loc: SourceLocation.range(nucleus),
		        text: text
		      };
		    } else {
		      return null; // EOF, ^, _, {, }, etc.
		    }

		    this.consume(); // Transform combining characters into accents

		    if (match) {
		      for (var i = 0; i < match[0].length; i++) {
		        var accent = match[0][i];

		        if (!unicodeAccents[accent]) {
		          throw new src_ParseError("Unknown accent ' " + accent + "'", nucleus);
		        }

		        var command = unicodeAccents[accent][this.mode] || unicodeAccents[accent].text;

		        if (!command) {
		          throw new src_ParseError("Accent " + accent + " unsupported in " + this.mode + " mode", nucleus);
		        }

		        symbol = {
		          type: "accent",
		          mode: this.mode,
		          loc: SourceLocation.range(nucleus),
		          label: command,
		          isStretchy: false,
		          isShifty: true,
		          // $FlowFixMe
		          base: symbol
		        };
		      }
		    } // $FlowFixMe


		    return symbol;
		  };

		  return Parser;
		}();

		Parser.endOfExpression = ["}", "\\endgroup", "\\end", "\\right", "&"];
		/**
		 * Provides a single function for parsing an expression using a Parser
		 * TODO(emily): Remove this
		 */




		/**
		 * Parses an expression using a Parser, then returns the parsed result.
		 */
		var parseTree = function parseTree(toParse, settings) {
		  if (!(typeof toParse === 'string' || toParse instanceof String)) {
		    throw new TypeError('KaTeX can only parse string typed expression');
		  }

		  var parser = new Parser(toParse, settings); // Blank out any \df@tag to avoid spurious "Duplicate \tag" errors

		  delete parser.gullet.macros.current["\\df@tag"];
		  var tree = parser.parse(); // Prevent a color definition from persisting between calls to katex.render().

		  delete parser.gullet.macros.current["\\current@color"];
		  delete parser.gullet.macros.current["\\color"]; // If the input used \tag, it will set the \df@tag macro to the tag.
		  // In this case, we separately parse the tag and wrap the tree.

		  if (parser.gullet.macros.get("\\df@tag")) {
		    if (!settings.displayMode) {
		      throw new src_ParseError("\\tag works only in display equations");
		    }

		    tree = [{
		      type: "tag",
		      mode: "text",
		      body: tree,
		      tag: parser.subparse([new Token("\\df@tag")])
		    }];
		  }

		  return tree;
		};

		/* harmony default export */ var src_parseTree = (parseTree);
		/* eslint no-console:0 */

		/**
		 * This is the main entry point for KaTeX. Here, we expose functions for
		 * rendering expressions either to DOM nodes or to markup strings.
		 *
		 * We also expose the ParseError class to check if errors thrown from KaTeX are
		 * errors in the expression, or errors in javascript handling.
		 */











		/**
		 * Parse and build an expression, and place that expression in the DOM node
		 * given.
		 */
		var render = function render(expression, baseNode, options) {
		  baseNode.textContent = "";
		  var node = renderToDomTree(expression, options).toNode();
		  baseNode.appendChild(node);
		}; // KaTeX's styles don't work properly in quirks mode. Print out an error, and
		// disable rendering.


		if (typeof document !== "undefined") {
		  if (document.compatMode !== "CSS1Compat") {
		    typeof console !== "undefined" && console.warn("Warning: KaTeX doesn't work in quirks mode. Make sure your " + "website has a suitable doctype.");

		    render = function render() {
		      throw new src_ParseError("KaTeX doesn't work in quirks mode.");
		    };
		  }
		}
		/**
		 * Parse and build an expression, and return the markup for that.
		 */


		var renderToString = function renderToString(expression, options) {
		  var markup = renderToDomTree(expression, options).toMarkup();
		  return markup;
		};
		/**
		 * Parse an expression and return the parse tree.
		 */


		var generateParseTree = function generateParseTree(expression, options) {
		  var settings = new Settings(options);
		  return src_parseTree(expression, settings);
		};
		/**
		 * If the given error is a KaTeX ParseError and options.throwOnError is false,
		 * renders the invalid LaTeX as a span with hover title giving the KaTeX
		 * error message.  Otherwise, simply throws the error.
		 */


		var renderError = function renderError(error, expression, options) {
		  if (options.throwOnError || !(error instanceof src_ParseError)) {
		    throw error;
		  }

		  var node = buildCommon.makeSpan(["katex-error"], [new SymbolNode(expression)]);
		  node.setAttribute("title", error.toString());
		  node.setAttribute("style", "color:" + options.errorColor);
		  return node;
		};
		/**
		 * Generates and returns the katex build tree. This is used for advanced
		 * use cases (like rendering to custom output).
		 */


		var renderToDomTree = function renderToDomTree(expression, options) {
		  var settings = new Settings(options);

		  try {
		    var tree = src_parseTree(expression, settings);
		    return buildTree(tree, expression, settings);
		  } catch (error) {
		    return renderError(error, expression, settings);
		  }
		};
		/**
		 * Generates and returns the katex build tree, with just HTML (no MathML).
		 * This is used for advanced use cases (like rendering to custom output).
		 */


		var renderToHTMLTree = function renderToHTMLTree(expression, options) {
		  var settings = new Settings(options);

		  try {
		    var tree = src_parseTree(expression, settings);
		    return buildHTMLTree(tree, expression, settings);
		  } catch (error) {
		    return renderError(error, expression, settings);
		  }
		};

		/* harmony default export */ var katex = ({
		  /**
		   * Current KaTeX version
		   */
		  version: "0.16.7",

		  /**
		   * Renders the given LaTeX into an HTML+MathML combination, and adds
		   * it as a child to the specified DOM node.
		   */
		  render: render,

		  /**
		   * Renders the given LaTeX into an HTML+MathML combination string,
		   * for sending to the client.
		   */
		  renderToString: renderToString,

		  /**
		   * KaTeX error, usually during parsing.
		   */
		  ParseError: src_ParseError,

		  /**
		   * The shema of Settings
		   */
		  SETTINGS_SCHEMA: SETTINGS_SCHEMA,

		  /**
		   * Parses the given LaTeX into KaTeX's internal parse tree structure,
		   * without rendering to HTML or MathML.
		   *
		   * NOTE: This method is not currently recommended for public use.
		   * The internal tree representation is unstable and is very likely
		   * to change. Use at your own risk.
		   */
		  __parse: generateParseTree,

		  /**
		   * Renders the given LaTeX into an HTML+MathML internal DOM tree
		   * representation, without flattening that representation to a string.
		   *
		   * NOTE: This method is not currently recommended for public use.
		   * The internal tree representation is unstable and is very likely
		   * to change. Use at your own risk.
		   */
		  __renderToDomTree: renderToDomTree,

		  /**
		   * Renders the given LaTeX into an HTML internal DOM tree representation,
		   * without MathML and without flattening that representation to a string.
		   *
		   * NOTE: This method is not currently recommended for public use.
		   * The internal tree representation is unstable and is very likely
		   * to change. Use at your own risk.
		   */
		  __renderToHTMLTree: renderToHTMLTree,

		  /**
		   * extends internal font metrics object with a new object
		   * each key in the new object represents a font name
		  */
		  __setFontMetrics: setFontMetrics,

		  /**
		   * adds a new symbol to builtin symbols table
		   */
		  __defineSymbol: defineSymbol,

		  /**
		   * adds a new function to builtin function list,
		   * which directly produce parse tree elements
		   * and have their own html/mathml builders
		   */
		  __defineFunction: defineFunction,

		  /**
		   * adds a new macro to builtin macro list
		   */
		  __defineMacro: defineMacro,

		  /**
		   * Expose the dom tree node types, which can be useful for type checking nodes.
		   *
		   * NOTE: This method is not currently recommended for public use.
		   * The internal tree representation is unstable and is very likely
		   * to change. Use at your own risk.
		   */
		  __domTree: {
		    Span: Span,
		    Anchor: Anchor,
		    SymbolNode: SymbolNode,
		    SvgNode: SvgNode,
		    PathNode: PathNode,
		    LineNode: LineNode
		  }
		});
		/**
		 * This is the webpack entry point for KaTeX. As ECMAScript, flow[1] and jest[2]
		 * doesn't support CSS modules natively, a separate entry point is used and
		 * it is not flowtyped.
		 *
		 * [1] https://gist.github.com/lambdahands/d19e0da96285b749f0ef
		 * [2] https://facebook.github.io/jest/docs/en/webpack.html
		 */


		/* harmony default export */ var katex_webpack = (katex);
		__webpack_exports__ = __webpack_exports__["default"];
		/******/ 	return __webpack_exports__;
		/******/ })()
		;
		}); 
	} (katex));
	return katex.exports;
}

(function (module, exports) {
	(function webpackUniversalModuleDefinition(root, factory) {
		module.exports = factory(requireKatex());
	})((typeof self !== 'undefined' ? self : commonjsGlobal), function(__WEBPACK_EXTERNAL_MODULE__771__) {
	return /******/ (function() { // webpackBootstrap
	/******/ 	var __webpack_modules__ = ({

	/***/ 771:
	/***/ (function(module) {

	module.exports = __WEBPACK_EXTERNAL_MODULE__771__;

	/***/ })

	/******/ 	});
	/************************************************************************/
	/******/ 	// The module cache
	/******/ 	var __webpack_module_cache__ = {};
	/******/ 	
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/ 		// Check if module is in cache
	/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
	/******/ 		if (cachedModule !== undefined) {
	/******/ 			return cachedModule.exports;
	/******/ 		}
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = __webpack_module_cache__[moduleId] = {
	/******/ 			// no module.id needed
	/******/ 			// no module.loaded needed
	/******/ 			exports: {}
	/******/ 		};
	/******/ 	
	/******/ 		// Execute the module function
	/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
	/******/ 	
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/ 	
	/************************************************************************/
	/******/ 	/* webpack/runtime/compat get default export */
	/******/ 	!function() {
	/******/ 		// getDefaultExport function for compatibility with non-harmony modules
	/******/ 		__webpack_require__.n = function(module) {
	/******/ 			var getter = module && module.__esModule ?
	/******/ 				function() { return module['default']; } :
	/******/ 				function() { return module; };
	/******/ 			__webpack_require__.d(getter, { a: getter });
	/******/ 			return getter;
	/******/ 		};
	/******/ 	}();
	/******/ 	
	/******/ 	/* webpack/runtime/define property getters */
	/******/ 	!function() {
	/******/ 		// define getter functions for harmony exports
	/******/ 		__webpack_require__.d = function(exports, definition) {
	/******/ 			for(var key in definition) {
	/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
	/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
	/******/ 				}
	/******/ 			}
	/******/ 		};
	/******/ 	}();
	/******/ 	
	/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
	/******/ 	!function() {
	/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
	/******/ 	}();
	/******/ 	
	/************************************************************************/
	var __webpack_exports__ = {};
	// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
	!function() {

	// EXPORTS
	__webpack_require__.d(__webpack_exports__, {
	  "default": function() { return /* binding */ auto_render; }
	});

	// EXTERNAL MODULE: external "katex"
	var external_katex_ = __webpack_require__(771);
	var external_katex_default = /*#__PURE__*/__webpack_require__.n(external_katex_);
	/* eslint no-constant-condition:0 */
	var findEndOfMath = function findEndOfMath(delimiter, text, startIndex) {
	  // Adapted from
	  // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
	  var index = startIndex;
	  var braceLevel = 0;
	  var delimLength = delimiter.length;

	  while (index < text.length) {
	    var character = text[index];

	    if (braceLevel <= 0 && text.slice(index, index + delimLength) === delimiter) {
	      return index;
	    } else if (character === "\\") {
	      index++;
	    } else if (character === "{") {
	      braceLevel++;
	    } else if (character === "}") {
	      braceLevel--;
	    }

	    index++;
	  }

	  return -1;
	};

	var escapeRegex = function escapeRegex(string) {
	  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
	};

	var amsRegex = /^\\begin{/;

	var splitAtDelimiters = function splitAtDelimiters(text, delimiters) {
	  var index;
	  var data = [];
	  var regexLeft = new RegExp("(" + delimiters.map(function (x) {
	    return escapeRegex(x.left);
	  }).join("|") + ")");

	  while (true) {
	    index = text.search(regexLeft);

	    if (index === -1) {
	      break;
	    }

	    if (index > 0) {
	      data.push({
	        type: "text",
	        data: text.slice(0, index)
	      });
	      text = text.slice(index); // now text starts with delimiter
	    } // ... so this always succeeds:


	    var i = delimiters.findIndex(function (delim) {
	      return text.startsWith(delim.left);
	    });
	    index = findEndOfMath(delimiters[i].right, text, delimiters[i].left.length);

	    if (index === -1) {
	      break;
	    }

	    var rawData = text.slice(0, index + delimiters[i].right.length);
	    var math = amsRegex.test(rawData) ? rawData : text.slice(delimiters[i].left.length, index);
	    data.push({
	      type: "math",
	      data: math,
	      rawData: rawData,
	      display: delimiters[i].display
	    });
	    text = text.slice(index + delimiters[i].right.length);
	  }

	  if (text !== "") {
	    data.push({
	      type: "text",
	      data: text
	    });
	  }

	  return data;
	};

	/* harmony default export */ var auto_render_splitAtDelimiters = (splitAtDelimiters);
	/* eslint no-console:0 */


	/* Note: optionsCopy is mutated by this method. If it is ever exposed in the
	 * API, we should copy it before mutating.
	 */

	var renderMathInText = function renderMathInText(text, optionsCopy) {
	  var data = auto_render_splitAtDelimiters(text, optionsCopy.delimiters);

	  if (data.length === 1 && data[0].type === 'text') {
	    // There is no formula in the text.
	    // Let's return null which means there is no need to replace
	    // the current text node with a new one.
	    return null;
	  }

	  var fragment = document.createDocumentFragment();

	  for (var i = 0; i < data.length; i++) {
	    if (data[i].type === "text") {
	      fragment.appendChild(document.createTextNode(data[i].data));
	    } else {
	      var span = document.createElement("span");
	      var math = data[i].data; // Override any display mode defined in the settings with that
	      // defined by the text itself

	      optionsCopy.displayMode = data[i].display;

	      try {
	        if (optionsCopy.preProcess) {
	          math = optionsCopy.preProcess(math);
	        }

	        external_katex_default().render(math, span, optionsCopy);
	      } catch (e) {
	        if (!(e instanceof (external_katex_default()).ParseError)) {
	          throw e;
	        }

	        optionsCopy.errorCallback("KaTeX auto-render: Failed to parse `" + data[i].data + "` with ", e);
	        fragment.appendChild(document.createTextNode(data[i].rawData));
	        continue;
	      }

	      fragment.appendChild(span);
	    }
	  }

	  return fragment;
	};

	var renderElem = function renderElem(elem, optionsCopy) {
	  for (var i = 0; i < elem.childNodes.length; i++) {
	    var childNode = elem.childNodes[i];

	    if (childNode.nodeType === 3) {
	      // Text node
	      // Concatenate all sibling text nodes.
	      // Webkit browsers split very large text nodes into smaller ones,
	      // so the delimiters may be split across different nodes.
	      var textContentConcat = childNode.textContent;
	      var sibling = childNode.nextSibling;
	      var nSiblings = 0;

	      while (sibling && sibling.nodeType === Node.TEXT_NODE) {
	        textContentConcat += sibling.textContent;
	        sibling = sibling.nextSibling;
	        nSiblings++;
	      }

	      var frag = renderMathInText(textContentConcat, optionsCopy);

	      if (frag) {
	        // Remove extra text nodes
	        for (var j = 0; j < nSiblings; j++) {
	          childNode.nextSibling.remove();
	        }

	        i += frag.childNodes.length - 1;
	        elem.replaceChild(frag, childNode);
	      } else {
	        // If the concatenated text does not contain math
	        // the siblings will not either
	        i += nSiblings;
	      }
	    } else if (childNode.nodeType === 1) {
	      (function () {
	        // Element node
	        var className = ' ' + childNode.className + ' ';
	        var shouldRender = optionsCopy.ignoredTags.indexOf(childNode.nodeName.toLowerCase()) === -1 && optionsCopy.ignoredClasses.every(function (x) {
	          return className.indexOf(' ' + x + ' ') === -1;
	        });

	        if (shouldRender) {
	          renderElem(childNode, optionsCopy);
	        }
	      })();
	    } // Otherwise, it's something else, and ignore it.

	  }
	};

	var renderMathInElement = function renderMathInElement(elem, options) {
	  if (!elem) {
	    throw new Error("No element provided to render");
	  }

	  var optionsCopy = {}; // Object.assign(optionsCopy, option)

	  for (var option in options) {
	    if (options.hasOwnProperty(option)) {
	      optionsCopy[option] = options[option];
	    }
	  } // default options


	  optionsCopy.delimiters = optionsCopy.delimiters || [{
	    left: "$$",
	    right: "$$",
	    display: true
	  }, {
	    left: "\\(",
	    right: "\\)",
	    display: false
	  }, // LaTeX uses $…$, but it ruins the display of normal `$` in text:
	  // {left: "$", right: "$", display: false},
	  // $ must come after $$
	  // Render AMS environments even if outside $$…$$ delimiters.
	  {
	    left: "\\begin{equation}",
	    right: "\\end{equation}",
	    display: true
	  }, {
	    left: "\\begin{align}",
	    right: "\\end{align}",
	    display: true
	  }, {
	    left: "\\begin{alignat}",
	    right: "\\end{alignat}",
	    display: true
	  }, {
	    left: "\\begin{gather}",
	    right: "\\end{gather}",
	    display: true
	  }, {
	    left: "\\begin{CD}",
	    right: "\\end{CD}",
	    display: true
	  }, {
	    left: "\\[",
	    right: "\\]",
	    display: true
	  }];
	  optionsCopy.ignoredTags = optionsCopy.ignoredTags || ["script", "noscript", "style", "textarea", "pre", "code", "option"];
	  optionsCopy.ignoredClasses = optionsCopy.ignoredClasses || [];
	  optionsCopy.errorCallback = optionsCopy.errorCallback || console.error; // Enable sharing of global macros defined via `\gdef` between different
	  // math elements within a single call to `renderMathInElement`.

	  optionsCopy.macros = optionsCopy.macros || {};
	  renderElem(elem, optionsCopy);
	};

	/* harmony default export */ var auto_render = (renderMathInElement);
	}();
	__webpack_exports__ = __webpack_exports__["default"];
	/******/ 	return __webpack_exports__;
	/******/ })()
	;
	}); 
} (autoRender));

var autoRenderExports = autoRender.exports;
const render_math_in_element = /*@__PURE__*/getDefaultExportFromCjs(autoRenderExports);

const katex_min = '';

/**
 * marked v7.0.0 - a markdown parser
 * Copyright (c) 2011-2023, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/defaults.ts
function _getDefaults() {
  return {
    async: false,
    baseUrl: null,
    breaks: false,
    extensions: null,
    gfm: true,
    headerIds: false,
    headerPrefix: "",
    highlight: null,
    hooks: null,
    langPrefix: "language-",
    mangle: false,
    pedantic: false,
    renderer: null,
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartypants: false,
    tokenizer: null,
    walkTokens: null,
    xhtml: false
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}

// src/helpers.ts
var escapeTest$1 = /[&<>"']/;
var escapeReplace$1 = new RegExp(escapeTest$1.source, "g");
var escapeTestNoEncode$1 = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode$1 = new RegExp(escapeTestNoEncode$1.source, "g");
var escapeReplacements$1 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement$1 = (ch) => escapeReplacements$1[ch];
function escape$2(html, encode) {
  if (encode) {
    if (escapeTest$1.test(html)) {
      return html.replace(escapeReplace$1, getEscapeReplacement$1);
    }
  } else {
    if (escapeTestNoEncode$1.test(html)) {
      return html.replace(escapeReplaceNoEncode$1, getEscapeReplacement$1);
    }
  }
  return html;
}
var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
function unescape(html) {
  return html.replace(unescapeTest, (_, n) => {
    n = n.toLowerCase();
    if (n === "colon")
      return ":";
    if (n.charAt(0) === "#") {
      return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
    }
    return "";
  });
}
var caret = /(^|[^\[])\^/g;
function edit(regex, opt) {
  regex = typeof regex === "string" ? regex : regex.source;
  opt = opt || "";
  const obj = {
    replace: (name, val) => {
      val = typeof val === "object" && "source" in val ? val.source : val;
      val = val.replace(caret, "$1");
      regex = regex.replace(name, val);
      return obj;
    },
    getRegex: () => {
      return new RegExp(regex, opt);
    }
  };
  return obj;
}
var nonWordAndColonTest = /[^\w:]/g;
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
function cleanUrl(sanitize, base, href) {
  if (sanitize) {
    let prot;
    try {
      prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, "").toLowerCase();
    } catch (e) {
      return null;
    }
    if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0 || prot.indexOf("data:") === 0) {
      return null;
    }
  }
  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href);
  }
  try {
    href = encodeURI(href).replace(/%25/g, "%");
  } catch (e) {
    return null;
  }
  return href;
}
var baseUrls = {};
var justDomain = /^[^:]+:\/*[^/]*$/;
var protocol = /^([^:]+:)[\s\S]*$/;
var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
function resolveUrl(base, href) {
  if (!baseUrls[" " + base]) {
    if (justDomain.test(base)) {
      baseUrls[" " + base] = base + "/";
    } else {
      baseUrls[" " + base] = rtrim(base, "/", true);
    }
  }
  base = baseUrls[" " + base];
  const relativeBase = base.indexOf(":") === -1;
  if (href.substring(0, 2) === "//") {
    if (relativeBase) {
      return href;
    }
    return base.replace(protocol, "$1") + href;
  } else if (href.charAt(0) === "/") {
    if (relativeBase) {
      return href;
    }
    return base.replace(domain, "$1") + href;
  } else {
    return base + href;
  }
}
var noopTest = { exec: () => null };
function splitCells(tableRow, count) {
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false, curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(/ \|/);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) {
    cells.pop();
  }
  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count)
      cells.push("");
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  const l = str.length;
  let level = 0, i = 0;
  for (; i < l; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}
function checkDeprecations(opt, callback) {
  if (!opt || opt.silent) {
    return;
  }
  if (callback) {
    console.warn("marked(): callback is deprecated since version 5.0.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/using_pro#async");
  }
  if (opt.sanitize || opt.sanitizer) {
    console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");
  }
  if (opt.highlight || opt.langPrefix !== "language-") {
    console.warn("marked(): highlight and langPrefix parameters are deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-highlight.");
  }
  if (opt.mangle) {
    console.warn("marked(): mangle parameter is enabled by default, but is deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install https://www.npmjs.com/package/marked-mangle, or disable by setting `{mangle: false}`.");
  }
  if (opt.baseUrl) {
    console.warn("marked(): baseUrl parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-base-url.");
  }
  if (opt.smartypants) {
    console.warn("marked(): smartypants parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-smartypants.");
  }
  if (opt.xhtml) {
    console.warn("marked(): xhtml parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-xhtml.");
  }
  if (opt.headerIds || opt.headerPrefix) {
    console.warn("marked(): headerIds and headerPrefix parameters enabled by default, but are deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install  https://www.npmjs.com/package/marked-gfm-heading-id, or disable by setting `{headerIds: false}`.");
  }
}

// src/Tokenizer.ts
function outputLink(cap, link, raw, lexer2) {
  const href = link.href;
  const title = link.title ? escape$2(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer2.state.inLink = true;
    const token = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer2.inlineTokens(text)
    };
    lexer2.state.inLink = false;
    return token;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text: escape$2(text)
  };
}
function indentCodeCompensation(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(/^\s+/);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ {1,4}/gm, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "");
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: cap[0]
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ *>[ \t]?/gm, "");
      const top = this.lexer.state.top;
      this.lexer.state.top = true;
      const tokens = this.lexer.blockTokens(text);
      this.lexer.state.top = top;
      return {
        type: "blockquote",
        raw: cap[0],
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, nextLine, rawLine, itemContents, endEarly;
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      while (src) {
        endEarly = false;
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        line = cap[2].split("\n", 1)[0].replace(/^\t+/, (t) => " ".repeat(3 * t.length));
        nextLine = src.split("\n", 1)[0];
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimLeft();
        } else {
          indent = cap[2].search(/[^ ]/);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        blankLine = false;
        if (!line && /^ *$/.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
          while (src) {
            rawLine = src.split("\n", 1)[0];
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(src)) {
              break;
            }
            if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLine.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.search(/[^ ]/) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLine.slice(indent);
          }
        }
        if (!list.loose) {
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n *\n *$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
          }
        }
        list.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents
        });
        list.raw += raw;
      }
      list.items[list.items.length - 1].raw = raw.trimRight();
      list.items[list.items.length - 1].text = itemContents.trimRight();
      list.raw = list.raw.trimRight();
      const l = list.items.length;
      for (i = 0; i < l; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
        if (!list.loose) {
          const spacers = list.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => /\n.*\n/.test(t.raw));
          list.loose = hasMultipleLineBreaks;
        }
      }
      if (list.loose) {
        for (i = 0; i < l; i++) {
          list.items[i].loose = true;
        }
      }
      return list;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: !this.options.sanitizer && (cap[1] === "pre" || cap[1] === "script" || cap[1] === "style"),
        text: cap[0]
      };
      if (this.options.sanitize) {
        const text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$2(cap[0]);
        const paragraph = token;
        paragraph.type = "paragraph";
        paragraph.text = text;
        paragraph.tokens = this.lexer.inline(text);
      }
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline._escapes, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline._escapes, "$1") : cap[3];
      return {
        type: "def",
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (cap) {
      const item = {
        type: "table",
        // splitCells expects a number as second argument
        // @ts-expect-error
        header: splitCells(cap[1]).map((c) => {
          return { text: c };
        }),
        align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
        rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split("\n") : []
      };
      if (item.header.length === item.align.length) {
        item.raw = cap[0];
        let l = item.align.length;
        let i, j, k, row;
        for (i = 0; i < l; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = "right";
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = "center";
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = "left";
          } else {
            item.align[i] = null;
          }
        }
        l = item.rows.length;
        for (i = 0; i < l; i++) {
          item.rows[i] = splitCells(item.rows[i], item.header.length).map((c) => {
            return { text: c };
          });
        }
        l = item.header.length;
        for (j = 0; j < l; j++) {
          item.header[j].tokens = this.lexer.inline(item.header[j].text);
        }
        l = item.rows.length;
        for (j = 0; j < l; j++) {
          row = item.rows[j];
          for (k = 0; k < row.length; k++) {
            row[k].tokens = this.lexer.inline(row[k].text);
          }
        }
        return item;
      }
    }
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: escape$2(cap[1])
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: this.options.sanitize ? "text" : "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$2(cap[0]) : cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        if (!/>$/.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline._escapes, "$1") : href,
        title: title ? title.replace(this.rules.inline._escapes, "$1") : title
      }, cap[0], this.lexer);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      let link = (cap[2] || cap[1]).replace(/\s+/g, " ");
      link = links[link.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrong.lDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = match[0].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = rDelim.length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const raw = src.slice(0, lLength + match.index + rLength + 1);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape$2(text, true);
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src, mangle2) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$2(this.options.mangle ? mangle2(cap[1]) : cap[1]);
        href = "mailto:" + text;
      } else {
        text = escape$2(cap[1]);
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src, mangle2) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$2(this.options.mangle ? mangle2(cap[0]) : cap[0]);
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        text = escape$2(cap[0]);
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src, smartypants2) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$2(cap[0]) : cap[0];
      } else {
        text = escape$2(this.options.smartypants ? smartypants2(cap[0]) : cap[0]);
      }
      return {
        type: "text",
        raw: cap[0],
        text
      };
    }
  }
};

// src/rules.ts
var block = {
  newline: /^(?: *(?:\n|$))+/,
  code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
  html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
  def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
  table: noopTest,
  lheading: /^((?:(?!^bull ).|\n(?!\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  // regex template, placeholders will be replaced according to different paragraph
  // interruption rules of commonmark and the original markdown spec:
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  text: /^[^\n]+/
};
block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
block.def = edit(block.def).replace("label", block._label).replace("title", block._title).getRegex();
block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
block.listItemStart = edit(/^( *)(bull) */).replace("bull", block.bullet).getRegex();
block.list = edit(block.list).replace(/bull/g, block.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + block.def.source + ")").getRegex();
block._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
block.html = edit(block.html, "i").replace("comment", block._comment).replace("tag", block._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
block.lheading = edit(block.lheading).replace(/bull/g, block.bullet).getRegex();
block.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.blockquote = edit(block.blockquote).replace("paragraph", block.paragraph).getRegex();
block.normal = { ...block };
block.gfm = {
  ...block.normal,
  table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
  // Cells
};
block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.gfm.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("table", block.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.pedantic = {
  ...block.normal,
  html: edit(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
};
var inline = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noopTest,
  tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
  // CDATA section
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(ref)\]/,
  nolink: /^!?\[(ref)\](?:\[\])?/,
  reflinkSearch: "reflink|nolink(?!\\()",
  emStrong: {
    lDelim: /^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,
    //         (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
    //         | Skip orphan inside strong      | Consume to delim | (1) #***              | (2) a***#, a***                    | (3) #***a, ***a                  | (4) ***#                 | (5) #***#                         | (6) a***a
    rDelimAst: /^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)[punct](\*+)(?=[\s]|$)|[^punct\s](\*+)(?!\*)(?=[punct\s]|$)|(?!\*)[punct\s](\*+)(?=[^punct\s])|[\s](\*+)(?!\*)(?=[punct])|(?!\*)[punct](\*+)(?!\*)(?=[punct])|[^punct\s](\*+)(?=[^punct\s])/,
    rDelimUnd: /^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\s]|$)|[^punct\s](_+)(?!_)(?=[punct\s]|$)|(?!_)[punct\s](_+)(?=[^punct\s])|[\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/
    // ^- Not allowed for _
  },
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: noopTest,
  text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  punctuation: /^((?![*_])[\spunctuation])/
};
inline._punctuation = "\\p{P}$+<=>`^|~";
inline.punctuation = edit(inline.punctuation, "u").replace(/punctuation/g, inline._punctuation).getRegex();
inline.blockSkip = /\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;
inline.anyPunctuation = /\\[punct]/g;
inline._escapes = /\\([punct])/g;
inline._comment = edit(block._comment).replace("(?:-->|$)", "-->").getRegex();
inline.emStrong.lDelim = edit(inline.emStrong.lDelim, "u").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.anyPunctuation = edit(inline.anyPunctuation, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._escapes = edit(inline._escapes, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
inline.autolink = edit(inline.autolink).replace("scheme", inline._scheme).replace("email", inline._email).getRegex();
inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
inline.tag = edit(inline.tag).replace("comment", inline._comment).replace("attribute", inline._attribute).getRegex();
inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
inline.link = edit(inline.link).replace("label", inline._label).replace("href", inline._href).replace("title", inline._title).getRegex();
inline.reflink = edit(inline.reflink).replace("label", inline._label).replace("ref", block._label).getRegex();
inline.nolink = edit(inline.nolink).replace("ref", block._label).getRegex();
inline.reflinkSearch = edit(inline.reflinkSearch, "g").replace("reflink", inline.reflink).replace("nolink", inline.nolink).getRegex();
inline.normal = { ...inline };
inline.pedantic = {
  ...inline.normal,
  strong: {
    start: /^__|\*\*/,
    middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    endAst: /\*\*(?!\*)/g,
    endUnd: /__(?!_)/g
  },
  em: {
    start: /^_|\*/,
    middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
    endAst: /\*(?!\*)/g,
    endUnd: /_(?!_)/g
  },
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", inline._label).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", inline._label).getRegex()
};
inline.gfm = {
  ...inline.normal,
  escape: edit(inline.escape).replace("])", "~|])").getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
inline.breaks = {
  ...inline.gfm,
  br: edit(inline.br).replace("{2,}", "*").getRegex(),
  text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};

// src/Lexer.ts
function smartypants(text) {
  return text.replace(/---/g, "\u2014").replace(/--/g, "\u2013").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018").replace(/'/g, "\u2019").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C").replace(/"/g, "\u201D").replace(/\.{3}/g, "\u2026");
}
function mangle(text) {
  let out = "", i, ch;
  const l = text.length;
  for (i = 0; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = "x" + ch.toString(16);
    }
    out += "&#" + ch + ";";
  }
  return out;
}
var _Lexer2 = class __Lexer {
  constructor(options2) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options2 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(/\r\n|\r/g, "\n");
    this.blockTokens(src, this.tokens);
    let next;
    while (next = this.inlineQueue.shift()) {
      this.inlineTokens(next.src, next.tokens);
    }
    return this.tokens;
  }
  blockTokens(src, tokens = []) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, "    ").replace(/^ +$/gm, "");
    } else {
      src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
        return leading + "    ".repeat(tabs.length);
      });
    }
    let token, lastToken, cutSrc, lastParagraphClipped;
    while (src) {
      if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        if (token.raw.length === 1 && tokens.length > 0) {
          tokens[tokens.length - 1].raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken.type === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let token, lastToken, cutSrc;
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src, mangle)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};

// src/Renderer.ts
var _Renderer = class {
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  code(code, infostring, escaped) {
    const lang = (infostring || "").match(/\S*/)[0];
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }
    code = code.replace(/\n$/, "") + "\n";
    if (!lang) {
      return "<pre><code>" + (escaped ? code : escape$2(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="' + this.options.langPrefix + escape$2(lang) + '">' + (escaped ? code : escape$2(code, true)) + "</code></pre>\n";
  }
  blockquote(quote) {
    return `<blockquote>
${quote}</blockquote>
`;
  }
  html(html, block2) {
    return html;
  }
  heading(text, level, raw, slugger) {
    if (this.options.headerIds) {
      const id = this.options.headerPrefix + slugger.slug(raw);
      return `<h${level} id="${id}">${text}</h${level}>
`;
    }
    return `<h${level}>${text}</h${level}>
`;
  }
  hr() {
    return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
  }
  list(body, ordered, start) {
    const type = ordered ? "ol" : "ul", startatt = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
  }
  listitem(text, task, checked) {
    return `<li>${text}</li>
`;
  }
  checkbox(checked) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
  }
  paragraph(text) {
    return `<p>${text}</p>
`;
  }
  table(header, body) {
    if (body)
      body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow(content) {
    return `<tr>
${content}</tr>
`;
  }
  tablecell(content, flags) {
    const type = flags.header ? "th" : "td";
    const tag = flags.align ? `<${type} align="${flags.align}">` : `<${type}>`;
    return tag + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong(text) {
    return `<strong>${text}</strong>`;
  }
  em(text) {
    return `<em>${text}</em>`;
  }
  codespan(text) {
    return `<code>${text}</code>`;
  }
  br() {
    return this.options.xhtml ? "<br/>" : "<br>";
  }
  del(text) {
    return `<del>${text}</del>`;
  }
  link(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += this.options.xhtml ? "/>" : ">";
    return out;
  }
  text(text) {
    return text;
  }
};

// src/TextRenderer.ts
var _TextRenderer = class {
  // no need for block level renderers
  strong(text) {
    return text;
  }
  em(text) {
    return text;
  }
  codespan(text) {
    return text;
  }
  del(text) {
    return text;
  }
  html(text) {
    return text;
  }
  text(text) {
    return text;
  }
  link(href, title, text) {
    return "" + text;
  }
  image(href, title, text) {
    return "" + text;
  }
  br() {
    return "";
  }
};

// src/Slugger.ts
var _Slugger = class {
  constructor() {
    this.seen = {};
  }
  serialize(value) {
    return value.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig, "").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "").replace(/\s/g, "-");
  }
  /**
   * Finds the next safe (unique) slug to use
   */
  getNextSafeSlug(originalSlug, isDryRun) {
    let slug = originalSlug;
    let occurenceAccumulator = 0;
    if (this.seen.hasOwnProperty(slug)) {
      occurenceAccumulator = this.seen[originalSlug];
      do {
        occurenceAccumulator++;
        slug = originalSlug + "-" + occurenceAccumulator;
      } while (this.seen.hasOwnProperty(slug));
    }
    if (!isDryRun) {
      this.seen[originalSlug] = occurenceAccumulator;
      this.seen[slug] = 0;
    }
    return slug;
  }
  /**
   * Convert string to unique id
   */
  slug(value, options2 = {}) {
    const slug = this.serialize(value);
    return this.getNextSafeSlug(slug, options2.dryrun);
  }
};

// src/Parser.ts
var _Parser = class __Parser {
  constructor(options2) {
    this.options = options2 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.textRenderer = new _TextRenderer();
    this.slugger = new _Slugger();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    let out = "", i, j, k, l2, l3, row, cell, header, body, token, ordered, start, loose, itemBody, item, checked, task, checkbox, ret;
    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(token.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token.type) {
        case "space": {
          continue;
        }
        case "hr": {
          out += this.renderer.hr();
          continue;
        }
        case "heading": {
          out += this.renderer.heading(
            this.parseInline(token.tokens),
            token.depth,
            unescape(this.parseInline(token.tokens, this.textRenderer)),
            this.slugger
          );
          continue;
        }
        case "code": {
          out += this.renderer.code(
            token.text,
            token.lang,
            !!token.escaped
          );
          continue;
        }
        case "table": {
          header = "";
          cell = "";
          l2 = token.header.length;
          for (j = 0; j < l2; j++) {
            cell += this.renderer.tablecell(
              this.parseInline(token.header[j].tokens),
              { header: true, align: token.align[j] }
            );
          }
          header += this.renderer.tablerow(cell);
          body = "";
          l2 = token.rows.length;
          for (j = 0; j < l2; j++) {
            row = token.rows[j];
            cell = "";
            l3 = row.length;
            for (k = 0; k < l3; k++) {
              cell += this.renderer.tablecell(
                this.parseInline(row[k].tokens),
                { header: false, align: token.align[k] }
              );
            }
            body += this.renderer.tablerow(cell);
          }
          out += this.renderer.table(header, body);
          continue;
        }
        case "blockquote": {
          body = this.parse(token.tokens);
          out += this.renderer.blockquote(body);
          continue;
        }
        case "list": {
          ordered = token.ordered;
          start = token.start;
          loose = token.loose;
          l2 = token.items.length;
          body = "";
          for (j = 0; j < l2; j++) {
            item = token.items[j];
            checked = item.checked;
            task = item.task;
            itemBody = "";
            if (item.task) {
              checkbox = this.renderer.checkbox(!!checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
                  item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                  if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
                    item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: "text",
                    text: checkbox
                  });
                }
              } else {
                itemBody += checkbox;
              }
            }
            itemBody += this.parse(item.tokens, loose);
            body += this.renderer.listitem(itemBody, task, !!checked);
          }
          out += this.renderer.list(body, ordered, start);
          continue;
        }
        case "html": {
          out += this.renderer.html(token.text, token.block);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(this.parseInline(token.tokens));
          continue;
        }
        case "text": {
          body = token.tokens ? this.parseInline(token.tokens) : token.text;
          while (i + 1 < l && tokens[i + 1].type === "text") {
            token = tokens[++i];
            body += "\n" + (token.tokens ? this.parseInline(token.tokens) : token.text);
          }
          out += top ? this.renderer.paragraph(body) : body;
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = "", i, token, ret;
    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(token.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token.type) {
        case "escape": {
          out += renderer.text(token.text);
          break;
        }
        case "html": {
          out += renderer.html(token.text);
          break;
        }
        case "link": {
          out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
          break;
        }
        case "image": {
          out += renderer.image(token.href, token.title, token.text);
          break;
        }
        case "strong": {
          out += renderer.strong(this.parseInline(token.tokens, renderer));
          break;
        }
        case "em": {
          out += renderer.em(this.parseInline(token.tokens, renderer));
          break;
        }
        case "codespan": {
          out += renderer.codespan(token.text);
          break;
        }
        case "br": {
          out += renderer.br();
          break;
        }
        case "del": {
          out += renderer.del(this.parseInline(token.tokens, renderer));
          break;
        }
        case "text": {
          out += renderer.text(token.text);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};

// src/Hooks.ts
var _Hooks = class {
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html) {
    return html;
  }
};
_Hooks.passThroughHooks = /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess"
]);

// src/Instance.ts
var _parseMarkdown, parseMarkdown_fn, _onError, onError_fn;
var Marked = class {
  constructor(...args) {
    __privateAdd(this, _parseMarkdown);
    __privateAdd(this, _onError);
    this.defaults = _getDefaults();
    this.options = this.setOptions;
    this.parse = __privateMethod(this, _parseMarkdown, parseMarkdown_fn).call(this, _Lexer2.lex, _Parser.parse);
    this.parseInline = __privateMethod(this, _parseMarkdown, parseMarkdown_fn).call(this, _Lexer2.lexInline, _Parser.parseInline);
    this.Parser = _Parser;
    this.parser = _Parser.parse;
    this.Renderer = _Renderer;
    this.TextRenderer = _TextRenderer;
    this.Lexer = _Lexer2;
    this.lexer = _Lexer2.lex;
    this.Tokenizer = _Tokenizer;
    this.Slugger = _Slugger;
    this.Hooks = _Hooks;
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          for (const cell of token.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of token.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          values = values.concat(this.walkTokens(token.items, callback));
          break;
        }
        default: {
          if (this.defaults.extensions && this.defaults.extensions.childTokens && this.defaults.extensions.childTokens[token.type]) {
            this.defaults.extensions.childTokens[token.type].forEach((childTokens) => {
              values = values.concat(this.walkTokens(token[childTokens], callback));
            });
          } else if (token.tokens) {
            values = values.concat(this.walkTokens(token.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          const prevRenderer = renderer[prop];
          renderer[prop] = (...args2) => {
            let ret = pack.renderer[prop].apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret;
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          tokenizer[prop] = (...args2) => {
            let ret = pack.tokenizer[prop].apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          const prevHook = hooks[prop];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[prop] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(pack.hooks[prop].call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = pack.hooks[prop].call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[prop] = (...args2) => {
              let ret = pack.hooks[prop].apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(pack.walkTokens.call(this, token));
          if (walkTokens2) {
            values = values.concat(walkTokens2.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
};
_parseMarkdown = new WeakSet();
parseMarkdown_fn = function(lexer2, parser2) {
  return (src, optOrCallback, callback) => {
    if (typeof optOrCallback === "function") {
      callback = optOrCallback;
      optOrCallback = null;
    }
    const origOpt = { ...optOrCallback };
    const opt = { ...this.defaults, ...origOpt };
    const throwError = __privateMethod(this, _onError, onError_fn).call(this, !!opt.silent, !!opt.async, callback);
    if (typeof src === "undefined" || src === null) {
      return throwError(new Error("marked(): input parameter is undefined or null"));
    }
    if (typeof src !== "string") {
      return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
    }
    checkDeprecations(opt, callback);
    if (opt.hooks) {
      opt.hooks.options = opt;
    }
    if (callback) {
      const highlight = opt.highlight;
      let tokens;
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        tokens = lexer2(src, opt);
      } catch (e) {
        return throwError(e);
      }
      const done = (err) => {
        let out;
        if (!err) {
          try {
            if (opt.walkTokens) {
              this.walkTokens(tokens, opt.walkTokens);
            }
            out = parser2(tokens, opt);
            if (opt.hooks) {
              out = opt.hooks.postprocess(out);
            }
          } catch (e) {
            err = e;
          }
        }
        opt.highlight = highlight;
        return err ? throwError(err) : callback(null, out);
      };
      if (!highlight || highlight.length < 3) {
        return done();
      }
      delete opt.highlight;
      if (!tokens.length)
        return done();
      let pending = 0;
      this.walkTokens(tokens, (token) => {
        if (token.type === "code") {
          pending++;
          setTimeout(() => {
            highlight(token.text, token.lang, (err, code) => {
              if (err) {
                return done(err);
              }
              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }
              pending--;
              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });
      if (pending === 0) {
        done();
      }
      return;
    }
    if (opt.async) {
      return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html) => opt.hooks ? opt.hooks.postprocess(html) : html).catch(throwError);
    }
    try {
      if (opt.hooks) {
        src = opt.hooks.preprocess(src);
      }
      const tokens = lexer2(src, opt);
      if (opt.walkTokens) {
        this.walkTokens(tokens, opt.walkTokens);
      }
      let html = parser2(tokens, opt);
      if (opt.hooks) {
        html = opt.hooks.postprocess(html);
      }
      return html;
    } catch (e) {
      return throwError(e);
    }
  };
};
_onError = new WeakSet();
onError_fn = function(silent, async, callback) {
  return (e) => {
    e.message += "\nPlease report this to https://github.com/markedjs/marked.";
    if (silent) {
      const msg = "<p>An error occurred:</p><pre>" + escape$2(e.message + "", true) + "</pre>";
      if (async) {
        return Promise.resolve(msg);
      }
      if (callback) {
        callback(null, msg);
        return;
      }
      return msg;
    }
    if (async) {
      return Promise.reject(e);
    }
    if (callback) {
      callback(e);
      return;
    }
    throw e;
  };
};

// src/marked.ts
var markedInstance = new Marked();
function marked(src, opt, callback) {
  return markedInstance.parse(src, opt, callback);
}
marked.options = marked.setOptions = function(options2) {
  markedInstance.setOptions(options2);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer2;
marked.lexer = _Lexer2.lex;
marked.Tokenizer = _Tokenizer;
marked.Slugger = _Slugger;
marked.Hooks = _Hooks;
marked.parse = marked;
marked.options;
marked.setOptions;
marked.use;
marked.walkTokens;
marked.parseInline;
_Parser.parse;
_Lexer2.lex;

function markedHighlight(options) {
  if (typeof options === 'function') {
    options = {
      highlight: options
    };
  }

  if (!options || typeof options.highlight !== 'function') {
    throw new Error('Must provide highlight function');
  }

  if (typeof options.langPrefix !== 'string') {
    options.langPrefix = 'language-';
  }

  return {
    async: !!options.async,
    walkTokens(token) {
      if (token.type !== 'code') {
        return;
      }

      const lang = getLang(token);

      if (options.async) {
        return Promise.resolve(options.highlight(token.text, lang)).then(updateToken(token));
      }

      const code = options.highlight(token.text, lang);
      updateToken(token)(code);
    },
    renderer: {
      code(code, infoString, escaped) {
        const lang = (infoString || '').match(/\S*/)[0];
        const classAttr = lang
          ? ` class="${options.langPrefix}${escape$1(lang)}"`
          : '';
        code = code.replace(/\n$/, '');
        return `<pre><code${classAttr}>${escaped ? code : escape$1(code, true)}\n</code></pre>`;
      }
    }
  };
}

function getLang(token) {
  return (token.lang || '').match(/\S*/)[0];
}

function updateToken(token) {
  return (code) => {
    if (typeof code === 'string' && code !== token.text) {
      token.escaped = true;
      token.text = code;
    }
  };
}

// copied from marked helpers
const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape$1(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}

var prism$1 = {exports: {}};

(function (module) {
	/* **********************************************
	     Begin prism-core.js
	********************************************** */

	/// <reference lib="WebWorker"/>

	var _self = (typeof window !== 'undefined')
		? window   // if in browser
		: (
			(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
				? self // if in worker
				: {}   // if in node js
		);

	/**
	 * Prism: Lightweight, robust, elegant syntax highlighting
	 *
	 * @license MIT <https://opensource.org/licenses/MIT>
	 * @author Lea Verou <https://lea.verou.me>
	 * @namespace
	 * @public
	 */
	var Prism = (function (_self) {

		// Private helper vars
		var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
		var uniqueId = 0;

		// The grammar object for plaintext
		var plainTextGrammar = {};


		var _ = {
			/**
			 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
			 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
			 * additional languages or plugins yourself.
			 *
			 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
			 *
			 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.manual = true;
			 * // add a new <script> to load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			manual: _self.Prism && _self.Prism.manual,
			/**
			 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
			 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
			 * own worker, you don't want it to do this.
			 *
			 * By setting this value to `true`, Prism will not add its own listeners to the worker.
			 *
			 * You obviously have to change this value before Prism executes. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.disableWorkerMessageHandler = true;
			 * // Load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

			/**
			 * A namespace for utility methods.
			 *
			 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
			 * change or disappear at any time.
			 *
			 * @namespace
			 * @memberof Prism
			 */
			util: {
				encode: function encode(tokens) {
					if (tokens instanceof Token) {
						return new Token(tokens.type, encode(tokens.content), tokens.alias);
					} else if (Array.isArray(tokens)) {
						return tokens.map(encode);
					} else {
						return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
					}
				},

				/**
				 * Returns the name of the type of the given value.
				 *
				 * @param {any} o
				 * @returns {string}
				 * @example
				 * type(null)      === 'Null'
				 * type(undefined) === 'Undefined'
				 * type(123)       === 'Number'
				 * type('foo')     === 'String'
				 * type(true)      === 'Boolean'
				 * type([1, 2])    === 'Array'
				 * type({})        === 'Object'
				 * type(String)    === 'Function'
				 * type(/abc+/)    === 'RegExp'
				 */
				type: function (o) {
					return Object.prototype.toString.call(o).slice(8, -1);
				},

				/**
				 * Returns a unique number for the given object. Later calls will still return the same number.
				 *
				 * @param {Object} obj
				 * @returns {number}
				 */
				objId: function (obj) {
					if (!obj['__id']) {
						Object.defineProperty(obj, '__id', { value: ++uniqueId });
					}
					return obj['__id'];
				},

				/**
				 * Creates a deep clone of the given object.
				 *
				 * The main intended use of this function is to clone language definitions.
				 *
				 * @param {T} o
				 * @param {Record<number, any>} [visited]
				 * @returns {T}
				 * @template T
				 */
				clone: function deepClone(o, visited) {
					visited = visited || {};

					var clone; var id;
					switch (_.util.type(o)) {
						case 'Object':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = /** @type {Record<string, any>} */ ({});
							visited[id] = clone;

							for (var key in o) {
								if (o.hasOwnProperty(key)) {
									clone[key] = deepClone(o[key], visited);
								}
							}

							return /** @type {any} */ (clone);

						case 'Array':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = [];
							visited[id] = clone;

							(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
								clone[i] = deepClone(v, visited);
							});

							return /** @type {any} */ (clone);

						default:
							return o;
					}
				},

				/**
				 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
				 *
				 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
				 *
				 * @param {Element} element
				 * @returns {string}
				 */
				getLanguage: function (element) {
					while (element) {
						var m = lang.exec(element.className);
						if (m) {
							return m[1].toLowerCase();
						}
						element = element.parentElement;
					}
					return 'none';
				},

				/**
				 * Sets the Prism `language-xxxx` class of the given element.
				 *
				 * @param {Element} element
				 * @param {string} language
				 * @returns {void}
				 */
				setLanguage: function (element, language) {
					// remove all `language-xxxx` classes
					// (this might leave behind a leading space)
					element.className = element.className.replace(RegExp(lang, 'gi'), '');

					// add the new `language-xxxx` class
					// (using `classList` will automatically clean up spaces for us)
					element.classList.add('language-' + language);
				},

				/**
				 * Returns the script element that is currently executing.
				 *
				 * This does __not__ work for line script element.
				 *
				 * @returns {HTMLScriptElement | null}
				 */
				currentScript: function () {
					if (typeof document === 'undefined') {
						return null;
					}
					if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
						return /** @type {any} */ (document.currentScript);
					}

					// IE11 workaround
					// we'll get the src of the current script by parsing IE11's error stack trace
					// this will not work for inline scripts

					try {
						throw new Error();
					} catch (err) {
						// Get file src url from stack. Specifically works with the format of stack traces in IE.
						// A stack will look like this:
						//
						// Error
						//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
						//    at Global code (http://localhost/components/prism-core.js:606:1)

						var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
						if (src) {
							var scripts = document.getElementsByTagName('script');
							for (var i in scripts) {
								if (scripts[i].src == src) {
									return scripts[i];
								}
							}
						}
						return null;
					}
				},

				/**
				 * Returns whether a given class is active for `element`.
				 *
				 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
				 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
				 * given class is just the given class with a `no-` prefix.
				 *
				 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
				 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
				 * ancestors have the given class or the negated version of it, then the default activation will be returned.
				 *
				 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
				 * version of it, the class is considered active.
				 *
				 * @param {Element} element
				 * @param {string} className
				 * @param {boolean} [defaultActivation=false]
				 * @returns {boolean}
				 */
				isActive: function (element, className, defaultActivation) {
					var no = 'no-' + className;

					while (element) {
						var classList = element.classList;
						if (classList.contains(className)) {
							return true;
						}
						if (classList.contains(no)) {
							return false;
						}
						element = element.parentElement;
					}
					return !!defaultActivation;
				}
			},

			/**
			 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
			 *
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			languages: {
				/**
				 * The grammar for plain, unformatted text.
				 */
				plain: plainTextGrammar,
				plaintext: plainTextGrammar,
				text: plainTextGrammar,
				txt: plainTextGrammar,

				/**
				 * Creates a deep copy of the language with the given id and appends the given tokens.
				 *
				 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
				 * will be overwritten at its original position.
				 *
				 * ## Best practices
				 *
				 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
				 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
				 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
				 *
				 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
				 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
				 *
				 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
				 * @param {Grammar} redef The new tokens to append.
				 * @returns {Grammar} The new language created.
				 * @public
				 * @example
				 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
				 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
				 *     // at its original position
				 *     'comment': { ... },
				 *     // CSS doesn't have a 'color' token, so this token will be appended
				 *     'color': /\b(?:red|green|blue)\b/
				 * });
				 */
				extend: function (id, redef) {
					var lang = _.util.clone(_.languages[id]);

					for (var key in redef) {
						lang[key] = redef[key];
					}

					return lang;
				},

				/**
				 * Inserts tokens _before_ another token in a language definition or any other grammar.
				 *
				 * ## Usage
				 *
				 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
				 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
				 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
				 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
				 * this:
				 *
				 * ```js
				 * Prism.languages.markup.style = {
				 *     // token
				 * };
				 * ```
				 *
				 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
				 * before existing tokens. For the CSS example above, you would use it like this:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'cdata', {
				 *     'style': {
				 *         // token
				 *     }
				 * });
				 * ```
				 *
				 * ## Special cases
				 *
				 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
				 * will be ignored.
				 *
				 * This behavior can be used to insert tokens after `before`:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'comment', {
				 *     'comment': Prism.languages.markup.comment,
				 *     // tokens after 'comment'
				 * });
				 * ```
				 *
				 * ## Limitations
				 *
				 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
				 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
				 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
				 * deleting properties which is necessary to insert at arbitrary positions.
				 *
				 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
				 * Instead, it will create a new object and replace all references to the target object with the new one. This
				 * can be done without temporarily deleting properties, so the iteration order is well-defined.
				 *
				 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
				 * you hold the target object in a variable, then the value of the variable will not change.
				 *
				 * ```js
				 * var oldMarkup = Prism.languages.markup;
				 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
				 *
				 * assert(oldMarkup !== Prism.languages.markup);
				 * assert(newMarkup === Prism.languages.markup);
				 * ```
				 *
				 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
				 * object to be modified.
				 * @param {string} before The key to insert before.
				 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
				 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
				 * object to be modified.
				 *
				 * Defaults to `Prism.languages`.
				 * @returns {Grammar} The new grammar object.
				 * @public
				 */
				insertBefore: function (inside, before, insert, root) {
					root = root || /** @type {any} */ (_.languages);
					var grammar = root[inside];
					/** @type {Grammar} */
					var ret = {};

					for (var token in grammar) {
						if (grammar.hasOwnProperty(token)) {

							if (token == before) {
								for (var newToken in insert) {
									if (insert.hasOwnProperty(newToken)) {
										ret[newToken] = insert[newToken];
									}
								}
							}

							// Do not insert token which also occur in insert. See #1525
							if (!insert.hasOwnProperty(token)) {
								ret[token] = grammar[token];
							}
						}
					}

					var old = root[inside];
					root[inside] = ret;

					// Update references in other language definitions
					_.languages.DFS(_.languages, function (key, value) {
						if (value === old && key != inside) {
							this[key] = ret;
						}
					});

					return ret;
				},

				// Traverse a language definition with Depth First Search
				DFS: function DFS(o, callback, type, visited) {
					visited = visited || {};

					var objId = _.util.objId;

					for (var i in o) {
						if (o.hasOwnProperty(i)) {
							callback.call(o, i, o[i], type || i);

							var property = o[i];
							var propertyType = _.util.type(property);

							if (propertyType === 'Object' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, null, visited);
							} else if (propertyType === 'Array' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, i, visited);
							}
						}
					}
				}
			},

			plugins: {},

			/**
			 * This is the most high-level function in Prism’s API.
			 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
			 * each one of them.
			 *
			 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
			 *
			 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
			 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
			 * @memberof Prism
			 * @public
			 */
			highlightAll: function (async, callback) {
				_.highlightAllUnder(document, async, callback);
			},

			/**
			 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
			 * {@link Prism.highlightElement} on each one of them.
			 *
			 * The following hooks will be run:
			 * 1. `before-highlightall`
			 * 2. `before-all-elements-highlight`
			 * 3. All hooks of {@link Prism.highlightElement} for each element.
			 *
			 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
			 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
			 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
			 * @memberof Prism
			 * @public
			 */
			highlightAllUnder: function (container, async, callback) {
				var env = {
					callback: callback,
					container: container,
					selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
				};

				_.hooks.run('before-highlightall', env);

				env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

				_.hooks.run('before-all-elements-highlight', env);

				for (var i = 0, element; (element = env.elements[i++]);) {
					_.highlightElement(element, async === true, env.callback);
				}
			},

			/**
			 * Highlights the code inside a single element.
			 *
			 * The following hooks will be run:
			 * 1. `before-sanity-check`
			 * 2. `before-highlight`
			 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
			 * 4. `before-insert`
			 * 5. `after-highlight`
			 * 6. `complete`
			 *
			 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
			 * the element's language.
			 *
			 * @param {Element} element The element containing the code.
			 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
			 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
			 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
			 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
			 *
			 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
			 * asynchronous highlighting to work. You can build your own bundle on the
			 * [Download page](https://prismjs.com/download.html).
			 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
			 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
			 * @memberof Prism
			 * @public
			 */
			highlightElement: function (element, async, callback) {
				// Find language
				var language = _.util.getLanguage(element);
				var grammar = _.languages[language];

				// Set language on the element, if not present
				_.util.setLanguage(element, language);

				// Set language on the parent, for styling
				var parent = element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre') {
					_.util.setLanguage(parent, language);
				}

				var code = element.textContent;

				var env = {
					element: element,
					language: language,
					grammar: grammar,
					code: code
				};

				function insertHighlightedCode(highlightedCode) {
					env.highlightedCode = highlightedCode;

					_.hooks.run('before-insert', env);

					env.element.innerHTML = env.highlightedCode;

					_.hooks.run('after-highlight', env);
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
				}

				_.hooks.run('before-sanity-check', env);

				// plugins may change/add the parent/element
				parent = env.element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
					parent.setAttribute('tabindex', '0');
				}

				if (!env.code) {
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
					return;
				}

				_.hooks.run('before-highlight', env);

				if (!env.grammar) {
					insertHighlightedCode(_.util.encode(env.code));
					return;
				}

				if (async && _self.Worker) {
					var worker = new Worker(_.filename);

					worker.onmessage = function (evt) {
						insertHighlightedCode(evt.data);
					};

					worker.postMessage(JSON.stringify({
						language: env.language,
						code: env.code,
						immediateClose: true
					}));
				} else {
					insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
				}
			},

			/**
			 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
			 * and the language definitions to use, and returns a string with the HTML produced.
			 *
			 * The following hooks will be run:
			 * 1. `before-tokenize`
			 * 2. `after-tokenize`
			 * 3. `wrap`: On each {@link Token}.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @param {string} language The name of the language definition passed to `grammar`.
			 * @returns {string} The highlighted HTML.
			 * @memberof Prism
			 * @public
			 * @example
			 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
			 */
			highlight: function (text, grammar, language) {
				var env = {
					code: text,
					grammar: grammar,
					language: language
				};
				_.hooks.run('before-tokenize', env);
				if (!env.grammar) {
					throw new Error('The language "' + env.language + '" has no grammar.');
				}
				env.tokens = _.tokenize(env.code, env.grammar);
				_.hooks.run('after-tokenize', env);
				return Token.stringify(_.util.encode(env.tokens), env.language);
			},

			/**
			 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
			 * and the language definitions to use, and returns an array with the tokenized code.
			 *
			 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
			 *
			 * This method could be useful in other contexts as well, as a very crude parser.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @returns {TokenStream} An array of strings and tokens, a token stream.
			 * @memberof Prism
			 * @public
			 * @example
			 * let code = `var foo = 0;`;
			 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
			 * tokens.forEach(token => {
			 *     if (token instanceof Prism.Token && token.type === 'number') {
			 *         console.log(`Found numeric literal: ${token.content}`);
			 *     }
			 * });
			 */
			tokenize: function (text, grammar) {
				var rest = grammar.rest;
				if (rest) {
					for (var token in rest) {
						grammar[token] = rest[token];
					}

					delete grammar.rest;
				}

				var tokenList = new LinkedList();
				addAfter(tokenList, tokenList.head, text);

				matchGrammar(text, tokenList, grammar, tokenList.head, 0);

				return toArray(tokenList);
			},

			/**
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			hooks: {
				all: {},

				/**
				 * Adds the given callback to the list of callbacks for the given hook.
				 *
				 * The callback will be invoked when the hook it is registered for is run.
				 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
				 *
				 * One callback function can be registered to multiple hooks and the same hook multiple times.
				 *
				 * @param {string} name The name of the hook.
				 * @param {HookCallback} callback The callback function which is given environment variables.
				 * @public
				 */
				add: function (name, callback) {
					var hooks = _.hooks.all;

					hooks[name] = hooks[name] || [];

					hooks[name].push(callback);
				},

				/**
				 * Runs a hook invoking all registered callbacks with the given environment variables.
				 *
				 * Callbacks will be invoked synchronously and in the order in which they were registered.
				 *
				 * @param {string} name The name of the hook.
				 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
				 * @public
				 */
				run: function (name, env) {
					var callbacks = _.hooks.all[name];

					if (!callbacks || !callbacks.length) {
						return;
					}

					for (var i = 0, callback; (callback = callbacks[i++]);) {
						callback(env);
					}
				}
			},

			Token: Token
		};
		_self.Prism = _;


		// Typescript note:
		// The following can be used to import the Token type in JSDoc:
		//
		//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

		/**
		 * Creates a new token.
		 *
		 * @param {string} type See {@link Token#type type}
		 * @param {string | TokenStream} content See {@link Token#content content}
		 * @param {string|string[]} [alias] The alias(es) of the token.
		 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
		 * @class
		 * @global
		 * @public
		 */
		function Token(type, content, alias, matchedStr) {
			/**
			 * The type of the token.
			 *
			 * This is usually the key of a pattern in a {@link Grammar}.
			 *
			 * @type {string}
			 * @see GrammarToken
			 * @public
			 */
			this.type = type;
			/**
			 * The strings or tokens contained by this token.
			 *
			 * This will be a token stream if the pattern matched also defined an `inside` grammar.
			 *
			 * @type {string | TokenStream}
			 * @public
			 */
			this.content = content;
			/**
			 * The alias(es) of the token.
			 *
			 * @type {string|string[]}
			 * @see GrammarToken
			 * @public
			 */
			this.alias = alias;
			// Copy of the full string this token was created from
			this.length = (matchedStr || '').length | 0;
		}

		/**
		 * A token stream is an array of strings and {@link Token Token} objects.
		 *
		 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
		 * them.
		 *
		 * 1. No adjacent strings.
		 * 2. No empty strings.
		 *
		 *    The only exception here is the token stream that only contains the empty string and nothing else.
		 *
		 * @typedef {Array<string | Token>} TokenStream
		 * @global
		 * @public
		 */

		/**
		 * Converts the given token or token stream to an HTML representation.
		 *
		 * The following hooks will be run:
		 * 1. `wrap`: On each {@link Token}.
		 *
		 * @param {string | Token | TokenStream} o The token or token stream to be converted.
		 * @param {string} language The name of current language.
		 * @returns {string} The HTML representation of the token or token stream.
		 * @memberof Token
		 * @static
		 */
		Token.stringify = function stringify(o, language) {
			if (typeof o == 'string') {
				return o;
			}
			if (Array.isArray(o)) {
				var s = '';
				o.forEach(function (e) {
					s += stringify(e, language);
				});
				return s;
			}

			var env = {
				type: o.type,
				content: stringify(o.content, language),
				tag: 'span',
				classes: ['token', o.type],
				attributes: {},
				language: language
			};

			var aliases = o.alias;
			if (aliases) {
				if (Array.isArray(aliases)) {
					Array.prototype.push.apply(env.classes, aliases);
				} else {
					env.classes.push(aliases);
				}
			}

			_.hooks.run('wrap', env);

			var attributes = '';
			for (var name in env.attributes) {
				attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
			}

			return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
		};

		/**
		 * @param {RegExp} pattern
		 * @param {number} pos
		 * @param {string} text
		 * @param {boolean} lookbehind
		 * @returns {RegExpExecArray | null}
		 */
		function matchPattern(pattern, pos, text, lookbehind) {
			pattern.lastIndex = pos;
			var match = pattern.exec(text);
			if (match && lookbehind && match[1]) {
				// change the match to remove the text matched by the Prism lookbehind group
				var lookbehindLength = match[1].length;
				match.index += lookbehindLength;
				match[0] = match[0].slice(lookbehindLength);
			}
			return match;
		}

		/**
		 * @param {string} text
		 * @param {LinkedList<string | Token>} tokenList
		 * @param {any} grammar
		 * @param {LinkedListNode<string | Token>} startNode
		 * @param {number} startPos
		 * @param {RematchOptions} [rematch]
		 * @returns {void}
		 * @private
		 *
		 * @typedef RematchOptions
		 * @property {string} cause
		 * @property {number} reach
		 */
		function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
			for (var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}

				var patterns = grammar[token];
				patterns = Array.isArray(patterns) ? patterns : [patterns];

				for (var j = 0; j < patterns.length; ++j) {
					if (rematch && rematch.cause == token + ',' + j) {
						return;
					}

					var patternObj = patterns[j];
					var inside = patternObj.inside;
					var lookbehind = !!patternObj.lookbehind;
					var greedy = !!patternObj.greedy;
					var alias = patternObj.alias;

					if (greedy && !patternObj.pattern.global) {
						// Without the global flag, lastIndex won't work
						var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
						patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
					}

					/** @type {RegExp} */
					var pattern = patternObj.pattern || patternObj;

					for ( // iterate the token list and keep track of the current token/string position
						var currentNode = startNode.next, pos = startPos;
						currentNode !== tokenList.tail;
						pos += currentNode.value.length, currentNode = currentNode.next
					) {

						if (rematch && pos >= rematch.reach) {
							break;
						}

						var str = currentNode.value;

						if (tokenList.length > text.length) {
							// Something went terribly wrong, ABORT, ABORT!
							return;
						}

						if (str instanceof Token) {
							continue;
						}

						var removeCount = 1; // this is the to parameter of removeBetween
						var match;

						if (greedy) {
							match = matchPattern(pattern, pos, text, lookbehind);
							if (!match || match.index >= text.length) {
								break;
							}

							var from = match.index;
							var to = match.index + match[0].length;
							var p = pos;

							// find the node that contains the match
							p += currentNode.value.length;
							while (from >= p) {
								currentNode = currentNode.next;
								p += currentNode.value.length;
							}
							// adjust pos (and p)
							p -= currentNode.value.length;
							pos = p;

							// the current node is a Token, then the match starts inside another Token, which is invalid
							if (currentNode.value instanceof Token) {
								continue;
							}

							// find the last node which is affected by this match
							for (
								var k = currentNode;
								k !== tokenList.tail && (p < to || typeof k.value === 'string');
								k = k.next
							) {
								removeCount++;
								p += k.value.length;
							}
							removeCount--;

							// replace with the new match
							str = text.slice(pos, p);
							match.index -= pos;
						} else {
							match = matchPattern(pattern, 0, str, lookbehind);
							if (!match) {
								continue;
							}
						}

						// eslint-disable-next-line no-redeclare
						var from = match.index;
						var matchStr = match[0];
						var before = str.slice(0, from);
						var after = str.slice(from + matchStr.length);

						var reach = pos + str.length;
						if (rematch && reach > rematch.reach) {
							rematch.reach = reach;
						}

						var removeFrom = currentNode.prev;

						if (before) {
							removeFrom = addAfter(tokenList, removeFrom, before);
							pos += before.length;
						}

						removeRange(tokenList, removeFrom, removeCount);

						var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
						currentNode = addAfter(tokenList, removeFrom, wrapped);

						if (after) {
							addAfter(tokenList, currentNode, after);
						}

						if (removeCount > 1) {
							// at least one Token object was removed, so we have to do some rematching
							// this can only happen if the current pattern is greedy

							/** @type {RematchOptions} */
							var nestedRematch = {
								cause: token + ',' + j,
								reach: reach
							};
							matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

							// the reach might have been extended because of the rematching
							if (rematch && nestedRematch.reach > rematch.reach) {
								rematch.reach = nestedRematch.reach;
							}
						}
					}
				}
			}
		}

		/**
		 * @typedef LinkedListNode
		 * @property {T} value
		 * @property {LinkedListNode<T> | null} prev The previous node.
		 * @property {LinkedListNode<T> | null} next The next node.
		 * @template T
		 * @private
		 */

		/**
		 * @template T
		 * @private
		 */
		function LinkedList() {
			/** @type {LinkedListNode<T>} */
			var head = { value: null, prev: null, next: null };
			/** @type {LinkedListNode<T>} */
			var tail = { value: null, prev: head, next: null };
			head.next = tail;

			/** @type {LinkedListNode<T>} */
			this.head = head;
			/** @type {LinkedListNode<T>} */
			this.tail = tail;
			this.length = 0;
		}

		/**
		 * Adds a new node with the given value to the list.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {T} value
		 * @returns {LinkedListNode<T>} The added node.
		 * @template T
		 */
		function addAfter(list, node, value) {
			// assumes that node != list.tail && values.length >= 0
			var next = node.next;

			var newNode = { value: value, prev: node, next: next };
			node.next = newNode;
			next.prev = newNode;
			list.length++;

			return newNode;
		}
		/**
		 * Removes `count` nodes after the given node. The given node will not be removed.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {number} count
		 * @template T
		 */
		function removeRange(list, node, count) {
			var next = node.next;
			for (var i = 0; i < count && next !== list.tail; i++) {
				next = next.next;
			}
			node.next = next;
			next.prev = node;
			list.length -= i;
		}
		/**
		 * @param {LinkedList<T>} list
		 * @returns {T[]}
		 * @template T
		 */
		function toArray(list) {
			var array = [];
			var node = list.head.next;
			while (node !== list.tail) {
				array.push(node.value);
				node = node.next;
			}
			return array;
		}


		if (!_self.document) {
			if (!_self.addEventListener) {
				// in Node.js
				return _;
			}

			if (!_.disableWorkerMessageHandler) {
				// In worker
				_self.addEventListener('message', function (evt) {
					var message = JSON.parse(evt.data);
					var lang = message.language;
					var code = message.code;
					var immediateClose = message.immediateClose;

					_self.postMessage(_.highlight(code, _.languages[lang], lang));
					if (immediateClose) {
						_self.close();
					}
				}, false);
			}

			return _;
		}

		// Get current script and highlight
		var script = _.util.currentScript();

		if (script) {
			_.filename = script.src;

			if (script.hasAttribute('data-manual')) {
				_.manual = true;
			}
		}

		function highlightAutomaticallyCallback() {
			if (!_.manual) {
				_.highlightAll();
			}
		}

		if (!_.manual) {
			// If the document state is "loading", then we'll use DOMContentLoaded.
			// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
			// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
			// might take longer one animation frame to execute which can create a race condition where only some plugins have
			// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
			// See https://github.com/PrismJS/prism/issues/2102
			var readyState = document.readyState;
			if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
				document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
			} else {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(highlightAutomaticallyCallback);
				} else {
					window.setTimeout(highlightAutomaticallyCallback, 16);
				}
			}
		}

		return _;

	}(_self));

	if (module.exports) {
		module.exports = Prism;
	}

	// hack for components to work correctly in node.js
	if (typeof commonjsGlobal !== 'undefined') {
		commonjsGlobal.Prism = Prism;
	}

	// some additional documentation/types

	/**
	 * The expansion of a simple `RegExp` literal to support additional properties.
	 *
	 * @typedef GrammarToken
	 * @property {RegExp} pattern The regular expression of the token.
	 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
	 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
	 * @property {boolean} [greedy=false] Whether the token is greedy.
	 * @property {string|string[]} [alias] An optional alias or list of aliases.
	 * @property {Grammar} [inside] The nested grammar of this token.
	 *
	 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
	 *
	 * This can be used to make nested and even recursive language definitions.
	 *
	 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
	 * each another.
	 * @global
	 * @public
	 */

	/**
	 * @typedef Grammar
	 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
	 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
	 * @global
	 * @public
	 */

	/**
	 * A function which will invoked after an element was successfully highlighted.
	 *
	 * @callback HighlightCallback
	 * @param {Element} element The element successfully highlighted.
	 * @returns {void}
	 * @global
	 * @public
	 */

	/**
	 * @callback HookCallback
	 * @param {Object<string, any>} env The environment variables of the hook.
	 * @returns {void}
	 * @global
	 * @public
	 */


	/* **********************************************
	     Begin prism-markup.js
	********************************************** */

	Prism.languages.markup = {
		'comment': {
			pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
			greedy: true
		},
		'prolog': {
			pattern: /<\?[\s\S]+?\?>/,
			greedy: true
		},
		'doctype': {
			// https://www.w3.org/TR/xml/#NT-doctypedecl
			pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
			greedy: true,
			inside: {
				'internal-subset': {
					pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
					lookbehind: true,
					greedy: true,
					inside: null // see below
				},
				'string': {
					pattern: /"[^"]*"|'[^']*'/,
					greedy: true
				},
				'punctuation': /^<!|>$|[[\]]/,
				'doctype-tag': /^DOCTYPE/i,
				'name': /[^\s<>'"]+/
			}
		},
		'cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			greedy: true
		},
		'tag': {
			pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
			greedy: true,
			inside: {
				'tag': {
					pattern: /^<\/?[^\s>\/]+/,
					inside: {
						'punctuation': /^<\/?/,
						'namespace': /^[^\s>\/:]+:/
					}
				},
				'special-attr': [],
				'attr-value': {
					pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
					inside: {
						'punctuation': [
							{
								pattern: /^=/,
								alias: 'attr-equals'
							},
							{
								pattern: /^(\s*)["']|["']$/,
								lookbehind: true
							}
						]
					}
				},
				'punctuation': /\/?>/,
				'attr-name': {
					pattern: /[^\s>\/]+/,
					inside: {
						'namespace': /^[^\s>\/:]+:/
					}
				}

			}
		},
		'entity': [
			{
				pattern: /&[\da-z]{1,8};/i,
				alias: 'named-entity'
			},
			/&#x?[\da-f]{1,8};/i
		]
	};

	Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
		Prism.languages.markup['entity'];
	Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

	// Plugin to make entity title show the real entity, idea by Roman Komarov
	Prism.hooks.add('wrap', function (env) {

		if (env.type === 'entity') {
			env.attributes['title'] = env.content.replace(/&amp;/, '&');
		}
	});

	Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
		/**
		 * Adds an inlined language to markup.
		 *
		 * An example of an inlined language is CSS with `<style>` tags.
		 *
		 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addInlined('style', 'css');
		 */
		value: function addInlined(tagName, lang) {
			var includedCdataInside = {};
			includedCdataInside['language-' + lang] = {
				pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
				lookbehind: true,
				inside: Prism.languages[lang]
			};
			includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

			var inside = {
				'included-cdata': {
					pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
					inside: includedCdataInside
				}
			};
			inside['language-' + lang] = {
				pattern: /[\s\S]+/,
				inside: Prism.languages[lang]
			};

			var def = {};
			def[tagName] = {
				pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
				lookbehind: true,
				greedy: true,
				inside: inside
			};

			Prism.languages.insertBefore('markup', 'cdata', def);
		}
	});
	Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
		/**
		 * Adds an pattern to highlight languages embedded in HTML attributes.
		 *
		 * An example of an inlined language is CSS with `style` attributes.
		 *
		 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addAttribute('style', 'css');
		 */
		value: function (attrName, lang) {
			Prism.languages.markup.tag.inside['special-attr'].push({
				pattern: RegExp(
					/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
					'i'
				),
				lookbehind: true,
				inside: {
					'attr-name': /^[^\s=]+/,
					'attr-value': {
						pattern: /=[\s\S]+/,
						inside: {
							'value': {
								pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
								lookbehind: true,
								alias: [lang, 'language-' + lang],
								inside: Prism.languages[lang]
							},
							'punctuation': [
								{
									pattern: /^=/,
									alias: 'attr-equals'
								},
								/"|'/
							]
						}
					}
				}
			});
		}
	});

	Prism.languages.html = Prism.languages.markup;
	Prism.languages.mathml = Prism.languages.markup;
	Prism.languages.svg = Prism.languages.markup;

	Prism.languages.xml = Prism.languages.extend('markup', {});
	Prism.languages.ssml = Prism.languages.xml;
	Prism.languages.atom = Prism.languages.xml;
	Prism.languages.rss = Prism.languages.xml;


	/* **********************************************
	     Begin prism-css.js
	********************************************** */

	(function (Prism) {

		var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

		Prism.languages.css = {
			'comment': /\/\*[\s\S]*?\*\//,
			'atrule': {
				pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
				inside: {
					'rule': /^@[\w-]+/,
					'selector-function-argument': {
						pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
						lookbehind: true,
						alias: 'selector'
					},
					'keyword': {
						pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
						lookbehind: true
					}
					// See rest below
				}
			},
			'url': {
				// https://drafts.csswg.org/css-values-3/#urls
				pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
				greedy: true,
				inside: {
					'function': /^url/i,
					'punctuation': /^\(|\)$/,
					'string': {
						pattern: RegExp('^' + string.source + '$'),
						alias: 'url'
					}
				}
			},
			'selector': {
				pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
				lookbehind: true
			},
			'string': {
				pattern: string,
				greedy: true
			},
			'property': {
				pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
				lookbehind: true
			},
			'important': /!important\b/i,
			'function': {
				pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
				lookbehind: true
			},
			'punctuation': /[(){};:,]/
		};

		Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

		var markup = Prism.languages.markup;
		if (markup) {
			markup.tag.addInlined('style', 'css');
			markup.tag.addAttribute('style', 'css');
		}

	}(Prism));


	/* **********************************************
	     Begin prism-clike.js
	********************************************** */

	Prism.languages.clike = {
		'comment': [
			{
				pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
				lookbehind: true,
				greedy: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true,
				greedy: true
			}
		],
		'string': {
			pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
			greedy: true
		},
		'class-name': {
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
			lookbehind: true,
			inside: {
				'punctuation': /[.\\]/
			}
		},
		'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
		'boolean': /\b(?:false|true)\b/,
		'function': /\b\w+(?=\()/,
		'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
		'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
		'punctuation': /[{}[\];(),.:]/
	};


	/* **********************************************
	     Begin prism-javascript.js
	********************************************** */

	Prism.languages.javascript = Prism.languages.extend('clike', {
		'class-name': [
			Prism.languages.clike['class-name'],
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
				lookbehind: true
			}
		],
		'keyword': [
			{
				pattern: /((?:^|\})\s*)catch\b/,
				lookbehind: true
			},
			{
				pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
				lookbehind: true
			},
		],
		// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
		'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
		'number': {
			pattern: RegExp(
				/(^|[^\w$])/.source +
				'(?:' +
				(
					// constant
					/NaN|Infinity/.source +
					'|' +
					// binary integer
					/0[bB][01]+(?:_[01]+)*n?/.source +
					'|' +
					// octal integer
					/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
					'|' +
					// hexadecimal integer
					/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
					'|' +
					// decimal bigint
					/\d+(?:_\d+)*n/.source +
					'|' +
					// decimal number (integer or float) but no bigint
					/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
				) +
				')' +
				/(?![\w$])/.source
			),
			lookbehind: true
		},
		'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
	});

	Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

	Prism.languages.insertBefore('javascript', 'keyword', {
		'regex': {
			pattern: RegExp(
				// lookbehind
				// eslint-disable-next-line regexp/no-dupe-characters-character-class
				/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
				// Regex pattern:
				// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
				// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
				// with the only syntax, so we have to define 2 different regex patterns.
				/\//.source +
				'(?:' +
				/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
				'|' +
				// `v` flag syntax. This supports 3 levels of nested character classes.
				/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
				')' +
				// lookahead
				/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'regex-source': {
					pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
					lookbehind: true,
					alias: 'language-regex',
					inside: Prism.languages.regex
				},
				'regex-delimiter': /^\/|\/$/,
				'regex-flags': /^[a-z]+$/,
			}
		},
		// This must be declared before keyword because we use "function" inside the look-forward
		'function-variable': {
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
			alias: 'function'
		},
		'parameter': [
			{
				pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			}
		],
		'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
	});

	Prism.languages.insertBefore('javascript', 'string', {
		'hashbang': {
			pattern: /^#!.*/,
			greedy: true,
			alias: 'comment'
		},
		'template-string': {
			pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
			greedy: true,
			inside: {
				'template-punctuation': {
					pattern: /^`|`$/,
					alias: 'string'
				},
				'interpolation': {
					pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
					lookbehind: true,
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						rest: Prism.languages.javascript
					}
				},
				'string': /[\s\S]+/
			}
		},
		'string-property': {
			pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
			lookbehind: true,
			greedy: true,
			alias: 'property'
		}
	});

	Prism.languages.insertBefore('javascript', 'operator', {
		'literal-property': {
			pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
			lookbehind: true,
			alias: 'property'
		},
	});

	if (Prism.languages.markup) {
		Prism.languages.markup.tag.addInlined('script', 'javascript');

		// add attribute support for all DOM events.
		// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
		Prism.languages.markup.tag.addAttribute(
			/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
			'javascript'
		);
	}

	Prism.languages.js = Prism.languages.javascript;


	/* **********************************************
	     Begin prism-file-highlight.js
	********************************************** */

	(function () {

		if (typeof Prism === 'undefined' || typeof document === 'undefined') {
			return;
		}

		// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
		}

		var LOADING_MESSAGE = 'Loading…';
		var FAILURE_MESSAGE = function (status, message) {
			return '✖ Error ' + status + ' while fetching file: ' + message;
		};
		var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

		var EXTENSIONS = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		var STATUS_ATTR = 'data-src-status';
		var STATUS_LOADING = 'loading';
		var STATUS_LOADED = 'loaded';
		var STATUS_FAILED = 'failed';

		var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
			+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

		/**
		 * Loads the given file.
		 *
		 * @param {string} src The URL or path of the source file to load.
		 * @param {(result: string) => void} success
		 * @param {(reason: string) => void} error
		 */
		function loadFile(src, success, error) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status < 400 && xhr.responseText) {
						success(xhr.responseText);
					} else {
						if (xhr.status >= 400) {
							error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
						} else {
							error(FAILURE_EMPTY_MESSAGE);
						}
					}
				}
			};
			xhr.send(null);
		}

		/**
		 * Parses the given range.
		 *
		 * This returns a range with inclusive ends.
		 *
		 * @param {string | null | undefined} range
		 * @returns {[number, number | undefined] | undefined}
		 */
		function parseRange(range) {
			var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
			if (m) {
				var start = Number(m[1]);
				var comma = m[2];
				var end = m[3];

				if (!comma) {
					return [start, start];
				}
				if (!end) {
					return [start, undefined];
				}
				return [start, Number(end)];
			}
			return undefined;
		}

		Prism.hooks.add('before-highlightall', function (env) {
			env.selector += ', ' + SELECTOR;
		});

		Prism.hooks.add('before-sanity-check', function (env) {
			var pre = /** @type {HTMLPreElement} */ (env.element);
			if (pre.matches(SELECTOR)) {
				env.code = ''; // fast-path the whole thing and go to complete

				pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

				// add code element with loading message
				var code = pre.appendChild(document.createElement('CODE'));
				code.textContent = LOADING_MESSAGE;

				var src = pre.getAttribute('data-src');

				var language = env.language;
				if (language === 'none') {
					// the language might be 'none' because there is no language set;
					// in this case, we want to use the extension as the language
					var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
					language = EXTENSIONS[extension] || extension;
				}

				// set language classes
				Prism.util.setLanguage(code, language);
				Prism.util.setLanguage(pre, language);

				// preload the language
				var autoloader = Prism.plugins.autoloader;
				if (autoloader) {
					autoloader.loadLanguages(language);
				}

				// load file
				loadFile(
					src,
					function (text) {
						// mark as loaded
						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

						// handle data-range
						var range = parseRange(pre.getAttribute('data-range'));
						if (range) {
							var lines = text.split(/\r\n?|\n/g);

							// the range is one-based and inclusive on both ends
							var start = range[0];
							var end = range[1] == null ? lines.length : range[1];

							if (start < 0) { start += lines.length; }
							start = Math.max(0, Math.min(start - 1, lines.length));
							if (end < 0) { end += lines.length; }
							end = Math.max(0, Math.min(end, lines.length));

							text = lines.slice(start, end).join('\n');

							// add data-start for line numbers
							if (!pre.hasAttribute('data-start')) {
								pre.setAttribute('data-start', String(start + 1));
							}
						}

						// highlight code
						code.textContent = text;
						Prism.highlightElement(code);
					},
					function (error) {
						// mark as failed
						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

						code.textContent = error;
					}
				);
			}
		});

		Prism.plugins.fileHighlight = {
			/**
			 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
			 *
			 * Note: Elements which are already loaded or currently loading will not be touched by this method.
			 *
			 * @param {ParentNode} [container=document]
			 */
			highlight: function highlight(container) {
				var elements = (container || document).querySelectorAll(SELECTOR);

				for (var i = 0, element; (element = elements[i++]);) {
					Prism.highlightElement(element);
				}
			}
		};

		var logged = false;
		/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
		Prism.fileHighlight = function () {
			if (!logged) {
				console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
				logged = true;
			}
			Prism.plugins.fileHighlight.highlight.apply(this, arguments);
		};

	}()); 
} (prism$1));

var prismExports = prism$1.exports;
const Prism$1 = /*@__PURE__*/getDefaultExportFromCjs(prismExports);

Prism.languages.python = {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		greedy: true
	},
	'string-interpolation': {
		pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
		greedy: true,
		inside: {
			'interpolation': {
				// "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
				pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
				lookbehind: true,
				inside: {
					'format-spec': {
						pattern: /(:)[^:(){}]+(?=\}$)/,
						lookbehind: true
					},
					'conversion-option': {
						pattern: /![sra](?=[:}]$)/,
						alias: 'punctuation'
					},
					rest: null
				}
			},
			'string': /[\s\S]+/
		}
	},
	'triple-quoted-string': {
		pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
		greedy: true,
		alias: 'string'
	},
	'string': {
		pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
		greedy: true
	},
	'function': {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: true
	},
	'decorator': {
		pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
		lookbehind: true,
		alias: ['annotation', 'punctuation'],
		inside: {
			'punctuation': /\./
		}
	},
	'keyword': /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
	'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
	'boolean': /\b(?:False|None|True)\b/,
	'number': /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
	'operator': /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
	'punctuation': /[{}[\];(),.:]/
};

Prism.languages.python['string-interpolation'].inside['interpolation'].inside.rest = Prism.languages.python;

Prism.languages.py = Prism.languages.python;

(function (Prism) {
	var funcPattern = /\\(?:[^a-z()[\]]|[a-z*]+)/i;
	var insideEqu = {
		'equation-command': {
			pattern: funcPattern,
			alias: 'regex'
		}
	};

	Prism.languages.latex = {
		'comment': /%.*/,
		// the verbatim environment prints whitespace to the document
		'cdata': {
			pattern: /(\\begin\{((?:lstlisting|verbatim)\*?)\})[\s\S]*?(?=\\end\{\2\})/,
			lookbehind: true
		},
		/*
		 * equations can be between $$ $$ or $ $ or \( \) or \[ \]
		 * (all are multiline)
		 */
		'equation': [
			{
				pattern: /\$\$(?:\\[\s\S]|[^\\$])+\$\$|\$(?:\\[\s\S]|[^\\$])+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/,
				inside: insideEqu,
				alias: 'string'
			},
			{
				pattern: /(\\begin\{((?:align|eqnarray|equation|gather|math|multline)\*?)\})[\s\S]*?(?=\\end\{\2\})/,
				lookbehind: true,
				inside: insideEqu,
				alias: 'string'
			}
		],
		/*
		 * arguments which are keywords or references are highlighted
		 * as keywords
		 */
		'keyword': {
			pattern: /(\\(?:begin|cite|documentclass|end|label|ref|usepackage)(?:\[[^\]]+\])?\{)[^}]+(?=\})/,
			lookbehind: true
		},
		'url': {
			pattern: /(\\url\{)[^}]+(?=\})/,
			lookbehind: true
		},
		/*
		 * section or chapter headlines are highlighted as bold so that
		 * they stand out more
		 */
		'headline': {
			pattern: /(\\(?:chapter|frametitle|paragraph|part|section|subparagraph|subsection|subsubparagraph|subsubsection|subsubsubparagraph)\*?(?:\[[^\]]+\])?\{)[^}]+(?=\})/,
			lookbehind: true,
			alias: 'class-name'
		},
		'function': {
			pattern: funcPattern,
			alias: 'selector'
		},
		'punctuation': /[[\]{}&]/
	};

	Prism.languages.tex = Prism.languages.latex;
	Prism.languages.context = Prism.languages.latex;
}(Prism));

const COPY_ICON_CODE = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 32 32"
><path
  fill="currentColor"
  d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"
/><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>`;
const CHECK_ICON_CODE = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="3"
stroke-linecap="round"
stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`;
const COPY_BUTTON_CODE = `<button title="copy" class="copy_code_button">
<span class="copy-text">${COPY_ICON_CODE}</span>
<span class="check">${CHECK_ICON_CODE}</span>
</button>`;
const escape_test = /[&<>"']/;
const escape_replace = new RegExp(escape_test.source, "g");
const escape_test_no_encode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escape_replace_no_encode = new RegExp(escape_test_no_encode.source, "g");
const escape_replacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
const get_escape_replacement = (ch) => escape_replacements[ch] || "";
function escape(html, encode) {
  if (encode) {
    if (escape_test.test(html)) {
      return html.replace(escape_replace, get_escape_replacement);
    }
  } else {
    if (escape_test_no_encode.test(html)) {
      return html.replace(escape_replace_no_encode, get_escape_replacement);
    }
  }
  return html;
}
const renderer = {
  code(code, infostring, escaped) {
    const lang = (infostring ?? "").match(/\S*/)?.[0] ?? "";
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }
    code = code.replace(/\n$/, "") + "\n";
    if (!lang) {
      return '<div class="code_wrap">' + COPY_BUTTON_CODE + "<pre><code>" + (escaped ? code : escape(code, true)) + "</code></pre></div>\n";
    }
    return '<div class="code_wrap">' + COPY_BUTTON_CODE + '<pre><code class="' + this.options.langPrefix + escape(lang) + '">' + (escaped ? code : escape(code, true)) + "</code></pre></div>\n";
  }
};
marked.use(
  {
    gfm: true,
    breaks: false,
    pedantic: false,
    headerIds: false,
    mangle: false
  },
  markedHighlight({
    highlight: (code, lang) => {
      if (Prism$1.languages[lang]) {
        return Prism$1.highlight(code, Prism$1.languages[lang], lang);
      }
      return code;
    }
  }),
  { renderer }
);

const prism = '';

const MarkdownCode_svelte_svelte_type_style_lang = '';

/* Users/peterallen/Projects/gradio/js/markdown/static/MarkdownCode.svelte generated by Svelte v4.0.0 */
const file$2 = "Users/peterallen/Projects/gradio/js/markdown/static/MarkdownCode.svelte";

function create_fragment$2(ctx) {
	let span;

	const block = {
		c: function create() {
			span = element("span");
			attr_dev(span, "class", "md s--uUWQ_HIGUsL");
			toggle_class(span, "chatbot", /*chatbot*/ ctx[0]);
			add_location(span, file$2, 44, 0, 1045);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			span.innerHTML = /*html*/ ctx[2];
			/*span_binding*/ ctx[6](span);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*html*/ 4) span.innerHTML = /*html*/ ctx[2];
			if (dirty & /*chatbot*/ 1) {
				toggle_class(span, "chatbot", /*chatbot*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(span);
			}

			/*span_binding*/ ctx[6](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('MarkdownCode', slots, []);
	let { chatbot = true } = $$props;
	let { message } = $$props;
	let { sanitize_html = true } = $$props;
	let { latex_delimiters = [] } = $$props;
	let el;
	let html;

	purify.addHook("afterSanitizeAttributes", function (node) {
		if ("target" in node) {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});

	async function render_html(value) {
		if (latex_delimiters?.length > 0) {
			render_math_in_element(el, {
				delimiters: latex_delimiters,
				throwOnError: false
			});
		}
	}

	afterUpdate(() => render_html());

	$$self.$$.on_mount.push(function () {
		if (message === undefined && !('message' in $$props || $$self.$$.bound[$$self.$$.props['message']])) {
			console.warn("<MarkdownCode> was created without expected prop 'message'");
		}
	});

	const writable_props = ['chatbot', 'message', 'sanitize_html', 'latex_delimiters'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MarkdownCode> was created with unknown prop '${key}'`);
	});

	function span_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(1, el);
		});
	}

	$$self.$$set = $$props => {
		if ('chatbot' in $$props) $$invalidate(0, chatbot = $$props.chatbot);
		if ('message' in $$props) $$invalidate(3, message = $$props.message);
		if ('sanitize_html' in $$props) $$invalidate(4, sanitize_html = $$props.sanitize_html);
		if ('latex_delimiters' in $$props) $$invalidate(5, latex_delimiters = $$props.latex_delimiters);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		createEventDispatcher,
		DOMPurify: purify,
		render_math_in_element,
		marked,
		chatbot,
		message,
		sanitize_html,
		latex_delimiters,
		el,
		html,
		render_html
	});

	$$self.$inject_state = $$props => {
		if ('chatbot' in $$props) $$invalidate(0, chatbot = $$props.chatbot);
		if ('message' in $$props) $$invalidate(3, message = $$props.message);
		if ('sanitize_html' in $$props) $$invalidate(4, sanitize_html = $$props.sanitize_html);
		if ('latex_delimiters' in $$props) $$invalidate(5, latex_delimiters = $$props.latex_delimiters);
		if ('el' in $$props) $$invalidate(1, el = $$props.el);
		if ('html' in $$props) $$invalidate(2, html = $$props.html);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*message, sanitize_html*/ 24) {
			if (message && message.trim()) {
				$$invalidate(2, html = sanitize_html
				? purify.sanitize(marked.parse(message))
				: marked.parse(message));
			} else {
				$$invalidate(2, html = "");
			}
		}
	};

	return [chatbot, el, html, message, sanitize_html, latex_delimiters, span_binding];
}

class MarkdownCode extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			chatbot: 0,
			message: 3,
			sanitize_html: 4,
			latex_delimiters: 5
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MarkdownCode",
			options,
			id: create_fragment$2.name
		});
	}

	get chatbot() {
		throw new Error("<MarkdownCode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set chatbot(value) {
		throw new Error("<MarkdownCode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get message() {
		throw new Error("<MarkdownCode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set message(value) {
		throw new Error("<MarkdownCode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get sanitize_html() {
		throw new Error("<MarkdownCode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set sanitize_html(value) {
		throw new Error("<MarkdownCode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get latex_delimiters() {
		throw new Error("<MarkdownCode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set latex_delimiters(value) {
		throw new Error("<MarkdownCode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const MarkdownCode$1 = MarkdownCode;

const Markdown_svelte_svelte_type_style_lang = '';

/* Users/peterallen/Projects/gradio/js/markdown/static/Markdown.svelte generated by Svelte v4.0.0 */
const file$1 = "Users/peterallen/Projects/gradio/js/markdown/static/Markdown.svelte";

function create_fragment$1(ctx) {
	let div;
	let markdowncode;
	let div_class_value;
	let div_dir_value;
	let current;
	let mounted;
	let dispose;

	markdowncode = new MarkdownCode$1({
			props: {
				message: /*value*/ ctx[3],
				latex_delimiters: /*latex_delimiters*/ ctx[7],
				sanitize_html: /*sanitize_html*/ ctx[6],
				chatbot: false
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(markdowncode.$$.fragment);
			attr_dev(div, "id", /*elem_id*/ ctx[0]);
			attr_dev(div, "class", div_class_value = "prose " + /*elem_classes*/ ctx[1].join(' ') + " s-waazcT5JJBRe");
			attr_dev(div, "data-testid", "markdown");
			attr_dev(div, "dir", div_dir_value = /*rtl*/ ctx[5] ? "rtl" : "ltr");
			toggle_class(div, "min", /*min_height*/ ctx[4]);
			toggle_class(div, "hide", !/*visible*/ ctx[2]);
			add_location(div, file$1, 25, 0, 454);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(markdowncode, div, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(copy.call(null, div));
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			const markdowncode_changes = {};
			if (dirty & /*value*/ 8) markdowncode_changes.message = /*value*/ ctx[3];
			if (dirty & /*latex_delimiters*/ 128) markdowncode_changes.latex_delimiters = /*latex_delimiters*/ ctx[7];
			if (dirty & /*sanitize_html*/ 64) markdowncode_changes.sanitize_html = /*sanitize_html*/ ctx[6];
			markdowncode.$set(markdowncode_changes);

			if (!current || dirty & /*elem_id*/ 1) {
				attr_dev(div, "id", /*elem_id*/ ctx[0]);
			}

			if (!current || dirty & /*elem_classes*/ 2 && div_class_value !== (div_class_value = "prose " + /*elem_classes*/ ctx[1].join(' ') + " s-waazcT5JJBRe")) {
				attr_dev(div, "class", div_class_value);
			}

			if (!current || dirty & /*rtl*/ 32 && div_dir_value !== (div_dir_value = /*rtl*/ ctx[5] ? "rtl" : "ltr")) {
				attr_dev(div, "dir", div_dir_value);
			}

			if (!current || dirty & /*elem_classes, min_height*/ 18) {
				toggle_class(div, "min", /*min_height*/ ctx[4]);
			}

			if (!current || dirty & /*elem_classes, visible*/ 6) {
				toggle_class(div, "hide", !/*visible*/ ctx[2]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(markdowncode.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(markdowncode.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(markdowncode);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Markdown', slots, []);
	let { elem_id = "" } = $$props;
	let { elem_classes = [] } = $$props;
	let { visible = true } = $$props;
	let { value } = $$props;
	let { min_height = false } = $$props;
	let { rtl = false } = $$props;
	let { sanitize_html = true } = $$props;
	const dispatch = createEventDispatcher();
	let { latex_delimiters } = $$props;

	$$self.$$.on_mount.push(function () {
		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
			console.warn("<Markdown> was created without expected prop 'value'");
		}

		if (latex_delimiters === undefined && !('latex_delimiters' in $$props || $$self.$$.bound[$$self.$$.props['latex_delimiters']])) {
			console.warn("<Markdown> was created without expected prop 'latex_delimiters'");
		}
	});

	const writable_props = [
		'elem_id',
		'elem_classes',
		'visible',
		'value',
		'min_height',
		'rtl',
		'sanitize_html',
		'latex_delimiters'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Markdown> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('elem_id' in $$props) $$invalidate(0, elem_id = $$props.elem_id);
		if ('elem_classes' in $$props) $$invalidate(1, elem_classes = $$props.elem_classes);
		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('min_height' in $$props) $$invalidate(4, min_height = $$props.min_height);
		if ('rtl' in $$props) $$invalidate(5, rtl = $$props.rtl);
		if ('sanitize_html' in $$props) $$invalidate(6, sanitize_html = $$props.sanitize_html);
		if ('latex_delimiters' in $$props) $$invalidate(7, latex_delimiters = $$props.latex_delimiters);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		copy,
		MarkdownCode: MarkdownCode$1,
		elem_id,
		elem_classes,
		visible,
		value,
		min_height,
		rtl,
		sanitize_html,
		dispatch,
		latex_delimiters
	});

	$$self.$inject_state = $$props => {
		if ('elem_id' in $$props) $$invalidate(0, elem_id = $$props.elem_id);
		if ('elem_classes' in $$props) $$invalidate(1, elem_classes = $$props.elem_classes);
		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('min_height' in $$props) $$invalidate(4, min_height = $$props.min_height);
		if ('rtl' in $$props) $$invalidate(5, rtl = $$props.rtl);
		if ('sanitize_html' in $$props) $$invalidate(6, sanitize_html = $$props.sanitize_html);
		if ('latex_delimiters' in $$props) $$invalidate(7, latex_delimiters = $$props.latex_delimiters);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*value*/ 8) {
			(dispatch("change"));
		}
	};

	return [
		elem_id,
		elem_classes,
		visible,
		value,
		min_height,
		rtl,
		sanitize_html,
		latex_delimiters
	];
}

class Markdown extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
			elem_id: 0,
			elem_classes: 1,
			visible: 2,
			value: 3,
			min_height: 4,
			rtl: 5,
			sanitize_html: 6,
			latex_delimiters: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Markdown",
			options,
			id: create_fragment$1.name
		});
	}

	get elem_id() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set elem_id(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get elem_classes() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set elem_classes(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get visible() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set visible(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get min_height() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set min_height(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get rtl() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set rtl(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get sanitize_html() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set sanitize_html(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get latex_delimiters() {
		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set latex_delimiters(value) {
		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const StaticMarkdown_svelte_svelte_type_style_lang = '';

/* Users/peterallen/Projects/gradio/js/markdown/static/StaticMarkdown.svelte generated by Svelte v4.0.0 */
const file = "Users/peterallen/Projects/gradio/js/markdown/static/StaticMarkdown.svelte";

// (17:0) <Block {visible} {elem_id} {elem_classes} container={false}>
function create_default_slot(ctx) {
	let statustracker;
	let t;
	let div;
	let markdown;
	let current;

	const statustracker_spread_levels = [
		{ autoscroll: /*gradio*/ ctx[7].autoscroll },
		{ i18n: /*gradio*/ ctx[7].i18n },
		/*loading_status*/ ctx[4],
		{ variant: "center" }
	];

	let statustracker_props = {};

	for (let i = 0; i < statustracker_spread_levels.length; i += 1) {
		statustracker_props = assign(statustracker_props, statustracker_spread_levels[i]);
	}

	statustracker = new Static({
			props: statustracker_props,
			$$inline: true
		});

	markdown = new Markdown({
			props: {
				min_height: /*loading_status*/ ctx[4] && /*loading_status*/ ctx[4].status !== "complete",
				value: /*value*/ ctx[3],
				elem_id: /*elem_id*/ ctx[0],
				elem_classes: /*elem_classes*/ ctx[1],
				visible: /*visible*/ ctx[2],
				rtl: /*rtl*/ ctx[5],
				latex_delimiters: /*latex_delimiters*/ ctx[8],
				sanitize_html: /*sanitize_html*/ ctx[6]
			},
			$$inline: true
		});

	markdown.$on("change", /*change_handler*/ ctx[10]);

	const block = {
		c: function create() {
			create_component(statustracker.$$.fragment);
			t = space();
			div = element("div");
			create_component(markdown.$$.fragment);
			attr_dev(div, "class", "s-qOC5XrRgcAkZ");
			toggle_class(div, "pending", /*loading_status*/ ctx[4]?.status === "pending");
			add_location(div, file, 35, 1, 634);
		},
		m: function mount(target, anchor) {
			mount_component(statustracker, target, anchor);
			insert_dev(target, t, anchor);
			insert_dev(target, div, anchor);
			mount_component(markdown, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const statustracker_changes = (dirty & /*gradio, loading_status*/ 144)
			? get_spread_update(statustracker_spread_levels, [
					dirty & /*gradio*/ 128 && { autoscroll: /*gradio*/ ctx[7].autoscroll },
					dirty & /*gradio*/ 128 && { i18n: /*gradio*/ ctx[7].i18n },
					dirty & /*loading_status*/ 16 && get_spread_object(/*loading_status*/ ctx[4]),
					statustracker_spread_levels[3]
				])
			: {};

			statustracker.$set(statustracker_changes);
			const markdown_changes = {};
			if (dirty & /*loading_status*/ 16) markdown_changes.min_height = /*loading_status*/ ctx[4] && /*loading_status*/ ctx[4].status !== "complete";
			if (dirty & /*value*/ 8) markdown_changes.value = /*value*/ ctx[3];
			if (dirty & /*elem_id*/ 1) markdown_changes.elem_id = /*elem_id*/ ctx[0];
			if (dirty & /*elem_classes*/ 2) markdown_changes.elem_classes = /*elem_classes*/ ctx[1];
			if (dirty & /*visible*/ 4) markdown_changes.visible = /*visible*/ ctx[2];
			if (dirty & /*rtl*/ 32) markdown_changes.rtl = /*rtl*/ ctx[5];
			if (dirty & /*latex_delimiters*/ 256) markdown_changes.latex_delimiters = /*latex_delimiters*/ ctx[8];
			if (dirty & /*sanitize_html*/ 64) markdown_changes.sanitize_html = /*sanitize_html*/ ctx[6];
			markdown.$set(markdown_changes);

			if (!current || dirty & /*loading_status*/ 16) {
				toggle_class(div, "pending", /*loading_status*/ ctx[4]?.status === "pending");
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(statustracker.$$.fragment, local);
			transition_in(markdown.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(statustracker.$$.fragment, local);
			transition_out(markdown.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
				detach_dev(div);
			}

			destroy_component(statustracker, detaching);
			destroy_component(markdown);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(17:0) <Block {visible} {elem_id} {elem_classes} container={false}>",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let block;
	let current;

	block = new Block({
			props: {
				visible: /*visible*/ ctx[2],
				elem_id: /*elem_id*/ ctx[0],
				elem_classes: /*elem_classes*/ ctx[1],
				container: false,
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block_1 = {
		c: function create() {
			create_component(block.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(block, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const block_changes = {};
			if (dirty & /*visible*/ 4) block_changes.visible = /*visible*/ ctx[2];
			if (dirty & /*elem_id*/ 1) block_changes.elem_id = /*elem_id*/ ctx[0];
			if (dirty & /*elem_classes*/ 2) block_changes.elem_classes = /*elem_classes*/ ctx[1];

			if (dirty & /*$$scope, loading_status, value, elem_id, elem_classes, visible, rtl, latex_delimiters, sanitize_html, gradio*/ 2559) {
				block_changes.$$scope = { dirty, ctx };
			}

			block.$set(block_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(block.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(block.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(block, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block: block_1,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block_1;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('StaticMarkdown', slots, []);
	let { label } = $$props;
	let { elem_id = "" } = $$props;
	let { elem_classes = [] } = $$props;
	let { visible = true } = $$props;
	let { value = "" } = $$props;
	let { loading_status } = $$props;
	let { rtl = false } = $$props;
	let { sanitize_html = true } = $$props;
	let { gradio } = $$props;
	let { latex_delimiters } = $$props;

	$$self.$$.on_mount.push(function () {
		if (label === undefined && !('label' in $$props || $$self.$$.bound[$$self.$$.props['label']])) {
			console.warn("<StaticMarkdown> was created without expected prop 'label'");
		}

		if (loading_status === undefined && !('loading_status' in $$props || $$self.$$.bound[$$self.$$.props['loading_status']])) {
			console.warn("<StaticMarkdown> was created without expected prop 'loading_status'");
		}

		if (gradio === undefined && !('gradio' in $$props || $$self.$$.bound[$$self.$$.props['gradio']])) {
			console.warn("<StaticMarkdown> was created without expected prop 'gradio'");
		}

		if (latex_delimiters === undefined && !('latex_delimiters' in $$props || $$self.$$.bound[$$self.$$.props['latex_delimiters']])) {
			console.warn("<StaticMarkdown> was created without expected prop 'latex_delimiters'");
		}
	});

	const writable_props = [
		'label',
		'elem_id',
		'elem_classes',
		'visible',
		'value',
		'loading_status',
		'rtl',
		'sanitize_html',
		'gradio',
		'latex_delimiters'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StaticMarkdown> was created with unknown prop '${key}'`);
	});

	const change_handler = () => gradio.dispatch("change");

	$$self.$$set = $$props => {
		if ('label' in $$props) $$invalidate(9, label = $$props.label);
		if ('elem_id' in $$props) $$invalidate(0, elem_id = $$props.elem_id);
		if ('elem_classes' in $$props) $$invalidate(1, elem_classes = $$props.elem_classes);
		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('loading_status' in $$props) $$invalidate(4, loading_status = $$props.loading_status);
		if ('rtl' in $$props) $$invalidate(5, rtl = $$props.rtl);
		if ('sanitize_html' in $$props) $$invalidate(6, sanitize_html = $$props.sanitize_html);
		if ('gradio' in $$props) $$invalidate(7, gradio = $$props.gradio);
		if ('latex_delimiters' in $$props) $$invalidate(8, latex_delimiters = $$props.latex_delimiters);
	};

	$$self.$capture_state = () => ({
		Markdown,
		StatusTracker: Static,
		Block,
		label,
		elem_id,
		elem_classes,
		visible,
		value,
		loading_status,
		rtl,
		sanitize_html,
		gradio,
		latex_delimiters
	});

	$$self.$inject_state = $$props => {
		if ('label' in $$props) $$invalidate(9, label = $$props.label);
		if ('elem_id' in $$props) $$invalidate(0, elem_id = $$props.elem_id);
		if ('elem_classes' in $$props) $$invalidate(1, elem_classes = $$props.elem_classes);
		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('loading_status' in $$props) $$invalidate(4, loading_status = $$props.loading_status);
		if ('rtl' in $$props) $$invalidate(5, rtl = $$props.rtl);
		if ('sanitize_html' in $$props) $$invalidate(6, sanitize_html = $$props.sanitize_html);
		if ('gradio' in $$props) $$invalidate(7, gradio = $$props.gradio);
		if ('latex_delimiters' in $$props) $$invalidate(8, latex_delimiters = $$props.latex_delimiters);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*label, gradio*/ 640) {
			(gradio.dispatch("change"));
		}
	};

	return [
		elem_id,
		elem_classes,
		visible,
		value,
		loading_status,
		rtl,
		sanitize_html,
		gradio,
		latex_delimiters,
		label,
		change_handler
	];
}

class StaticMarkdown extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			label: 9,
			elem_id: 0,
			elem_classes: 1,
			visible: 2,
			value: 3,
			loading_status: 4,
			rtl: 5,
			sanitize_html: 6,
			gradio: 7,
			latex_delimiters: 8
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "StaticMarkdown",
			options,
			id: create_fragment.name
		});
	}

	get label() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set label(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get elem_id() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set elem_id(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get elem_classes() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set elem_classes(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get visible() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set visible(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loading_status() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loading_status(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get rtl() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set rtl(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get sanitize_html() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set sanitize_html(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get gradio() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set gradio(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get latex_delimiters() {
		throw new Error("<StaticMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set latex_delimiters(value) {
		throw new Error("<StaticMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const StaticMarkdown$1 = StaticMarkdown;

export { MarkdownCode$1 as M, StaticMarkdown$1 as S };
//# sourceMappingURL=StaticMarkdown-08860037.js.map

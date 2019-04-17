/*!
 * tui-image-editor.js
 * @version 3.5.1
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("tui-code-snippet"), require("tui-color-picker"), require("fabric/dist/fabric.require"));
	else if(typeof define === 'function' && define.amd)
		define(["tui-code-snippet", "tui-color-picker", "fabric/dist/fabric.require"], factory);
	else if(typeof exports === 'object')
		exports["ImageEditor"] = factory(require("tui-code-snippet"), require("tui-color-picker"), require("fabric/dist/fabric.require"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["ImageEditor"] = factory((root["tui"] && root["tui"]["util"]), (root["tui"] && root["tui"]["colorPicker"]), root["fabric"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_82__, __WEBPACK_EXTERNAL_MODULE_106__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	var _imageEditor = __webpack_require__(2);

	var _imageEditor2 = _interopRequireDefault(_imageEditor);

	__webpack_require__(131);

	__webpack_require__(133);

	__webpack_require__(134);

	__webpack_require__(135);

	__webpack_require__(136);

	__webpack_require__(137);

	__webpack_require__(138);

	__webpack_require__(139);

	__webpack_require__(140);

	__webpack_require__(141);

	__webpack_require__(142);

	__webpack_require__(143);

	__webpack_require__(144);

	__webpack_require__(145);

	__webpack_require__(146);

	__webpack_require__(147);

	__webpack_require__(148);

	__webpack_require__(149);

	__webpack_require__(150);

	__webpack_require__(151);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = _imageEditor2.default;

	// commands

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
	// Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/if (!Element.prototype.matches)
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

	if (!Element.prototype.closest) Element.prototype.closest = function (s) {
	    var el = this;
	    if (!document.documentElement.contains(el)) return null;
	    do {
	        if (el.matches(s)) return el;
	        el = el.parentElement || el.parentNode;
	    } while (el !== null && el.nodeType === 1);
	    return null;
	};

	/*
	 * classList.js: Cross-browser full element.classList implementation.
	 * 1.1.20170427
	 *
	 * By Eli Grey, http://eligrey.com
	 * License: Dedicated to the public domain.
	 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
	 */

	/*global self, document, DOMException */

	/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

	if ("document" in window.self) {

	    // Full polyfill for browsers with no classList support
	    // Including IE < Edge missing SVGElement.classList
	    if (!("classList" in document.createElement("_")) || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg", "g"))) {

	        (function (view) {

	            "use strict";

	            if (!('Element' in view)) return;

	            var classListProp = "classList",
	                protoProp = "prototype",
	                elemCtrProto = view.Element[protoProp],
	                objCtr = Object,
	                strTrim = String[protoProp].trim || function () {
	                return this.replace(/^\s+|\s+$/g, "");
	            },
	                arrIndexOf = Array[protoProp].indexOf || function (item) {
	                var i = 0,
	                    len = this.length;
	                for (; i < len; i++) {
	                    if (i in this && this[i] === item) {
	                        return i;
	                    }
	                }
	                return -1;
	            }
	            // Vendors: please allow content code to instantiate DOMExceptions
	            ,
	                DOMEx = function DOMEx(type, message) {
	                this.name = type;
	                this.code = DOMException[type];
	                this.message = message;
	            },
	                checkTokenAndGetIndex = function checkTokenAndGetIndex(classList, token) {
	                if (token === "") {
	                    throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
	                }
	                if (/\s/.test(token)) {
	                    throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
	                }
	                return arrIndexOf.call(classList, token);
	            },
	                ClassList = function ClassList(elem) {
	                var trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
	                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
	                    i = 0,
	                    len = classes.length;
	                for (; i < len; i++) {
	                    this.push(classes[i]);
	                }
	                this._updateClassName = function () {
	                    elem.setAttribute("class", this.toString());
	                };
	            },
	                classListProto = ClassList[protoProp] = [],
	                classListGetter = function classListGetter() {
	                return new ClassList(this);
	            };
	            // Most DOMException implementations don't allow calling DOMException's toString()
	            // on non-DOMExceptions. Error's toString() is sufficient here.
	            DOMEx[protoProp] = Error[protoProp];
	            classListProto.item = function (i) {
	                return this[i] || null;
	            };
	            classListProto.contains = function (token) {
	                token += "";
	                return checkTokenAndGetIndex(this, token) !== -1;
	            };
	            classListProto.add = function () {
	                var tokens = arguments,
	                    i = 0,
	                    l = tokens.length,
	                    token,
	                    updated = false;
	                do {
	                    token = tokens[i] + "";
	                    if (checkTokenAndGetIndex(this, token) === -1) {
	                        this.push(token);
	                        updated = true;
	                    }
	                } while (++i < l);

	                if (updated) {
	                    this._updateClassName();
	                }
	            };
	            classListProto.remove = function () {
	                var tokens = arguments,
	                    i = 0,
	                    l = tokens.length,
	                    token,
	                    updated = false,
	                    index;
	                do {
	                    token = tokens[i] + "";
	                    index = checkTokenAndGetIndex(this, token);
	                    while (index !== -1) {
	                        this.splice(index, 1);
	                        updated = true;
	                        index = checkTokenAndGetIndex(this, token);
	                    }
	                } while (++i < l);

	                if (updated) {
	                    this._updateClassName();
	                }
	            };
	            classListProto.toggle = function (token, force) {
	                token += "";

	                var result = this.contains(token),
	                    method = result ? force !== true && "remove" : force !== false && "add";

	                if (method) {
	                    this[method](token);
	                }

	                if (force === true || force === false) {
	                    return force;
	                } else {
	                    return !result;
	                }
	            };
	            classListProto.toString = function () {
	                return this.join(" ");
	            };

	            if (objCtr.defineProperty) {
	                var classListPropDesc = {
	                    get: classListGetter,
	                    enumerable: true,
	                    configurable: true
	                };
	                try {
	                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	                } catch (ex) {
	                    // IE 8 doesn't support enumerable:true
	                    // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
	                    // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
	                    if (ex.number === undefined || ex.number === -0x7FF5EC54) {
	                        classListPropDesc.enumerable = false;
	                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	                    }
	                }
	            } else if (objCtr[protoProp].__defineGetter__) {
	                elemCtrProto.__defineGetter__(classListProp, classListGetter);
	            }
	        })(window.self);
	    }

	    // There is full or partial native classList support, so just check if we need
	    // to normalize the add/remove and toggle APIs.

	    (function () {
	        "use strict";

	        var testElement = document.createElement("_");

	        testElement.classList.add("c1", "c2");

	        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
	        // classList.remove exist but support only one argument at a time.
	        if (!testElement.classList.contains("c2")) {
	            var createMethod = function createMethod(method) {
	                var original = DOMTokenList.prototype[method];

	                DOMTokenList.prototype[method] = function (token) {
	                    var i,
	                        len = arguments.length;

	                    for (i = 0; i < len; i++) {
	                        token = arguments[i];
	                        original.call(this, token);
	                    }
	                };
	            };
	            createMethod('add');
	            createMethod('remove');
	        }

	        testElement.classList.toggle("c3", false);

	        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	        // support the second argument.
	        if (testElement.classList.contains("c3")) {
	            var _toggle = DOMTokenList.prototype.toggle;

	            DOMTokenList.prototype.toggle = function (token, force) {
	                if (1 in arguments && !this.contains(token) === !force) {
	                    return force;
	                } else {
	                    return _toggle.call(this, token);
	                }
	            };
	        }

	        testElement = null;
	    })();
	}

	/*!
	 * @copyright Copyright (c) 2017 IcoMoon.io
	 * @license   Licensed under MIT license
	 *            See https://github.com/Keyamoon/svgxuse
	 * @version   1.2.6
	 */
	/*jslint browser: true */
	/*global XDomainRequest, MutationObserver, window */
	(function () {
	    "use strict";

	    if (typeof window !== "undefined" && window.addEventListener) {
	        var cache = Object.create(null); // holds xhr objects to prevent multiple requests
	        var checkUseElems;
	        var tid; // timeout id
	        var debouncedCheck = function debouncedCheck() {
	            clearTimeout(tid);
	            tid = setTimeout(checkUseElems, 100);
	        };
	        var unobserveChanges = function unobserveChanges() {
	            return;
	        };
	        var observeChanges = function observeChanges() {
	            var observer;
	            window.addEventListener("resize", debouncedCheck, false);
	            window.addEventListener("orientationchange", debouncedCheck, false);
	            if (window.MutationObserver) {
	                observer = new MutationObserver(debouncedCheck);
	                observer.observe(document.documentElement, {
	                    childList: true,
	                    subtree: true,
	                    attributes: true
	                });
	                unobserveChanges = function unobserveChanges() {
	                    try {
	                        observer.disconnect();
	                        window.removeEventListener("resize", debouncedCheck, false);
	                        window.removeEventListener("orientationchange", debouncedCheck, false);
	                    } catch (ignore) {}
	                };
	            } else {
	                document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);
	                unobserveChanges = function unobserveChanges() {
	                    document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
	                    window.removeEventListener("resize", debouncedCheck, false);
	                    window.removeEventListener("orientationchange", debouncedCheck, false);
	                };
	            }
	        };
	        var createRequest = function createRequest(url) {
	            // In IE 9, cross origin requests can only be sent using XDomainRequest.
	            // XDomainRequest would fail if CORS headers are not set.
	            // Therefore, XDomainRequest should only be used with cross origin requests.
	            function getOrigin(loc) {
	                var a;
	                if (loc.protocol !== undefined) {
	                    a = loc;
	                } else {
	                    a = document.createElement("a");
	                    a.href = loc;
	                }
	                return a.protocol.replace(/:/g, "") + a.host;
	            }
	            var Request;
	            var origin;
	            var origin2;
	            if (window.XMLHttpRequest) {
	                Request = new XMLHttpRequest();
	                origin = getOrigin(location);
	                origin2 = getOrigin(url);
	                if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
	                    Request = XDomainRequest || undefined;
	                } else {
	                    Request = XMLHttpRequest;
	                }
	            }
	            return Request;
	        };
	        var xlinkNS = "http://www.w3.org/1999/xlink";
	        checkUseElems = function checkUseElems() {
	            var base;
	            var bcr;
	            var fallback = ""; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
	            var hash;
	            var href;
	            var i;
	            var inProgressCount = 0;
	            var isHidden;
	            var Request;
	            var url;
	            var uses;
	            var xhr;
	            function observeIfDone() {
	                // If done with making changes, start watching for chagnes in DOM again
	                inProgressCount -= 1;
	                if (inProgressCount === 0) {
	                    // if all xhrs were resolved
	                    unobserveChanges(); // make sure to remove old handlers
	                    observeChanges(); // watch for changes to DOM
	                }
	            }
	            function attrUpdateFunc(spec) {
	                return function () {
	                    if (cache[spec.base] !== true) {
	                        spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);
	                        if (spec.useEl.hasAttribute("href")) {
	                            spec.useEl.setAttribute("href", "#" + spec.hash);
	                        }
	                    }
	                };
	            }
	            function onloadFunc(xhr) {
	                return function () {
	                    var body = document.body;
	                    var x = document.createElement("x");
	                    var svg;
	                    xhr.onload = null;
	                    x.innerHTML = xhr.responseText;
	                    svg = x.getElementsByTagName("svg")[0];
	                    if (svg) {
	                        svg.setAttribute("aria-hidden", "true");
	                        svg.style.position = "absolute";
	                        svg.style.width = 0;
	                        svg.style.height = 0;
	                        svg.style.overflow = "hidden";
	                        body.insertBefore(svg, body.firstChild);
	                    }
	                    observeIfDone();
	                };
	            }
	            function onErrorTimeout(xhr) {
	                return function () {
	                    xhr.onerror = null;
	                    xhr.ontimeout = null;
	                    observeIfDone();
	                };
	            }
	            unobserveChanges(); // stop watching for changes to DOM
	            // find all use elements
	            uses = document.getElementsByTagName("use");
	            for (i = 0; i < uses.length; i += 1) {
	                try {
	                    bcr = uses[i].getBoundingClientRect();
	                } catch (ignore) {
	                    // failed to get bounding rectangle of the use element
	                    bcr = false;
	                }
	                href = uses[i].getAttribute("href") || uses[i].getAttributeNS(xlinkNS, "href") || uses[i].getAttribute("xlink:href");
	                if (href && href.split) {
	                    url = href.split("#");
	                } else {
	                    url = ["", ""];
	                }
	                base = url[0];
	                hash = url[1];
	                isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
	                if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
	                    // the use element is empty
	                    // if there is a reference to an external SVG, try to fetch it
	                    // use the optional fallback URL if there is no reference to an external SVG
	                    if (fallback && !base.length && hash && !document.getElementById(hash)) {
	                        base = fallback;
	                    }
	                    if (uses[i].hasAttribute("href")) {
	                        uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
	                    }
	                    if (base.length) {
	                        // schedule updating xlink:href
	                        xhr = cache[base];
	                        if (xhr !== true) {
	                            // true signifies that prepending the SVG was not required
	                            setTimeout(attrUpdateFunc({
	                                useEl: uses[i],
	                                base: base,
	                                hash: hash
	                            }), 0);
	                        }
	                        if (xhr === undefined) {
	                            Request = createRequest(base);
	                            if (Request !== undefined) {
	                                xhr = new Request();
	                                cache[base] = xhr;
	                                xhr.onload = onloadFunc(xhr);
	                                xhr.onerror = onErrorTimeout(xhr);
	                                xhr.ontimeout = onErrorTimeout(xhr);
	                                xhr.open("GET", base);
	                                xhr.send();
	                                inProgressCount += 1;
	                            }
	                        }
	                    }
	                } else {
	                    if (!isHidden) {
	                        if (cache[base] === undefined) {
	                            // remember this URL if the use element was not empty and no request was sent
	                            cache[base] = true;
	                        } else if (cache[base].onload) {
	                            // if it turns out that prepending the SVG is not necessary,
	                            // abort the in-progress xhr.
	                            cache[base].abort();
	                            delete cache[base].onload;
	                            cache[base] = true;
	                        }
	                    } else if (base.length && cache[base]) {
	                        setTimeout(attrUpdateFunc({
	                            useEl: uses[i],
	                            base: base,
	                            hash: hash
	                        }), 0);
	                    }
	                }
	            }
	            uses = "";
	            inProgressCount += 1;
	            observeIfDone();
	        };
	        var _winLoad;
	        _winLoad = function winLoad() {
	            window.removeEventListener("load", _winLoad, false); // to prevent memory leaks
	            tid = setTimeout(checkUseElems, 0);
	        };
	        if (document.readyState !== "complete") {
	            // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
	            window.addEventListener("load", _winLoad, false);
	        } else {
	            // No need to add a listener if the document is already loaded, initialize immediately.
	            _winLoad();
	        }
	    }
	})();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Image-editor application class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _invoker2 = __webpack_require__(68);

	var _invoker3 = _interopRequireDefault(_invoker2);

	var _ui = __webpack_require__(74);

	var _ui2 = _interopRequireDefault(_ui);

	var _action = __webpack_require__(103);

	var _action2 = _interopRequireDefault(_action);

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _graphics = __webpack_require__(105);

	var _graphics2 = _interopRequireDefault(_graphics);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(72);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var events = _consts2.default.eventNames;
	var commands = _consts2.default.commandNames;
	var keyCodes = _consts2.default.keyCodes,
	    rejectMessages = _consts2.default.rejectMessages;
	var isUndefined = _tuiCodeSnippet2.default.isUndefined,
	    forEach = _tuiCodeSnippet2.default.forEach,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;

	/**
	 * Image editor
	 * @class
	 * @param {string|HTMLElement} wrapper - Wrapper's element or selector
	 * @param {Object} [options] - Canvas max width & height of css
	 *  @param {number} [options.includeUI] - Use the provided UI
	 *    @param {Object} [options.includeUI.loadImage] - Basic editing image
	 *      @param {string} options.includeUI.loadImage.path - image path
	 *      @param {string} options.includeUI.loadImage.name - image name
	 *    @param {Object} [options.includeUI.theme] - Theme object
	 *    @param {Array} [options.includeUI.menu] - It can be selected when only specific menu is used. [default all]
	 *    @param {string} [options.includeUI.initMenu] - The first menu to be selected and started.
	 *    @param {Object} [options.includeUI.uiSize] - ui size of editor
	 *      @param {string} options.includeUI.uiSize.width - width of ui
	 *      @param {string} options.includeUI.uiSize.height - height of ui
	 *    @param {string} [options.includeUI.menuBarPosition=bottom] - Menu bar position [top | bottom | left | right]
	 *  @param {number} options.cssMaxWidth - Canvas css-max-width
	 *  @param {number} options.cssMaxHeight - Canvas css-max-height
	 *  @param {Object} [options.selectionStyle] - selection style
	 *  @param {string} [options.selectionStyle.cornerStyle] - selection corner style
	 *  @param {number} [options.selectionStyle.cornerSize] - selection corner size
	 *  @param {string} [options.selectionStyle.cornerColor] - selection corner color
	 *  @param {string} [options.selectionStyle.cornerStrokeColor] = selection corner stroke color
	 *  @param {boolean} [options.selectionStyle.transparentCorners] - selection corner transparent
	 *  @param {number} [options.selectionStyle.lineWidth] - selection line width
	 *  @param {string} [options.selectionStyle.borderColor] - selection border color
	 *  @param {number} [options.selectionStyle.rotatingPointOffset] - selection rotating point length
	 *  @param {Boolean} [options.usageStatistics=true] - Let us know the hostname. If you don't want to send the hostname, please set to false.
	 * @example
	 * var ImageEditor = require('tui-image-editor');
	 * var blackTheme = require('./js/theme/black-theme.js');
	 * var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
	 *   includeUI: {
	 *     loadImage: {
	 *       path: 'img/sampleImage.jpg',
	 *       name: 'SampleImage'
	 *     },
	 *     theme: blackTheme, // or whiteTheme
	 *     menu: ['shape', 'filter'],
	 *     initMenu: 'filter',
	 *     uiSize: {
	 *         width: '1000px',
	 *         height: '700px'
	 *     },
	 *     menuBarPosition: 'bottom'
	 *   },
	 *   cssMaxWidth: 700,
	 *   cssMaxHeight: 500,
	 *   selectionStyle: {
	 *     cornerSize: 20,
	 *     rotatingPointOffset: 70
	 *   }
	 * });
	 */

	var ImageEditor = function () {
	    function ImageEditor(wrapper, options) {
	        _classCallCheck(this, ImageEditor);

	        options = _tuiCodeSnippet2.default.extend({
	            includeUI: false,
	            usageStatistics: true
	        }, options);

	        this.mode = null;

	        this.activeObjectId = null;

	        /**
	         * UI instance
	         * @type {Ui}
	         */
	        if (options.includeUI) {
	            this.ui = new _ui2.default(wrapper, options.includeUI, this.getActions());
	            options = this.ui.setUiDefaultSelectionStyle(options);
	        }

	        /**
	         * Invoker
	         * @type {Invoker}
	         * @private
	         */
	        this._invoker = new _invoker3.default();

	        /**
	         * Graphics instance
	         * @type {Graphics}
	         * @private
	         */
	        this._graphics = new _graphics2.default(this.ui ? this.ui.getEditorArea() : wrapper, {
	            cssMaxWidth: options.cssMaxWidth,
	            cssMaxHeight: options.cssMaxHeight,
	            useItext: !!this.ui,
	            useDragAddIcon: !!this.ui
	        });

	        /**
	         * Event handler list
	         * @type {Object}
	         * @private
	         */
	        this._handlers = {
	            keydown: this._onKeyDown.bind(this),
	            mousedown: this._onMouseDown.bind(this),
	            objectActivated: this._onObjectActivated.bind(this),
	            objectMoved: this._onObjectMoved.bind(this),
	            objectScaled: this._onObjectScaled.bind(this),
	            createdPath: this._onCreatedPath,
	            addText: this._onAddText.bind(this),
	            addObject: this._onAddObject.bind(this),
	            addObjectAfter: this._onAddObjectAfter.bind(this),
	            textEditing: this._onTextEditing.bind(this),
	            textChanged: this._onTextChanged.bind(this),
	            iconCreateResize: this._onIconCreateResize.bind(this),
	            iconCreateEnd: this._onIconCreateEnd.bind(this),
	            selectionCleared: this._selectionCleared.bind(this),
	            selectionCreated: this._selectionCreated.bind(this)
	        };

	        this._attachInvokerEvents();
	        this._attachGraphicsEvents();
	        this._attachDomEvents();
	        this._setSelectionStyle(options.selectionStyle, {
	            applyCropSelectionStyle: options.applyCropSelectionStyle,
	            applyGroupSelectionStyle: options.applyGroupSelectionStyle
	        });

	        if (options.usageStatistics) {
	            (0, _util.sendHostName)();
	        }

	        if (this.ui) {
	            this.ui.initCanvas();
	            this.setReAction();
	        }
	    }

	    /**
	     * Image filter result
	     * @typedef {Object} FilterResult
	     * @property {string} type - filter type like 'mask', 'Grayscale' and so on
	     * @property {string} action - action type like 'add', 'remove'
	     */

	    /**
	     * Flip status
	     * @typedef {Object} FlipStatus
	     * @property {boolean} flipX - x axis
	     * @property {boolean} flipY - y axis
	     * @property {Number} angle - angle
	     */
	    /**
	     * Rotation status
	     * @typedef {Number} RotateStatus
	     * @property {Number} angle - angle
	     */

	    /**
	     * Old and new Size
	     * @typedef {Object} SizeChange
	     * @property {Number} oldWidth - old width
	     * @property {Number} oldHeight - old height
	     * @property {Number} newWidth - new width
	     * @property {Number} newHeight - new height
	     */

	    /**
	     * @typedef {string} ErrorMsg - {string} error message
	     */

	    /**
	     * @typedef {Object} ObjectProps - graphics object properties
	     * @property {number} id - object id
	     * @property {string} type - object type
	     * @property {string} text - text content
	     * @property {(string | number)} left - Left
	     * @property {(string | number)} top - Top
	     * @property {(string | number)} width - Width
	     * @property {(string | number)} height - Height
	     * @property {string} fill - Color
	     * @property {string} stroke - Stroke
	     * @property {(string | number)} strokeWidth - StrokeWidth
	     * @property {string} fontFamily - Font type for text
	     * @property {number} fontSize - Font Size
	     * @property {string} fontStyle - Type of inclination (normal / italic)
	     * @property {string} fontWeight - Type of thicker or thinner looking (normal / bold)
	     * @property {string} textAlign - Type of text align (left / center / right)
	     * @property {string} textDecoraiton - Type of line (underline / line-throgh / overline)
	     */

	    /**
	     * Set selection style by init option
	     * @param {Object} selectionStyle - Selection styles
	     * @param {Object} applyTargets - Selection apply targets
	     *   @param {boolean} applyCropSelectionStyle - whether apply with crop selection style or not
	     *   @param {boolean} applyGroupSelectionStyle - whether apply with group selection style or not
	     * @private
	     */


	    _createClass(ImageEditor, [{
	        key: '_setSelectionStyle',
	        value: function _setSelectionStyle(selectionStyle, _ref) {
	            var applyCropSelectionStyle = _ref.applyCropSelectionStyle,
	                applyGroupSelectionStyle = _ref.applyGroupSelectionStyle;

	            if (selectionStyle) {
	                this._graphics.setSelectionStyle(selectionStyle);
	            }

	            if (applyCropSelectionStyle) {
	                this._graphics.setCropSelectionStyle(selectionStyle);
	            }

	            if (applyGroupSelectionStyle) {
	                this.on('selectionCreated', function (eventTarget) {
	                    if (eventTarget.type === 'group') {
	                        eventTarget.set(selectionStyle);
	                    }
	                });
	            }
	        }

	        /**
	         * Attach invoker events
	         * @private
	         */

	    }, {
	        key: '_attachInvokerEvents',
	        value: function _attachInvokerEvents() {
	            var UNDO_STACK_CHANGED = events.UNDO_STACK_CHANGED,
	                REDO_STACK_CHANGED = events.REDO_STACK_CHANGED;

	            /**
	             * Undo stack changed event
	             * @event ImageEditor#undoStackChanged
	             * @param {Number} length - undo stack length
	             * @example
	             * imageEditor.on('undoStackChanged', function(length) {
	             *     console.log(length);
	             * });
	             */

	            this._invoker.on(UNDO_STACK_CHANGED, this.fire.bind(this, UNDO_STACK_CHANGED));
	            /**
	             * Redo stack changed event
	             * @event ImageEditor#redoStackChanged
	             * @param {Number} length - redo stack length
	             * @example
	             * imageEditor.on('redoStackChanged', function(length) {
	             *     console.log(length);
	             * });
	             */
	            this._invoker.on(REDO_STACK_CHANGED, this.fire.bind(this, REDO_STACK_CHANGED));
	        }

	        /**
	         * Attach canvas events
	         * @private
	         */

	    }, {
	        key: '_attachGraphicsEvents',
	        value: function _attachGraphicsEvents() {
	            this._graphics.on({
	                'mousedown': this._handlers.mousedown,
	                'objectMoved': this._handlers.objectMoved,
	                'objectScaled': this._handlers.objectScaled,
	                'objectActivated': this._handlers.objectActivated,
	                'addText': this._handlers.addText,
	                'addObject': this._handlers.addObject,
	                'textEditing': this._handlers.textEditing,
	                'textChanged': this._handlers.textChanged,
	                'iconCreateResize': this._handlers.iconCreateResize,
	                'iconCreateEnd': this._handlers.iconCreateEnd,
	                'selectionCleared': this._handlers.selectionCleared,
	                'selectionCreated': this._handlers.selectionCreated,
	                'addObjectAfter': this._handlers.addObjectAfter
	            });
	        }

	        /**
	         * Attach dom events
	         * @private
	         */

	    }, {
	        key: '_attachDomEvents',
	        value: function _attachDomEvents() {
	            // ImageEditor supports IE 9 higher
	            document.addEventListener('keydown', this._handlers.keydown);
	        }

	        /**
	         * Detach dom events
	         * @private
	         */

	    }, {
	        key: '_detachDomEvents',
	        value: function _detachDomEvents() {
	            // ImageEditor supports IE 9 higher
	            document.removeEventListener('keydown', this._handlers.keydown);
	        }

	        /**
	         * Keydown event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */
	        /* eslint-disable complexity */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            var activeObject = this._graphics.getActiveObject();
	            var activeObjectGroup = this._graphics.getActiveGroupObject();
	            var existRemoveObject = activeObject || activeObjectGroup;

	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
	                // There is no error message on shortcut when it's empty
	                this.undo()['catch'](function () {});
	            }

	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
	                // There is no error message on shortcut when it's empty
	                this.redo()['catch'](function () {});
	            }

	            if ((e.keyCode === keyCodes.BACKSPACE || e.keyCode === keyCodes.DEL) && existRemoveObject) {
	                e.preventDefault();
	                this.removeActiveObject();
	            }
	        }
	        /* eslint-enable complexity */

	        /**
	         * Remove Active Object
	         */

	    }, {
	        key: 'removeActiveObject',
	        value: function removeActiveObject() {
	            var activeObject = this._graphics.getActiveObject();
	            var activeObjectGroup = this._graphics.getActiveGroupObject();

	            if (activeObjectGroup) {
	                var objects = activeObjectGroup.getObjects();
	                this.discardSelection();
	                this._removeObjectStream(objects);
	            } else if (activeObject) {
	                var activeObjectId = this._graphics.getObjectId(activeObject);
	                this.removeObject(activeObjectId);
	            }
	        }

	        /**
	         * RemoveObject Sequential processing for prevent invoke lock
	         * @param {Array.<Object>} targetObjects - target Objects for remove
	         * @returns {object} targetObjects
	         * @private
	         */

	    }, {
	        key: '_removeObjectStream',
	        value: function _removeObjectStream(targetObjects) {
	            var _this = this;

	            if (!targetObjects.length) {
	                return true;
	            }

	            var targetObject = targetObjects.pop();

	            return this.removeObject(this._graphics.getObjectId(targetObject)).then(function () {
	                return _this._removeObjectStream(targetObjects);
	            });
	        }

	        /**
	         * mouse down event handler
	         * @param {Event} event mouse down event
	         * @param {Object} originPointer origin pointer
	         *  @param {Number} originPointer.x x position
	         *  @param {Number} originPointer.y y position
	         * @private
	         */

	    }, {
	        key: '_onMouseDown',
	        value: function _onMouseDown(event, originPointer) {
	            /**
	             * The mouse down event with position x, y on canvas
	             * @event ImageEditor#mousedown
	             * @param {Object} event - browser mouse event object
	             * @param {Object} originPointer origin pointer
	             *  @param {Number} originPointer.x x position
	             *  @param {Number} originPointer.y y position
	             * @example
	             * imageEditor.on('mousedown', function(event, originPointer) {
	             *     console.log(event);
	             *     console.log(originPointer);
	             *     if (imageEditor.hasFilter('colorFilter')) {
	             *         imageEditor.applyFilter('colorFilter', {
	             *             x: parseInt(originPointer.x, 10),
	             *             y: parseInt(originPointer.y, 10)
	             *         });
	             *     }
	             * });
	             */
	            this.fire(events.MOUSE_DOWN, event, originPointer);
	        }

	        /**
	         * Add a 'addObject' command
	         * @param {Object} obj - Fabric object
	         * @private
	         */

	    }, {
	        key: '_pushAddObjectCommand',
	        value: function _pushAddObjectCommand(obj) {
	            var command = _command2.default.create(commands.ADD_OBJECT, this._graphics, obj);
	            this._invoker.pushUndoStack(command);
	        }

	        /**
	         * 'objectActivated' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectActivated',
	        value: function _onObjectActivated(props) {
	            /**
	             * The event when object is selected(aka activated).
	             * @event ImageEditor#objectActivated
	             * @param {ObjectProps} objectProps - object properties
	             * @example
	             * imageEditor.on('objectActivated', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             *     console.log(props.id);
	             * });
	             */
	            this.fire(events.OBJECT_ACTIVATED, props);
	        }

	        /**
	         * 'objectMoved' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectMoved',
	        value: function _onObjectMoved(props) {
	            /**
	             * The event when object is moved
	             * @event ImageEditor#objectMoved
	             * @param {ObjectProps} props - object properties
	             * @example
	             * imageEditor.on('objectMoved', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             * });
	             */
	            this.fire(events.OBJECT_MOVED, props);
	        }

	        /**
	         * 'objectScaled' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectScaled',
	        value: function _onObjectScaled(props) {
	            /**
	             * The event when scale factor is changed
	             * @event ImageEditor#objectScaled
	             * @param {ObjectProps} props - object properties
	             * @example
	             * imageEditor.on('objectScaled', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             * });
	             */
	            this.fire(events.OBJECT_SCALED, props);
	        }

	        /**
	         * Get current drawing mode
	         * @returns {string}
	         * @example
	         * // Image editor drawing mode
	         * //
	         * //    NORMAL: 'NORMAL'
	         * //    CROPPER: 'CROPPER'
	         * //    FREE_DRAWING: 'FREE_DRAWING'
	         * //    LINE_DRAWING: 'LINE_DRAWING'
	         * //    TEXT: 'TEXT'
	         * //
	         * if (imageEditor.getDrawingMode() === 'FREE_DRAWING') {
	         *     imageEditor.stopDrawingMode();
	         * }
	         */

	    }, {
	        key: 'getDrawingMode',
	        value: function getDrawingMode() {
	            return this._graphics.getDrawingMode();
	        }

	        /**
	         * Clear all objects
	         * @returns {Promise}
	         * @example
	         * imageEditor.clearObjects();
	         */

	    }, {
	        key: 'clearObjects',
	        value: function clearObjects() {
	            return this.execute(commands.CLEAR_OBJECTS);
	        }

	        /**
	         * Deactivate all objects
	         * @example
	         * imageEditor.deactivateAll();
	         */

	    }, {
	        key: 'deactivateAll',
	        value: function deactivateAll() {
	            this._graphics.deactivateAll();
	            this._graphics.renderAll();
	        }

	        /**
	         * discard selction
	         * @example
	         * imageEditor.discardSelection();
	         */

	    }, {
	        key: 'discardSelection',
	        value: function discardSelection() {
	            this._graphics.discardSelection();
	        }

	        /**
	         * selectable status change
	         * @param {boolean} selectable - selctable status
	         * @example
	         * imageEditor.changeSelectableAll(false); // or true
	         */

	    }, {
	        key: 'changeSelectableAll',
	        value: function changeSelectableAll(selectable) {
	            this._graphics.changeSelectableAll(selectable);
	        }

	        /**
	         * Invoke command
	         * @param {String} commandName - Command name
	         * @param {...*} args - Arguments for creating command
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: 'execute',
	        value: function execute(commandName) {
	            var _invoker;

	            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	                args[_key - 1] = arguments[_key];
	            }

	            // Inject an Graphics instance as first parameter
	            var theArgs = [this._graphics].concat(args);

	            return (_invoker = this._invoker).execute.apply(_invoker, [commandName].concat(theArgs));
	        }

	        /**
	         * Undo
	         * @returns {Promise}
	         * @example
	         * imageEditor.undo();
	         */

	    }, {
	        key: 'undo',
	        value: function undo() {
	            return this._invoker.undo();
	        }

	        /**
	         * Redo
	         * @returns {Promise}
	         * @example
	         * imageEditor.redo();
	         */

	    }, {
	        key: 'redo',
	        value: function redo() {
	            return this._invoker.redo();
	        }

	        /**
	         * Load image from file
	         * @param {File} imgFile - Image file
	         * @param {string} [imageName] - imageName
	         * @returns {Promise<SizeChange, ErrorMsg>}
	         * @example
	         * imageEditor.loadImageFromFile(file).then(result => {
	         *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
	         *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
	         * });
	         */

	    }, {
	        key: 'loadImageFromFile',
	        value: function loadImageFromFile(imgFile, imageName) {
	            if (!imgFile) {
	                return _promise2.default.reject(rejectMessages.invalidParameters);
	            }

	            var imgUrl = URL.createObjectURL(imgFile);
	            imageName = imageName || imgFile.name;

	            return this.loadImageFromURL(imgUrl, imageName).then(function (value) {
	                URL.revokeObjectURL(imgFile);

	                return value;
	            });
	        }

	        /**
	         * Load image from url
	         * @param {string} url - File url
	         * @param {string} imageName - imageName
	         * @returns {Promise<SizeChange, ErrorMsg>}
	         * @example
	         * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena').then(result => {
	         *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
	         *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
	         * });
	         */

	    }, {
	        key: 'loadImageFromURL',
	        value: function loadImageFromURL(url, imageName) {
	            if (!imageName || !url) {
	                return _promise2.default.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.LOAD_IMAGE, imageName, url);
	        }

	        /**
	         * Add image object on canvas
	         * @param {string} imgUrl - Image url to make object
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.addImageObject('path/fileName.jpg').then(objectProps => {
	         *     console.log(ojectProps.id);
	         * });
	         */

	    }, {
	        key: 'addImageObject',
	        value: function addImageObject(imgUrl) {
	            if (!imgUrl) {
	                return _promise2.default.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.ADD_IMAGE_OBJECT, imgUrl);
	        }

	        /**
	         * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	         * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'</I>
	         * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
	         *  @param {Number} [option.width] brush width
	         *  @param {String} [option.color] brush color
	         * @returns {boolean} true if success or false
	         * @example
	         * imageEditor.startDrawingMode('FREE_DRAWING', {
	         *      width: 10,
	         *      color: 'rgba(255,0,0,0.5)'
	         * });
	         */

	    }, {
	        key: 'startDrawingMode',
	        value: function startDrawingMode(mode, option) {
	            return this._graphics.startDrawingMode(mode, option);
	        }

	        /**
	         * Stop the current drawing mode and back to the 'NORMAL' mode
	         * @example
	         * imageEditor.stopDrawingMode();
	         */

	    }, {
	        key: 'stopDrawingMode',
	        value: function stopDrawingMode() {
	            this._graphics.stopDrawingMode();
	        }

	        /**
	         * Crop this image with rect
	         * @param {Object} rect crop rect
	         *  @param {Number} rect.left left position
	         *  @param {Number} rect.top top position
	         *  @param {Number} rect.width width
	         *  @param {Number} rect.height height
	         * @returns {Promise}
	         * @example
	         * imageEditor.crop(imageEditor.getCropzoneRect());
	         */

	    }, {
	        key: 'crop',
	        value: function crop(rect) {
	            var data = this._graphics.getCroppedImageData(rect);
	            if (!data) {
	                return _promise2.default.reject(rejectMessages.invalidParameters);
	            }

	            return this.loadImageFromURL(data.url, data.imageName);
	        }

	        /**
	         * Get the cropping rect
	         * @returns {Object}  {{left: number, top: number, width: number, height: number}} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            return this._graphics.getCropzoneRect();
	        }

	        /**
	         * Set the cropping rect
	         * @param {number} [mode] crop rect mode [1, 1.5, 1.3333333333333333, 1.25, 1.7777777777777777]
	         */

	    }, {
	        key: 'setCropzoneRect',
	        value: function setCropzoneRect(mode) {
	            this._graphics.setCropzoneRect(mode);
	        }

	        /**
	         * Flip
	         * @returns {Promise}
	         * @param {string} type - 'flipX' or 'flipY' or 'reset'
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @private
	         */

	    }, {
	        key: '_flip',
	        value: function _flip(type) {
	            return this.execute(commands.FLIP_IMAGE, type);
	        }

	        /**
	         * Flip x
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.flipX().then((status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'flipX',
	        value: function flipX() {
	            return this._flip('flipX');
	        }

	        /**
	         * Flip y
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.flipY().then(status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'flipY',
	        value: function flipY() {
	            return this._flip('flipY');
	        }

	        /**
	         * Reset flip
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.resetFlip().then(status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });;
	         */

	    }, {
	        key: 'resetFlip',
	        value: function resetFlip() {
	            return this._flip('reset');
	        }

	        /**
	         * @param {string} type - 'rotate' or 'setAngle'
	         * @param {number} angle - angle value (degree)
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @private
	         */

	    }, {
	        key: '_rotate',
	        value: function _rotate(type, angle) {
	            return this.execute(commands.ROTATE_IMAGE, type, angle);
	        }

	        /**
	         * Rotate image
	         * @returns {Promise}
	         * @param {number} angle - Additional angle to rotate image
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @example
	         * imageEditor.setAngle(10); // angle = 10
	         * imageEditor.rotate(10); // angle = 20
	         * imageEidtor.setAngle(5); // angle = 5
	         * imageEidtor.rotate(-95); // angle = -90
	         * imageEditor.rotate(10).then(status => {
	         *     console.log('angle: ', status.angle);
	         * })).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'rotate',
	        value: function rotate(angle) {
	            return this._rotate('rotate', angle);
	        }

	        /**
	         * Set angle
	         * @param {number} angle - Angle of image
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @example
	         * imageEditor.setAngle(10); // angle = 10
	         * imageEditor.rotate(10); // angle = 20
	         * imageEidtor.setAngle(5); // angle = 5
	         * imageEidtor.rotate(50); // angle = 55
	         * imageEidtor.setAngle(-40); // angle = -40
	         * imageEditor.setAngle(10).then(status => {
	         *     console.log('angle: ', status.angle);
	         * })).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'setAngle',
	        value: function setAngle(angle) {
	            return this._rotate('setAngle', angle);
	        }

	        /**
	         * Set drawing brush
	         * @param {Object} option brush option
	         *  @param {Number} option.width width
	         *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
	         * @example
	         * imageEditor.startDrawingMode('FREE_DRAWING');
	         * imageEditor.setBrush({
	         *     width: 12,
	         *     color: 'rgba(0, 0, 0, 0.5)'
	         * });
	         * imageEditor.setBrush({
	         *     width: 8,
	         *     color: 'FFFFFF'
	         * });
	         */

	    }, {
	        key: 'setBrush',
	        value: function setBrush(option) {
	            this._graphics.setBrush(option);
	        }

	        /**
	         * Set states of current drawing shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} [options] - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stoke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         * @example
	         * imageEditor.setDrawingShape('rect', {
	         *     fill: 'red',
	         *     width: 100,
	         *     height: 200
	         * });
	         * @example
	         * imageEditor.setDrawingShape('circle', {
	         *     fill: 'transparent',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100
	         * });
	         * @example
	         * imageEditor.setDrawingShape('triangle', { // When resizing, the shape keep the 1:1 ratio
	         *     width: 1,
	         *     height: 1,
	         *     isRegular: true
	         * });
	         * @example
	         * imageEditor.setDrawingShape('circle', { // When resizing, the shape keep the 1:1 ratio
	         *     rx: 10,
	         *     ry: 10,
	         *     isRegular: true
	         * });
	         */

	    }, {
	        key: 'setDrawingShape',
	        value: function setDrawingShape(type, options) {
	            this._graphics.setDrawingShape(type, options);
	        }

	        /**
	         * Add shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.left] - Shape x position
	         *      @param {number} [options.top] - Shape y position
	         *      @param {boolean} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.addShape('rect', {
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     width: 100,
	         *     height: 200,
	         *     left: 10,
	         *     top: 10,
	         *     isRegular: true
	         * });
	         * @example
	         * imageEditor.addShape('circle', {
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100,
	         *     isRegular: false
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addShape',
	        value: function addShape(type, options) {
	            options = options || {};

	            this._setPositions(options);

	            return this.execute(commands.ADD_SHAPE, type, options);
	        }

	        /**
	         * Change shape
	         * @param {number} id - object id
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {boolean} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         * @returns {Promise}
	         * @example
	         * // call after selecting shape object on canvas
	         * imageEditor.changeShape(id, { // change rectagle or triangle
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     width: 100,
	         *     height: 200
	         * });
	         * @example
	         * // call after selecting shape object on canvas
	         * imageEditor.changeShape(id, { // change circle
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100
	         * });
	         */

	    }, {
	        key: 'changeShape',
	        value: function changeShape(id, options) {
	            return this.execute(commands.CHANGE_SHAPE, id, options);
	        }

	        /**
	         * Add text on image
	         * @param {string} text - Initial input text
	         * @param {Object} [options] Options for generating text
	         *     @param {Object} [options.styles] Initial styles
	         *         @param {string} [options.styles.fill] Color
	         *         @param {string} [options.styles.fontFamily] Font type for text
	         *         @param {number} [options.styles.fontSize] Size
	         *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	         *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	         *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	         *     @param {{x: number, y: number}} [options.position] - Initial position
	         * @returns {Promise}
	         * @example
	         * imageEditor.addText('init text');
	         * @example
	         * imageEditor.addText('init text', {
	         *     styles: {
	         *         fill: '#000',
	         *         fontSize: 20,
	         *         fontWeight: 'bold'
	         *     },
	         *     position: {
	         *         x: 10,
	         *         y: 10
	         *     }
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addText',
	        value: function addText(text, options) {
	            text = text || '';
	            options = options || {};

	            return this.execute(commands.ADD_TEXT, text, options);
	        }

	        /**
	         * Change contents of selected text object on image
	         * @param {number} id - object id
	         * @param {string} text - Changing text
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.changeText(id, 'change text');
	         */

	    }, {
	        key: 'changeText',
	        value: function changeText(id, text) {
	            text = text || '';

	            return this.execute(commands.CHANGE_TEXT, id, text);
	        }

	        /**
	         * Set style
	         * @param {number} id - object id
	         * @param {Object} styleObj - text styles
	         *     @param {string} [styleObj.fill] Color
	         *     @param {string} [styleObj.fontFamily] Font type for text
	         *     @param {number} [styleObj.fontSize] Size
	         *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
	         *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Promise}
	         * @example
	         * imageEditor.changeTextStyle(id, {
	         *     fontStyle: 'italic'
	         * });
	         */

	    }, {
	        key: 'changeTextStyle',
	        value: function changeTextStyle(id, styleObj) {
	            return this.execute(commands.CHANGE_TEXT_STYLE, id, styleObj);
	        }

	        /**
	         * change text mode
	         * @param {string} type - change type
	         * @private
	         */

	    }, {
	        key: '_changeActivateMode',
	        value: function _changeActivateMode(type) {
	            if (type !== 'ICON' && this.getDrawingMode() !== type) {
	                this.startDrawingMode(type);
	            }
	        }

	        /**
	         * 'textChanged' event handler
	         * @param {Object} objectProps changed object properties
	         * @private
	         */

	    }, {
	        key: '_onTextChanged',
	        value: function _onTextChanged(objectProps) {
	            this.changeText(objectProps.id, objectProps.text);
	        }

	        /**
	         * 'iconCreateResize' event handler
	         * @param {Object} originPointer origin pointer
	         *  @param {Number} originPointer.x x position
	         *  @param {Number} originPointer.y y position
	         * @private
	         */

	    }, {
	        key: '_onIconCreateResize',
	        value: function _onIconCreateResize(originPointer) {
	            this.fire(events.ICON_CREATE_RESIZE, originPointer);
	        }

	        /**
	         * 'iconCreateEnd' event handler
	         * @param {Object} originPointer origin pointer
	         *  @param {Number} originPointer.x x position
	         *  @param {Number} originPointer.y y position
	         * @private
	         */

	    }, {
	        key: '_onIconCreateEnd',
	        value: function _onIconCreateEnd(originPointer) {
	            this.fire(events.ICON_CREATE_END, originPointer);
	        }

	        /**
	         * 'textEditing' event handler
	         * @private
	         */

	    }, {
	        key: '_onTextEditing',
	        value: function _onTextEditing() {
	            /**
	             * The event which starts to edit text object
	             * @event ImageEditor#textEditing
	             * @example
	             * imageEditor.on('textEditing', function() {
	             *     console.log('text editing');
	             * });
	             */
	            this.fire(events.TEXT_EDITING);
	        }

	        /**
	         * Mousedown event handler in case of 'TEXT' drawing mode
	         * @param {fabric.Event} event - Current mousedown event object
	         * @private
	         */

	    }, {
	        key: '_onAddText',
	        value: function _onAddText(event) {
	            /**
	             * The event when 'TEXT' drawing mode is enabled and click non-object area.
	             * @event ImageEditor#addText
	             * @param {Object} pos
	             *  @param {Object} pos.originPosition - Current position on origin canvas
	             *      @param {Number} pos.originPosition.x - x
	             *      @param {Number} pos.originPosition.y - y
	             *  @param {Object} pos.clientPosition - Current position on client area
	             *      @param {Number} pos.clientPosition.x - x
	             *      @param {Number} pos.clientPosition.y - y
	             * @example
	             * imageEditor.on('addText', function(pos) {
	             *     console.log('text position on canvas: ' + pos.originPosition);
	             *     console.log('text position on brwoser: ' + pos.clientPosition);
	             * });
	             */
	            this.fire(events.ADD_TEXT, {
	                originPosition: event.originPosition,
	                clientPosition: event.clientPosition
	            });
	        }

	        /**
	         * 'addObject' event handler
	         * @param {Object} objectProps added object properties
	         * @private
	         */

	    }, {
	        key: '_onAddObject',
	        value: function _onAddObject(objectProps) {
	            var obj = this._graphics.getObject(objectProps.id);
	            this._pushAddObjectCommand(obj);
	        }

	        /**
	         * 'addObjectAfter' event handler
	         * @param {Object} objectProps added object properties
	         * @private
	         */

	    }, {
	        key: '_onAddObjectAfter',
	        value: function _onAddObjectAfter(objectProps) {
	            this.fire(events.ADD_OBJECT_AFTER, objectProps);
	        }

	        /**
	         * 'selectionCleared' event handler
	         * @private
	         */

	    }, {
	        key: '_selectionCleared',
	        value: function _selectionCleared() {
	            this.fire(events.SELECTION_CLEARED);
	        }

	        /**
	         * 'selectionCreated' event handler
	         * @param {Object} eventTarget - Fabric object
	         * @private
	         */

	    }, {
	        key: '_selectionCreated',
	        value: function _selectionCreated(eventTarget) {
	            this.fire(events.SELECTION_CREATED, eventTarget);
	        }

	        /**
	         * Register custom icons
	         * @param {{iconType: string, pathValue: string}} infos - Infos to register icons
	         * @example
	         * imageEditor.registerIcons({
	         *     customIcon: 'M 0 0 L 20 20 L 10 10 Z',
	         *     customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
	         * });
	         */

	    }, {
	        key: 'registerIcons',
	        value: function registerIcons(infos) {
	            this._graphics.registerPaths(infos);
	        }

	        /**
	         * Change canvas cursor type
	         * @param {string} cursorType - cursor type
	         * @example
	         * imageEditor.changeCursor('crosshair');
	         */

	    }, {
	        key: 'changeCursor',
	        value: function changeCursor(cursorType) {
	            this._graphics.changeCursor(cursorType);
	        }

	        /**
	         * Add icon on canvas
	         * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
	         * @param {Object} options - Icon options
	         *      @param {string} [options.fill] - Icon foreground color
	         *      @param {number} [options.left] - Icon x position
	         *      @param {number} [options.top] - Icon y position
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.addIcon('arrow'); // The position is center on canvas
	         * @example
	         * imageEditor.addIcon('arrow', {
	         *     left: 100,
	         *     top: 100
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addIcon',
	        value: function addIcon(type, options) {
	            options = options || {};

	            this._setPositions(options);

	            return this.execute(commands.ADD_ICON, type, options);
	        }

	        /**
	         * Change icon color
	         * @param {number} id - object id
	         * @param {string} color - Color for icon
	         * @returns {Promise}
	         * @example
	         * imageEditor.changeIconColor(id, '#000000');
	         */

	    }, {
	        key: 'changeIconColor',
	        value: function changeIconColor(id, color) {
	            return this.execute(commands.CHANGE_ICON_COLOR, id, color);
	        }

	        /**
	         * Remove an object or group by id
	         * @param {number} id - object id
	         * @returns {Promise}
	         * @example
	         * imageEditor.removeObject(id);
	         */

	    }, {
	        key: 'removeObject',
	        value: function removeObject(id) {
	            return this.execute(commands.REMOVE_OBJECT, id);
	        }

	        /**
	         * Whether it has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return this._graphics.hasFilter(type);
	        }

	        /**
	         * Remove filter on canvas image
	         * @param {string} type - Filter type
	         * @returns {Promise<FilterResult, ErrorMsg>}
	         * @example
	         * imageEditor.removeFilter('Grayscale').then(obj => {
	         *     console.log('filterType: ', obj.type);
	         *     console.log('actType: ', obj.action);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'removeFilter',
	        value: function removeFilter(type) {
	            return this.execute(commands.REMOVE_FILTER, type);
	        }

	        /**
	         * Apply filter on canvas image
	         * @param {string} type - Filter type
	         * @param {Object} options - Options to apply filter
	         *  @param {number} options.maskObjId - masking image object id
	         * @returns {Promise<FilterResult, ErrorMsg>}
	         * @example
	         * imageEditor.applyFilter('Grayscale');
	         * @example
	         * imageEditor.applyFilter('mask', {maskObjId: id}).then(obj => {
	         *     console.log('filterType: ', obj.type);
	         *     console.log('actType: ', obj.action);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });;
	         */

	    }, {
	        key: 'applyFilter',
	        value: function applyFilter(type, options) {
	            return this.execute(commands.APPLY_FILTER, type, options);
	        }

	        /**
	         * Get data url
	         * @param {Object} options - options for toDataURL
	         *   @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
	         *   @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
	         *   @param {Number} [options.multiplier=1] Multiplier to scale by
	         *   @param {Number} [options.left] Cropping left offset. Introduced in fabric v1.2.14
	         *   @param {Number} [options.top] Cropping top offset. Introduced in fabric v1.2.14
	         *   @param {Number} [options.width] Cropping width. Introduced in fabric v1.2.14
	         *   @param {Number} [options.height] Cropping height. Introduced in fabric v1.2.14
	         * @returns {string} A DOMString containing the requested data URI
	         * @example
	         * imgEl.src = imageEditor.toDataURL();
	         *
	         * imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
	         *      imageEditor.addImageObject(imgUrl);
	         * });
	         */

	    }, {
	        key: 'toDataURL',
	        value: function toDataURL(options) {
	            return this._graphics.toDataURL(options);
	        }

	        /**
	         * Get image name
	         * @returns {string} image name
	         * @example
	         * console.log(imageEditor.getImageName());
	         */

	    }, {
	        key: 'getImageName',
	        value: function getImageName() {
	            return this._graphics.getImageName();
	        }

	        /**
	         * Clear undoStack
	         * @example
	         * imageEditor.clearUndoStack();
	         */

	    }, {
	        key: 'clearUndoStack',
	        value: function clearUndoStack() {
	            this._invoker.clearUndoStack();
	        }

	        /**
	         * Clear redoStack
	         * @example
	         * imageEditor.clearRedoStack();
	         */

	    }, {
	        key: 'clearRedoStack',
	        value: function clearRedoStack() {
	            this._invoker.clearRedoStack();
	        }

	        /**
	         * Whehter the undo stack is empty or not
	         * @returns {boolean}
	         * imageEditor.isEmptyUndoStack();
	         */

	    }, {
	        key: 'isEmptyUndoStack',
	        value: function isEmptyUndoStack() {
	            return this._invoker.isEmptyUndoStack();
	        }

	        /**
	         * Whehter the redo stack is empty or not
	         * @returns {boolean}
	         * imageEditor.isEmptyRedoStack();
	         */

	    }, {
	        key: 'isEmptyRedoStack',
	        value: function isEmptyRedoStack() {
	            return this._invoker.isEmptyRedoStack();
	        }

	        /**
	         * Resize canvas dimension
	         * @param {{width: number, height: number}} dimension - Max width & height
	         * @returns {Promise}
	         */

	    }, {
	        key: 'resizeCanvasDimension',
	        value: function resizeCanvasDimension(dimension) {
	            if (!dimension) {
	                return _promise2.default.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.RESIZE_CANVAS_DIMENSION, dimension);
	        }

	        /**
	         * Destroy
	         */

	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            var _this2 = this;

	            this.stopDrawingMode();
	            this._detachDomEvents();
	            this._graphics.destroy();
	            this._graphics = null;

	            forEach(this, function (value, key) {
	                _this2[key] = null;
	            }, this);
	        }

	        /**
	         * Set position
	         * @param {Object} options - Position options (left or top)
	         * @private
	         */

	    }, {
	        key: '_setPositions',
	        value: function _setPositions(options) {
	            var centerPosition = this._graphics.getCenter();

	            if (isUndefined(options.left)) {
	                options.left = centerPosition.left;
	            }

	            if (isUndefined(options.top)) {
	                options.top = centerPosition.top;
	            }
	        }

	        /**
	         * Set properties of active object
	         * @param {number} id - object id
	         * @param {Object} keyValue - key & value
	         * @returns {Promise}
	         * @example
	         * imageEditor.setObjectProperties(id, {
	         *     left:100,
	         *     top:100,
	         *     width: 200,
	         *     height: 200,
	         *     opacity: 0.5
	         * });
	         */

	    }, {
	        key: 'setObjectProperties',
	        value: function setObjectProperties(id, keyValue) {
	            return this.execute(commands.SET_OBJECT_PROPERTIES, id, keyValue);
	        }

	        /**
	         * Set properties of active object, Do not leave an invoke history.
	         * @param {number} id - object id
	         * @param {Object} keyValue - key & value
	         * @example
	         * imageEditor.setObjectPropertiesQuietly(id, {
	         *     left:100,
	         *     top:100,
	         *     width: 200,
	         *     height: 200,
	         *     opacity: 0.5
	         * });
	         */

	    }, {
	        key: 'setObjectPropertiesQuietly',
	        value: function setObjectPropertiesQuietly(id, keyValue) {
	            this._graphics.setObjectProperties(id, keyValue);
	        }

	        /**
	         * Get properties of active object corresponding key
	         * @param {number} id - object id
	         * @param {Array<string>|ObjectProps|string} keys - property's key
	         * @returns {ObjectProps} properties if id is valid or null
	         * @example
	         * var props = imageEditor.getObjectProperties(id, 'left');
	         * console.log(props);
	         * @example
	         * var props = imageEditor.getObjectProperties(id, ['left', 'top', 'width', 'height']);
	         * console.log(props);
	         * @example
	         * var props = imageEditor.getObjectProperties(id, {
	         *     left: null,
	         *     top: null,
	         *     width: null,
	         *     height: null,
	         *     opacity: null
	         * });
	         * console.log(props);
	         */

	    }, {
	        key: 'getObjectProperties',
	        value: function getObjectProperties(id, keys) {
	            var object = this._graphics.getObject(id);
	            if (!object) {
	                return null;
	            }

	            return this._graphics.getObjectProperties(id, keys);
	        }

	        /**
	         * Get the canvas size
	         * @returns {Object} {{width: number, height: number}} canvas size
	         * @example
	         * var canvasSize = imageEditor.getCanvasSize();
	         * console.log(canvasSize.width);
	         * console.height(canvasSize.height);
	         */

	    }, {
	        key: 'getCanvasSize',
	        value: function getCanvasSize() {
	            return this._graphics.getCanvasSize();
	        }

	        /**
	         * Get object position by originX, originY
	         * @param {number} id - object id
	         * @param {string} originX - can be 'left', 'center', 'right'
	         * @param {string} originY - can be 'top', 'center', 'bottom'
	         * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
	         * @example
	         * var position = imageEditor.getObjectPosition(id, 'left', 'top');
	         * console.log(position);
	         */

	    }, {
	        key: 'getObjectPosition',
	        value: function getObjectPosition(id, originX, originY) {
	            return this._graphics.getObjectPosition(id, originX, originY);
	        }

	        /**
	         * Set object position  by originX, originY
	         * @param {number} id - object id
	         * @param {Object} posInfo - position object
	         *  @param {number} posInfo.x - x position
	         *  @param {number} posInfo.y - y position
	         *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	         *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	         * @returns {Promise}
	         * @example
	         * // align the object to 'left', 'top'
	         * imageEditor.setObjectPosition(id, {
	         *     x: 0,
	         *     y: 0,
	         *     originX: 'left',
	         *     originY: 'top'
	         * });
	         * @example
	         * // align the object to 'right', 'top'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: canvasSize.width,
	         *     y: 0,
	         *     originX: 'right',
	         *     originY: 'top'
	         * });
	         * @example
	         * // align the object to 'left', 'bottom'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: 0,
	         *     y: canvasSize.height,
	         *     originX: 'left',
	         *     originY: 'bottom'
	         * });
	         * @example
	         * // align the object to 'right', 'bottom'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: canvasSize.width,
	         *     y: canvasSize.height,
	         *     originX: 'right',
	         *     originY: 'bottom'
	         * });
	         */

	    }, {
	        key: 'setObjectPosition',
	        value: function setObjectPosition(id, posInfo) {
	            return this.execute(commands.SET_OBJECT_POSITION, id, posInfo);
	        }
	    }]);

	    return ImageEditor;
	}();

	_action2.default.mixin(ImageEditor);
	CustomEvents.mixin(ImageEditor);

	module.exports = ImageEditor;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(50);
	__webpack_require__(54);
	module.exports = __webpack_require__(14).Promise;

/***/ }),
/* 5 */
/***/ (function(module, exports) {



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(7)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(10)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(8)
	  , defined   = __webpack_require__(9);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(11)
	  , $export        = __webpack_require__(12)
	  , redefine       = __webpack_require__(27)
	  , hide           = __webpack_require__(17)
	  , has            = __webpack_require__(28)
	  , Iterators      = __webpack_require__(29)
	  , $iterCreate    = __webpack_require__(30)
	  , setToStringTag = __webpack_require__(46)
	  , getPrototypeOf = __webpack_require__(48)
	  , ITERATOR       = __webpack_require__(47)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = true;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , core      = __webpack_require__(14)
	  , ctx       = __webpack_require__(15)
	  , hide      = __webpack_require__(17)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(16);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(18)
	  , createDesc = __webpack_require__(26);
	module.exports = __webpack_require__(22) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(19)
	  , IE8_DOM_DEFINE = __webpack_require__(21)
	  , toPrimitive    = __webpack_require__(25)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(22) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(20);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(22) && !__webpack_require__(23)(function(){
	  return Object.defineProperty(__webpack_require__(24)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(23)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(20)
	  , document = __webpack_require__(13).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(20);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17);

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(31)
	  , descriptor     = __webpack_require__(26)
	  , setToStringTag = __webpack_require__(46)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(17)(IteratorPrototype, __webpack_require__(47)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(19)
	  , dPs         = __webpack_require__(32)
	  , enumBugKeys = __webpack_require__(44)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(24)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(45).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(18)
	  , anObject = __webpack_require__(19)
	  , getKeys  = __webpack_require__(33);

	module.exports = __webpack_require__(22) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(34)
	  , enumBugKeys = __webpack_require__(44);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(28)
	  , toIObject    = __webpack_require__(35)
	  , arrayIndexOf = __webpack_require__(38)(false)
	  , IE_PROTO     = __webpack_require__(41)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(36)
	  , defined = __webpack_require__(9);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(37);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(35)
	  , toLength  = __webpack_require__(39)
	  , toIndex   = __webpack_require__(40);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(8)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(8)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(42)('keys')
	  , uid    = __webpack_require__(43);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(13)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 44 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(13).document && document.documentElement;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(18).f
	  , has = __webpack_require__(28)
	  , TAG = __webpack_require__(47)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(42)('wks')
	  , uid        = __webpack_require__(43)
	  , Symbol     = __webpack_require__(13).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(28)
	  , toObject    = __webpack_require__(49)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(9);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(51);
	var global        = __webpack_require__(13)
	  , hide          = __webpack_require__(17)
	  , Iterators     = __webpack_require__(29)
	  , TO_STRING_TAG = __webpack_require__(47)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(52)
	  , step             = __webpack_require__(53)
	  , Iterators        = __webpack_require__(29)
	  , toIObject        = __webpack_require__(35);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(10)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ }),
/* 52 */
/***/ (function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ }),
/* 53 */
/***/ (function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(11)
	  , global             = __webpack_require__(13)
	  , ctx                = __webpack_require__(15)
	  , classof            = __webpack_require__(55)
	  , $export            = __webpack_require__(12)
	  , isObject           = __webpack_require__(20)
	  , aFunction          = __webpack_require__(16)
	  , anInstance         = __webpack_require__(56)
	  , forOf              = __webpack_require__(57)
	  , speciesConstructor = __webpack_require__(61)
	  , task               = __webpack_require__(62).set
	  , microtask          = __webpack_require__(64)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;

	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(47)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();

	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(65)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(46)($Promise, PROMISE);
	__webpack_require__(66)(PROMISE);
	Wrapper = __webpack_require__(14)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(67)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(37)
	  , TAG = __webpack_require__(47)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ }),
/* 56 */
/***/ (function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(15)
	  , call        = __webpack_require__(58)
	  , isArrayIter = __webpack_require__(59)
	  , anObject    = __webpack_require__(19)
	  , toLength    = __webpack_require__(39)
	  , getIterFn   = __webpack_require__(60)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(19);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(29)
	  , ITERATOR   = __webpack_require__(47)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(55)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(29);
	module.exports = __webpack_require__(14).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(19)
	  , aFunction = __webpack_require__(16)
	  , SPECIES   = __webpack_require__(47)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(15)
	  , invoke             = __webpack_require__(63)
	  , html               = __webpack_require__(45)
	  , cel                = __webpack_require__(24)
	  , global             = __webpack_require__(13)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(37)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ }),
/* 63 */
/***/ (function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , macrotask = __webpack_require__(62).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(37)(process) == 'process';

	module.exports = function(){
	  var head, last, notify;

	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };

	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(17);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(13)
	  , core        = __webpack_require__(14)
	  , dP          = __webpack_require__(18)
	  , DESCRIPTORS = __webpack_require__(22)
	  , SPECIES     = __webpack_require__(47)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(47)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Invoker - invoke commands
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var eventNames = _consts2.default.eventNames,
	    rejectMessages = _consts2.default.rejectMessages;
	var isFunction = _tuiCodeSnippet2.default.isFunction,
	    isString = _tuiCodeSnippet2.default.isString,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;

	/**
	 * Invoker
	 * @class
	 * @ignore
	 */

	var Invoker = function () {
	    function Invoker() {
	        _classCallCheck(this, Invoker);

	        /**
	         * Undo stack
	         * @type {Array.<Command>}
	         * @private
	         */
	        this._undoStack = [];

	        /**
	         * Redo stack
	         * @type {Array.<Command>}
	         * @private
	         */
	        this._redoStack = [];

	        /**
	         * Lock-flag for executing command
	         * @type {boolean}
	         * @private
	         */
	        this._isLocked = false;
	    }

	    /**
	     * Invoke command execution
	     * @param {Command} command - Command
	     * @returns {Promise}
	     * @private
	     */


	    _createClass(Invoker, [{
	        key: '_invokeExecution',
	        value: function _invokeExecution(command) {
	            var _this = this;

	            this.lock();

	            var args = command.args;

	            if (!args) {
	                args = [];
	            }

	            return command.execute.apply(command, args).then(function (value) {
	                _this.pushUndoStack(command);
	                _this.unlock();
	                if (isFunction(command.executeCallback)) {
	                    command.executeCallback(value);
	                }

	                return value;
	            })['catch'](function (message) {
	                _this.unlock();

	                return _promise2.default.reject(message);
	            });
	        }

	        /**
	         * Invoke command undo
	         * @param {Command} command - Command
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: '_invokeUndo',
	        value: function _invokeUndo(command) {
	            var _this2 = this;

	            this.lock();

	            var args = command.args;

	            if (!args) {
	                args = [];
	            }

	            return command.undo.apply(command, args).then(function (value) {
	                _this2.pushRedoStack(command);
	                _this2.unlock();
	                if (isFunction(command.undoCallback)) {
	                    command.undoCallback(value);
	                }

	                return value;
	            })['catch'](function (message) {
	                _this2.unlock();

	                return _promise2.default.reject(message);
	            });
	        }

	        /**
	         * fire REDO_STACK_CHANGED event
	         * @private
	         */

	    }, {
	        key: '_fireRedoStackChanged',
	        value: function _fireRedoStackChanged() {
	            this.fire(eventNames.REDO_STACK_CHANGED, this._redoStack.length);
	        }

	        /**
	         * fire UNDO_STACK_CHANGED event
	         * @private
	         */

	    }, {
	        key: '_fireUndoStackChanged',
	        value: function _fireUndoStackChanged() {
	            this.fire(eventNames.UNDO_STACK_CHANGED, this._undoStack.length);
	        }

	        /**
	         * Lock this invoker
	         */

	    }, {
	        key: 'lock',
	        value: function lock() {
	            this._isLocked = true;
	        }

	        /**
	         * Unlock this invoker
	         */

	    }, {
	        key: 'unlock',
	        value: function unlock() {
	            this._isLocked = false;
	        }

	        /**
	         * Invoke command
	         * Store the command to the undoStack
	         * Clear the redoStack
	         * @param {String} commandName - Command name
	         * @param {...*} args - Arguments for creating command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'execute',
	        value: function execute() {
	            var _this3 = this;

	            if (this._isLocked) {
	                return _promise2.default.reject(rejectMessages.isLock);
	            }

	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                args[_key] = arguments[_key];
	            }

	            var command = args[0];

	            if (isString(command)) {
	                command = _command2.default.create.apply(_command2.default, args);
	            }

	            return this._invokeExecution(command).then(function (value) {
	                _this3.clearRedoStack();

	                return value;
	            });
	        }

	        /**
	         * Undo command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'undo',
	        value: function undo() {
	            var command = this._undoStack.pop();
	            var promise = void 0;
	            var message = '';

	            if (command && this._isLocked) {
	                this.pushUndoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyUndoStack()) {
	                    this._fireUndoStackChanged();
	                }
	                promise = this._invokeUndo(command);
	            } else {
	                message = rejectMessages.undo;
	                if (this._isLocked) {
	                    message = message + ' Because ' + rejectMessages.isLock;
	                }
	                promise = _promise2.default.reject(message);
	            }

	            return promise;
	        }

	        /**
	         * Redo command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'redo',
	        value: function redo() {
	            var command = this._redoStack.pop();
	            var promise = void 0;
	            var message = '';

	            if (command && this._isLocked) {
	                this.pushRedoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyRedoStack()) {
	                    this._fireRedoStackChanged();
	                }
	                promise = this._invokeExecution(command);
	            } else {
	                message = rejectMessages.redo;
	                if (this._isLocked) {
	                    message = message + ' Because ' + rejectMessages.isLock;
	                }
	                promise = _promise2.default.reject(message);
	            }

	            return promise;
	        }

	        /**
	         * Push undo stack
	         * @param {Command} command - command
	         * @param {boolean} [isSilent] - Fire event or not
	         */

	    }, {
	        key: 'pushUndoStack',
	        value: function pushUndoStack(command, isSilent) {
	            this._undoStack.push(command);
	            if (!isSilent) {
	                this._fireUndoStackChanged();
	            }
	        }

	        /**
	         * Push redo stack
	         * @param {Command} command - command
	         * @param {boolean} [isSilent] - Fire event or not
	         */

	    }, {
	        key: 'pushRedoStack',
	        value: function pushRedoStack(command, isSilent) {
	            this._redoStack.push(command);
	            if (!isSilent) {
	                this._fireRedoStackChanged();
	            }
	        }

	        /**
	         * Return whether the redoStack is empty
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isEmptyRedoStack',
	        value: function isEmptyRedoStack() {
	            return this._redoStack.length === 0;
	        }

	        /**
	         * Return whether the undoStack is empty
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isEmptyUndoStack',
	        value: function isEmptyUndoStack() {
	            return this._undoStack.length === 0;
	        }

	        /**
	         * Clear undoStack
	         */

	    }, {
	        key: 'clearUndoStack',
	        value: function clearUndoStack() {
	            if (!this.isEmptyUndoStack()) {
	                this._undoStack = [];
	                this._fireUndoStackChanged();
	            }
	        }

	        /**
	         * Clear redoStack
	         */

	    }, {
	        key: 'clearRedoStack',
	        value: function clearRedoStack() {
	            if (!this.isEmptyRedoStack()) {
	                this._redoStack = [];
	                this._fireRedoStackChanged();
	            }
	        }
	    }]);

	    return Invoker;
	}();

	CustomEvents.mixin(Invoker);
	module.exports = Invoker;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(70);

	var _command2 = _interopRequireDefault(_command);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commands = {};

	/**
	 * Create a command
	 * @param {string} name - Command name
	 * @param {...*} args - Arguments for creating command
	 * @returns {Command}
	 * @ignore
	 */
	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Command factory
	 */
	function create(name) {
	    var actions = commands[name];
	    if (actions) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        return new _command2.default(actions, args);
	    }

	    return null;
	}

	/**
	 * Register a command with name as a key
	 * @param {Object} command - {name:{string}, execute: {function}, undo: {function}}
	 * @param {string} command.name - command name
	 * @param {function} command.execute - executable function
	 * @param {function} command.undo - undo function
	 * @ignore
	 */
	function register(command) {
	    commands[command.name] = command;
	}

	module.exports = {
	    create: create,
	    register: register
	};

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Command interface
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _errorMessage = __webpack_require__(71);

	var _errorMessage2 = _interopRequireDefault(_errorMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createMessage = _errorMessage2.default.create;
	var errorTypes = _errorMessage2.default.types;

	/**
	 * Command class
	 * @class
	 * @param {{name:function, execute: function, undo: function,
	 *          executeCallback: function, undoCallback: function}} actions - Command actions
	 * @param {Array} args - passing arguments on execute, undo
	 * @ignore
	 */

	var Command = function () {
	  function Command(actions, args) {
	    _classCallCheck(this, Command);

	    /**
	     * command name
	     * @type {string}
	     */
	    this.name = actions.name;

	    /**
	     * arguments
	     * @type {Array}
	     */
	    this.args = args;

	    /**
	     * Execute function
	     * @type {function}
	     */
	    this.execute = actions.execute;

	    /**
	     * Undo function
	     * @type {function}
	     */
	    this.undo = actions.undo;

	    /**
	     * executeCallback
	     * @type {function}
	     */
	    this.executeCallback = actions.executeCallback || null;

	    /**
	     * undoCallback
	     * @type {function}
	     */
	    this.undoCallback = actions.undoCallback || null;

	    /**
	     * data for undo
	     * @type {Object}
	     */
	    this.undoData = {};
	  }

	  /**
	   * Execute action
	   * @param {Object.<string, Component>} compMap - Components injection
	   * @abstract
	   */


	  _createClass(Command, [{
	    key: 'execute',
	    value: function execute() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
	    }

	    /**
	     * Undo action
	     * @param {Object.<string, Component>} compMap - Components injection
	     * @abstract
	     */

	  }, {
	    key: 'undo',
	    value: function undo() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
	    }

	    /**
	     * Attach execute callabck
	     * @param {function} callback - Callback after execution
	     * @returns {Command} this
	     */

	  }, {
	    key: 'setExecuteCallback',
	    value: function setExecuteCallback(callback) {
	      this.executeCallback = callback;

	      return this;
	    }

	    /**
	     * Attach undo callback
	     * @param {function} callback - Callback after undo
	     * @returns {Command} this
	     */

	  }, {
	    key: 'setUndoCallback',
	    value: function setUndoCallback(callback) {
	      this.undoCallback = callback;

	      return this;
	    }
	  }]);

	  return Command;
	}();

	module.exports = Command;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _util = __webpack_require__(72);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Error-message factory
	 */
	var types = (0, _util.keyMirror)('UN_IMPLEMENTATION', 'NO_COMPONENT_NAME');
	var messages = {
	    UN_IMPLEMENTATION: 'Should implement a method: ',
	    NO_COMPONENT_NAME: 'Should set a component name'
	};
	var map = {
	    UN_IMPLEMENTATION: function UN_IMPLEMENTATION(methodName) {
	        return messages.UN_IMPLEMENTATION + methodName;
	    },
	    NO_COMPONENT_NAME: function NO_COMPONENT_NAME() {
	        return messages.NO_COMPONENT_NAME;
	    }
	};

	module.exports = {
	    types: _tuiCodeSnippet2.default.extend({}, types),

	    create: function create(type) {
	        type = type.toLowerCase();
	        var func = map[type];

	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        return func.apply(undefined, args);
	    }
	};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var min = Math.min,
	    max = Math.max; /**
	                     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                     * @fileoverview Util
	                     */

	var hostnameSent = false;

	module.exports = {

	    /**
	     * Clamp value
	     * @param {number} value - Value
	     * @param {number} minValue - Minimum value
	     * @param {number} maxValue - Maximum value
	     * @returns {number} clamped value
	     */
	    clamp: function clamp(value, minValue, maxValue) {
	        var temp = void 0;
	        if (minValue > maxValue) {
	            temp = minValue;
	            minValue = maxValue;
	            maxValue = temp;
	        }

	        return max(minValue, min(value, maxValue));
	    },


	    /**
	     * Make key-value object from arguments
	     * @returns {object.<string, string>}
	     */
	    keyMirror: function keyMirror() {
	        var obj = {};

	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }

	        (0, _tuiCodeSnippet.forEach)(args, function (key) {
	            obj[key] = key;
	        });

	        return obj;
	    },


	    /**
	     * Make CSSText
	     * @param {Object} styleObj - Style info object
	     * @returns {string} Connected string of style
	     */
	    makeStyleText: function makeStyleText(styleObj) {
	        var styleStr = '';

	        (0, _tuiCodeSnippet.forEach)(styleObj, function (value, prop) {
	            styleStr += prop + ': ' + value + ';';
	        });

	        return styleStr;
	    },


	    /**
	     * Get object's properties
	     * @param {Object} obj - object
	     * @param {Array} keys - keys
	     * @returns {Object} properties object
	     */
	    getProperties: function getProperties(obj, keys) {
	        var props = {};
	        var length = keys.length;

	        var i = 0;
	        var key = void 0;

	        for (i = 0; i < length; i += 1) {
	            key = keys[i];
	            props[key] = obj[key];
	        }

	        return props;
	    },


	    /**
	     * ParseInt simpliment
	     * @param {number} value - Value
	     * @returns {number}
	     */
	    toInteger: function toInteger(value) {
	        return parseInt(value, 10);
	    },


	    /**
	     * String to camelcase string
	     * @param {string} targetString - change target
	     * @returns {string}
	     * @private
	     */
	    toCamelCase: function toCamelCase(targetString) {
	        return targetString.replace(/-([a-z])/g, function ($0, $1) {
	            return $1.toUpperCase();
	        });
	    },


	    /**
	     * Check browser file api support
	     * @returns {boolean}
	     * @private
	     */
	    isSupportFileApi: function isSupportFileApi() {
	        return !!(window.File && window.FileList && window.FileReader);
	    },


	    /**
	     * hex to rgb
	     * @param {string} color - hex color
	     * @param {string} alpha - color alpha value
	     * @returns {string} rgb expression
	     */
	    getRgb: function getRgb(color, alpha) {
	        if (color.length === 4) {
	            color = '' + color + color.slice(1, 4);
	        }
	        var r = parseInt(color.slice(1, 3), 16);
	        var g = parseInt(color.slice(3, 5), 16);
	        var b = parseInt(color.slice(5, 7), 16);
	        var a = alpha || 1;

	        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
	    },


	    /**
	     * send hostname
	     */
	    sendHostName: function sendHostName() {
	        if (hostnameSent) {
	            return;
	        }
	        hostnameSent = true;

	        (0, _tuiCodeSnippet.sendHostname)('image-editor', 'UA-129999381-1');
	    },


	    /**
	     * Apply css resource
	     * @param {string} styleBuffer - serialized css text
	     * @param {string} tagId - style tag id
	     */
	    styleLoad: function styleLoad(styleBuffer, tagId) {
	        var _document$getElements = document.getElementsByTagName('head'),
	            head = _document$getElements[0];

	        var linkElement = document.createElement('link');
	        var styleData = encodeURIComponent(styleBuffer);
	        if (tagId) {
	            linkElement.id = tagId;
	            // linkElement.id = 'tui-image-editor-theme-style';
	        }
	        linkElement.setAttribute('rel', 'stylesheet');
	        linkElement.setAttribute('type', 'text/css');
	        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + styleData);
	        head.appendChild(linkElement);
	    },


	    /**
	     * Get selector
	     * @param {HTMLElement} targetElement - target element
	     * @returns {Function} selector
	     */
	    getSelector: function getSelector(targetElement) {
	        return function (str) {
	            return targetElement.querySelector(str);
	        };
	    },


	    /**
	     * Change base64 to blob
	     * @param {String} data - base64 string data
	     * @returns {Blob} Blob Data
	     */
	    base64ToBlob: function base64ToBlob(data) {
	        var rImageType = /data:(image\/.+);base64,/;
	        var mimeString = '';
	        var raw = void 0,
	            uInt8Array = void 0,
	            i = void 0;

	        raw = data.replace(rImageType, function (header, imageType) {
	            mimeString = imageType;

	            return '';
	        });

	        raw = atob(raw);
	        var rawLength = raw.length;
	        uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

	        for (i = 0; i < rawLength; i += 1) {
	            uInt8Array[i] = raw.charCodeAt(i);
	        }

	        return new Blob([uInt8Array], { type: mimeString });
	    }
	};

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	    /**
	     * Component names
	     * @type {Object.<string, string>}
	     */
	    componentNames: _util2.default.keyMirror('IMAGE_LOADER', 'CROPPER', 'FLIP', 'ROTATION', 'FREE_DRAWING', 'LINE', 'TEXT', 'ICON', 'FILTER', 'SHAPE'),

	    /**
	     * Command names
	     * @type {Object.<string, string>}
	     */
	    commandNames: {
	        'CLEAR_OBJECTS': 'clearObjects',
	        'LOAD_IMAGE': 'loadImage',
	        'FLIP_IMAGE': 'flip',
	        'ROTATE_IMAGE': 'rotate',
	        'ADD_OBJECT': 'addObject',
	        'REMOVE_OBJECT': 'removeObject',
	        'APPLY_FILTER': 'applyFilter',
	        'REMOVE_FILTER': 'removeFilter',
	        'ADD_ICON': 'addIcon',
	        'CHANGE_ICON_COLOR': 'changeIconColor',
	        'ADD_SHAPE': 'addShape',
	        'CHANGE_SHAPE': 'changeShape',
	        'ADD_TEXT': 'addText',
	        'CHANGE_TEXT': 'changeText',
	        'CHANGE_TEXT_STYLE': 'changeTextStyle',
	        'ADD_IMAGE_OBJECT': 'addImageObject',
	        'RESIZE_CANVAS_DIMENSION': 'resizeCanvasDimension',
	        'SET_OBJECT_PROPERTIES': 'setObjectProperties',
	        'SET_OBJECT_POSITION': 'setObjectPosition'
	    },

	    /**
	     * Event names
	     * @type {Object.<string, string>}
	     */
	    eventNames: {
	        OBJECT_ACTIVATED: 'objectActivated',
	        OBJECT_MOVED: 'objectMoved',
	        OBJECT_SCALED: 'objectScaled',
	        OBJECT_CREATED: 'objectCreated',
	        TEXT_EDITING: 'textEditing',
	        TEXT_CHANGED: 'textChanged',
	        ICON_CREATE_RESIZE: 'iconCreateResize',
	        ICON_CREATE_END: 'iconCreateEnd',
	        ADD_TEXT: 'addText',
	        ADD_OBJECT: 'addObject',
	        ADD_OBJECT_AFTER: 'addObjectAfter',
	        MOUSE_DOWN: 'mousedown',
	        MOUSE_UP: 'mouseup',
	        MOUSE_MOVE: 'mousemove',
	        // UNDO/REDO Events
	        REDO_STACK_CHANGED: 'redoStackChanged',
	        UNDO_STACK_CHANGED: 'undoStackChanged',
	        SELECTION_CLEARED: 'selectionCleared',
	        SELECTION_CREATED: 'selectionCreated'
	    },

	    /**
	     * Editor states
	     * @type {Object.<string, string>}
	     */
	    drawingModes: _util2.default.keyMirror('NORMAL', 'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'),

	    /**
	     * Shortcut key values
	     * @type {Object.<string, number>}
	     */
	    keyCodes: {
	        Z: 90,
	        Y: 89,
	        SHIFT: 16,
	        BACKSPACE: 8,
	        DEL: 46
	    },

	    /**
	     * Fabric object options
	     * @type {Object.<string, Object>}
	     */
	    fObjectOptions: {
	        SELECTION_STYLE: {
	            borderColor: 'red',
	            cornerColor: 'green',
	            cornerSize: 10,
	            originX: 'center',
	            originY: 'center',
	            transparentCorners: false
	        }
	    },

	    /**
	     * Promise reject messages
	     * @type {Object.<string, string>}
	     */
	    rejectMessages: {
	        addedObject: 'The object is already added.',
	        flip: 'The flipX and flipY setting values are not changed.',
	        invalidDrawingMode: 'This operation is not supported in the drawing mode.',
	        invalidParameters: 'Invalid parameters.',
	        isLock: 'The executing command state is locked.',
	        loadImage: 'The background image is empty.',
	        loadingImageFailed: 'Invalid image loaded.',
	        noActiveObject: 'There is no active object.',
	        noObject: 'The object is not in canvas.',
	        redo: 'The promise of redo command is reject.',
	        rotation: 'The current angle is same the old angle.',
	        undo: 'The promise of undo command is reject.',
	        unsupportedOperation: 'Unsupported operation.',
	        unsupportedType: 'Unsupported object type.'
	    },

	    /**
	     * Default icon menu svg path
	     * @type {Object.<string, string>}
	     */
	    defaultIconPath: {
	        'icon-arrow': 'M40 12V0l24 24-24 24V36H0V12h40z',
	        'icon-arrow-2': 'M49,32 H3 V22 h46 l-18,-18 h12 l23,23 L43,50 h-12 l18,-18  z ',
	        'icon-arrow-3': 'M43.349998,27 L17.354,53 H1.949999 l25.996,-26 L1.949999,1 h15.404 L43.349998,27  z ',
	        'icon-star': 'M35,54.557999 l-19.912001,10.468 l3.804,-22.172001 l-16.108,-15.7 l22.26,-3.236 L35,3.746 l9.956,20.172001 l22.26,3.236 l-16.108,15.7 l3.804,22.172001  z ',
	        'icon-star-2': 'M17,31.212 l-7.194,4.08 l-4.728,-6.83 l-8.234,0.524 l-1.328,-8.226 l-7.644,-3.14 l2.338,-7.992 l-5.54,-6.18 l5.54,-6.176 l-2.338,-7.994 l7.644,-3.138 l1.328,-8.226 l8.234,0.522 l4.728,-6.83 L17,-24.312 l7.194,-4.08 l4.728,6.83 l8.234,-0.522 l1.328,8.226 l7.644,3.14 l-2.338,7.992 l5.54,6.178 l-5.54,6.178 l2.338,7.992 l-7.644,3.14 l-1.328,8.226 l-8.234,-0.524 l-4.728,6.83  z ',
	        'icon-polygon': 'M3,31 L19,3 h32 l16,28 l-16,28 H19  z ',
	        'icon-location': 'M24 62C8 45.503 0 32.837 0 24 0 10.745 10.745 0 24 0s24 10.745 24 24c0 8.837-8 21.503-24 38zm0-28c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z',
	        'icon-heart': 'M49.994999,91.349998 l-6.96,-6.333 C18.324001,62.606995 2.01,47.829002 2.01,29.690998 C2.01,14.912998 13.619999,3.299999 28.401001,3.299999 c8.349,0 16.362,5.859 21.594,12 c5.229,-6.141 13.242001,-12 21.591,-12 c14.778,0 26.390999,11.61 26.390999,26.390999 c0,18.138 -16.314001,32.916 -41.025002,55.374001 l-6.96,6.285  z ',
	        'icon-bubble': 'M44 48L34 58V48H12C5.373 48 0 42.627 0 36V12C0 5.373 5.373 0 12 0h40c6.627 0 12 5.373 12 12v24c0 6.627-5.373 12-12 12h-8z'
	    },

	    defaultRotateRangeValus: {
	        realTimeEvent: true,
	        min: -360,
	        max: 360,
	        value: 0
	    },

	    defaultDrawRangeValus: {
	        min: 5,
	        max: 100,
	        value: 20
	    },

	    defaultShapeStrokeValus: {
	        realTimeEvent: false,
	        min: 2,
	        max: 300,
	        value: 3
	    },

	    defaultTextRangeValus: {
	        realTimeEvent: true,
	        min: 10,
	        max: 100,
	        value: 50
	    },

	    defaultFilterRangeValus: {
	        tintOpacityRange: {
	            min: 0,
	            max: 1,
	            value: 0.7
	        },
	        removewhiteThresholdRange: {
	            min: 0,
	            max: 255,
	            value: 60
	        },
	        removewhiteDistanceRange: {
	            min: 0,
	            max: 255,
	            value: 10
	        },
	        gradientTransparencyRange: {
	            min: 0,
	            max: 255,
	            value: 100
	        },
	        brightnessRange: {
	            min: -255,
	            max: 255,
	            value: 100
	        },
	        noiseRange: {
	            min: 0,
	            max: 1000,
	            value: 100
	        },
	        pixelateRange: {
	            min: 2,
	            max: 20,
	            value: 4
	        },
	        colorfilterThresholeRange: {
	            min: 0,
	            max: 255,
	            value: 45
	        }
	    }
	}; /**
	    * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	    * @fileoverview Constants
	    */

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	var _mainContainer = __webpack_require__(75);

	var _mainContainer2 = _interopRequireDefault(_mainContainer);

	var _controls = __webpack_require__(76);

	var _controls2 = _interopRequireDefault(_controls);

	var _theme = __webpack_require__(77);

	var _theme2 = _interopRequireDefault(_theme);

	var _shape = __webpack_require__(80);

	var _shape2 = _interopRequireDefault(_shape);

	var _crop = __webpack_require__(86);

	var _crop2 = _interopRequireDefault(_crop);

	var _flip = __webpack_require__(88);

	var _flip2 = _interopRequireDefault(_flip);

	var _rotate = __webpack_require__(90);

	var _rotate2 = _interopRequireDefault(_rotate);

	var _text = __webpack_require__(92);

	var _text2 = _interopRequireDefault(_text);

	var _mask = __webpack_require__(94);

	var _mask2 = _interopRequireDefault(_mask);

	var _icon = __webpack_require__(96);

	var _icon2 = _interopRequireDefault(_icon);

	var _draw = __webpack_require__(98);

	var _draw2 = _interopRequireDefault(_draw);

	var _filter = __webpack_require__(100);

	var _filter2 = _interopRequireDefault(_filter);

	var _locale = __webpack_require__(102);

	var _locale2 = _interopRequireDefault(_locale);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SUB_UI_COMPONENT = {
	    Shape: _shape2.default,
	    Crop: _crop2.default,
	    Flip: _flip2.default,
	    Rotate: _rotate2.default,
	    Text: _text2.default,
	    Mask: _mask2.default,
	    Icon: _icon2.default,
	    Draw: _draw2.default,
	    Filter: _filter2.default
	};

	var BI_EXPRESSION_MINSIZE_WHEN_TOP_POSITION = '1300';

	/**
	 * Ui class
	 * @class
	 * @param {string|HTMLElement} element - Wrapper's element or selector
	 * @param {Object} [options] - Ui setting options
	 *   @param {number} option.loadImage - Init default load image
	 *   @param {number} option.initMenu - Init start menu
	 *   @param {Boolean} [option.menuBarPosition=bottom] - Let
	 *   @param {Boolean} [option.applyCropSelectionStyle=false] - Let
	 *   @param {Object} [options.uiSize] - ui size of editor
	 *     @param {string} options.uiSize.width - width of ui
	 *     @param {string} options.uiSize.height - height of ui
	 * @param {Objecdt} actions - ui action instance
	 */

	var Ui = function () {
	    function Ui(element, options, actions) {
	        _classCallCheck(this, Ui);

	        this.options = this._initializeOption(options);
	        this._actions = actions;
	        this.submenu = false;
	        this.imageSize = {};
	        this.uiSize = {};
	        this._locale = new _locale2.default(this.options.locale);
	        this.theme = new _theme2.default(this.options.theme);

	        this._submenuChangeTransection = false;
	        this._selectedElement = null;
	        this._mainElement = null;
	        this._editorElementWrap = null;
	        this._editorElement = null;
	        this._menuElement = null;
	        this._subMenuElement = null;
	        this._makeUiElement(element);
	        this._setUiSize();
	        this._initMenuEvent = false;

	        this._els = {
	            'undo': this._menuElement.querySelector('#tie-btn-undo'),
	            'redo': this._menuElement.querySelector('#tie-btn-redo'),
	            'reset': this._menuElement.querySelector('#tie-btn-reset'),
	            'delete': this._menuElement.querySelector('#tie-btn-delete'),
	            'deleteAll': this._menuElement.querySelector('#tie-btn-delete-all'),
	            'download': this._selectedElement.querySelectorAll('.tui-image-editor-download-btn'),
	            'load': this._selectedElement.querySelectorAll('.tui-image-editor-load-btn')
	        };

	        this._makeSubMenu();
	    }

	    /**
	     * Set Default Selection for includeUI
	     * @param {Object} option - imageEditor options
	     * @returns {Object} - extends selectionStyle option
	     * @ignore
	     */


	    _createClass(Ui, [{
	        key: 'setUiDefaultSelectionStyle',
	        value: function setUiDefaultSelectionStyle(option) {
	            return _tuiCodeSnippet2.default.extend({
	                applyCropSelectionStyle: true,
	                applyGroupSelectionStyle: true,
	                selectionStyle: {
	                    cornerStyle: 'circle',
	                    cornerSize: 16,
	                    cornerColor: '#fff',
	                    cornerStrokeColor: '#fff',
	                    transparentCorners: false,
	                    lineWidth: 2,
	                    borderColor: '#fff'
	                }
	            }, option);
	        }

	        /**
	         * Change editor size
	         * @param {Object} resizeInfo - ui & image size info
	         *   @param {Object} resizeInfo.uiSize - image size dimension
	         *     @param {Number} resizeInfo.uiSize.width - ui width
	         *     @param {Number} resizeInfo.uiSize.height - ui height
	         *   @param {Object} resizeInfo.imageSize - image size dimension
	         *     @param {Number} resizeInfo.imageSize.oldWidth - old width
	         *     @param {Number} resizeInfo.imageSize.oldHeight - old height
	         *     @param {Number} resizeInfo.imageSize.newWidth - new width
	         *     @param {Number} resizeInfo.imageSize.newHeight - new height
	         * @example
	         * // Change the image size and ui size, and change the affected ui state together.
	         * imageEditor.ui.resizeEditor({
	         *     imageSize: {oldWidth: 100, oldHeight: 100, newWidth: 700, newHeight: 700},
	         *     uiSize: {width: 1000, height: 1000}
	         * });
	         * @example
	         * // Apply the ui state while preserving the previous attribute (for example, if responsive Ui)
	         * imageEditor.ui.resizeEditor();
	         */

	    }, {
	        key: 'resizeEditor',
	        value: function resizeEditor() {
	            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	                uiSize = _ref.uiSize,
	                _ref$imageSize = _ref.imageSize,
	                imageSize = _ref$imageSize === undefined ? this.imageSize : _ref$imageSize;

	            if (imageSize !== this.imageSize) {
	                this.imageSize = imageSize;
	            }
	            if (uiSize) {
	                this._setUiSize(uiSize);
	            }

	            var _getEditorDimension2 = this._getEditorDimension(),
	                width = _getEditorDimension2.width,
	                height = _getEditorDimension2.height;

	            var editorElementStyle = this._editorElement.style;
	            var menuBarPosition = this.options.menuBarPosition;


	            editorElementStyle.height = height + 'px';
	            editorElementStyle.width = width + 'px';

	            this._setEditorPosition(menuBarPosition);

	            this._editorElementWrap.style.bottom = '0px';
	            this._editorElementWrap.style.top = '0px';
	            this._editorElementWrap.style.left = '0px';
	            this._editorElementWrap.style.width = '100%';

	            var selectElementClassList = this._selectedElement.classList;

	            if (menuBarPosition === 'top' && this._selectedElement.offsetWidth < BI_EXPRESSION_MINSIZE_WHEN_TOP_POSITION) {
	                selectElementClassList.add('tui-image-editor-top-optimization');
	            } else {
	                selectElementClassList.remove('tui-image-editor-top-optimization');
	            }
	        }

	        /**
	         * Change undo button status
	         * @param {Boolean} enableStatus - enabled status
	         * @ignore
	         */

	    }, {
	        key: 'changeUndoButtonStatus',
	        value: function changeUndoButtonStatus(enableStatus) {
	            if (enableStatus) {
	                this._els.undo.classList.add('enabled');
	            } else {
	                this._els.undo.classList.remove('enabled');
	            }
	        }

	        /**
	         * Change redo button status
	         * @param {Boolean} enableStatus - enabled status
	         * @ignore
	         */

	    }, {
	        key: 'changeRedoButtonStatus',
	        value: function changeRedoButtonStatus(enableStatus) {
	            if (enableStatus) {
	                this._els.redo.classList.add('enabled');
	            } else {
	                this._els.redo.classList.remove('enabled');
	            }
	        }

	        /**
	         * Change reset button status
	         * @param {Boolean} enableStatus - enabled status
	         * @ignore
	         */

	    }, {
	        key: 'changeResetButtonStatus',
	        value: function changeResetButtonStatus(enableStatus) {
	            if (enableStatus) {
	                this._els.reset.classList.add('enabled');
	            } else {
	                this._els.reset.classList.remove('enabled');
	            }
	        }

	        /**
	         * Change delete-all button status
	         * @param {Boolean} enableStatus - enabled status
	         * @ignore
	         */

	    }, {
	        key: 'changeDeleteAllButtonEnabled',
	        value: function changeDeleteAllButtonEnabled(enableStatus) {
	            if (enableStatus) {
	                this._els.deleteAll.classList.add('enabled');
	            } else {
	                this._els.deleteAll.classList.remove('enabled');
	            }
	        }

	        /**
	         * Change delete button status
	         * @param {Boolean} enableStatus - enabled status
	         * @ignore
	         */

	    }, {
	        key: 'changeDeleteButtonEnabled',
	        value: function changeDeleteButtonEnabled(enableStatus) {
	            if (enableStatus) {
	                this._els['delete'].classList.add('enabled');
	            } else {
	                this._els['delete'].classList.remove('enabled');
	            }
	        }

	        /**
	         * Change delete button status
	         * @param {Object} [options] - Ui setting options
	         *   @param {object} [option.loadImage] - Init default load image
	         *   @param {string} [option.initMenu] - Init start menu
	         *   @param {string} [option.menuBarPosition=bottom] - Let
	         *   @param {boolean} [option.applyCropSelectionStyle=false] - Let
	         * @returns {Object} initialize option
	         * @private
	         */

	    }, {
	        key: '_initializeOption',
	        value: function _initializeOption(options) {
	            return _tuiCodeSnippet2.default.extend({
	                loadImage: {
	                    path: '',
	                    name: ''
	                },
	                locale: {},
	                menuIconPath: '',
	                menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
	                initMenu: '',
	                uiSize: {
	                    width: '100%',
	                    height: '100%'
	                },
	                menuBarPosition: 'bottom'
	            }, options);
	        }

	        /**
	         * Set ui container size
	         * @param {Object} uiSize - ui dimension
	         *   @param {number} width - width
	         *   @param {number} height - height
	         * @private
	         */

	    }, {
	        key: '_setUiSize',
	        value: function _setUiSize() {
	            var uiSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.uiSize;

	            var elementDimension = this._selectedElement.style;
	            elementDimension.width = uiSize.width;
	            elementDimension.height = uiSize.height;
	        }

	        /**
	         * Make submenu dom element
	         * @private
	         */

	    }, {
	        key: '_makeSubMenu',
	        value: function _makeSubMenu() {
	            var _this = this;

	            _tuiCodeSnippet2.default.forEach(this.options.menu, function (menuName) {
	                var SubComponentClass = SUB_UI_COMPONENT[menuName.replace(/^[a-z]/, function ($0) {
	                    return $0.toUpperCase();
	                })];

	                // make menu element
	                _this._makeMenuElement(menuName);

	                // menu btn element
	                _this._els[menuName] = _this._menuElement.querySelector('#tie-btn-' + menuName);

	                // submenu ui instance
	                _this[menuName] = new SubComponentClass(_this._subMenuElement, {
	                    locale: _this._locale,
	                    iconStyle: _this.theme.getStyle('submenu.icon'),
	                    menuBarPosition: _this.options.menuBarPosition
	                });
	            });
	        }

	        /**
	         * Make primary ui dom element
	         * @param {string|HTMLElement} element - Wrapper's element or selector
	         * @private
	         */

	    }, {
	        key: '_makeUiElement',
	        value: function _makeUiElement(element) {
	            var selectedElement = void 0;

	            window.snippet = _tuiCodeSnippet2.default;

	            if (element.nodeType) {
	                selectedElement = element;
	            } else {
	                selectedElement = document.querySelector(element);
	            }
	            var selector = _util2.default.getSelector(selectedElement);

	            selectedElement.classList.add('tui-image-editor-container');
	            selectedElement.innerHTML = (0, _controls2.default)({
	                locale: this._locale,
	                biImage: this.theme.getStyle('common.bi'),
	                iconStyle: this.theme.getStyle('menu.icon'),
	                loadButtonStyle: this.theme.getStyle('loadButton'),
	                downloadButtonStyle: this.theme.getStyle('downloadButton')
	            }) + (0, _mainContainer2.default)({
	                locale: this._locale,
	                biImage: this.theme.getStyle('common.bi'),
	                commonStyle: this.theme.getStyle('common'),
	                headerStyle: this.theme.getStyle('header'),
	                loadButtonStyle: this.theme.getStyle('loadButton'),
	                downloadButtonStyle: this.theme.getStyle('downloadButton'),
	                submenuStyle: this.theme.getStyle('submenu')
	            });

	            this._selectedElement = selectedElement;
	            this._selectedElement.classList.add(this.options.menuBarPosition);

	            this._mainElement = selector('.tui-image-editor-main');
	            this._editorElementWrap = selector('.tui-image-editor-wrap');
	            this._editorElement = selector('.tui-image-editor');
	            this._menuElement = selector('.tui-image-editor-menu');
	            this._subMenuElement = selector('.tui-image-editor-submenu');
	        }

	        /**
	         * Make menu ui dom element
	         * @param {string} menuName - menu name
	         * @private
	         */

	    }, {
	        key: '_makeMenuElement',
	        value: function _makeMenuElement(menuName) {
	            var btnElement = document.createElement('li');

	            var _theme$getStyle = this.theme.getStyle('menu.icon'),
	                normal = _theme$getStyle.normal,
	                active = _theme$getStyle.active,
	                hover = _theme$getStyle.hover;

	            var menuItemHtml = '\n            <svg class="svg_ic-menu">\n                <use xlink:href="' + normal.path + '#' + normal.name + '-ic-' + menuName + '" class="normal"/>\n                <use xlink:href="' + active.path + '#' + active.name + '-ic-' + menuName + '" class="active"/>\n                <use xlink:href="' + hover.path + '#' + hover.name + '-ic-' + menuName + '" class="hover"/>\n            </svg>\n        ';

	            btnElement.id = 'tie-btn-' + menuName;
	            btnElement.className = 'tui-image-editor-item normal';
	            btnElement.title = this._locale.localize(menuName.replace(/^[a-z]/g, function ($0) {
	                return $0.toUpperCase();
	            }));
	            btnElement.innerHTML = menuItemHtml;

	            this._menuElement.appendChild(btnElement);
	        }

	        /**
	         * Add help action event
	         * @param {string} helpName - help menu name
	         * @private
	         */

	    }, {
	        key: '_addHelpActionEvent',
	        value: function _addHelpActionEvent(helpName) {
	            var _this2 = this;

	            this._els[helpName].addEventListener('click', function () {
	                _this2._actions.main[helpName]();
	            });
	        }

	        /**
	         * Add download event
	         * @private
	         */

	    }, {
	        key: '_addDownloadEvent',
	        value: function _addDownloadEvent() {
	            var _this3 = this;

	            _tuiCodeSnippet2.default.forEach(this._els.download, function (element) {
	                element.addEventListener('click', function () {
	                    _this3._actions.main.download();
	                });
	            });
	        }

	        /**
	         * Add load event
	         * @private
	         */

	    }, {
	        key: '_addLoadEvent',
	        value: function _addLoadEvent() {
	            var _this4 = this;

	            _tuiCodeSnippet2.default.forEach(this._els.load, function (element) {
	                element.addEventListener('change', function (event) {
	                    _this4._actions.main.load(event.target.files[0]);
	                });
	            });
	        }

	        /**
	         * Add menu event
	         * @param {string} menuName - menu name
	         * @private
	         */

	    }, {
	        key: '_addMenuEvent',
	        value: function _addMenuEvent(menuName) {
	            var _this5 = this;

	            this._els[menuName].addEventListener('click', function () {
	                _this5.changeMenu(menuName);
	            });
	        }

	        /**
	         * Add menu event
	         * @param {string} menuName - menu name
	         * @private
	         */

	    }, {
	        key: '_addSubMenuEvent',
	        value: function _addSubMenuEvent(menuName) {
	            this[menuName].addEvent(this._actions[menuName]);
	        }

	        /**
	         * get editor area element
	         * @returns {HTMLElement} editor area html element
	         * @ignore
	         */

	    }, {
	        key: 'getEditorArea',
	        value: function getEditorArea() {
	            return this._editorElement;
	        }

	        /**
	         * Add event for menu items
	         * @ignore
	         */

	    }, {
	        key: 'activeMenuEvent',
	        value: function activeMenuEvent() {
	            var _this6 = this;

	            if (this._initMenuEvent) {
	                return;
	            }

	            this._addHelpActionEvent('undo');
	            this._addHelpActionEvent('redo');
	            this._addHelpActionEvent('reset');
	            this._addHelpActionEvent('delete');
	            this._addHelpActionEvent('deleteAll');

	            this._addDownloadEvent();

	            _tuiCodeSnippet2.default.forEach(this.options.menu, function (menuName) {
	                _this6._addMenuEvent(menuName);
	                _this6._addSubMenuEvent(menuName);
	            });
	            this._initMenu();
	            this._initMenuEvent = true;
	        }

	        /**
	         * Init canvas
	         * @ignore
	         */

	    }, {
	        key: 'initCanvas',
	        value: function initCanvas() {
	            var _this7 = this;

	            var loadImageInfo = this._getLoadImage();
	            if (loadImageInfo.path) {
	                this._actions.main.initLoadImage(loadImageInfo.path, loadImageInfo.name).then(function () {
	                    _this7.activeMenuEvent();
	                });
	            }

	            this._addLoadEvent();

	            var gridVisual = document.createElement('div');
	            gridVisual.className = 'tui-image-editor-grid-visual';
	            var grid = '<table>\n           <tr><td class="dot left-top"></td><td></td><td class="dot right-top"></td></tr>\n           <tr><td></td><td></td><td></td></tr>\n           <tr><td class="dot left-bottom"></td><td></td><td class="dot right-bottom"></td></tr>\n         </table>';
	            gridVisual.innerHTML = grid;
	            this._editorContainerElement = this._editorElement.querySelector('.tui-image-editor-canvas-container');
	            this._editorContainerElement.appendChild(gridVisual);
	        }

	        /**
	         * get editor area element
	         * @returns {Object} load image option
	         * @private
	         */

	    }, {
	        key: '_getLoadImage',
	        value: function _getLoadImage() {
	            return this.options.loadImage;
	        }

	        /**
	         * change menu
	         * @param {string} menuName - menu name
	         * @param {boolean} toggle - whether toogle or not
	         * @param {boolean} discardSelection - discard selection
	         * @ignore
	         */

	    }, {
	        key: 'changeMenu',
	        value: function changeMenu(menuName) {
	            var toggle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	            var discardSelection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

	            if (!this._submenuChangeTransection) {
	                this._submenuChangeTransection = true;
	                this._changeMenu(menuName, toggle, discardSelection);
	                this._submenuChangeTransection = false;
	            }
	        }

	        /**
	         * change menu
	         * @param {string} menuName - menu name
	         * @param {boolean} toggle - whether toogle or not
	         * @param {boolean} discardSelection - discard selection
	         * @private
	         */

	    }, {
	        key: '_changeMenu',
	        value: function _changeMenu(menuName, toggle, discardSelection) {
	            if (this.submenu) {
	                this._els[this.submenu].classList.remove('active');
	                this._mainElement.classList.remove('tui-image-editor-menu-' + this.submenu);
	                if (discardSelection) {
	                    this._actions.main.discardSelection();
	                }
	                this._actions.main.changeSelectableAll(true);
	                this[this.submenu].changeStandbyMode();
	            }

	            if (this.submenu === menuName && toggle) {
	                this.submenu = null;
	            } else {
	                this._els[menuName].classList.add('active');
	                this._mainElement.classList.add('tui-image-editor-menu-' + menuName);
	                this.submenu = menuName;
	                this[this.submenu].changeStartMode();
	            }

	            this.resizeEditor();
	        }

	        /**
	         * Init menu
	         * @private
	         */

	    }, {
	        key: '_initMenu',
	        value: function _initMenu() {
	            if (this.options.initMenu) {
	                var evt = document.createEvent('MouseEvents');
	                evt.initEvent('click', true, false);
	                this._els[this.options.initMenu].dispatchEvent(evt);
	            }

	            if (this.icon) {
	                this.icon.registDefaultIcon();
	            }
	        }

	        /**
	         * Get editor dimension
	         * @returns {Object} - width & height of editor
	         * @private
	         */

	    }, {
	        key: '_getEditorDimension',
	        value: function _getEditorDimension() {
	            var maxHeight = parseFloat(this._editorContainerElement.style.maxHeight);
	            var height = this.imageSize.newHeight > maxHeight ? maxHeight : this.imageSize.newHeight;

	            var maxWidth = parseFloat(this._editorContainerElement.style.maxWidth);
	            var width = this.imageSize.newWidth > maxWidth ? maxWidth : this.imageSize.newWidth;

	            return {
	                width: width,
	                height: height
	            };
	        }

	        /**
	         * Set editor position
	         * @param {string} menuBarPosition - top or right or bottom or left
	         * @private
	         */

	    }, {
	        key: '_setEditorPosition',
	        value: function _setEditorPosition(menuBarPosition) {
	            var _getEditorDimension3 = this._getEditorDimension(),
	                width = _getEditorDimension3.width,
	                height = _getEditorDimension3.height;

	            var editorElementStyle = this._editorElement.style;
	            var top = 0;
	            var left = 0;

	            if (this.submenu) {
	                if (menuBarPosition === 'bottom') {
	                    if (height > this._editorElementWrap.scrollHeight - 150) {
	                        top = (height - this._editorElementWrap.scrollHeight) / 2;
	                    } else {
	                        top = 150 / 2 * -1;
	                    }
	                } else if (menuBarPosition === 'top') {
	                    if (height > this._editorElementWrap.offsetHeight - 150) {
	                        top = 150 / 2 - (height - (this._editorElementWrap.offsetHeight - 150)) / 2;
	                    } else {
	                        top = 150 / 2;
	                    }
	                } else if (menuBarPosition === 'left') {
	                    if (width > this._editorElementWrap.offsetWidth - 248) {
	                        left = 248 / 2 - (width - (this._editorElementWrap.offsetWidth - 248)) / 2;
	                    } else {
	                        left = 248 / 2;
	                    }
	                } else if (menuBarPosition === 'right') {
	                    if (width > this._editorElementWrap.scrollWidth - 248) {
	                        left = (width - this._editorElementWrap.scrollWidth) / 2;
	                    } else {
	                        left = 248 / 2 * -1;
	                    }
	                }
	            }
	            editorElementStyle.top = top + 'px';
	            editorElementStyle.left = left + 'px';
	        }
	    }]);

	    return Ui;
	}();

	exports.default = Ui;

/***/ }),
/* 75 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        biImage = _ref.biImage,
	        commonStyle = _ref.commonStyle,
	        headerStyle = _ref.headerStyle,
	        loadButtonStyle = _ref.loadButtonStyle,
	        downloadButtonStyle = _ref.downloadButtonStyle,
	        submenuStyle = _ref.submenuStyle;
	    return '\n    <div class="tui-image-editor-main-container" style="' + commonStyle + '">\n        <div class="tui-image-editor-header" style="' + headerStyle + '">\n            <div class="tui-image-editor-header-logo">\n                <img src="' + biImage + '" />\n            </div>\n            <div class="tui-image-editor-header-buttons">\n                <div style="' + loadButtonStyle + '">\n                    ' + locale.localize('Load') + '\n                    <input type="file" class="tui-image-editor-load-btn" />\n                </div>\n                <button class="tui-image-editor-download-btn" style="' + downloadButtonStyle + '">\n                    ' + locale.localize('Download') + '\n                </button>\n            </div>\n        </div>\n        <div class="tui-image-editor-main">\n            <div class="tui-image-editor-submenu">\n                <div class="tui-image-editor-submenu-style" style="' + submenuStyle + '"></div>\n            </div>\n            <div class="tui-image-editor-wrap">\n                <div class="tui-image-editor-size-wrap">\n                    <div class="tui-image-editor-align-wrap">\n                        <div class="tui-image-editor"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n';
	};

/***/ }),
/* 76 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        biImage = _ref.biImage,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        hover = _ref$iconStyle.hover,
	        disabled = _ref$iconStyle.disabled,
	        loadButtonStyle = _ref.loadButtonStyle,
	        downloadButtonStyle = _ref.downloadButtonStyle;
	    return '\n    <div class="tui-image-editor-controls">\n        <div class="tui-image-editor-controls-logo">\n            <img src="' + biImage + '" />\n        </div>\n        <ul class="tui-image-editor-menu">\n            <li id="tie-btn-undo" class="tui-image-editor-item" title="' + locale.localize('Undo') + '">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-undo" class="enabled"/>\n                    <use xlink:href="' + disabled.path + '#' + disabled.name + '-ic-undo" class="normal"/>\n                    <use xlink:href="' + hover.path + '#' + hover.name + '-ic-undo" class="hover"/>\n                </svg>\n            </li>\n            <li id="tie-btn-redo" class="tui-image-editor-item" title="' + locale.localize('Redo') + '">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-redo" class="enabled"/>\n                    <use xlink:href="' + disabled.path + '#' + disabled.name + '-ic-redo" class="normal"/>\n                    <use xlink:href="' + hover.path + '#' + hover.name + '-ic-redo" class="hover"/>\n                </svg>\n            </li>\n            <li id="tie-btn-reset" class="tui-image-editor-item" title="' + locale.localize('Reset') + '">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-reset" class="enabled"/>\n                    <use xlink:href="' + disabled.path + '#' + disabled.name + '-ic-reset" class="normal"/>\n                    <use xlink:href="' + hover.path + '#' + hover.name + '-ic-reset" class="hover"/>\n                </svg>\n            </li>\n            <li class="tui-image-editor-item">\n                <div class="tui-image-editor-icpartition"></div>\n            </li>\n            <li id="tie-btn-delete" class="tui-image-editor-item" title="' + locale.localize('Delete') + '">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-delete" class="enabled"/>\n                    <use xlink:href="' + disabled.path + '#' + disabled.name + '-ic-delete" class="normal"/>\n                    <use xlink:href="' + hover.path + '#' + hover.name + '-ic-delete" class="hover"/>\n                </svg>\n            </li>\n            <li id="tie-btn-delete-all" class="tui-image-editor-item" title="' + locale.localize('Delete-all') + '">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-delete-all" class="enabled"/>\n                    <use xlink:href="' + disabled.path + '#' + disabled.name + '-ic-delete-all" class="normal"/>\n                    <use xlink:href="' + hover.path + '#' + hover.name + '-ic-delete-all" class="hover"/>\n                </svg>\n            </li>\n            <li class="tui-image-editor-item">\n                <div class="tui-image-editor-icpartition"></div>\n            </li>\n        </ul>\n\n        <div class="tui-image-editor-controls-buttons">\n            <div style="' + loadButtonStyle + '">\n                ' + locale.localize('Load') + '\n                <input type="file" class="tui-image-editor-load-btn" />\n            </div>\n            <button class="tui-image-editor-download-btn" style="' + downloadButtonStyle + '">\n                ' + locale.localize('Download') + '\n            </button>\n        </div>\n    </div>\n';
	};

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _util = __webpack_require__(72);

	var _style = __webpack_require__(78);

	var _style2 = _interopRequireDefault(_style);

	var _standard = __webpack_require__(79);

	var _standard2 = _interopRequireDefault(_standard);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Theme manager
	 * @class
	 * @param {Object} customTheme - custom theme
	 * @ignore
	 */
	var Theme = function () {
	    function Theme(customTheme) {
	        _classCallCheck(this, Theme);

	        this.styles = this._changeToObject((0, _tuiCodeSnippet.extend)(_standard2.default, customTheme));
	        (0, _util.styleLoad)(this._styleMaker());
	    }

	    /**
	     * Get a Style cssText or StyleObject
	     * @param {string} type - style type
	     * @returns {string|object} - cssText or StyleObject
	     */


	    _createClass(Theme, [{
	        key: 'getStyle',
	        value: function getStyle(type) {
	            // eslint-disable-line
	            var result = null;
	            var firstProperty = type.replace(/\..+$/, '');
	            var option = this.styles[type];
	            switch (type) {
	                case 'common.bi':
	                    result = this.styles[type].image;
	                    break;
	                case 'menu.icon':
	                case 'submenu.icon':
	                    result = {
	                        active: this.styles[firstProperty + '.activeIcon'],
	                        normal: this.styles[firstProperty + '.normalIcon'],
	                        hover: this.styles[firstProperty + '.hoverIcon'],
	                        disabled: this.styles[firstProperty + '.disabledIcon']
	                    };
	                    break;
	                case 'submenu.label':
	                    result = {
	                        active: this._makeCssText(this.styles[firstProperty + '.activeLabel']),
	                        normal: this._makeCssText(this.styles[firstProperty + '.normalLabel'])
	                    };
	                    break;
	                case 'submenu.partition':
	                    result = {
	                        vertical: this._makeCssText((0, _tuiCodeSnippet.extend)({}, option, { borderLeft: '1px solid ' + option.color })),
	                        horizontal: this._makeCssText((0, _tuiCodeSnippet.extend)({}, option, { borderBottom: '1px solid ' + option.color }))
	                    };
	                    break;

	                case 'range.disabledPointer':
	                case 'range.disabledBar':
	                case 'range.disabledSubbar':
	                case 'range.pointer':
	                case 'range.bar':
	                case 'range.subbar':
	                    option.backgroundColor = option.color;
	                    result = this._makeCssText(option);
	                    break;
	                default:
	                    result = this._makeCssText(option);
	                    break;
	            }

	            return result;
	        }

	        /**
	         * Make css resource
	         * @returns {string} - serialized css text
	         * @private
	         */

	    }, {
	        key: '_styleMaker',
	        value: function _styleMaker() {
	            var submenuLabelStyle = this.getStyle('submenu.label');
	            var submenuPartitionStyle = this.getStyle('submenu.partition');

	            return (0, _style2.default)({
	                subMenuLabelActive: submenuLabelStyle.active,
	                subMenuLabelNormal: submenuLabelStyle.normal,
	                submenuPartitionVertical: submenuPartitionStyle.vertical,
	                submenuPartitionHorizontal: submenuPartitionStyle.horizontal,
	                biSize: this.getStyle('common.bisize'),
	                subMenuRangeTitle: this.getStyle('range.title'),
	                submenuRangePointer: this.getStyle('range.pointer'),
	                submenuRangeBar: this.getStyle('range.bar'),
	                submenuRangeSubbar: this.getStyle('range.subbar'),

	                submenuDisabledRangePointer: this.getStyle('range.disabledPointer'),
	                submenuDisabledRangeBar: this.getStyle('range.disabledBar'),
	                submenuDisabledRangeSubbar: this.getStyle('range.disabledSubbar'),

	                submenuRangeValue: this.getStyle('range.value'),
	                submenuColorpickerTitle: this.getStyle('colorpicker.title'),
	                submenuColorpickerButton: this.getStyle('colorpicker.button'),
	                submenuCheckbox: this.getStyle('checkbox'),
	                menuIconSize: this.getStyle('menu.iconSize'),
	                submenuIconSize: this.getStyle('submenu.iconSize')
	            });
	        }

	        /**
	         * Change to low dimensional object.
	         * @param {object} styleOptions - style object of user interface
	         * @returns {object} low level object for style apply
	         * @private
	         */

	    }, {
	        key: '_changeToObject',
	        value: function _changeToObject(styleOptions) {
	            var styleObject = {};
	            (0, _tuiCodeSnippet.forEach)(styleOptions, function (value, key) {
	                var keyExplode = key.match(/^(.+)\.([a-z]+)$/i);
	                var property = keyExplode[1],
	                    subProperty = keyExplode[2];


	                if (!styleObject[property]) {
	                    styleObject[property] = {};
	                }
	                styleObject[property][subProperty] = value;
	            });

	            return styleObject;
	        }

	        /**
	         * Style object to Csstext serialize
	         * @param {object} styleObject - style object
	         * @returns {string} - css text string
	         * @private
	         */

	    }, {
	        key: '_makeCssText',
	        value: function _makeCssText(styleObject) {
	            var _this = this;

	            var converterStack = [];

	            (0, _tuiCodeSnippet.forEach)(styleObject, function (value, key) {
	                if (['backgroundImage'].indexOf(key) > -1 && value !== 'none') {
	                    value = 'url(' + value + ')';
	                }

	                converterStack.push(_this._toUnderScore(key) + ': ' + value);
	            });

	            return converterStack.join(';');
	        }

	        /**
	         * Camel key string to Underscore string
	         * @param {string} targetString - change target
	         * @returns {string}
	         * @private
	         */

	    }, {
	        key: '_toUnderScore',
	        value: function _toUnderScore(targetString) {
	            return targetString.replace(/([A-Z])/g, function ($0, $1) {
	                return '-' + $1.toLowerCase();
	            });
	        }
	    }]);

	    return Theme;
	}();

	exports.default = Theme;

/***/ }),
/* 78 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (_ref) {
	    var subMenuLabelActive = _ref.subMenuLabelActive,
	        subMenuLabelNormal = _ref.subMenuLabelNormal,
	        subMenuRangeTitle = _ref.subMenuRangeTitle,
	        submenuPartitionVertical = _ref.submenuPartitionVertical,
	        submenuPartitionHorizontal = _ref.submenuPartitionHorizontal,
	        submenuCheckbox = _ref.submenuCheckbox,
	        submenuRangePointer = _ref.submenuRangePointer,
	        submenuRangeValue = _ref.submenuRangeValue,
	        submenuColorpickerTitle = _ref.submenuColorpickerTitle,
	        submenuColorpickerButton = _ref.submenuColorpickerButton,
	        submenuRangeBar = _ref.submenuRangeBar,
	        submenuRangeSubbar = _ref.submenuRangeSubbar,
	        submenuDisabledRangePointer = _ref.submenuDisabledRangePointer,
	        submenuDisabledRangeBar = _ref.submenuDisabledRangeBar,
	        submenuDisabledRangeSubbar = _ref.submenuDisabledRangeSubbar,
	        submenuIconSize = _ref.submenuIconSize,
	        menuIconSize = _ref.menuIconSize,
	        biSize = _ref.biSize;
	    return "\n    #tie-icon-add-button.icon-bubble .tui-image-editor-button[data-icontype=\"icon-bubble\"] label,\n    #tie-icon-add-button.icon-heart .tui-image-editor-button[data-icontype=\"icon-heart\"] label,\n    #tie-icon-add-button.icon-location .tui-image-editor-button[data-icontype=\"icon-location\"] label,\n    #tie-icon-add-button.icon-polygon .tui-image-editor-button[data-icontype=\"icon-polygon\"] label,\n    #tie-icon-add-button.icon-star .tui-image-editor-button[data-icontype=\"icon-star\"] label,\n    #tie-icon-add-button.icon-star-2 .tui-image-editor-button[data-icontype=\"icon-star-2\"] label,\n    #tie-icon-add-button.icon-arrow-3 .tui-image-editor-button[data-icontype=\"icon-arrow-3\"] label,\n    #tie-icon-add-button.icon-arrow-2 .tui-image-editor-button[data-icontype=\"icon-arrow-2\"] label,\n    #tie-icon-add-button.icon-arrow .tui-image-editor-button[data-icontype=\"icon-arrow\"] label,\n    #tie-icon-add-button.icon-bubble .tui-image-editor-button[data-icontype=\"icon-bubble\"] label,\n    #tie-draw-line-select-button.line .tui-image-editor-button.line label,\n    #tie-draw-line-select-button.free .tui-image-editor-button.free label,\n    #tie-flip-button.flipX .tui-image-editor-button.flipX label,\n    #tie-flip-button.flipY .tui-image-editor-button.flipY label,\n    #tie-flip-button.resetFlip .tui-image-editor-button.resetFlip label,\n    #tie-crop-button .tui-image-editor-button.apply.active label,\n    #tie-crop-preset-button .tui-image-editor-button.preset.active label,\n    #tie-shape-button.rect .tui-image-editor-button.rect label,\n    #tie-shape-button.circle .tui-image-editor-button.circle label,\n    #tie-shape-button.triangle .tui-image-editor-button.triangle label,\n    #tie-text-effect-button .tui-image-editor-button.active label,\n    #tie-text-align-button.left .tui-image-editor-button.left label,\n    #tie-text-align-button.center .tui-image-editor-button.center label,\n    #tie-text-align-button.right .tui-image-editor-button.right label,\n    #tie-mask-apply.apply.active .tui-image-editor-button.apply label,\n    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button:hover > label,\n    .tui-image-editor-container .tui-image-editor-checkbox input + label {\n        " + subMenuLabelActive + "\n    }\n    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button > label,\n    .tui-image-editor-container .tui-image-editor-range-wrap.tui-image-editor-newline.short label {\n        " + subMenuLabelNormal + "\n    }\n    .tui-image-editor-container .tui-image-editor-range-wrap label {\n        " + subMenuRangeTitle + "\n    }\n    .tui-image-editor-container .tui-image-editor-partition > div {\n        " + submenuPartitionVertical + "\n    }\n    .tui-image-editor-container.left .tui-image-editor-submenu .tui-image-editor-partition > div,\n    .tui-image-editor-container.right .tui-image-editor-submenu .tui-image-editor-partition > div {\n        " + submenuPartitionHorizontal + "\n    }\n    .tui-image-editor-container .tui-image-editor-checkbox input + label:before {\n        " + submenuCheckbox + "\n    }\n    .tui-image-editor-container .tui-image-editor-checkbox input:checked + label:before {\n        border: 0;\n    }\n    .tui-image-editor-container .tui-image-editor-virtual-range-pointer {\n        " + submenuRangePointer + "\n    }\n    .tui-image-editor-container .tui-image-editor-virtual-range-bar {\n        " + submenuRangeBar + "\n    }\n    .tui-image-editor-container .tui-image-editor-virtual-range-subbar {\n        " + submenuRangeSubbar + "\n    }\n    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-pointer {\n        " + submenuDisabledRangePointer + "\n    }\n    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-subbar {\n        " + submenuDisabledRangeSubbar + "\n    }\n    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-bar {\n        " + submenuDisabledRangeBar + "\n    }\n    .tui-image-editor-container .tui-image-editor-range-value {\n        " + submenuRangeValue + "\n    }\n    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button .color-picker-value + label {\n        " + submenuColorpickerTitle + "\n    }\n    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button .color-picker-value {\n        " + submenuColorpickerButton + "\n    }\n    .tui-image-editor-container .svg_ic-menu {\n        " + menuIconSize + "\n    }\n    .tui-image-editor-container .svg_ic-submenu {\n        " + submenuIconSize + "\n    }\n    .tui-image-editor-container .tui-image-editor-controls-logo > img,\n    .tui-image-editor-container .tui-image-editor-header-logo > img {\n        " + biSize + "\n    }\n\n";
	};

/***/ }),
/* 79 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @fileoverview The standard theme
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	/**
	 * Full configuration for theme.<br>
	 * @typedef {object} themeConfig
	 * @property {string} common.bi.image - Brand icon image
	 * @property {string} common.bisize.width - Icon image width
	 * @property {string} common.bisize.height - Icon Image Height
	 * @property {string} common.backgroundImage - Background image
	 * @property {string} common.backgroundColor - Background color
	 * @property {string} common.border - Full area border style
	 * @property {string} header.backgroundImage - header area background
	 * @property {string} header.backgroundColor - header area background color
	 * @property {string} header.border - header area border style
	 * @property {string} loadButton.backgroundColor - load button background color
	 * @property {string} loadButton.border - load button border style
	 * @property {string} loadButton.color - load button foreground color
	 * @property {string} loadButton.fontFamily - load button font type
	 * @property {string} loadButton.fontSize - load button font size
	 * @property {string} downloadButton.backgroundColor - download button background color
	 * @property {string} downloadButton.border - download button border style
	 * @property {string} downloadButton.color - download button foreground color
	 * @property {string} downloadButton.fontFamily - download button font type
	 * @property {string} downloadButton.fontSize - download button font size
	 * @property {string} menu.normalIcon.path - Menu default icon svg bundle file path
	 * @property {string} menu.normalIcon.name - Menu default icon svg bundle name
	 * @property {string} menu.activeIcon.path - Menu active icon svg bundle file path
	 * @property {string} menu.activeIcon.name - Menu active icon svg bundle name
	 * @property {string} menu.iconSize.width - Menu icon Size Width
	 * @property {string} menu.iconSize.height - Menu Icon Size Height
	 * @property {string} submenu.backgroundColor - Sub-menu area background color
	 * @property {string} submenu.partition.color - Submenu partition line color
	 * @property {string} submenu.normalIcon.path - Submenu default icon svg bundle file path
	 * @property {string} submenu.normalIcon.name - Submenu default icon svg bundle name
	 * @property {string} submenu.activeIcon.path - Submenu active icon svg bundle file path
	 * @property {string} submenu.activeIcon.name - Submenu active icon svg bundle name
	 * @property {string} submenu.iconSize.width - Submenu icon Size Width
	 * @property {string} submenu.iconSize.height - Submenu Icon Size Height
	 * @property {string} submenu.normalLabel.color - Submenu default label color
	 * @property {string} submenu.normalLabel.fontWeight - Sub Menu Default Label Font Thickness
	 * @property {string} submenu.activeLabel.color - Submenu active label color
	 * @property {string} submenu.activeLabel.fontWeight - Submenu active label Font thickness
	 * @property {string} checkbox.border - Checkbox border style
	 * @property {string} checkbox.backgroundColor - Checkbox background color
	 * @property {string} range.pointer.color - range control pointer color
	 * @property {string} range.bar.color - range control bar color
	 * @property {string} range.subbar.color - range control subbar color
	 * @property {string} range.value.color - range number box font color
	 * @property {string} range.value.fontWeight - range number box font thickness
	 * @property {string} range.value.fontSize - range number box font size
	 * @property {string} range.value.border - range number box border style
	 * @property {string} range.value.backgroundColor - range number box background color
	 * @property {string} range.title.color - range title font color
	 * @property {string} range.title.fontWeight - range title font weight
	 * @property {string} colorpicker.button.border - colorpicker button border style
	 * @property {string} colorpicker.title.color - colorpicker button title font color
	 * @example
	 // default keys and styles
	 var customTheme = {
	    'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
	    'common.bisize.width': '251px',
	    'common.bisize.height': '21px',
	    'common.backgroundImage': 'none',
	    'common.backgroundColor': '#1e1e1e',
	    'common.border': '0px',

	    // header
	    'header.backgroundImage': 'none',
	    'header.backgroundColor': 'transparent',
	    'header.border': '0px',

	    // load button
	    'loadButton.backgroundColor': '#fff',
	    'loadButton.border': '1px solid #ddd',
	    'loadButton.color': '#222',
	    'loadButton.fontFamily': 'NotoSans, sans-serif',
	    'loadButton.fontSize': '12px',

	    // download button
	    'downloadButton.backgroundColor': '#fdba3b',
	    'downloadButton.border': '1px solid #fdba3b',
	    'downloadButton.color': '#fff',
	    'downloadButton.fontFamily': 'NotoSans, sans-serif',
	    'downloadButton.fontSize': '12px',

	    // main icons
	    'menu.normalIcon.path': '../dist/svg/icon-b.svg',
	    'menu.normalIcon.name': 'icon-b',
	    'menu.activeIcon.path': '../dist/svg/icon-a.svg',
	    'menu.activeIcon.name': 'icon-a',
	    'menu.iconSize.width': '24px',
	    'menu.iconSize.height': '24px',

	    // submenu primary color
	    'submenu.backgroundColor': '#1e1e1e',
	    'submenu.partition.color': '#858585',

	    // submenu icons
	    'submenu.normalIcon.path': '../dist/svg/icon-a.svg',
	    'submenu.normalIcon.name': 'icon-a',
	    'submenu.activeIcon.path': '../dist/svg/icon-c.svg',
	    'submenu.activeIcon.name': 'icon-c',
	    'submenu.iconSize.width': '32px',
	    'submenu.iconSize.height': '32px',

	    // submenu labels
	    'submenu.normalLabel.color': '#858585',
	    'submenu.normalLabel.fontWeight': 'lighter',
	    'submenu.activeLabel.color': '#fff',
	    'submenu.activeLabel.fontWeight': 'lighter',

	    // checkbox style
	    'checkbox.border': '1px solid #ccc',
	    'checkbox.backgroundColor': '#fff',

	    // rango style
	    'range.pointer.color': '#fff',
	    'range.bar.color': '#666',
	    'range.subbar.color': '#d1d1d1',
	    'range.value.color': '#fff',
	    'range.value.fontWeight': 'lighter',
	    'range.value.fontSize': '11px',
	    'range.value.border': '1px solid #353535',
	    'range.value.backgroundColor': '#151515',
	    'range.title.color': '#fff',
	    'range.title.fontWeight': 'lighter',

	    // colorpicker style
	    'colorpicker.button.border': '1px solid #1e1e1e',
	    'colorpicker.title.color': '#fff'
	};
	 */
	exports.default = {
	  'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
	  'common.bisize.width': '251px',
	  'common.bisize.height': '21px',
	  'common.backgroundImage': 'none',
	  'common.backgroundColor': '#1e1e1e',
	  'common.border': '0px',

	  // header
	  'header.backgroundImage': 'none',
	  'header.backgroundColor': 'transparent',
	  'header.border': '0px',

	  // load button
	  'loadButton.backgroundColor': '#fff',
	  'loadButton.border': '1px solid #ddd',
	  'loadButton.color': '#222',
	  'loadButton.fontFamily': '\'Noto Sans\', sans-serif',
	  'loadButton.fontSize': '12px',

	  // download button
	  'downloadButton.backgroundColor': '#fdba3b',
	  'downloadButton.border': '1px solid #fdba3b',
	  'downloadButton.color': '#fff',
	  'downloadButton.fontFamily': '\'Noto Sans\', sans-serif',
	  'downloadButton.fontSize': '12px',

	  // main icons
	  'menu.normalIcon.path': '/static/img/vendor/icon-d.svg',
	  'menu.normalIcon.name': 'icon-d',
	  'menu.activeIcon.path': '/static/img/vendor/icon-b.svg',
	  'menu.activeIcon.name': 'icon-b',
	  'menu.disabledIcon.path': '/static/img/vendor/icon-a.svg',
	  'menu.disabledIcon.name': 'icon-a',
	  'menu.hoverIcon.path': '/static/img/vendor/icon-c.svg',
	  'menu.hoverIcon.name': 'icon-c',
	  'menu.iconSize.width': '24px',
	  'menu.iconSize.height': '24px',

	  // submenu primary color
	  'submenu.backgroundColor': '#1e1e1e',
	  'submenu.partition.color': '#3c3c3c',

	  // submenu icons
	  'submenu.normalIcon.path': 'icon-d.svg',
	  'submenu.normalIcon.name': 'icon-d',
	  'submenu.activeIcon.path': 'icon-c.svg',
	  'submenu.activeIcon.name': 'icon-c',
	  'submenu.iconSize.width': '32px',
	  'submenu.iconSize.height': '32px',

	  // submenu labels
	  'submenu.normalLabel.color': '#8a8a8a',
	  'submenu.normalLabel.fontWeight': 'lighter',
	  'submenu.activeLabel.color': '#fff',
	  'submenu.activeLabel.fontWeight': 'lighter',

	  // checkbox style
	  'checkbox.border': '0px',
	  'checkbox.backgroundColor': '#fff',

	  // range style
	  'range.pointer.color': '#fff',
	  'range.bar.color': '#666',
	  'range.subbar.color': '#d1d1d1',

	  'range.disabledPointer.color': '#414141',
	  'range.disabledBar.color': '#282828',
	  'range.disabledSubbar.color': '#414141',

	  'range.value.color': '#fff',
	  'range.value.fontWeight': 'lighter',
	  'range.value.fontSize': '11px',
	  'range.value.border': '1px solid #353535',
	  'range.value.backgroundColor': '#151515',
	  'range.title.color': '#fff',
	  'range.title.fontWeight': 'lighter',

	  // colorpicker style
	  'colorpicker.button.border': '1px solid #1e1e1e',
	  'colorpicker.title.color': '#fff'
	};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _colorpicker = __webpack_require__(81);

	var _colorpicker2 = _interopRequireDefault(_colorpicker);

	var _range = __webpack_require__(83);

	var _range2 = _interopRequireDefault(_range);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _shape = __webpack_require__(85);

	var _shape2 = _interopRequireDefault(_shape);

	var _util = __webpack_require__(72);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var SHAPE_DEFAULT_OPTION = {
	    stroke: '#ffbb3b',
	    fill: '',
	    strokeWidth: 3
	};

	/**
	 * Shape ui class
	 * @class
	 * @ignore
	 */

	var Shape = function (_Submenu) {
	    _inherits(Shape, _Submenu);

	    function Shape(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Shape);

	        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'shape',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _shape2.default
	        }));

	        _this.type = null;
	        _this.options = SHAPE_DEFAULT_OPTION;

	        _this._els = {
	            shapeSelectButton: _this.selector('#tie-shape-button'),
	            shapeColorButton: _this.selector('#tie-shape-color-button'),
	            strokeRange: new _range2.default(_this.selector('#tie-stroke-range'), _consts.defaultShapeStrokeValus),
	            strokeRangeValue: _this.selector('#tie-stroke-range-value'),
	            fillColorpicker: new _colorpicker2.default(_this.selector('#tie-color-fill'), '', _this.toggleDirection),
	            strokeColorpicker: new _colorpicker2.default(_this.selector('#tie-color-stroke'), '#ffbb3b', _this.toggleDirection)
	        };

	        _this.colorPickerControls.push(_this._els.fillColorpicker);
	        _this.colorPickerControls.push(_this._els.strokeColorpicker);
	        return _this;
	    }

	    /**
	     * Add event for shape
	     * @param {Object} actions - actions for shape
	     *   @param {Function} actions.changeShape - change shape mode
	     *   @param {Function} actions.setDrawingShape - set dreawing shape
	     */


	    _createClass(Shape, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this.actions = actions;

	            this._els.shapeSelectButton.addEventListener('click', this._changeShapeHandler.bind(this));
	            this._els.strokeRange.on('change', this._changeStrokeRangeHandler.bind(this));
	            this._els.fillColorpicker.on('change', this._changeFillColorHandler.bind(this));
	            this._els.strokeColorpicker.on('change', this._changeStrokeColorHandler.bind(this));
	            this._els.fillColorpicker.on('changeShow', this.colorPickerChangeShow.bind(this));
	            this._els.strokeColorpicker.on('changeShow', this.colorPickerChangeShow.bind(this));
	            this._els.strokeRangeValue.value = this._els.strokeRange.value;
	            this._els.strokeRangeValue.setAttribute('readonly', true);
	        }

	        /**
	         * Set Shape status
	         * @param {Object} options - options of shape status
	         *   @param {string} strokeWidth - stroke width
	         *   @param {string} strokeColor - stroke color
	         *   @param {string} fillColor - fill color
	         */

	    }, {
	        key: 'setShapeStatus',
	        value: function setShapeStatus(_ref2) {
	            var strokeWidth = _ref2.strokeWidth,
	                strokeColor = _ref2.strokeColor,
	                fillColor = _ref2.fillColor;

	            this._els.strokeRange.value = strokeWidth;
	            this._els.strokeRange.trigger('change');

	            this._els.strokeColorpicker.color = strokeColor;
	            this._els.fillColorpicker.color = fillColor;
	            this.options.stroke = strokeColor;
	            this.options.fill = fillColor;
	            this.options.strokeWidth = strokeWidth;
	        }

	        /**
	         * Executed when the menu starts.
	         */

	    }, {
	        key: 'changeStartMode',
	        value: function changeStartMode() {
	            this.actions.stopDrawingMode();
	        }

	        /**
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {
	            this.type = null;
	            this.actions.changeSelectableAll(true);
	            this._els.shapeSelectButton.classList.remove('circle');
	            this._els.shapeSelectButton.classList.remove('triangle');
	            this._els.shapeSelectButton.classList.remove('rect');
	        }

	        /**
	         * set range stroke max value
	         * @param {number} maxValue - expect max value for change
	         */

	    }, {
	        key: 'setMaxStrokeValue',
	        value: function setMaxStrokeValue(maxValue) {
	            var strokeMaxValue = maxValue;
	            if (strokeMaxValue <= 0) {
	                strokeMaxValue = _consts.defaultShapeStrokeValus.max;
	            }
	            this._els.strokeRange.max = strokeMaxValue;
	        }

	        /**
	         * Set stroke value
	         * @param {number} value - expect value for strokeRange change
	         */

	    }, {
	        key: 'setStrokeValue',
	        value: function setStrokeValue(value) {
	            this._els.strokeRange.value = value;
	            this._els.strokeRange.trigger('change');
	        }

	        /**
	         * Get stroke value
	         * @returns {number} - stroke range value
	         */

	    }, {
	        key: 'getStrokeValue',
	        value: function getStrokeValue() {
	            return this._els.strokeRange.value;
	        }

	        /**
	         * Change icon color
	         * @param {object} event - add button event object
	         * @private
	         */

	    }, {
	        key: '_changeShapeHandler',
	        value: function _changeShapeHandler(event) {
	            var button = event.target.closest('.tui-image-editor-button');
	            if (button) {
	                this.actions.stopDrawingMode();
	                this.actions.discardSelection();
	                var shapeType = this.getButtonType(button, ['circle', 'triangle', 'rect']);

	                if (this.type === shapeType) {
	                    this.changeStandbyMode();

	                    return;
	                }
	                this.changeStandbyMode();
	                this.type = shapeType;
	                event.currentTarget.classList.add(shapeType);
	                this.actions.changeSelectableAll(false);
	                this.actions.modeChange('shape');
	            }
	        }

	        /**
	         * Change stroke range
	         * @param {number} value - stroke range value
	         * @private
	         */

	    }, {
	        key: '_changeStrokeRangeHandler',
	        value: function _changeStrokeRangeHandler(value) {
	            this.options.strokeWidth = (0, _util.toInteger)(value);
	            this._els.strokeRangeValue.value = (0, _util.toInteger)(value);

	            this.actions.changeShape({
	                strokeWidth: value
	            });

	            this.actions.setDrawingShape(this.type, this.options);
	        }

	        /**
	         * Change shape color
	         * @param {string} color - fill color
	         * @private
	         */

	    }, {
	        key: '_changeFillColorHandler',
	        value: function _changeFillColorHandler(color) {
	            color = color || 'transparent';
	            this.options.fill = color;
	            this.actions.changeShape({
	                fill: color
	            });
	        }

	        /**
	         * Change shape stroke color
	         * @param {string} color - fill color
	         * @private
	         */

	    }, {
	        key: '_changeStrokeColorHandler',
	        value: function _changeStrokeColorHandler(color) {
	            color = color || 'transparent';
	            this.options.stroke = color;
	            this.actions.changeShape({
	                stroke: color
	            });
	        }
	    }]);

	    return Shape;
	}(_submenuBase2.default);

	exports.default = Shape;

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _tuiColorPicker = __webpack_require__(82);

	var _tuiColorPicker2 = _interopRequireDefault(_tuiColorPicker);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PICKER_COLOR = ['#000000', '#2a2a2a', '#545454', '#7e7e7e', '#a8a8a8', '#d2d2d2', '#ffffff', '', '#ff4040', '#ff6518', '#ffbb3b', '#03bd9e', '#00a9ff', '#515ce6', '#9e5fff', '#ff5583'];

	/**
	 * Colorpicker control class
	 * @class
	 * @ignore
	 */

	var Colorpicker = function () {
	    function Colorpicker(colorpickerElement) {
	        var defaultColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#7e7e7e';
	        var toggleDirection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'up';

	        _classCallCheck(this, Colorpicker);

	        var title = colorpickerElement.getAttribute('title');

	        this._show = false;

	        this._colorpickerElement = colorpickerElement;
	        this._toggleDirection = toggleDirection;
	        this._makePickerButtonElement(colorpickerElement, defaultColor);
	        this._makePickerLayerElement(colorpickerElement, title);
	        this._color = defaultColor;
	        this.picker = _tuiColorPicker2.default.create({
	            container: this.pickerElement,
	            preset: PICKER_COLOR,
	            color: defaultColor
	        });

	        this._addEvent(colorpickerElement);
	    }

	    /**
	     * Get color
	     * @returns {Number} color value
	     */


	    _createClass(Colorpicker, [{
	        key: '_changeColorElement',


	        /**
	         * Change color element
	         * @param {string} color color value
	         * #private
	         */
	        value: function _changeColorElement(color) {
	            if (color) {
	                this.colorElement.classList.remove('transparent');
	                this.colorElement.style.backgroundColor = color;
	            } else {
	                this.colorElement.style.backgroundColor = '#fff';
	                this.colorElement.classList.add('transparent');
	            }
	        }

	        /**
	         * Make picker button element
	         * @param {HTMLElement} colorpickerElement color picker element
	         * @param {string} defaultColor color value
	         * @private
	         */

	    }, {
	        key: '_makePickerButtonElement',
	        value: function _makePickerButtonElement(colorpickerElement, defaultColor) {
	            colorpickerElement.classList.add('tui-image-editor-button');

	            this.colorElement = document.createElement('div');
	            this.colorElement.className = 'color-picker-value';
	            if (defaultColor) {
	                this.colorElement.style.backgroundColor = defaultColor;
	            } else {
	                this.colorElement.classList.add('transparent');
	            }
	        }

	        /**
	         * Make picker layer element
	         * @param {HTMLElement} colorpickerElement color picker element
	         * @param {string} title picker title
	         * @private
	         */

	    }, {
	        key: '_makePickerLayerElement',
	        value: function _makePickerLayerElement(colorpickerElement, title) {
	            var label = document.createElement('label');
	            var triangle = document.createElement('div');

	            this.pickerControl = document.createElement('div');
	            this.pickerControl.className = 'color-picker-control';

	            this.pickerElement = document.createElement('div');
	            this.pickerElement.className = 'color-picker';

	            label.innerHTML = title;
	            triangle.className = 'triangle';

	            this.pickerControl.appendChild(this.pickerElement);
	            this.pickerControl.appendChild(triangle);

	            colorpickerElement.appendChild(this.pickerControl);
	            colorpickerElement.appendChild(this.colorElement);
	            colorpickerElement.appendChild(label);
	        }

	        /**
	         * Add event
	         * @param {HTMLElement} colorpickerElement color picker element
	         * @private
	         */

	    }, {
	        key: '_addEvent',
	        value: function _addEvent(colorpickerElement) {
	            var _this = this;

	            this.picker.on('selectColor', function (value) {
	                _this._changeColorElement(value.color);
	                _this._color = value.color;
	                _this.fire('change', value.color);
	            });
	            colorpickerElement.addEventListener('click', function (event) {
	                var target = event.target;

	                var isInPickerControl = target && _this._isElementInColorPickerControl(target);

	                if (!isInPickerControl || isInPickerControl && _this._isPaletteButton(target)) {
	                    _this._show = !_this._show;
	                    _this.pickerControl.style.display = _this._show ? 'block' : 'none';
	                    _this._setPickerControlPosition();
	                    _this.fire('changeShow', _this);
	                }
	                event.stopPropagation();
	            });
	            document.body.addEventListener('click', function () {
	                _this.hide();
	            });
	        }

	        /**
	         * Check hex input or not
	         * @param {Element} target - Event target element
	         * @returns {boolean}
	         * @private
	         */

	    }, {
	        key: '_isPaletteButton',
	        value: function _isPaletteButton(target) {
	            return target.className === 'tui-colorpicker-palette-button';
	        }

	        /**
	         * Check given element is in pickerControl element
	         * @param {Element} element - element to check
	         * @returns {boolean}
	         * @private
	         */

	    }, {
	        key: '_isElementInColorPickerControl',
	        value: function _isElementInColorPickerControl(element) {
	            var parentNode = element;

	            while (parentNode !== document.body) {
	                if (!parentNode) {
	                    break;
	                }

	                if (parentNode === this.pickerControl) {
	                    return true;
	                }

	                parentNode = parentNode.parentNode;
	            }

	            return false;
	        }
	    }, {
	        key: 'hide',
	        value: function hide() {
	            this._show = false;
	            this.pickerControl.style.display = 'none';
	        }

	        /**
	         * Set picker control position
	         * @private
	         */

	    }, {
	        key: '_setPickerControlPosition',
	        value: function _setPickerControlPosition() {
	            var controlStyle = this.pickerControl.style;
	            var halfPickerWidth = this._colorpickerElement.clientWidth / 2 + 2;
	            var left = this.pickerControl.offsetWidth / 2 - halfPickerWidth;
	            var top = (this.pickerControl.offsetHeight + 10) * -1;

	            if (this._toggleDirection === 'down') {
	                top = 30;
	            }

	            controlStyle.top = top + 'px';
	            controlStyle.left = '-' + left + 'px';
	        }
	    }, {
	        key: 'color',
	        get: function get() {
	            return this._color;
	        }

	        /**
	         * Set color
	         * @param {string} color color value
	         */
	        ,
	        set: function set(color) {
	            this._color = color;
	            this._changeColorElement(color);
	        }
	    }]);

	    return Colorpicker;
	}();

	_tuiCodeSnippet2.default.CustomEvents.mixin(Colorpicker);
	exports.default = Colorpicker;

/***/ }),
/* 82 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_82__;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _util = __webpack_require__(72);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Range control class
	 * @class
	 * @ignore
	 */
	var Range = function () {
	    function Range(rangeElement) {
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        _classCallCheck(this, Range);

	        this._value = options.value || 0;
	        this.rangeElement = rangeElement;
	        this._drawRangeElement();

	        this.rangeWidth = (0, _util.toInteger)(window.getComputedStyle(rangeElement, null).width) - 12;
	        this._min = options.min || 0;
	        this._max = options.max || 100;
	        this._absMax = this._min * -1 + this._max;
	        this.realTimeEvent = options.realTimeEvent || false;

	        this._addClickEvent();
	        this._addDragEvent();
	        this.value = options.value;
	        this.trigger('change');
	    }

	    /**
	     * Set range max value and re position cursor
	     * @param {number} maxValue - max value
	     */


	    _createClass(Range, [{
	        key: 'trigger',


	        /**
	         * event tirigger
	         * @param {string} type - type
	         */
	        value: function trigger(type) {
	            this.fire(type, this._value);
	        }

	        /**
	         * Make range element
	         * @private
	         */

	    }, {
	        key: '_drawRangeElement',
	        value: function _drawRangeElement() {
	            this.rangeElement.classList.add('tui-image-editor-range');

	            this.bar = document.createElement('div');
	            this.bar.className = 'tui-image-editor-virtual-range-bar';

	            this.subbar = document.createElement('div');
	            this.subbar.className = 'tui-image-editor-virtual-range-subbar';

	            this.pointer = document.createElement('div');
	            this.pointer.className = 'tui-image-editor-virtual-range-pointer';

	            this.bar.appendChild(this.subbar);
	            this.bar.appendChild(this.pointer);
	            this.rangeElement.appendChild(this.bar);
	        }

	        /**
	         * Add Range click event
	         * @private
	         */

	    }, {
	        key: '_addClickEvent',
	        value: function _addClickEvent() {
	            var _this = this;

	            this.rangeElement.addEventListener('click', function (event) {
	                event.stopPropagation();
	                if (event.target.className !== 'tui-image-editor-range') {
	                    return;
	                }
	                var touchPx = event.offsetX;
	                var ratio = touchPx / _this.rangeWidth;
	                var value = _this._absMax * ratio + _this._min;
	                _this.pointer.style.left = ratio * _this.rangeWidth + 'px';
	                _this.subbar.style.right = (1 - ratio) * _this.rangeWidth + 'px';
	                _this._value = value;

	                _this.fire('change', value);
	            });
	        }

	        /**
	         * Add Range drag event
	         * @private
	         */

	    }, {
	        key: '_addDragEvent',
	        value: function _addDragEvent() {
	            var _this2 = this;

	            this.pointer.addEventListener('mousedown', function (event) {
	                _this2.firstPosition = event.screenX;
	                _this2.firstLeft = (0, _util.toInteger)(_this2.pointer.style.left) || 0;
	                _this2.dragEventHandler = {
	                    changeAngle: _this2._changeAngle.bind(_this2),
	                    stopChangingAngle: _this2._stopChangingAngle.bind(_this2)
	                };

	                document.addEventListener('mousemove', _this2.dragEventHandler.changeAngle);
	                document.addEventListener('mouseup', _this2.dragEventHandler.stopChangingAngle);
	            });
	        }

	        /**
	         * change angle event
	         * @param {object} event - change event
	         * @private
	         */

	    }, {
	        key: '_changeAngle',
	        value: function _changeAngle(event) {
	            var changePosition = event.screenX;
	            var diffPosition = changePosition - this.firstPosition;
	            var touchPx = this.firstLeft + diffPosition;
	            touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
	            touchPx = touchPx < 0 ? 0 : touchPx;

	            this.pointer.style.left = touchPx + 'px';
	            this.subbar.style.right = this.rangeWidth - touchPx + 'px';
	            var ratio = touchPx / this.rangeWidth;
	            var value = this._absMax * ratio + this._min;

	            this._value = value;

	            if (this.realTimeEvent) {
	                this.fire('change', value);
	            }
	        }

	        /**
	         * stop change angle event
	         * @private
	         */

	    }, {
	        key: '_stopChangingAngle',
	        value: function _stopChangingAngle() {
	            this.fire('change', this._value);
	            document.removeEventListener('mousemove', this.dragEventHandler.changeAngle);
	            document.removeEventListener('mouseup', this.dragEventHandler.stopChangingAngle);
	        }
	    }, {
	        key: 'max',
	        set: function set(maxValue) {
	            this._max = maxValue;
	            this._absMax = this._min * -1 + this._max;
	            this.value = this._value;
	        },
	        get: function get() {
	            return this._max;
	        }

	        /**
	         * Get range value
	         * @returns {Number} range value
	         */

	    }, {
	        key: 'value',
	        get: function get() {
	            return this._value;
	        }

	        /**
	         * Set range value
	         * @param {Number} value range value
	         * @param {Boolean} fire whether fire custom event or not
	         */
	        ,
	        set: function set(value) {
	            var absValue = value - this._min;
	            var leftPosition = absValue * this.rangeWidth / this._absMax;

	            if (this.rangeWidth < leftPosition) {
	                leftPosition = this.rangeWidth;
	            }

	            this.pointer.style.left = leftPosition + 'px';
	            this.subbar.style.right = this.rangeWidth - leftPosition + 'px';
	            this._value = value;
	        }
	    }]);

	    return Range;
	}();

	_tuiCodeSnippet2.default.CustomEvents.mixin(Range);
	exports.default = Range;

/***/ }),
/* 84 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Submenu Base Class
	 * @class
	 * @ignore
	 */
	var Submenu = function () {
	    /**
	     * @param {HTMLElement} subMenuElement - submenu dom element
	     * @param {Locale} locale - translate text
	     * @param {string} name - name of sub menu
	     * @param {Object} iconStyle - style of icon
	     * @param {string} menuBarPosition - position of menu
	     * @param {*} templateHtml - template for SubMenuElement
	     */
	    function Submenu(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            name = _ref.name,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition,
	            templateHtml = _ref.templateHtml;

	        _classCallCheck(this, Submenu);

	        this.selector = function (str) {
	            return subMenuElement.querySelector(str);
	        };
	        this.menuBarPosition = menuBarPosition;
	        this.toggleDirection = menuBarPosition === 'top' ? 'down' : 'up';
	        this.colorPickerControls = [];
	        this._makeSubMenuElement(subMenuElement, {
	            locale: locale,
	            name: name,
	            iconStyle: iconStyle,
	            templateHtml: templateHtml
	        });
	    }

	    _createClass(Submenu, [{
	        key: 'colorPickerChangeShow',
	        value: function colorPickerChangeShow(occurredControl) {
	            this.colorPickerControls.forEach(function (pickerControl) {
	                if (occurredControl !== pickerControl) {
	                    pickerControl.hide();
	                }
	            });
	        }

	        /**
	         * Get butten type
	         * @param {HTMLElement} button - event target element
	         * @param {array} buttonNames - Array of button names
	         * @returns {string} - button type
	         */

	    }, {
	        key: 'getButtonType',
	        value: function getButtonType(button, buttonNames) {
	            return button.className.match(RegExp('(' + buttonNames.join('|') + ')'))[0];
	        }

	        /**
	         * Get butten type
	         * @param {HTMLElement} target - event target element
	         * @param {string} removeClass - remove class name
	         * @param {string} addClass - add class name
	         */

	    }, {
	        key: 'changeClass',
	        value: function changeClass(target, removeClass, addClass) {
	            target.classList.remove(removeClass);
	            target.classList.add(addClass);
	        }

	        /**
	         * Interface method whose implementation is optional.
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {}

	        /**
	         * Interface method whose implementation is optional.
	         * Executed when the menu starts.
	         */

	    }, {
	        key: 'changeStartMode',
	        value: function changeStartMode() {}

	        /**
	         * Make submenu dom element
	         * @param {HTMLElement} subMenuElement - submenu dom element
	         * @param {Locale} locale - translate text
	         * @param {string} name - submenu name
	         * @param {Object} iconStyle -  icon style
	         * @param {*} templateHtml - template for SubMenuElement
	         * @private
	         */

	    }, {
	        key: '_makeSubMenuElement',
	        value: function _makeSubMenuElement(subMenuElement, _ref2) {
	            var locale = _ref2.locale,
	                name = _ref2.name,
	                iconStyle = _ref2.iconStyle,
	                templateHtml = _ref2.templateHtml;

	            var iconSubMenu = document.createElement('div');
	            iconSubMenu.className = 'tui-image-editor-menu-' + name;
	            iconSubMenu.innerHTML = templateHtml({
	                locale: locale,
	                iconStyle: iconStyle
	            });

	            subMenuElement.appendChild(iconSubMenu);
	        }
	    }]);

	    return Submenu;
	}();

	exports.default = Submenu;

/***/ }),
/* 85 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-shape-button">\n            <div class="tui-image-editor-button rect">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-shape-rectangle"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-shape-rectangle"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Rectangle') + ' </label>\n            </div>\n            <div class="tui-image-editor-button circle">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-shape-circle"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-shape-circle"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Circle') + ' </label>\n            </div>\n            <div class="tui-image-editor-button triangle">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-shape-triangle"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-shape-triangle"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Triangle') + ' </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li id="tie-shape-color-button">\n            <div id="tie-color-fill" title="' + locale.localize('Fill') + '"></div>\n            <div id="tie-color-stroke" title="' + locale.localize('Stroke') + '"></div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-newline tui-image-editor-range-wrap">\n            <label class="range">' + locale.localize('Stroke') + '</label>\n            <div id="tie-stroke-range"></div>\n            <input id="tie-stroke-range-value" class="tui-image-editor-range-value" value="0" />\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _crop = __webpack_require__(87);

	var _crop2 = _interopRequireDefault(_crop);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Crop ui class
	 * @class
	 * @ignore
	 */
	var Crop = function (_Submenu) {
	    _inherits(Crop, _Submenu);

	    function Crop(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Crop);

	        var _this = _possibleConstructorReturn(this, (Crop.__proto__ || Object.getPrototypeOf(Crop)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'crop',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _crop2.default
	        }));

	        _this.status = 'active';

	        _this._els = {
	            apply: _this.selector('#tie-crop-button .apply'),
	            cancel: _this.selector('#tie-crop-button .cancel'),
	            preset: _this.selector('#tie-crop-preset-button')
	        };

	        _this.defaultPresetButton = _this._els.preset.querySelector('.preset-none');
	        return _this;
	    }

	    /**
	     * Add event for crop
	     * @param {Object} actions - actions for crop
	     *   @param {Function} actions.crop - crop action
	     *   @param {Function} actions.cancel - cancel action
	     *   @param {Function} actions.preset - draw rectzone at a predefined ratio
	     */


	    _createClass(Crop, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            var _this2 = this;

	            this.actions = actions;
	            this._els.apply.addEventListener('click', function () {
	                _this2.actions.crop();
	                _this2._els.apply.classList.remove('active');
	            });

	            this._els.cancel.addEventListener('click', function () {
	                _this2.actions.cancel();
	                _this2._els.apply.classList.remove('active');
	            });

	            this._els.preset.addEventListener('click', function (event) {
	                var button = event.target.closest('.tui-image-editor-button.preset');
	                if (button) {
	                    var _button$className$mat = button.className.match(/preset-[^\s]+/),
	                        presetType = _button$className$mat[0];

	                    _this2._setPresetButtonActive(button);
	                    _this2.actions.preset(presetType);
	                }
	            });
	        }

	        /**
	         * Executed when the menu starts.
	         */

	    }, {
	        key: 'changeStartMode',
	        value: function changeStartMode() {
	            this.actions.modeChange('crop');
	        }

	        /**
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {
	            this.actions.stopDrawingMode();
	            this._setPresetButtonActive();
	        }

	        /**
	         * Change apply button status
	         * @param {Boolean} enableStatus - apply button status
	         */

	    }, {
	        key: 'changeApplyButtonStatus',
	        value: function changeApplyButtonStatus(enableStatus) {
	            if (enableStatus) {
	                this._els.apply.classList.add('active');
	            } else {
	                this._els.apply.classList.remove('active');
	            }
	        }

	        /**
	         * Set preset button to active status
	         * @param {HTMLElement} button - event target element
	         * @private
	         */

	    }, {
	        key: '_setPresetButtonActive',
	        value: function _setPresetButtonActive() {
	            var button = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.defaultPresetButton;

	            _tuiCodeSnippet2.default.forEach([].slice.call(this._els.preset.querySelectorAll('.preset')), function (presetButton) {
	                presetButton.classList.remove('active');
	            });

	            if (button) {
	                button.classList.add('active');
	            }
	        }
	    }]);

	    return Crop;
	}(_submenuBase2.default);

	exports.default = Crop;

/***/ }),
/* 87 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-crop-preset-button">\n            <div class="tui-image-editor-button preset preset-none active">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-shape-rectangle"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-shape-rectangle"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Custom') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-square">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Square') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-3-2">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('3:2') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-4-3">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('4:3') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-5-4">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('5:4') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-7-5">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('7:5') + ' </label>\n            </div>\n            <div class="tui-image-editor-button preset preset-16-9">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-crop"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-crop"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('16:9') + ' </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition tui-image-editor-newline">\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li id="tie-crop-button" class="action">\n            <div class="tui-image-editor-button apply">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-apply" class="normal"/>\n                    <use xlink:href="' + active.path + '#' + active.name + '-ic-apply" class="active"/>\n                </svg>\n                <label>\n                    ' + locale.localize('Apply') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button cancel">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-cancel" class="normal"/>\n                    <use xlink:href="' + active.path + '#' + active.name + '-ic-cancel" class="active"/>\n                </svg>\n                <label>\n                    ' + locale.localize('Cancel') + '\n                </label>\n            </div>\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _flip = __webpack_require__(89);

	var _flip2 = _interopRequireDefault(_flip);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Flip ui class
	 * @class
	 * @ignore
	 */
	var Flip = function (_Submenu) {
	    _inherits(Flip, _Submenu);

	    function Flip(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Flip);

	        var _this = _possibleConstructorReturn(this, (Flip.__proto__ || Object.getPrototypeOf(Flip)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'flip',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _flip2.default
	        }));

	        _this.flipStatus = false;

	        _this._els = {
	            flipButton: _this.selector('#tie-flip-button')
	        };
	        return _this;
	    }

	    /**
	     * Add event for flip
	     * @param {Object} actions - actions for flip
	     *   @param {Function} actions.flip - flip action
	     */


	    _createClass(Flip, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this._actions = actions;
	            this._els.flipButton.addEventListener('click', this._changeFlip.bind(this));
	        }

	        /**
	         * change Flip status
	         * @param {object} event - change event
	         * @private
	         */

	    }, {
	        key: '_changeFlip',
	        value: function _changeFlip(event) {
	            var _this2 = this;

	            var button = event.target.closest('.tui-image-editor-button');
	            if (button) {
	                var flipType = this.getButtonType(button, ['flipX', 'flipY', 'resetFlip']);
	                if (!this.flipStatus && flipType === 'resetFlip') {
	                    return;
	                }

	                this._actions.flip(flipType).then(function (flipStatus) {
	                    var flipClassList = _this2._els.flipButton.classList;
	                    _this2.flipStatus = false;

	                    flipClassList.remove('resetFlip');
	                    _tuiCodeSnippet2.default.forEach(['flipX', 'flipY'], function (type) {
	                        flipClassList.remove(type);
	                        if (flipStatus[type]) {
	                            flipClassList.add(type);
	                            flipClassList.add('resetFlip');
	                            _this2.flipStatus = true;
	                        }
	                    });
	                });
	            }
	        }
	    }]);

	    return Flip;
	}(_submenuBase2.default);

	exports.default = Flip;

/***/ }),
/* 89 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul id="tie-flip-button" class="tui-image-editor-submenu-item">\n        <li>\n            <div class="tui-image-editor-button flipX">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-flip-x" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-flip-x" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Flip X') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button flipY">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-flip-y" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-flip-y" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Flip Y') + '\n                </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li>\n            <div class="tui-image-editor-button resetFlip">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-flip-reset"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-flip-reset"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Reset') + '\n                </label>\n            </div>\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _range = __webpack_require__(83);

	var _range2 = _interopRequireDefault(_range);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _rotate = __webpack_require__(91);

	var _rotate2 = _interopRequireDefault(_rotate);

	var _util = __webpack_require__(72);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var CLOCKWISE = 30;
	var COUNTERCLOCKWISE = -30;

	/**
	 * Rotate ui class
	 * @class
	 * @ignore
	 */

	var Rotate = function (_Submenu) {
	    _inherits(Rotate, _Submenu);

	    function Rotate(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Rotate);

	        var _this = _possibleConstructorReturn(this, (Rotate.__proto__ || Object.getPrototypeOf(Rotate)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'rotate',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _rotate2.default
	        }));

	        _this._els = {
	            rotateButton: _this.selector('#tie-retate-button'),
	            rotateRange: new _range2.default(_this.selector('#tie-rotate-range'), _consts.defaultRotateRangeValus),
	            rotateRangeValue: _this.selector('#tie-ratate-range-value')
	        };
	        return _this;
	    }

	    /**
	     * Add event for rotate
	     * @param {Object} actions - actions for crop
	     *   @param {Function} actions.rotate - rotate action
	     *   @param {Function} actions.setAngle - set angle action
	     */


	    _createClass(Rotate, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            // {rotate, setAngle}
	            this.actions = actions;
	            this._els.rotateButton.addEventListener('click', this._changeRotateForButton.bind(this));
	            this._els.rotateRange.on('change', this._changeRotateForRange.bind(this));
	            this._els.rotateRangeValue.setAttribute('readonly', true);
	        }

	        /**
	         * Change rotate for range
	         * @param {number} value - angle value
	         * @private
	         */

	    }, {
	        key: '_changeRotateForRange',
	        value: function _changeRotateForRange(value) {
	            var angle = (0, _util.toInteger)(value);
	            this._els.rotateRangeValue.value = angle;
	            this.actions.setAngle(angle);
	        }

	        /**
	         * Change rotate for button
	         * @param {object} event - add button event object
	         * @private
	         */

	    }, {
	        key: '_changeRotateForButton',
	        value: function _changeRotateForButton(event) {
	            var button = event.target.closest('.tui-image-editor-button');
	            if (button) {
	                var rotateType = this.getButtonType(button, ['counterclockwise', 'clockwise']);
	                var rotateAngle = {
	                    clockwise: CLOCKWISE,
	                    counterclockwise: COUNTERCLOCKWISE
	                }[rotateType];
	                this.actions.rotate(rotateAngle);
	            }
	        }
	    }]);

	    return Rotate;
	}(_submenuBase2.default);

	exports.default = Rotate;

/***/ }),
/* 91 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-retate-button">\n            <div class="tui-image-editor-button clockwise">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-rotate-clockwise"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-rotate-clockwise"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> 30 </label>\n            </div>\n            <div class="tui-image-editor-button counterclockwise">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-rotate-counterclockwise"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-rotate-counterclockwise"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> -30 </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-newline tui-image-editor-range-wrap">\n            <label class="range">' + locale.localize('Range') + '</label>\n            <div id="tie-rotate-range"></div>\n            <input id="tie-ratate-range-value" class="tui-image-editor-range-value" value="0" />\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _range = __webpack_require__(83);

	var _range2 = _interopRequireDefault(_range);

	var _colorpicker = __webpack_require__(81);

	var _colorpicker2 = _interopRequireDefault(_colorpicker);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _text = __webpack_require__(93);

	var _text2 = _interopRequireDefault(_text);

	var _util = __webpack_require__(72);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Crop ui class
	 * @class
	 * @ignore
	 */
	var Text = function (_Submenu) {
	    _inherits(Text, _Submenu);

	    function Text(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Text);

	        var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'text',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _text2.default
	        }));

	        _this.effect = {
	            bold: false,
	            italic: false,
	            underline: false
	        };
	        _this.align = 'left';
	        _this._els = {
	            textEffectButton: _this.selector('#tie-text-effect-button'),
	            textAlignButton: _this.selector('#tie-text-align-button'),
	            textColorpicker: new _colorpicker2.default(_this.selector('#tie-text-color'), '#ffbb3b', _this.toggleDirection),
	            textRange: new _range2.default(_this.selector('#tie-text-range'), _consts.defaultTextRangeValus),
	            textRangeValue: _this.selector('#tie-text-range-value')
	        };
	        return _this;
	    }

	    /**
	     * Add event for text
	     * @param {Object} actions - actions for text
	     *   @param {Function} actions.changeTextStyle - change text style
	     */


	    _createClass(Text, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this.actions = actions;
	            this._els.textEffectButton.addEventListener('click', this._setTextEffectHandler.bind(this));
	            this._els.textAlignButton.addEventListener('click', this._setTextAlignHandler.bind(this));
	            this._els.textRange.on('change', this._changeTextRnageHandler.bind(this));
	            this._els.textRangeValue.value = this._els.textRange.value;
	            this._els.textRangeValue.setAttribute('readonly', true);
	            this._els.textColorpicker.on('change', this._changeColorHandler.bind(this));
	        }

	        /**
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {
	            this.actions.stopDrawingMode();
	        }

	        /**
	         * Executed when the menu starts.
	         */

	    }, {
	        key: 'changeStartMode',
	        value: function changeStartMode() {
	            this.actions.modeChange('text');
	        }

	        /**
	         * Get text color
	         * @returns {string} - text color
	         */

	    }, {
	        key: '_setTextEffectHandler',


	        /**
	         * text effect set handler
	         * @param {object} event - add button event object
	         * @private
	         */
	        value: function _setTextEffectHandler(event) {
	            var button = event.target.closest('.tui-image-editor-button');

	            var _button$className$mat = button.className.match(/(bold|italic|underline)/),
	                styleType = _button$className$mat[0];

	            var styleObj = {
	                'bold': { fontWeight: 'bold' },
	                'italic': { fontStyle: 'italic' },
	                'underline': { textDecoration: 'underline' }
	            }[styleType];

	            this.effect[styleType] = !this.effect[styleType];
	            button.classList.toggle('active');
	            this.actions.changeTextStyle(styleObj);
	        }

	        /**
	         * text effect set handler
	         * @param {object} event - add button event object
	         * @private
	         */

	    }, {
	        key: '_setTextAlignHandler',
	        value: function _setTextAlignHandler(event) {
	            var button = event.target.closest('.tui-image-editor-button');
	            if (button) {
	                var styleType = this.getButtonType(button, ['left', 'center', 'right']);

	                event.currentTarget.classList.remove(this.align);
	                if (this.align !== styleType) {
	                    event.currentTarget.classList.add(styleType);
	                }
	                this.actions.changeTextStyle({ textAlign: styleType });

	                this.align = styleType;
	            }
	        }

	        /**
	         * text align set handler
	         * @param {number} value - range value
	         * @private
	         */

	    }, {
	        key: '_changeTextRnageHandler',
	        value: function _changeTextRnageHandler(value) {
	            value = (0, _util.toInteger)(value);
	            if ((0, _util.toInteger)(this._els.textRangeValue.value) !== value) {
	                this.actions.changeTextStyle({
	                    fontSize: value
	                });
	                this._els.textRangeValue.value = value;
	            }
	        }

	        /**
	         * change color handler
	         * @param {string} color - change color string
	         * @private
	         */

	    }, {
	        key: '_changeColorHandler',
	        value: function _changeColorHandler(color) {
	            color = color || 'transparent';
	            this.actions.changeTextStyle({
	                'fill': color
	            });
	        }
	    }, {
	        key: 'textColor',
	        get: function get() {
	            return this._els.textColorpicker.color;
	        }

	        /**
	         * Get text size
	         * @returns {string} - text size
	         */

	    }, {
	        key: 'fontSize',
	        get: function get() {
	            return this._els.textRange.value;
	        }

	        /**
	         * Set text size
	         * @param {Number} value - text size
	         */
	        ,
	        set: function set(value) {
	            this._els.textRange.value = value;
	            this._els.textRangeValue.value = value;
	        }
	    }]);

	    return Text;
	}(_submenuBase2.default);

	exports.default = Text;

/***/ }),
/* 93 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-text-effect-button">\n            <div class="tui-image-editor-button bold">\n                <div>\n                    <svg class="svg_ic-submenu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-bold" class="normal"/>\n                    <use xlink:href="' + active.path + '#' + active.name + '-ic-text-bold" class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Bold') + ' </label>\n            </div>\n            <div class="tui-image-editor-button italic">\n                <div>\n                    <svg class="svg_ic-submenu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-italic" class="normal"/>\n                    <use xlink:href="' + active.path + '#' + active.name + '-ic-text-italic" class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Italic') + ' </label>\n            </div>\n            <div class="tui-image-editor-button underline">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-underline"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-text-underline"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Underline') + ' </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li id="tie-text-align-button">\n            <div class="tui-image-editor-button left">\n                <div>\n                    <svg class="svg_ic-submenu">\n                     <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-align-left"\n                        class="normal"/>\n                     <use xlink:href="' + active.path + '#' + active.name + '-ic-text-align-left"\n                        class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Left') + ' </label>\n            </div>\n            <div class="tui-image-editor-button center">\n                <div>\n                    <svg class="svg_ic-submenu">\n                     <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-align-center"\n                        class="normal"/>\n                     <use xlink:href="' + active.path + '#' + active.name + '-ic-text-align-center"\n                        class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Center') + ' </label>\n            </div>\n            <div class="tui-image-editor-button right">\n                <div>\n                    <svg class="svg_ic-submenu">\n                     <use xlink:href="' + normal.path + '#' + normal.name + '-ic-text-align-right"\n                        class="normal"/>\n                     <use xlink:href="' + active.path + '#' + active.name + '-ic-text-align-right"\n                        class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Right') + ' </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li>\n            <div id="tie-text-color" title="' + locale.localize('Color') + '"></div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-newline tui-image-editor-range-wrap">\n            <label class="range">' + locale.localize('Text size') + '</label>\n            <div id="tie-text-range"></div>\n            <input id="tie-text-range-value" class="tui-image-editor-range-value" value="0" />\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	var _mask = __webpack_require__(95);

	var _mask2 = _interopRequireDefault(_mask);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Mask ui class
	 * @class
	 * @ignore
	 */
	var Mask = function (_Submenu) {
	    _inherits(Mask, _Submenu);

	    function Mask(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Mask);

	        var _this = _possibleConstructorReturn(this, (Mask.__proto__ || Object.getPrototypeOf(Mask)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'mask',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _mask2.default
	        }));

	        _this._els = {
	            applyButton: _this.selector('#tie-mask-apply'),
	            maskImageButton: _this.selector('#tie-mask-image-file')
	        };
	        return _this;
	    }

	    /**
	     * Add event for mask
	     * @param {Object} actions - actions for crop
	     *   @param {Function} actions.loadImageFromURL - load image action
	     *   @param {Function} actions.applyFilter - apply filter action
	     */


	    _createClass(Mask, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this.actions = actions;
	            this._els.maskImageButton.addEventListener('change', this._loadMaskFile.bind(this));
	            this._els.applyButton.addEventListener('click', this._applyMask.bind(this));
	        }

	        /**
	         * Apply mask
	         * @private
	         */

	    }, {
	        key: '_applyMask',
	        value: function _applyMask() {
	            this.actions.applyFilter();
	            this._els.applyButton.classList.remove('active');
	        }

	        /**
	         * Load mask file
	         * @param {object} event - File change event object
	         * @private
	         */

	    }, {
	        key: '_loadMaskFile',
	        value: function _loadMaskFile(event) {
	            var imgUrl = void 0;

	            if (!_util2.default.isSupportFileApi()) {
	                alert('This browser does not support file-api');
	            }

	            var _event$target$files = event.target.files,
	                file = _event$target$files[0];


	            if (file) {
	                imgUrl = URL.createObjectURL(file);
	                this.actions.loadImageFromURL(imgUrl, file);
	                this._els.applyButton.classList.add('active');
	            }
	        }
	    }]);

	    return Mask;
	}(_submenuBase2.default);

	exports.default = Mask;

/***/ }),
/* 95 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li>\n            <div class="tui-image-editor-button">\n                <div>\n                    <input type="file" accept="image/*" id="tie-mask-image-file">\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-mask-load" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-mask-load" class="active"/>\n                    </svg>\n                </div>\n                <label> ' + locale.localize('Load Mask Image') + ' </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li id="tie-mask-apply" class="tui-image-editor-newline apply" style="margin-top: 22px;margin-bottom: 5px">\n            <div class="tui-image-editor-button apply">\n                <svg class="svg_ic-menu">\n                    <use xlink:href="' + normal.path + '#' + normal.name + '-ic-apply" class="normal"/>\n                    <use xlink:href="' + active.path + '#' + active.name + '-ic-apply" class="active"/>\n                </svg>\n                <label>\n                    ' + locale.localize('Apply') + '\n                </label>\n            </div>\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _colorpicker = __webpack_require__(81);

	var _colorpicker2 = _interopRequireDefault(_colorpicker);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _icon = __webpack_require__(97);

	var _icon2 = _interopRequireDefault(_icon);

	var _util = __webpack_require__(72);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Icon ui class
	 * @class
	 * @ignore
	 */
	var Icon = function (_Submenu) {
	    _inherits(Icon, _Submenu);

	    function Icon(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Icon);

	        var _this = _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'icon',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _icon2.default
	        }));

	        _this.iconType = null;
	        _this._iconMap = {};

	        _this._els = {
	            registIconButton: _this.selector('#tie-icon-image-file'),
	            addIconButton: _this.selector('#tie-icon-add-button'),
	            iconColorpicker: new _colorpicker2.default(_this.selector('#tie-icon-color'), '#ffbb3b', _this.toggleDirection)
	        };
	        return _this;
	    }

	    /**
	     * Add event for icon
	     * @param {Object} actions - actions for icon
	     *   @param {Function} actions.registCustomIcon - register icon
	     *   @param {Function} actions.addIcon - add icon
	     *   @param {Function} actions.changeColor - change icon color
	     */


	    _createClass(Icon, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this.actions = actions;

	            this._els.iconColorpicker.on('change', this._changeColorHandler.bind(this));
	            this._els.registIconButton.addEventListener('change', this._registeIconHandler.bind(this));
	            this._els.addIconButton.addEventListener('click', this._addIconHandler.bind(this));
	        }

	        /**
	         * Clear icon type
	         */

	    }, {
	        key: 'clearIconType',
	        value: function clearIconType() {
	            this._els.addIconButton.classList.remove(this.iconType);
	            this.iconType = null;
	        }

	        /**
	         * Register default icon
	         */

	    }, {
	        key: 'registDefaultIcon',
	        value: function registDefaultIcon() {
	            var _this2 = this;

	            _tuiCodeSnippet2.default.forEach(_consts.defaultIconPath, function (path, type) {
	                _this2.actions.registDefalutIcons(type, path);
	            });
	        }

	        /**
	         * Set icon picker color
	         * @param {string} iconColor - rgb color string
	         */

	    }, {
	        key: 'setIconPickerColor',
	        value: function setIconPickerColor(iconColor) {
	            this._els.iconColorpicker.color = iconColor;
	        }

	        /**
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {
	            this.clearIconType();
	            this.actions.cancelAddIcon();
	        }

	        /**
	         * Change icon color
	         * @param {string} color - color for change
	         * @private
	         */

	    }, {
	        key: '_changeColorHandler',
	        value: function _changeColorHandler(color) {
	            color = color || 'transparent';
	            this.actions.changeColor(color);
	        }

	        /**
	         * Change icon color
	         * @param {object} event - add button event object
	         * @private
	         */

	    }, {
	        key: '_addIconHandler',
	        value: function _addIconHandler(event) {
	            var button = event.target.closest('.tui-image-editor-button');

	            if (button) {
	                var iconType = button.getAttribute('data-icontype');
	                var iconColor = this._els.iconColorpicker.color;
	                this.actions.discardSelection();
	                this.actions.changeSelectableAll(false);
	                this._els.addIconButton.classList.remove(this.iconType);
	                this._els.addIconButton.classList.add(iconType);

	                if (this.iconType === iconType) {
	                    this.changeStandbyMode();
	                } else {
	                    this.actions.addIcon(iconType, iconColor);
	                    this.iconType = iconType;
	                }
	            }
	        }

	        /**
	         * register icon
	         * @param {object} event - file change event object
	         * @private
	         */

	    }, {
	        key: '_registeIconHandler',
	        value: function _registeIconHandler(event) {
	            var imgUrl = void 0;

	            if (!_util.isSupportFileApi) {
	                alert('This browser does not support file-api');
	            }

	            var _event$target$files = event.target.files,
	                file = _event$target$files[0];


	            if (file) {
	                imgUrl = URL.createObjectURL(file);
	                this.actions.registCustomIcon(imgUrl, file);
	            }
	        }
	    }]);

	    return Icon;
	}(_submenuBase2.default);

	exports.default = Icon;

/***/ }),
/* 97 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-icon-add-button">\n            <div class="tui-image-editor-button" data-icontype="icon-arrow">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-arrow"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-arrow"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Arrow') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button" data-icontype="icon-arrow-2">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-arrow-2"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-arrow-2"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Arrow-2') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button" data-icontype="icon-arrow-3">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-arrow-3"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-arrow-3"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Arrow-3') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button" data-icontype="icon-star">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-star" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-star" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Star-1') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button" data-icontype="icon-star-2">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-star-2"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-star-2"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Star-2') + '\n                </label>\n            </div>\n\n            <div class="tui-image-editor-button" data-icontype="icon-polygon">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-polygon"\n                            class="normal"/>\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-polygon"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Polygon') + '\n                </label>\n            </div>\n\n            <div class="tui-image-editor-button" data-icontype="icon-location">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-location"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-location"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Location') + '\n                </label>\n            </div>\n\n            <div class="tui-image-editor-button" data-icontype="icon-heart">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-heart"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-heart"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Heart') + '\n                </label>\n            </div>\n\n            <div class="tui-image-editor-button" data-icontype="icon-bubble">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-bubble"\n                            class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-bubble"\n                            class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Bubble') + '\n                </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li id="tie-icon-add-button">\n            <div class="tui-image-editor-button" style="margin:0">\n                <div>\n                    <input type="file" accept="image/*" id="tie-icon-image-file">\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-icon-load" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-icon-load" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Custom icon') + '\n                </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li>\n            <div id="tie-icon-color" title="' + locale.localize('Color') + '"></div>\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	var _colorpicker = __webpack_require__(81);

	var _colorpicker2 = _interopRequireDefault(_colorpicker);

	var _range = __webpack_require__(83);

	var _range2 = _interopRequireDefault(_range);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _draw = __webpack_require__(99);

	var _draw2 = _interopRequireDefault(_draw);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var DRAW_OPACITY = 1;

	/**
	 * Draw ui class
	 * @class
	 * @ignore
	 */

	var Draw = function (_Submenu) {
	    _inherits(Draw, _Submenu);

	    function Draw(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Draw);

	        var _this = _possibleConstructorReturn(this, (Draw.__proto__ || Object.getPrototypeOf(Draw)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'draw',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _draw2.default
	        }));

	        _this._els = {
	            lineSelectButton: _this.selector('#tie-draw-line-select-button'),
	            drawColorpicker: new _colorpicker2.default(_this.selector('#tie-draw-color'), '#00a9ff', _this.toggleDirection),
	            drawRange: new _range2.default(_this.selector('#tie-draw-range'), _consts.defaultDrawRangeValus),
	            drawRangeValue: _this.selector('#tie-draw-range-value')
	        };

	        _this.type = null;
	        _this.color = _this._els.drawColorpicker.color;
	        _this.width = _this._els.drawRange.value;
	        return _this;
	    }

	    /**
	     * Add event for draw
	     * @param {Object} actions - actions for crop
	     *   @param {Function} actions.setDrawMode - set draw mode
	     */


	    _createClass(Draw, [{
	        key: 'addEvent',
	        value: function addEvent(actions) {
	            this.actions = actions;

	            this._els.lineSelectButton.addEventListener('click', this._changeDrawType.bind(this));
	            this._els.drawColorpicker.on('change', this._changeDrawColor.bind(this));
	            this._els.drawRange.on('change', this._changeDrawRange.bind(this));
	            this._els.drawRangeValue.value = this._els.drawRange.value;
	            this._els.drawRangeValue.setAttribute('readonly', true);
	        }

	        /**
	         * set draw mode - action runner
	         */

	    }, {
	        key: 'setDrawMode',
	        value: function setDrawMode() {
	            this.actions.setDrawMode(this.type, {
	                width: this.width,
	                color: _util2.default.getRgb(this.color, DRAW_OPACITY)
	            });
	        }

	        /**
	         * Returns the menu to its default state.
	         */

	    }, {
	        key: 'changeStandbyMode',
	        value: function changeStandbyMode() {
	            this.type = null;
	            this.actions.stopDrawingMode();
	            this.actions.changeSelectableAll(true);
	            this._els.lineSelectButton.classList.remove('free');
	            this._els.lineSelectButton.classList.remove('line');
	        }

	        /**
	         * Executed when the menu starts.
	         */

	    }, {
	        key: 'changeStartMode',
	        value: function changeStartMode() {
	            this.type = 'free';
	            this._els.lineSelectButton.classList.add('free');
	            this.setDrawMode();
	        }

	        /**
	         * Change draw type event
	         * @param {object} event - line select event
	         * @private
	         */

	    }, {
	        key: '_changeDrawType',
	        value: function _changeDrawType(event) {
	            var button = event.target.closest('.tui-image-editor-button');
	            if (button) {
	                var lineType = this.getButtonType(button, ['free', 'line']);
	                this.actions.discardSelection();

	                if (this.type === lineType) {
	                    this.changeStandbyMode();

	                    return;
	                }

	                this.changeStandbyMode();
	                this.type = lineType;
	                this._els.lineSelectButton.classList.add(lineType);
	                this.setDrawMode();
	            }
	        }

	        /**
	         * Change drawing color
	         * @param {string} color - select drawing color
	         * @private
	         */

	    }, {
	        key: '_changeDrawColor',
	        value: function _changeDrawColor(color) {
	            this.color = color || 'transparent';
	            if (!this.type) {
	                this.changeStartMode();
	            } else {
	                this.setDrawMode();
	            }
	        }

	        /**
	         * Change drawing Range
	         * @param {number} value - select drawing range
	         * @private
	         */

	    }, {
	        key: '_changeDrawRange',
	        value: function _changeDrawRange(value) {
	            value = _util2.default.toInteger(value);
	            this._els.drawRangeValue.value = value;
	            this.width = value;
	            if (!this.type) {
	                this.changeStartMode();
	            } else {
	                this.setDrawMode();
	            }
	        }
	    }]);

	    return Draw;
	}(_submenuBase2.default);

	exports.default = Draw;

/***/ }),
/* 99 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @param {Object} normal - iconStyle
	 * @param {Object} active - iconStyle
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale,
	        _ref$iconStyle = _ref.iconStyle,
	        normal = _ref$iconStyle.normal,
	        active = _ref$iconStyle.active;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li id="tie-draw-line-select-button">\n            <div class="tui-image-editor-button free">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-draw-free" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-draw-free" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Free') + '\n                </label>\n            </div>\n            <div class="tui-image-editor-button line">\n                <div>\n                    <svg class="svg_ic-submenu">\n                        <use xlink:href="' + normal.path + '#' + normal.name + '-ic-draw-line" class="normal"/>\n                        <use xlink:href="' + active.path + '#' + active.name + '-ic-draw-line" class="active"/>\n                    </svg>\n                </div>\n                <label>\n                    ' + locale.localize('Straight') + '\n                </label>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li>\n            <div id="tie-draw-color" title="' + locale.localize('Color') + '"></div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-newline tui-image-editor-range-wrap">\n            <label class="range">' + locale.localize('Range') + '</label>\n            <div id="tie-draw-range"></div>\n            <input id="tie-draw-range-value" class="tui-image-editor-range-value" value="0" />\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _colorpicker = __webpack_require__(81);

	var _colorpicker2 = _interopRequireDefault(_colorpicker);

	var _range = __webpack_require__(83);

	var _range2 = _interopRequireDefault(_range);

	var _submenuBase = __webpack_require__(84);

	var _submenuBase2 = _interopRequireDefault(_submenuBase);

	var _filter = __webpack_require__(101);

	var _filter2 = _interopRequireDefault(_filter);

	var _util = __webpack_require__(72);

	var _consts = __webpack_require__(73);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var PICKER_CONTROL_HEIGHT = '130px';
	var BLEND_OPTIONS = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
	var FILTER_OPTIONS = ['grayscale', 'invert', 'sepia', 'sepia2', 'blur', 'sharpen', 'emboss', 'remove-white', 'gradient-transparency', 'brightness', 'noise', 'pixelate', 'color-filter', 'tint', 'multiply', 'blend'];

	/**
	 * Filter ui class
	 * @class
	 * @ignore
	 */

	var Filter = function (_Submenu) {
	    _inherits(Filter, _Submenu);

	    function Filter(subMenuElement, _ref) {
	        var locale = _ref.locale,
	            iconStyle = _ref.iconStyle,
	            menuBarPosition = _ref.menuBarPosition;

	        _classCallCheck(this, Filter);

	        var _this = _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).call(this, subMenuElement, {
	            locale: locale,
	            name: 'filter',
	            iconStyle: iconStyle,
	            menuBarPosition: menuBarPosition,
	            templateHtml: _filter2.default
	        }));

	        _this.selectBoxShow = false;

	        _this.checkedMap = {};
	        _this._makeControlElement();
	        return _this;
	    }

	    /**
	     * Add event for filter
	     * @param {Object} actions - actions for crop
	     *   @param {Function} actions.applyFilter - apply filter option
	     */


	    _createClass(Filter, [{
	        key: 'addEvent',
	        value: function addEvent(_ref2) {
	            var _this2 = this;

	            var applyFilter = _ref2.applyFilter;

	            var changeRangeValue = this._changeRangeValue.bind(this, applyFilter);

	            _tuiCodeSnippet2.default.forEach(FILTER_OPTIONS, function (filterName) {
	                var filterCheckElement = _this2.selector('#tie-' + filterName);
	                var filterNameCamelCase = (0, _util.toCamelCase)(filterName);
	                _this2.checkedMap[filterNameCamelCase] = filterCheckElement;

	                filterCheckElement.addEventListener('change', function () {
	                    return changeRangeValue(filterNameCamelCase);
	                });
	            });

	            this._els.removewhiteThresholdRange.on('change', function () {
	                return changeRangeValue('removeWhite');
	            });
	            this._els.removewhiteDistanceRange.on('change', function () {
	                return changeRangeValue('removeWhite');
	            });
	            this._els.gradientTransparencyRange.on('change', function () {
	                return changeRangeValue('gradientTransparency');
	            });
	            this._els.colorfilterThresholeRange.on('change', function () {
	                return changeRangeValue('colorFilter');
	            });
	            this._els.pixelateRange.on('change', function () {
	                return changeRangeValue('pixelate');
	            });
	            this._els.noiseRange.on('change', function () {
	                return changeRangeValue('noise');
	            });
	            this._els.brightnessRange.on('change', function () {
	                return changeRangeValue('brightness');
	            });
	            this._els.blendType.addEventListener('change', function () {
	                return changeRangeValue('blend');
	            });
	            this._els.filterBlendColor.on('change', function () {
	                return changeRangeValue('blend');
	            });
	            this._els.filterMultiplyColor.on('change', function () {
	                return changeRangeValue('multiply');
	            });
	            this._els.tintOpacity.on('change', function () {
	                return changeRangeValue('tint');
	            });
	            this._els.filterTintColor.on('change', function () {
	                return changeRangeValue('tint');
	            });
	            this._els.blendType.addEventListener('click', function (event) {
	                return event.stopPropagation();
	            });
	            this._els.filterMultiplyColor.on('changeShow', this.colorPickerChangeShow.bind(this));
	            this._els.filterTintColor.on('changeShow', this.colorPickerChangeShow.bind(this));
	            this._els.filterBlendColor.on('changeShow', this.colorPickerChangeShow.bind(this));
	        }

	        /**
	         * Add event for filter
	         * @param {Function} applyFilter - actions for firter
	         * @param {string} filterName - filter name
	         */

	    }, {
	        key: '_changeRangeValue',
	        value: function _changeRangeValue(applyFilter, filterName) {
	            var apply = this.checkedMap[filterName].checked;
	            var type = filterName;

	            var checkboxGroup = this.checkedMap[filterName].closest('.tui-image-editor-checkbox-group');
	            if (checkboxGroup) {
	                if (apply) {
	                    checkboxGroup.classList.remove('tui-image-editor-disabled');
	                } else {
	                    checkboxGroup.classList.add('tui-image-editor-disabled');
	                }
	            }
	            applyFilter(apply, type, this._getFilterOption(type));
	        }

	        /**
	         * Get filter option
	         * @param {String} type - filter type
	         * @returns {Object} filter option object
	         * @private
	         */

	    }, {
	        key: '_getFilterOption',
	        value: function _getFilterOption(type) {
	            // eslint-disable-line
	            var option = {};
	            switch (type) {
	                case 'removeWhite':
	                    option.threshold = (0, _util.toInteger)(this._els.removewhiteThresholdRange.value);
	                    option.distance = (0, _util.toInteger)(this._els.removewhiteDistanceRange.value);
	                    break;
	                case 'gradientTransparency':
	                    option.threshold = (0, _util.toInteger)(this._els.gradientTransparencyRange.value);
	                    break;
	                case 'colorFilter':
	                    option.color = '#FFFFFF';
	                    option.threshold = this._els.colorfilterThresholeRange.value;
	                    break;
	                case 'pixelate':
	                    option.blocksize = (0, _util.toInteger)(this._els.pixelateRange.value);
	                    break;
	                case 'noise':
	                    option.noise = (0, _util.toInteger)(this._els.noiseRange.value);
	                    break;
	                case 'brightness':
	                    option.brightness = (0, _util.toInteger)(this._els.brightnessRange.value);
	                    break;
	                case 'blend':
	                    option.color = this._els.filterBlendColor.color;
	                    option.mode = this._els.blendType.value;
	                    break;
	                case 'multiply':
	                    option.color = this._els.filterMultiplyColor.color;
	                    break;
	                case 'tint':
	                    option.color = this._els.filterTintColor.color;
	                    option.opacity = this._els.tintOpacity.value;
	                    break;
	                default:
	                    break;
	            }

	            return option;
	        }

	        /**
	         * Make submenu range and colorpicker control
	         * @private
	         */

	    }, {
	        key: '_makeControlElement',
	        value: function _makeControlElement() {
	            var selector = this.selector;

	            this._els = {
	                removewhiteThresholdRange: new _range2.default(selector('#tie-removewhite-threshold-range'), _consts.defaultFilterRangeValus.removewhiteThresholdRange),
	                removewhiteDistanceRange: new _range2.default(selector('#tie-removewhite-distance-range'), _consts.defaultFilterRangeValus.removewhiteDistanceRange),
	                gradientTransparencyRange: new _range2.default(selector('#tie-gradient-transparency-range'), _consts.defaultFilterRangeValus.gradientTransparencyRange),
	                brightnessRange: new _range2.default(selector('#tie-brightness-range'), _consts.defaultFilterRangeValus.brightnessRange),
	                noiseRange: new _range2.default(selector('#tie-noise-range'), _consts.defaultFilterRangeValus.noiseRange),
	                pixelateRange: new _range2.default(selector('#tie-pixelate-range'), _consts.defaultFilterRangeValus.pixelateRange),
	                colorfilterThresholeRange: new _range2.default(selector('#tie-colorfilter-threshole-range'), _consts.defaultFilterRangeValus.colorfilterThresholeRange),
	                filterTintColor: new _colorpicker2.default(selector('#tie-filter-tint-color'), '#03bd9e', this.toggleDirection),
	                filterMultiplyColor: new _colorpicker2.default(selector('#tie-filter-multiply-color'), '#515ce6', this.toggleDirection),
	                filterBlendColor: new _colorpicker2.default(selector('#tie-filter-blend-color'), '#ffbb3b', this.toggleDirection)
	            };

	            this._els.tintOpacity = this._pickerWithRange(this._els.filterTintColor.pickerControl);
	            this._els.blendType = this._pickerWithSelectbox(this._els.filterBlendColor.pickerControl);

	            this.colorPickerControls.push(this._els.filterTintColor);
	            this.colorPickerControls.push(this._els.filterMultiplyColor);
	            this.colorPickerControls.push(this._els.filterBlendColor);
	        }

	        /**
	         * Make submenu control for picker & range mixin
	         * @param {HTMLElement} pickerControl - pickerControl dom element
	         * @returns {Range}
	         * @private
	         */

	    }, {
	        key: '_pickerWithRange',
	        value: function _pickerWithRange(pickerControl) {
	            var rangeWrap = document.createElement('div');
	            var rangelabel = document.createElement('label');
	            var range = document.createElement('div');

	            range.id = 'tie-filter-tint-opacity';
	            rangelabel.innerHTML = 'Opacity';
	            rangeWrap.appendChild(rangelabel);
	            rangeWrap.appendChild(range);
	            pickerControl.appendChild(rangeWrap);
	            pickerControl.style.height = PICKER_CONTROL_HEIGHT;

	            return new _range2.default(range, _consts.defaultFilterRangeValus.tintOpacityRange);
	        }

	        /**
	         * Make submenu control for picker & selectbox
	         * @param {HTMLElement} pickerControl - pickerControl dom element
	         * @returns {HTMLElement}
	         * @private
	         */

	    }, {
	        key: '_pickerWithSelectbox',
	        value: function _pickerWithSelectbox(pickerControl) {
	            var selectlistWrap = document.createElement('div');
	            var selectlist = document.createElement('select');
	            var optionlist = document.createElement('ul');

	            selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
	            optionlist.className = 'tui-image-editor-selectlist';

	            selectlistWrap.appendChild(selectlist);
	            selectlistWrap.appendChild(optionlist);

	            this._makeSelectOptionList(selectlist);

	            pickerControl.appendChild(selectlistWrap);
	            pickerControl.style.height = PICKER_CONTROL_HEIGHT;

	            this._drawSelectOptionList(selectlist, optionlist);
	            this._pickerWithSelectboxForAddEvent(selectlist, optionlist);

	            return selectlist;
	        }

	        /**
	         * Make selectbox option list custom style
	         * @param {HTMLElement} selectlist - selectbox element
	         * @param {HTMLElement} optionlist - custom option list item element
	         * @private
	         */

	    }, {
	        key: '_drawSelectOptionList',
	        value: function _drawSelectOptionList(selectlist, optionlist) {
	            var options = selectlist.querySelectorAll('option');
	            _tuiCodeSnippet2.default.forEach(options, function (option) {
	                var optionElement = document.createElement('li');
	                optionElement.innerHTML = option.innerHTML;
	                optionElement.setAttribute('data-item', option.value);
	                optionlist.appendChild(optionElement);
	            });
	        }

	        /**
	         * custome selectbox custom event
	         * @param {HTMLElement} selectlist - selectbox element
	         * @param {HTMLElement} optionlist - custom option list item element
	         * @private
	         */

	    }, {
	        key: '_pickerWithSelectboxForAddEvent',
	        value: function _pickerWithSelectboxForAddEvent(selectlist, optionlist) {
	            var _this3 = this;

	            optionlist.addEventListener('click', function (event) {
	                var optionValue = event.target.getAttribute('data-item');
	                var fireEvent = document.createEvent('HTMLEvents');

	                selectlist.querySelector('[value="' + optionValue + '"]').selected = true;
	                fireEvent.initEvent('change', true, true);

	                selectlist.dispatchEvent(fireEvent);

	                _this3.selectBoxShow = false;
	                optionlist.style.display = 'none';
	            });

	            selectlist.addEventListener('mousedown', function (event) {
	                event.preventDefault();
	                _this3.selectBoxShow = !_this3.selectBoxShow;
	                optionlist.style.display = _this3.selectBoxShow ? 'block' : 'none';
	                optionlist.setAttribute('data-selectitem', selectlist.value);
	                optionlist.querySelector('[data-item=\'' + selectlist.value + '\']').classList.add('active');
	            });
	        }

	        /**
	         * Make option list for select control
	         * @param {HTMLElement} selectlist - blend option select list element
	         * @private
	         */

	    }, {
	        key: '_makeSelectOptionList',
	        value: function _makeSelectOptionList(selectlist) {
	            _tuiCodeSnippet2.default.forEach(BLEND_OPTIONS, function (option) {
	                var selectOption = document.createElement('option');
	                selectOption.setAttribute('value', option);
	                selectOption.innerHTML = option.replace(/^[a-z]/, function ($0) {
	                    return $0.toUpperCase();
	                });
	                selectlist.appendChild(selectOption);
	            });
	        }
	    }]);

	    return Filter;
	}(_submenuBase2.default);

	exports.default = Filter;

/***/ }),
/* 101 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	/**
	 * @param {Locale} locale - Translate text
	 * @returns {string}
	 */
	exports.default = function (_ref) {
	    var locale = _ref.locale;
	    return '\n    <ul class="tui-image-editor-submenu-item">\n        <li class="tui-image-editor-submenu-align">\n            <div class="tui-image-editor-checkbox-wrap fixed-width">\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-grayscale">\n                    <label for="tie-grayscale">' + locale.localize('Grayscale') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-invert">\n                    <label for="tie-invert">' + locale.localize('Invert') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-sepia">\n                    <label for="tie-sepia">' + locale.localize('Sepia') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-sepia2">\n                    <label for="tie-sepia2">' + locale.localize('Sepia2') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-blur">\n                    <label for="tie-blur">' + locale.localize('Blur') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-sharpen">\n                    <label for="tie-sharpen">' + locale.localize('Sharpen') + '</label>\n                </div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-emboss">\n                    <label for="tie-emboss">' + locale.localize('Emboss') + '</label>\n                </div>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-submenu-align">\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled" style="margin-bottom: 7px;">\n                <div class="tui-image-editor-checkbox-wrap">\n                    <div class="tui-image-editor-checkbox">\n                        <input type="checkbox" id="tie-remove-white">\n                        <label for="tie-remove-white">' + locale.localize('Remove White') + '</label>\n                    </div>\n                </div>\n                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">\n                    <label>' + locale.localize('Threshold') + '</label>\n                    <div id="tie-removewhite-threshold-range"></div>\n                </div>\n                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">\n                    <label>' + locale.localize('Distance') + '</label>\n                    <div id="tie-removewhite-distance-range"></div>\n                </div>\n            </div>\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">\n                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">\n                    <div class="tui-image-editor-checkbox">\n                        <input type="checkbox" id="tie-gradient-transparency">\n                        <label for="tie-gradient-transparency">' + locale.localize('Gradient transparency') + '</label>\n                    </div>\n                </div>\n                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">\n                    <label>' + locale.localize('Value') + '</label>\n                    <div id="tie-gradient-transparency-range"></div>\n                </div>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition only-left-right">\n            <div></div>\n        </li>\n        <li class="tui-image-editor-submenu-align">\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-brightness">\n                    <label for="tie-brightness">' + locale.localize('Brightness') + '</label>\n                </div>\n                <div class="tui-image-editor-range-wrap short">\n                    <div id="tie-brightness-range"></div>\n                </div>\n            </div>\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-noise">\n                    <label for="tie-noise">' + locale.localize('Noise') + '</label>\n                </div>\n                <div class="tui-image-editor-range-wrap short">\n                    <div id="tie-noise-range"></div>\n                </div>\n            </div>\n\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-pixelate">\n                    <label for="tie-pixelate">' + locale.localize('Pixelate') + '</label>\n                </div>\n                <div class="tui-image-editor-range-wrap short">\n                    <div id="tie-pixelate-range"></div>\n                </div>\n            </div>\n            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">\n                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">\n                    <div class="tui-image-editor-checkbox">\n                        <input type="checkbox" id="tie-color-filter">\n                        <label for="tie-color-filter">' + locale.localize('Color Filter') + '</label>\n                    </div>\n                </div>\n                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">\n                    <label>' + locale.localize('Threshold') + '</label>\n                    <div id="tie-colorfilter-threshole-range"></div>\n                </div>\n            </div>\n        </li>\n        <li class="tui-image-editor-partition">\n            <div></div>\n        </li>\n        <li>\n            <div class="filter-color-item">\n                <div id="tie-filter-tint-color" title="' + locale.localize('Tint') + '"></div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-tint">\n                    <label for="tie-tint"></label>\n                </div>\n            </div>\n            <div class="filter-color-item">\n                <div id="tie-filter-multiply-color" title="' + locale.localize('Multiply') + '"></div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-multiply">\n                    <label for="tie-multiply"></label>\n                </div>\n            </div>\n            <div class="filter-color-item">\n                <div id="tie-filter-blend-color" title="' + locale.localize('Blend') + '"></div>\n                <div class="tui-image-editor-checkbox">\n                    <input type="checkbox" id="tie-blend">\n                    <label for="tie-blend"></label>\n                </div>\n            </div>\n        </li>\n    </ul>\n';
	};

/***/ }),
/* 102 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Translate messages
	 */
	var Locale = function () {
	    function Locale(locale) {
	        _classCallCheck(this, Locale);

	        this._locale = locale;
	    }

	    /**
	     * localize message
	     * @param {string} message - message who will be localized
	     * @returns {string}
	     */


	    _createClass(Locale, [{
	        key: "localize",
	        value: function localize(message) {
	            return this._locale[message] || message;
	        }
	    }]);

	    return Locale;
	}();

	exports.default = Locale;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _tuiCodeSnippet = __webpack_require__(3);

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	var _imagetracer = __webpack_require__(104);

	var _imagetracer2 = _interopRequireDefault(_imagetracer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {

	    /**
	     * Get ui actions
	     * @returns {Object} actions for ui
	     * @private
	     */
	    getActions: function getActions() {
	        return {
	            main: this._mainAction(),
	            shape: this._shapeAction(),
	            crop: this._cropAction(),
	            flip: this._flipAction(),
	            rotate: this._rotateAction(),
	            text: this._textAction(),
	            mask: this._maskAction(),
	            draw: this._drawAction(),
	            icon: this._iconAction(),
	            filter: this._filterAction()
	        };
	    },


	    /**
	     * Main Action
	     * @returns {Object} actions for ui main
	     * @private
	     */
	    _mainAction: function _mainAction() {
	        var _this = this;

	        var exitCropOnAction = function exitCropOnAction() {
	            if (_this.ui.submenu === 'crop') {
	                _this.stopDrawingMode();
	                _this.ui.changeMenu('crop');
	            }
	        };

	        return (0, _tuiCodeSnippet.extend)({
	            initLoadImage: function initLoadImage(imagePath, imageName) {
	                return _this.loadImageFromURL(imagePath, imageName).then(function (sizeValue) {
	                    exitCropOnAction();
	                    _this.ui.initializeImgUrl = imagePath;
	                    _this.ui.resizeEditor({ imageSize: sizeValue });
	                    _this.clearUndoStack();
	                });
	            },
	            undo: function undo() {
	                if (!_this.isEmptyUndoStack()) {
	                    exitCropOnAction();
	                    _this.undo();
	                }
	            },
	            redo: function redo() {
	                if (!_this.isEmptyRedoStack()) {
	                    exitCropOnAction();
	                    _this.redo();
	                }
	            },
	            reset: function reset() {
	                exitCropOnAction();
	                _this.loadImageFromURL(_this.ui.initializeImgUrl, 'resetImage').then(function (sizeValue) {
	                    exitCropOnAction();
	                    _this.ui.resizeEditor({ imageSize: sizeValue });
	                    _this.clearUndoStack();
	                });
	            },
	            delete: function _delete() {
	                _this.ui.changeDeleteButtonEnabled(false);
	                exitCropOnAction();
	                _this.removeActiveObject();
	                _this.activeObjectId = null;
	            },
	            deleteAll: function deleteAll() {
	                exitCropOnAction();
	                _this.clearObjects();
	                _this.ui.changeDeleteButtonEnabled(false);
	                _this.ui.changeDeleteAllButtonEnabled(false);
	            },
	            load: function load(file) {
	                if (!_util2.default.isSupportFileApi()) {
	                    alert('This browser does not support file-api');
	                }

	                _this.ui.initializeImgUrl = URL.createObjectURL(file);
	                _this.loadImageFromFile(file).then(function (sizeValue) {
	                    exitCropOnAction();
	                    _this.clearUndoStack();
	                    _this.ui.activeMenuEvent();
	                    _this.ui.resizeEditor({ imageSize: sizeValue });
	                })['catch'](function (message) {
	                    return Promise.reject(message);
	                });
	            },
	            download: function download() {
	                var dataURL = _this.toDataURL();
	                var imageName = _this.getImageName();
	                var blob = void 0,
	                    type = void 0,
	                    w = void 0;

	                if (_util2.default.isSupportFileApi() && window.saveAs) {
	                    blob = _util2.default.base64ToBlob(dataURL);
	                    type = blob.type.split('/')[1];
	                    if (imageName.split('.').pop() !== type) {
	                        imageName += '.' + type;
	                    }
	                    saveAs(blob, imageName); // eslint-disable-line
	                } else {
	                    w = window.open();
	                    w.document.body.innerHTML = '<img src=\'' + dataURL + '\'>';
	                }
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Icon Action
	     * @returns {Object} actions for ui icon
	     * @private
	     */
	    _iconAction: function _iconAction() {
	        var _this2 = this;

	        var cacheIconType = void 0;
	        var cacheIconColor = void 0;
	        var startX = void 0;
	        var startY = void 0;
	        var iconWidth = void 0;
	        var iconHeight = void 0;
	        var objId = void 0;

	        this.on({
	            'iconCreateResize': function iconCreateResize(_ref) {
	                var moveOriginPointer = _ref.moveOriginPointer;

	                var scaleX = (moveOriginPointer.x - startX) / iconWidth;
	                var scaleY = (moveOriginPointer.y - startY) / iconHeight;

	                _this2.setObjectPropertiesQuietly(objId, {
	                    scaleX: Math.abs(scaleX * 2),
	                    scaleY: Math.abs(scaleY * 2)
	                });
	            },
	            'iconCreateEnd': function iconCreateEnd() {
	                _this2.ui.icon.clearIconType();
	                _this2.changeSelectableAll(true);
	            }
	        });

	        var mouseDown = function mouseDown(e, originPointer) {
	            startX = originPointer.x;
	            startY = originPointer.y;

	            _this2.addIcon(cacheIconType, {
	                left: originPointer.x,
	                top: originPointer.y,
	                fill: cacheIconColor
	            }).then(function (obj) {
	                objId = obj.id;
	                iconWidth = obj.width;
	                iconHeight = obj.height;
	            });
	        };

	        return (0, _tuiCodeSnippet.extend)({
	            changeColor: function changeColor(color) {
	                if (_this2.activeObjectId) {
	                    _this2.changeIconColor(_this2.activeObjectId, color);
	                }
	            },
	            addIcon: function addIcon(iconType, iconColor) {
	                cacheIconType = iconType;
	                cacheIconColor = iconColor;
	                // this.readyAddIcon();
	                _this2.changeCursor('crosshair');
	                _this2.off('mousedown');
	                _this2.once('mousedown', mouseDown.bind(_this2));
	            },
	            cancelAddIcon: function cancelAddIcon() {
	                _this2.off('mousedown');
	                _this2.ui.icon.clearIconType();
	                _this2.changeSelectableAll(true);
	                _this2.changeCursor('default');
	            },
	            registDefalutIcons: function registDefalutIcons(type, path) {
	                var iconObj = {};
	                iconObj[type] = path;
	                _this2.registerIcons(iconObj);
	            },
	            registCustomIcon: function registCustomIcon(imgUrl, file) {
	                var imagetracer = new _imagetracer2.default();
	                imagetracer.imageToSVG(imgUrl, function (svgstr) {
	                    var _svgstr$match = svgstr.match(/path[^>]*d="([^"]*)"/),
	                        svgPath = _svgstr$match[1];

	                    var iconObj = {};
	                    iconObj[file.name] = svgPath;
	                    _this2.registerIcons(iconObj);
	                    _this2.addIcon(file.name, {
	                        left: 100,
	                        top: 100
	                    });
	                }, _imagetracer2.default.tracerDefaultOption());
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Draw Action
	     * @returns {Object} actions for ui draw
	     * @private
	     */
	    _drawAction: function _drawAction() {
	        var _this3 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            setDrawMode: function setDrawMode(type, settings) {
	                _this3.stopDrawingMode();
	                if (type === 'free') {
	                    _this3.startDrawingMode('FREE_DRAWING', settings);
	                } else {
	                    _this3.startDrawingMode('LINE_DRAWING', settings);
	                }
	            },
	            setColor: function setColor(color) {
	                _this3.setBrush({
	                    color: color
	                });
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Mask Action
	     * @returns {Object} actions for ui mask
	     * @private
	     */
	    _maskAction: function _maskAction() {
	        var _this4 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            loadImageFromURL: function loadImageFromURL(imgUrl, file) {
	                return _this4.loadImageFromURL(_this4.toDataURL(), 'FilterImage').then(function () {
	                    _this4.addImageObject(imgUrl).then(function () {
	                        URL.revokeObjectURL(file);
	                    });
	                });
	            },
	            applyFilter: function applyFilter() {
	                _this4.applyFilter('mask', {
	                    maskObjId: _this4.activeObjectId
	                });
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Text Action
	     * @returns {Object} actions for ui text
	     * @private
	     */
	    _textAction: function _textAction() {
	        var _this5 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            changeTextStyle: function changeTextStyle(styleObj) {
	                if (_this5.activeObjectId) {
	                    _this5.changeTextStyle(_this5.activeObjectId, styleObj);
	                }
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Rotate Action
	     * @returns {Object} actions for ui rotate
	     * @private
	     */
	    _rotateAction: function _rotateAction() {
	        var _this6 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            rotate: function rotate(angle) {
	                _this6.rotate(angle);
	                _this6.ui.resizeEditor();
	            },
	            setAngle: function setAngle(angle) {
	                _this6.setAngle(angle);
	                _this6.ui.resizeEditor();
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Shape Action
	     * @returns {Object} actions for ui shape
	     * @private
	     */
	    _shapeAction: function _shapeAction() {
	        var _this7 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            changeShape: function changeShape(changeShapeObject) {
	                if (_this7.activeObjectId) {
	                    _this7.changeShape(_this7.activeObjectId, changeShapeObject);
	                }
	            },
	            setDrawingShape: function setDrawingShape(shapeType) {
	                _this7.setDrawingShape(shapeType);
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Crop Action
	     * @returns {Object} actions for ui crop
	     * @private
	     */
	    _cropAction: function _cropAction() {
	        var _this8 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            crop: function crop() {
	                var cropRect = _this8.getCropzoneRect();
	                if (cropRect) {
	                    _this8.crop(cropRect).then(function () {
	                        _this8.stopDrawingMode();
	                        _this8.ui.resizeEditor();
	                        _this8.ui.changeMenu('crop');
	                    })['catch'](function (message) {
	                        return Promise.reject(message);
	                    });
	                }
	            },
	            cancel: function cancel() {
	                _this8.stopDrawingMode();
	                _this8.ui.changeMenu('crop');
	            },
	            preset: function preset(presetType) {
	                switch (presetType) {
	                    case 'preset-square':
	                        _this8.setCropzoneRect(1 / 1);
	                        break;
	                    case 'preset-3-2':
	                        _this8.setCropzoneRect(3 / 2);
	                        break;
	                    case 'preset-4-3':
	                        _this8.setCropzoneRect(4 / 3);
	                        break;
	                    case 'preset-5-4':
	                        _this8.setCropzoneRect(5 / 4);
	                        break;
	                    case 'preset-7-5':
	                        _this8.setCropzoneRect(7 / 5);
	                        break;
	                    case 'preset-16-9':
	                        _this8.setCropzoneRect(16 / 9);
	                        break;
	                    default:
	                        _this8.setCropzoneRect();
	                        _this8.ui.crop.changeApplyButtonStatus(false);
	                        break;
	                }
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Flip Action
	     * @returns {Object} actions for ui flip
	     * @private
	     */
	    _flipAction: function _flipAction() {
	        var _this9 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            flip: function flip(flipType) {
	                return _this9[flipType]();
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Filter Action
	     * @returns {Object} actions for ui filter
	     * @private
	     */
	    _filterAction: function _filterAction() {
	        var _this10 = this;

	        return (0, _tuiCodeSnippet.extend)({
	            applyFilter: function applyFilter(applying, type, options) {
	                if (applying) {
	                    _this10.applyFilter(type, options);
	                } else if (_this10.hasFilter(type)) {
	                    _this10.removeFilter(type);
	                }
	            }
	        }, this._commonAction());
	    },


	    /**
	     * Image Editor Event Observer
	     */
	    setReAction: function setReAction() {
	        var _this11 = this;

	        this.on({
	            undoStackChanged: function undoStackChanged(length) {
	                if (length) {
	                    _this11.ui.changeUndoButtonStatus(true);
	                    _this11.ui.changeResetButtonStatus(true);
	                } else {
	                    _this11.ui.changeUndoButtonStatus(false);
	                    _this11.ui.changeResetButtonStatus(false);
	                }
	                _this11.ui.resizeEditor();
	            },
	            redoStackChanged: function redoStackChanged(length) {
	                if (length) {
	                    _this11.ui.changeRedoButtonStatus(true);
	                } else {
	                    _this11.ui.changeRedoButtonStatus(false);
	                }
	                _this11.ui.resizeEditor();
	            },
	            /* eslint-disable complexity */
	            objectActivated: function objectActivated(obj) {
	                _this11.activeObjectId = obj.id;

	                _this11.ui.changeDeleteButtonEnabled(true);
	                _this11.ui.changeDeleteAllButtonEnabled(true);

	                if (obj.type === 'cropzone') {
	                    _this11.ui.crop.changeApplyButtonStatus(true);
	                } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
	                    _this11.stopDrawingMode();
	                    if (_this11.ui.submenu !== 'shape') {
	                        _this11.ui.changeMenu('shape', false, false);
	                    }
	                    _this11.ui.shape.setShapeStatus({
	                        strokeColor: obj.stroke,
	                        strokeWidth: obj.strokeWidth,
	                        fillColor: obj.fill
	                    });

	                    _this11.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
	                } else if (obj.type === 'path' || obj.type === 'line') {
	                    if (_this11.ui.submenu !== 'draw') {
	                        _this11.ui.changeMenu('draw', false, false);
	                        _this11.ui.draw.changeStandbyMode();
	                    }
	                } else if (['i-text', 'text'].indexOf(obj.type) > -1) {
	                    if (_this11.ui.submenu !== 'text') {
	                        _this11.ui.changeMenu('text', false, false);
	                    }
	                } else if (obj.type === 'icon') {
	                    _this11.stopDrawingMode();
	                    if (_this11.ui.submenu !== 'icon') {
	                        _this11.ui.changeMenu('icon', false, false);
	                    }
	                    _this11.ui.icon.setIconPickerColor(obj.fill);
	                }
	            },
	            /* eslint-enable complexity */
	            addText: function addText(pos) {
	                _this11.addText('Double Click', {
	                    position: pos.originPosition,
	                    styles: {
	                        fill: _this11.ui.text.textColor,
	                        fontSize: _util2.default.toInteger(_this11.ui.text.fontSize),
	                        fontFamily: 'Noto Sans'
	                    }
	                }).then(function () {
	                    _this11.changeCursor('default');
	                });
	            },
	            addObjectAfter: function addObjectAfter(obj) {
	                if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
	                    _this11.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
	                    _this11.ui.shape.changeStandbyMode();
	                }
	            },
	            objectScaled: function objectScaled(obj) {
	                if (['i-text', 'text'].indexOf(obj.type) > -1) {
	                    _this11.ui.text.fontSize = _util2.default.toInteger(obj.fontSize);
	                } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) >= 0) {
	                    var width = obj.width,
	                        height = obj.height;

	                    var strokeValue = _this11.ui.shape.getStrokeValue();

	                    if (width < strokeValue) {
	                        _this11.ui.shape.setStrokeValue(width);
	                    }
	                    if (height < strokeValue) {
	                        _this11.ui.shape.setStrokeValue(height);
	                    }
	                }
	            },
	            selectionCleared: function selectionCleared() {
	                _this11.activeObjectId = null;
	                if (_this11.ui.submenu === 'text') {
	                    _this11.changeCursor('text');
	                } else if (_this11.ui.submenu !== 'draw' && _this11.ui.submenu !== 'crop') {
	                    _this11.stopDrawingMode();
	                }
	            }
	        });
	    },


	    /**
	     * Common Action
	     * @returns {Object} common actions for ui
	     * @private
	     */
	    _commonAction: function _commonAction() {
	        var _this12 = this;

	        return {
	            modeChange: function modeChange(menu) {
	                switch (menu) {
	                    case 'text':
	                        _this12._changeActivateMode('TEXT');
	                        break;
	                    case 'crop':
	                        _this12.startDrawingMode('CROPPER');
	                        break;
	                    case 'shape':
	                        _this12._changeActivateMode('SHAPE');
	                        _this12.setDrawingShape(_this12.ui.shape.type, _this12.ui.shape.options);
	                        break;
	                    default:
	                        break;
	                }
	            },
	            deactivateAll: this.deactivateAll.bind(this),
	            changeSelectableAll: this.changeSelectableAll.bind(this),
	            discardSelection: this.discardSelection.bind(this),
	            stopDrawingMode: this.stopDrawingMode.bind(this)
	        };
	    },


	    /**
	     * Mixin
	     * @param {ImageEditor} ImageEditor instance
	     */
	    mixin: function mixin(ImageEditor) {
	        (0, _tuiCodeSnippet.extend)(ImageEditor.prototype, this);
	    }
	};

/***/ }),
/* 104 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	  imagetracer.js version 1.2.4
	  Simple raster image tracer and vectorizer written in JavaScript.
	  andras@jankovics.net
	*/

	/*
	  The Unlicense / PUBLIC DOMAIN
	  This is free and unencumbered software released into the public domain.
	  Anyone is free to copy, modify, publish, use, compile, sell, or
	  distribute this software, either in source code form or as a compiled
	  binary, for any purpose, commercial or non-commercial, and by any
	  means.
	  In jurisdictions that recognize copyright laws, the author or authors
	  of this software dedicate any and all copyright interest in the
	  software to the public domain. We make this dedication for the benefit
	  of the public at large and to the detriment of our heirs and
	  successors. We intend this dedication to be an overt act of
	  relinquishment in perpetuity of all present and future rights to this
	  software under copyright law.
	  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	  IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	  OTHER DEALINGS IN THE SOFTWARE.
	  For more information, please refer to http://unlicense.org/
	*/
	var ImageTracer = function () {
	    _createClass(ImageTracer, null, [{
	        key: 'tracerDefaultOption',
	        value: function tracerDefaultOption() {
	            return {
	                pathomit: 100,
	                ltres: 0.1,
	                qtres: 1,

	                scale: 1,
	                strokewidth: 5,
	                viewbox: false,
	                linefilter: true,
	                desc: false,
	                rightangleenhance: false,
	                pal: [{
	                    r: 0,
	                    g: 0,
	                    b: 0,
	                    a: 255
	                }, {
	                    r: 255,
	                    g: 255,
	                    b: 255,
	                    a: 255
	                }]
	            };
	        }
	        /* eslint-disable */

	    }]);

	    function ImageTracer() {
	        _classCallCheck(this, ImageTracer);

	        this.versionnumber = '1.2.4';
	        this.optionpresets = {
	            default: {
	                corsenabled: false,
	                ltres: 1,
	                qtres: 1,
	                pathomit: 8,
	                rightangleenhance: true,
	                colorsampling: 2,
	                numberofcolors: 16,
	                mincolorratio: 0,
	                colorquantcycles: 3,
	                layering: 0,
	                strokewidth: 1,
	                linefilter: false,
	                scale: 1,
	                roundcoords: 1,
	                viewbox: false,
	                desc: false,
	                lcpr: 0,
	                qcpr: 0,
	                blurradius: 0,
	                blurdelta: 20
	            },
	            'posterized1': {
	                colorsampling: 0,
	                numberofcolors: 2
	            },
	            'posterized2': {
	                numberofcolors: 4,
	                blurradius: 5
	            },
	            'curvy': {
	                ltres: 0.01,
	                linefilter: true,
	                rightangleenhance: false },
	            'sharp': { qtres: 0.01,
	                linefilter: false },
	            'detailed': { pathomit: 0,
	                roundcoords: 2,
	                ltres: 0.5,
	                qtres: 0.5,
	                numberofcolors: 64 },
	            'smoothed': { blurradius: 5,
	                blurdelta: 64 },
	            'grayscale': { colorsampling: 0,
	                colorquantcycles: 1,
	                numberofcolors: 7 },
	            'fixedpalette': { colorsampling: 0,
	                colorquantcycles: 1,
	                numberofcolors: 27 },
	            'randomsampling1': { colorsampling: 1,
	                numberofcolors: 8 },
	            'randomsampling2': { colorsampling: 1,
	                numberofcolors: 64 },
	            'artistic1': { colorsampling: 0,
	                colorquantcycles: 1,
	                pathomit: 0,
	                blurradius: 5,
	                blurdelta: 64,
	                ltres: 0.01,
	                linefilter: true,
	                numberofcolors: 16,
	                strokewidth: 2 },
	            'artistic2': { qtres: 0.01,
	                colorsampling: 0,
	                colorquantcycles: 1,
	                numberofcolors: 4,
	                strokewidth: 0 },
	            'artistic3': { qtres: 10,
	                ltres: 10,
	                numberofcolors: 8 },
	            'artistic4': { qtres: 10,
	                ltres: 10,
	                numberofcolors: 64,
	                blurradius: 5,
	                blurdelta: 256,
	                strokewidth: 2 },
	            'posterized3': { ltres: 1,
	                qtres: 1,
	                pathomit: 20,
	                rightangleenhance: true,
	                colorsampling: 0,
	                numberofcolors: 3,
	                mincolorratio: 0,
	                colorquantcycles: 3,
	                blurradius: 3,
	                blurdelta: 20,
	                strokewidth: 0,
	                linefilter: false,
	                roundcoords: 1,
	                pal: [{ r: 0,
	                    g: 0,
	                    b: 100,
	                    a: 255 }, { r: 255,
	                    g: 255,
	                    b: 255,
	                    a: 255 }] }
	        };

	        this.pathscan_combined_lookup = [[[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]], [[0, 1, 0, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [0, 2, -1, 0]], [[-1, -1, -1, -1], [-1, -1, -1, -1], [0, 1, 0, -1], [0, 0, 1, 0]], [[0, 0, 1, 0], [-1, -1, -1, -1], [0, 2, -1, 0], [-1, -1, -1, -1]], [[-1, -1, -1, -1], [0, 0, 1, 0], [0, 3, 0, 1], [-1, -1, -1, -1]], [[13, 3, 0, 1], [13, 2, -1, 0], [7, 1, 0, -1], [7, 0, 1, 0]], [[-1, -1, -1, -1], [0, 1, 0, -1], [-1, -1, -1, -1], [0, 3, 0, 1]], [[0, 3, 0, 1], [0, 2, -1, 0], [-1, -1, -1, -1], [-1, -1, -1, -1]], [[0, 3, 0, 1], [0, 2, -1, 0], [-1, -1, -1, -1], [-1, -1, -1, -1]], [[-1, -1, -1, -1], [0, 1, 0, -1], [-1, -1, -1, -1], [0, 3, 0, 1]], [[11, 1, 0, -1], [14, 0, 1, 0], [14, 3, 0, 1], [11, 2, -1, 0]], [[-1, -1, -1, -1], [0, 0, 1, 0], [0, 3, 0, 1], [-1, -1, -1, -1]], [[0, 0, 1, 0], [-1, -1, -1, -1], [0, 2, -1, 0], [-1, -1, -1, -1]], [[-1, -1, -1, -1], [-1, -1, -1, -1], [0, 1, 0, -1], [0, 0, 1, 0]], [[0, 1, 0, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [0, 2, -1, 0]], [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]];

	        this.gks = [[0.27901, 0.44198, 0.27901], [0.135336, 0.228569, 0.272192, 0.228569, 0.135336], [0.086776, 0.136394, 0.178908, 0.195843, 0.178908, 0.136394, 0.086776], [0.063327, 0.093095, 0.122589, 0.144599, 0.152781, 0.144599, 0.122589, 0.093095, 0.063327], [0.049692, 0.069304, 0.089767, 0.107988, 0.120651, 0.125194, 0.120651, 0.107988, 0.089767, 0.069304, 0.049692]];

	        this.specpalette = [{ r: 0, g: 0, b: 0, a: 255 }, { r: 128, g: 128, b: 128, a: 255 }, { r: 0, g: 0, b: 128, a: 255 }, { r: 64, g: 64, b: 128, a: 255 }, { r: 192, g: 192, b: 192, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }, { r: 128, g: 128, b: 192, a: 255 }, { r: 0, g: 0, b: 192, a: 255 }, { r: 128, g: 0, b: 0, a: 255 }, { r: 128, g: 64, b: 64, a: 255 }, { r: 128, g: 0, b: 128, a: 255 }, { r: 168, g: 168, b: 168, a: 255 }, { r: 192, g: 128, b: 128, a: 255 }, { r: 192, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }, { r: 0, g: 128, b: 0, a: 255 }];
	    }

	    _createClass(ImageTracer, [{
	        key: 'imageToSVG',
	        value: function imageToSVG(url, callback, options) {
	            var _this = this;

	            options = this.checkoptions(options);
	            this.loadImage(url, function (canvas) {
	                callback(_this.imagedataToSVG(_this.getImgdata(canvas), options));
	            }, options);
	        }
	    }, {
	        key: 'imagedataToSVG',
	        value: function imagedataToSVG(imgd, options) {
	            options = this.checkoptions(options);
	            var td = this.imagedataToTracedata(imgd, options);

	            return this.getsvgstring(td, options);
	        }
	    }, {
	        key: 'imageToTracedata',
	        value: function imageToTracedata(url, callback, options) {
	            var _this2 = this;

	            options = this.checkoptions(options);
	            this.loadImage(url, function (canvas) {
	                callback(_this2.imagedataToTracedata(_this2.getImgdata(canvas), options));
	            }, options);
	        }
	    }, {
	        key: 'imagedataToTracedata',
	        value: function imagedataToTracedata(imgd, options) {
	            options = this.checkoptions(options);
	            var ii = this.colorquantization(imgd, options);
	            var tracedata = void 0;
	            if (options.layering === 0) {
	                tracedata = {
	                    layers: [],
	                    palette: ii.palette,
	                    width: ii.array[0].length - 2,
	                    height: ii.array.length - 2
	                };

	                for (var colornum = 0; colornum < ii.palette.length; colornum += 1) {
	                    var tracedlayer = this.batchtracepaths(this.internodes(this.pathscan(this.layeringstep(ii, colornum), options.pathomit), options), options.ltres, options.qtres);
	                    tracedata.layers.push(tracedlayer);
	                }
	            } else {
	                var ls = this.layering(ii);
	                if (options.layercontainerid) {
	                    this.drawLayers(ls, this.specpalette, options.scale, options.layercontainerid);
	                }
	                var bps = this.batchpathscan(ls, options.pathomit);
	                var bis = this.batchinternodes(bps, options);
	                tracedata = {
	                    layers: this.batchtracelayers(bis, options.ltres, options.qtres),
	                    palette: ii.palette,
	                    width: imgd.width,
	                    height: imgd.height
	                };
	            }

	            return tracedata;
	        }
	    }, {
	        key: 'checkoptions',
	        value: function checkoptions(options) {
	            options = options || {};
	            if (typeof options === 'string') {
	                options = options.toLowerCase();
	                if (this.optionpresets[options]) {
	                    options = this.optionpresets[options];
	                } else {
	                    options = {};
	                }
	            }
	            var ok = Object.keys(this.optionpresets['default']);
	            for (var k = 0; k < ok.length; k += 1) {
	                if (!options.hasOwnProperty(ok[k])) {
	                    options[ok[k]] = this.optionpresets['default'][ok[k]];
	                }
	            }

	            return options;
	        }
	    }, {
	        key: 'colorquantization',
	        value: function colorquantization(imgd, options) {
	            var arr = [];
	            var idx = 0;
	            var cd = void 0;
	            var cdl = void 0;
	            var ci = void 0;
	            var paletteacc = [];
	            var pixelnum = imgd.width * imgd.height;
	            var i = void 0;
	            var j = void 0;
	            var k = void 0;
	            var cnt = void 0;
	            var palette = void 0;

	            for (j = 0; j < imgd.height + 2; j += 1) {
	                arr[j] = [];
	                for (i = 0; i < imgd.width + 2; i += 1) {
	                    arr[j][i] = -1;
	                }
	            }
	            if (options.pal) {
	                palette = options.pal;
	            } else if (options.colorsampling === 0) {
	                palette = this.generatepalette(options.numberofcolors);
	            } else if (options.colorsampling === 1) {
	                palette = this.samplepalette(options.numberofcolors, imgd);
	            } else {
	                palette = this.samplepalette2(options.numberofcolors, imgd);
	            }
	            if (options.blurradius > 0) {
	                imgd = this.blur(imgd, options.blurradius, options.blurdelta);
	            }
	            for (cnt = 0; cnt < options.colorquantcycles; cnt += 1) {
	                if (cnt > 0) {
	                    for (k = 0; k < palette.length; k += 1) {
	                        if (paletteacc[k].n > 0) {
	                            palette[k] = { r: Math.floor(paletteacc[k].r / paletteacc[k].n),
	                                g: Math.floor(paletteacc[k].g / paletteacc[k].n),
	                                b: Math.floor(paletteacc[k].b / paletteacc[k].n),
	                                a: Math.floor(paletteacc[k].a / paletteacc[k].n) };
	                        }

	                        if (paletteacc[k].n / pixelnum < options.mincolorratio && cnt < options.colorquantcycles - 1) {
	                            palette[k] = { r: Math.floor(Math.random() * 255),
	                                g: Math.floor(Math.random() * 255),
	                                b: Math.floor(Math.random() * 255),
	                                a: Math.floor(Math.random() * 255) };
	                        }
	                    }
	                }

	                for (i = 0; i < palette.length; i += 1) {
	                    paletteacc[i] = { r: 0,
	                        g: 0,
	                        b: 0,
	                        a: 0,
	                        n: 0 };
	                }

	                for (j = 0; j < imgd.height; j += 1) {
	                    for (i = 0; i < imgd.width; i += 1) {
	                        idx = (j * imgd.width + i) * 4;

	                        ci = 0;
	                        cdl = 1024;
	                        for (k = 0; k < palette.length; k += 1) {
	                            cd = Math.abs(palette[k].r - imgd.data[idx]) + Math.abs(palette[k].g - imgd.data[idx + 1]) + Math.abs(palette[k].b - imgd.data[idx + 2]) + Math.abs(palette[k].a - imgd.data[idx + 3]);

	                            if (cd < cdl) {
	                                cdl = cd;
	                                ci = k;
	                            }
	                        }

	                        paletteacc[ci].r += imgd.data[idx];
	                        paletteacc[ci].g += imgd.data[idx + 1];
	                        paletteacc[ci].b += imgd.data[idx + 2];
	                        paletteacc[ci].a += imgd.data[idx + 3];
	                        paletteacc[ci].n += 1;

	                        arr[j + 1][i + 1] = ci;
	                    }
	                }
	            }

	            return { array: arr,
	                palette: palette };
	        }
	    }, {
	        key: 'samplepalette',
	        value: function samplepalette(numberofcolors, imgd) {
	            var idx = void 0;
	            var palette = [];
	            for (var i = 0; i < numberofcolors; i += 1) {
	                idx = Math.floor(Math.random() * imgd.data.length / 4) * 4;
	                palette.push({ r: imgd.data[idx],
	                    g: imgd.data[idx + 1],
	                    b: imgd.data[idx + 2],
	                    a: imgd.data[idx + 3] });
	            }

	            return palette;
	        }
	    }, {
	        key: 'samplepalette2',
	        value: function samplepalette2(numberofcolors, imgd) {
	            var idx = void 0;
	            var palette = [];
	            var ni = Math.ceil(Math.sqrt(numberofcolors));
	            var nj = Math.ceil(numberofcolors / ni);
	            var vx = imgd.width / (ni + 1);
	            var vy = imgd.height / (nj + 1);
	            for (var j = 0; j < nj; j += 1) {
	                for (var i = 0; i < ni; i += 1) {
	                    if (palette.length === numberofcolors) {
	                        break;
	                    } else {
	                        idx = Math.floor((j + 1) * vy * imgd.width + (i + 1) * vx) * 4;
	                        palette.push({ r: imgd.data[idx],
	                            g: imgd.data[idx + 1],
	                            b: imgd.data[idx + 2],
	                            a: imgd.data[idx + 3] });
	                    }
	                }
	            }

	            return palette;
	        }
	    }, {
	        key: 'generatepalette',
	        value: function generatepalette(numberofcolors) {
	            var palette = [];
	            var rcnt = void 0;
	            var gcnt = void 0;
	            var bcnt = void 0;
	            if (numberofcolors < 8) {
	                var graystep = Math.floor(255 / (numberofcolors - 1));
	                for (var i = 0; i < numberofcolors; i += 1) {
	                    palette.push({ r: i * graystep,
	                        g: i * graystep,
	                        b: i * graystep,
	                        a: 255 });
	                }
	            } else {
	                var colorqnum = Math.floor(Math.pow(numberofcolors, 1 / 3));
	                var colorstep = Math.floor(255 / (colorqnum - 1));
	                var rndnum = numberofcolors - colorqnum * colorqnum * colorqnum;
	                for (rcnt = 0; rcnt < colorqnum; rcnt += 1) {
	                    for (gcnt = 0; gcnt < colorqnum; gcnt += 1) {
	                        for (bcnt = 0; bcnt < colorqnum; bcnt += 1) {
	                            palette.push({ r: rcnt * colorstep,
	                                g: gcnt * colorstep,
	                                b: bcnt * colorstep,
	                                a: 255 });
	                        }
	                    }
	                }
	                for (rcnt = 0; rcnt < rndnum; rcnt += 1) {
	                    palette.push({ r: Math.floor(Math.random() * 255),
	                        g: Math.floor(Math.random() * 255),
	                        b: Math.floor(Math.random() * 255),
	                        a: Math.floor(Math.random() * 255) });
	                }
	            }

	            return palette;
	        }
	    }, {
	        key: 'layering',
	        value: function layering(ii) {
	            var layers = [];
	            var val = 0;
	            var ah = ii.array.length;
	            var aw = ii.array[0].length;
	            var n1 = void 0;
	            var n2 = void 0;
	            var n3 = void 0;
	            var n4 = void 0;
	            var n5 = void 0;
	            var n6 = void 0;
	            var n7 = void 0;
	            var n8 = void 0;
	            var i = void 0;
	            var j = void 0;
	            var k = void 0;
	            for (k = 0; k < ii.palette.length; k += 1) {
	                layers[k] = [];
	                for (j = 0; j < ah; j += 1) {
	                    layers[k][j] = [];
	                    for (i = 0; i < aw; i += 1) {
	                        layers[k][j][i] = 0;
	                    }
	                }
	            }
	            for (j = 1; j < ah - 1; j += 1) {
	                for (i = 1; i < aw - 1; i += 1) {
	                    val = ii.array[j][i];

	                    n1 = ii.array[j - 1][i - 1] === val ? 1 : 0;
	                    n2 = ii.array[j - 1][i] === val ? 1 : 0;
	                    n3 = ii.array[j - 1][i + 1] === val ? 1 : 0;
	                    n4 = ii.array[j][i - 1] === val ? 1 : 0;
	                    n5 = ii.array[j][i + 1] === val ? 1 : 0;
	                    n6 = ii.array[j + 1][i - 1] === val ? 1 : 0;
	                    n7 = ii.array[j + 1][i] === val ? 1 : 0;
	                    n8 = ii.array[j + 1][i + 1] === val ? 1 : 0;

	                    layers[val][j + 1][i + 1] = 1 + n5 * 2 + n8 * 4 + n7 * 8;
	                    if (!n4) {
	                        layers[val][j + 1][i] = 0 + 2 + n7 * 4 + n6 * 8;
	                    }
	                    if (!n2) {
	                        layers[val][j][i + 1] = 0 + n3 * 2 + n5 * 4 + 8;
	                    }
	                    if (!n1) {
	                        layers[val][j][i] = 0 + n2 * 2 + 4 + n4 * 8;
	                    }
	                }
	            }

	            return layers;
	        }
	    }, {
	        key: 'layeringstep',
	        value: function layeringstep(ii, cnum) {
	            var layer = [];
	            var ah = ii.array.length;
	            var aw = ii.array[0].length;
	            var i = void 0;
	            var j = void 0;
	            for (j = 0; j < ah; j += 1) {
	                layer[j] = [];
	                for (i = 0; i < aw; i += 1) {
	                    layer[j][i] = 0;
	                }
	            }
	            for (j = 1; j < ah; j += 1) {
	                for (i = 1; i < aw; i += 1) {
	                    layer[j][i] = (ii.array[j - 1][i - 1] === cnum ? 1 : 0) + (ii.array[j - 1][i] === cnum ? 2 : 0) + (ii.array[j][i - 1] === cnum ? 8 : 0) + (ii.array[j][i] === cnum ? 4 : 0);
	                }
	            }

	            return layer;
	        }
	    }, {
	        key: 'pathscan',
	        value: function pathscan(arr, pathomit) {
	            var paths = [];
	            var pacnt = 0;
	            var pcnt = 0;
	            var px = 0;
	            var py = 0;
	            var w = arr[0].length;
	            var h = arr.length;
	            var dir = 0;
	            var pathfinished = true;
	            var holepath = false;
	            var lookuprow = void 0;
	            for (var j = 0; j < h; j += 1) {
	                for (var i = 0; i < w; i += 1) {
	                    if (arr[j][i] === 4 || arr[j][i] === 11) {
	                        px = i;
	                        py = j;
	                        paths[pacnt] = {};
	                        paths[pacnt].points = [];
	                        paths[pacnt].boundingbox = [px, py, px, py];
	                        paths[pacnt].holechildren = [];
	                        pathfinished = false;
	                        pcnt = 0;
	                        holepath = arr[j][i] === 11;
	                        dir = 1;

	                        while (!pathfinished) {
	                            paths[pacnt].points[pcnt] = {};
	                            paths[pacnt].points[pcnt].x = px - 1;
	                            paths[pacnt].points[pcnt].y = py - 1;
	                            paths[pacnt].points[pcnt].t = arr[py][px];

	                            if (px - 1 < paths[pacnt].boundingbox[0]) {
	                                paths[pacnt].boundingbox[0] = px - 1;
	                            }
	                            if (px - 1 > paths[pacnt].boundingbox[2]) {
	                                paths[pacnt].boundingbox[2] = px - 1;
	                            }
	                            if (py - 1 < paths[pacnt].boundingbox[1]) {
	                                paths[pacnt].boundingbox[1] = py - 1;
	                            }
	                            if (py - 1 > paths[pacnt].boundingbox[3]) {
	                                paths[pacnt].boundingbox[3] = py - 1;
	                            }

	                            lookuprow = this.pathscan_combined_lookup[arr[py][px]][dir];
	                            arr[py][px] = lookuprow[0];dir = lookuprow[1];px += lookuprow[2];py += lookuprow[3];

	                            if (px - 1 === paths[pacnt].points[0].x && py - 1 === paths[pacnt].points[0].y) {
	                                pathfinished = true;

	                                if (paths[pacnt].points.length < pathomit) {
	                                    paths.pop();
	                                } else {
	                                    paths[pacnt].isholepath = !!holepath;

	                                    if (holepath) {
	                                        var parentidx = 0,
	                                            parentbbox = [-1, -1, w + 1, h + 1];
	                                        for (var parentcnt = 0; parentcnt < pacnt; parentcnt++) {
	                                            if (!paths[parentcnt].isholepath && this.boundingboxincludes(paths[parentcnt].boundingbox, paths[pacnt].boundingbox) && this.boundingboxincludes(parentbbox, paths[parentcnt].boundingbox)) {
	                                                parentidx = parentcnt;
	                                                parentbbox = paths[parentcnt].boundingbox;
	                                            }
	                                        }
	                                        paths[parentidx].holechildren.push(pacnt);
	                                    }
	                                    pacnt += 1;
	                                }
	                            }
	                            pcnt += 1;
	                        }
	                    }
	                }
	            }

	            return paths;
	        }
	    }, {
	        key: 'boundingboxincludes',
	        value: function boundingboxincludes(parentbbox, childbbox) {
	            return parentbbox[0] < childbbox[0] && parentbbox[1] < childbbox[1] && parentbbox[2] > childbbox[2] && parentbbox[3] > childbbox[3];
	        }
	    }, {
	        key: 'batchpathscan',
	        value: function batchpathscan(layers, pathomit) {
	            var bpaths = [];
	            for (var k in layers) {
	                if (!layers.hasOwnProperty(k)) {
	                    continue;
	                }
	                bpaths[k] = this.pathscan(layers[k], pathomit);
	            }

	            return bpaths;
	        }
	    }, {
	        key: 'internodes',
	        value: function internodes(paths, options) {
	            var ins = [];
	            var palen = 0;
	            var nextidx = 0;
	            var nextidx2 = 0;
	            var previdx = 0;
	            var previdx2 = 0;
	            var pacnt = void 0;
	            var pcnt = void 0;
	            for (pacnt = 0; pacnt < paths.length; pacnt += 1) {
	                ins[pacnt] = {};
	                ins[pacnt].points = [];
	                ins[pacnt].boundingbox = paths[pacnt].boundingbox;
	                ins[pacnt].holechildren = paths[pacnt].holechildren;
	                ins[pacnt].isholepath = paths[pacnt].isholepath;
	                palen = paths[pacnt].points.length;

	                for (pcnt = 0; pcnt < palen; pcnt += 1) {
	                    nextidx = (pcnt + 1) % palen;nextidx2 = (pcnt + 2) % palen;previdx = (pcnt - 1 + palen) % palen;previdx2 = (pcnt - 2 + palen) % palen;

	                    if (options.rightangleenhance && this.testrightangle(paths[pacnt], previdx2, previdx, pcnt, nextidx, nextidx2)) {
	                        if (ins[pacnt].points.length > 0) {
	                            ins[pacnt].points[ins[pacnt].points.length - 1].linesegment = this.getdirection(ins[pacnt].points[ins[pacnt].points.length - 1].x, ins[pacnt].points[ins[pacnt].points.length - 1].y, paths[pacnt].points[pcnt].x, paths[pacnt].points[pcnt].y);
	                        }

	                        ins[pacnt].points.push({
	                            x: paths[pacnt].points[pcnt].x,
	                            y: paths[pacnt].points[pcnt].y,
	                            linesegment: this.getdirection(paths[pacnt].points[pcnt].x, paths[pacnt].points[pcnt].y, (paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2, (paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2)
	                        });
	                    }

	                    ins[pacnt].points.push({
	                        x: (paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2,
	                        y: (paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2,
	                        linesegment: this.getdirection((paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2, (paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2, (paths[pacnt].points[nextidx].x + paths[pacnt].points[nextidx2].x) / 2, (paths[pacnt].points[nextidx].y + paths[pacnt].points[nextidx2].y) / 2)
	                    });
	                }
	            }

	            return ins;
	        }
	    }, {
	        key: 'testrightangle',
	        value: function testrightangle(path, idx1, idx2, idx3, idx4, idx5) {
	            return path.points[idx3].x === path.points[idx1].x && path.points[idx3].x === path.points[idx2].x && path.points[idx3].y === path.points[idx4].y && path.points[idx3].y === path.points[idx5].y || path.points[idx3].y === path.points[idx1].y && path.points[idx3].y === path.points[idx2].y && path.points[idx3].x === path.points[idx4].x && path.points[idx3].x === path.points[idx5].x;
	        }
	    }, {
	        key: 'getdirection',
	        value: function getdirection(x1, y1, x2, y2) {
	            var val = 8;
	            if (x1 < x2) {
	                if (y1 < y2) {
	                    val = 1;
	                } else if (y1 > y2) {
	                    val = 7;
	                } else {
	                    val = 0;
	                }
	            } else if (x1 > x2) {
	                if (y1 < y2) {
	                    val = 3;
	                } else if (y1 > y2) {
	                    val = 5;
	                } else {
	                    val = 4;
	                }
	            } else if (y1 < y2) {
	                val = 2;
	            } else if (y1 > y2) {
	                val = 6;
	            } else {
	                val = 8;
	            }

	            return val;
	        }
	    }, {
	        key: 'batchinternodes',
	        value: function batchinternodes(bpaths, options) {
	            var binternodes = [];
	            for (var k in bpaths) {
	                if (!bpaths.hasOwnProperty(k)) {
	                    continue;
	                }
	                binternodes[k] = this.internodes(bpaths[k], options);
	            }

	            return binternodes;
	        }
	    }, {
	        key: 'tracepath',
	        value: function tracepath(path, ltres, qtres) {
	            var pcnt = 0;
	            var segtype1 = void 0;
	            var segtype2 = void 0;
	            var seqend = void 0;
	            var smp = {};
	            smp.segments = [];
	            smp.boundingbox = path.boundingbox;
	            smp.holechildren = path.holechildren;
	            smp.isholepath = path.isholepath;

	            while (pcnt < path.points.length) {
	                segtype1 = path.points[pcnt].linesegment;
	                segtype2 = -1;
	                seqend = pcnt + 1;
	                while ((path.points[seqend].linesegment === segtype1 || path.points[seqend].linesegment === segtype2 || segtype2 === -1) && seqend < path.points.length - 1) {
	                    if (path.points[seqend].linesegment !== segtype1 && segtype2 === -1) {
	                        segtype2 = path.points[seqend].linesegment;
	                    }
	                    seqend += 1;
	                }
	                if (seqend === path.points.length - 1) {
	                    seqend = 0;
	                }

	                smp.segments = smp.segments.concat(this.fitseq(path, ltres, qtres, pcnt, seqend));

	                if (seqend > 0) {
	                    pcnt = seqend;
	                } else {
	                    pcnt = path.points.length;
	                }
	            }

	            return smp;
	        }
	    }, {
	        key: 'fitseq',
	        value: function fitseq(path, ltres, qtres, seqstart, seqend) {
	            if (seqend > path.points.length || seqend < 0) {
	                return [];
	            }
	            var errorpoint = seqstart,
	                errorval = 0,
	                curvepass = true,
	                px = void 0,
	                py = void 0,
	                dist2 = void 0;
	            var tl = seqend - seqstart;if (tl < 0) {
	                tl += path.points.length;
	            }
	            var vx = (path.points[seqend].x - path.points[seqstart].x) / tl,
	                vy = (path.points[seqend].y - path.points[seqstart].y) / tl;
	            var pcnt = (seqstart + 1) % path.points.length,
	                pl = void 0;
	            while (pcnt != seqend) {
	                pl = pcnt - seqstart;if (pl < 0) {
	                    pl += path.points.length;
	                }
	                px = path.points[seqstart].x + vx * pl;py = path.points[seqstart].y + vy * pl;
	                dist2 = (path.points[pcnt].x - px) * (path.points[pcnt].x - px) + (path.points[pcnt].y - py) * (path.points[pcnt].y - py);
	                if (dist2 > ltres) {
	                    curvepass = false;
	                }
	                if (dist2 > errorval) {
	                    errorpoint = pcnt;errorval = dist2;
	                }
	                pcnt = (pcnt + 1) % path.points.length;
	            }
	            if (curvepass) {
	                return [{ type: 'L',
	                    x1: path.points[seqstart].x,
	                    y1: path.points[seqstart].y,
	                    x2: path.points[seqend].x,
	                    y2: path.points[seqend].y }];
	            }
	            var fitpoint = errorpoint;curvepass = true;errorval = 0;
	            var t = (fitpoint - seqstart) / tl,
	                t1 = (1 - t) * (1 - t),
	                t2 = 2 * (1 - t) * t,
	                t3 = t * t;
	            var cpx = (t1 * path.points[seqstart].x + t3 * path.points[seqend].x - path.points[fitpoint].x) / -t2,
	                cpy = (t1 * path.points[seqstart].y + t3 * path.points[seqend].y - path.points[fitpoint].y) / -t2;
	            pcnt = seqstart + 1;
	            while (pcnt != seqend) {
	                t = (pcnt - seqstart) / tl;t1 = (1 - t) * (1 - t);t2 = 2 * (1 - t) * t;t3 = t * t;
	                px = t1 * path.points[seqstart].x + t2 * cpx + t3 * path.points[seqend].x;
	                py = t1 * path.points[seqstart].y + t2 * cpy + t3 * path.points[seqend].y;
	                dist2 = (path.points[pcnt].x - px) * (path.points[pcnt].x - px) + (path.points[pcnt].y - py) * (path.points[pcnt].y - py);
	                if (dist2 > qtres) {
	                    curvepass = false;
	                }
	                if (dist2 > errorval) {
	                    errorpoint = pcnt;errorval = dist2;
	                }
	                pcnt = (pcnt + 1) % path.points.length;
	            }
	            if (curvepass) {
	                return [{ type: 'Q',
	                    x1: path.points[seqstart].x,
	                    y1: path.points[seqstart].y,
	                    x2: cpx,
	                    y2: cpy,
	                    x3: path.points[seqend].x,
	                    y3: path.points[seqend].y }];
	            }
	            var splitpoint = fitpoint;

	            return this.fitseq(path, ltres, qtres, seqstart, splitpoint).concat(this.fitseq(path, ltres, qtres, splitpoint, seqend));
	        }
	    }, {
	        key: 'batchtracepaths',
	        value: function batchtracepaths(internodepaths, ltres, qtres) {
	            var btracedpaths = [];
	            for (var k in internodepaths) {
	                if (!internodepaths.hasOwnProperty(k)) {
	                    continue;
	                }
	                btracedpaths.push(this.tracepath(internodepaths[k], ltres, qtres));
	            }

	            return btracedpaths;
	        }
	    }, {
	        key: 'batchtracelayers',
	        value: function batchtracelayers(binternodes, ltres, qtres) {
	            var btbis = [];
	            for (var k in binternodes) {
	                if (!binternodes.hasOwnProperty(k)) {
	                    continue;
	                }
	                btbis[k] = this.batchtracepaths(binternodes[k], ltres, qtres);
	            }

	            return btbis;
	        }
	    }, {
	        key: 'roundtodec',
	        value: function roundtodec(val, places) {
	            return Number(val.toFixed(places));
	        }
	    }, {
	        key: 'svgpathstring',
	        value: function svgpathstring(tracedata, lnum, pathnum, options) {
	            var layer = tracedata.layers[lnum],
	                smp = layer[pathnum],
	                str = '',
	                pcnt = void 0;
	            if (options.linefilter && smp.segments.length < 3) {
	                return str;
	            }
	            str = '<path ' + (options.desc ? 'desc="l ' + lnum + ' p ' + pathnum + '" ' : '') + this.tosvgcolorstr(tracedata.palette[lnum], options) + 'd="';
	            if (options.roundcoords === -1) {
	                str += 'M ' + smp.segments[0].x1 * options.scale + ' ' + smp.segments[0].y1 * options.scale + ' ';
	                for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
	                    str += smp.segments[pcnt].type + ' ' + smp.segments[pcnt].x2 * options.scale + ' ' + smp.segments[pcnt].y2 * options.scale + ' ';
	                    if (smp.segments[pcnt].hasOwnProperty('x3')) {
	                        str += smp.segments[pcnt].x3 * options.scale + ' ' + smp.segments[pcnt].y3 * options.scale + ' ';
	                    }
	                }
	                str += 'Z ';
	            } else {
	                str += 'M ' + this.roundtodec(smp.segments[0].x1 * options.scale, options.roundcoords) + ' ' + this.roundtodec(smp.segments[0].y1 * options.scale, options.roundcoords) + ' ';
	                for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
	                    str += smp.segments[pcnt].type + ' ' + this.roundtodec(smp.segments[pcnt].x2 * options.scale, options.roundcoords) + ' ' + this.roundtodec(smp.segments[pcnt].y2 * options.scale, options.roundcoords) + ' ';
	                    if (smp.segments[pcnt].hasOwnProperty('x3')) {
	                        str += this.roundtodec(smp.segments[pcnt].x3 * options.scale, options.roundcoords) + ' ' + this.roundtodec(smp.segments[pcnt].y3 * options.scale, options.roundcoords) + ' ';
	                    }
	                }
	                str += 'Z ';
	            }
	            for (var hcnt = 0; hcnt < smp.holechildren.length; hcnt++) {
	                var hsmp = layer[smp.holechildren[hcnt]];

	                if (options.roundcoords === -1) {
	                    if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty('x3')) {
	                        str += 'M ' + hsmp.segments[hsmp.segments.length - 1].x3 * options.scale + ' ' + hsmp.segments[hsmp.segments.length - 1].y3 * options.scale + ' ';
	                    } else {
	                        str += 'M ' + hsmp.segments[hsmp.segments.length - 1].x2 * options.scale + ' ' + hsmp.segments[hsmp.segments.length - 1].y2 * options.scale + ' ';
	                    }
	                    for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
	                        str += hsmp.segments[pcnt].type + ' ';
	                        if (hsmp.segments[pcnt].hasOwnProperty('x3')) {
	                            str += hsmp.segments[pcnt].x2 * options.scale + ' ' + hsmp.segments[pcnt].y2 * options.scale + ' ';
	                        }
	                        str += hsmp.segments[pcnt].x1 * options.scale + ' ' + hsmp.segments[pcnt].y1 * options.scale + ' ';
	                    }
	                } else {
	                    if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty('x3')) {
	                        str += 'M ' + this.roundtodec(hsmp.segments[hsmp.segments.length - 1].x3 * options.scale) + ' ' + this.roundtodec(hsmp.segments[hsmp.segments.length - 1].y3 * options.scale) + ' ';
	                    } else {
	                        str += 'M ' + this.roundtodec(hsmp.segments[hsmp.segments.length - 1].x2 * options.scale) + ' ' + this.roundtodec(hsmp.segments[hsmp.segments.length - 1].y2 * options.scale) + ' ';
	                    }
	                    for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
	                        str += hsmp.segments[pcnt].type + ' ';
	                        if (hsmp.segments[pcnt].hasOwnProperty('x3')) {
	                            str += this.roundtodec(hsmp.segments[pcnt].x2 * options.scale) + ' ' + this.roundtodec(hsmp.segments[pcnt].y2 * options.scale) + ' ';
	                        }
	                        str += this.roundtodec(hsmp.segments[pcnt].x1 * options.scale) + ' ' + this.roundtodec(hsmp.segments[pcnt].y1 * options.scale) + ' ';
	                    }
	                }
	                str += 'Z ';
	            }
	            str += '" />';
	            if (options.lcpr || options.qcpr) {
	                for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
	                    if (smp.segments[pcnt].hasOwnProperty('x3') && options.qcpr) {
	                        str += '<circle cx="' + smp.segments[pcnt].x2 * options.scale + '" cy="' + smp.segments[pcnt].y2 * options.scale + '" r="' + options.qcpr + '" fill="cyan" stroke-width="' + options.qcpr * 0.2 + '" stroke="black" />';
	                        str += '<circle cx="' + smp.segments[pcnt].x3 * options.scale + '" cy="' + smp.segments[pcnt].y3 * options.scale + '" r="' + options.qcpr + '" fill="white" stroke-width="' + options.qcpr * 0.2 + '" stroke="black" />';
	                        str += '<line x1="' + smp.segments[pcnt].x1 * options.scale + '" y1="' + smp.segments[pcnt].y1 * options.scale + '" x2="' + smp.segments[pcnt].x2 * options.scale + '" y2="' + smp.segments[pcnt].y2 * options.scale + '" stroke-width="' + options.qcpr * 0.2 + '" stroke="cyan" />';
	                        str += '<line x1="' + smp.segments[pcnt].x2 * options.scale + '" y1="' + smp.segments[pcnt].y2 * options.scale + '" x2="' + smp.segments[pcnt].x3 * options.scale + '" y2="' + smp.segments[pcnt].y3 * options.scale + '" stroke-width="' + options.qcpr * 0.2 + '" stroke="cyan" />';
	                    }
	                    if (!smp.segments[pcnt].hasOwnProperty('x3') && options.lcpr) {
	                        str += '<circle cx="' + smp.segments[pcnt].x2 * options.scale + '" cy="' + smp.segments[pcnt].y2 * options.scale + '" r="' + options.lcpr + '" fill="white" stroke-width="' + options.lcpr * 0.2 + '" stroke="black" />';
	                    }
	                }

	                for (var hcnt = 0; hcnt < smp.holechildren.length; hcnt++) {
	                    var hsmp = layer[smp.holechildren[hcnt]];
	                    for (pcnt = 0; pcnt < hsmp.segments.length; pcnt++) {
	                        if (hsmp.segments[pcnt].hasOwnProperty('x3') && options.qcpr) {
	                            str += '<circle cx="' + hsmp.segments[pcnt].x2 * options.scale + '" cy="' + hsmp.segments[pcnt].y2 * options.scale + '" r="' + options.qcpr + '" fill="cyan" stroke-width="' + options.qcpr * 0.2 + '" stroke="black" />';
	                            str += '<circle cx="' + hsmp.segments[pcnt].x3 * options.scale + '" cy="' + hsmp.segments[pcnt].y3 * options.scale + '" r="' + options.qcpr + '" fill="white" stroke-width="' + options.qcpr * 0.2 + '" stroke="black" />';
	                            str += '<line x1="' + hsmp.segments[pcnt].x1 * options.scale + '" y1="' + hsmp.segments[pcnt].y1 * options.scale + '" x2="' + hsmp.segments[pcnt].x2 * options.scale + '" y2="' + hsmp.segments[pcnt].y2 * options.scale + '" stroke-width="' + options.qcpr * 0.2 + '" stroke="cyan" />';
	                            str += '<line x1="' + hsmp.segments[pcnt].x2 * options.scale + '" y1="' + hsmp.segments[pcnt].y2 * options.scale + '" x2="' + hsmp.segments[pcnt].x3 * options.scale + '" y2="' + hsmp.segments[pcnt].y3 * options.scale + '" stroke-width="' + options.qcpr * 0.2 + '" stroke="cyan" />';
	                        }
	                        if (!hsmp.segments[pcnt].hasOwnProperty('x3') && options.lcpr) {
	                            str += '<circle cx="' + hsmp.segments[pcnt].x2 * options.scale + '" cy="' + hsmp.segments[pcnt].y2 * options.scale + '" r="' + options.lcpr + '" fill="white" stroke-width="' + options.lcpr * 0.2 + '" stroke="black" />';
	                        }
	                    }
	                }
	            }

	            return str;
	        }
	    }, {
	        key: 'getsvgstring',
	        value: function getsvgstring(tracedata, options) {
	            options = this.checkoptions(options);
	            var w = tracedata.width * options.scale;
	            var h = tracedata.height * options.scale;

	            var svgstr = '<svg ' + (options.viewbox ? 'viewBox="0 0 ' + w + ' ' + h + '" ' : 'width="' + w + '" height="' + h + '" ') + 'version="1.1" xmlns="http://www.w3.org/2000/svg" desc="Created with imagetracer.js version ' + this.versionnumber + '" >';
	            for (var lcnt = 0; lcnt < tracedata.layers.length; lcnt += 1) {
	                for (var pcnt = 0; pcnt < tracedata.layers[lcnt].length; pcnt += 1) {
	                    if (!tracedata.layers[lcnt][pcnt].isholepath) {
	                        svgstr += this.svgpathstring(tracedata, lcnt, pcnt, options);
	                    }
	                }
	            }
	            svgstr += '</svg>';

	            return svgstr;
	        }
	    }, {
	        key: 'compareNumbers',
	        value: function compareNumbers(a, b) {
	            return a - b;
	        }
	    }, {
	        key: 'torgbastr',
	        value: function torgbastr(c) {
	            return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
	        }
	    }, {
	        key: 'tosvgcolorstr',
	        value: function tosvgcolorstr(c, options) {
	            return 'fill="rgb(' + c.r + ',' + c.g + ',' + c.b + ')" stroke="rgb(' + c.r + ',' + c.g + ',' + c.b + ')" stroke-width="' + options.strokewidth + '" opacity="' + c.a / 255.0 + '" ';
	        }
	    }, {
	        key: 'appendSVGString',
	        value: function appendSVGString(svgstr, parentid) {
	            var div = void 0;
	            if (parentid) {
	                div = document.getElementById(parentid);
	                if (!div) {
	                    div = document.createElement('div');
	                    div.id = parentid;
	                    document.body.appendChild(div);
	                }
	            } else {
	                div = document.createElement('div');
	                document.body.appendChild(div);
	            }
	            div.innerHTML += svgstr;
	        }
	    }, {
	        key: 'blur',
	        value: function blur(imgd, radius, delta) {
	            var i = void 0,
	                j = void 0,
	                k = void 0,
	                d = void 0,
	                idx = void 0,
	                racc = void 0,
	                gacc = void 0,
	                bacc = void 0,
	                aacc = void 0,
	                wacc = void 0;
	            var imgd2 = { width: imgd.width,
	                height: imgd.height,
	                data: [] };
	            radius = Math.floor(radius);if (radius < 1) {
	                return imgd;
	            }if (radius > 5) {
	                radius = 5;
	            }delta = Math.abs(delta);if (delta > 1024) {
	                delta = 1024;
	            }
	            var thisgk = this.gks[radius - 1];
	            for (j = 0; j < imgd.height; j++) {
	                for (i = 0; i < imgd.width; i++) {
	                    racc = 0;gacc = 0;bacc = 0;aacc = 0;wacc = 0;

	                    for (k = -radius; k < radius + 1; k++) {
	                        if (i + k > 0 && i + k < imgd.width) {
	                            idx = (j * imgd.width + i + k) * 4;
	                            racc += imgd.data[idx] * thisgk[k + radius];
	                            gacc += imgd.data[idx + 1] * thisgk[k + radius];
	                            bacc += imgd.data[idx + 2] * thisgk[k + radius];
	                            aacc += imgd.data[idx + 3] * thisgk[k + radius];
	                            wacc += thisgk[k + radius];
	                        }
	                    }

	                    idx = (j * imgd.width + i) * 4;
	                    imgd2.data[idx] = Math.floor(racc / wacc);
	                    imgd2.data[idx + 1] = Math.floor(gacc / wacc);
	                    imgd2.data[idx + 2] = Math.floor(bacc / wacc);
	                    imgd2.data[idx + 3] = Math.floor(aacc / wacc);
	                }
	            }
	            var himgd = new Uint8ClampedArray(imgd2.data);
	            for (j = 0; j < imgd.height; j++) {
	                for (i = 0; i < imgd.width; i++) {
	                    racc = 0;gacc = 0;bacc = 0;aacc = 0;wacc = 0;

	                    for (k = -radius; k < radius + 1; k++) {
	                        if (j + k > 0 && j + k < imgd.height) {
	                            idx = ((j + k) * imgd.width + i) * 4;
	                            racc += himgd[idx] * thisgk[k + radius];
	                            gacc += himgd[idx + 1] * thisgk[k + radius];
	                            bacc += himgd[idx + 2] * thisgk[k + radius];
	                            aacc += himgd[idx + 3] * thisgk[k + radius];
	                            wacc += thisgk[k + radius];
	                        }
	                    }

	                    idx = (j * imgd.width + i) * 4;
	                    imgd2.data[idx] = Math.floor(racc / wacc);
	                    imgd2.data[idx + 1] = Math.floor(gacc / wacc);
	                    imgd2.data[idx + 2] = Math.floor(bacc / wacc);
	                    imgd2.data[idx + 3] = Math.floor(aacc / wacc);
	                }
	            }
	            for (j = 0; j < imgd.height; j++) {
	                for (i = 0; i < imgd.width; i++) {
	                    idx = (j * imgd.width + i) * 4;

	                    d = Math.abs(imgd2.data[idx] - imgd.data[idx]) + Math.abs(imgd2.data[idx + 1] - imgd.data[idx + 1]) + Math.abs(imgd2.data[idx + 2] - imgd.data[idx + 2]) + Math.abs(imgd2.data[idx + 3] - imgd.data[idx + 3]);

	                    if (d > delta) {
	                        imgd2.data[idx] = imgd.data[idx];
	                        imgd2.data[idx + 1] = imgd.data[idx + 1];
	                        imgd2.data[idx + 2] = imgd.data[idx + 2];
	                        imgd2.data[idx + 3] = imgd.data[idx + 3];
	                    }
	                }
	            }

	            return imgd2;
	        }
	    }, {
	        key: 'loadImage',
	        value: function loadImage(url, callback, options) {
	            var img = new Image();
	            if (options && options.corsenabled) {
	                img.crossOrigin = 'Anonymous';
	            }
	            img.src = url;
	            img.onload = function () {
	                var canvas = document.createElement('canvas');
	                canvas.width = img.width;
	                canvas.height = img.height;
	                var context = canvas.getContext('2d');
	                context.drawImage(img, 0, 0);
	                callback(canvas);
	            };
	        }
	    }, {
	        key: 'getImgdata',
	        value: function getImgdata(canvas) {
	            var context = canvas.getContext('2d');

	            return context.getImageData(0, 0, canvas.width, canvas.height);
	        }
	    }, {
	        key: 'drawLayers',
	        value: function drawLayers(layers, palette, scale, parentid) {
	            scale = scale || 1;
	            var w = void 0,
	                h = void 0,
	                i = void 0,
	                j = void 0,
	                k = void 0;
	            var div = void 0;
	            if (parentid) {
	                div = document.getElementById(parentid);
	                if (!div) {
	                    div = document.createElement('div');
	                    div.id = parentid;
	                    document.body.appendChild(div);
	                }
	            } else {
	                div = document.createElement('div');
	                document.body.appendChild(div);
	            }
	            for (k in layers) {
	                if (!layers.hasOwnProperty(k)) {
	                    continue;
	                }

	                w = layers[k][0].length;
	                h = layers[k].length;

	                var canvas = document.createElement('canvas');
	                canvas.width = w * scale;
	                canvas.height = h * scale;
	                var context = canvas.getContext('2d');

	                for (j = 0; j < h; j += 1) {
	                    for (i = 0; i < w; i += 1) {
	                        context.fillStyle = this.torgbastr(palette[layers[k][j][i] % palette.length]);
	                        context.fillRect(i * scale, j * scale, scale, scale);
	                    }
	                }

	                div.appendChild(canvas);
	            }
	        }
	    }]);

	    return ImageTracer;
	}();

	exports.default = ImageTracer;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Graphics module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _imageLoader = __webpack_require__(107);

	var _imageLoader2 = _interopRequireDefault(_imageLoader);

	var _cropper = __webpack_require__(109);

	var _cropper2 = _interopRequireDefault(_cropper);

	var _flip = __webpack_require__(111);

	var _flip2 = _interopRequireDefault(_flip);

	var _rotation = __webpack_require__(112);

	var _rotation2 = _interopRequireDefault(_rotation);

	var _freeDrawing = __webpack_require__(113);

	var _freeDrawing2 = _interopRequireDefault(_freeDrawing);

	var _line = __webpack_require__(114);

	var _line2 = _interopRequireDefault(_line);

	var _text = __webpack_require__(115);

	var _text2 = _interopRequireDefault(_text);

	var _icon = __webpack_require__(116);

	var _icon2 = _interopRequireDefault(_icon);

	var _filter = __webpack_require__(117);

	var _filter2 = _interopRequireDefault(_filter);

	var _shape = __webpack_require__(123);

	var _shape2 = _interopRequireDefault(_shape);

	var _cropper3 = __webpack_require__(125);

	var _cropper4 = _interopRequireDefault(_cropper3);

	var _freeDrawing3 = __webpack_require__(127);

	var _freeDrawing4 = _interopRequireDefault(_freeDrawing3);

	var _lineDrawing = __webpack_require__(128);

	var _lineDrawing2 = _interopRequireDefault(_lineDrawing);

	var _shape3 = __webpack_require__(129);

	var _shape4 = _interopRequireDefault(_shape3);

	var _text3 = __webpack_require__(130);

	var _text4 = _interopRequireDefault(_text3);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var components = _consts2.default.componentNames;
	var events = _consts2.default.eventNames;

	var drawingModes = _consts2.default.drawingModes,
	    fObjectOptions = _consts2.default.fObjectOptions;
	var extend = _tuiCodeSnippet2.default.extend,
	    stamp = _tuiCodeSnippet2.default.stamp,
	    isArray = _tuiCodeSnippet2.default.isArray,
	    isString = _tuiCodeSnippet2.default.isString,
	    forEachArray = _tuiCodeSnippet2.default.forEachArray,
	    forEachOwnProperties = _tuiCodeSnippet2.default.forEachOwnProperties,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;


	var DEFAULT_CSS_MAX_WIDTH = 1000;
	var DEFAULT_CSS_MAX_HEIGHT = 800;

	var cssOnly = {
	    cssOnly: true
	};
	var backstoreOnly = {
	    backstoreOnly: true
	};

	/**
	 * Graphics class
	 * @class
	 * @param {string|HTMLElement} wrapper - Wrapper's element or selector
	 * @param {Object} [option] - Canvas max width & height of css
	 *  @param {number} option.cssMaxWidth - Canvas css-max-width
	 *  @param {number} option.cssMaxHeight - Canvas css-max-height
	 *  @param {boolean} option.useItext - Use IText in text mode
	 *  @param {boolean} option.useDragAddIcon - Use dragable add in icon mode
	 * @ignore
	 */

	var Graphics = function () {
	    function Graphics(element) {
	        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	            cssMaxWidth = _ref.cssMaxWidth,
	            cssMaxHeight = _ref.cssMaxHeight,
	            _ref$useItext = _ref.useItext,
	            useItext = _ref$useItext === undefined ? false : _ref$useItext,
	            _ref$useDragAddIcon = _ref.useDragAddIcon,
	            useDragAddIcon = _ref$useDragAddIcon === undefined ? false : _ref$useDragAddIcon;

	        _classCallCheck(this, Graphics);

	        /**
	         * Fabric image instance
	         * @type {fabric.Image}
	         */
	        this.canvasImage = null;

	        /**
	         * Max width of canvas elements
	         * @type {number}
	         */
	        this.cssMaxWidth = cssMaxWidth || DEFAULT_CSS_MAX_WIDTH;

	        /**
	         * Max height of canvas elements
	         * @type {number}
	         */
	        this.cssMaxHeight = cssMaxHeight || DEFAULT_CSS_MAX_HEIGHT;

	        /**
	         * Use Itext mode for text component
	         * @type {boolean}
	         */
	        this.useItext = useItext;

	        /**
	         * Use add drag icon mode for icon component
	         * @type {boolean}
	         */
	        this.useDragAddIcon = useDragAddIcon;

	        /**
	         * cropper Selection Style
	         * @type {Object}
	         */
	        this.cropSelectionStyle = {};

	        /**
	         * Image name
	         * @type {string}
	         */
	        this.imageName = '';

	        /**
	         * Object Map
	         * @type {Object}
	         * @private
	         */
	        this._objects = {};

	        /**
	         * Fabric-Canvas instance
	         * @type {fabric.Canvas}
	         * @private
	         */
	        this._canvas = null;

	        /**
	         * Drawing mode
	         * @type {string}
	         * @private
	         */
	        this._drawingMode = drawingModes.NORMAL;

	        /**
	         * DrawingMode map
	         * @type {Object.<string, DrawingMode>}
	         * @private
	         */
	        this._drawingModeMap = {};

	        /**
	         * Component map
	         * @type {Object.<string, Component>}
	         * @private
	         */
	        this._componentMap = {};

	        /**
	         * fabric event handlers
	         * @type {Object.<string, function>}
	         * @private
	         */
	        this._handler = {
	            onMouseDown: this._onMouseDown.bind(this),
	            onObjectAdded: this._onObjectAdded.bind(this),
	            onObjectRemoved: this._onObjectRemoved.bind(this),
	            onObjectMoved: this._onObjectMoved.bind(this),
	            onObjectScaled: this._onObjectScaled.bind(this),
	            onObjectSelected: this._onObjectSelected.bind(this),
	            onPathCreated: this._onPathCreated.bind(this),
	            onSelectionCleared: this._onSelectionCleared.bind(this),
	            onSelectionCreated: this._onSelectionCreated.bind(this)
	        };

	        this._setCanvasElement(element);
	        this._createDrawingModeInstances();
	        this._createComponents();
	        this._attachCanvasEvents();
	    }

	    /**
	     * Destroy canvas element
	     */


	    _createClass(Graphics, [{
	        key: 'destroy',
	        value: function destroy() {
	            var wrapperEl = this._canvas.wrapperEl;


	            this._canvas.clear();

	            wrapperEl.parentNode.removeChild(wrapperEl);
	        }

	        /**
	         * Deactivates all objects on canvas
	         * @returns {Graphics} this
	         */

	    }, {
	        key: 'deactivateAll',
	        value: function deactivateAll() {
	            this._canvas.deactivateAll();

	            return this;
	        }

	        /**
	         * Renders all objects on canvas
	         * @returns {Graphics} this
	         */

	    }, {
	        key: 'renderAll',
	        value: function renderAll() {
	            this._canvas.renderAll();

	            return this;
	        }

	        /**
	         * Adds objects on canvas
	         * @param {Object|Array} objects - objects
	         */

	    }, {
	        key: 'add',
	        value: function add(objects) {
	            var _canvas;

	            var theArgs = [];
	            if (isArray(objects)) {
	                theArgs = objects;
	            } else {
	                theArgs.push(objects);
	            }

	            (_canvas = this._canvas).add.apply(_canvas, theArgs);
	        }

	        /**
	         * Removes the object or group
	         * @param {Object} target - graphics object or group
	         * @returns {boolean} true if contains or false
	         */

	    }, {
	        key: 'contains',
	        value: function contains(target) {
	            return this._canvas.contains(target);
	        }

	        /**
	         * Gets all objects or group
	         * @returns {Array} all objects, shallow copy
	         */

	    }, {
	        key: 'getObjects',
	        value: function getObjects() {
	            return this._canvas.getObjects().slice();
	        }

	        /**
	         * Get an object by id
	         * @param {number} id - object id
	         * @returns {fabric.Object} object corresponding id
	         */

	    }, {
	        key: 'getObject',
	        value: function getObject(id) {
	            return this._objects[id];
	        }

	        /**
	         * Removes the object or group
	         * @param {Object} target - graphics object or group
	         */

	    }, {
	        key: 'remove',
	        value: function remove(target) {
	            this._canvas.remove(target);
	        }

	        /**
	         * Removes all object or group
	         * @param {boolean} includesBackground - remove the background image or not
	         * @returns {Array} all objects array which is removed
	         */

	    }, {
	        key: 'removeAll',
	        value: function removeAll(includesBackground) {
	            var canvas = this._canvas;
	            var objects = canvas.getObjects().slice();
	            canvas.remove.apply(canvas, this._canvas.getObjects());

	            if (includesBackground) {
	                canvas.clear();
	            }

	            return objects;
	        }

	        /**
	         * Removes an object or group by id
	         * @param {number} id - object id
	         * @returns {Array} removed objects
	         */

	    }, {
	        key: 'removeObjectById',
	        value: function removeObjectById(id) {
	            var objects = [];
	            var canvas = this._canvas;
	            var target = this.getObject(id);
	            var isValidGroup = target && target.isType('group') && !target.isEmpty();

	            if (isValidGroup) {
	                canvas.discardActiveGroup(); // restore states for each objects
	                target.forEachObject(function (obj) {
	                    objects.push(obj);
	                    obj.remove();
	                });
	            } else if (canvas.contains(target)) {
	                objects.push(target);
	                target.remove();
	            }

	            return objects;
	        }

	        /**
	         * Get an id by object instance
	         * @param {fabric.Object} object object
	         * @returns {number} object id if it exists or null
	         */

	    }, {
	        key: 'getObjectId',
	        value: function getObjectId(object) {
	            var key = null;
	            for (key in this._objects) {
	                if (this._objects.hasOwnProperty(key)) {
	                    if (object === this._objects[key]) {
	                        return key;
	                    }
	                }
	            }

	            return null;
	        }

	        /**
	         * Gets an active object or group
	         * @returns {Object} active object or group instance
	         */

	    }, {
	        key: 'getActiveObject',
	        value: function getActiveObject() {
	            return this._canvas.getActiveObject();
	        }

	        /**
	         * Gets an active group object
	         * @returns {Object} active group object instance
	         */

	    }, {
	        key: 'getActiveGroupObject',
	        value: function getActiveGroupObject() {
	            return this._canvas.getActiveGroup();
	        }

	        /**
	         * Activates an object or group
	         * @param {Object} target - target object or group
	         */

	    }, {
	        key: 'setActiveObject',
	        value: function setActiveObject(target) {
	            this._canvas.setActiveObject(target);
	        }

	        /**
	         * Set Crop selection style
	         * @param {Object} style - Selection styles
	         */

	    }, {
	        key: 'setCropSelectionStyle',
	        value: function setCropSelectionStyle(style) {
	            this.cropSelectionStyle = style;
	        }

	        /**
	         * Get component
	         * @param {string} name - Component name
	         * @returns {Component}
	         */

	    }, {
	        key: 'getComponent',
	        value: function getComponent(name) {
	            return this._componentMap[name];
	        }

	        /**
	         * Get current drawing mode
	         * @returns {string}
	         */

	    }, {
	        key: 'getDrawingMode',
	        value: function getDrawingMode() {
	            return this._drawingMode;
	        }

	        /**
	         * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	         * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'</I>
	         * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
	         *  @param {Number} [option.width] brush width
	         *  @param {String} [option.color] brush color
	         * @returns {boolean} true if success or false
	         */

	    }, {
	        key: 'startDrawingMode',
	        value: function startDrawingMode(mode, option) {
	            if (this._isSameDrawingMode(mode)) {
	                return true;
	            }

	            // If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	            this.stopDrawingMode();

	            var drawingModeInstance = this._getDrawingModeInstance(mode);
	            if (drawingModeInstance && drawingModeInstance.start) {
	                drawingModeInstance.start(this, option);

	                this._drawingMode = mode;
	            }

	            return !!drawingModeInstance;
	        }

	        /**
	         * Stop the current drawing mode and back to the 'NORMAL' mode
	         */

	    }, {
	        key: 'stopDrawingMode',
	        value: function stopDrawingMode() {
	            if (this._isSameDrawingMode(drawingModes.NORMAL)) {
	                return;
	            }

	            var drawingModeInstance = this._getDrawingModeInstance(this.getDrawingMode());
	            if (drawingModeInstance && drawingModeInstance.end) {
	                drawingModeInstance.end(this);
	            }
	            this._drawingMode = drawingModes.NORMAL;
	        }

	        /**
	         * To data url from canvas
	         * @param {Object} options - options for toDataURL
	         *   @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
	         *   @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
	         *   @param {Number} [options.multiplier=1] Multiplier to scale by
	         *   @param {Number} [options.left] Cropping left offset. Introduced in fabric v1.2.14
	         *   @param {Number} [options.top] Cropping top offset. Introduced in fabric v1.2.14
	         *   @param {Number} [options.width] Cropping width. Introduced in fabric v1.2.14
	         *   @param {Number} [options.height] Cropping height. Introduced in fabric v1.2.14
	         * @returns {string} A DOMString containing the requested data URI.
	         */

	    }, {
	        key: 'toDataURL',
	        value: function toDataURL(options) {
	            return this._canvas && this._canvas.toDataURL(options);
	        }

	        /**
	         * Save image(background) of canvas
	         * @param {string} name - Name of image
	         * @param {?fabric.Image} canvasImage - Fabric image instance
	         */

	    }, {
	        key: 'setCanvasImage',
	        value: function setCanvasImage(name, canvasImage) {
	            if (canvasImage) {
	                stamp(canvasImage);
	            }
	            this.imageName = name;
	            this.canvasImage = canvasImage;
	        }

	        /**
	         * Set css max dimension
	         * @param {{width: number, height: number}} maxDimension - Max width & Max height
	         */

	    }, {
	        key: 'setCssMaxDimension',
	        value: function setCssMaxDimension(maxDimension) {
	            this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
	            this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
	        }

	        /**
	         * Adjust canvas dimension with scaling image
	         */

	    }, {
	        key: 'adjustCanvasDimension',
	        value: function adjustCanvasDimension() {
	            var canvasImage = this.canvasImage.scale(1);

	            var _canvasImage$getBound = canvasImage.getBoundingRect(),
	                width = _canvasImage$getBound.width,
	                height = _canvasImage$getBound.height;

	            var maxDimension = this._calcMaxDimension(width, height);

	            this.setCanvasCssDimension({
	                width: '100%',
	                height: '100%', // Set height '' for IE9
	                'max-width': maxDimension.width + 'px',
	                'max-height': maxDimension.height + 'px'
	            });

	            this.setCanvasBackstoreDimension({
	                width: width,
	                height: height
	            });
	            this._canvas.centerObject(canvasImage);
	        }

	        /**
	         * Set canvas dimension - css only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {Object} dimension - Canvas css dimension
	         */

	    }, {
	        key: 'setCanvasCssDimension',
	        value: function setCanvasCssDimension(dimension) {
	            this._canvas.setDimensions(dimension, cssOnly);
	        }

	        /**
	         * Set canvas dimension - backstore only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {Object} dimension - Canvas backstore dimension
	         */

	    }, {
	        key: 'setCanvasBackstoreDimension',
	        value: function setCanvasBackstoreDimension(dimension) {
	            this._canvas.setDimensions(dimension, backstoreOnly);
	        }

	        /**
	         * Set image properties
	         * {@link http://fabricjs.com/docs/fabric.Image.html#set}
	         * @param {Object} setting - Image properties
	         * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
	         */

	    }, {
	        key: 'setImageProperties',
	        value: function setImageProperties(setting, withRendering) {
	            var canvasImage = this.canvasImage;


	            if (!canvasImage) {
	                return;
	            }

	            canvasImage.set(setting).setCoords();
	            if (withRendering) {
	                this._canvas.renderAll();
	            }
	        }

	        /**
	         * Returns canvas element of fabric.Canvas[[lower-canvas]]
	         * @returns {HTMLCanvasElement}
	         */

	    }, {
	        key: 'getCanvasElement',
	        value: function getCanvasElement() {
	            return this._canvas.getElement();
	        }

	        /**
	         * Get fabric.Canvas instance
	         * @returns {fabric.Canvas}
	         * @private
	         */

	    }, {
	        key: 'getCanvas',
	        value: function getCanvas() {
	            return this._canvas;
	        }

	        /**
	         * Get canvasImage (fabric.Image instance)
	         * @returns {fabric.Image}
	         */

	    }, {
	        key: 'getCanvasImage',
	        value: function getCanvasImage() {
	            return this.canvasImage;
	        }

	        /**
	         * Get image name
	         * @returns {string}
	         */

	    }, {
	        key: 'getImageName',
	        value: function getImageName() {
	            return this.imageName;
	        }

	        /**
	         * Add image object on canvas
	         * @param {string} imgUrl - Image url to make object
	         * @returns {Promise}
	         */

	    }, {
	        key: 'addImageObject',
	        value: function addImageObject(imgUrl) {
	            var _this = this;

	            var callback = this._callbackAfterLoadingImageObject.bind(this);

	            return new _promise2.default(function (resolve) {
	                _fabric2.default.Image.fromURL(imgUrl, function (image) {
	                    callback(image);
	                    resolve(_this.createObjectProperties(image));
	                }, {
	                    crossOrigin: 'Anonymous'
	                });
	            });
	        }

	        /**
	         * Get center position of canvas
	         * @returns {Object} {left, top}
	         */

	    }, {
	        key: 'getCenter',
	        value: function getCenter() {
	            return this._canvas.getCenter();
	        }

	        /**
	         * Get cropped rect
	         * @returns {Object} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            return this.getComponent(components.CROPPER).getCropzoneRect();
	        }

	        /**
	         * Get cropped rect
	         * @param {number} [mode] cropzone rect mode
	         */

	    }, {
	        key: 'setCropzoneRect',
	        value: function setCropzoneRect(mode) {
	            this.getComponent(components.CROPPER).setCropzoneRect(mode);
	        }

	        /**
	         * Get cropped image data
	         * @param {Object} cropRect cropzone rect
	         *  @param {Number} cropRect.left left position
	         *  @param {Number} cropRect.top top position
	         *  @param {Number} cropRect.width width
	         *  @param {Number} cropRect.height height
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         */

	    }, {
	        key: 'getCroppedImageData',
	        value: function getCroppedImageData(cropRect) {
	            return this.getComponent(components.CROPPER).getCroppedImageData(cropRect);
	        }

	        /**
	         * Set brush option
	         * @param {Object} option brush option
	         *  @param {Number} option.width width
	         *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
	         */

	    }, {
	        key: 'setBrush',
	        value: function setBrush(option) {
	            var drawingMode = this._drawingMode;
	            var compName = components.FREE_DRAWING;

	            if (drawingMode === drawingModes.LINE) {
	                compName = drawingModes.LINE;
	            }

	            this.getComponent(compName).setBrush(option);
	        }

	        /**
	         * Set states of current drawing shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} [options] - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stoke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         */

	    }, {
	        key: 'setDrawingShape',
	        value: function setDrawingShape(type, options) {
	            this.getComponent(components.SHAPE).setStates(type, options);
	        }

	        /**
	         * Register icon paths
	         * @param {Object} pathInfos - Path infos
	         *  @param {string} pathInfos.key - key
	         *  @param {string} pathInfos.value - value
	         */

	    }, {
	        key: 'registerPaths',
	        value: function registerPaths(pathInfos) {
	            this.getComponent(components.ICON).registerPaths(pathInfos);
	        }

	        /**
	         * Change cursor style
	         * @param {string} cursorType - cursor type
	         */

	    }, {
	        key: 'changeCursor',
	        value: function changeCursor(cursorType) {
	            var canvas = this.getCanvas();
	            canvas.defaultCursor = cursorType;
	            canvas.renderAll();
	        }

	        /**
	         * Whether it has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return this.getComponent(components.FILTER).hasFilter(type);
	        }

	        /**
	         * Set selection style of fabric object by init option
	         * @param {Object} styles - Selection styles
	         */

	    }, {
	        key: 'setSelectionStyle',
	        value: function setSelectionStyle(styles) {
	            extend(fObjectOptions.SELECTION_STYLE, styles);
	        }

	        /**
	         * Set object properties
	         * @param {number} id - object id
	         * @param {Object} props - props
	         *     @param {string} [props.fill] Color
	         *     @param {string} [props.fontFamily] Font type for text
	         *     @param {number} [props.fontSize] Size
	         *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [props.textAlign] Type of text align (left / center / right)
	         *     @param {string} [props.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Object} applied properties
	         */

	    }, {
	        key: 'setObjectProperties',
	        value: function setObjectProperties(id, props) {
	            var object = this.getObject(id);
	            var clone = extend({}, props);

	            object.set(clone);

	            object.setCoords();

	            this.getCanvas().renderAll();

	            return clone;
	        }

	        /**
	         * Get object properties corresponding key
	         * @param {number} id - object id
	         * @param {Array<string>|ObjectProps|string} keys - property's key
	         * @returns {Object} properties
	         */

	    }, {
	        key: 'getObjectProperties',
	        value: function getObjectProperties(id, keys) {
	            var object = this.getObject(id);
	            var props = {};

	            if (isString(keys)) {
	                props[keys] = object[keys];
	            } else if (isArray(keys)) {
	                forEachArray(keys, function (value) {
	                    props[value] = object[value];
	                });
	            } else {
	                forEachOwnProperties(keys, function (value, key) {
	                    props[key] = object[key];
	                });
	            }

	            return props;
	        }

	        /**
	         * Get object position by originX, originY
	         * @param {number} id - object id
	         * @param {string} originX - can be 'left', 'center', 'right'
	         * @param {string} originY - can be 'top', 'center', 'bottom'
	         * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
	         */

	    }, {
	        key: 'getObjectPosition',
	        value: function getObjectPosition(id, originX, originY) {
	            var targetObj = this.getObject(id);
	            if (!targetObj) {
	                return null;
	            }

	            return targetObj.getPointByOrigin(originX, originY);
	        }

	        /**
	         * Set object position  by originX, originY
	         * @param {number} id - object id
	         * @param {Object} posInfo - position object
	         *  @param {number} posInfo.x - x position
	         *  @param {number} posInfo.y - y position
	         *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	         *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	         * @returns {boolean} true if target id is valid or false
	         */

	    }, {
	        key: 'setObjectPosition',
	        value: function setObjectPosition(id, posInfo) {
	            var targetObj = this.getObject(id);
	            var x = posInfo.x,
	                y = posInfo.y,
	                originX = posInfo.originX,
	                originY = posInfo.originY;

	            if (!targetObj) {
	                return false;
	            }

	            var targetOrigin = targetObj.getPointByOrigin(originX, originY);
	            var centerOrigin = targetObj.getPointByOrigin('center', 'center');
	            var diffX = centerOrigin.x - targetOrigin.x;
	            var diffY = centerOrigin.y - targetOrigin.y;

	            targetObj.set({
	                left: x + diffX,
	                top: y + diffY
	            });

	            targetObj.setCoords();

	            return true;
	        }

	        /**
	         * Get the canvas size
	         * @returns {Object} {{width: number, height: number}} image size
	         */

	    }, {
	        key: 'getCanvasSize',
	        value: function getCanvasSize() {
	            var image = this.getCanvasImage();

	            return {
	                width: image ? image.width : 0,
	                height: image ? image.height : 0
	            };
	        }

	        /**
	         * Get a DrawingMode instance
	         * @param {string} modeName - DrawingMode Class Name
	         * @returns {DrawingMode} DrawingMode instance
	         * @private
	         */

	    }, {
	        key: '_getDrawingModeInstance',
	        value: function _getDrawingModeInstance(modeName) {
	            return this._drawingModeMap[modeName];
	        }

	        /**
	         * Set canvas element to fabric.Canvas
	         * @param {Element|string} element - Wrapper or canvas element or selector
	         * @private
	         */

	    }, {
	        key: '_setCanvasElement',
	        value: function _setCanvasElement(element) {
	            var selectedElement = void 0;
	            var canvasElement = void 0;

	            if (element.nodeType) {
	                selectedElement = element;
	            } else {
	                selectedElement = document.querySelector(element);
	            }

	            if (selectedElement.nodeName.toUpperCase() !== 'CANVAS') {
	                canvasElement = document.createElement('canvas');
	                selectedElement.appendChild(canvasElement);
	            }

	            this._canvas = new _fabric2.default.Canvas(canvasElement, {
	                containerClass: 'tui-image-editor-canvas-container',
	                enableRetinaScaling: false
	            });
	        }

	        /**
	         * Creates DrawingMode instances
	         * @private
	         */

	    }, {
	        key: '_createDrawingModeInstances',
	        value: function _createDrawingModeInstances() {
	            this._register(this._drawingModeMap, new _cropper4.default());
	            this._register(this._drawingModeMap, new _freeDrawing4.default());
	            this._register(this._drawingModeMap, new _lineDrawing2.default());
	            this._register(this._drawingModeMap, new _shape4.default());
	            this._register(this._drawingModeMap, new _text4.default());
	        }

	        /**
	         * Create components
	         * @private
	         */

	    }, {
	        key: '_createComponents',
	        value: function _createComponents() {
	            this._register(this._componentMap, new _imageLoader2.default(this));
	            this._register(this._componentMap, new _cropper2.default(this));
	            this._register(this._componentMap, new _flip2.default(this));
	            this._register(this._componentMap, new _rotation2.default(this));
	            this._register(this._componentMap, new _freeDrawing2.default(this));
	            this._register(this._componentMap, new _line2.default(this));
	            this._register(this._componentMap, new _text2.default(this));
	            this._register(this._componentMap, new _icon2.default(this));
	            this._register(this._componentMap, new _filter2.default(this));
	            this._register(this._componentMap, new _shape2.default(this));
	        }

	        /**
	         * Register component
	         * @param {Object} map - map object
	         * @param {Object} module - module which has getName method
	         * @private
	         */

	    }, {
	        key: '_register',
	        value: function _register(map, module) {
	            map[module.getName()] = module;
	        }

	        /**
	         * Get the current drawing mode is same with given mode
	         * @param {string} mode drawing mode
	         * @returns {boolean} true if same or false
	         */

	    }, {
	        key: '_isSameDrawingMode',
	        value: function _isSameDrawingMode(mode) {
	            return this.getDrawingMode() === mode;
	        }

	        /**
	         * Calculate max dimension of canvas
	         * The css-max dimension is dynamically decided with maintaining image ratio
	         * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
	         * @param {number} width - Canvas width
	         * @param {number} height - Canvas height
	         * @returns {{width: number, height: number}} - Max width & Max height
	         * @private
	         */

	    }, {
	        key: '_calcMaxDimension',
	        value: function _calcMaxDimension(width, height) {
	            var wScaleFactor = this.cssMaxWidth / width;
	            var hScaleFactor = this.cssMaxHeight / height;
	            var cssMaxWidth = Math.min(width, this.cssMaxWidth);
	            var cssMaxHeight = Math.min(height, this.cssMaxHeight);

	            if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
	                cssMaxWidth = width * wScaleFactor;
	                cssMaxHeight = height * wScaleFactor;
	            } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
	                cssMaxWidth = width * hScaleFactor;
	                cssMaxHeight = height * hScaleFactor;
	            }

	            return {
	                width: Math.floor(cssMaxWidth),
	                height: Math.floor(cssMaxHeight)
	            };
	        }

	        /**
	         * Callback function after loading image
	         * @param {fabric.Image} obj - Fabric image object
	         * @private
	         */

	    }, {
	        key: '_callbackAfterLoadingImageObject',
	        value: function _callbackAfterLoadingImageObject(obj) {
	            var centerPos = this.getCanvasImage().getCenterPoint();

	            obj.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	            obj.set({
	                left: centerPos.x,
	                top: centerPos.y,
	                crossOrigin: 'Anonymous'
	            });

	            this.getCanvas().add(obj).setActiveObject(obj);
	        }

	        /**
	         * Attach canvas's events
	         */

	    }, {
	        key: '_attachCanvasEvents',
	        value: function _attachCanvasEvents() {
	            var canvas = this._canvas;
	            var handler = this._handler;
	            canvas.on({
	                'mouse:down': handler.onMouseDown,
	                'object:added': handler.onObjectAdded,
	                'object:removed': handler.onObjectRemoved,
	                'object:moving': handler.onObjectMoved,
	                'object:scaling': handler.onObjectScaled,
	                'object:selected': handler.onObjectSelected,
	                'path:created': handler.onPathCreated,
	                'selection:cleared': handler.onSelectionCleared,
	                'selection:created': handler.onSelectionCreated
	            });
	        }

	        /**
	         * "mouse:down" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onMouseDown',
	        value: function _onMouseDown(fEvent) {
	            var originPointer = this._canvas.getPointer(fEvent.e);
	            this.fire(events.MOUSE_DOWN, fEvent.e, originPointer);
	        }

	        /**
	         * "object:added" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectAdded',
	        value: function _onObjectAdded(fEvent) {
	            var obj = fEvent.target;
	            if (obj.isType('cropzone')) {
	                return;
	            }

	            this._addFabricObject(obj);
	        }

	        /**
	         * "object:removed" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectRemoved',
	        value: function _onObjectRemoved(fEvent) {
	            var obj = fEvent.target;

	            this._removeFabricObject(stamp(obj));
	        }

	        /**
	         * "object:moving" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectMoved',
	        value: function _onObjectMoved(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_MOVED, params);
	        }

	        /**
	         * "object:scaling" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectScaled',
	        value: function _onObjectScaled(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_SCALED, params);
	        }

	        /**
	         * "object:selected" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectSelected',
	        value: function _onObjectSelected(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_ACTIVATED, params);
	        }

	        /**
	         * "path:created" canvas event handler
	         * @param {{path: fabric.Path}} obj - Path object
	         * @private
	         */

	    }, {
	        key: '_onPathCreated',
	        value: function _onPathCreated(obj) {
	            obj.path.set(_consts2.default.fObjectOptions.SELECTION_STYLE);

	            var params = this.createObjectProperties(obj.path);

	            this.fire(events.ADD_OBJECT, params);
	        }

	        /**
	         * "selction:cleared" canvas event handler
	         * @private
	         */

	    }, {
	        key: '_onSelectionCleared',
	        value: function _onSelectionCleared() {
	            this.fire(events.SELECTION_CLEARED);
	        }

	        /**
	         * "selction:created" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onSelectionCreated',
	        value: function _onSelectionCreated(fEvent) {
	            this.fire(events.SELECTION_CREATED, fEvent.target);
	        }

	        /**
	         * Canvas discard selection all
	         */

	    }, {
	        key: 'discardSelection',
	        value: function discardSelection() {
	            this._canvas.discardActiveGroup();
	            this._canvas.discardActiveObject();
	            this._canvas.renderAll();
	        }

	        /**
	         * Canvas Selectable status change
	         * @param {boolean} selectable - expect status
	         */

	    }, {
	        key: 'changeSelectableAll',
	        value: function changeSelectableAll(selectable) {
	            this._canvas.forEachObject(function (obj) {
	                obj.selectable = selectable;
	                obj.hoverCursor = selectable ? 'move' : 'crosshair';
	            });
	        }

	        /**
	         * Return object's properties
	         * @param {fabric.Object} obj - fabric object
	         * @returns {Object} properties object
	         */

	    }, {
	        key: 'createObjectProperties',
	        value: function createObjectProperties(obj) {
	            var predefinedKeys = ['left', 'top', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'opacity'];
	            var props = {
	                id: stamp(obj),
	                type: obj.type
	            };

	            extend(props, _util2.default.getProperties(obj, predefinedKeys));

	            if (['i-text', 'text'].indexOf(obj.type) > -1) {
	                extend(props, this._createTextProperties(obj, props));
	            }

	            return props;
	        }

	        /**
	         * Get text object's properties
	         * @param {fabric.Object} obj - fabric text object
	         * @param {Object} props - properties
	         * @returns {Object} properties object
	         */

	    }, {
	        key: '_createTextProperties',
	        value: function _createTextProperties(obj) {
	            var predefinedKeys = ['text', 'fontFamily', 'fontSize', 'fontStyle', 'textAlign', 'textDecoration'];
	            var props = {};
	            extend(props, _util2.default.getProperties(obj, predefinedKeys));

	            return props;
	        }

	        /**
	         * Add object array by id
	         * @param {fabric.Object} obj - fabric object
	         * @returns {number} object id
	         */

	    }, {
	        key: '_addFabricObject',
	        value: function _addFabricObject(obj) {
	            var id = stamp(obj);
	            this._objects[id] = obj;

	            return id;
	        }

	        /**
	         * Remove an object in array yb id
	         * @param {number} id - object id
	         */

	    }, {
	        key: '_removeFabricObject',
	        value: function _removeFabricObject(id) {
	            delete this._objects[id];
	        }
	    }]);

	    return Graphics;
	}();

	CustomEvents.mixin(Graphics);
	module.exports = Graphics;

/***/ }),
/* 106 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_106__;

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image loader
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages;

	var imageOption = {
	    padding: 0,
	    crossOrigin: 'Anonymous'
	};

	/**
	 * ImageLoader components
	 * @extends {Component}
	 * @class ImageLoader
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */

	var ImageLoader = function (_Component) {
	    _inherits(ImageLoader, _Component);

	    function ImageLoader(graphics) {
	        _classCallCheck(this, ImageLoader);

	        return _possibleConstructorReturn(this, (ImageLoader.__proto__ || Object.getPrototypeOf(ImageLoader)).call(this, componentNames.IMAGE_LOADER, graphics));
	    }

	    /**
	     * Load image from url
	     * @param {?string} imageName - File name
	     * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
	     * @returns {Promise}
	     */


	    _createClass(ImageLoader, [{
	        key: 'load',
	        value: function load(imageName, img) {
	            var _this2 = this;

	            var promise = void 0;

	            if (!imageName && !img) {
	                // Back to the initial state, not error.
	                var canvas = this.getCanvas();

	                canvas.backgroundImage = null;
	                canvas.renderAll();

	                promise = new _promise2.default(function (resolve) {
	                    _this2.setCanvasImage('', null);
	                    resolve();
	                });
	            } else {
	                promise = this._setBackgroundImage(img).then(function (oImage) {
	                    _this2.setCanvasImage(imageName, oImage);
	                    _this2.adjustCanvasDimension();

	                    return oImage;
	                });
	            }

	            return promise;
	        }

	        /**
	         * Set background image
	         * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: '_setBackgroundImage',
	        value: function _setBackgroundImage(img) {
	            var _this3 = this;

	            if (!img) {
	                return _promise2.default.reject(rejectMessages.loadImage);
	            }

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = _this3.getCanvas();

	                canvas.setBackgroundImage(img, function () {
	                    var oImage = canvas.backgroundImage;

	                    if (oImage && oImage.getElement()) {
	                        resolve(oImage);
	                    } else {
	                        reject(rejectMessages.loadingImageFailed);
	                    }
	                }, imageOption);
	            });
	        }
	    }]);

	    return ImageLoader;
	}(_component2.default);

	module.exports = ImageLoader;

/***/ }),
/* 108 */
/***/ (function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Component interface
	 */

	/**
	 * Component interface
	 * @class
	 * @param {string} name - component name
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */
	var Component = function () {
	  function Component(name, graphics) {
	    _classCallCheck(this, Component);

	    /**
	     * Component name
	     * @type {string}
	     */
	    this.name = name;

	    /**
	     * Graphics instance
	     * @type {Graphics}
	     */
	    this.graphics = graphics;
	  }

	  /**
	   * Fire Graphics event
	   * @returns {Object} return value
	   */


	  _createClass(Component, [{
	    key: "fire",
	    value: function fire() {
	      var context = this.graphics;

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return this.graphics.fire.apply(context, args);
	    }

	    /**
	     * Save image(background) of canvas
	     * @param {string} name - Name of image
	     * @param {fabric.Image} oImage - Fabric image instance
	     */

	  }, {
	    key: "setCanvasImage",
	    value: function setCanvasImage(name, oImage) {
	      this.graphics.setCanvasImage(name, oImage);
	    }

	    /**
	     * Returns canvas element of fabric.Canvas[[lower-canvas]]
	     * @returns {HTMLCanvasElement}
	     */

	  }, {
	    key: "getCanvasElement",
	    value: function getCanvasElement() {
	      return this.graphics.getCanvasElement();
	    }

	    /**
	     * Get fabric.Canvas instance
	     * @returns {fabric.Canvas}
	     */

	  }, {
	    key: "getCanvas",
	    value: function getCanvas() {
	      return this.graphics.getCanvas();
	    }

	    /**
	     * Get canvasImage (fabric.Image instance)
	     * @returns {fabric.Image}
	     */

	  }, {
	    key: "getCanvasImage",
	    value: function getCanvasImage() {
	      return this.graphics.getCanvasImage();
	    }

	    /**
	     * Get image name
	     * @returns {string}
	     */

	  }, {
	    key: "getImageName",
	    value: function getImageName() {
	      return this.graphics.getImageName();
	    }

	    /**
	     * Get image editor
	     * @returns {ImageEditor}
	     */

	  }, {
	    key: "getEditor",
	    value: function getEditor() {
	      return this.graphics.getEditor();
	    }

	    /**
	     * Return component name
	     * @returns {string}
	     */

	  }, {
	    key: "getName",
	    value: function getName() {
	      return this.name;
	    }

	    /**
	     * Set image properties
	     * @param {Object} setting - Image properties
	     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
	     */

	  }, {
	    key: "setImageProperties",
	    value: function setImageProperties(setting, withRendering) {
	      this.graphics.setImageProperties(setting, withRendering);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {Object} dimension - Canvas css dimension
	     */

	  }, {
	    key: "setCanvasCssDimension",
	    value: function setCanvasCssDimension(dimension) {
	      this.graphics.setCanvasCssDimension(dimension);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {Object} dimension - Canvas backstore dimension
	     */

	  }, {
	    key: "setCanvasBackstoreDimension",
	    value: function setCanvasBackstoreDimension(dimension) {
	      this.graphics.setCanvasBackstoreDimension(dimension);
	    }

	    /**
	     * Adjust canvas dimension with scaling image
	     */

	  }, {
	    key: "adjustCanvasDimension",
	    value: function adjustCanvasDimension() {
	      this.graphics.adjustCanvasDimension();
	    }
	  }]);

	  return Component;
	}();

	module.exports = Component;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _cropzone = __webpack_require__(110);

	var _cropzone2 = _interopRequireDefault(_cropzone);

	var _consts = __webpack_require__(73);

	var _util = __webpack_require__(72);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image crop module (start cropping, end cropping)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var MOUSE_MOVE_THRESHOLD = 10;
	var DEFAULT_OPTION = {
	    top: -10,
	    left: -10,
	    height: 1,
	    width: 1
	};

	/**
	 * Cropper components
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @class Cropper
	 * @ignore
	 */

	var Cropper = function (_Component) {
	    _inherits(Cropper, _Component);

	    function Cropper(graphics) {
	        _classCallCheck(this, Cropper);

	        /**
	         * Cropzone
	         * @type {Cropzone}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Cropper.__proto__ || Object.getPrototypeOf(Cropper)).call(this, _consts.componentNames.CROPPER, graphics));

	        _this._cropzone = null;

	        /**
	         * StartX of Cropzone
	         * @type {number}
	         * @private
	         */
	        _this._startX = null;

	        /**
	         * StartY of Cropzone
	         * @type {number}
	         * @private
	         */
	        _this._startY = null;

	        /**
	         * State whether shortcut key is pressed or not
	         * @type {boolean}
	         * @private
	         */
	        _this._withShiftKey = false;

	        /**
	         * Listeners
	         * @type {object.<string, function>}
	         * @private
	         */
	        _this._listeners = {
	            keydown: _this._onKeyDown.bind(_this),
	            keyup: _this._onKeyUp.bind(_this),
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this)
	        };
	        return _this;
	    }

	    /**
	     * Start cropping
	     */


	    _createClass(Cropper, [{
	        key: 'start',
	        value: function start() {
	            if (this._cropzone) {
	                return;
	            }
	            var canvas = this.getCanvas();

	            canvas.forEachObject(function (obj) {
	                // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
	                obj.evented = false;
	            });

	            this._cropzone = new _cropzone2.default({
	                left: -10,
	                top: -10,
	                width: 1,
	                height: 1,
	                strokeWidth: 0, // {@link https://github.com/kangax/fabric.js/issues/2860}
	                cornerSize: 10,
	                cornerColor: 'black',
	                fill: 'transparent',
	                hasRotatingPoint: false,
	                hasBorders: false,
	                lockScalingFlip: true,
	                lockRotation: true
	            }, this.graphics.cropSelectionStyle);

	            canvas.deactivateAll();
	            canvas.add(this._cropzone);
	            canvas.on('mouse:down', this._listeners.mousedown);
	            canvas.selection = false;
	            canvas.defaultCursor = 'crosshair';

	            _fabric2.default.util.addListener(document, 'keydown', this._listeners.keydown);
	            _fabric2.default.util.addListener(document, 'keyup', this._listeners.keyup);
	        }

	        /**
	         * End cropping
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();
	            var cropzone = this._cropzone;

	            if (!cropzone) {
	                return;
	            }
	            cropzone.remove();
	            canvas.selection = true;
	            canvas.defaultCursor = 'default';
	            canvas.off('mouse:down', this._listeners.mousedown);
	            canvas.forEachObject(function (obj) {
	                obj.evented = true;
	            });

	            this._cropzone = null;

	            _fabric2.default.util.removeListener(document, 'keydown', this._listeners.keydown);
	            _fabric2.default.util.removeListener(document, 'keyup', this._listeners.keyup);
	        }

	        /**
	         * onMousedown handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var canvas = this.getCanvas();

	            if (fEvent.target) {
	                return;
	            }

	            canvas.selection = false;
	            var coord = canvas.getPointer(fEvent.e);

	            this._startX = coord.x;
	            this._startY = coord.y;

	            canvas.on({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }

	        /**
	         * onMousemove handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);
	            var x = pointer.x,
	                y = pointer.y;

	            var cropzone = this._cropzone;

	            if (Math.abs(x - this._startX) + Math.abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
	                cropzone.remove();
	                cropzone.set(this._calcRectDimensionFromPoint(x, y));

	                canvas.add(cropzone);
	            }
	        }

	        /**
	         * Get rect dimension setting from Canvas-Mouse-Position(x, y)
	         * @param {number} x - Canvas-Mouse-Position x
	         * @param {number} y - Canvas-Mouse-Position Y
	         * @returns {{left: number, top: number, width: number, height: number}}
	         * @private
	         */

	    }, {
	        key: '_calcRectDimensionFromPoint',
	        value: function _calcRectDimensionFromPoint(x, y) {
	            var canvas = this.getCanvas();
	            var canvasWidth = canvas.getWidth();
	            var canvasHeight = canvas.getHeight();
	            var startX = this._startX;
	            var startY = this._startY;
	            var left = (0, _util.clamp)(x, 0, startX);
	            var top = (0, _util.clamp)(y, 0, startY);
	            var width = (0, _util.clamp)(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
	            var height = (0, _util.clamp)(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

	            if (this._withShiftKey) {
	                // make fixed ratio cropzone
	                if (width > height) {
	                    height = width;
	                } else if (height > width) {
	                    width = height;
	                }

	                if (startX >= x) {
	                    left = startX - width;
	                }

	                if (startY >= y) {
	                    top = startY - height;
	                }
	            }

	            return {
	                left: left,
	                top: top,
	                width: width,
	                height: height
	            };
	        }

	        /**
	         * onMouseup handler in fabric canvas
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var cropzone = this._cropzone;
	            var listeners = this._listeners;
	            var canvas = this.getCanvas();

	            canvas.setActiveObject(cropzone);
	            canvas.off({
	                'mouse:move': listeners.mousemove,
	                'mouse:up': listeners.mouseup
	            });
	        }

	        /**
	         * Get cropped image data
	         * @param {Object} cropRect cropzone rect
	         *  @param {Number} cropRect.left left position
	         *  @param {Number} cropRect.top top position
	         *  @param {Number} cropRect.width width
	         *  @param {Number} cropRect.height height
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         */

	    }, {
	        key: 'getCroppedImageData',
	        value: function getCroppedImageData(cropRect) {
	            var canvas = this.getCanvas();
	            var containsCropzone = canvas.contains(this._cropzone);
	            if (!cropRect) {
	                return null;
	            }

	            if (containsCropzone) {
	                this._cropzone.remove();
	            }

	            var imageData = {
	                imageName: this.getImageName(),
	                url: canvas.toDataURL(cropRect)
	            };

	            if (containsCropzone) {
	                canvas.add(this._cropzone);
	            }

	            return imageData;
	        }

	        /**
	         * Get cropped rect
	         * @returns {Object} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            var cropzone = this._cropzone;

	            if (!cropzone.isValid()) {
	                return null;
	            }

	            return {
	                left: cropzone.getLeft(),
	                top: cropzone.getTop(),
	                width: cropzone.getWidth(),
	                height: cropzone.getHeight()
	            };
	        }

	        /**
	         * Set a cropzone square
	         * @param {number} [presetRatio] - preset ratio
	         */

	    }, {
	        key: 'setCropzoneRect',
	        value: function setCropzoneRect(presetRatio) {
	            var canvas = this.getCanvas();
	            var cropzone = this._cropzone;

	            canvas.deactivateAll();
	            canvas.selection = false;
	            cropzone.remove();

	            cropzone.set(presetRatio ? this._getPresetCropSizePosition(presetRatio) : DEFAULT_OPTION);

	            canvas.add(cropzone);
	            canvas.selection = true;

	            if (presetRatio) {
	                canvas.setActiveObject(cropzone);
	            }
	        }

	        /**
	         * Set a cropzone square
	         * @param {number} presetRatio - preset ratio
	         * @returns {{left: number, top: number, width: number, height: number}}
	         * @private
	         */

	    }, {
	        key: '_getPresetCropSizePosition',
	        value: function _getPresetCropSizePosition(presetRatio) {
	            var canvas = this.getCanvas();
	            var originalWidth = canvas.getWidth();
	            var originalHeight = canvas.getHeight();

	            var standardSize = originalWidth >= originalHeight ? originalWidth : originalHeight;
	            var getScale = function getScale(value, orignalValue) {
	                return value > orignalValue ? orignalValue / value : 1;
	            };

	            var width = standardSize * presetRatio;
	            var height = standardSize;

	            var scaleWidth = getScale(width, originalWidth);

	            var _snippet$map = _tuiCodeSnippet2.default.map([width, height], function (sizeValue) {
	                return sizeValue * scaleWidth;
	            });

	            width = _snippet$map[0];
	            height = _snippet$map[1];


	            var scaleHeight = getScale(height, originalHeight);

	            var _snippet$map2 = _tuiCodeSnippet2.default.map([width, height], function (sizeValue) {
	                return sizeValue * scaleHeight;
	            });

	            width = _snippet$map2[0];
	            height = _snippet$map2[1];


	            return {
	                top: (originalHeight - height) / 2,
	                left: (originalWidth - width) / 2,
	                width: width,
	                height: height
	            };
	        }

	        /**
	         * Keydown event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            if (e.keyCode === _consts.keyCodes.SHIFT) {
	                this._withShiftKey = true;
	            }
	        }

	        /**
	         * Keyup event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyUp',
	        value: function _onKeyUp(e) {
	            if (e.keyCode === _consts.keyCodes.SHIFT) {
	                this._withShiftKey = false;
	            }
	        }
	    }]);

	    return Cropper;
	}(_component2.default);

	module.exports = Cropper;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _util = __webpack_require__(72);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var CORNER_TYPE_TOP_LEFT = 'tl'; /**
	                                  * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                  * @fileoverview Cropzone extending fabric.Rect
	                                  */

	var CORNER_TYPE_TOP_RIGHT = 'tr';
	var CORNER_TYPE_MIDDLE_TOP = 'mt';
	var CORNER_TYPE_MIDDLE_LEFT = 'ml';
	var CORNER_TYPE_MIDDLE_RIGHT = 'mr';
	var CORNER_TYPE_MIDDLE_BOTTOM = 'mb';
	var CORNER_TYPE_BOTTOM_LEFT = 'bl';
	var CORNER_TYPE_BOTTOM_RIGHT = 'br';

	/**
	 * Cropzone object
	 * Issue: IE7, 8(with excanvas)
	 *  - Cropzone is a black zone without transparency.
	 * @class Cropzone
	 * @extends {fabric.Rect}
	 * @ignore
	 */
	var Cropzone = _fabric2.default.util.createClass(_fabric2.default.Rect, /** @lends Cropzone.prototype */{
	    /**
	     * Constructor
	     * @param {Object} options Options object
	     * @override
	     */
	    initialize: function initialize(options, extendsOptions) {
	        options = _tuiCodeSnippet2.default.extend(options, extendsOptions);
	        options.type = 'cropzone';

	        this.callSuper('initialize', options);

	        this.options = options;

	        this.on({
	            'moving': this._onMoving,
	            'scaling': this._onScaling
	        });
	    },


	    /**
	     * Render Crop-zone
	     * @param {CanvasRenderingContext2D} ctx - Context
	     * @private
	     * @override
	     */
	    _render: function _render(ctx) {
	        var cropzoneDashLineWidth = 7;
	        var cropzoneDashLineOffset = 7;
	        this.callSuper('_render', ctx);

	        // Calc original scale
	        var originalFlipX = this.flipX ? -1 : 1;
	        var originalFlipY = this.flipY ? -1 : 1;
	        var originalScaleX = originalFlipX / this.scaleX;
	        var originalScaleY = originalFlipY / this.scaleY;

	        // Set original scale
	        ctx.scale(originalScaleX, originalScaleY);

	        // Render outer rect
	        this._fillOuterRect(ctx, 'rgba(0, 0, 0, 0.55)');

	        if (this.options.lineWidth) {
	            this._fillInnerRect(ctx);
	            this._strokeBorder(ctx, 'rgb(255, 255, 255)', {
	                lineWidth: this.options.lineWidth
	            });
	        } else {
	            // Black dash line
	            this._strokeBorder(ctx, 'rgb(0, 0, 0)', {
	                lineDashWidth: cropzoneDashLineWidth
	            });

	            // White dash line
	            this._strokeBorder(ctx, 'rgb(255, 255, 255)', {
	                lineDashWidth: cropzoneDashLineWidth,
	                lineDashOffset: cropzoneDashLineOffset
	            });
	        }

	        // Reset scale
	        ctx.scale(1 / originalScaleX, 1 / originalScaleY);
	    },


	    /**
	     * Cropzone-coordinates with outer rectangle
	     *
	     *     x0     x1         x2      x3
	     *  y0 +--------------------------+
	     *     |///////|//////////|///////|    // <--- "Outer-rectangle"
	     *     |///////|//////////|///////|
	     *  y1 +-------+----------+-------+
	     *     |///////| Cropzone |///////|    Cropzone is the "Inner-rectangle"
	     *     |///////|  (0, 0)  |///////|    Center point (0, 0)
	     *  y2 +-------+----------+-------+
	     *     |///////|//////////|///////|
	     *     |///////|//////////|///////|
	     *  y3 +--------------------------+
	     *
	     * @typedef {{x: Array<number>, y: Array<number>}} cropzoneCoordinates
	     * @ignore
	     */

	    /**
	     * Fill outer rectangle
	     * @param {CanvasRenderingContext2D} ctx - Context
	     * @param {string|CanvasGradient|CanvasPattern} fillStyle - Fill-style
	     * @private
	     */
	    _fillOuterRect: function _fillOuterRect(ctx, fillStyle) {
	        var _getCoordinates = this._getCoordinates(ctx),
	            x = _getCoordinates.x,
	            y = _getCoordinates.y;

	        ctx.save();
	        ctx.fillStyle = fillStyle;
	        ctx.beginPath();

	        // Outer rectangle
	        // Numbers are +/-1 so that overlay edges don't get blurry.
	        ctx.moveTo(x[0] - 1, y[0] - 1);
	        ctx.lineTo(x[3] + 1, y[0] - 1);
	        ctx.lineTo(x[3] + 1, y[3] + 1);
	        ctx.lineTo(x[0] - 1, y[3] + 1);
	        ctx.lineTo(x[0] - 1, y[0] - 1);
	        ctx.closePath();

	        // Inner rectangle
	        ctx.moveTo(x[1], y[1]);
	        ctx.lineTo(x[1], y[2]);
	        ctx.lineTo(x[2], y[2]);
	        ctx.lineTo(x[2], y[1]);
	        ctx.lineTo(x[1], y[1]);
	        ctx.closePath();

	        ctx.fill();
	        ctx.restore();
	    },


	    /**
	     * Draw Inner grid line
	     * @param {CanvasRenderingContext2D} ctx - Context
	     * @private
	     */
	    _fillInnerRect: function _fillInnerRect(ctx) {
	        var _getCoordinates2 = this._getCoordinates(ctx),
	            outerX = _getCoordinates2.x,
	            outerY = _getCoordinates2.y;

	        var x = this._caculateInnerPosition(outerX, (outerX[2] - outerX[1]) / 3);
	        var y = this._caculateInnerPosition(outerY, (outerY[2] - outerY[1]) / 3);

	        ctx.save();
	        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
	        ctx.lineWidth = this.options.lineWidth;
	        ctx.beginPath();

	        ctx.moveTo(x[0], y[1]);
	        ctx.lineTo(x[3], y[1]);

	        ctx.moveTo(x[0], y[2]);
	        ctx.lineTo(x[3], y[2]);

	        ctx.moveTo(x[1], y[0]);
	        ctx.lineTo(x[1], y[3]);

	        ctx.moveTo(x[2], y[0]);
	        ctx.lineTo(x[2], y[3]);
	        ctx.stroke();
	        ctx.closePath();

	        ctx.restore();
	    },


	    /**
	     * Calculate Inner Position
	     * @param {Array} outer - outer position
	     * @param {number} size - interval for calcaulate
	     * @returns {Array} - inner position
	     * @private
	     */
	    _caculateInnerPosition: function _caculateInnerPosition(outer, size) {
	        var position = [];
	        position[0] = outer[1];
	        position[1] = outer[1] + size;
	        position[2] = outer[1] + size * 2;
	        position[3] = outer[2];

	        return position;
	    },


	    /**
	     * Get coordinates
	     * @param {CanvasRenderingContext2D} ctx - Context
	     * @returns {cropzoneCoordinates} - {@link cropzoneCoordinates}
	     * @private
	     */
	    _getCoordinates: function _getCoordinates(ctx) {
	        var width = this.getWidth(),
	            height = this.getHeight(),
	            halfWidth = width / 2,
	            halfHeight = height / 2,
	            left = this.getLeft(),
	            top = this.getTop(),
	            canvasEl = ctx.canvas; // canvas element, not fabric object

	        return {
	            x: _tuiCodeSnippet2.default.map([-(halfWidth + left), // x0
	            -halfWidth, // x1
	            halfWidth, // x2
	            halfWidth + (canvasEl.width - left - width) // x3
	            ], Math.ceil),
	            y: _tuiCodeSnippet2.default.map([-(halfHeight + top), // y0
	            -halfHeight, // y1
	            halfHeight, // y2
	            halfHeight + (canvasEl.height - top - height) // y3
	            ], Math.ceil)
	        };
	    },


	    /**
	     * Stroke border
	     * @param {CanvasRenderingContext2D} ctx - Context
	     * @param {string|CanvasGradient|CanvasPattern} strokeStyle - Stroke-style
	     * @param {number} lineDashWidth - Dash width
	     * @param {number} [lineDashOffset] - Dash offset
	     * @private
	     */
	    _strokeBorder: function _strokeBorder(ctx, strokeStyle, _ref) {
	        var lineDashWidth = _ref.lineDashWidth,
	            lineDashOffset = _ref.lineDashOffset,
	            lineWidth = _ref.lineWidth;

	        var halfWidth = this.getWidth() / 2,
	            halfHeight = this.getHeight() / 2;

	        ctx.save();
	        ctx.strokeStyle = strokeStyle;

	        if (ctx.setLineDash) {
	            ctx.setLineDash([lineDashWidth, lineDashWidth]);
	        }
	        if (lineDashOffset) {
	            ctx.lineDashOffset = lineDashOffset;
	        }
	        if (lineWidth) {
	            ctx.lineWidth = lineWidth;
	        }

	        ctx.beginPath();
	        ctx.moveTo(-halfWidth, -halfHeight);
	        ctx.lineTo(halfWidth, -halfHeight);
	        ctx.lineTo(halfWidth, halfHeight);
	        ctx.lineTo(-halfWidth, halfHeight);
	        ctx.lineTo(-halfWidth, -halfHeight);
	        ctx.stroke();

	        ctx.restore();
	    },


	    /**
	     * onMoving event listener
	     * @private
	     */
	    _onMoving: function _onMoving() {
	        var left = this.getLeft(),
	            top = this.getTop(),
	            width = this.getWidth(),
	            height = this.getHeight(),
	            maxLeft = this.canvas.getWidth() - width,
	            maxTop = this.canvas.getHeight() - height;

	        this.setLeft((0, _util.clamp)(left, 0, maxLeft));
	        this.setTop((0, _util.clamp)(top, 0, maxTop));
	    },


	    /**
	     * onScaling event listener
	     * @param {{e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onScaling: function _onScaling(fEvent) {
	        var pointer = this.canvas.getPointer(fEvent.e),
	            settings = this._calcScalingSizeFromPointer(pointer);

	        // On scaling cropzone,
	        // change real width and height and fix scaleFactor to 1
	        this.scale(1).set(settings);
	    },


	    /**
	     * Calc scaled size from mouse pointer with selected corner
	     * @param {{x: number, y: number}} pointer - Mouse position
	     * @returns {Object} Having left or(and) top or(and) width or(and) height.
	     * @private
	     */
	    _calcScalingSizeFromPointer: function _calcScalingSizeFromPointer(pointer) {
	        var pointerX = pointer.x,
	            pointerY = pointer.y,
	            tlScalingSize = this._calcTopLeftScalingSizeFromPointer(pointerX, pointerY),
	            brScalingSize = this._calcBottomRightScalingSizeFromPointer(pointerX, pointerY);

	        /*
	         * @todo: 일반 객체에서 shift 조합키를 누르면 free size scaling이 됨 --> 확인해볼것
	         *      canvas.class.js // _scaleObject: function(...){...}
	         */
	        return this._makeScalingSettings(tlScalingSize, brScalingSize);
	    },


	    /**
	     * Calc scaling size(position + dimension) from left-top corner
	     * @param {number} x - Mouse position X
	     * @param {number} y - Mouse position Y
	     * @returns {{top: number, left: number, width: number, height: number}}
	     * @private
	     */
	    _calcTopLeftScalingSizeFromPointer: function _calcTopLeftScalingSizeFromPointer(x, y) {
	        var bottom = this.getHeight() + this.top,
	            right = this.getWidth() + this.left,
	            top = (0, _util.clamp)(y, 0, bottom - 1),
	            // 0 <= top <= (bottom - 1)
	        left = (0, _util.clamp)(x, 0, right - 1); // 0 <= left <= (right - 1)

	        // When scaling "Top-Left corner": It fixes right and bottom coordinates
	        return {
	            top: top,
	            left: left,
	            width: right - left,
	            height: bottom - top
	        };
	    },


	    /**
	     * Calc scaling size from right-bottom corner
	     * @param {number} x - Mouse position X
	     * @param {number} y - Mouse position Y
	     * @returns {{width: number, height: number}}
	     * @private
	     */
	    _calcBottomRightScalingSizeFromPointer: function _calcBottomRightScalingSizeFromPointer(x, y) {
	        var _canvas = this.canvas,
	            maxX = _canvas.width,
	            maxY = _canvas.height;
	        var left = this.left,
	            top = this.top;

	        // When scaling "Bottom-Right corner": It fixes left and top coordinates

	        return {
	            width: (0, _util.clamp)(x, left + 1, maxX) - left, // (width = x - left), (left + 1 <= x <= maxX)
	            height: (0, _util.clamp)(y, top + 1, maxY) - top // (height = y - top), (top + 1 <= y <= maxY)
	        };
	    },


	    /* eslint-disable complexity */
	    /**
	     * Make scaling settings
	     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
	     * @param {{width: number, height: number}} br - Bottom-Right setting
	     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
	     * @private
	     */
	    _makeScalingSettings: function _makeScalingSettings(tl, br) {
	        var tlWidth = tl.width;
	        var tlHeight = tl.height;
	        var brHeight = br.height;
	        var brWidth = br.width;
	        var tlLeft = tl.left;
	        var tlTop = tl.top;
	        var settings = void 0;

	        switch (this.__corner) {
	            case CORNER_TYPE_TOP_LEFT:
	                settings = tl;
	                break;
	            case CORNER_TYPE_TOP_RIGHT:
	                settings = {
	                    width: brWidth,
	                    height: tlHeight,
	                    top: tlTop
	                };
	                break;
	            case CORNER_TYPE_BOTTOM_LEFT:
	                settings = {
	                    width: tlWidth,
	                    height: brHeight,
	                    left: tlLeft
	                };
	                break;
	            case CORNER_TYPE_BOTTOM_RIGHT:
	                settings = br;
	                break;
	            case CORNER_TYPE_MIDDLE_LEFT:
	                settings = {
	                    width: tlWidth,
	                    left: tlLeft
	                };
	                break;
	            case CORNER_TYPE_MIDDLE_TOP:
	                settings = {
	                    height: tlHeight,
	                    top: tlTop
	                };
	                break;
	            case CORNER_TYPE_MIDDLE_RIGHT:
	                settings = {
	                    width: brWidth
	                };
	                break;
	            case CORNER_TYPE_MIDDLE_BOTTOM:
	                settings = {
	                    height: brHeight
	                };
	                break;
	            default:
	                break;
	        }

	        return settings;
	    },
	    /* eslint-enable complexity */

	    /**
	     * Return the whether this cropzone is valid
	     * @returns {boolean}
	     */
	    isValid: function isValid() {
	        return this.left >= 0 && this.top >= 0 && this.width > 0 && this.height > 0;
	    }
	});

	module.exports = Cropzone;

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image flip module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages;

	/**
	 * Flip
	 * @class Flip
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Flip = function (_Component) {
	    _inherits(Flip, _Component);

	    function Flip(graphics) {
	        _classCallCheck(this, Flip);

	        return _possibleConstructorReturn(this, (Flip.__proto__ || Object.getPrototypeOf(Flip)).call(this, componentNames.FLIP, graphics));
	    }

	    /**
	     * Get current flip settings
	     * @returns {{flipX: Boolean, flipY: Boolean}}
	     */


	    _createClass(Flip, [{
	        key: 'getCurrentSetting',
	        value: function getCurrentSetting() {
	            var canvasImage = this.getCanvasImage();

	            return {
	                flipX: canvasImage.flipX,
	                flipY: canvasImage.flipY
	            };
	        }

	        /**
	         * Set flipX, flipY
	         * @param {{flipX: Boolean, flipY: Boolean}} newSetting - Flip setting
	         * @returns {Promise}
	         */

	    }, {
	        key: 'set',
	        value: function set(newSetting) {
	            var setting = this.getCurrentSetting();
	            var isChangingFlipX = setting.flipX !== newSetting.flipX;
	            var isChangingFlipY = setting.flipY !== newSetting.flipY;

	            if (!isChangingFlipX && !isChangingFlipY) {
	                return _promise2.default.reject(rejectMessages.flip);
	            }

	            _tuiCodeSnippet2.default.extend(setting, newSetting);
	            this.setImageProperties(setting, true);
	            this._invertAngle(isChangingFlipX, isChangingFlipY);
	            this._flipObjects(isChangingFlipX, isChangingFlipY);

	            return _promise2.default.resolve({
	                flipX: setting.flipX,
	                flipY: setting.flipY,
	                angle: this.getCanvasImage().angle
	            });
	        }

	        /**
	         * Invert image angle for flip
	         * @param {boolean} isChangingFlipX - Change flipX
	         * @param {boolean} isChangingFlipY - Change flipY
	         */

	    }, {
	        key: '_invertAngle',
	        value: function _invertAngle(isChangingFlipX, isChangingFlipY) {
	            var canvasImage = this.getCanvasImage();
	            var angle = canvasImage.angle;


	            if (isChangingFlipX) {
	                angle *= -1;
	            }
	            if (isChangingFlipY) {
	                angle *= -1;
	            }
	            canvasImage.setAngle(parseFloat(angle)).setCoords(); // parseFloat for -0 to 0
	        }

	        /**
	         * Flip objects
	         * @param {boolean} isChangingFlipX - Change flipX
	         * @param {boolean} isChangingFlipY - Change flipY
	         * @private
	         */

	    }, {
	        key: '_flipObjects',
	        value: function _flipObjects(isChangingFlipX, isChangingFlipY) {
	            var canvas = this.getCanvas();

	            if (isChangingFlipX) {
	                canvas.forEachObject(function (obj) {
	                    obj.set({
	                        angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
	                        flipX: !obj.flipX,
	                        left: canvas.width - obj.left
	                    }).setCoords();
	                });
	            }
	            if (isChangingFlipY) {
	                canvas.forEachObject(function (obj) {
	                    obj.set({
	                        angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
	                        flipY: !obj.flipY,
	                        top: canvas.height - obj.top
	                    }).setCoords();
	                });
	            }
	            canvas.renderAll();
	        }

	        /**
	         * Reset flip settings
	         * @returns {Promise}
	         */

	    }, {
	        key: 'reset',
	        value: function reset() {
	            return this.set({
	                flipX: false,
	                flipY: false
	            });
	        }

	        /**
	         * Flip x
	         * @returns {Promise}
	         */

	    }, {
	        key: 'flipX',
	        value: function flipX() {
	            var current = this.getCurrentSetting();

	            return this.set({
	                flipX: !current.flipX,
	                flipY: current.flipY
	            });
	        }

	        /**
	         * Flip y
	         * @returns {Promise}
	         */

	    }, {
	        key: 'flipY',
	        value: function flipY() {
	            var current = this.getCurrentSetting();

	            return this.set({
	                flipX: current.flipX,
	                flipY: !current.flipY
	            });
	        }
	    }]);

	    return Flip;
	}(_component2.default);

	module.exports = Flip;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image rotation module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames;

	/**
	 * Image Rotation component
	 * @class Rotation
	 * @extends {Component}
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */

	var Rotation = function (_Component) {
	    _inherits(Rotation, _Component);

	    function Rotation(graphics) {
	        _classCallCheck(this, Rotation);

	        return _possibleConstructorReturn(this, (Rotation.__proto__ || Object.getPrototypeOf(Rotation)).call(this, componentNames.ROTATION, graphics));
	    }

	    /**
	     * Get current angle
	     * @returns {Number}
	     */


	    _createClass(Rotation, [{
	        key: 'getCurrentAngle',
	        value: function getCurrentAngle() {
	            return this.getCanvasImage().angle;
	        }

	        /**
	         * Set angle of the image
	         *
	         *  Do not call "this.setImageProperties" for setting angle directly.
	         *  Before setting angle, The originX,Y of image should be set to center.
	         *      See "http://fabricjs.com/docs/fabric.Object.html#setAngle"
	         *
	         * @param {number} angle - Angle value
	         * @returns {Promise}
	         */

	    }, {
	        key: 'setAngle',
	        value: function setAngle(angle) {
	            var oldAngle = this.getCurrentAngle() % 360; // The angle is lower than 2*PI(===360 degrees)

	            angle %= 360;

	            var canvasImage = this.getCanvasImage();
	            var oldImageCenter = canvasImage.getCenterPoint();
	            canvasImage.setAngle(angle).setCoords();
	            this.adjustCanvasDimension();
	            var newImageCenter = canvasImage.getCenterPoint();
	            this._rotateForEachObject(oldImageCenter, newImageCenter, angle - oldAngle);

	            return _promise2.default.resolve(angle);
	        }

	        /**
	         * Rotate for each object
	         * @param {fabric.Point} oldImageCenter - Image center point before rotation
	         * @param {fabric.Point} newImageCenter - Image center point after rotation
	         * @param {number} angleDiff - Image angle difference after rotation
	         * @private
	         */

	    }, {
	        key: '_rotateForEachObject',
	        value: function _rotateForEachObject(oldImageCenter, newImageCenter, angleDiff) {
	            var canvas = this.getCanvas();
	            var centerDiff = {
	                x: oldImageCenter.x - newImageCenter.x,
	                y: oldImageCenter.y - newImageCenter.y
	            };

	            canvas.forEachObject(function (obj) {
	                var objCenter = obj.getCenterPoint();
	                var radian = _fabric2.default.util.degreesToRadians(angleDiff);
	                var newObjCenter = _fabric2.default.util.rotatePoint(objCenter, oldImageCenter, radian);

	                obj.set({
	                    left: newObjCenter.x - centerDiff.x,
	                    top: newObjCenter.y - centerDiff.y,
	                    angle: (obj.angle + angleDiff) % 360
	                });
	                obj.setCoords();
	            });
	            canvas.renderAll();
	        }

	        /**
	         * Rotate the image
	         * @param {number} additionalAngle - Additional angle
	         * @returns {Promise}
	         */

	    }, {
	        key: 'rotate',
	        value: function rotate(additionalAngle) {
	            var current = this.getCurrentAngle();

	            return this.setAngle(current + additionalAngle);
	        }
	    }]);

	    return Rotation;
	}(_component2.default);

	module.exports = Rotation;

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Free drawing module, Set brush
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	/**
	 * FreeDrawing
	 * @class FreeDrawing
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */
	var FreeDrawing = function (_Component) {
	  _inherits(FreeDrawing, _Component);

	  function FreeDrawing(graphics) {
	    _classCallCheck(this, FreeDrawing);

	    /**
	     * Brush width
	     * @type {number}
	     */
	    var _this = _possibleConstructorReturn(this, (FreeDrawing.__proto__ || Object.getPrototypeOf(FreeDrawing)).call(this, _consts2.default.componentNames.FREE_DRAWING, graphics));

	    _this.width = 12;

	    /**
	     * fabric.Color instance for brush color
	     * @type {fabric.Color}
	     */
	    _this.oColor = new _fabric2.default.Color('rgba(0, 0, 0, 0.5)');
	    return _this;
	  }

	  /**
	   * Start free drawing mode
	   * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	   */


	  _createClass(FreeDrawing, [{
	    key: 'start',
	    value: function start(setting) {
	      var canvas = this.getCanvas();

	      canvas.isDrawingMode = true;
	      this.setBrush(setting);
	    }

	    /**
	     * Set brush
	     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	     */

	  }, {
	    key: 'setBrush',
	    value: function setBrush(setting) {
	      var brush = this.getCanvas().freeDrawingBrush;

	      setting = setting || {};
	      this.width = setting.width || this.width;
	      if (setting.color) {
	        this.oColor = new _fabric2.default.Color(setting.color);
	      }
	      brush.width = this.width;
	      brush.color = this.oColor.toRgba();
	    }

	    /**
	     * End free drawing mode
	     */

	  }, {
	    key: 'end',
	    value: function end() {
	      var canvas = this.getCanvas();

	      canvas.isDrawingMode = false;
	    }
	  }]);

	  return FreeDrawing;
	}(_component2.default);

	module.exports = FreeDrawing;

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Free drawing module, Set brush
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var eventNames = _consts2.default.eventNames;

	/**
	 * Line
	 * @class Line
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Line = function (_Component) {
	    _inherits(Line, _Component);

	    function Line(graphics) {
	        _classCallCheck(this, Line);

	        /**
	         * Brush width
	         * @type {number}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this, _consts2.default.componentNames.LINE, graphics));

	        _this._width = 12;

	        /**
	         * fabric.Color instance for brush color
	         * @type {fabric.Color}
	         * @private
	         */
	        _this._oColor = new _fabric2.default.Color('rgba(0, 0, 0, 0.5)');

	        /**
	         * Listeners
	         * @type {object.<string, function>}
	         * @private
	         */
	        _this._listeners = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this)
	        };
	        return _this;
	    }

	    /**
	     * Start drawing line mode
	     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	     */


	    _createClass(Line, [{
	        key: 'start',
	        value: function start(setting) {
	            var canvas = this.getCanvas();

	            canvas.defaultCursor = 'crosshair';
	            canvas.selection = false;

	            this.setBrush(setting);

	            canvas.forEachObject(function (obj) {
	                obj.set({
	                    evented: false
	                });
	            });

	            canvas.on({
	                'mouse:down': this._listeners.mousedown
	            });
	        }

	        /**
	         * Set brush
	         * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	         */

	    }, {
	        key: 'setBrush',
	        value: function setBrush(setting) {
	            var brush = this.getCanvas().freeDrawingBrush;

	            setting = setting || {};
	            this._width = setting.width || this._width;

	            if (setting.color) {
	                this._oColor = new _fabric2.default.Color(setting.color);
	            }
	            brush.width = this._width;
	            brush.color = this._oColor.toRgba();
	        }

	        /**
	         * End drawing line mode
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();

	            canvas.defaultCursor = 'default';
	            canvas.selection = true;

	            canvas.forEachObject(function (obj) {
	                obj.set({
	                    evented: true
	                });
	            });

	            canvas.off('mouse:down', this._listeners.mousedown);
	        }

	        /**
	         * Mousedown event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);
	            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

	            this._line = new _fabric2.default.Line(points, {
	                stroke: this._oColor.toRgba(),
	                strokeWidth: this._width,
	                evented: false
	            });

	            this._line.set(_consts2.default.fObjectOptions.SELECTION_STYLE);

	            canvas.add(this._line);

	            canvas.on({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }

	        /**
	         * Mousemove event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);

	            this._line.set({
	                x2: pointer.x,
	                y2: pointer.y
	            });

	            this._line.setCoords();

	            canvas.renderAll();
	        }

	        /**
	         * Mouseup event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var canvas = this.getCanvas();
	            var params = this.graphics.createObjectProperties(this._line);

	            this.fire(eventNames.ADD_OBJECT, params);

	            this._line = null;

	            canvas.off({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }
	    }]);

	    return Line;
	}(_component2.default);

	module.exports = Line;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(72);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Text module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var events = _consts2.default.eventNames;

	var defaultStyles = {
	    fill: '#000000',
	    left: 0,
	    top: 0
	};
	var resetStyles = {
	    fill: '#000000',
	    fontStyle: 'normal',
	    fontWeight: 'normal',
	    textAlign: 'left',
	    textDecoraiton: ''
	};
	var browser = _tuiCodeSnippet2.default.browser;


	var TEXTAREA_CLASSNAME = 'tui-image-eidtor-textarea';
	var TEXTAREA_STYLES = _util2.default.makeStyleText({
	    position: 'absolute',
	    padding: 0,
	    display: 'none',
	    border: '1px dotted red',
	    overflow: 'hidden',
	    resize: 'none',
	    outline: 'none',
	    'border-radius': 0,
	    'background-color': 'transparent',
	    '-webkit-appearance': 'none',
	    'z-index': 9999,
	    'white-space': 'pre'
	});
	var EXTRA_PIXEL_LINEHEIGHT = 0.1;
	var DBCLICK_TIME = 500;

	/**
	 * Text
	 * @class Text
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Text = function (_Component) {
	    _inherits(Text, _Component);

	    function Text(graphics) {
	        _classCallCheck(this, Text);

	        /**
	         * Default text style
	         * @type {Object}
	         */
	        var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, _consts2.default.componentNames.TEXT, graphics));

	        _this._defaultStyles = defaultStyles;

	        /**
	         * Selected state
	         * @type {boolean}
	         */
	        _this._isSelected = false;

	        /**
	         * Selected text object
	         * @type {Object}
	         */
	        _this._selectedObj = {};

	        /**
	         * Editing text object
	         * @type {Object}
	         */
	        _this._editingObj = {};

	        /**
	         * Listeners for fabric event
	         * @type {Object}
	         */
	        _this._listeners = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            select: _this._onFabricSelect.bind(_this),
	            selectClear: _this._onFabricSelectClear.bind(_this),
	            scaling: _this._onFabricScaling.bind(_this)
	        };

	        /**
	         * Textarea element for editing
	         * @type {HTMLElement}
	         */
	        _this._textarea = null;

	        /**
	         * Ratio of current canvas
	         * @type {number}
	         */
	        _this._ratio = 1;

	        /**
	         * Last click time
	         * @type {Date}
	         */
	        _this._lastClickTime = new Date().getTime();

	        /**
	         * Text object infos before editing
	         * @type {Object}
	         */
	        _this._editingObjInfos = {};

	        /**
	         * Previous state of editing
	         * @type {boolean}
	         */
	        _this.isPrevEditing = false;

	        /**
	         * use itext
	         * @type {boolean}
	         */
	        _this.useItext = graphics.useItext;
	        return _this;
	    }

	    /**
	     * Start input text mode
	     */


	    _createClass(Text, [{
	        key: 'start',
	        value: function start() {
	            var canvas = this.getCanvas();

	            canvas.selection = false;
	            canvas.defaultCursor = 'text';
	            canvas.on({
	                'mouse:down': this._listeners.mousedown,
	                'object:selected': this._listeners.select,
	                'before:selection:cleared': this._listeners.selectClear,
	                'object:scaling': this._listeners.scaling,
	                'text:editing': this._listeners.modify
	            });

	            if (this.useItext) {
	                canvas.forEachObject(function (obj) {
	                    if (obj.type === 'i-text') {
	                        obj.set({
	                            left: obj.left - obj.width / 2,
	                            top: obj.top - obj.height / 2,
	                            originX: 'left',
	                            originY: 'top'
	                        });
	                    }
	                });
	            } else {
	                this._createTextarea();
	            }

	            this.setCanvasRatio();
	        }

	        /**
	         * End input text mode
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();

	            canvas.selection = true;
	            canvas.defaultCursor = 'default';

	            if (this.useItext) {
	                canvas.forEachObject(function (obj) {
	                    if (obj.type === 'i-text') {
	                        if (obj.text === '') {
	                            obj.remove();
	                        } else {
	                            obj.set({
	                                left: obj.left + obj.width / 2,
	                                top: obj.top + obj.height / 2,
	                                originX: 'center',
	                                originY: 'center'
	                            });
	                        }
	                    }
	                });
	            } else {
	                canvas.deactivateAllWithDispatch();
	                this._removeTextarea();
	            }

	            canvas.off({
	                'mouse:down': this._listeners.mousedown,
	                'object:selected': this._listeners.select,
	                'before:selection:cleared': this._listeners.selectClear,
	                'object:scaling': this._listeners.scaling,
	                'text:editing': this._listeners.modify
	            });
	        }

	        /**
	         * Add new text on canvas image
	         * @param {string} text - Initial input text
	         * @param {Object} options - Options for generating text
	         *     @param {Object} [options.styles] Initial styles
	         *         @param {string} [options.styles.fill] Color
	         *         @param {string} [options.styles.fontFamily] Font type for text
	         *         @param {number} [options.styles.fontSize] Size
	         *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	         *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	         *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	         *     @param {{x: number, y: number}} [options.position] - Initial position
	         * @returns {Promise}
	         */

	    }, {
	        key: 'add',
	        value: function add(text, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve) {
	                var canvas = _this2.getCanvas();
	                var newText = null;
	                var selectionStyle = _consts2.default.fObjectOptions.SELECTION_STYLE;
	                var styles = _this2._defaultStyles;

	                _this2._setInitPos(options.position);

	                if (options.styles) {
	                    styles = _tuiCodeSnippet2.default.extend(styles, options.styles);
	                }

	                if (_this2.useItext) {
	                    newText = new _fabric2.default.IText(text, styles);
	                    selectionStyle = _tuiCodeSnippet2.default.extend({}, selectionStyle, {
	                        originX: 'left',
	                        originY: 'top'
	                    });
	                } else {
	                    newText = new _fabric2.default.Text(text, styles);
	                }

	                newText.set(selectionStyle);
	                newText.on({
	                    mouseup: _this2._onFabricMouseUp.bind(_this2)
	                });

	                canvas.add(newText);

	                if (!canvas.getActiveObject()) {
	                    canvas.setActiveObject(newText);
	                }

	                _this2.isPrevEditing = true;
	                resolve(_this2.graphics.createObjectProperties(newText));
	            });
	        }

	        /**
	         * Change text of activate object on canvas image
	         * @param {Object} activeObj - Current selected text object
	         * @param {string} text - Changed text
	         * @returns {Promise}
	         */

	    }, {
	        key: 'change',
	        value: function change(activeObj, text) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve) {
	                activeObj.set('text', text);

	                _this3.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Set style
	         * @param {Object} activeObj - Current selected text object
	         * @param {Object} styleObj - Initial styles
	         *     @param {string} [styleObj.fill] Color
	         *     @param {string} [styleObj.fontFamily] Font type for text
	         *     @param {number} [styleObj.fontSize] Size
	         *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
	         *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Promise}
	         */

	    }, {
	        key: 'setStyle',
	        value: function setStyle(activeObj, styleObj) {
	            var _this4 = this;

	            return new _promise2.default(function (resolve) {
	                _tuiCodeSnippet2.default.forEach(styleObj, function (val, key) {
	                    if (activeObj[key] === val) {
	                        styleObj[key] = resetStyles[key] || '';
	                    }
	                }, _this4);

	                activeObj.set(styleObj);

	                _this4.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Get the text
	         * @param {Object} activeObj - Current selected text object
	         * @returns {String} text
	         */

	    }, {
	        key: 'getText',
	        value: function getText(activeObj) {
	            return activeObj.getText();
	        }

	        /**
	         * Set infos of the current selected object
	         * @param {fabric.Text} obj - Current selected text object
	         * @param {boolean} state - State of selecting
	         */

	    }, {
	        key: 'setSelectedInfo',
	        value: function setSelectedInfo(obj, state) {
	            this._selectedObj = obj;
	            this._isSelected = state;
	        }

	        /**
	         * Whether object is selected or not
	         * @returns {boolean} State of selecting
	         */

	    }, {
	        key: 'isSelected',
	        value: function isSelected() {
	            return this._isSelected;
	        }

	        /**
	         * Get current selected text object
	         * @returns {fabric.Text} Current selected text object
	         */

	    }, {
	        key: 'getSelectedObj',
	        value: function getSelectedObj() {
	            return this._selectedObj;
	        }

	        /**
	         * Set ratio value of canvas
	         */

	    }, {
	        key: 'setCanvasRatio',
	        value: function setCanvasRatio() {
	            var canvasElement = this.getCanvasElement();
	            var cssWidth = parseInt(canvasElement.style.maxWidth, 10);
	            var originWidth = canvasElement.width;
	            var ratio = originWidth / cssWidth;

	            this._ratio = ratio;
	        }

	        /**
	         * Get ratio value of canvas
	         * @returns {number} Ratio value
	         */

	    }, {
	        key: 'getCanvasRatio',
	        value: function getCanvasRatio() {
	            return this._ratio;
	        }

	        /**
	         * Set initial position on canvas image
	         * @param {{x: number, y: number}} [position] - Selected position
	         * @private
	         */

	    }, {
	        key: '_setInitPos',
	        value: function _setInitPos(position) {
	            position = position || this.getCanvasImage().getCenterPoint();

	            this._defaultStyles.left = position.x;
	            this._defaultStyles.top = position.y;
	        }

	        /**
	         * Create textarea element on canvas container
	         * @private
	         */

	    }, {
	        key: '_createTextarea',
	        value: function _createTextarea() {
	            var container = this.getCanvasElement().parentNode;
	            var textarea = document.createElement('textarea');

	            textarea.className = TEXTAREA_CLASSNAME;
	            textarea.setAttribute('style', TEXTAREA_STYLES);
	            textarea.setAttribute('wrap', 'off');

	            container.appendChild(textarea);

	            this._textarea = textarea;

	            this._listeners = _tuiCodeSnippet2.default.extend(this._listeners, {
	                input: this._onInput.bind(this),
	                keydown: this._onKeyDown.bind(this),
	                blur: this._onBlur.bind(this),
	                scroll: this._onScroll.bind(this)
	            });

	            if (browser.msie && browser.version === 9) {
	                _fabric2.default.util.addListener(textarea, 'keydown', this._listeners.keydown);
	            } else {
	                _fabric2.default.util.addListener(textarea, 'input', this._listeners.input);
	            }
	            _fabric2.default.util.addListener(textarea, 'blur', this._listeners.blur);
	            _fabric2.default.util.addListener(textarea, 'scroll', this._listeners.scroll);
	        }

	        /**
	         * Remove textarea element on canvas container
	         * @private
	         */

	    }, {
	        key: '_removeTextarea',
	        value: function _removeTextarea() {
	            var container = this.getCanvasElement().parentNode;
	            var textarea = container.querySelector('textarea');

	            container.removeChild(textarea);

	            this._textarea = null;

	            if (browser.msie && browser.version < 10) {
	                _fabric2.default.util.removeListener(textarea, 'keydown', this._listeners.keydown);
	            } else {
	                _fabric2.default.util.removeListener(textarea, 'input', this._listeners.input);
	            }
	            _fabric2.default.util.removeListener(textarea, 'blur', this._listeners.blur);
	            _fabric2.default.util.removeListener(textarea, 'scroll', this._listeners.scroll);
	        }

	        /**
	         * Input event handler
	         * @private
	         */

	    }, {
	        key: '_onInput',
	        value: function _onInput() {
	            var ratio = this.getCanvasRatio();
	            var obj = this._editingObj;
	            var textareaStyle = this._textarea.style;

	            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	        }

	        /**
	         * Keydown event handler
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown() {
	            var _this5 = this;

	            var ratio = this.getCanvasRatio();
	            var obj = this._editingObj;
	            var textareaStyle = this._textarea.style;

	            setTimeout(function () {
	                obj.setText(_this5._textarea.value);

	                textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	                textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	            }, 0);
	        }

	        /**
	         * Blur event handler
	         * @private
	         */

	    }, {
	        key: '_onBlur',
	        value: function _onBlur() {
	            var ratio = this.getCanvasRatio();
	            var editingObj = this._editingObj;
	            var editingObjInfos = this._editingObjInfos;
	            var textContent = this._textarea.value;
	            var transWidth = editingObj.getWidth() / ratio - editingObjInfos.width / ratio;
	            var transHeight = editingObj.getHeight() / ratio - editingObjInfos.height / ratio;

	            if (ratio === 1) {
	                transWidth /= 2;
	                transHeight /= 2;
	            }

	            this._textarea.style.display = 'none';

	            editingObj.set({
	                left: editingObjInfos.left + transWidth,
	                top: editingObjInfos.top + transHeight
	            });

	            if (textContent.length) {
	                this.getCanvas().add(editingObj);

	                var params = {
	                    id: _tuiCodeSnippet2.default.stamp(editingObj),
	                    type: editingObj.type,
	                    text: textContent
	                };

	                this.fire(events.TEXT_CHANGED, params);
	            }
	        }

	        /**
	         * Scroll event handler
	         * @private
	         */

	    }, {
	        key: '_onScroll',
	        value: function _onScroll() {
	            this._textarea.scrollLeft = 0;
	            this._textarea.scrollTop = 0;
	        }

	        /**
	         * Fabric scaling event handler
	         * @param {fabric.Event} fEvent - Current scaling event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricScaling',
	        value: function _onFabricScaling(fEvent) {
	            var obj = fEvent.target;
	            var scalingSize = obj.getFontSize() * obj.getScaleY();

	            obj.setFontSize(scalingSize);
	            obj.setScaleX(1);
	            obj.setScaleY(1);
	        }

	        /**
	         * onSelectClear handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricSelectClear',
	        value: function _onFabricSelectClear(fEvent) {
	            var obj = this.getSelectedObj();

	            this.isPrevEditing = true;

	            this.setSelectedInfo(fEvent.target, false);

	            if (obj) {
	                // obj is empty object at initial time, will be set fabric object
	                if (obj.text === '') {
	                    obj.remove();
	                }
	            }
	        }

	        /**
	         * onSelect handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricSelect',
	        value: function _onFabricSelect(fEvent) {
	            this.isPrevEditing = true;

	            this.setSelectedInfo(fEvent.target, true);
	        }

	        /**
	         * Fabric 'mousedown' event handler
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var obj = fEvent.target;

	            if (obj && !obj.isType('text')) {
	                return;
	            }

	            if (this.isPrevEditing) {
	                this.isPrevEditing = false;

	                return;
	            }

	            this._fireAddText(fEvent);
	        }

	        /**
	         * Fire 'addText' event if object is not selected.
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_fireAddText',
	        value: function _fireAddText(fEvent) {
	            var obj = fEvent.target;
	            var e = fEvent.e || {};
	            var originPointer = this.getCanvas().getPointer(e);

	            if (!obj) {
	                this.fire(events.ADD_TEXT, {
	                    originPosition: {
	                        x: originPointer.x,
	                        y: originPointer.y
	                    },
	                    clientPosition: {
	                        x: e.clientX || 0,
	                        y: e.clientY || 0
	                    }
	                });
	            }
	        }

	        /**
	         * Fabric mouseup event handler
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp(fEvent) {
	            var newClickTime = new Date().getTime();

	            if (this._isDoubleClick(newClickTime)) {
	                if (!this.useItext) {
	                    this._changeToEditingMode(fEvent.target);
	                }
	                this.fire(events.TEXT_EDITING); // fire editing text event
	            }

	            this._lastClickTime = newClickTime;
	        }

	        /**
	         * Get state of firing double click event
	         * @param {Date} newClickTime - Current clicked time
	         * @returns {boolean} Whether double clicked or not
	         * @private
	         */

	    }, {
	        key: '_isDoubleClick',
	        value: function _isDoubleClick(newClickTime) {
	            return newClickTime - this._lastClickTime < DBCLICK_TIME;
	        }

	        /**
	         * Change state of text object for editing
	         * @param {fabric.Text} obj - Text object fired event
	         * @private
	         */

	    }, {
	        key: '_changeToEditingMode',
	        value: function _changeToEditingMode(obj) {
	            var ratio = this.getCanvasRatio();
	            var textareaStyle = this._textarea.style;

	            this.isPrevEditing = true;

	            obj.remove();

	            this._editingObj = obj;
	            this._textarea.value = obj.getText();

	            this._editingObjInfos = {
	                left: this._editingObj.getLeft(),
	                top: this._editingObj.getTop(),
	                width: this._editingObj.getWidth(),
	                height: this._editingObj.getHeight()
	            };

	            textareaStyle.display = 'block';
	            textareaStyle.left = obj.oCoords.tl.x / ratio + 'px';
	            textareaStyle.top = obj.oCoords.tl.y / ratio + 'px';
	            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	            textareaStyle.transform = 'rotate(' + obj.getAngle() + 'deg)';
	            textareaStyle.color = obj.getFill();

	            textareaStyle['font-size'] = obj.getFontSize() / ratio + 'px';
	            textareaStyle['font-family'] = obj.getFontFamily();
	            textareaStyle['font-style'] = obj.getFontStyle();
	            textareaStyle['font-weight'] = obj.getFontWeight();
	            textareaStyle['text-align'] = obj.getTextAlign();
	            textareaStyle['line-height'] = obj.getLineHeight() + EXTRA_PIXEL_LINEHEIGHT;
	            textareaStyle['transform-origin'] = 'left top';

	            this._textarea.focus();
	        }
	    }]);

	    return Text;
	}(_component2.default);

	module.exports = Text;

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add icon module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var events = _consts2.default.eventNames;
	var rejectMessages = _consts2.default.rejectMessages;


	var pathMap = {
	    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
	    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' + 'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
	};

	/**
	 * Icon
	 * @class Icon
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Icon = function (_Component) {
	    _inherits(Icon, _Component);

	    function Icon(graphics) {
	        _classCallCheck(this, Icon);

	        /**
	         * Default icon color
	         * @type {string}
	         */
	        var _this = _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).call(this, _consts2.default.componentNames.ICON, graphics));

	        _this._oColor = '#000000';

	        /**
	         * Path value of each icon type
	         * @type {Object}
	         */
	        _this._pathMap = pathMap;

	        /**
	         * Option to add icon to drag.
	         * @type {boolean}
	         */
	        _this.useDragAddIcon = graphics.useDragAddIcon;
	        return _this;
	    }

	    /**
	     * Add icon
	     * @param {string} type - Icon type
	     * @param {Object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     * @returns {Promise}
	     */


	    _createClass(Icon, [{
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = _this2.getCanvas();
	                var path = _this2._pathMap[type];
	                var selectionStyle = _consts2.default.fObjectOptions.SELECTION_STYLE;
	                var registerdIcon = Object.keys(_consts2.default.defaultIconPath).indexOf(type) >= 0;
	                var useDragAddIcon = _this2.useDragAddIcon && registerdIcon;
	                var icon = path ? _this2._createIcon(path) : null;

	                if (!icon) {
	                    reject(rejectMessages.invalidParameters);
	                }

	                icon.set(_tuiCodeSnippet2.default.extend({
	                    type: 'icon',
	                    fill: _this2._oColor
	                }, selectionStyle, options, _this2.graphics.controlStyle));

	                canvas.add(icon).setActiveObject(icon);

	                if (useDragAddIcon) {
	                    _this2._addWithDragEvent(canvas);
	                }

	                resolve(_this2.graphics.createObjectProperties(icon));
	            });
	        }

	        /**
	         * Added icon drag event
	         * @param {fabric.Canvas} canvas - Canvas instance
	         * @private
	         */

	    }, {
	        key: '_addWithDragEvent',
	        value: function _addWithDragEvent(canvas) {
	            var _this3 = this;

	            canvas.on({
	                'mouse:move': function mouseMove(fEvent) {
	                    canvas.selection = false;

	                    _this3.fire(events.ICON_CREATE_RESIZE, {
	                        moveOriginPointer: canvas.getPointer(fEvent.e)
	                    });
	                },
	                'mouse:up': function mouseUp(fEvent) {
	                    _this3.fire(events.ICON_CREATE_END, {
	                        moveOriginPointer: canvas.getPointer(fEvent.e)
	                    });

	                    canvas.defaultCursor = 'default';
	                    canvas.off('mouse:up');
	                    canvas.off('mouse:move');
	                    canvas.selection = true;
	                }
	            });
	        }

	        /**
	         * Register icon paths
	         * @param {{key: string, value: string}} pathInfos - Path infos
	         */

	    }, {
	        key: 'registerPaths',
	        value: function registerPaths(pathInfos) {
	            var _this4 = this;

	            _tuiCodeSnippet2.default.forEach(pathInfos, function (path, type) {
	                _this4._pathMap[type] = path;
	            }, this);
	        }

	        /**
	         * Set icon object color
	         * @param {string} color - Color to set
	         * @param {fabric.Path}[obj] - Current activated path object
	         */

	    }, {
	        key: 'setColor',
	        value: function setColor(color, obj) {
	            this._oColor = color;

	            if (obj && obj.get('type') === 'icon') {
	                obj.setFill(this._oColor);
	                this.getCanvas().renderAll();
	            }
	        }

	        /**
	         * Get icon color
	         * @param {fabric.Path}[obj] - Current activated path object
	         * @returns {string} color
	         */

	    }, {
	        key: 'getColor',
	        value: function getColor(obj) {
	            return obj.fill;
	        }

	        /**
	         * Create icon object
	         * @param {string} path - Path value to create icon
	         * @returns {fabric.Path} Path object
	         */

	    }, {
	        key: '_createIcon',
	        value: function _createIcon(path) {
	            return new _fabric2.default.Path(path);
	        }
	    }]);

	    return Icon;
	}(_component2.default);

	module.exports = Icon;

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(3);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _mask = __webpack_require__(118);

	var _mask2 = _interopRequireDefault(_mask);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	var _blur = __webpack_require__(119);

	var _blur2 = _interopRequireDefault(_blur);

	var _sharpen = __webpack_require__(120);

	var _sharpen2 = _interopRequireDefault(_sharpen);

	var _emboss = __webpack_require__(121);

	var _emboss2 = _interopRequireDefault(_emboss);

	var _colorFilter = __webpack_require__(122);

	var _colorFilter2 = _interopRequireDefault(_colorFilter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add filter module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var rejectMessages = _consts2.default.rejectMessages;
	var filters = _fabric2.default.Image.filters;

	filters.Mask = _mask2.default;
	filters.Blur = _blur2.default;
	filters.Sharpen = _sharpen2.default;
	filters.Emboss = _emboss2.default;
	filters.ColorFilter = _colorFilter2.default;

	/**
	 * Filter
	 * @class Filter
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Filter = function (_Component) {
	    _inherits(Filter, _Component);

	    function Filter(graphics) {
	        _classCallCheck(this, Filter);

	        return _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).call(this, _consts2.default.componentNames.FILTER, graphics));
	    }

	    /**
	     * Add filter to source image (a specific filter is added on fabric.js)
	     * @param {string} type - Filter type
	     * @param {Object} [options] - Options of filter
	     * @returns {Promise}
	     */


	    _createClass(Filter, [{
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var sourceImg = _this2._getSourceImage();
	                var canvas = _this2.getCanvas();
	                var imgFilter = _this2._getFilter(sourceImg, type);
	                if (!imgFilter) {
	                    imgFilter = _this2._createFilter(sourceImg, type, options);
	                }

	                if (!imgFilter) {
	                    reject(rejectMessages.invalidParameters);
	                }

	                _this2._changeFilterValues(imgFilter, options);

	                _this2._apply(sourceImg, function () {
	                    canvas.renderAll();
	                    resolve({
	                        type: type,
	                        action: 'add'
	                    });
	                });
	            });
	        }

	        /**
	         * Remove filter to source image
	         * @param {string} type - Filter type
	         * @returns {Promise}
	         */

	    }, {
	        key: 'remove',
	        value: function remove(type) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var sourceImg = _this3._getSourceImage();
	                var canvas = _this3.getCanvas();

	                if (!sourceImg.filters.length) {
	                    reject(rejectMessages.unsupportedOperation);
	                }

	                _this3._removeFilter(sourceImg, type);

	                _this3._apply(sourceImg, function () {
	                    canvas.renderAll();
	                    resolve({
	                        type: type,
	                        action: 'remove'
	                    });
	                });
	            });
	        }

	        /**
	         * Whether this has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return !!this._getFilter(this._getSourceImage(), type);
	        }

	        /**
	         * Get a filter options
	         * @param {string} type - Filter type
	         * @returns {Object} filter options or null if there is no that filter
	         */

	    }, {
	        key: 'getOptions',
	        value: function getOptions(type) {
	            var sourceImg = this._getSourceImage();
	            var imgFilter = this._getFilter(sourceImg, type);
	            if (!imgFilter) {
	                return null;
	            }

	            return (0, _tuiCodeSnippet.extend)({}, imgFilter.options);
	        }

	        /**
	         * Change filter values
	         * @param {Object} imgFilter object of filter
	         * @param {Object} options object
	         * @private
	         */

	    }, {
	        key: '_changeFilterValues',
	        value: function _changeFilterValues(imgFilter, options) {
	            (0, _tuiCodeSnippet.forEach)(options, function (value, key) {
	                if (!(0, _tuiCodeSnippet.isUndefined)(imgFilter[key])) {
	                    imgFilter[key] = value;
	                }
	            });
	            (0, _tuiCodeSnippet.forEach)(imgFilter.options, function (value, key) {
	                if (!(0, _tuiCodeSnippet.isUndefined)(options[key])) {
	                    imgFilter.options[key] = options[key];
	                }
	            });
	        }

	        /**
	         * Apply filter
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {function} callback - Executed function after applying filter
	         * @private
	         */

	    }, {
	        key: '_apply',
	        value: function _apply(sourceImg, callback) {
	            sourceImg.applyFilters(callback);
	        }

	        /**
	         * Get source image on canvas
	         * @returns {fabric.Image} Current source image on canvas
	         * @private
	         */

	    }, {
	        key: '_getSourceImage',
	        value: function _getSourceImage() {
	            return this.getCanvasImage();
	        }

	        /**
	         * Create filter instance
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @param {Object} [options] - Options of filter
	         * @returns {Object} Fabric object of filter
	         * @private
	         */

	    }, {
	        key: '_createFilter',
	        value: function _createFilter(sourceImg, type, options) {
	            var filterObj = void 0;
	            // capitalize first letter for matching with fabric image filter name
	            var fabricType = this._getFabricFilterType(type);
	            var ImageFilter = _fabric2.default.Image.filters[fabricType];
	            if (ImageFilter) {
	                filterObj = new ImageFilter(options);
	                filterObj.options = options;
	                sourceImg.filters.push(filterObj);
	            }

	            return filterObj;
	        }

	        /**
	         * Get applied filter instance
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @returns {Object} Fabric object of filter
	         * @private
	         */

	    }, {
	        key: '_getFilter',
	        value: function _getFilter(sourceImg, type) {
	            var imgFilter = null;

	            if (sourceImg) {
	                var fabricType = this._getFabricFilterType(type);
	                var length = sourceImg.filters.length;

	                var item = void 0,
	                    i = void 0;

	                for (i = 0; i < length; i += 1) {
	                    item = sourceImg.filters[i];
	                    if (item.type === fabricType) {
	                        imgFilter = item;
	                        break;
	                    }
	                }
	            }

	            return imgFilter;
	        }

	        /**
	         * Remove applied filter instance
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @private
	         */

	    }, {
	        key: '_removeFilter',
	        value: function _removeFilter(sourceImg, type) {
	            var fabricType = this._getFabricFilterType(type);
	            sourceImg.filters = (0, _tuiCodeSnippet.filter)(sourceImg.filters, function (value) {
	                return value.type !== fabricType;
	            });
	        }

	        /**
	         * Change filter class name to fabric's, especially capitalizing first letter
	         * @param {string} type - Filter type
	         * @example
	         * 'grayscale' -> 'Grayscale'
	         * @returns {string} Fabric filter class name
	         */

	    }, {
	        key: '_getFabricFilterType',
	        value: function _getFabricFilterType(type) {
	            return type.charAt(0).toUpperCase() + type.slice(1);
	        }
	    }]);

	    return Filter;
	}(_component2.default);

	module.exports = Filter;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Mask object
	 * @class Mask
	 * @extends {fabric.Image.filters.Mask}
	 * @ignore
	 */
	var Mask = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Mask, /** @lends Mask.prototype */{
	    /**
	     * Apply filter to canvas element
	     * @param {Object} canvasEl - Canvas element to apply filter
	     * @override
	     */
	    applyTo: function applyTo(canvasEl) {
	        if (!this.mask) {
	            return;
	        }

	        var width = canvasEl.width,
	            height = canvasEl.height;

	        var maskCanvasEl = this._createCanvasOfMask(width, height);
	        var ctx = canvasEl.getContext('2d');
	        var maskCtx = maskCanvasEl.getContext('2d');
	        var imageData = ctx.getImageData(0, 0, width, height);

	        this._drawMask(maskCtx, canvasEl, ctx);
	        this._mapData(maskCtx, imageData, width, height);

	        ctx.putImageData(imageData, 0, 0);
	    },


	    /**
	     * Create canvas of mask image
	     * @param {number} width - Width of main canvas
	     * @param {number} height - Height of main canvas
	     * @returns {HTMLElement} Canvas element
	     * @private
	     */
	    _createCanvasOfMask: function _createCanvasOfMask(width, height) {
	        var maskCanvasEl = _fabric2.default.util.createCanvasElement();

	        maskCanvasEl.width = width;
	        maskCanvasEl.height = height;

	        return maskCanvasEl;
	    },


	    /**
	     * Draw mask image on canvas element
	     * @param {Object} maskCtx - Context of mask canvas
	     * @private
	     */
	    _drawMask: function _drawMask(maskCtx) {
	        var mask = this.mask;

	        var maskImg = mask.getElement();

	        var left = mask.getLeft();
	        var top = mask.getTop();
	        var angle = mask.getAngle();

	        maskCtx.save();
	        maskCtx.translate(left, top);
	        maskCtx.rotate(angle * Math.PI / 180);
	        maskCtx.scale(mask.scaleX, mask.scaleY);
	        maskCtx.drawImage(maskImg, -maskImg.width / 2, -maskImg.height / 2);
	        maskCtx.restore();
	    },


	    /**
	     * Map mask image data to source image data
	     * @param {Object} maskCtx - Context of mask canvas
	     * @param {Object} imageData - Data of source image
	     * @param {number} width - Width of main canvas
	     * @param {number} height - Height of main canvas
	     * @private
	     */
	    _mapData: function _mapData(maskCtx, imageData, width, height) {
	        var sourceData = imageData.data;
	        var maskData = maskCtx.getImageData(0, 0, width, height).data;
	        var channel = this.channel;

	        var len = imageData.width * imageData.height * 4;

	        for (var i = 0; i < len; i += 4) {
	            sourceData[i + 3] = maskData[i + channel]; // adjust value of alpha data
	        }
	    }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Mask extending fabric.Image.filters.Mask
	     */


	module.exports = Mask;

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Blur object
	 * @class Blur
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Blur = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Blur',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Blur extending fabric.Image.filters.Convolute
	     */


	module.exports = Blur;

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Sharpen object
	 * @class Sharpen
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Sharpen = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Sharpen',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [0, -1, 0, -1, 5, -1, 0, -1, 0];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Sharpen extending fabric.Image.filters.Convolute
	     */


	module.exports = Sharpen;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Emboss object
	 * @class Emboss
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Emboss = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Emboss',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Emboss extending fabric.Image.filters.Convolute
	     */


	module.exports = Emboss;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * ColorFilter object
	 * @class ColorFilter
	 * @extends {fabric.Image.filters.BaseFilter}
	 * @ignore
	 */
	var ColorFilter = _fabric2.default.util.createClass(_fabric2.default.Image.filters.BaseFilter, /** @lends BaseFilter.prototype */{
	    /**
	     * Filter type
	     * @param {String} type
	     * @default
	     */
	    type: 'ColorFilter',

	    /**
	     * Constructor
	     * @member fabric.Image.filters.ColorFilter.prototype
	     * @param {Object} [options] Options object
	     * @param {Number} [options.color='#FFFFFF'] Value of color (0...255)
	     * @param {Number} [options.threshold=45] Value of threshold (0...255)
	     * @override
	     */
	    initialize: function initialize(options) {
	        if (!options) {
	            options = {};
	        }
	        this.color = options.color || '#FFFFFF';
	        this.threshold = options.threshold || 45;
	        this.x = options.x || null;
	        this.y = options.y || null;
	    },


	    /**
	     * Applies filter to canvas element
	     * @param {Object} canvasEl Canvas element to apply filter to
	     */
	    applyTo: function applyTo(canvasEl) {
	        // eslint-disable-line
	        var context = canvasEl.getContext('2d');
	        var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
	        var data = imageData.data;
	        var threshold = this.threshold;

	        var filterColor = _fabric2.default.Color.sourceFromHex(this.color);
	        var i = void 0,
	            len = void 0;

	        if (this.x && this.y) {
	            filterColor = this._getColor(imageData, this.x, this.y);
	        }

	        for (i = 0, len = data.length; i < len; i += 4) {
	            if (this._isOutsideThreshold(data[i], filterColor[0], threshold) || this._isOutsideThreshold(data[i + 1], filterColor[1], threshold) || this._isOutsideThreshold(data[i + 2], filterColor[2], threshold)) {
	                continue;
	            }
	            data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
	        }
	        context.putImageData(imageData, 0, 0);
	    },


	    /**
	     * Check color if it is within threshold
	     * @param {Number} color1 source color
	     * @param {Number} color2 filtering color
	     * @param {Number} threshold threshold
	     * @returns {boolean} true if within threshold or false
	     */
	    _isOutsideThreshold: function _isOutsideThreshold(color1, color2, threshold) {
	        var diff = color1 - color2;

	        return Math.abs(diff) > threshold;
	    },


	    /**
	     * Get color at (x, y)
	     * @param {Object} imageData of canvas
	     * @param {Number} x left position
	     * @param {Number} y top position
	     * @returns {Array} color array
	     */
	    _getColor: function _getColor(imageData, x, y) {
	        var color = [0, 0, 0, 0];
	        var data = imageData.data,
	            width = imageData.width;

	        var bytes = 4;
	        var position = (width * y + x) * bytes;

	        color[0] = data[position];
	        color[1] = data[position + 1];
	        color[2] = data[position + 2];
	        color[3] = data[position + 3];

	        return color;
	    }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview ColorFilter extending fabric.Image.filters.BaseFilter
	     */


	module.exports = ColorFilter;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(106);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(108);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	var _shapeResizeHelper = __webpack_require__(124);

	var _shapeResizeHelper2 = _interopRequireDefault(_shapeResizeHelper);

	var _tuiCodeSnippet = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Shape component
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var rejectMessages = _consts2.default.rejectMessages,
	    eventNames = _consts2.default.eventNames;

	var KEY_CODES = _consts2.default.keyCodes;

	var DEFAULT_TYPE = 'rect';
	var DEFAULT_WIDTH = 20;
	var DEFAULT_HEIGHT = 20;

	var DEFAULT_OPTIONS = {
	    strokeWidth: 1,
	    stroke: '#000000',
	    fill: '#ffffff',
	    width: 1,
	    height: 1,
	    rx: 0,
	    ry: 0,
	    lockSkewingX: true,
	    lockSkewingY: true,
	    lockUniScaling: false,
	    bringForward: true,
	    isRegular: false
	};

	var shapeType = ['rect', 'circle', 'triangle'];

	/**
	 * Shape
	 * @class Shape
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Shape = function (_Component) {
	    _inherits(Shape, _Component);

	    function Shape(graphics) {
	        _classCallCheck(this, Shape);

	        /**
	         * Object of The drawing shape
	         * @type {fabric.Object}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this, _consts2.default.componentNames.SHAPE, graphics));

	        _this._shapeObj = null;

	        /**
	         * Type of the drawing shape
	         * @type {string}
	         * @private
	         */
	        _this._type = DEFAULT_TYPE;

	        /**
	         * Options to draw the shape
	         * @type {Object}
	         * @private
	         */
	        _this._options = (0, _tuiCodeSnippet.extend)({}, DEFAULT_OPTIONS);

	        /**
	         * Whether the shape object is selected or not
	         * @type {boolean}
	         * @private
	         */
	        _this._isSelected = false;

	        /**
	         * Pointer for drawing shape (x, y)
	         * @type {Object}
	         * @private
	         */
	        _this._startPoint = {};

	        /**
	         * Using shortcut on drawing shape
	         * @type {boolean}
	         * @private
	         */
	        _this._withShiftKey = false;

	        /**
	         * Event handler list
	         * @type {Object}
	         * @private
	         */
	        _this._handlers = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this),
	            keydown: _this._onKeyDown.bind(_this),
	            keyup: _this._onKeyUp.bind(_this)
	        };
	        return _this;
	    }

	    /**
	     * Start to draw the shape on canvas
	     * @ignore
	     */


	    _createClass(Shape, [{
	        key: 'start',
	        value: function start() {
	            var canvas = this.getCanvas();

	            this._isSelected = false;

	            canvas.defaultCursor = 'crosshair';
	            canvas.selection = false;
	            canvas.uniScaleTransform = true;
	            canvas.on({
	                'mouse:down': this._handlers.mousedown
	            });

	            _fabric2.default.util.addListener(document, 'keydown', this._handlers.keydown);
	            _fabric2.default.util.addListener(document, 'keyup', this._handlers.keyup);
	        }

	        /**
	         * End to draw the shape on canvas
	         * @ignore
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();

	            this._isSelected = false;

	            canvas.defaultCursor = 'default';

	            canvas.selection = true;
	            canvas.uniScaleTransform = false;
	            canvas.off({
	                'mouse:down': this._handlers.mousedown
	            });

	            _fabric2.default.util.removeListener(document, 'keydown', this._handlers.keydown);
	            _fabric2.default.util.removeListener(document, 'keyup', this._handlers.keyup);
	        }

	        /**
	         * Set states of the current drawing shape
	         * @ignore
	         * @param {string} type - Shape type (ex: 'rect', 'circle')
	         * @param {Object} [options] - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stoke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         */

	    }, {
	        key: 'setStates',
	        value: function setStates(type, options) {
	            this._type = type;

	            if (options) {
	                this._options = (0, _tuiCodeSnippet.extend)(this._options, options);
	            }
	        }

	        /**
	         * Add the shape
	         * @ignore
	         * @param {string} type - Shape type (ex: 'rect', 'circle')
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	         * @returns {Promise}
	         */

	    }, {
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve) {
	                var canvas = _this2.getCanvas();
	                options = _this2._extendOptions(options);
	                var shapeObj = _this2._createInstance(type, options);

	                _this2._bindEventOnShape(shapeObj);

	                canvas.add(shapeObj).setActiveObject(shapeObj);

	                var objectProperties = _this2.graphics.createObjectProperties(shapeObj);

	                resolve(objectProperties);
	            });
	        }

	        /**
	         * Change the shape
	         * @ignore
	         * @param {fabric.Object} shapeObj - Selected shape object on canvas
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	         * @returns {Promise}
	         */

	    }, {
	        key: 'change',
	        value: function change(shapeObj, options) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve, reject) {
	                if ((0, _tuiCodeSnippet.inArray)(shapeObj.get('type'), shapeType) < 0) {
	                    reject(rejectMessages.unsupportedType);
	                }

	                shapeObj.set(options);
	                _this3.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Create the instance of shape
	         * @param {string} type - Shape type
	         * @param {Object} options - Options to creat the shape
	         * @returns {fabric.Object} Shape instance
	         * @private
	         */

	    }, {
	        key: '_createInstance',
	        value: function _createInstance(type, options) {
	            var instance = void 0;

	            switch (type) {
	                case 'rect':
	                    instance = new _fabric2.default.Rect(options);
	                    break;
	                case 'circle':
	                    instance = new _fabric2.default.Ellipse((0, _tuiCodeSnippet.extend)({
	                        type: 'circle'
	                    }, options));
	                    break;
	                case 'triangle':
	                    instance = new _fabric2.default.Triangle(options);
	                    break;
	                default:
	                    instance = {};
	            }

	            return instance;
	        }

	        /**
	         * Get the options to create the shape
	         * @param {Object} options - Options to creat the shape
	         * @returns {Object} Shape options
	         * @private
	         */

	    }, {
	        key: '_extendOptions',
	        value: function _extendOptions(options) {
	            var selectionStyles = _consts2.default.fObjectOptions.SELECTION_STYLE;

	            options = (0, _tuiCodeSnippet.extend)({}, DEFAULT_OPTIONS, this._options, selectionStyles, options);

	            if (options.isRegular) {
	                options.lockUniScaling = true;
	            }

	            return options;
	        }

	        /**
	         * Bind fabric events on the creating shape object
	         * @param {fabric.Object} shapeObj - Shape object
	         * @private
	         */

	    }, {
	        key: '_bindEventOnShape',
	        value: function _bindEventOnShape(shapeObj) {
	            var self = this;
	            var canvas = this.getCanvas();

	            shapeObj.on({
	                added: function added() {
	                    self._shapeObj = this;
	                    _shapeResizeHelper2.default.setOrigins(self._shapeObj);
	                },
	                selected: function selected() {
	                    self._isSelected = true;
	                    self._shapeObj = this;
	                    canvas.uniScaleTransform = true;
	                    canvas.defaultCursor = 'default';
	                    _shapeResizeHelper2.default.setOrigins(self._shapeObj);
	                },
	                deselected: function deselected() {
	                    self._isSelected = false;
	                    self._shapeObj = null;
	                    canvas.defaultCursor = 'crosshair';
	                    canvas.uniScaleTransform = false;
	                },
	                modified: function modified() {
	                    var currentObj = self._shapeObj;

	                    _shapeResizeHelper2.default.adjustOriginToCenter(currentObj);
	                    _shapeResizeHelper2.default.setOrigins(currentObj);
	                },
	                scaling: function scaling(fEvent) {
	                    var pointer = canvas.getPointer(fEvent.e);
	                    var currentObj = self._shapeObj;

	                    canvas.setCursor('crosshair');
	                    _shapeResizeHelper2.default.resize(currentObj, pointer, true);
	                }
	            });
	        }

	        /**
	         * MouseDown event handler on canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            if (!fEvent.target) {
	                this._isSelected = false;
	                this._shapeObj = false;
	            }

	            if (!this._isSelected && !this._shapeObj) {
	                var canvas = this.getCanvas();
	                this._startPoint = canvas.getPointer(fEvent.e);

	                canvas.on({
	                    'mouse:move': this._handlers.mousemove,
	                    'mouse:up': this._handlers.mouseup
	                });
	            }
	        }

	        /**
	         * MouseDown event handler on canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
	            var _this4 = this;

	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);
	            var startPointX = this._startPoint.x;
	            var startPointY = this._startPoint.y;
	            var width = startPointX - pointer.x;
	            var height = startPointY - pointer.y;
	            var shape = this._shapeObj;

	            if (!shape) {
	                this.add(this._type, {
	                    left: startPointX,
	                    top: startPointY,
	                    width: width,
	                    height: height
	                }).then(function (objectProps) {
	                    _this4.fire(eventNames.ADD_OBJECT, objectProps);
	                });
	            } else {
	                this._shapeObj.set({
	                    isRegular: this._withShiftKey
	                });
	                _shapeResizeHelper2.default.resize(shape, pointer);
	                canvas.renderAll();
	            }
	        }

	        /**
	         * MouseUp event handler on canvas
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var _this5 = this;

	            var canvas = this.getCanvas();
	            var startPointX = this._startPoint.x;
	            var startPointY = this._startPoint.y;
	            var shape = this._shapeObj;

	            if (!shape) {
	                this.add(this._type, {
	                    left: startPointX,
	                    top: startPointY,
	                    width: DEFAULT_WIDTH,
	                    height: DEFAULT_HEIGHT
	                }).then(function (objectProps) {
	                    _this5.fire(eventNames.ADD_OBJECT, objectProps);
	                });
	            } else if (shape) {
	                _shapeResizeHelper2.default.adjustOriginToCenter(shape);
	                this.fire(eventNames.ADD_OBJECT_AFTER, this.graphics.createObjectProperties(shape));
	            }

	            canvas.off({
	                'mouse:move': this._handlers.mousemove,
	                'mouse:up': this._handlers.mouseup
	            });
	        }

	        /**
	         * Keydown event handler on document
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            if (e.keyCode === KEY_CODES.SHIFT) {
	                this._withShiftKey = true;

	                if (this._shapeObj) {
	                    this._shapeObj.isRegular = true;
	                }
	            }
	        }

	        /**
	         * Keyup event handler on document
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyUp',
	        value: function _onKeyUp(e) {
	            if (e.keyCode === KEY_CODES.SHIFT) {
	                this._withShiftKey = false;

	                if (this._shapeObj) {
	                    this._shapeObj.isRegular = false;
	                }
	            }
	        }
	    }]);

	    return Shape;
	}(_component2.default);

	module.exports = Shape;

/***/ }),
/* 124 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Shape resize helper
	 */
	var DIVISOR = {
	    rect: 1,
	    circle: 2,
	    triangle: 1
	};
	var DIMENSION_KEYS = {
	    rect: {
	        w: 'width',
	        h: 'height'
	    },
	    circle: {
	        w: 'rx',
	        h: 'ry'
	    },
	    triangle: {
	        w: 'width',
	        h: 'height'
	    }
	};

	/**
	 * Set the start point value to the shape object
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function setStartPoint(shape) {
	    var originX = shape.getOriginX();
	    var originY = shape.getOriginY();
	    var originKey = originX.substring(0, 1) + originY.substring(0, 1);

	    shape.startPoint = shape.origins[originKey];
	}

	/**
	 * Get the positions of ratated origin by the pointer value
	 * @param {{x: number, y: number}} origin - Origin value
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {number} angle - Rotating angle
	 * @returns {Object} Postions of origin
	 * @ignore
	 */
	function getPositionsOfRotatedOrigin(origin, pointer, angle) {
	    var sx = origin.x;
	    var sy = origin.y;
	    var px = pointer.x;
	    var py = pointer.y;
	    var r = angle * Math.PI / 180;
	    var rx = (px - sx) * Math.cos(r) - (py - sy) * Math.sin(r) + sx;
	    var ry = (px - sx) * Math.sin(r) + (py - sy) * Math.cos(r) + sy;

	    return {
	        originX: sx > rx ? 'right' : 'left',
	        originY: sy > ry ? 'bottom' : 'top'
	    };
	}

	/**
	 * Whether the shape has the center origin or not
	 * @param {fabric.Object} shape - Shape object
	 * @returns {boolean} State
	 * @ignore
	 */
	function hasCenterOrigin(shape) {
	    return shape.getOriginX() === 'center' && shape.getOriginY() === 'center';
	}

	/**
	 * Adjust the origin of shape by the start point
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustOriginByStartPoint(pointer, shape) {
	    var centerPoint = shape.getPointByOrigin('center', 'center');
	    var angle = -shape.getAngle();
	    var originPositions = getPositionsOfRotatedOrigin(centerPoint, pointer, angle);
	    var originX = originPositions.originX,
	        originY = originPositions.originY;

	    var origin = shape.getPointByOrigin(originX, originY);
	    var left = shape.getLeft() - (centerPoint.x - origin.x);
	    var top = shape.getTop() - (centerPoint.x - origin.y);

	    shape.set({
	        originX: originX,
	        originY: originY,
	        left: left,
	        top: top
	    });

	    shape.setCoords();
	}

	/**
	 * Adjust the origin of shape by the moving pointer value
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustOriginByMovingPointer(pointer, shape) {
	    var origin = shape.startPoint;
	    var angle = -shape.getAngle();
	    var originPositions = getPositionsOfRotatedOrigin(origin, pointer, angle);
	    var originX = originPositions.originX,
	        originY = originPositions.originY;


	    shape.setPositionByOrigin(origin, originX, originY);
	}

	/**
	 * Adjust the dimension of shape on firing scaling event
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustDimensionOnScaling(shape) {
	    var type = shape.type,
	        scaleX = shape.scaleX,
	        scaleY = shape.scaleY;

	    var dimensionKeys = DIMENSION_KEYS[type];
	    var width = shape[dimensionKeys.w] * scaleX;
	    var height = shape[dimensionKeys.h] * scaleY;

	    if (shape.isRegular) {
	        var maxScale = Math.max(scaleX, scaleY);

	        width = shape[dimensionKeys.w] * maxScale;
	        height = shape[dimensionKeys.h] * maxScale;
	    }

	    var options = {
	        hasControls: false,
	        hasBorders: false,
	        scaleX: 1,
	        scaleY: 1
	    };

	    options[dimensionKeys.w] = width;
	    options[dimensionKeys.h] = height;

	    shape.set(options);
	}

	/**
	 * Adjust the dimension of shape on firing mouse move event
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustDimensionOnMouseMove(pointer, shape) {
	    var type = shape.type,
	        strokeWidth = shape.strokeWidth,
	        origin = shape.startPoint;

	    var divisor = DIVISOR[type];
	    var dimensionKeys = DIMENSION_KEYS[type];
	    var isTriangle = !!(shape.type === 'triangle');
	    var options = {};
	    var width = Math.abs(origin.x - pointer.x) / divisor;
	    var height = Math.abs(origin.y - pointer.y) / divisor;

	    if (width > strokeWidth) {
	        width -= strokeWidth / divisor;
	    }

	    if (height > strokeWidth) {
	        height -= strokeWidth / divisor;
	    }

	    if (shape.isRegular) {
	        width = height = Math.max(width, height);

	        if (isTriangle) {
	            height = Math.sqrt(3) / 2 * width;
	        }
	    }

	    options[dimensionKeys.w] = width;
	    options[dimensionKeys.h] = height;

	    shape.set(options);
	}

	module.exports = {
	    /**
	     * Set each origin value to shape
	     * @param {fabric.Object} shape - Shape object
	     */
	    setOrigins: function setOrigins(shape) {
	        var leftTopPoint = shape.getPointByOrigin('left', 'top');
	        var rightTopPoint = shape.getPointByOrigin('right', 'top');
	        var rightBottomPoint = shape.getPointByOrigin('right', 'bottom');
	        var leftBottomPoint = shape.getPointByOrigin('left', 'bottom');

	        shape.origins = {
	            lt: leftTopPoint,
	            rt: rightTopPoint,
	            rb: rightBottomPoint,
	            lb: leftBottomPoint
	        };
	    },


	    /**
	     * Resize the shape
	     * @param {fabric.Object} shape - Shape object
	     * @param {{x: number, y: number}} pointer - Mouse pointer values on canvas
	     * @param {boolean} isScaling - Whether the resizing action is scaling or not
	     */
	    resize: function resize(shape, pointer, isScaling) {
	        if (hasCenterOrigin(shape)) {
	            adjustOriginByStartPoint(pointer, shape);
	            setStartPoint(shape);
	        }

	        if (isScaling) {
	            adjustDimensionOnScaling(shape, pointer);
	        } else {
	            adjustDimensionOnMouseMove(pointer, shape);
	        }

	        adjustOriginByMovingPointer(pointer, shape);
	    },


	    /**
	     * Adjust the origin position of shape to center
	     * @param {fabric.Object} shape - Shape object
	     */
	    adjustOriginToCenter: function adjustOriginToCenter(shape) {
	        var centerPoint = shape.getPointByOrigin('center', 'center');
	        var originX = shape.getOriginX();
	        var originY = shape.getOriginY();
	        var origin = shape.getPointByOrigin(originX, originY);
	        var left = shape.getLeft() + (centerPoint.x - origin.x);
	        var top = shape.getTop() + (centerPoint.y - origin.y);

	        shape.set({
	            hasControls: true,
	            hasBorders: true,
	            originX: 'center',
	            originY: 'center',
	            left: left,
	            top: top
	        });

	        shape.setCoords(); // For left, top properties
	    }
	};

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(126);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview CropperDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * CropperDrawingMode class
	 * @class
	 * @ignore
	 */

	var CropperDrawingMode = function (_DrawingMode) {
	    _inherits(CropperDrawingMode, _DrawingMode);

	    function CropperDrawingMode() {
	        _classCallCheck(this, CropperDrawingMode);

	        return _possibleConstructorReturn(this, (CropperDrawingMode.__proto__ || Object.getPrototypeOf(CropperDrawingMode)).call(this, drawingModes.CROPPER));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(CropperDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var cropper = graphics.getComponent(components.CROPPER);
	            cropper.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var cropper = graphics.getComponent(components.CROPPER);
	            cropper.end();
	        }
	    }]);

	    return CropperDrawingMode;
	}(_drawingMode2.default);

	module.exports = CropperDrawingMode;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview DrawingMode interface
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _errorMessage = __webpack_require__(71);

	var _errorMessage2 = _interopRequireDefault(_errorMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createMessage = _errorMessage2.default.create;
	var errorTypes = _errorMessage2.default.types;

	/**
	 * DrawingMode interface
	 * @class
	 * @param {string} name - drawing mode name
	 * @ignore
	 */

	var DrawingMode = function () {
	  function DrawingMode(name) {
	    _classCallCheck(this, DrawingMode);

	    /**
	     * the name of drawing mode
	     * @type {string}
	     */
	    this.name = name;
	  }

	  /**
	   * Get this drawing mode name;
	   * @returns {string} drawing mode name
	   */


	  _createClass(DrawingMode, [{
	    key: 'getName',
	    value: function getName() {
	      return this.name;
	    }

	    /**
	    * start this drawing mode
	    * @param {Object} options - drawing mode options
	    * @abstract
	    */

	  }, {
	    key: 'start',
	    value: function start() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'start'));
	    }

	    /**
	     * stop this drawing mode
	     * @abstract
	     */

	  }, {
	    key: 'stop',
	    value: function stop() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'stop'));
	    }
	  }]);

	  return DrawingMode;
	}();

	module.exports = DrawingMode;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(126);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview FreeDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * FreeDrawingMode class
	 * @class
	 * @ignore
	 */

	var FreeDrawingMode = function (_DrawingMode) {
	    _inherits(FreeDrawingMode, _DrawingMode);

	    function FreeDrawingMode() {
	        _classCallCheck(this, FreeDrawingMode);

	        return _possibleConstructorReturn(this, (FreeDrawingMode.__proto__ || Object.getPrototypeOf(FreeDrawingMode)).call(this, drawingModes.FREE_DRAWING));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
	    * @override
	    */


	    _createClass(FreeDrawingMode, [{
	        key: 'start',
	        value: function start(graphics, options) {
	            var freeDrawing = graphics.getComponent(components.FREE_DRAWING);
	            freeDrawing.start(options);
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var freeDrawing = graphics.getComponent(components.FREE_DRAWING);
	            freeDrawing.end();
	        }
	    }]);

	    return FreeDrawingMode;
	}(_drawingMode2.default);

	module.exports = FreeDrawingMode;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(126);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview LineDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * LineDrawingMode class
	 * @class
	 * @ignore
	 */

	var LineDrawingMode = function (_DrawingMode) {
	    _inherits(LineDrawingMode, _DrawingMode);

	    function LineDrawingMode() {
	        _classCallCheck(this, LineDrawingMode);

	        return _possibleConstructorReturn(this, (LineDrawingMode.__proto__ || Object.getPrototypeOf(LineDrawingMode)).call(this, drawingModes.LINE_DRAWING));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
	    * @override
	    */


	    _createClass(LineDrawingMode, [{
	        key: 'start',
	        value: function start(graphics, options) {
	            var lineDrawing = graphics.getComponent(components.LINE);
	            lineDrawing.start(options);
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var lineDrawing = graphics.getComponent(components.LINE);
	            lineDrawing.end();
	        }
	    }]);

	    return LineDrawingMode;
	}(_drawingMode2.default);

	module.exports = LineDrawingMode;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(126);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview ShapeDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * ShapeDrawingMode class
	 * @class
	 * @ignore
	 */

	var ShapeDrawingMode = function (_DrawingMode) {
	    _inherits(ShapeDrawingMode, _DrawingMode);

	    function ShapeDrawingMode() {
	        _classCallCheck(this, ShapeDrawingMode);

	        return _possibleConstructorReturn(this, (ShapeDrawingMode.__proto__ || Object.getPrototypeOf(ShapeDrawingMode)).call(this, drawingModes.SHAPE));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(ShapeDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var shape = graphics.getComponent(components.SHAPE);
	            shape.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var shape = graphics.getComponent(components.SHAPE);
	            shape.end();
	        }
	    }]);

	    return ShapeDrawingMode;
	}(_drawingMode2.default);

	module.exports = ShapeDrawingMode;

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(126);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview TextDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * TextDrawingMode class
	 * @class
	 * @ignore
	 */

	var TextDrawingMode = function (_DrawingMode) {
	    _inherits(TextDrawingMode, _DrawingMode);

	    function TextDrawingMode() {
	        _classCallCheck(this, TextDrawingMode);

	        return _possibleConstructorReturn(this, (TextDrawingMode.__proto__ || Object.getPrototypeOf(TextDrawingMode)).call(this, drawingModes.TEXT));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(TextDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var text = graphics.getComponent(components.TEXT);
	            text.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var text = graphics.getComponent(components.TEXT);
	            text.end();
	        }
	    }]);

	    return TextDrawingMode;
	}(_drawingMode2.default);

	module.exports = TextDrawingMode;

/***/ }),
/* 131 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }),
/* 132 */,
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add an icon
	                                                   */

	var ICON = componentNames.ICON;


	var command = {
	    name: commandNames.ADD_ICON,

	    /**
	     * Add an icon
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
	     * @param {Object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var _this = this;

	        var iconComp = graphics.getComponent(ICON);

	        return iconComp.add(type, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add an image object
	                                                   */

	var command = {
	    name: commandNames.ADD_IMAGE_OBJECT,

	    /**
	     * Add an image object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} imgUrl - Image url to make object
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, imgUrl) {
	        var _this = this;

	        return graphics.addImageObject(imgUrl).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Add an object
	                                                       */

	var command = {
	    name: commandNames.ADD_OBJECT,

	    /**
	     * Add an object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {Object} object - Fabric object
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, object) {
	        return new _promise2.default(function (resolve, reject) {
	            if (!graphics.contains(object)) {
	                graphics.add(object);
	                resolve(object);
	            } else {
	                reject(rejectMessages.addedObject);
	            }
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {Object} object - Fabric object
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, object) {
	        return new _promise2.default(function (resolve, reject) {
	            if (graphics.contains(object)) {
	                graphics.remove(object);
	                resolve(object);
	            } else {
	                reject(rejectMessages.noObject);
	            }
	        });
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add a shape
	                                                   */

	var SHAPE = componentNames.SHAPE;


	var command = {
	    name: commandNames.ADD_SHAPE,

	    /**
	     * Add a shape
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	     * @param {Object} options - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.left] - Shape x position
	     *      @param {number} [options.top] - Shape y position
	     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var _this = this;

	        var shapeComp = graphics.getComponent(SHAPE);

	        return shapeComp.add(type, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add a text object
	                                                   */

	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.ADD_TEXT,

	    /**
	     * Add a text object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} text - Initial input text
	     * @param {Object} [options] Options for text styles
	     *     @param {Object} [options.styles] Initial styles
	     *         @param {string} [options.styles.fill] Color
	     *         @param {string} [options.styles.fontFamily] Font type for text
	     *         @param {number} [options.styles.fontSize] Size
	     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	     *     @param {{x: number, y: number}} [options.position] - Initial position
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, text, options) {
	        var _this = this;

	        var textComp = graphics.getComponent(TEXT);

	        return textComp.add(text, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Apply a filter into an image
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var FILTER = componentNames.FILTER;


	var command = {
	    name: commandNames.APPLY_FILTER,

	    /**
	     * Apply a filter into an image
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Filter type
	     * @param {Object} options - Filter options
	     *  @param {number} options.maskObjId - masking image object id
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var filterComp = graphics.getComponent(FILTER);

	        if (type === 'mask') {
	            var maskObj = graphics.getObject(options.maskObjId);

	            if (!(maskObj && maskObj.isType('image'))) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            options = {
	                mask: maskObj
	            };
	        }

	        if (type === 'mask') {
	            this.undoData.object = options.mask;
	            graphics.remove(options.mask);
	        } else {
	            this.undoData.options = filterComp.getOptions(type);
	        }

	        return filterComp.add(type, options);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Filter type
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, type) {
	        var filterComp = graphics.getComponent(FILTER);

	        if (type === 'mask') {
	            var mask = this.undoData.object;
	            graphics.add(mask);
	            graphics.setActiveObject(mask);

	            return filterComp.remove(type);
	        }

	        // options changed case
	        if (this.undoData.options) {
	            return filterComp.add(type, this.undoData.options);
	        }

	        // filter added case
	        return filterComp.remove(type);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Change icon color
	                                                   */

	var ICON = componentNames.ICON;


	var command = {
	    name: commandNames.CHANGE_ICON_COLOR,

	    /**
	     * Change icon color
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {string} color - Color for icon
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, color) {
	        var _this = this;

	        return new _promise2.default(function (resolve, reject) {
	            var iconComp = graphics.getComponent(ICON);
	            var targetObj = graphics.getObject(id);

	            if (!targetObj) {
	                reject(rejectMessages.noObject);
	            }

	            _this.undoData.object = targetObj;
	            _this.undoData.color = iconComp.getColor(targetObj);
	            iconComp.setColor(color, targetObj);
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var iconComp = graphics.getComponent(ICON);
	        var _undoData$object = this.undoData.object,
	            icon = _undoData$object.object,
	            color = _undoData$object.color;


	        iconComp.setColor(color, icon);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview change a shape
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var SHAPE = componentNames.SHAPE;


	var command = {
	    name: commandNames.CHANGE_SHAPE,

	    /**
	     * Change a shape
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} options - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.left] - Shape x position
	     *      @param {number} [options.top] - Shape y position
	     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, options) {
	        var _this = this;

	        var shapeComp = graphics.getComponent(SHAPE);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.options = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(options, function (value, key) {
	            _this.undoData.options[key] = targetObj[key];
	        });

	        return shapeComp.change(targetObj, options);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var shapeComp = graphics.getComponent(SHAPE);
	        var _undoData = this.undoData,
	            shape = _undoData.object,
	            options = _undoData.options;


	        return shapeComp.change(shape, options);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Change a text
	                                                   */

	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.CHANGE_TEXT,

	    /**
	     * Change a text
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {string} text - Changing text
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, text) {
	        var textComp = graphics.getComponent(TEXT);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.text = textComp.getText(targetObj);

	        return textComp.change(targetObj, text);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var textComp = graphics.getComponent(TEXT);
	        var _undoData = this.undoData,
	            textObj = _undoData.object,
	            text = _undoData.text;


	        return textComp.change(textObj, text);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Change text styles
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.CHANGE_TEXT_STYLE,

	    /**
	     * Change text styles
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} styles - text styles
	     *     @param {string} [styles.fill] Color
	     *     @param {string} [styles.fontFamily] Font type for text
	     *     @param {number} [styles.fontSize] Size
	     *     @param {string} [styles.fontStyle] Type of inclination (normal / italic)
	     *     @param {string} [styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *     @param {string} [styles.textAlign] Type of text align (left / center / right)
	     *     @param {string} [styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, styles) {
	        var _this = this;

	        var textComp = graphics.getComponent(TEXT);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.styles = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(styles, function (value, key) {
	            _this.undoData.styles[key] = targetObj[key];
	        });

	        return textComp.setStyle(targetObj, styles);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var textComp = graphics.getComponent(TEXT);
	        var _undoData = this.undoData,
	            textObj = _undoData.object,
	            styles = _undoData.styles;


	        return textComp.setStyle(textObj, styles);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Clear all objects
	                                                   */

	var command = {
	    name: commandNames.CLEAR_OBJECTS,

	    /**
	     * Clear all objects without background (main) image
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    execute: function execute(graphics) {
	        var _this = this;

	        return new _promise2.default(function (resolve) {
	            _this.undoData.objects = graphics.removeAll();
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     * @ignore
	     */
	    undo: function undo(graphics) {
	        graphics.add(this.undoData.objects);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Flip an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var FLIP = componentNames.FLIP;


	var command = {
	  name: commandNames.FLIP_IMAGE,

	  /**
	   * flip an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - 'flipX' or 'flipY' or 'reset'
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type) {
	    var flipComp = graphics.getComponent(FLIP);

	    this.undoData.setting = flipComp.getCurrentSetting();

	    return flipComp[type]();
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @returns {Promise}
	   */
	  undo: function undo(graphics) {
	    var flipComp = graphics.getComponent(FLIP);

	    return flipComp.set(this.undoData.setting);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Load a background (main) image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var IMAGE_LOADER = componentNames.IMAGE_LOADER;


	var command = {
	    name: commandNames.LOAD_IMAGE,

	    /**
	     * Load a background (main) image
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} imageName - Image name
	     * @param {string} imgUrl - Image Url
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, imageName, imgUrl) {
	        var loader = graphics.getComponent(IMAGE_LOADER);
	        var prevImage = loader.getCanvasImage();
	        var prevImageWidth = prevImage ? prevImage.width : 0;
	        var prevImageHeight = prevImage ? prevImage.height : 0;
	        var objects = graphics.removeAll(true).filter(function (objectItem) {
	            return objectItem.type !== 'cropzone';
	        });

	        objects.forEach(function (objectItem) {
	            objectItem.evented = true;
	        });

	        this.undoData = {
	            name: loader.getImageName(),
	            image: prevImage,
	            objects: objects
	        };

	        return loader.load(imageName, imgUrl).then(function (newImage) {
	            return {
	                oldWidth: prevImageWidth,
	                oldHeight: prevImageHeight,
	                newWidth: newImage.width,
	                newHeight: newImage.height
	            };
	        });
	    },


	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var loader = graphics.getComponent(IMAGE_LOADER);
	        var _undoData = this.undoData,
	            objects = _undoData.objects,
	            name = _undoData.name,
	            image = _undoData.image;


	        graphics.removeAll(true);
	        graphics.add(objects);

	        return loader.load(name, image);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Remove a filter from an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var FILTER = componentNames.FILTER;


	var command = {
	  name: commandNames.REMOVE_FILTER,

	  /**
	   * Remove a filter from an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - Filter type
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type) {
	    var filterComp = graphics.getComponent(FILTER);

	    this.undoData.options = filterComp.getOptions(type);

	    return filterComp.remove(type);
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - Filter type
	   * @returns {Promise}
	   */
	  undo: function undo(graphics, type) {
	    var filterComp = graphics.getComponent(FILTER);
	    var options = this.undoData.options;


	    return filterComp.add(type, options);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Remove an object
	                                                       */

	var command = {
	    name: commandNames.REMOVE_OBJECT,

	    /**
	     * Remove an object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id) {
	        var _this = this;

	        return new _promise2.default(function (resolve, reject) {
	            _this.undoData.objects = graphics.removeObjectById(id);
	            if (_this.undoData.objects.length) {
	                resolve();
	            } else {
	                reject(rejectMessages.noObject);
	            }
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.add(this.undoData.objects);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Resize a canvas
	                                                   */

	var command = {
	    name: commandNames.RESIZE_CANVAS_DIMENSION,

	    /**
	     * resize the canvas with given dimension
	     * @param {Graphics} graphics - Graphics instance
	     * @param {{width: number, height: number}} dimension - Max width & height
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, dimension) {
	        var _this = this;

	        return new _promise2.default(function (resolve) {
	            _this.undoData.size = {
	                width: graphics.cssMaxWidth,
	                height: graphics.cssMaxHeight
	            };

	            graphics.setCssMaxDimension(dimension);
	            graphics.adjustCanvasDimension();
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.setCssMaxDimension(this.undoData.size);
	        graphics.adjustCanvasDimension();

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Rotate an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var ROTATION = componentNames.ROTATION;


	var command = {
	  name: commandNames.ROTATE_IMAGE,

	  /**
	   * Rotate an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - 'rotate' or 'setAngle'
	   * @param {number} angle - angle value (degree)
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type, angle) {
	    var rotationComp = graphics.getComponent(ROTATION);

	    this.undoData.angle = rotationComp.getCurrentAngle();

	    return rotationComp[type](angle);
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @returns {Promise}
	   */
	  undo: function undo(graphics) {
	    var rotationComp = graphics.getComponent(ROTATION);
	    var angle = this.undoData.angle;


	    return rotationComp.setAngle(angle);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(3);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Set object properties
	 */
	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages;


	var command = {
	    name: commandNames.SET_OBJECT_PROPERTIES,

	    /**
	     * Set object properties
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} props - properties
	     *     @param {string} [props.fill] Color
	     *     @param {string} [props.fontFamily] Font type for text
	     *     @param {number} [props.fontSize] Size
	     *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
	     *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *     @param {string} [props.textAlign] Type of text align (left / center / right)
	     *     @param {string} [props.textDecoraiton] Type of line (underline / line-throgh / overline)
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, props) {
	        var _this = this;

	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.props = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(props, function (value, key) {
	            _this.undoData.props[key] = targetObj[key];
	        });

	        graphics.setObjectProperties(id, props);

	        return _promise2.default.resolve();
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, id) {
	        var props = this.undoData.props;


	        graphics.setObjectProperties(id, props);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(73);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Set object properties
	                                                       */

	var command = {
	    name: commandNames.SET_OBJECT_POSITION,

	    /**
	     * Set object properties
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} posInfo - position object
	     *  @param {number} posInfo.x - x position
	     *  @param {number} posInfo.y - y position
	     *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	     *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, posInfo) {
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.objectId = id;
	        this.undoData.props = graphics.getObjectProperties(id, ['left', 'top']);

	        graphics.setObjectPosition(id, posInfo);
	        graphics.renderAll();

	        return _promise2.default.resolve();
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var _undoData = this.undoData,
	            objectId = _undoData.objectId,
	            props = _undoData.props;


	        graphics.setObjectProperties(objectId, props);
	        graphics.renderAll();

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ })
/******/ ])
});
;

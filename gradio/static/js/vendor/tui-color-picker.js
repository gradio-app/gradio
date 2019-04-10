/*!
 * Toast UI Colorpicker
 * @version 2.2.0
 * @author NHNEnt FE Development Team <dl_javascript@nhnent.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("tui-code-snippet"));
	else if(typeof define === 'function' && define.amd)
		define(["tui-code-snippet"], factory);
	else if(typeof exports === 'object')
		exports["colorPicker"] = factory(require("tui-code-snippet"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["colorPicker"] = factory((root["tui"] && root["tui"]["util"]));
})(this, function(__WEBPACK_EXTERNAL_MODULE_8__) {
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

	__webpack_require__(1);
	module.exports = __webpack_require__(6);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var domutil = __webpack_require__(7);
	var domevent = __webpack_require__(9);
	var Collection = __webpack_require__(10);
	var View = __webpack_require__(11);
	var Drag = __webpack_require__(12);
	var create = __webpack_require__(13);
	var Palette = __webpack_require__(16);
	var Slider = __webpack_require__(18);
	var colorutil = __webpack_require__(14);
	var svgvml = __webpack_require__(19);

	var colorPicker = {
	    domutil: domutil,
	    domevent: domevent,
	    Collection: Collection,
	    View: View,
	    Drag: Drag,

	    create: create,
	    Palette: Palette,
	    Slider: Slider,
	    colorutil: colorutil,
	    svgvml: svgvml
	};

	module.exports = colorPicker;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Utility modules for manipulate DOM elements.
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var snippet = __webpack_require__(8);
	var domevent = __webpack_require__(9);
	var Collection = __webpack_require__(10);

	var util = snippet,
	    posKey = '_pos',
	    supportSelectStart = 'onselectstart' in document,
	    prevSelectStyle = '',
	    domutil,
	    userSelectProperty;

	var CSS_AUTO_REGEX = /^auto$|^$|%/;

	function trim(str) {
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	domutil = {
	    /**
	     * Create DOM element and return it.
	     * @param {string} tagName Tag name to append.
	     * @param {HTMLElement} [container] HTML element will be parent to created element.
	     * if not supplied, will use **document.body**
	     * @param {string} [className] Design class names to appling created element.
	     * @returns {HTMLElement} HTML element created.
	     */
	    appendHTMLElement: function (tagName, container, className) {
	        var el;

	        className = className || '';

	        el = document.createElement(tagName);
	        el.className = className;

	        if (container) {
	            container.appendChild(el);
	        } else {
	            document.body.appendChild(el);
	        }

	        return el;
	    },

	    /**
	     * Remove element from parent node.
	     * @param {HTMLElement} el - element to remove.
	     */
	    remove: function (el) {
	        if (el && el.parentNode) {
	            el.parentNode.removeChild(el);
	        }
	    },

	    /**
	     * Get element by id
	     * @param {string} id element id attribute
	     * @returns {HTMLElement} element
	     */
	    get: function (id) {
	        return document.getElementById(id);
	    },

	    /**
	     * Check supplied element is matched selector.
	     * @param {HTMLElement} el - element to check
	     * @param {string} selector - selector string to check
	     * @returns {boolean} match?
	     */
	    _matcher: function (el, selector) {
	        var cssClassSelector = /^\./,
	            idSelector = /^#/;

	        if (cssClassSelector.test(selector)) {
	            return domutil.hasClass(el, selector.replace('.', ''));
	        } else if (idSelector.test(selector)) {
	            return el.id === selector.replace('#', '');
	        }

	        return el.nodeName.toLowerCase() === selector.toLowerCase();
	    },

	    /**
	     * Find DOM element by specific selectors.
	     * below three selector only supported.
	     *
	     * 1. css selector
	     * 2. id selector
	     * 3. nodeName selector
	     * @param {string} selector selector
	     * @param {(HTMLElement|string)} [root] You can assign root element to find. if not supplied, document.body will use.
	     * @param {boolean|function} [multiple=false] - set true then return all elements that meet condition, if set function then use it filter function.
	     * @returns {HTMLElement} HTML element finded.
	     */
	    find: function (selector, root, multiple) {
	        var result = [],
	            found = false,
	            isFirst = util.isUndefined(multiple) || multiple === false,
	            isFilter = util.isFunction(multiple);

	        if (util.isString(root)) {
	            root = domutil.get(root);
	        }

	        root = root || window.document.body;

	        function recurse(el, selector) {
	            var childNodes = el.childNodes,
	                i = 0,
	                len = childNodes.length,
	                cursor;

	            for (; i < len; i += 1) {
	                cursor = childNodes[i];

	                if (cursor.nodeName === '#text') {
	                    continue;
	                }

	                if (domutil._matcher(cursor, selector)) {
	                    if (isFilter && multiple(cursor) || !isFilter) {
	                        result.push(cursor);
	                    }

	                    if (isFirst) {
	                        found = true;
	                        break;
	                    }
	                } else if (cursor.childNodes.length > 0) {
	                    recurse(cursor, selector);
	                    if (found) {
	                        break;
	                    }
	                }
	            }
	        }

	        recurse(root, selector);

	        return isFirst ? result[0] || null : result;
	    },

	    /**
	     * Find parent element recursively.
	     * @param {HTMLElement} el - base element to start find.
	     * @param {string} selector - selector string for find
	     * @returns {HTMLElement} - element finded or undefined.
	     */
	    closest: function (el, selector) {
	        var parent = el.parentNode;

	        if (domutil._matcher(el, selector)) {
	            return el;
	        }

	        while (parent && parent !== window.document.body) {
	            if (domutil._matcher(parent, selector)) {
	                return parent;
	            }

	            parent = parent.parentNode;
	        }
	    },

	    /**
	     * Return texts inside element.
	     * @param {HTMLElement} el target element
	     * @returns {string} text inside node
	     */
	    text: function (el) {
	        var ret = '',
	            i = 0,
	            nodeType = el.nodeType;

	        if (nodeType) {
	            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
	                // nodes that available contain other nodes
	                if (typeof el.textContent === 'string') {
	                    return el.textContent;
	                }

	                for (el = el.firstChild; el; el = el.nextSibling) {
	                    ret += domutil.text(el);
	                }
	            } else if (nodeType === 3 || nodeType === 4) {
	                // TEXT, CDATA SECTION
	                return el.nodeValue;
	            }
	        } else {
	            for (; el[i]; i += 1) {
	                ret += domutil.text(el[i]);
	            }
	        }

	        return ret;
	    },

	    /**
	     * Set data attribute to target element
	     * @param {HTMLElement} el - element to set data attribute
	     * @param {string} key - key
	     * @param {string|number} data - data value
	     */
	    setData: function (el, key, data) {
	        if ('dataset' in el) {
	            el.dataset[key] = data;

	            return;
	        }

	        el.setAttribute('data-' + key, data);
	    },

	    /**
	     * Get data value from data-attribute
	     * @param {HTMLElement} el - target element
	     * @param {string} key - key
	     * @returns {string} value
	     */
	    getData: function (el, key) {
	        if ('dataset' in el) {
	            return el.dataset[key];
	        }

	        return el.getAttribute('data-' + key);
	    },

	    /**
	     * Check element has specific design class name.
	     * @param {HTMLElement} el target element
	     * @param {string} name css class
	     * @returns {boolean} return true when element has that css class name
	     */
	    hasClass: function (el, name) {
	        var className;

	        if (!util.isUndefined(el.classList)) {
	            return el.classList.contains(name);
	        }

	        className = domutil.getClass(el);

	        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	    },

	    /**
	     * Add design class to HTML element.
	     * @param {HTMLElement} el target element
	     * @param {string} name css class name
	     */
	    addClass: function (el, name) {
	        var className;

	        if (!util.isUndefined(el.classList)) {
	            util.forEachArray(name.split(' '), function (value) {
	                el.classList.add(value);
	            });
	        } else if (!domutil.hasClass(el, name)) {
	            className = domutil.getClass(el);
	            domutil.setClass(el, (className ? className + ' ' : '') + name);
	        }
	    },

	    /**
	     *
	     * Overwrite design class to HTML element.
	     * @param {HTMLElement} el target element
	     * @param {string} name css class name
	     */
	    setClass: function (el, name) {
	        if (util.isUndefined(el.className.baseVal)) {
	            el.className = name;
	        } else {
	            el.className.baseVal = name;
	        }
	    },

	    /**
	     * Element에 cssClass속성을 제거하는 메서드
	     * Remove specific design class from HTML element.
	     * @param {HTMLElement} el target element
	     * @param {string} name class name to remove
	     */
	    removeClass: function (el, name) {
	        var removed = '';

	        if (!util.isUndefined(el.classList)) {
	            el.classList.remove(name);
	        } else {
	            removed = (' ' + domutil.getClass(el) + ' ').replace(' ' + name + ' ', ' ');
	            domutil.setClass(el, trim(removed));
	        }
	    },

	    /**
	     * Get HTML element's design classes.
	     * @param {HTMLElement} el target element
	     * @returns {string} element css class name
	     */
	    getClass: function (el) {
	        if (!el || !el.className) {
	            return '';
	        }

	        return util.isUndefined(el.className.baseVal) ? el.className : el.className.baseVal;
	    },

	    /**
	     * Get specific CSS style value from HTML element.
	     * @param {HTMLElement} el target element
	     * @param {string} style css attribute name
	     * @returns {(string|null)} css style value
	     */
	    getStyle: function (el, style) {
	        var value = el.style[style] || el.currentStyle && el.currentStyle[style],
	            css;

	        if ((!value || value === 'auto') && document.defaultView) {
	            css = document.defaultView.getComputedStyle(el, null);
	            value = css ? css[style] : null;
	        }

	        return value === 'auto' ? null : value;
	    },

	    /**
	     * get element's computed style values.
	     *
	     * in lower IE8. use polyfill function that return object. it has only one function 'getPropertyValue'
	     * @param {HTMLElement} el - element want to get style.
	     * @returns {object} virtual CSSStyleDeclaration object.
	     */
	    getComputedStyle: function (el) {
	        var defaultView = document.defaultView;

	        if (!defaultView || !defaultView.getComputedStyle) {
	            return {
	                getPropertyValue: function (prop) {
	                    var re = /(\-([a-z]){1})/g;
	                    if (prop === 'float') {
	                        prop = 'styleFloat';
	                    }

	                    if (re.test(prop)) {
	                        prop = prop.replace(re, function () {
	                            return arguments[2].toUpperCase();
	                        });
	                    }

	                    return el.currentStyle[prop] ? el.currentStyle[prop] : null;
	                }
	            };
	        }

	        return document.defaultView.getComputedStyle(el);
	    },

	    /**
	     * Set position CSS style.
	     * @param {HTMLElement} el target element
	     * @param {number} [x=0] left pixel value.
	     * @param {number} [y=0] top pixel value.
	     */
	    setPosition: function (el, x, y) {
	        x = util.isUndefined(x) ? 0 : x;
	        y = util.isUndefined(y) ? 0 : y;

	        el[posKey] = [x, y];

	        el.style.left = x + 'px';
	        el.style.top = y + 'px';
	    },

	    /**
	     * Get position from HTML element.
	     * @param {HTMLElement} el target element
	     * @param {boolean} [clear=false] clear cache before calculating position.
	     * @returns {number[]} point
	     */
	    getPosition: function (el, clear) {
	        var left, top, bound;

	        if (clear) {
	            el[posKey] = null;
	        }

	        if (el[posKey]) {
	            return el[posKey];
	        }

	        left = 0;
	        top = 0;

	        if ((CSS_AUTO_REGEX.test(el.style.left) || CSS_AUTO_REGEX.test(el.style.top)) && 'getBoundingClientRect' in el) {
	            // 엘리먼트의 left또는 top이 'auto'일 때 수단
	            bound = el.getBoundingClientRect();

	            left = bound.left;
	            top = bound.top;
	        } else {
	            left = parseFloat(el.style.left || 0);
	            top = parseFloat(el.style.top || 0);
	        }

	        return [left, top];
	    },

	    /**
	     * Return element's size
	     * @param {HTMLElement} el target element
	     * @returns {number[]} width, height
	     */
	    getSize: function (el) {
	        var bound,
	            width = domutil.getStyle(el, 'width'),
	            height = domutil.getStyle(el, 'height');

	        if ((CSS_AUTO_REGEX.test(width) || CSS_AUTO_REGEX.test(height)) && 'getBoundingClientRect' in el) {
	            bound = el.getBoundingClientRect();
	            width = bound.width;
	            height = bound.height;
	        } else {
	            width = parseFloat(width || 0);
	            height = parseFloat(height || 0);
	        }

	        return [width, height];
	    },

	    /**
	     * Check specific CSS style is available.
	     * @param {array} props property name to testing
	     * @returns {(string|boolean)} return true when property is available
	     * @example
	     * var props = ['transform', '-webkit-transform'];
	     * domutil.testProp(props);    // 'transform'
	     */
	    testProp: function (props) {
	        var style = document.documentElement.style,
	            i = 0,
	            len = props.length;

	        for (; i < len; i += 1) {
	            if (props[i] in style) {
	                return props[i];
	            }
	        }

	        return false;
	    },

	    /**
	     * Get form data
	     * @param {HTMLFormElement} formElement - form element to extract data
	     * @returns {object} form data
	     */
	    getFormData: function (formElement) {
	        var groupedByName = new Collection(function () {
	            return this.length;
	        }),
	            noDisabledFilter = function (el) {
	            return !el.disabled;
	        },
	            output = {};

	        groupedByName.add.apply(groupedByName, domutil.find('input', formElement, noDisabledFilter).concat(domutil.find('select', formElement, noDisabledFilter)).concat(domutil.find('textarea', formElement, noDisabledFilter)));

	        groupedByName = groupedByName.groupBy(function (el) {
	            return el && el.getAttribute('name') || '_other';
	        });

	        util.forEach(groupedByName, function (elements, name) {
	            if (name === '_other') {
	                return;
	            }

	            elements.each(function (el) {
	                var nodeName = el.nodeName.toLowerCase(),
	                    type = el.type,
	                    result = [];

	                if (type === 'radio') {
	                    result = [elements.find(function (el) {
	                        return el.checked;
	                    }).toArray().pop()];
	                } else if (type === 'checkbox') {
	                    result = elements.find(function (el) {
	                        return el.checked;
	                    }).toArray();
	                } else if (nodeName === 'select') {
	                    elements.find(function (el) {
	                        return !!el.childNodes.length;
	                    }).each(function (el) {
	                        result = result.concat(domutil.find('option', el, function (opt) {
	                            return opt.selected;
	                        }));
	                    });
	                } else {
	                    result = elements.find(function (el) {
	                        return el.value !== '';
	                    }).toArray();
	                }

	                result = util.map(result, function (el) {
	                    return el.value;
	                });

	                if (!result.length) {
	                    result = '';
	                } else if (result.length === 1) {
	                    result = result[0];
	                }

	                output[name] = result;
	            });
	        });

	        return output;
	    }
	};

	userSelectProperty = domutil.testProp(['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

	/**
	 * Disable browser's text selection behaviors.
	 * @method
	 */
	domutil.disableTextSelection = function () {
	    if (supportSelectStart) {
	        return function () {
	            domevent.on(window, 'selectstart', domevent.preventDefault);
	        };
	    }

	    return function () {
	        var style = document.documentElement.style;
	        prevSelectStyle = style[userSelectProperty];
	        style[userSelectProperty] = 'none';
	    };
	}();

	/**
	 * Enable browser's text selection behaviors.
	 * @method
	 */
	domutil.enableTextSelection = function () {
	    if (supportSelectStart) {
	        return function () {
	            domevent.off(window, 'selectstart', domevent.preventDefault);
	        };
	    }

	    return function () {
	        document.documentElement.style[userSelectProperty] = prevSelectStyle;
	    };
	}();

	/**
	 * Disable browser's image drag behaviors.
	 */
	domutil.disableImageDrag = function () {
	    domevent.on(window, 'dragstart', domevent.preventDefault);
	};

	/**
	 * Enable browser's image drag behaviors.
	 */
	domutil.enableImageDrag = function () {
	    domevent.off(window, 'dragstart', domevent.preventDefault);
	};

	/**
	 * Replace matched property with template
	 * @param {string} template - String of template
	 * @param {Object} propObj - Properties
	 * @returns {string} Replaced template string
	 */
	domutil.applyTemplate = function (template, propObj) {
	    var newTemplate = template.replace(/\{\{(\w*)\}\}/g, function (value, prop) {
	        return propObj.hasOwnProperty(prop) ? propObj[prop] : '';
	    });

	    return newTemplate;
	};

	module.exports = domutil;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Utility module for handling DOM events.
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var snippet = __webpack_require__(8);

	var util = snippet,
	    browser = util.browser,
	    eventKey = '_evt',
	    DRAG = {
	    START: ['touchstart', 'mousedown'],
	    END: {
	        mousedown: 'mouseup',
	        touchstart: 'touchend',
	        pointerdown: 'touchend',
	        MSPointerDown: 'touchend'
	    },
	    MOVE: {
	        mousedown: 'mousemove',
	        touchstart: 'touchmove',
	        pointerdown: 'touchmove',
	        MSPointerDown: 'touchmove'
	    }
	};

	var domevent = {
	    /**
	     * Bind dom events.
	     * @param {HTMLElement} obj HTMLElement to bind events.
	     * @param {(string|object)} types Space splitted events names or eventName:handler object.
	     * @param {*} fn handler function or context for handler method.
	     * @param {*} [context] context object for handler method.
	     */
	    on: function (obj, types, fn, context) {
	        if (util.isString(types)) {
	            util.forEach(types.split(' '), function (type) {
	                domevent._on(obj, type, fn, context);
	            });

	            return;
	        }

	        util.forEachOwnProperties(types, function (handler, type) {
	            domevent._on(obj, type, handler, fn);
	        });
	    },

	    /**
	     * DOM event binding.
	     * @param {HTMLElement} obj HTMLElement to bind events.
	     * @param {String} type The name of events.
	     * @param {*} fn handler function
	     * @param {*} [context] context object for handler method.
	     * @private
	     */
	    _on: function (obj, type, fn, context) {
	        var id, handler, originHandler;

	        id = type + util.stamp(fn) + (context ? '_' + util.stamp(context) : '');

	        if (obj[eventKey] && obj[eventKey][id]) {
	            return;
	        }

	        handler = function (e) {
	            fn.call(context || obj, e || window.event);
	        };

	        originHandler = handler;

	        if ('addEventListener' in obj) {
	            if (type === 'mouseenter' || type === 'mouseleave') {
	                handler = function (e) {
	                    e = e || window.event;
	                    if (!domevent._checkMouse(obj, e)) {
	                        return;
	                    }
	                    originHandler(e);
	                };
	                obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);
	            } else {
	                if (type === 'mousewheel') {
	                    obj.addEventListener('DOMMouseScroll', handler, false);
	                }

	                obj.addEventListener(type, handler, false);
	            }
	        } else if ('attachEvent' in obj) {
	            obj.attachEvent('on' + type, handler);
	        }

	        obj[eventKey] = obj[eventKey] || {};
	        obj[eventKey][id] = handler;
	    },

	    /**
	     * Unbind DOM Event handler.
	     * @param {HTMLElement} obj HTMLElement to unbind.
	     * @param {(string|object)} types Space splitted events names or eventName:handler object.
	     * @param {*} fn handler function or context for handler method.
	     * @param {*} [context] context object for handler method.
	     */
	    off: function (obj, types, fn, context) {
	        if (util.isString(types)) {
	            util.forEach(types.split(' '), function (type) {
	                domevent._off(obj, type, fn, context);
	            });

	            return;
	        }

	        util.forEachOwnProperties(types, function (handler, type) {
	            domevent._off(obj, type, handler, fn);
	        });
	    },

	    /**
	     * Unbind DOM event handler.
	     * @param {HTMLElement} obj HTMLElement to unbind.
	     * @param {String} type The name of event to unbind.
	     * @param {function()} fn Event handler that supplied when binding.
	     * @param {*} context context object that supplied when binding.
	     * @private
	     */
	    _off: function (obj, type, fn, context) {
	        var id = type + util.stamp(fn) + (context ? '_' + util.stamp(context) : ''),
	            handler = obj[eventKey] && obj[eventKey][id];

	        if (!handler) {
	            return;
	        }

	        if ('removeEventListener' in obj) {
	            if (type === 'mouseenter' || type === 'mouseleave') {
	                obj.removeEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);
	            } else {
	                if (type === 'mousewheel') {
	                    obj.removeEventListener('DOMMouseScroll', handler, false);
	                }

	                obj.removeEventListener(type, handler, false);
	            }
	        } else if ('detachEvent' in obj) {
	            try {
	                obj.detachEvent('on' + type, handler);
	            } catch (e) {} //eslint-disable-line
	        }

	        delete obj[eventKey][id];

	        if (util.keys(obj[eventKey]).length) {
	            return;
	        }

	        // throw exception when deleting host object's property in below IE8
	        if (util.browser.msie && util.browser.version < 9) {
	            obj[eventKey] = null;

	            return;
	        }

	        delete obj[eventKey];
	    },

	    /**
	     * Bind DOM event. this event will unbind after invokes.
	     * @param {HTMLElement} obj HTMLElement to bind events.
	     * @param {(string|object)} types Space splitted events names or eventName:handler object.
	     * @param {*} fn handler function or context for handler method.
	     * @param {*} [context] context object for handler method.
	     */
	    once: function (obj, types, fn, context) {
	        var that = this;

	        if (util.isObject(types)) {
	            util.forEachOwnProperties(types, function (handler, type) {
	                domevent.once(obj, type, handler, fn);
	            });

	            return;
	        }

	        function onceHandler() {
	            fn.apply(context || obj, arguments);
	            that._off(obj, types, onceHandler, context);
	        }

	        domevent.on(obj, types, onceHandler, context);
	    },

	    /**
	     * Cancel event bubbling.
	     * @param {Event} e Event object.
	     */
	    stopPropagation: function (e) {
	        if (e.stopPropagation) {
	            e.stopPropagation();
	        } else {
	            e.cancelBubble = true;
	        }
	    },

	    /**
	     * Cancel browser default actions.
	     * @param {Event} e Event object.
	     */
	    preventDefault: function (e) {
	        if (e.preventDefault) {
	            e.preventDefault();
	        } else {
	            e.returnValue = false;
	        }
	    },

	    /**
	     * Syntatic sugar of stopPropagation and preventDefault
	     * @param {Event} e Event object.
	     */
	    stop: function (e) {
	        domevent.preventDefault(e);
	        domevent.stopPropagation(e);
	    },

	    /**
	     * Stop scroll events.
	     * @param {HTMLElement} el HTML element to prevent scroll.
	     */
	    disableScrollPropagation: function (el) {
	        domevent.on(el, 'mousewheel MozMousePixelScroll', domevent.stopPropagation);
	    },

	    /**
	     * Stop all events related with click.
	     * @param {HTMLElement} el HTML element to prevent all event related with click.
	     */
	    disableClickPropagation: function (el) {
	        domevent.on(el, DRAG.START.join(' ') + ' click dblclick', domevent.stopPropagation);
	    },

	    /**
	     * Get mouse position from mouse event.
	     *
	     * If supplied relatveElement parameter then return relative position based on element.
	     * @param {Event} mouseEvent Mouse event object
	     * @param {HTMLElement} relativeElement HTML element that calculate relative position.
	     * @returns {number[]} mouse position.
	     */
	    getMousePosition: function (mouseEvent, relativeElement) {
	        var rect;

	        if (!relativeElement) {
	            return [mouseEvent.clientX, mouseEvent.clientY];
	        }

	        rect = relativeElement.getBoundingClientRect();

	        return [mouseEvent.clientX - rect.left - relativeElement.clientLeft, mouseEvent.clientY - rect.top - relativeElement.clientTop];
	    },

	    /**
	     * Normalize mouse wheel event that different each browsers.
	     * @param {MouseEvent} e Mouse wheel event.
	     * @returns {Number} delta
	     */
	    getWheelDelta: function (e) {
	        var delta = 0;

	        if (e.wheelDelta) {
	            delta = e.wheelDelta / 120;
	        }

	        if (e.detail) {
	            delta = -e.detail / 3;
	        }

	        return delta;
	    },

	    /**
	     * prevent firing mouseleave event when mouse entered child elements.
	     * @param {HTMLElement} el HTML element
	     * @param {MouseEvent} e Mouse event
	     * @returns {Boolean} leave?
	     * @private
	     */
	    _checkMouse: function (el, e) {
	        var related = e.relatedTarget;

	        if (!related) {
	            return true;
	        }

	        try {
	            while (related && related !== el) {
	                related = related.parentNode;
	            }
	        } catch (err) {
	            return false;
	        }

	        return related !== el;
	    },

	    /**
	     * Trigger specific events to html element.
	     * @param {HTMLElement} obj HTMLElement
	     * @param {string} type Event type name
	     * @param {object} [eventData] Event data
	     */
	    trigger: function (obj, type, eventData) {
	        var rMouseEvent = /(mouse|click)/;
	        if (util.isUndefined(eventData) && rMouseEvent.exec(type)) {
	            eventData = domevent.mouseEvent(type);
	        }

	        if (obj.dispatchEvent) {
	            obj.dispatchEvent(eventData);
	        } else if (obj.fireEvent) {
	            obj.fireEvent('on' + type, eventData);
	        }
	    },

	    /**
	     * Create virtual mouse event.
	     *
	     * Tested at
	     *
	     * - IE7 ~ IE11
	     * - Chrome
	     * - Firefox
	     * - Safari
	     * @param {string} type Event type
	     * @param {object} [eventObj] Event data
	     * @returns {MouseEvent} Virtual mouse event.
	     */
	    mouseEvent: function (type, eventObj) {
	        var evt, e;

	        e = util.extend({
	            bubbles: true,
	            cancelable: type !== 'mousemove',
	            view: window,
	            wheelDelta: 0,
	            detail: 0,
	            screenX: 0,
	            screenY: 0,
	            clientX: 0,
	            clientY: 0,
	            ctrlKey: false,
	            altKey: false,
	            shiftKey: false,
	            metaKey: false,
	            button: 0,
	            relatedTarget: undefined // eslint-disable-line
	        }, eventObj);

	        // prevent throw error when inserting wheelDelta property to mouse event on below IE8
	        if (browser.msie && browser.version < 9) {
	            delete e.wheelDelta;
	        }

	        if (typeof document.createEvent === 'function') {
	            evt = document.createEvent('MouseEvents');
	            evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, document.body.parentNode);
	        } else if (document.createEventObject) {
	            evt = document.createEventObject();

	            util.forEach(e, function (value, propName) {
	                evt[propName] = value;
	            }, this);
	            evt.button = {
	                0: 1,
	                1: 4,
	                2: 2
	            }[evt.button] || evt.button;
	        }

	        return evt;
	    },

	    /**
	     * Normalize mouse event's button attributes.
	     *
	     * Can detect which button is clicked by this method.
	     *
	     * Meaning of return numbers
	     *
	     * - 0: primary mouse button
	     * - 1: wheel button or center button
	     * - 2: secondary mouse button
	     * @param {MouseEvent} mouseEvent - The mouse event object want to know.
	     * @returns {number} - The value of meaning which button is clicked?
	     */
	    getMouseButton: function (mouseEvent) {
	        var button,
	            primary = '0,1,3,5,7',
	            secondary = '2,6',
	            wheel = '4';

	        /* istanbul ignore else */
	        if (document.implementation.hasFeature('MouseEvents', '2.0')) {
	            return mouseEvent.button;
	        }

	        button = mouseEvent.button + '';
	        if (~primary.indexOf(button)) {
	            return 0;
	        } else if (~secondary.indexOf(button)) {
	            return 2;
	        } else if (~wheel.indexOf(button)) {
	            return 1;
	        }
	    }
	};

	module.exports = domevent;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Common collections.
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var snippet = __webpack_require__(8);

	var util = snippet,
	    forEachProp = util.forEachOwnProperties,
	    forEachArr = util.forEachArray,
	    isFunc = util.isFunction,
	    isObj = util.isObject;

	var aps = Array.prototype.slice;

	/**
	 * Common collection.
	 *
	 * It need function for get model's unique id.
	 *
	 * if the function is not supplied then it use default function {@link Collection#getItemID}
	 * @constructor
	 * @param {function} [getItemIDFn] function for get model's id.
	 * @ignore
	 */
	function Collection(getItemIDFn) {
	    /**
	     * @type {object.<string, *>}
	     */
	    this.items = {};

	    /**
	     * @type {number}
	     */
	    this.length = 0;

	    if (isFunc(getItemIDFn)) {
	        /**
	         * @type {function}
	         */
	        this.getItemID = getItemIDFn;
	    }
	}

	/**********
	 * static props
	 **********/

	/**
	 * Combind supplied function filters and condition.
	 * @param {...function} filters - function filters
	 * @returns {function} combined filter
	 */
	Collection.and = function (filters) {
	    var cnt;

	    filters = aps.call(arguments);
	    cnt = filters.length;

	    return function (item) {
	        var i = 0;

	        for (; i < cnt; i += 1) {
	            if (!filters[i].call(null, item)) {
	                return false;
	            }
	        }

	        return true;
	    };
	};

	/**
	 * Combine multiple function filters with OR clause.
	 * @param {...function} filters - function filters
	 * @returns {function} combined filter
	 */
	Collection.or = function (filters) {
	    var cnt;

	    filters = aps.call(arguments);
	    cnt = filters.length;

	    return function (item) {
	        var i = 1,
	            result = filters[0].call(null, item);

	        for (; i < cnt; i += 1) {
	            result = result || filters[i].call(null, item);
	        }

	        return result;
	    };
	};

	/**
	 * Merge several collections.
	 *
	 * You can\'t merge collections different _getEventID functions. Take case of use.
	 * @param {...Collection} collections collection arguments to merge
	 * @returns {Collection} merged collection.
	 */
	Collection.merge = function (collections) {
	    // eslint-disable-line
	    var cols = aps.call(arguments),
	        newItems = {},
	        merged = new Collection(cols[0].getItemID),
	        extend = util.extend;

	    forEachArr(cols, function (col) {
	        extend(newItems, col.items);
	    });

	    merged.items = newItems;
	    merged.length = util.keys(merged.items).length;

	    return merged;
	};

	/**********
	 * prototype props
	 **********/

	/**
	 * get model's unique id.
	 * @param {object} item model instance.
	 * @returns {number} model unique id.
	 */
	Collection.prototype.getItemID = function (item) {
	    return item._id + '';
	};

	/**
	 * add models.
	 * @param {...*} item models to add this collection.
	 */
	Collection.prototype.add = function (item) {
	    var id, ownItems;

	    if (arguments.length > 1) {
	        forEachArr(aps.call(arguments), function (o) {
	            this.add(o);
	        }, this);

	        return;
	    }

	    id = this.getItemID(item);
	    ownItems = this.items;

	    if (!ownItems[id]) {
	        this.length += 1;
	    }
	    ownItems[id] = item;
	};

	/**
	 * remove models.
	 * @param {...(object|string|number)} id model instance or unique id to delete.
	 * @returns {array} deleted model list.
	 */
	Collection.prototype.remove = function (id) {
	    var removed = [],
	        ownItems,
	        itemToRemove;

	    if (!this.length) {
	        return removed;
	    }

	    if (arguments.length > 1) {
	        removed = util.map(aps.call(arguments), function (id) {
	            return this.remove(id);
	        }, this);

	        return removed;
	    }

	    ownItems = this.items;

	    if (isObj(id)) {
	        id = this.getItemID(id);
	    }

	    if (!ownItems[id]) {
	        return removed;
	    }

	    this.length -= 1;
	    itemToRemove = ownItems[id];
	    delete ownItems[id];

	    return itemToRemove;
	};

	/**
	 * remove all models in collection.
	 */
	Collection.prototype.clear = function () {
	    this.items = {};
	    this.length = 0;
	};

	/**
	 * check collection has specific model.
	 * @param {(object|string|number|function)} id model instance or id or filter function to check
	 * @returns {boolean} is has model?
	 */
	Collection.prototype.has = function (id) {
	    var isFilter, has;

	    if (!this.length) {
	        return false;
	    }

	    isFilter = isFunc(id);
	    has = false;

	    if (isFilter) {
	        this.each(function (item) {
	            if (id(item) === true) {
	                has = true;

	                return false;
	            }

	            return true;
	        });
	    } else {
	        id = isObj(id) ? this.getItemID(id) : id;
	        has = util.isExisty(this.items[id]);
	    }

	    return has;
	};

	/**
	 * invoke callback when model exist in collection.
	 * @param {(string|number)} id model unique id.
	 * @param {function} fn the callback.
	 * @param {*} [context] callback context.
	 */
	Collection.prototype.doWhenHas = function (id, fn, context) {
	    var item = this.items[id];

	    if (!util.isExisty(item)) {
	        return;
	    }

	    fn.call(context || this, item);
	};

	/**
	 * Search model. and return new collection.
	 * @param {function} filter filter function.
	 * @returns {Collection} new collection with filtered models.
	 * @example
	 * collection.find(function(item) {
	 *     return item.edited === true;
	 * });
	 *
	 * function filter1(item) {
	 *     return item.edited === false;
	 * }
	 *
	 * function filter2(item) {
	 *     return item.disabled === false;
	 * }
	 *
	 * collection.find(Collection.and(filter1, filter2));
	 *
	 * collection.find(Collection.or(filter1, filter2));
	 */
	Collection.prototype.find = function (filter) {
	    var result = new Collection();

	    if (this.hasOwnProperty('getItemID')) {
	        result.getItemID = this.getItemID;
	    }

	    this.each(function (item) {
	        if (filter(item) === true) {
	            result.add(item);
	        }
	    });

	    return result;
	};

	/**
	 * Group element by specific key values.
	 *
	 * if key parameter is function then invoke it and use returned value.
	 * @param {(string|number|function|array)} key key property or getter function. if string[] supplied, create each collection before grouping.
	 * @param {function} [groupFunc] - function that return each group's key
	 * @returns {object.<string, Collection>} grouped object
	 * @example
	 *
	 * // pass `string`, `number`, `boolean` type value then group by property value.
	 * collection.groupBy('gender');    // group by 'gender' property value.
	 * collection.groupBy(50);          // group by '50' property value.
	 *
	 * // pass `function` then group by return value. each invocation `function` is called with `(item)`.
	 * collection.groupBy(function(item) {
	 *     if (item.score > 60) {
	 *         return 'pass';
	 *     }
	 *     return 'fail';
	 * });
	 *
	 * // pass `array` with first arguments then create each collection before grouping.
	 * collection.groupBy(['go', 'ruby', 'javascript']);
	 * // result: { 'go': empty Collection, 'ruby': empty Collection, 'javascript': empty Collection }
	 *
	 * // can pass `function` with `array` then group each elements.
	 * collection.groupBy(['go', 'ruby', 'javascript'], function(item) {
	 *     if (item.isFast) {
	 *         return 'go';
	 *     }
	 *
	 *     return item.name;
	 * });
	 */
	Collection.prototype.groupBy = function (key, groupFunc) {
	    var result = {},
	        collection,
	        baseValue,
	        keyIsFunc = isFunc(key),
	        getItemIDFn = this.getItemID;

	    if (util.isArray(key)) {
	        util.forEachArray(key, function (k) {
	            result[k + ''] = new Collection(getItemIDFn);
	        });

	        if (!groupFunc) {
	            return result;
	        }

	        key = groupFunc;
	        keyIsFunc = true;
	    }

	    this.each(function (item) {
	        if (keyIsFunc) {
	            baseValue = key(item);
	        } else {
	            baseValue = item[key];

	            if (isFunc(baseValue)) {
	                baseValue = baseValue.apply(item);
	            }
	        }

	        collection = result[baseValue];

	        if (!collection) {
	            collection = result[baseValue] = new Collection(getItemIDFn);
	        }

	        collection.add(item);
	    });

	    return result;
	};

	/**
	 * Return single item in collection.
	 *
	 * Returned item is inserted in this collection firstly.
	 * @returns {object} item.
	 */
	Collection.prototype.single = function () {
	    var result;

	    this.each(function (item) {
	        result = item;

	        return false;
	    }, this);

	    return result;
	};

	/**
	 * sort a basis of supplied compare function.
	 * @param {function} compareFunction compareFunction
	 * @returns {array} sorted array.
	 */
	Collection.prototype.sort = function (compareFunction) {
	    var arr = [];

	    this.each(function (item) {
	        arr.push(item);
	    });

	    if (isFunc(compareFunction)) {
	        arr = arr.sort(compareFunction);
	    }

	    return arr;
	};

	/**
	 * iterate each model element.
	 *
	 * when iteratee return false then break the loop.
	 * @param {function} iteratee iteratee(item, index, items)
	 * @param {*} [context] context
	 */
	Collection.prototype.each = function (iteratee, context) {
	    forEachProp(this.items, iteratee, context || this);
	};

	/**
	 * return new array with collection items.
	 * @returns {array} new array.
	 */
	Collection.prototype.toArray = function () {
	    if (!this.length) {
	        return [];
	    }

	    return util.map(this.items, function (item) {
	        return item;
	    });
	};

	module.exports = Collection;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview The base class of views.
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var domutil = __webpack_require__(7);
	var Collection = __webpack_require__(10);

	/**
	 * Base class of views.
	 *
	 * All views create own container element inside supplied container element.
	 * @constructor
	 * @param {options} options The object for describe view's specs.
	 * @param {HTMLElement} container Default container element for view. you can use this element for this.container syntax.
	 * @ignore
	 */
	function View(options, container) {
	    var id = util.stamp(this);

	    options = options || {};

	    if (util.isUndefined(container)) {
	        container = domutil.appendHTMLElement('div');
	    }

	    domutil.addClass(container, 'tui-view-' + id);

	    /**
	     * unique id
	     * @type {number}
	     */
	    this.id = id;

	    /**
	     * base element of view.
	     * @type {HTMLDIVElement}
	     */
	    this.container = container;

	    /**
	     * child views.
	     * @type {Collection}
	     */
	    this.childs = new Collection(function (view) {
	        return util.stamp(view);
	    });

	    /**
	     * parent view instance.
	     * @type {View}
	     */
	    this.parent = null;
	}

	/**
	 * Add child views.
	 * @param {View} view The view instance to add.
	 * @param {function} [fn] Function for invoke before add. parent view class is supplied first arguments.
	 */
	View.prototype.addChild = function (view, fn) {
	    if (fn) {
	        fn.call(view, this);
	    }
	    // add parent view
	    view.parent = this;

	    this.childs.add(view);
	};

	/**
	 * Remove added child view.
	 * @param {(number|View)} id View id or instance itself to remove.
	 * @param {function} [fn] Function for invoke before remove. parent view class is supplied first arguments.
	 */
	View.prototype.removeChild = function (id, fn) {
	    var view = util.isNumber(id) ? this.childs.items[id] : id;

	    id = util.stamp(view);

	    if (fn) {
	        fn.call(view, this);
	    }

	    this.childs.remove(id);
	};

	/**
	 * Render view recursively.
	 */
	View.prototype.render = function () {
	    this.childs.each(function (childView) {
	        childView.render();
	    });
	};

	/**
	 * Invoke function recursively.
	 * @param {function} fn - function to invoke child view recursively
	 * @param {boolean} [skipThis=false] - set true then skip invoke with this(root) view.
	 */
	View.prototype.recursive = function (fn, skipThis) {
	    if (!util.isFunction(fn)) {
	        return;
	    }

	    if (!skipThis) {
	        fn(this);
	    }

	    this.childs.each(function (childView) {
	        childView.recursive(fn);
	    });
	};

	/**
	 * Resize view recursively to parent.
	 */
	View.prototype.resize = function () {
	    var args = Array.prototype.slice.call(arguments),
	        parent = this.parent;

	    while (parent) {
	        if (util.isFunction(parent._onResize)) {
	            parent._onResize.apply(parent, args);
	        }

	        parent = parent.parent;
	    }
	};

	/**
	 * Invoking method before destroying.
	 */
	View.prototype._beforeDestroy = function () {};

	/**
	 * Clear properties
	 */
	View.prototype._destroy = function () {
	    this._beforeDestroy();
	    this.childs.clear();
	    this.container.innerHTML = '';

	    this.id = this.parent = this.childs = this.container = null;
	};

	/**
	 * Destroy child view recursively.
	 * @param {boolean} isChildView - Whether it is the child view or not
	 */
	View.prototype.destroy = function (isChildView) {
	    this.childs.each(function (childView) {
	        childView.destroy(true);
	        childView._destroy();
	    });

	    if (isChildView) {
	        return;
	    }

	    this._destroy();
	};

	/**
	 * Calculate view's container element bound.
	 * @returns {object} The bound of container element.
	 */
	View.prototype.getViewBound = function () {
	    var container = this.container,
	        position = domutil.getPosition(container),
	        size = domutil.getSize(container);

	    return {
	        x: position[0],
	        y: position[1],
	        width: size[0],
	        height: size[1]
	    };
	};

	module.exports = View;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * @fileoverview General drag handler
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var domutil = __webpack_require__(7);
	var domevent = __webpack_require__(9);

	/**
	 * @constructor
	 * @mixes CustomEvents
	 * @param {object} options - options for drag handler
	 * @param {number} [options.distance=10] - distance in pixels after mouse must move before dragging should start
	 * @param {HTMLElement} container - container element to bind drag events
	 * @ignore
	 */
	function Drag(options, container) {
	    domevent.on(container, 'mousedown', this._onMouseDown, this);

	    this.options = util.extend({
	        distance: 10
	    }, options);

	    /**
	     * @type {HTMLElement}
	     */
	    this.container = container;

	    /**
	     * @type {boolean}
	     */
	    this._isMoved = false;

	    /**
	     * dragging distance in pixel between mousedown and firing dragStart events
	     * @type {number}
	     */
	    this._distance = 0;

	    /**
	     * @type {boolean}
	     */
	    this._dragStartFired = false;

	    /**
	     * @type {object}
	     */
	    this._dragStartEventData = null;
	}

	/**
	 * Destroy method.
	 */
	Drag.prototype.destroy = function () {
	    domevent.off(this.container, 'mousedown', this._onMouseDown, this);

	    this.options = this.container = this._isMoved = this._distance = this._dragStartFired = this._dragStartEventData = null;
	};

	/**
	 * Toggle events for mouse dragging.
	 * @param {boolean} toBind - bind events related with dragging when supplied "true"
	 */
	Drag.prototype._toggleDragEvent = function (toBind) {
	    var container = this.container,
	        domMethod,
	        method;

	    if (toBind) {
	        domMethod = 'on';
	        method = 'disable';
	    } else {
	        domMethod = 'off';
	        method = 'enable';
	    }

	    domutil[method + 'TextSelection'](container);
	    domutil[method + 'ImageDrag'](container);
	    domevent[domMethod](global.document, {
	        mousemove: this._onMouseMove,
	        mouseup: this._onMouseUp
	    }, this);
	};

	/**
	 * Normalize mouse event object.
	 * @param {MouseEvent} mouseEvent - mouse event object.
	 * @returns {object} normalized mouse event data.
	 */
	Drag.prototype._getEventData = function (mouseEvent) {
	    return {
	        target: mouseEvent.target || mouseEvent.srcElement,
	        originEvent: mouseEvent
	    };
	};

	/**
	 * MouseDown DOM event handler.
	 * @param {MouseEvent} mouseDownEvent MouseDown event object.
	 */
	Drag.prototype._onMouseDown = function (mouseDownEvent) {
	    // only primary button can start drag.
	    if (domevent.getMouseButton(mouseDownEvent) !== 0) {
	        return;
	    }

	    this._distance = 0;
	    this._dragStartFired = false;
	    this._dragStartEventData = this._getEventData(mouseDownEvent);

	    this._toggleDragEvent(true);
	};

	/**
	 * MouseMove DOM event handler.
	 * @emits Drag#drag
	 * @emits Drag#dragStart
	 * @param {MouseEvent} mouseMoveEvent MouseMove event object.
	 */
	Drag.prototype._onMouseMove = function (mouseMoveEvent) {
	    var distance = this.options.distance;
	    // prevent automatic scrolling.
	    domevent.preventDefault(mouseMoveEvent);

	    this._isMoved = true;

	    if (this._distance < distance) {
	        this._distance += 1;

	        return;
	    }

	    if (!this._dragStartFired) {
	        this._dragStartFired = true;

	        /**
	         * Drag starts events. cancelable.
	         * @event Drag#dragStart
	         * @type {object}
	         * @property {HTMLElement} target - target element in this event.
	         * @property {MouseEvent} originEvent - original mouse event object.
	         */
	        if (!this.invoke('dragStart', this._dragStartEventData)) {
	            this._toggleDragEvent(false);

	            return;
	        }
	    }

	    /**
	     * Events while dragging.
	     * @event Drag#drag
	     * @type {object}
	     * @property {HTMLElement} target - target element in this event.
	     * @property {MouseEvent} originEvent - original mouse event object.
	     */
	    this.fire('drag', this._getEventData(mouseMoveEvent));
	};

	/**
	 * MouseUp DOM event handler.
	 * @param {MouseEvent} mouseUpEvent MouseUp event object.
	 * @emits Drag#dragEnd
	 * @emits Drag#click
	 */
	Drag.prototype._onMouseUp = function (mouseUpEvent) {
	    this._toggleDragEvent(false);

	    // emit "click" event when not emitted drag event between mousedown and mouseup.
	    if (this._isMoved) {
	        this._isMoved = false;

	        /**
	         * Drag end events.
	         * @event Drag#dragEnd
	         * @type {MouseEvent}
	         * @property {HTMLElement} target - target element in this event.
	         * @property {MouseEvent} originEvent - original mouse event object.
	         */
	        this.fire('dragEnd', this._getEventData(mouseUpEvent));

	        return;
	    }

	    /**
	     * Click events.
	     * @event Drag#click
	     * @type {MouseEvent}
	     * @property {HTMLElement} target - target element in this event.
	     * @property {MouseEvent} originEvent - original mouse event object.
	     */
	    this.fire('click', this._getEventData(mouseUpEvent));
	};

	util.CustomEvents.mixin(Drag);

	module.exports = Drag;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview ColorPicker factory module
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var colorutil = __webpack_require__(14);
	var Layout = __webpack_require__(15);
	var Palette = __webpack_require__(16);
	var Slider = __webpack_require__(18);

	var hostnameSent = false;

	/**
	 * send hostname
	 * @ignore
	 */
	function sendHostname() {
	    var hostname = location.hostname;

	    if (hostnameSent) {
	        return;
	    }
	    hostnameSent = true;

	    util.imagePing('https://www.google-analytics.com/collect', {
	        v: 1,
	        t: 'event',
	        tid: 'UA-115377265-9',
	        cid: hostname,
	        dp: hostname,
	        dh: 'color-picker'
	    });
	}

	/**
	 * @constructor
	 * @mixes CustomEvents
	 * @param {object} options - options for colorpicker component
	 *  @param {HTMLDivElement} options.container - container element
	 *  @param {string} [options.color='#ffffff'] - default selected color
	 *  @param {string[]} [options.preset] - color preset for palette (use base16 palette if not supplied)
	 *  @param {string} [options.cssPrefix='tui-colorpicker-'] - css prefix text for each child elements
	 *  @param {string} [options.detailTxt='Detail'] - text for detail button.
	 *  @param {boolean} [options.usageStatistics=true] - Let us know the hostname. If you don't want to send the hostname, please set to false.
	 * @example
	 * var colorPicker = tui.colorPicker; // or require('tui-color-picker')
	 *
	 * colorPicker.create({
	 *   container: document.getElementById('color-picker')
	 * });
	 */
	function ColorPicker(options) {
	    var layout;

	    if (!(this instanceof ColorPicker)) {
	        return new ColorPicker(options);
	    }
	    /**
	     * Option object
	     * @type {object}
	     * @private
	     */
	    options = this.options = util.extend({
	        container: null,
	        color: '#f8f8f8',
	        preset: ['#181818', '#282828', '#383838', '#585858', '#b8b8b8', '#d8d8d8', '#e8e8e8', '#f8f8f8', '#ab4642', '#dc9656', '#f7ca88', '#a1b56c', '#86c1b9', '#7cafc2', '#ba8baf', '#a16946'],
	        cssPrefix: 'tui-colorpicker-',
	        detailTxt: 'Detail',
	        usageStatistics: true
	    }, options);

	    if (!options.container) {
	        throw new Error('ColorPicker(): need container option.');
	    }

	    /**********
	     * Create layout view
	     **********/

	    /**
	     * @type {Layout}
	     * @private
	     */
	    layout = this.layout = new Layout(options, options.container);

	    /**********
	     * Create palette view
	     **********/
	    this.palette = new Palette(options, layout.container);
	    this.palette.on({
	        '_selectColor': this._onSelectColorInPalette,
	        '_toggleSlider': this._onToggleSlider
	    }, this);

	    /**********
	     * Create slider view
	     **********/
	    this.slider = new Slider(options, layout.container);
	    this.slider.on('_selectColor', this._onSelectColorInSlider, this);

	    /**********
	     * Add child views
	     **********/
	    layout.addChild(this.palette);
	    layout.addChild(this.slider);

	    this.render(options.color);

	    if (options.usageStatistics) {
	        sendHostname();
	    }
	}

	/**
	 * Handler method for Palette#_selectColor event
	 * @private
	 * @fires ColorPicker#selectColor
	 * @param {object} selectColorEventData - event data
	 */
	ColorPicker.prototype._onSelectColorInPalette = function (selectColorEventData) {
	    var color = selectColorEventData.color,
	        opt = this.options;

	    if (!colorutil.isValidRGB(color) && color !== '') {
	        this.render();

	        return;
	    }

	    /**
	     * @event ColorPicker#selectColor
	     * @type {object}
	     * @property {string} color - selected color (hex string)
	     * @property {string} origin - flags for represent the source of event fires.
	     */
	    this.fire('selectColor', {
	        color: color,
	        origin: 'palette'
	    });

	    if (opt.color === color) {
	        return;
	    }

	    opt.color = color;
	    this.render(color);
	};

	/**
	 * Handler method for Palette#_toggleSlider event
	 * @private
	 */
	ColorPicker.prototype._onToggleSlider = function () {
	    this.slider.toggle(!this.slider.isVisible());
	};

	/**
	 * Handler method for Slider#_selectColor event
	 * @private
	 * @fires ColorPicker#selectColor
	 * @param {object} selectColorEventData - event data
	 */
	ColorPicker.prototype._onSelectColorInSlider = function (selectColorEventData) {
	    var color = selectColorEventData.color,
	        opt = this.options;

	    /**
	     * @event ColorPicker#selectColor
	     * @type {object}
	     * @property {string} color - selected color (hex string)
	     * @property {string} origin - flags for represent the source of event fires.
	     * @ignore
	     */
	    this.fire('selectColor', {
	        color: color,
	        origin: 'slider'
	    });

	    if (opt.color === color) {
	        return;
	    }

	    opt.color = color;
	    this.palette.render(color);
	};

	/**********
	 * PUBLIC API
	 **********/

	/**
	 * Set color to colorpicker instance.<br>
	 * The string parameter must be hex color value
	 * @param {string} hexStr - hex formatted color string
	 * @example
	 * colorPicker.setColor('#ffff00');
	 */
	ColorPicker.prototype.setColor = function (hexStr) {
	    if (!colorutil.isValidRGB(hexStr)) {
	        throw new Error('ColorPicker#setColor(): need valid hex string color value');
	    }

	    this.options.color = hexStr;
	    this.render(hexStr);
	};

	/**
	 * Get hex color string of current selected color in colorpicker instance.
	 * @returns {string} hex string formatted color
	 * @example
	 * colorPicker.setColor('#ffff00');
	 * colorPicker.getColor(); // '#ffff00';
	 */
	ColorPicker.prototype.getColor = function () {
	    return this.options.color;
	};

	/**
	 * Toggle colorpicker element. set true then reveal colorpicker view.
	 * @param {boolean} [isShow=false] - A flag to show
	 * @example
	 * colorPicker.toggle(false); // hide
	 * colorPicker.toggle(); // hide
	 * colorPicker.toggle(true); // show
	 */
	ColorPicker.prototype.toggle = function (isShow) {
	    this.layout.container.style.display = !!isShow ? 'block' : 'none';
	};

	/**
	 * Render colorpicker
	 * @param {string} [color] - selected color
	 * @ignore
	 */
	ColorPicker.prototype.render = function (color) {
	    this.layout.render(color || this.options.color);
	};

	/**
	 * Destroy colorpicker instance.
	 * @example
	 * colorPicker.destroy(); // DOM-element is removed
	 */
	ColorPicker.prototype.destroy = function () {
	    this.layout.destroy();
	    this.options.container.innerHTML = '';

	    this.layout = this.slider = this.palette = this.options = null;
	};

	util.CustomEvents.mixin(ColorPicker);

	module.exports = ColorPicker;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/**
	 * @fileoverview Utility methods to manipulate colors
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var hexRX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

	var colorutil = {
	    /**
	     * pad left zero characters.
	     * @param {number} number number value to pad zero.
	     * @param {number} length pad length to want.
	     * @returns {string} padded string.
	     */
	    leadingZero: function (number, length) {
	        var zero = '',
	            i = 0;

	        if ((number + '').length > length) {
	            return number + '';
	        }

	        for (; i < length - 1; i += 1) {
	            zero += '0';
	        }

	        return (zero + number).slice(length * -1);
	    },

	    /**
	     * Check validate of hex string value is RGB
	     * @param {string} str - rgb hex string
	     * @returns {boolean} return true when supplied str is valid RGB hex string
	     */
	    isValidRGB: function (str) {
	        return hexRX.test(str);
	    },

	    // @license RGB <-> HSV conversion utilities based off of http://www.cs.rit.edu/~ncs/color/t_convert.html

	    /**
	     * Convert color hex string to rgb number array
	     * @param {string} hexStr - hex string
	     * @returns {number[]} rgb numbers
	     */
	    hexToRGB: function (hexStr) {
	        var r, g, b;

	        if (!colorutil.isValidRGB(hexStr)) {
	            return false;
	        }

	        hexStr = hexStr.substring(1);

	        r = parseInt(hexStr.substr(0, 2), 16);
	        g = parseInt(hexStr.substr(2, 2), 16);
	        b = parseInt(hexStr.substr(4, 2), 16);

	        return [r, g, b];
	    },

	    /**
	     * Convert rgb number to hex string
	     * @param {number} r - red
	     * @param {number} g - green
	     * @param {number} b - blue
	     * @returns {string|boolean} return false when supplied rgb number is not valid. otherwise, converted hex string
	     */
	    rgbToHEX: function (r, g, b) {
	        var hexStr = '#' + colorutil.leadingZero(r.toString(16), 2) + colorutil.leadingZero(g.toString(16), 2) + colorutil.leadingZero(b.toString(16), 2);

	        if (colorutil.isValidRGB(hexStr)) {
	            return hexStr;
	        }

	        return false;
	    },

	    /**
	     * Convert rgb number to HSV value
	     * @param {number} r - red
	     * @param {number} g - green
	     * @param {number} b - blue
	     * @returns {number[]} hsv value
	     */
	    rgbToHSV: function (r, g, b) {
	        var max, min, h, s, v, d;

	        r /= 255;
	        g /= 255;
	        b /= 255;
	        max = Math.max(r, g, b);
	        min = Math.min(r, g, b);
	        v = max;
	        d = max - min;
	        s = max === 0 ? 0 : d / max;

	        if (max === min) {
	            h = 0;
	        } else {
	            switch (max) {
	                case r:
	                    h = (g - b) / d + (g < b ? 6 : 0);break;
	                case g:
	                    h = (b - r) / d + 2;break;
	                case b:
	                    h = (r - g) / d + 4;break;
	                // no default
	            }
	            h /= 6;
	        }

	        return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
	    },

	    /**
	     * Convert HSV number to RGB
	     * @param {number} h - hue
	     * @param {number} s - saturation
	     * @param {number} v - value
	     * @returns {number[]} rgb value
	     */
	    hsvToRGB: function (h, s, v) {
	        var r, g, b;
	        var i;
	        var f, p, q, t;

	        h = Math.max(0, Math.min(360, h));
	        s = Math.max(0, Math.min(100, s));
	        v = Math.max(0, Math.min(100, v));

	        s /= 100;
	        v /= 100;

	        if (s === 0) {
	            // Achromatic (grey)
	            r = g = b = v;

	            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	        }

	        h /= 60; // sector 0 to 5
	        i = Math.floor(h);
	        f = h - i; // factorial part of h
	        p = v * (1 - s);
	        q = v * (1 - s * f);
	        t = v * (1 - s * (1 - f));

	        switch (i) {
	            case 0:
	                r = v;g = t;b = p;break;
	            case 1:
	                r = q;g = v;b = p;break;
	            case 2:
	                r = p;g = v;b = t;break;
	            case 3:
	                r = p;g = q;b = v;break;
	            case 4:
	                r = t;g = p;b = v;break;
	            default:
	                r = v;g = p;b = q;break;
	        }

	        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	    }
	};

	module.exports = colorutil;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview ColorPicker layout module
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var domutil = __webpack_require__(7);
	var View = __webpack_require__(11);

	/**
	 * @constructor
	 * @extends {View}
	 * @param {object} options - option object
	 *  @param {string} options.cssPrefix - css prefix for each child elements
	 * @param {HTMLDivElement} container - container
	 * @ignore
	 */
	function Layout(options, container) {
	    /**
	     * option object
	     * @type {object}
	     */
	    this.options = util.extend({
	        cssPrefix: 'tui-colorpicker-'
	    }, options);

	    container = domutil.appendHTMLElement('div', container, this.options.cssPrefix + 'container');

	    View.call(this, options, container);

	    this.render();
	}

	util.inherit(Layout, View);

	/**
	 * @override
	 * @param {string} [color] - selected color
	 */
	Layout.prototype.render = function (color) {
	    this.recursive(function (view) {
	        view.render(color);
	    }, true);
	};

	module.exports = Layout;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Color palette view
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var domutil = __webpack_require__(7);
	var colorutil = __webpack_require__(14);
	var domevent = __webpack_require__(9);
	var View = __webpack_require__(11);
	var tmpl = __webpack_require__(17);

	/**
	 * @constructor
	 * @extends {View}
	 * @mixes CustomEvents
	 * @param {object} options - options for color palette view
	 *  @param {string[]} options.preset - color list
	 * @param {HTMLDivElement} container - container element
	 * @ignore
	 */
	function Palette(options, container) {
	    /**
	     * option object
	     * @type {object}
	     */
	    this.options = util.extend({
	        cssPrefix: 'tui-colorpicker-',
	        preset: ['#181818', '#282828', '#383838', '#585858', '#B8B8B8', '#D8D8D8', '#E8E8E8', '#F8F8F8', '#AB4642', '#DC9656', '#F7CA88', '#A1B56C', '#86C1B9', '#7CAFC2', '#BA8BAF', '#A16946'],
	        detailTxt: 'Detail'
	    }, options);

	    container = domutil.appendHTMLElement('div', container, this.options.cssPrefix + 'palette-container');

	    View.call(this, options, container);
	}

	util.inherit(Palette, View);

	/**
	 * Mouse click event handler
	 * @fires Palette#_selectColor
	 * @fires Palette#_toggleSlider
	 * @param {MouseEvent} clickEvent - mouse event object
	 */
	Palette.prototype._onClick = function (clickEvent) {
	    var options = this.options,
	        target = clickEvent.srcElement || clickEvent.target,
	        eventData = {};

	    if (domutil.hasClass(target, options.cssPrefix + 'palette-button')) {
	        eventData.color = target.value;

	        /**
	         * @event Palette#_selectColor
	         * @type {object}
	         * @property {string} color - selected color value
	         */
	        this.fire('_selectColor', eventData);

	        return;
	    }

	    if (domutil.hasClass(target, options.cssPrefix + 'palette-toggle-slider')) {
	        /**
	         * @event Palette#_toggleSlider
	         */
	        this.fire('_toggleSlider');
	    }
	};

	/**
	 * Textbox change event handler
	 * @fires Palette#_selectColor
	 * @param {Event} changeEvent - change event object
	 */
	Palette.prototype._onChange = function (changeEvent) {
	    var options = this.options,
	        target = changeEvent.srcElement || changeEvent.target,
	        eventData = {};

	    if (domutil.hasClass(target, options.cssPrefix + 'palette-hex')) {
	        eventData.color = target.value;

	        /**
	         * @event Palette#_selectColor
	         * @type {object}
	         * @property {string} color - selected color value
	         */
	        this.fire('_selectColor', eventData);
	    }
	};

	/**
	 * Invoke before destory
	 * @override
	 */
	Palette.prototype._beforeDestroy = function () {
	    this._toggleEvent(false);
	};

	/**
	 * Toggle view DOM events
	 * @param {boolean} [onOff=false] - true to bind event.
	 */
	Palette.prototype._toggleEvent = function (onOff) {
	    var options = this.options,
	        container = this.container,
	        method = domevent[!!onOff ? 'on' : 'off'],
	        hexTextBox;

	    method(container, 'click', this._onClick, this);

	    hexTextBox = domutil.find('.' + options.cssPrefix + 'palette-hex', container);

	    if (hexTextBox) {
	        method(hexTextBox, 'change', this._onChange, this);
	    }
	};

	/**
	 * Render palette
	 * @override
	 */
	Palette.prototype.render = function (color) {
	    var options = this.options,
	        html = '';

	    this._toggleEvent(false);

	    html = tmpl.layout.replace('{{colorList}}', util.map(options.preset, function (itemColor) {
	        var itemHtml = '';
	        var style = '';

	        if (colorutil.isValidRGB(itemColor)) {
	            style = domutil.applyTemplate(tmpl.itemStyle, { color: itemColor });
	        }

	        itemHtml = domutil.applyTemplate(tmpl.item, {
	            itemStyle: style,
	            itemClass: !itemColor ? ' ' + options.cssPrefix + 'color-transparent' : '',
	            color: itemColor,
	            cssPrefix: options.cssPrefix,
	            selected: itemColor === color ? ' ' + options.cssPrefix + 'selected' : ''
	        });

	        return itemHtml;
	    }).join(''));

	    html = domutil.applyTemplate(html, {
	        cssPrefix: options.cssPrefix,
	        detailTxt: options.detailTxt,
	        color: color
	    });

	    this.container.innerHTML = html;

	    this._toggleEvent(true);
	};

	util.CustomEvents.mixin(Palette);

	module.exports = Palette;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	/**
	 * @fileoverview Palette view template
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var layout = ['<ul class="{{cssPrefix}}clearfix">{{colorList}}</ul>', '<div class="{{cssPrefix}}clearfix" style="overflow:hidden">', '<input type="button" class="{{cssPrefix}}palette-toggle-slider" value="{{detailTxt}}" />', '<input type="text" class="{{cssPrefix}}palette-hex" value="{{color}}" maxlength="7" />', '<span class="{{cssPrefix}}palette-preview" style="background-color:{{color}};color:{{color}}">{{color}}</span>', '</div>'].join('\n');

	var item = '<li><input class="{{cssPrefix}}palette-button{{selected}}{{itemClass}}" type="button" style="{{itemStyle}}" title="{{color}}" value="{{color}}" /></li>';
	var itemStyle = 'background-color:{{color}};color:{{color}}';

	module.exports = {
	    layout: layout,
	    item: item,
	    itemStyle: itemStyle
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Slider view
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var domutil = __webpack_require__(7);
	var domevent = __webpack_require__(9);
	var svgvml = __webpack_require__(19);
	var colorutil = __webpack_require__(14);
	var View = __webpack_require__(11);
	var Drag = __webpack_require__(12);
	var tmpl = __webpack_require__(20);

	// Limitation position of point element inside of colorslider and hue bar
	// Minimum value can to be negative because that using color point of handle element is center point. not left, top point.
	var COLORSLIDER_POS_LIMIT_RANGE = [-7, 112];
	var HUEBAR_POS_LIMIT_RANGE = [-3, 115];
	var HUE_WHEEL_MAX = 359.99;

	/**
	 * @constructor
	 * @extends {View}
	 * @mixes CustomEvents
	 * @param {object} options - options for view
	 *  @param {string} options.cssPrefix - design css prefix
	 * @param {HTMLElement} container - container element
	 * @ignore
	 */
	function Slider(options, container) {
	    container = domutil.appendHTMLElement('div', container, options.cssPrefix + 'slider-container');
	    container.style.display = 'none';

	    View.call(this, options, container);

	    /**
	     * @type {object}
	     */
	    this.options = util.extend({
	        color: '#f8f8f8',
	        cssPrefix: 'tui-colorpicker-'
	    }, options);

	    /**
	     * Cache immutable data in click, drag events.
	     *
	     * (i.e. is event related with colorslider? or huebar?)
	     * @type {object}
	     * @property {boolean} isColorSlider
	     * @property {number[]} containerSize
	     */
	    this._dragDataCache = {};

	    /**
	     * Color slider handle element
	     * @type {SVG|VML}
	     */
	    this.sliderHandleElement = null;

	    /**
	     * hue bar handle element
	     * @type {SVG|VML}
	     */
	    this.huebarHandleElement = null;

	    /**
	     * Element that render base color in colorslider part
	     * @type {SVG|VML}
	     */
	    this.baseColorElement = null;

	    /**
	     * @type {Drag}
	     */
	    this.drag = new Drag({
	        distance: 0
	    }, container);

	    // bind drag events
	    this.drag.on({
	        'dragStart': this._onDragStart,
	        'drag': this._onDrag,
	        'dragEnd': this._onDragEnd,
	        'click': this._onClick
	    }, this);
	}

	util.inherit(Slider, View);

	/**
	 * @override
	 */
	Slider.prototype._beforeDestroy = function () {
	    this.drag.off();

	    this.drag = this.options = this._dragDataCache = this.sliderHandleElement = this.huebarHandleElement = this.baseColorElement = null;
	};

	/**
	 * Toggle slider view
	 * @param {boolean} onOff - set true then reveal slider view
	 */
	Slider.prototype.toggle = function (onOff) {
	    this.container.style.display = !!onOff ? 'block' : 'none';
	};

	/**
	 * Get slider display status
	 * @returns {boolean} return true when slider is visible
	 */
	Slider.prototype.isVisible = function () {
	    return this.container.style.display === 'block';
	};

	/**
	 * Render slider view
	 * @override
	 * @param {string} colorStr - hex string color from parent view (Layout)
	 */
	Slider.prototype.render = function (colorStr) {
	    var that = this,
	        container = that.container,
	        options = that.options,
	        html = tmpl.layout,
	        rgb,
	        hsv;

	    if (!colorutil.isValidRGB(colorStr)) {
	        return;
	    }

	    html = html.replace(/{{slider}}/, tmpl.slider);
	    html = html.replace(/{{huebar}}/, tmpl.huebar);
	    html = html.replace(/{{cssPrefix}}/g, options.cssPrefix);

	    that.container.innerHTML = html;

	    that.sliderHandleElement = domutil.find('.' + options.cssPrefix + 'slider-handle', container);
	    that.huebarHandleElement = domutil.find('.' + options.cssPrefix + 'huebar-handle', container);
	    that.baseColorElement = domutil.find('.' + options.cssPrefix + 'slider-basecolor', container);

	    rgb = colorutil.hexToRGB(colorStr);
	    hsv = colorutil.rgbToHSV.apply(null, rgb);

	    this.moveHue(hsv[0], true);
	    this.moveSaturationAndValue(hsv[1], hsv[2], true);
	};

	/**
	 * Move colorslider by newLeft(X), newTop(Y) value
	 * @private
	 * @param {number} newLeft - left pixel value to move handle
	 * @param {number} newTop - top pixel value to move handle
	 * @param {boolean} [silent=false] - set true then not fire custom event
	 */
	Slider.prototype._moveColorSliderHandle = function (newLeft, newTop, silent) {
	    var handle = this.sliderHandleElement,
	        handleColor;

	    // Check position limitation.
	    newTop = Math.max(COLORSLIDER_POS_LIMIT_RANGE[0], newTop);
	    newTop = Math.min(COLORSLIDER_POS_LIMIT_RANGE[1], newTop);
	    newLeft = Math.max(COLORSLIDER_POS_LIMIT_RANGE[0], newLeft);
	    newLeft = Math.min(COLORSLIDER_POS_LIMIT_RANGE[1], newLeft);

	    svgvml.setTranslateXY(handle, newLeft, newTop);

	    handleColor = newTop > 50 ? 'white' : 'black';
	    svgvml.setStrokeColor(handle, handleColor);

	    if (!silent) {
	        this.fire('_selectColor', {
	            color: colorutil.rgbToHEX.apply(null, this.getRGB())
	        });
	    }
	};

	/**
	 * Move colorslider by supplied saturation and values.
	 *
	 * The movement of color slider handle follow HSV cylinder model. {@link https://en.wikipedia.org/wiki/HSL_and_HSV}
	 * @param {number} saturation - the percent of saturation (0% ~ 100%)
	 * @param {number} value - the percent of saturation (0% ~ 100%)
	 * @param {boolean} [silent=false] - set true then not fire custom event
	 */
	Slider.prototype.moveSaturationAndValue = function (saturation, value, silent) {
	    var absMin, maxValue, newLeft, newTop;

	    saturation = saturation || 0;
	    value = value || 0;

	    absMin = Math.abs(COLORSLIDER_POS_LIMIT_RANGE[0]);
	    maxValue = COLORSLIDER_POS_LIMIT_RANGE[1];

	    // subtract absMin value because current color position is not left, top of handle element.
	    // The saturation. from left 0 to right 100
	    newLeft = saturation * maxValue / 100 - absMin;
	    // The Value. from top 100 to bottom 0. that why newTop subtract by maxValue.
	    newTop = maxValue - value * maxValue / 100 - absMin;

	    this._moveColorSliderHandle(newLeft, newTop, silent);
	};

	/**
	 * Move color slider handle to supplied position
	 *
	 * The number of X, Y must be related value from color slider container
	 * @private
	 * @param {number} x - the pixel value to move handle
	 * @param {number} y - the pixel value to move handle
	 */
	Slider.prototype._moveColorSliderByPosition = function (x, y) {
	    var offset = COLORSLIDER_POS_LIMIT_RANGE[0];
	    this._moveColorSliderHandle(x + offset, y + offset);
	};

	/**
	 * Get saturation and value value.
	 * @returns {number[]} saturation and value
	 */
	Slider.prototype.getSaturationAndValue = function () {
	    var absMin = Math.abs(COLORSLIDER_POS_LIMIT_RANGE[0]),
	        maxValue = absMin + COLORSLIDER_POS_LIMIT_RANGE[1],
	        position = svgvml.getTranslateXY(this.sliderHandleElement),
	        saturation,
	        value;

	    saturation = (position[1] + absMin) / maxValue * 100;
	    // The value of HSV color model is inverted. top 100 ~ bottom 0. so subtract by 100
	    value = 100 - (position[0] + absMin) / maxValue * 100;

	    return [saturation, value];
	};

	/**
	 * Move hue handle supplied pixel value
	 * @private
	 * @param {number} newTop - pixel to move hue handle
	 * @param {boolean} [silent=false] - set true then not fire custom event
	 */
	Slider.prototype._moveHueHandle = function (newTop, silent) {
	    var hueHandleElement = this.huebarHandleElement,
	        baseColorElement = this.baseColorElement,
	        newGradientColor,
	        hexStr;

	    newTop = Math.max(HUEBAR_POS_LIMIT_RANGE[0], newTop);
	    newTop = Math.min(HUEBAR_POS_LIMIT_RANGE[1], newTop);

	    svgvml.setTranslateY(hueHandleElement, newTop);

	    newGradientColor = colorutil.hsvToRGB(this.getHue(), 100, 100);
	    hexStr = colorutil.rgbToHEX.apply(null, newGradientColor);

	    svgvml.setGradientColorStop(baseColorElement, hexStr);

	    if (!silent) {
	        this.fire('_selectColor', {
	            color: colorutil.rgbToHEX.apply(null, this.getRGB())
	        });
	    }
	};

	/**
	 * Move hue bar handle by supplied degree
	 * @param {number} degree - (0 ~ 359.9 degree)
	 * @param {boolean} [silent=false] - set true then not fire custom event
	 */
	Slider.prototype.moveHue = function (degree, silent) {
	    var newTop = 0,
	        absMin,
	        maxValue;

	    absMin = Math.abs(HUEBAR_POS_LIMIT_RANGE[0]);
	    maxValue = absMin + HUEBAR_POS_LIMIT_RANGE[1];

	    degree = degree || 0;
	    newTop = maxValue * degree / HUE_WHEEL_MAX - absMin;

	    this._moveHueHandle(newTop, silent);
	};

	/**
	 * Move hue bar handle by supplied percent
	 * @private
	 * @param {number} y - pixel value to move hue handle
	 */
	Slider.prototype._moveHueByPosition = function (y) {
	    var offset = HUEBAR_POS_LIMIT_RANGE[0];

	    this._moveHueHandle(y + offset);
	};

	/**
	 * Get huebar handle position by color degree
	 * @returns {number} degree (0 ~ 359.9 degree)
	 */
	Slider.prototype.getHue = function () {
	    var handle = this.huebarHandleElement,
	        position = svgvml.getTranslateXY(handle),
	        absMin,
	        maxValue;

	    absMin = Math.abs(HUEBAR_POS_LIMIT_RANGE[0]);
	    maxValue = absMin + HUEBAR_POS_LIMIT_RANGE[1];

	    // maxValue : 359.99 = pos.y : x
	    return (position[0] + absMin) * HUE_WHEEL_MAX / maxValue;
	};

	/**
	 * Get HSV value from slider
	 * @returns {number[]} hsv values
	 */
	Slider.prototype.getHSV = function () {
	    var sv = this.getSaturationAndValue(),
	        h = this.getHue();

	    return [h].concat(sv);
	};

	/**
	 * Get RGB value from slider
	 * @returns {number[]} RGB value
	 */
	Slider.prototype.getRGB = function () {
	    return colorutil.hsvToRGB.apply(null, this.getHSV());
	};

	/**********
	 * Drag event handler
	 **********/

	/**
	 * Cache immutable data when dragging or click view
	 * @param {object} event - Click, DragStart event.
	 * @returns {object} cached data.
	 */
	Slider.prototype._prepareColorSliderForMouseEvent = function (event) {
	    var options = this.options,
	        sliderPart = domutil.closest(event.target, '.' + options.cssPrefix + 'slider-part'),
	        cache;

	    cache = this._dragDataCache = {
	        isColorSlider: domutil.hasClass(sliderPart, options.cssPrefix + 'slider-left'),
	        parentElement: sliderPart
	    };

	    return cache;
	};

	/**
	 * Click event handler
	 * @param {object} clickEvent - Click event from Drag module
	 */
	Slider.prototype._onClick = function (clickEvent) {
	    var cache = this._prepareColorSliderForMouseEvent(clickEvent),
	        mousePos = domevent.getMousePosition(clickEvent.originEvent, cache.parentElement);

	    if (cache.isColorSlider) {
	        this._moveColorSliderByPosition(mousePos[0], mousePos[1]);
	    } else {
	        this._moveHueByPosition(mousePos[1]);
	    }

	    this._dragDataCache = null;
	};

	/**
	 * DragStart event handler
	 * @param {object} dragStartEvent - dragStart event data from Drag#dragStart
	 */
	Slider.prototype._onDragStart = function (dragStartEvent) {
	    this._prepareColorSliderForMouseEvent(dragStartEvent);
	};

	/**
	 * Drag event handler
	 * @param {Drag#drag} dragEvent - drag event data
	 */
	Slider.prototype._onDrag = function (dragEvent) {
	    var cache = this._dragDataCache,
	        mousePos = domevent.getMousePosition(dragEvent.originEvent, cache.parentElement);

	    if (cache.isColorSlider) {
	        this._moveColorSliderByPosition(mousePos[0], mousePos[1]);
	    } else {
	        this._moveHueByPosition(mousePos[1]);
	    }
	};

	/**
	 * Drag#dragEnd event handler
	 */
	Slider.prototype._onDragEnd = function () {
	    this._dragDataCache = null;
	};

	util.CustomEvents.mixin(Slider);

	module.exports = Slider;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview module for manipulate SVG or VML object
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);
	var PARSE_TRANSLATE_NUM_REGEX = /[\.\-0-9]+/g;
	var SVG_HUE_HANDLE_RIGHT_POS = -6;

	/* istanbul ignore next */
	var svgvml = {
	    /**
	     * Return true when browser is below IE8.
	     * @returns {boolean} is old browser?
	     */
	    isOldBrowser: function () {
	        var _isOldBrowser = svgvml._isOldBrowser;

	        if (!util.isExisty(_isOldBrowser)) {
	            svgvml._isOldBrowser = _isOldBrowser = util.browser.msie && util.browser.version < 9;
	        }

	        return _isOldBrowser;
	    },

	    /**
	     * Get translate transform value
	     * @param {SVG|VML} obj - svg or vml object that want to know translate x, y
	     * @returns {number[]} translated coordinates [x, y]
	     */
	    getTranslateXY: function (obj) {
	        var temp;

	        if (svgvml.isOldBrowser()) {
	            temp = obj.style;

	            return [parseFloat(temp.top), parseFloat(temp.left)];
	        }

	        temp = obj.getAttribute('transform');

	        if (!temp) {
	            return [0, 0];
	        }

	        temp = temp.match(PARSE_TRANSLATE_NUM_REGEX);

	        // need caution for difference of VML, SVG coordinates system.
	        // translate command need X coords in first parameter. but VML is use CSS coordinate system(top, left)
	        return [parseFloat(temp[1]), parseFloat(temp[0])];
	    },

	    /**
	     * Set translate transform value
	     * @param {SVG|VML} obj - SVG or VML object to setting translate transform.
	     * @param {number} x - translate X value
	     * @param {number} y - translate Y value
	     */
	    setTranslateXY: function (obj, x, y) {
	        if (svgvml.isOldBrowser()) {
	            obj.style.left = x + 'px';
	            obj.style.top = y + 'px';
	        } else {
	            obj.setAttribute('transform', 'translate(' + x + ',' + y + ')');
	        }
	    },

	    /**
	     * Set translate only Y value
	     * @param {SVG|VML} obj - SVG or VML object to setting translate transform.
	     * @param {number} y - translate Y value
	     */
	    setTranslateY: function (obj, y) {
	        if (svgvml.isOldBrowser()) {
	            obj.style.top = y + 'px';
	        } else {
	            obj.setAttribute('transform', 'translate(' + SVG_HUE_HANDLE_RIGHT_POS + ',' + y + ')');
	        }
	    },

	    /**
	     * Set stroke color to SVG or VML object
	     * @param {SVG|VML} obj - SVG or VML object to setting stroke color
	     * @param {string} colorStr - color string
	     */
	    setStrokeColor: function (obj, colorStr) {
	        if (svgvml.isOldBrowser()) {
	            obj.strokecolor = colorStr;
	        } else {
	            obj.setAttribute('stroke', colorStr);
	        }
	    },

	    /**
	     * Set gradient stop color to SVG, VML object.
	     * @param {SVG|VML} obj - SVG, VML object to applying gradient stop color
	     * @param {string} colorStr - color string
	     */
	    setGradientColorStop: function (obj, colorStr) {
	        if (svgvml.isOldBrowser()) {
	            obj.color = colorStr;
	        } else {
	            obj.setAttribute('stop-color', colorStr);
	        }
	    }

	};

	module.exports = svgvml;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * @fileoverview Slider template
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 */

	'use strict';

	var util = __webpack_require__(8);

	var layout = ['<div class="{{cssPrefix}}slider-left {{cssPrefix}}slider-part">{{slider}}</div>', '<div class="{{cssPrefix}}slider-right {{cssPrefix}}slider-part">{{huebar}}</div>'].join('\n');

	var SVGSlider = ['<svg class="{{cssPrefix}}svg {{cssPrefix}}svg-slider">', '<defs>', '<linearGradient id="{{cssPrefix}}svg-fill-color" x1="0%" y1="0%" x2="100%" y2="0%">', '<stop offset="0%" stop-color="rgb(255,255,255)" />', '<stop class="{{cssPrefix}}slider-basecolor" offset="100%" stop-color="rgb(255,0,0)" />', '</linearGradient>', '<linearGradient id="{{cssPrefix}}svn-fill-black" x1="0%" y1="0%" x2="0%" y2="100%">', '<stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />', '<stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1" />', '</linearGradient>', '</defs>', '<rect width="100%" height="100%" fill="url(#{{cssPrefix}}svg-fill-color)"></rect>', '<rect width="100%" height="100%" fill="url(#{{cssPrefix}}svn-fill-black)"></rect>', '<path transform="translate(0,0)" class="{{cssPrefix}}slider-handle" d="M0 7.5 L15 7.5 M7.5 15 L7.5 0 M2 7 a5.5 5.5 0 1 1 0 1 Z" stroke="black" stroke-width="0.75" fill="none" />', '</svg>'].join('\n');

	var VMLSlider = ['<div class="{{cssPrefix}}vml-slider">', '<v:rect strokecolor="none" class="{{cssPrefix}}vml {{cssPrefix}}vml-slider-bg">', '<v:fill class="{{cssPrefix}}vml {{cssPrefix}}slider-basecolor" type="gradient" method="none" color="#ff0000" color2="#fff" angle="90" />', '</v:rect>', '<v:rect strokecolor="#ccc" class="{{cssPrefix}}vml {{cssPrefix}}vml-slider-bg">', '<v:fill type="gradient" method="none" color="black" color2="white" o:opacity2="0%" class="{{cssPrefix}}vml" />', '</v:rect>', '<v:shape class="{{cssPrefix}}vml {{cssPrefix}}slider-handle" coordsize="1 1" style="width:1px;height:1px;"' + 'path="m 0,7 l 14,7 m 7,14 l 7,0 ar 12,12 2,2 z" filled="false" stroked="true" />', '</div>'].join('\n');

	var SVGHuebar = ['<svg class="{{cssPrefix}}svg {{cssPrefix}}svg-huebar">', '<defs>', '<linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">', '<stop offset="0%" stop-color="rgb(255,0,0)" />', '<stop offset="16.666%" stop-color="rgb(255,255,0)" />', '<stop offset="33.333%" stop-color="rgb(0,255,0)" />', '<stop offset="50%" stop-color="rgb(0,255,255)" />', '<stop offset="66.666%" stop-color="rgb(0,0,255)" />', '<stop offset="83.333%" stop-color="rgb(255,0,255)" />', '<stop offset="100%" stop-color="rgb(255,0,0)" />', '</linearGradient>', '</defs>', '<rect width="18px" height="100%" fill="url(#g)"></rect>', '<path transform="translate(-6,-3)" class="{{cssPrefix}}huebar-handle" d="M0 0 L4 4 L0 8 L0 0 Z" fill="black" stroke="none" />', '</svg>'].join('\n');

	var VMLHuebar = ['<div class="{{cssPrefix}}vml-huebar">', '<v:rect strokecolor="#ccc" class="{{cssPrefix}}vml {{cssPrefix}}vml-huebar-bg">', '<v:fill type="gradient" method="none" colors="' + '0% rgb(255,0,0), 16.666% rgb(255,255,0), 33.333% rgb(0,255,0), 50% rgb(0,255,255), 66.666% rgb(0,0,255), 83.333% rgb(255,0,255), 100% rgb(255,0,0)' + '" angle="180" class="{{cssPrefix}}vml" />', '</v:rect>', '<v:shape class="{{cssPrefix}}vml {{cssPrefix}}huebar-handle" coordsize="1 1" style="width:1px;height:1px;position:absolute;z-index:1;right:22px;top:-3px;"' + 'path="m 0,0 l 4,4 l 0,8 l 0,0 z" filled="true" fillcolor="black" stroked="false" />', '</div>'].join('\n');

	var isOldBrowser = util.browser.msie && util.browser.version < 9;

	if (isOldBrowser) {
	    global.document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
	}

	module.exports = {
	    layout: layout,
	    slider: isOldBrowser ? VMLSlider : SVGSlider,
	    huebar: isOldBrowser ? VMLHuebar : SVGHuebar
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ })
/******/ ])
});
;
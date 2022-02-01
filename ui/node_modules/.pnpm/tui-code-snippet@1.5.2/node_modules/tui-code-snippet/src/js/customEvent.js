/**
 * @fileoverview
 *  This module provides some functions for custom events.<br>
 *  And it is implemented in the observer design pattern.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var collection = require('./collection');
var type = require('./type');
var object = require('./object');

var R_EVENTNAME_SPLIT = /\s+/g;

/**
 * A unit of event handler item.
 * @ignore
 * @typedef {object} HandlerItem
 * @property {function} fn - event handler
 * @property {object} ctx - context of event handler
 */

/**
 * @class
 * @memberof tui.util
 * @example
 * // node, commonjs
 * var CustomEvents = require('tui-code-snippet').CustomEvents;
 * @example
 * // distribution file, script
 * <script src='path-to/tui-code-snippt.js'></script>
 * <script>
 * var CustomEvents = tui.util.CustomEvents;
 * </script>
 */
function CustomEvents() {
    /**
     * @type {HandlerItem[]}
     */
    this.events = null;

    /**
     * only for checking specific context event was binded
     * @type {object[]}
     */
    this.contexts = null;
}

/**
 * Mixin custom events feature to specific constructor
 * @param {function} func - constructor
 * @example
 * //-- #1. Get Module --//
 * var CustomEvents = require('tui-code-snippet').CustomEvents; // node, commonjs
 * var CustomEvents = tui.util.CustomEvents; // distribution file
 *
 * //-- #2. Use property --//
 * var model;
 * function Model() {
 *     this.name = '';
 * }
 * CustomEvents.mixin(Model);
 *
 * model = new Model();
 * model.on('change', function() { this.name = 'model'; }, this);
 * model.fire('change');
 * alert(model.name); // 'model';
 */
CustomEvents.mixin = function(func) {
    object.extend(func.prototype, CustomEvents.prototype);
};

/**
 * Get HandlerItem object
 * @param {function} handler - handler function
 * @param {object} [context] - context for handler
 * @returns {HandlerItem} HandlerItem object
 * @private
 */
CustomEvents.prototype._getHandlerItem = function(handler, context) {
    var item = {handler: handler};

    if (context) {
        item.context = context;
    }

    return item;
};

/**
 * Get event object safely
 * @param {string} [eventName] - create sub event map if not exist.
 * @returns {(object|array)} event object. if you supplied `eventName`
 *  parameter then make new array and return it
 * @private
 */
CustomEvents.prototype._safeEvent = function(eventName) {
    var events = this.events;
    var byName;

    if (!events) {
        events = this.events = {};
    }

    if (eventName) {
        byName = events[eventName];

        if (!byName) {
            byName = [];
            events[eventName] = byName;
        }

        events = byName;
    }

    return events;
};

/**
 * Get context array safely
 * @returns {array} context array
 * @private
 */
CustomEvents.prototype._safeContext = function() {
    var context = this.contexts;

    if (!context) {
        context = this.contexts = [];
    }

    return context;
};

/**
 * Get index of context
 * @param {object} ctx - context that used for bind custom event
 * @returns {number} index of context
 * @private
 */
CustomEvents.prototype._indexOfContext = function(ctx) {
    var context = this._safeContext();
    var index = 0;

    while (context[index]) {
        if (ctx === context[index][0]) {
            return index;
        }

        index += 1;
    }

    return -1;
};

/**
 * Memorize supplied context for recognize supplied object is context or
 *  name: handler pair object when off()
 * @param {object} ctx - context object to memorize
 * @private
 */
CustomEvents.prototype._memorizeContext = function(ctx) {
    var context, index;

    if (!type.isExisty(ctx)) {
        return;
    }

    context = this._safeContext();
    index = this._indexOfContext(ctx);

    if (index > -1) {
        context[index][1] += 1;
    } else {
        context.push([ctx, 1]);
    }
};

/**
 * Forget supplied context object
 * @param {object} ctx - context object to forget
 * @private
 */
CustomEvents.prototype._forgetContext = function(ctx) {
    var context, contextIndex;

    if (!type.isExisty(ctx)) {
        return;
    }

    context = this._safeContext();
    contextIndex = this._indexOfContext(ctx);

    if (contextIndex > -1) {
        context[contextIndex][1] -= 1;

        if (context[contextIndex][1] <= 0) {
            context.splice(contextIndex, 1);
        }
    }
};

/**
 * Bind event handler
 * @param {(string|{name:string, handler:function})} eventName - custom
 *  event name or an object {eventName: handler}
 * @param {(function|object)} [handler] - handler function or context
 * @param {object} [context] - context for binding
 * @private
 */
CustomEvents.prototype._bindEvent = function(eventName, handler, context) {
    var events = this._safeEvent(eventName);
    this._memorizeContext(context);
    events.push(this._getHandlerItem(handler, context));
};

/**
 * Bind event handlers
 * @param {(string|{name:string, handler:function})} eventName - custom
 *  event name or an object {eventName: handler}
 * @param {(function|object)} [handler] - handler function or context
 * @param {object} [context] - context for binding
 * //-- #1. Get Module --//
 * var CustomEvents = require('tui-code-snippet').CustomEvents; // node, commonjs
 * var CustomEvents = tui.util.CustomEvents; // distribution file
 *
 * //-- #2. Use property --//
 * // # 2.1 Basic Usage
 * CustomEvents.on('onload', handler);
 *
 * // # 2.2 With context
 * CustomEvents.on('onload', handler, myObj);
 *
 * // # 2.3 Bind by object that name, handler pairs
 * CustomEvents.on({
 *     'play': handler,
 *     'pause': handler2
 * });
 *
 * // # 2.4 Bind by object that name, handler pairs with context object
 * CustomEvents.on({
 *     'play': handler
 * }, myObj);
 */
CustomEvents.prototype.on = function(eventName, handler, context) {
    var self = this;

    if (type.isString(eventName)) {
        // [syntax 1, 2]
        eventName = eventName.split(R_EVENTNAME_SPLIT);
        collection.forEach(eventName, function(name) {
            self._bindEvent(name, handler, context);
        });
    } else if (type.isObject(eventName)) {
        // [syntax 3, 4]
        context = handler;
        collection.forEach(eventName, function(func, name) {
            self.on(name, func, context);
        });
    }
};

/**
 * Bind one-shot event handlers
 * @param {(string|{name:string,handler:function})} eventName - custom
 *  event name or an object {eventName: handler}
 * @param {function|object} [handler] - handler function or context
 * @param {object} [context] - context for binding
 */
CustomEvents.prototype.once = function(eventName, handler, context) {
    var self = this;

    if (type.isObject(eventName)) {
        context = handler;
        collection.forEach(eventName, function(func, name) {
            self.once(name, func, context);
        });

        return;
    }

    function onceHandler() { // eslint-disable-line require-jsdoc
        handler.apply(context, arguments);
        self.off(eventName, onceHandler, context);
    }

    this.on(eventName, onceHandler, context);
};

/**
 * Splice supplied array by callback result
 * @param {array} arr - array to splice
 * @param {function} predicate - function return boolean
 * @private
 */
CustomEvents.prototype._spliceMatches = function(arr, predicate) {
    var i = 0;
    var len;

    if (!type.isArray(arr)) {
        return;
    }

    for (len = arr.length; i < len; i += 1) {
        if (predicate(arr[i]) === true) {
            arr.splice(i, 1);
            len -= 1;
            i -= 1;
        }
    }
};

/**
 * Get matcher for unbind specific handler events
 * @param {function} handler - handler function
 * @returns {function} handler matcher
 * @private
 */
CustomEvents.prototype._matchHandler = function(handler) {
    var self = this;

    return function(item) {
        var needRemove = handler === item.handler;

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

/**
 * Get matcher for unbind specific context events
 * @param {object} context - context
 * @returns {function} object matcher
 * @private
 */
CustomEvents.prototype._matchContext = function(context) {
    var self = this;

    return function(item) {
        var needRemove = context === item.context;

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

/**
 * Get matcher for unbind specific hander, context pair events
 * @param {function} handler - handler function
 * @param {object} context - context
 * @returns {function} handler, context matcher
 * @private
 */
CustomEvents.prototype._matchHandlerAndContext = function(handler, context) {
    var self = this;

    return function(item) {
        var matchHandler = (handler === item.handler);
        var matchContext = (context === item.context);
        var needRemove = (matchHandler && matchContext);

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

/**
 * Unbind event by event name
 * @param {string} eventName - custom event name to unbind
 * @param {function} [handler] - handler function
 * @private
 */
CustomEvents.prototype._offByEventName = function(eventName, handler) {
    var self = this;
    var forEach = collection.forEachArray;
    var andByHandler = type.isFunction(handler);
    var matchHandler = self._matchHandler(handler);

    eventName = eventName.split(R_EVENTNAME_SPLIT);

    forEach(eventName, function(name) {
        var handlerItems = self._safeEvent(name);

        if (andByHandler) {
            self._spliceMatches(handlerItems, matchHandler);
        } else {
            forEach(handlerItems, function(item) {
                self._forgetContext(item.context);
            });

            self.events[name] = [];
        }
    });
};

/**
 * Unbind event by handler function
 * @param {function} handler - handler function
 * @private
 */
CustomEvents.prototype._offByHandler = function(handler) {
    var self = this;
    var matchHandler = this._matchHandler(handler);

    collection.forEach(this._safeEvent(), function(handlerItems) {
        self._spliceMatches(handlerItems, matchHandler);
    });
};

/**
 * Unbind event by object(name: handler pair object or context object)
 * @param {object} obj - context or {name: handler} pair object
 * @param {function} handler - handler function
 * @private
 */
CustomEvents.prototype._offByObject = function(obj, handler) {
    var self = this;
    var matchFunc;

    if (this._indexOfContext(obj) < 0) {
        collection.forEach(obj, function(func, name) {
            self.off(name, func);
        });
    } else if (type.isString(handler)) {
        matchFunc = this._matchContext(obj);

        self._spliceMatches(this._safeEvent(handler), matchFunc);
    } else if (type.isFunction(handler)) {
        matchFunc = this._matchHandlerAndContext(handler, obj);

        collection.forEach(this._safeEvent(), function(handlerItems) {
            self._spliceMatches(handlerItems, matchFunc);
        });
    } else {
        matchFunc = this._matchContext(obj);

        collection.forEach(this._safeEvent(), function(handlerItems) {
            self._spliceMatches(handlerItems, matchFunc);
        });
    }
};

/**
 * Unbind custom events
 * @param {(string|object|function)} eventName - event name or context or
 *  {name: handler} pair object or handler function
 * @param {(function)} handler - handler function
 * @example
 * //-- #1. Get Module --//
 * var CustomEvents = require('tui-code-snippet').CustomEvents; // node, commonjs
 * var CustomEvents = tui.util.CustomEvents; // distribution file
 *
 * //-- #2. Use property --//
 * // # 2.1 off by event name
 * CustomEvents.off('onload');
 *
 * // # 2.2 off by event name and handler
 * CustomEvents.off('play', handler);
 *
 * // # 2.3 off by handler
 * CustomEvents.off(handler);
 *
 * // # 2.4 off by context
 * CustomEvents.off(myObj);
 *
 * // # 2.5 off by context and handler
 * CustomEvents.off(myObj, handler);
 *
 * // # 2.6 off by context and event name
 * CustomEvents.off(myObj, 'onload');
 *
 * // # 2.7 off by an Object.<string, function> that is {eventName: handler}
 * CustomEvents.off({
 *   'play': handler,
 *   'pause': handler2
 * });
 *
 * // # 2.8 off the all events
 * CustomEvents.off();
 */
CustomEvents.prototype.off = function(eventName, handler) {
    if (type.isString(eventName)) {
        // [syntax 1, 2]
        this._offByEventName(eventName, handler);
    } else if (!arguments.length) {
        // [syntax 8]
        this.events = {};
        this.contexts = [];
    } else if (type.isFunction(eventName)) {
        // [syntax 3]
        this._offByHandler(eventName);
    } else if (type.isObject(eventName)) {
        // [syntax 4, 5, 6]
        this._offByObject(eventName, handler);
    }
};

/**
 * Fire custom event
 * @param {string} eventName - name of custom event
 */
CustomEvents.prototype.fire = function(eventName) {  // eslint-disable-line
    this.invoke.apply(this, arguments);
};

/**
 * Fire a event and returns the result of operation 'boolean AND' with all
 *  listener's results.
 *
 * So, It is different from {@link CustomEvents#fire}.
 *
 * In service code, use this as a before event in component level usually
 *  for notifying that the event is cancelable.
 * @param {string} eventName - Custom event name
 * @param {...*} data - Data for event
 * @returns {boolean} The result of operation 'boolean AND'
 * @example
 * var map = new Map();
 * map.on({
 *     'beforeZoom': function() {
 *         // It should cancel the 'zoom' event by some conditions.
 *         if (that.disabled && this.getState()) {
 *             return false;
 *         }
 *         return true;
 *     }
 * });
 *
 * if (this.invoke('beforeZoom')) {    // check the result of 'beforeZoom'
 *     // if true,
 *     // doSomething
 * }
 */
CustomEvents.prototype.invoke = function(eventName) {
    var events, args, index, item;

    if (!this.hasListener(eventName)) {
        return true;
    }

    events = this._safeEvent(eventName);
    args = Array.prototype.slice.call(arguments, 1);
    index = 0;

    while (events[index]) {
        item = events[index];

        if (item.handler.apply(item.context, args) === false) {
            return false;
        }

        index += 1;
    }

    return true;
};

/**
 * Return whether at least one of the handlers is registered in the given
 *  event name.
 * @param {string} eventName - Custom event name
 * @returns {boolean} Is there at least one handler in event name?
 */
CustomEvents.prototype.hasListener = function(eventName) {
    return this.getListenerLength(eventName) > 0;
};

/**
 * Return a count of events registered.
 * @param {string} eventName - Custom event name
 * @returns {number} number of event
 */
CustomEvents.prototype.getListenerLength = function(eventName) {
    var events = this._safeEvent(eventName);

    return events.length;
};

module.exports = CustomEvents;

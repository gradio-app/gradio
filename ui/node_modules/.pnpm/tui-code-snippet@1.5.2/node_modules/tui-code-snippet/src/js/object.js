/**
 * @fileoverview This module has some functions for handling a plain object, json.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var type = require('./type');
var array = require('./array');

/**
 * The last id of stamp
 * @type {number}
 * @private
 */
var lastId = 0;

/**
 * Extend the target object from other objects.
 * @param {object} target - Object that will be extended
 * @param {...object} objects - Objects as sources
 * @returns {object} Extended object
 * @memberof tui.util
 */
function extend(target, objects) { // eslint-disable-line no-unused-vars
    var hasOwnProp = Object.prototype.hasOwnProperty;
    var source, prop, i, len;

    for (i = 1, len = arguments.length; i < len; i += 1) {
        source = arguments[i];
        for (prop in source) {
            if (hasOwnProp.call(source, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    return target;
}

/**
 * Assign a unique id to an object
 * @param {object} obj - Object that will be assigned id.
 * @returns {number} Stamped id
 * @memberof tui.util
 */
function stamp(obj) {
    if (!obj.__fe_id) {
        lastId += 1;
        obj.__fe_id = lastId; // eslint-disable-line camelcase
    }

    return obj.__fe_id;
}

/**
 * Verify whether an object has a stamped id or not.
 * @param {object} obj - adjusted object
 * @returns {boolean}
 * @memberof tui.util
 */
function hasStamp(obj) {
    return type.isExisty(pick(obj, '__fe_id'));
}

/**
 * Reset the last id of stamp
 * @private
 */
function resetLastId() {
    lastId = 0;
}

/**
 * Return a key-list(array) of a given object
 * @param {object} obj - Object from which a key-list will be extracted
 * @returns {Array} A key-list(array)
 * @memberof tui.util
 */
function keys(obj) {
    var keyArray = [];
    var key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keyArray.push(key);
        }
    }

    return keyArray;
}

/**
 * Return the equality for multiple objects(jsonObjects).<br>
 *  See {@link http://stackoverflow.com/questions/1068834/object-comparison-in-javascript}
 * @param {...object} object - Multiple objects for comparing.
 * @returns {boolean} Equality
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var jsonObj1 = {name:'milk', price: 1000};
 * var jsonObj2 = {name:'milk', price: 1000};
 * var jsonObj3 = {name:'milk', price: 1000};
 * util.compareJSON(jsonObj1, jsonObj2, jsonObj3);   // true
 *
 * var jsonObj4 = {name:'milk', price: 1000};
 * var jsonObj5 = {name:'beer', price: 3000};
 * util.compareJSON(jsonObj4, jsonObj5); // false
 */
function compareJSON(object) {
    var argsLen = arguments.length;
    var i = 1;

    if (argsLen < 1) {
        return true;
    }

    for (; i < argsLen; i += 1) {
        if (!isSameObject(object, arguments[i])) {
            return false;
        }
    }

    return true;
}

/**
 * @param {*} x - object to compare
 * @param {*} y - object to compare
 * @returns {boolean} - whether object x and y is same or not
 * @private
 */
function isSameObject(x, y) { // eslint-disable-line complexity
    var leftChain = [];
    var rightChain = [];
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) &&
        isNaN(y) &&
        type.isNumber(x) &&
        type.isNumber(y)) {
        return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((type.isFunction(x) && type.isFunction(y)) ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) ||
        y.isPrototypeOf(x) ||
        x.constructor !== y.constructor ||
        x.prototype !== y.prototype) {
        return false;
    }

    // check for infinitive linking loops
    if (array.inArray(x, leftChain) > -1 ||
        array.inArray(y, rightChain) > -1) {
        return false;
    }

    // Quick checking of one object beeing a subset of another.
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    // This for loop executes comparing with hasOwnProperty() and typeof for each property in 'x' object,
    // and verifying equality for x[property] and y[property].
    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        if (typeof (x[p]) === 'object' || typeof (x[p]) === 'function') {
            leftChain.push(x);
            rightChain.push(y);

            if (!isSameObject(x[p], y[p])) {
                return false;
            }

            leftChain.pop();
            rightChain.pop();
        } else if (x[p] !== y[p]) {
            return false;
        }
    }

    return true;
}
/* eslint-enable complexity */

/**
 * Retrieve a nested item from the given object/array
 * @param {object|Array} obj - Object for retrieving
 * @param {...string|number} paths - Paths of property
 * @returns {*} Value
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var obj = {
 *     'key1': 1,
 *     'nested' : {
 *         'key1': 11,
 *         'nested': {
 *             'key1': 21
 *         }
 *     }
 * };
 * util.pick(obj, 'nested', 'nested', 'key1'); // 21
 * util.pick(obj, 'nested', 'nested', 'key2'); // undefined
 *
 * var arr = ['a', 'b', 'c'];
 * util.pick(arr, 1); // 'b'
 */
function pick(obj, paths) { // eslint-disable-line no-unused-vars
    var args = arguments;
    var target = args[0];
    var i = 1;
    var length = args.length;

    for (; i < length; i += 1) {
        if (type.isUndefined(target) ||
            type.isNull(target)) {
            return;
        }

        target = target[args[i]];
    }

    return target; // eslint-disable-line consistent-return
}

module.exports = {
    extend: extend,
    stamp: stamp,
    hasStamp: hasStamp,
    resetLastId: resetLastId,
    keys: Object.prototype.keys || keys,
    compareJSON: compareJSON,
    pick: pick
};

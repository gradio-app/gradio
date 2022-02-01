/**
 * @fileoverview This module has some functions for handling object as collection.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var type = require('./type');
var object = require('./object');

/**
 * Execute the provided callback once for each element present
 * in the array(or Array-like object) in ascending order.<br>
 * If the callback function returns false, the loop will be stopped.<br>
 * Callback function(iteratee) is invoked with three arguments:
 *  - The value of the element
 *  - The index of the element
 *  - The array(or Array-like object) being traversed
 * @param {Array} arr The array(or Array-like object) that will be traversed
 * @param {function} iteratee Callback function
 * @param {Object} [context] Context(this) of callback function
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var sum = 0;
 *
 * util.forEachArray([1,2,3], function(value){
 *     sum += value;
 * });
 * alert(sum); // 6
 */
function forEachArray(arr, iteratee, context) {
    var index = 0;
    var len = arr.length;

    context = context || null;

    for (; index < len; index += 1) {
        if (iteratee.call(context, arr[index], index, arr) === false) {
            break;
        }
    }
}

/**
 * Execute the provided callback once for each property of object which actually exist.<br>
 * If the callback function returns false, the loop will be stopped.<br>
 * Callback function(iteratee) is invoked with three arguments:
 *  - The value of the property
 *  - The name of the property
 *  - The object being traversed
 * @param {Object} obj The object that will be traversed
 * @param {function} iteratee  Callback function
 * @param {Object} [context] Context(this) of callback function
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var sum = 0;
 *
 * util.forEachOwnProperties({a:1,b:2,c:3}, function(value){
 *     sum += value;
 * });
 * alert(sum); // 6
 **/
function forEachOwnProperties(obj, iteratee, context) {
    var key;

    context = context || null;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (iteratee.call(context, obj[key], key, obj) === false) {
                break;
            }
        }
    }
}

/**
 * Execute the provided callback once for each property of object(or element of array) which actually exist.<br>
 * If the object is Array-like object(ex-arguments object), It needs to transform to Array.(see 'ex2' of example).<br>
 * If the callback function returns false, the loop will be stopped.<br>
 * Callback function(iteratee) is invoked with three arguments:
 *  - The value of the property(or The value of the element)
 *  - The name of the property(or The index of the element)
 *  - The object being traversed
 * @param {Object} obj The object that will be traversed
 * @param {function} iteratee Callback function
 * @param {Object} [context] Context(this) of callback function
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var sum = 0;
 *
 * util.forEach([1,2,3], function(value){
 *     sum += value;
 * });
 * alert(sum); // 6
 *
 * // In case of Array-like object
 * var array = Array.prototype.slice.call(arrayLike); // change to array
 * util.forEach(array, function(value){
 *     sum += value;
 * });
 */
function forEach(obj, iteratee, context) {
    if (type.isArray(obj)) {
        forEachArray(obj, iteratee, context);
    } else {
        forEachOwnProperties(obj, iteratee, context);
    }
}

/**
 * Execute the provided callback function once for each element in an array, in order,
 * and constructs a new array from the results.<br>
 * If the object is Array-like object(ex-arguments object),
 * It needs to transform to Array.(see 'ex2' of forEach example)<br>
 * Callback function(iteratee) is invoked with three arguments:
 *  - The value of the property(or The value of the element)
 *  - The name of the property(or The index of the element)
 *  - The object being traversed
 * @param {Object} obj The object that will be traversed
 * @param {function} iteratee Callback function
 * @param {Object} [context] Context(this) of callback function
 * @returns {Array} A new array composed of returned values from callback function
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var result = util.map([0,1,2,3], function(value) {
 *     return value + 1;
 * });
 *
 * alert(result);  // 1,2,3,4
 */
function map(obj, iteratee, context) {
    var resultArray = [];

    context = context || null;

    forEach(obj, function() {
        resultArray.push(iteratee.apply(context, arguments));
    });

    return resultArray;
}

/**
 * Execute the callback function once for each element present in the array(or Array-like object or plain object).<br>
 * If the object is Array-like object(ex-arguments object),
 * It needs to transform to Array.(see 'ex2' of forEach example)<br>
 * Callback function(iteratee) is invoked with four arguments:
 *  - The previousValue
 *  - The currentValue
 *  - The index
 *  - The object being traversed
 * @param {Object} obj The object that will be traversed
 * @param {function} iteratee Callback function
 * @param {Object} [context] Context(this) of callback function
 * @returns {*} The result value
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var result = util.reduce([0,1,2,3], function(stored, value) {
 *     return stored + value;
 * });
 *
 * alert(result); // 6
 */
function reduce(obj, iteratee, context) {
    var index = 0;
    var keys, length, store;

    context = context || null;

    if (!type.isArray(obj)) {
        keys = object.keys(obj);
        length = keys.length;
        store = obj[keys[index += 1]];
    } else {
        length = obj.length;
        store = obj[index];
    }

    index += 1;
    for (; index < length; index += 1) {
        store = iteratee.call(context, store, obj[keys ? keys[index] : index]);
    }

    return store;
}

/**
 * Transform the Array-like object to Array.<br>
 * In low IE (below 8), Array.prototype.slice.call is not perfect. So, try-catch statement is used.
 * @param {*} arrayLike Array-like object
 * @returns {Array} Array
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var arrayLike = {
 *     0: 'one',
 *     1: 'two',
 *     2: 'three',
 *     3: 'four',
 *     length: 4
 * };
 * var result = util.toArray(arrayLike);
 *
 * alert(result instanceof Array); // true
 * alert(result); // one,two,three,four
 */
function toArray(arrayLike) {
    var arr;
    try {
        arr = Array.prototype.slice.call(arrayLike);
    } catch (e) {
        arr = [];
        forEachArray(arrayLike, function(value) {
            arr.push(value);
        });
    }

    return arr;
}

/**
 * Create a new array or plain object with all elements(or properties)
 * that pass the test implemented by the provided function.<br>
 * Callback function(iteratee) is invoked with three arguments:
 *  - The value of the property(or The value of the element)
 *  - The name of the property(or The index of the element)
 *  - The object being traversed
 * @param {Object} obj Object(plain object or Array) that will be traversed
 * @param {function} iteratee Callback function
 * @param {Object} [context] Context(this) of callback function
 * @returns {Object} plain object or Array
 * @memberof tui.util
 * @example
  * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var result1 = util.filter([0,1,2,3], function(value) {
 *     return (value % 2 === 0);
 * });
 * alert(result1); // [0, 2]
 *
 * var result2 = util.filter({a : 1, b: 2, c: 3}, function(value) {
 *     return (value % 2 !== 0);
 * });
 * alert(result2.a); // 1
 * alert(result2.b); // undefined
 * alert(result2.c); // 3
 */
function filter(obj, iteratee, context) {
    var result, add;

    context = context || null;

    if (!type.isObject(obj) || !type.isFunction(iteratee)) {
        throw new Error('wrong parameter');
    }

    if (type.isArray(obj)) {
        result = [];
        add = function(subResult, args) {
            subResult.push(args[0]);
        };
    } else {
        result = {};
        add = function(subResult, args) {
            subResult[args[1]] = args[0];
        };
    }

    forEach(obj, function() {
        if (iteratee.apply(context, arguments)) {
            add(result, arguments);
        }
    }, context);

    return result;
}

/**
 * fetching a property
 * @param {Array} arr target collection
 * @param {String|Number} property property name
 * @returns {Array}
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var objArr = [
 *     {'abc': 1, 'def': 2, 'ghi': 3},
 *     {'abc': 4, 'def': 5, 'ghi': 6},
 *     {'abc': 7, 'def': 8, 'ghi': 9}
 * ];
 * var arr2d = [
 *     [1, 2, 3],
 *     [4, 5, 6],
 *     [7, 8, 9]
 * ];
 * util.pluck(objArr, 'abc'); // [1, 4, 7]
 * util.pluck(arr2d, 2); // [3, 6, 9]
 */
function pluck(arr, property) {
    var result = map(arr, function(item) {
        return item[property];
    });

    return result;
}

module.exports = {
    forEachOwnProperties: forEachOwnProperties,
    forEachArray: forEachArray,
    forEach: forEach,
    toArray: toArray,
    map: map,
    reduce: reduce,
    filter: filter,
    pluck: pluck
};

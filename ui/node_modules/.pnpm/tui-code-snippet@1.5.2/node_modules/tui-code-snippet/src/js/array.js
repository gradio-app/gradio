/**
 * @fileoverview This module has some functions for handling array.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var collection = require('./collection');
var type = require('./type');

var aps = Array.prototype.slice;
var util;

/**
 * Generate an integer Array containing an arithmetic progression.
 * @param {number} start - start index
 * @param {number} stop - stop index
 * @param {number} step - next visit index = current index + step
 * @returns {Array}
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * util.range(5); // [0, 1, 2, 3, 4]
 * util.range(1, 5); // [1,2,3,4]
 * util.range(2, 10, 2); // [2,4,6,8]
 * util.range(10, 2, -2); // [10,8,6,4]
 */
var range = function(start, stop, step) {
    var arr = [];
    var flag;

    if (type.isUndefined(stop)) {
        stop = start || 0;
        start = 0;
    }

    step = step || 1;
    flag = step < 0 ? -1 : 1;
    stop *= flag;

    for (; start * flag < stop; start += step) {
        arr.push(start);
    }

    return arr;
};

/* eslint-disable valid-jsdoc */
/**
 * Zip together multiple lists into a single array
 * @param {...Array}
 * @returns {Array}
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var result = util.zip([1, 2, 3], ['a', 'b','c'], [true, false, true]);
 * console.log(result[0]); // [1, 'a', true]
 * console.log(result[1]); // [2, 'b', false]
 * console.log(result[2]); // [3, 'c', true]
 */
var zip = function() {/* eslint-enable valid-jsdoc */
    var arr2d = aps.call(arguments);
    var result = [];

    collection.forEach(arr2d, function(arr) {
        collection.forEach(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });

    return result;
};

/**
 * Returns the first index at which a given element can be found in the array
 * from start index(default 0), or -1 if it is not present.<br>
 * It compares searchElement to elements of the Array using strict equality
 * (the same method used by the ===, or triple-equals, operator).
 * @param {*} searchElement Element to locate in the array
 * @param {Array} array Array that will be traversed.
 * @param {number} startIndex Start index in array for searching (default 0)
 * @returns {number} the First index at which a given element, or -1 if it is not present
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var arr = ['one', 'two', 'three', 'four'];
 * var idx1 = util.inArray('one', arr, 3); // -1
 * var idx2 = util.inArray('one', arr); // 0
 */
var inArray = function(searchElement, array, startIndex) {
    var i;
    var length;
    startIndex = startIndex || 0;

    if (!type.isArray(array)) {
        return -1;
    }

    if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(array, searchElement, startIndex);
    }

    length = array.length;
    for (i = startIndex; startIndex >= 0 && i < length; i += 1) {
        if (array[i] === searchElement) {
            return i;
        }
    }

    return -1;
};

util = {
    inArray: inArray,
    range: range,
    zip: zip
};

module.exports = util;

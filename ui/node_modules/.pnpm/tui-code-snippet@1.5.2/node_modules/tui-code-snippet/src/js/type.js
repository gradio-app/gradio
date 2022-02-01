/**
 * @fileoverview This module provides some functions to check the type of variable
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var toString = Object.prototype.toString;

/**
 * Check whether the given variable is existing or not.<br>
 *  If the given variable is not null and not undefined, returns true.
 * @param {*} param - Target for checking
 * @returns {boolean} Is existy?
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * util.isExisty(''); //true
 * util.isExisty(0); //true
 * util.isExisty([]); //true
 * util.isExisty({}); //true
 * util.isExisty(null); //false
 * util.isExisty(undefined); //false
*/
function isExisty(param) {
    return !isUndefined(param) && !isNull(param);
}

/**
 * Check whether the given variable is undefined or not.<br>
 *  If the given variable is undefined, returns true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is undefined?
 * @memberof tui.util
 */
function isUndefined(obj) {
    return obj === undefined; // eslint-disable-line no-undefined
}

/**
 * Check whether the given variable is null or not.<br>
 *  If the given variable(arguments[0]) is null, returns true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is null?
 * @memberof tui.util
 */
function isNull(obj) {
    return obj === null;
}

/**
 * Check whether the given variable is truthy or not.<br>
 *  If the given variable is not null or not undefined or not false, returns true.<br>
 *  (It regards 0 as true)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is truthy?
 * @memberof tui.util
 */
function isTruthy(obj) {
    return isExisty(obj) && obj !== false;
}

/**
 * Check whether the given variable is falsy or not.<br>
 *  If the given variable is null or undefined or false, returns true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is falsy?
 * @memberof tui.util
 */
function isFalsy(obj) {
    return !isTruthy(obj);
}

/**
 * Check whether the given variable is an arguments object or not.<br>
 *  If the given variable is an arguments object, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is arguments?
 * @memberof tui.util
 */
function isArguments(obj) {
    var result = isExisty(obj) &&
        ((toString.call(obj) === '[object Arguments]') || !!obj.callee);

    return result;
}

/**
 * Check whether the given variable is an instance of Array or not.<br>
 *  If the given variable is an instance of Array, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is array instance?
 * @memberof tui.util
 */
function isArray(obj) {
    return obj instanceof Array;
}

/**
 * Check whether the given variable is an object or not.<br>
 *  If the given variable is an object, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is object?
 * @memberof tui.util
 */
function isObject(obj) {
    return obj === Object(obj);
}

/**
 * Check whether the given variable is a function or not.<br>
 *  If the given variable is a function, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is function?
 * @memberof tui.util
 */
function isFunction(obj) {
    return obj instanceof Function;
}

/**
 * Check whether the given variable is a number or not.<br>
 *  If the given variable is a number, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is number?
 * @memberof tui.util
 */
function isNumber(obj) {
    return typeof obj === 'number' || obj instanceof Number;
}

/**
 * Check whether the given variable is a string or not.<br>
 *  If the given variable is a string, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is string?
 * @memberof tui.util
 */
function isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
}

/**
 * Check whether the given variable is a boolean or not.<br>
 *  If the given variable is a boolean, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is boolean?
 * @memberof tui.util
 */
function isBoolean(obj) {
    return typeof obj === 'boolean' || obj instanceof Boolean;
}

/**
 * Check whether the given variable is an instance of Array or not.<br>
 *  If the given variable is an instance of Array, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is an instance of array?
 * @memberof tui.util
 */
function isArraySafe(obj) {
    return toString.call(obj) === '[object Array]';
}

/**
 * Check whether the given variable is a function or not.<br>
 *  If the given variable is a function, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is a function?
 * @memberof tui.util
 */
function isFunctionSafe(obj) {
    return toString.call(obj) === '[object Function]';
}

/**
 * Check whether the given variable is a number or not.<br>
 *  If the given variable is a number, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is a number?
 * @memberof tui.util
 */
function isNumberSafe(obj) {
    return toString.call(obj) === '[object Number]';
}

/**
 * Check whether the given variable is a string or not.<br>
 *  If the given variable is a string, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is a string?
 * @memberof tui.util
 */
function isStringSafe(obj) {
    return toString.call(obj) === '[object String]';
}

/**
 * Check whether the given variable is a boolean or not.<br>
 *  If the given variable is a boolean, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is a boolean?
 * @memberof tui.util
 */
function isBooleanSafe(obj) {
    return toString.call(obj) === '[object Boolean]';
}

/**
 * Check whether the given variable is a instance of HTMLNode or not.<br>
 *  If the given variables is a instance of HTMLNode, return true.
 * @param {*} html - Target for checking
 * @returns {boolean} Is HTMLNode ?
 * @memberof tui.util
 */
function isHTMLNode(html) {
    if (typeof HTMLElement === 'object') {
        return (html && (html instanceof HTMLElement || !!html.nodeType));
    }

    return !!(html && html.nodeType);
}

/**
 * Check whether the given variable is a HTML tag or not.<br>
 *  If the given variables is a HTML tag, return true.
 * @param {*} html - Target for checking
 * @returns {Boolean} Is HTML tag?
 * @memberof tui.util
 */
function isHTMLTag(html) {
    if (typeof HTMLElement === 'object') {
        return (html && (html instanceof HTMLElement));
    }

    return !!(html && html.nodeType && html.nodeType === 1);
}

/**
 * Check whether the given variable is empty(null, undefined, or empty array, empty object) or not.<br>
 *  If the given variables is empty, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is empty?
 * @memberof tui.util
 */
function isEmpty(obj) {
    if (!isExisty(obj) || _isEmptyString(obj)) {
        return true;
    }

    if (isArray(obj) || isArguments(obj)) {
        return obj.length === 0;
    }

    if (isObject(obj) && !isFunction(obj)) {
        return !_hasOwnProperty(obj);
    }

    return true;
}

/**
 * Check whether given argument is empty string
 * @param {*} obj - Target for checking
 * @returns {boolean} whether given argument is empty string
 * @memberof tui.util
 * @private
 */
function _isEmptyString(obj) {
    return isString(obj) && obj === '';
}

/**
 * Check whether given argument has own property
 * @param {Object} obj - Target for checking
 * @returns {boolean} - whether given argument has own property
 * @memberof tui.util
 * @private
 */
function _hasOwnProperty(obj) {
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
}

/**
 * Check whether the given variable is not empty
 * (not null, not undefined, or not empty array, not empty object) or not.<br>
 *  If the given variables is not empty, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is not empty?
 * @memberof tui.util
 */
function isNotEmpty(obj) {
    return !isEmpty(obj);
}

/**
 * Check whether the given variable is an instance of Date or not.<br>
 *  If the given variables is an instance of Date, return true.
 * @param {*} obj - Target for checking
 * @returns {boolean} Is an instance of Date?
 * @memberof tui.util
 */
function isDate(obj) {
    return obj instanceof Date;
}

/**
 * Check whether the given variable is an instance of Date or not.<br>
 *  If the given variables is an instance of Date, return true.<br>
 *  (It is used for multiple frame environments)
 * @param {*} obj - Target for checking
 * @returns {boolean} Is an instance of Date?
 * @memberof tui.util
 */
function isDateSafe(obj) {
    return toString.call(obj) === '[object Date]';
}

module.exports = {
    isExisty: isExisty,
    isUndefined: isUndefined,
    isNull: isNull,
    isTruthy: isTruthy,
    isFalsy: isFalsy,
    isArguments: isArguments,
    isArray: isArray,
    isArraySafe: isArraySafe,
    isObject: isObject,
    isFunction: isFunction,
    isFunctionSafe: isFunctionSafe,
    isNumber: isNumber,
    isNumberSafe: isNumberSafe,
    isDate: isDate,
    isDateSafe: isDateSafe,
    isString: isString,
    isStringSafe: isStringSafe,
    isBoolean: isBoolean,
    isBooleanSafe: isBooleanSafe,
    isHTMLNode: isHTMLNode,
    isHTMLTag: isHTMLTag,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty
};


/**
 * @fileoverview
 *  Implements the Map object.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var collection = require('./collection');
var type = require('./type');
var array = require('./array');
var browser = require('./browser');
var func = require('./func');

/**
 * Using undefined for a key can be ambiguous if there's deleted item in the array,<br>
 * which is also undefined when accessed by index.<br>
 * So use this unique object as an undefined key to distinguish it from deleted keys.
 * @private
 * @constant
 */
var _KEY_FOR_UNDEFINED = {};

/**
 * For using NaN as a key, use this unique object as a NaN key.<br>
 * This makes it easier and faster to compare an object with each keys in the array<br>
 * through no exceptional comapring for NaN.
 * @private
 * @constant
 */
var _KEY_FOR_NAN = {};

/**
 * Constructor of MapIterator<br>
 * Creates iterator object with new keyword.
 * @constructor
 * @param  {Array} keys - The array of keys in the map
 * @param  {function} valueGetter - Function that returns certain value,
 *      taking key and keyIndex as arguments.
 * @ignore
 */
function MapIterator(keys, valueGetter) {
    this._keys = keys;
    this._valueGetter = valueGetter;
    this._length = this._keys.length;
    this._index = -1;
    this._done = false;
}

/**
 * Implementation of Iterator protocol.
 * @returns {{done: boolean, value: *}} Object that contains done(boolean) and value.
 */
MapIterator.prototype.next = function() {
    var data = {};
    do {
        this._index += 1;
    } while (type.isUndefined(this._keys[this._index]) && this._index < this._length);

    if (this._index >= this._length) {
        data.done = true;
    } else {
        data.done = false;
        data.value = this._valueGetter(this._keys[this._index], this._index);
    }

    return data;
};

/**
 * The Map object implements the ES6 Map specification as closely as possible.<br>
 * For using objects and primitive values as keys, this object uses array internally.<br>
 * So if the key is not a string, get(), set(), has(), delete() will operates in O(n),<br>
 * and it can cause performance issues with a large dataset.
 *
 * Features listed below are not supported. (can't be implented without native support)
 * - Map object is iterable<br>
 * - Iterable object can be used as an argument of constructor
 *
 * If the browser supports full implementation of ES6 Map specification, native Map obejct
 * will be used internally.
 * @class
 * @param  {Array} initData - Array of key-value pairs (2-element Arrays).
 *      Each key-value pair will be added to the new Map
 * @memberof tui.util
 * @example
 * // node, commonjs
 * var Map = require('tui-code-snippet').Map;
 * @example
 * // distribution file, script
 * <script src='path-to/tui-code-snippt.js'></script>
 * <script>
 * var Map = tui.util.Map;
 * <script>
 */
function Map(initData) {
    this._valuesForString = {};
    this._valuesForIndex = {};
    this._keys = [];

    if (initData) {
        this._setInitData(initData);
    }

    this.size = 0;
}

/* eslint-disable no-extend-native */
/**
 * Add all elements in the initData to the Map object.
 * @private
 * @param  {Array} initData - Array of key-value pairs to add to the Map object
 */
Map.prototype._setInitData = function(initData) {
    if (!type.isArray(initData)) {
        throw new Error('Only Array is supported.');
    }
    collection.forEachArray(initData, function(pair) {
        this.set(pair[0], pair[1]);
    }, this);
};

/**
 * Returns true if the specified value is NaN.<br>
 * For unsing NaN as a key, use this method to test equality of NaN<br>
 * because === operator doesn't work for NaN.
 * @private
 * @param {*} value - Any object to be tested
 * @returns {boolean} True if value is NaN, false otherwise.
 */
Map.prototype._isNaN = function(value) {
    return typeof value === 'number' && value !== value; // eslint-disable-line no-self-compare
};

/**
 * Returns the index of the specified key.
 * @private
 * @param  {*} key - The key object to search for.
 * @returns {number} The index of the specified key
 */
Map.prototype._getKeyIndex = function(key) {
    var result = -1;
    var value;

    if (type.isString(key)) {
        value = this._valuesForString[key];
        if (value) {
            result = value.keyIndex;
        }
    } else {
        result = array.inArray(key, this._keys);
    }

    return result;
};

/**
 * Returns the original key of the specified key.
 * @private
 * @param  {*} key - key
 * @returns {*} Original key
 */
Map.prototype._getOriginKey = function(key) {
    var originKey = key;
    if (key === _KEY_FOR_UNDEFINED) {
        originKey = undefined; // eslint-disable-line no-undefined
    } else if (key === _KEY_FOR_NAN) {
        originKey = NaN;
    }

    return originKey;
};

/**
 * Returns the unique key of the specified key.
 * @private
 * @param  {*} key - key
 * @returns {*} Unique key
 */
Map.prototype._getUniqueKey = function(key) {
    var uniqueKey = key;
    if (type.isUndefined(key)) {
        uniqueKey = _KEY_FOR_UNDEFINED;
    } else if (this._isNaN(key)) {
        uniqueKey = _KEY_FOR_NAN;
    }

    return uniqueKey;
};

/**
 * Returns the value object of the specified key.
 * @private
 * @param  {*} key - The key of the value object to be returned
 * @param  {number} keyIndex - The index of the key
 * @returns {{keyIndex: number, origin: *}} Value object
 */
Map.prototype._getValueObject = function(key, keyIndex) { // eslint-disable-line consistent-return
    if (type.isString(key)) {
        return this._valuesForString[key];
    }

    if (type.isUndefined(keyIndex)) {
        keyIndex = this._getKeyIndex(key);
    }
    if (keyIndex >= 0) {
        return this._valuesForIndex[keyIndex];
    }
};

/**
 * Returns the original value of the specified key.
 * @private
 * @param  {*} key - The key of the value object to be returned
 * @param  {number} keyIndex - The index of the key
 * @returns {*} Original value
 */
Map.prototype._getOriginValue = function(key, keyIndex) {
    return this._getValueObject(key, keyIndex).origin;
};

/**
 * Returns key-value pair of the specified key.
 * @private
 * @param  {*} key - The key of the value object to be returned
 * @param  {number} keyIndex - The index of the key
 * @returns {Array} Key-value Pair
 */
Map.prototype._getKeyValuePair = function(key, keyIndex) {
    return [this._getOriginKey(key), this._getOriginValue(key, keyIndex)];
};

/**
 * Creates the wrapper object of original value that contains a key index
 * and returns it.
 * @private
 * @param  {type} origin - Original value
 * @param  {type} keyIndex - Index of the key
 * @returns {{keyIndex: number, origin: *}} Value object
 */
Map.prototype._createValueObject = function(origin, keyIndex) {
    return {
        keyIndex: keyIndex,
        origin: origin
    };
};

/**
 * Sets the value for the key in the Map object.
 * @param  {*} key - The key of the element to add to the Map object
 * @param  {*} value - The value of the element to add to the Map object
 * @returns {Map} The Map object
 */
Map.prototype.set = function(key, value) {
    var uniqueKey = this._getUniqueKey(key);
    var keyIndex = this._getKeyIndex(uniqueKey);
    var valueObject;

    if (keyIndex < 0) {
        keyIndex = this._keys.push(uniqueKey) - 1;
        this.size += 1;
    }
    valueObject = this._createValueObject(value, keyIndex);

    if (type.isString(key)) {
        this._valuesForString[key] = valueObject;
    } else {
        this._valuesForIndex[keyIndex] = valueObject;
    }

    return this;
};

/**
 * Returns the value associated to the key, or undefined if there is none.
 * @param  {*} key - The key of the element to return
 * @returns {*} Element associated with the specified key
 */
Map.prototype.get = function(key) {
    var uniqueKey = this._getUniqueKey(key);
    var value = this._getValueObject(uniqueKey);

    return value && value.origin;
};

/**
 * Returns a new Iterator object that contains the keys for each element
 * in the Map object in insertion order.
 * @returns {Iterator} A new Iterator object
 */
Map.prototype.keys = function() {
    return new MapIterator(this._keys, func.bind(this._getOriginKey, this));
};

/**
 * Returns a new Iterator object that contains the values for each element
 * in the Map object in insertion order.
 * @returns {Iterator} A new Iterator object
 */
Map.prototype.values = function() {
    return new MapIterator(this._keys, func.bind(this._getOriginValue, this));
};

/**
 * Returns a new Iterator object that contains the [key, value] pairs
 * for each element in the Map object in insertion order.
 * @returns {Iterator} A new Iterator object
 */
Map.prototype.entries = function() {
    return new MapIterator(this._keys, func.bind(this._getKeyValuePair, this));
};

/**
 * Returns a boolean asserting whether a value has been associated to the key
 * in the Map object or not.
 * @param  {*} key - The key of the element to test for presence
 * @returns {boolean} True if an element with the specified key exists;
 *          Otherwise false
 */
Map.prototype.has = function(key) {
    return !!this._getValueObject(key);
};

/**
 * Removes the specified element from a Map object.
 * @param {*} key - The key of the element to remove
 * @function delete
 * @memberof tui.util.Map.prototype
 */
// cannot use reserved keyword as a property name in IE8 and under.
Map.prototype['delete'] = function(key) {
    var keyIndex;

    if (type.isString(key)) {
        if (this._valuesForString[key]) {
            keyIndex = this._valuesForString[key].keyIndex;
            delete this._valuesForString[key];
        }
    } else {
        keyIndex = this._getKeyIndex(key);
        if (keyIndex >= 0) {
            delete this._valuesForIndex[keyIndex];
        }
    }

    if (keyIndex >= 0) {
        delete this._keys[keyIndex];
        this.size -= 1;
    }
};

/**
 * Executes a provided function once per each key/value pair in the Map object,
 * in insertion order.
 * @param  {function} callback - Function to execute for each element
 * @param  {thisArg} thisArg - Value to use as this when executing callback
 */
Map.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || this;
    collection.forEachArray(this._keys, function(key) {
        if (!type.isUndefined(key)) {
            callback.call(thisArg, this._getValueObject(key).origin, key, this);
        }
    }, this);
};

/**
 * Removes all elements from a Map object.
 */
Map.prototype.clear = function() {
    Map.call(this);
};
/* eslint-enable no-extend-native */

// Use native Map object if exists.
// But only latest versions of Chrome and Firefox support full implementation.
(function() {
    if (window.Map && (
        (browser.firefox && browser.version >= 37) ||
            (browser.chrome && browser.version >= 42)
    )
    ) {
        Map = window.Map; // eslint-disable-line no-func-assign
    }
})();

module.exports = Map;

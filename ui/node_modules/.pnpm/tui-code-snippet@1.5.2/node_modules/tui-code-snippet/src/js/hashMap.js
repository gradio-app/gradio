/**
 * @fileoverview This module provides the HashMap constructor.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var collection = require('./collection');
var type = require('./type');
/**
 * All the data in hashMap begin with _MAPDATAPREFIX;
 * @type {string}
 * @private
 */
var _MAPDATAPREFIX = 'å';

/**
 * HashMap can handle the key-value pairs.<br>
 * Caution:<br>
 *  HashMap instance has a length property but is not an instance of Array.
 * @param {Object} [obj] A initial data for creation.
 * @constructor
 * @memberof tui.util
 * @deprecated since version 1.3.0
 * @example
 * // node, commonjs
 * var HashMap = require('tui-code-snippet').HashMap;
 * var hm = new tui.util.HashMap({
  'mydata': {
    'hello': 'imfine'
  },
  'what': 'time'
});
 * @example
 * // distribution file, script
 * <script src='path-to/tui-code-snippt.js'></script>
 * <script>
 * var HashMap = tui.util.HashMap;
 * <script>
 * var hm = new tui.util.HashMap({
  'mydata': {
    'hello': 'imfine'
  },
  'what': 'time'
});
 */
function HashMap(obj) {
    /**
     * size
     * @type {number}
     */
    this.length = 0;

    if (obj) {
        this.setObject(obj);
    }
}

/**
 * Set a data from the given key with value or the given object.
 * @param {string|Object} key A string or object for key
 * @param {*} [value] A data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.set({
 *     'key1': 'data1',
 *     'key2': 'data2'
 * });
 */
HashMap.prototype.set = function(key, value) {
    if (arguments.length === 2) {
        this.setKeyValue(key, value);
    } else {
        this.setObject(key);
    }
};

/**
 * Set a data from the given key with value.
 * @param {string} key A string for key
 * @param {*} value A data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.setKeyValue('key', 'value');
 */
HashMap.prototype.setKeyValue = function(key, value) {
    if (!this.has(key)) {
        this.length += 1;
    }
    this[this.encodeKey(key)] = value;
};

/**
 * Set a data from the given object.
 * @param {Object} obj A object for data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.setObject({
 *     'key1': 'data1',
 *     'key2': 'data2'
 * });
 */
HashMap.prototype.setObject = function(obj) {
    var self = this;

    collection.forEachOwnProperties(obj, function(value, key) {
        self.setKeyValue(key, value);
    });
};

/**
 * Merge with the given another hashMap.
 * @param {HashMap} hashMap Another hashMap instance
 */
HashMap.prototype.merge = function(hashMap) {
    var self = this;

    hashMap.each(function(value, key) {
        self.setKeyValue(key, value);
    });
};

/**
 * Encode the given key for hashMap.
 * @param {string} key A string for key
 * @returns {string} A encoded key
 * @private
 */
HashMap.prototype.encodeKey = function(key) {
    return _MAPDATAPREFIX + key;
};

/**
 * Decode the given key in hashMap.
 * @param {string} key A string for key
 * @returns {string} A decoded key
 * @private
 */
HashMap.prototype.decodeKey = function(key) {
    var decodedKey = key.split(_MAPDATAPREFIX);

    return decodedKey[decodedKey.length - 1];
};

/**
 * Return the value from the given key.
 * @param {string} key A string for key
 * @returns {*} The value from a key
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.get('key') // value
 */
HashMap.prototype.get = function(key) {
    return this[this.encodeKey(key)];
};

/**
 * Check the existence of a value from the key.
 * @param {string} key A string for key
 * @returns {boolean} Indicating whether a value exists or not.
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.has('key') // true
 */
HashMap.prototype.has = function(key) {
    return this.hasOwnProperty(this.encodeKey(key));
};

/**
 * Remove a data(key-value pairs) from the given key or the given key-list.
 * @param {...string|string[]} key A string for key
 * @returns {string|string[]} A removed data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.set('key2', 'value');
 *
 * hm.remove('key');
 * hm.remove('key', 'key2');
 * hm.remove(['key', 'key2']);
 */
HashMap.prototype.remove = function(key) {
    if (arguments.length > 1) {
        key = collection.toArray(arguments);
    }

    return type.isArray(key) ? this.removeByKeyArray(key) : this.removeByKey(key);
};

/**
 * Remove data(key-value pair) from the given key.
 * @param {string} key A string for key
 * @returns {*|null} A removed data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.removeByKey('key')
 */
HashMap.prototype.removeByKey = function(key) {
    var data = this.has(key) ? this.get(key) : null;

    if (data !== null) {
        delete this[this.encodeKey(key)];
        this.length -= 1;
    }

    return data;
};

/**
 * Remove a data(key-value pairs) from the given key-list.
 * @param {string[]} keyArray An array of keys
 * @returns {string[]} A removed data
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.set('key2', 'value');
 * hm.removeByKeyArray(['key', 'key2']);
 */
HashMap.prototype.removeByKeyArray = function(keyArray) {
    var data = [];
    var self = this;

    collection.forEach(keyArray, function(key) {
        data.push(self.removeByKey(key));
    });

    return data;
};

/**
 * Remove all the data
 */
HashMap.prototype.removeAll = function() {
    var self = this;

    this.each(function(value, key) {
        self.remove(key);
    });
};

/**
 * Execute the provided callback once for each all the data.
 * @param {Function} iteratee Callback function
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm = new HashMap();
 * hm.set('key', 'value');
 * hm.set('key2', 'value');
 *
 * hm.each(function(value, key) {
 *     //do something...
 * });
 */
HashMap.prototype.each = function(iteratee) {
    var self = this;
    var flag;

    collection.forEachOwnProperties(this, function(value, key) { // eslint-disable-line consistent-return
        if (key.charAt(0) === _MAPDATAPREFIX) {
            flag = iteratee(value, self.decodeKey(key));
        }

        if (flag === false) {
            return flag;
        }
    });
};

/**
 * Return the key-list stored.
 * @returns {Array} A key-list
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 *  var hm = new HashMap();
 *  hm.set('key', 'value');
 *  hm.set('key2', 'value');
 *  hm.keys();  //['key', 'key2');
 */
HashMap.prototype.keys = function() {
    var keys = [];
    var self = this;

    this.each(function(value, key) {
        keys.push(self.decodeKey(key));
    });

    return keys;
};

/**
 * Work similarly to Array.prototype.map().<br>
 * It executes the provided callback that checks conditions once for each element of hashMap,<br>
 *  and returns a new array having elements satisfying the conditions
 * @param {Function} condition A function that checks conditions
 * @returns {Array} A new array having elements satisfying the conditions
 * @example
 * //-- #1. Get Module --//
 * var HashMap = require('tui-code-snippet').HashMap; // node, commonjs
 * var HashMap = tui.util.HashMap; // distribution file
 *
 * //-- #2. Use property --//
 * var hm1 = new HashMap();
 * hm1.set('key', 'value');
 * hm1.set('key2', 'value');
 *
 * hm1.find(function(value, key) {
 *     return key === 'key2';
 * }); // ['value']
 *
 * var hm2 = new HashMap({
 *     'myobj1': {
 *         visible: true
 *     },
 *     'mybobj2': {
 *         visible: false
 *     }
 * });
 *
 * hm2.find(function(obj, key) {
 *     return obj.visible === true;
 * }); // [{visible: true}];
 */
HashMap.prototype.find = function(condition) {
    var founds = [];

    this.each(function(value, key) {
        if (condition(value, key)) {
            founds.push(value);
        }
    });

    return founds;
};

/**
 * Return a new Array having all values.
 * @returns {Array} A new array having all values
 */
HashMap.prototype.toArray = function() {
    var result = [];

    this.each(function(v) {
        result.push(v);
    });

    return result;
};

module.exports = HashMap;

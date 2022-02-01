/**
 * @fileoverview Define namespace
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 * @dependency object.js, collection.js
 */

'use strict';

var collection = require('./collection');
var object = require('./object');

/**
 * Define namespace
 * @param {string} namespace - Namespace (ex- 'foo.bar.baz')
 * @param {(object|function)} props - A set of modules or one module
 * @param {boolean} [isOverride] - Override the props to the namespace.<br>
 *                                  (It removes previous properties of this namespace)
 * @returns {(object|function)} Defined namespace
 * @memberof tui.util
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var neComp = util.defineNamespace;
 * neComp.listMenu = defineClass({
 *     init: function() {
 *         // ...
 *     }
 * });
 */
function defineNamespace(namespace, props, isOverride) {
    var names, result, prevLast, last;

    names = namespace.split('.');
    names.unshift(window);

    result = collection.reduce(names, function(obj, name) {
        obj[name] = obj[name] || {};

        return obj[name];
    });

    if (isOverride) {
        last = names.pop();
        prevLast = object.pick.apply(null, names);
        result = prevLast[last] = props;
    } else {
        object.extend(result, props);
    }

    return result;
}

module.exports = defineNamespace;

/**
 * @fileoverview Define module
 * @author NHN.
 *         FE Development Lab <dl_javscript@nhn.com>
 * @dependency type.js, defineNamespace.js
 */

'use strict';

var defineNamespace = require('./defineNamespace');
var type = require('./type');

var INITIALIZATION_METHOD_NAME = 'initialize';

/**
 * Define module
 * @param {string} namespace - Namespace of module
 * @param {Object} moduleDefinition - Object literal for module
 * @returns {Object} Defined module
 * @memberof tui.util
 * @example
  * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * var myModule = util.defineModule('modules.myModule', {
 *     name: 'john',
 *     message: '',
 *     initialize: function() {
 *        this.message = 'hello world';
 *     },
 *     getMessage: function() {
 *         return this.name + ': ' + this.message
 *     }
 * });
 *
 * console.log(myModule.getMessage());  // 'john: hello world';
 */
function defineModule(namespace, moduleDefinition) {
    var base = moduleDefinition || {};

    if (type.isFunction(base[INITIALIZATION_METHOD_NAME])) {
        base[INITIALIZATION_METHOD_NAME]();
    }

    return defineNamespace(namespace, base);
}

module.exports = defineModule;

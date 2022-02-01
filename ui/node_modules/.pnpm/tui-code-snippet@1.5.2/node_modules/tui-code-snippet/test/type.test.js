/* eslint-disable no-undef-init */
/* eslint-disable no-undefined */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-new-func */
/* eslint-disable no-new-object */

'use strict';

var type = require('../src/js/type');
var tui = {
    util: type
};

describe('type', function() {
    it('isExisty() 값이 존재하는지 확인', function() {
        // null과 undefined이 아닐경우 값이 존재한다고 판단한다.
        var o1 = null,
            o2 = 3,
            o3 = 0,
            o4 = {},
            o5 = false,
            o6 = isNaN,
            o7,
            o8 = '';

        expect(tui.util.isExisty(o1)).toBe(false);
        expect(tui.util.isExisty(o2)).toBe(true);
        expect(tui.util.isExisty(o3)).toBe(true);
        expect(tui.util.isExisty(o4.test)).toBe(false);
        expect(tui.util.isExisty(o5)).toBe(true);
        expect(tui.util.isExisty(o6)).toBe(true);
        expect(tui.util.isExisty(o7)).toBe(false);
        expect(tui.util.isExisty(o8)).toBe(true);
    });

    it('isUndefined() 값이 undefined인지 확인', function() {
        var o1 = 0,
            o2 = false,
            o3 = '',
            o4 = null,
            o5;
        expect(tui.util.isUndefined(o1)).toBe(false);
        expect(tui.util.isUndefined(o2)).toBe(false);
        expect(tui.util.isUndefined(o3)).toBe(false);
        expect(tui.util.isUndefined(o4)).toBe(false);
        expect(tui.util.isUndefined(o5)).toBe(true);
    });

    it('isNull() 값이 null인지 확인', function() {
        var o1 = 0,
            o2 = false,
            o3 = '',
            o4 = null,
            o5;
        expect(tui.util.isNull(o1)).toBe(false);
        expect(tui.util.isNull(o2)).toBe(false);
        expect(tui.util.isNull(o3)).toBe(false);
        expect(tui.util.isNull(o4)).toBe(true);
        expect(tui.util.isNull(o5)).toBe(false);
    });

    it('isTruthy() undefined, null, false가 아닌 값인지 확인', function() {
        var o1 = 0,
            o2 = false,
            o3 = '',
            o4 = null,
            o5;

        expect(tui.util.isTruthy(o1)).toBe(true);
        expect(tui.util.isTruthy(o2)).toBe(false);
        expect(tui.util.isTruthy(o3)).toBe(true);
        expect(tui.util.isTruthy(o4)).toBe(false);
        expect(tui.util.isTruthy(o5)).toBe(false);
    });

    it('isFalsy() isTruthy에 해당하지 않는 값인지 확인', function() {
        var o1 = 0,
            o2 = false,
            o3 = '',
            o4 = null,
            o5;

        expect(tui.util.isFalsy(o1)).toBe(false);
        expect(tui.util.isFalsy(o2)).toBe(true);
        expect(tui.util.isFalsy(o3)).toBe(false);
        expect(tui.util.isFalsy(o4)).toBe(true);
        expect(tui.util.isFalsy(o5)).toBe(true);
    });

    it('isArguments()', function() {
        var o1,
            o2 = [];

        (function() {
            o1 = arguments;
        })();

        expect(tui.util.isArguments(o1)).toBe(true);
        expect(tui.util.isArguments(o2)).toBe(false);
    });

    it('isArray()', function() {
        var o1 = new Array(3),
            o2 = [],
            o3 = 'array',
            o4 = 3,
            o5 = function() {},
            o6 = new Object(),
            o7 = {};

        expect(tui.util.isArray(o1)).toBe(true);
        expect(tui.util.isArray(o2)).toBe(true);
        expect(tui.util.isArray(o3)).toBe(false);
        expect(tui.util.isArray(o4)).toBe(false);
        expect(tui.util.isArray(o5)).toBe(false);
        expect(tui.util.isArray(o6)).toBe(false);
        expect(tui.util.isArray(o7)).toBe(false);
    });

    it('isObject()', function() {
        var o1 = new Object(),
            o2 = {},
            o3 = {test: {}},
            o4 = 'a',
            O5 = function() {},
            o6 = new O5(),
            o7 = /xyz/g,
            o8 = new Date(),
            o9 = new Function('x', 'y', 'return x + y');

        expect(tui.util.isObject(o1)).toBe(true);
        expect(tui.util.isObject(o2)).toBe(true);
        expect(tui.util.isObject(o3.test)).toBe(true);
        expect(tui.util.isObject(o4)).toBe(false);
        expect(tui.util.isObject(O5)).toBe(true);
        expect(tui.util.isObject(o6)).toBe(true);
        expect(tui.util.isObject(o7)).toBe(true);
        expect(tui.util.isObject(o8)).toBe(true);
        expect(tui.util.isObject(o9)).toBe(true);
    });

    it('isFunction()', function() {
        var o1 = function() {},
            o2 = {},
            o3 = '',
            o4 = [],
            o5 = 1,
            o6 = true,
            o7 = /xyz/g,
            o8 = new Function(),
            o9 = function o9() {};

        expect(tui.util.isFunction(o1)).toBe(true);
        expect(tui.util.isFunction(o2)).toBe(false);
        expect(tui.util.isFunction(o3)).toBe(false);
        expect(tui.util.isFunction(o4)).toBe(false);
        expect(tui.util.isFunction(o5)).toBe(false);
        expect(tui.util.isFunction(o6)).toBe(false);
        expect(tui.util.isFunction(o7)).toBe(false);
        expect(tui.util.isFunction(o8)).toBe(true);
        expect(tui.util.isFunction(o9)).toBe(true);
    });

    it('isNumber()', function() {
        var o1 = 1,
            o2 = new Number(2),
            o3 = {test: 1},
            o4 = [],
            o5 = 'string',
            o6 = true,
            o7 = /xyz/g,
            o8 = 4 + 5,
            o9 = parseFloat('12.5'),
            o10 = 0x15,
            o11 = parseInt('00101', 2);

        expect(tui.util.isNumber(o1)).toBe(true);
        expect(tui.util.isNumber(o2)).toBe(true);
        expect(tui.util.isNumber(o3.test)).toBe(true);
        expect(tui.util.isNumber(o3)).toBe(false);
        expect(tui.util.isNumber(o4)).toBe(false);
        expect(tui.util.isNumber(o5)).toBe(false);
        expect(tui.util.isNumber(o6)).toBe(false);
        expect(tui.util.isNumber(o7)).toBe(false);
        expect(tui.util.isNumber(o8)).toBe(true);
        expect(tui.util.isNumber(o9)).toBe(true);
        expect(tui.util.isNumber(o10)).toBe(true);
        expect(tui.util.isNumber(o11)).toBe(true);
    });

    it('isString()', function() {
        var o1 = {},
            o2 = new String('a'),
            o3 = 'string',
            o4 = [],
            o5 = '',
            o6 = true,
            o7 = /xyz/g;

        expect(tui.util.isString(o1)).toBe(false);
        expect(tui.util.isString(o2)).toBe(true);
        expect(tui.util.isString(o3)).toBe(true);
        expect(tui.util.isString(o4)).toBe(false);
        expect(tui.util.isString(o5)).toBe(true);
        expect(tui.util.isString(o6)).toBe(false);
        expect(tui.util.isString(o7)).toBe(false);
    });

    it('isBoolean()', function() {
        var o1 = {},
            o2 = new Boolean('true'),
            o3 = 1,
            o4 = true,
            o5 = false,
            o6 = undefined,
            o7 = null;

        expect(tui.util.isBoolean(o1)).toBe(false);
        expect(tui.util.isBoolean(o2)).toBe(true);
        expect(tui.util.isBoolean(o3)).toBe(false);
        expect(tui.util.isBoolean(o4)).toBe(true);
        expect(tui.util.isBoolean(o5)).toBe(true);
        expect(tui.util.isBoolean(o6)).toBe(false);
        expect(tui.util.isBoolean(o7)).toBe(false);
    });

    it('isArraySafe()', function() {
        var o1 = new Array(3),
            o2 = [],
            o3 = 'array',
            o4 = 3,
            o5 = function() {},
            o6 = new Object(),
            o7 = {};

        expect(tui.util.isArraySafe(o1)).toBe(true);
        expect(tui.util.isArraySafe(o2)).toBe(true);
        expect(tui.util.isArraySafe(o3)).toBe(false);
        expect(tui.util.isArraySafe(o4)).toBe(false);
        expect(tui.util.isArraySafe(o5)).toBe(false);
        expect(tui.util.isArraySafe(o6)).toBe(false);
        expect(tui.util.isArraySafe(o7)).toBe(false);
    });

    it('isFunctionSafe()', function() {
        var o1 = function() {},
            o2 = {},
            o3 = '',
            o4 = [],
            o5 = 1,
            o6 = true,
            o7 = /xyz/g,
            o8 = new Function(),
            o9 = function o9() {};

        expect(tui.util.isFunctionSafe(o1)).toBe(true);
        expect(tui.util.isFunctionSafe(o2)).toBe(false);
        expect(tui.util.isFunctionSafe(o3)).toBe(false);
        expect(tui.util.isFunctionSafe(o4)).toBe(false);
        expect(tui.util.isFunctionSafe(o5)).toBe(false);
        expect(tui.util.isFunctionSafe(o6)).toBe(false);
        expect(tui.util.isFunctionSafe(o7)).toBe(false);
        expect(tui.util.isFunctionSafe(o8)).toBe(true);
        expect(tui.util.isFunctionSafe(o9)).toBe(true);
    });

    it('isNumberSafe()', function() {
        var o1 = 1,
            o2 = new Number(2),
            o3 = {test: 1},
            o4 = [],
            o5 = 'string',
            o6 = true,
            o7 = /xyz/g,
            o8 = 4 + 5,
            o9 = parseFloat('12.5'),
            o10 = 0x15,
            o11 = parseInt('00101', 2);

        expect(tui.util.isNumberSafe(o1)).toBe(true);
        expect(tui.util.isNumberSafe(o2)).toBe(true);
        expect(tui.util.isNumberSafe(o3.test)).toBe(true);
        expect(tui.util.isNumberSafe(o3)).toBe(false);
        expect(tui.util.isNumberSafe(o4)).toBe(false);
        expect(tui.util.isNumberSafe(o5)).toBe(false);
        expect(tui.util.isNumberSafe(o6)).toBe(false);
        expect(tui.util.isNumberSafe(o7)).toBe(false);
        expect(tui.util.isNumberSafe(o8)).toBe(true);
        expect(tui.util.isNumberSafe(o9)).toBe(true);
        expect(tui.util.isNumberSafe(o10)).toBe(true);
        expect(tui.util.isNumberSafe(o11)).toBe(true);
    });

    it('isStringSafe()', function() {
        var o1 = {},
            o2 = new String('a'),
            o3 = 'string',
            o4 = [],
            o5 = '',
            o6 = true,
            o7 = /xyz/g;

        expect(tui.util.isStringSafe(o1)).toBe(false);
        expect(tui.util.isStringSafe(o2)).toBe(true);
        expect(tui.util.isStringSafe(o3)).toBe(true);
        expect(tui.util.isStringSafe(o4)).toBe(false);
        expect(tui.util.isStringSafe(o5)).toBe(true);
        expect(tui.util.isStringSafe(o6)).toBe(false);
        expect(tui.util.isStringSafe(o7)).toBe(false);
    });

    it('isBooleanSafe()', function() {
        var o1 = {},
            o2 = new Boolean('true'),
            o3 = 1,
            o4 = true,
            o5 = false,
            o6 = undefined,
            o7 = null;

        expect(tui.util.isBooleanSafe(o1)).toBe(false);
        expect(tui.util.isBooleanSafe(o2)).toBe(true);
        expect(tui.util.isBooleanSafe(o3)).toBe(false);
        expect(tui.util.isBooleanSafe(o4)).toBe(true);
        expect(tui.util.isBooleanSafe(o5)).toBe(true);
        expect(tui.util.isBooleanSafe(o6)).toBe(false);
        expect(tui.util.isBooleanSafe(o7)).toBe(false);
    });

    it('isHTMLNode() DOM인지 확인', function() {
        var text = document.createTextNode('Hello World'),
            el1 = document.createElement('H1'),
            el2 = document.createElement('A'),
            el3 = document.createElement('SPAN'),
            el4 = document.createElement('P'),
            el5 = document.createElement('PRE'),
            el6 = document.createElement('DIV'),
            el7 = document.createElement('INPUT'),
            myObj = 3,
            testObj = {};

        expect(tui.util.isHTMLNode(el1)).toBe(true);
        expect(tui.util.isHTMLNode(el2)).toBe(true);
        expect(tui.util.isHTMLNode(el3)).toBe(true);
        expect(tui.util.isHTMLNode(el4)).toBe(true);
        expect(tui.util.isHTMLNode(el5)).toBe(true);
        expect(tui.util.isHTMLNode(el6)).toBe(true);
        expect(tui.util.isHTMLNode(el7)).toBe(true);
        expect(tui.util.isHTMLNode(text)).toBe(true);
        expect(tui.util.isHTMLNode(myObj)).toBe(false);
        expect(tui.util.isHTMLNode(testObj)).toBe(false);
    });

    it('isHTMLTag() HTML element 인지 확인', function() {
        var text = document.createTextNode('Hello World'),
            el1 = document.createElement('H1'),
            el2 = document.createElement('A'),
            el3 = document.createElement('SPAN'),
            el4 = document.createElement('P'),
            el5 = document.createElement('PRE'),
            el6 = document.createElement('DIV'),
            el7 = document.createElement('INPUT'),
            myObj = 3,
            testObj = {};

        expect(tui.util.isHTMLTag(el1)).toBe(true);
        expect(tui.util.isHTMLTag(el2)).toBe(true);
        expect(tui.util.isHTMLTag(el3)).toBe(true);
        expect(tui.util.isHTMLTag(el4)).toBe(true);
        expect(tui.util.isHTMLTag(el5)).toBe(true);
        expect(tui.util.isHTMLTag(el6)).toBe(true);
        expect(tui.util.isHTMLTag(el7)).toBe(true);

        expect(tui.util.isHTMLTag(text)).toBe(false);
        expect(tui.util.isHTMLTag(myObj)).toBe(false);
        expect(tui.util.isHTMLTag(testObj)).toBe(false);
    });

    it('isEmpty()', function() {
        var o1 = {},
            o2 = {test: 1},
            o3 = new Object(),
            o4 = [],
            o5 = new Array(),
            o6 = [1, 3],
            o7 = function() {},
            o8,
            o9 = undefined,
            o10 = null,
            o11;

        (function() {
            o8 = arguments;
        })(2, 4);

        (function() {
            o11 = arguments;
        })();

        expect(tui.util.isEmpty(o1)).toBe(true);
        expect(tui.util.isEmpty(o2)).toBe(false);
        expect(tui.util.isEmpty(o3)).toBe(true);
        expect(tui.util.isEmpty(o4)).toBe(true);
        expect(tui.util.isEmpty(o5)).toBe(true);
        expect(tui.util.isEmpty(o6)).toBe(false);
        expect(tui.util.isEmpty(o7)).toBe(true);
        expect(tui.util.isEmpty(o8)).toBe(false);
        expect(tui.util.isEmpty(o9)).toBe(true);
        expect(tui.util.isEmpty(o10)).toBe(true);
        expect(tui.util.isEmpty(o11)).toBe(true);
    });
});

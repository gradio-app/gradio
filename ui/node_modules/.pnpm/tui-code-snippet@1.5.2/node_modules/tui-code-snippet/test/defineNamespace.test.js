/* eslint-disable no-undef */

'use strict';

var defineNamespace = require('../src/js/defineNamespace');
var type = require('../src/js/type');

describe('defineNamespace', function() {
    it('define', function() {
        defineNamespace('aaa.bbb.ccc');
        expect(aaa).toBeDefined();
        expect(aaa.bbb).toBeDefined();
        expect(aaa.bbb.ccc).toBeDefined();
    });

    it('not define', function() {
        defineNamespace('aaa.bbb');
        expect(aaa.bbb.ddd).not.toBeDefined();
    });

    it('with props', function() {
        var num = 0;
        defineNamespace('asdf', {
            exec: function() {
                num += 10;
            }
        });

        asdf.exec();
        expect(num).toBe(10);
    });

    it('function', function() {
        var num = 0;
        defineNamespace('fdsa', function() {
            num += 100;
        }, true);

        fdsa();
        expect(num).toBe(100);
    });

    it('for class', function() {
        var name = 'nhn';
        var mInstance;

        defineNamespace('asdf.nhn', function() {
            this.name = name;
            this.getName = function() {
                return this.name;
            };
        }, true);
        mInstance = new asdf.nhn();

        expect(mInstance.getName()).toBe(name);
    });

    it('override', function() {
        defineNamespace('asdf.over');

        expect(asdf.over).toBeDefined();
        expect(asdf.over.exec).not.toBeDefined();

        defineNamespace('asdf.over', {
            exec: function() {}
        }, true);
        expect(asdf.over.exec).toBeDefined();
    });

    it('invalid props type', function() {
        defineNamespace('asdf.hello', 'hello world');
        expect(asdf.hello).toBeDefined();
        expect(type.isString(asdf.hello)).toBeFalsy();
    });

    it('define double', function() {
        var feCom = defineNamespace('fe.component'),
            feDouble = defineNamespace('fe.component');

        expect(feCom).toBe(feDouble);
    });

    it('define double other depth', function() {
        var feCom = defineNamespace('fe.comp');
        defineNamespace('fe.comp.team');

        expect(feCom).toBe(fe.comp);
        expect(feCom.team).toBe(fe.comp.team);
    });

    it('should extend if exist', function() {
        var tester = {
            method: function() {}
        };

        defineNamespace('foo.bar.baz');
        expect(window.foo.bar.baz).toEqual(jasmine.any(Object));

        defineNamespace('foo.bar', tester);
        expect(window.foo.bar.method).toEqual(tester.method);
    });
});

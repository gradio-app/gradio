/* eslint-disable no-undefined */

'use strict';

var Map = require('../src/js/map');

describe('module:Map', function() {
    var map;

    beforeEach(function() {
        map = new Map();
    });

    describe('The tui.util.Map', function() {
        it('is defined', function() {
            expect(Map).toBeDefined();
        });

        it('is a constructor', function() {
            expect(map instanceof Map).toBe(true);
        });

        describe('has an argument', function() {
            it('that can be an array', function() {
                var initData = [
                    [1, 'one'],
                    [2, 'two'],
                    [3, 'three']
                ];

                map = new Map(initData);

                expect(map.get(1)).toBe('one');
                expect(map.get(2)).toBe('two');
                expect(map.get(3)).toBe('three');
            });
        });
    });

    describe('set() and get()', function() {
        it('for the string key', function() {
            map.set('company', 'nhn ent');
            map.set('team', 'FE');

            expect(map.get('company')).toEqual('nhn ent');
            expect(map.get('team')).toEqual('FE');
        });

        it('for the object key', function() {
            var key1 = {},
                key2 = function() {},
                key3 = [];

            map.set(key1, 'object');
            map.set(key2, 'function');
            map.set(key3, 'array');

            expect(map.get(key1)).toEqual('object');
            expect(map.get(key2)).toEqual('function');
            expect(map.get(key3)).toEqual('array');
        });

        it('set returns map object', function() {
            var returned = map.set(1, 'one');
            expect(returned).toBe(map);
        });

        describe('if the key already exists, set() updates the value', function() {
            it('with string key', function() {
                map.set('key', 'once');
                map.set('key', 'again');
                expect(map.get('key')).toEqual('again');
            });

            it('with object key', function() {
                var key = {};
                map.set(key, 'once');
                map.set(key, 'again');
                expect(map.get(key)).toEqual('again');
            });
        });

        describe('get() returns undefined', function() {
            it('if the key does not exist', function() {
                expect(map.get('key')).toBeUndefined();
            });

            it('if the value is undefined', function() {
                map.set('key', undefined);
                expect(map.get('key')).toBeUndefined();
            });
        });

        describe('primitive values', function() {
            it('can be used for the key', function() {
                map.set(null, 'null');
                map.set(undefined, 'undefined');
                map.set(true, 'true');
                map.set(false, 'false');
                map.set(1, 'one');

                expect(map.get(null)).toEqual('null');
                expect(map.get(undefined)).toEqual('undefined');
                expect(map.get(true)).toEqual('true');
                expect(map.get(false)).toEqual('false');
                expect(map.get(1)).toEqual('one');
            });

            it('are not equal to string keys', function() {
                map.set(null, 'null');
                map.set('null', 'null string');
                map.set(1, 'one');
                map.set('1', 'one string');

                expect(map.get(null)).toEqual('null');
                expect(map.get('null')).toEqual('null string');
                expect(map.get(1)).toEqual('one');
                expect(map.get('1')).toEqual('one string');
            });

            it('NaN can be used for the key', function() {
                map.set(NaN, 'NaN');
                expect(map.get(NaN)).toEqual('NaN');
            });
        });
    });

    describe('has()', function() {
        it('returns true if the key exists', function() {
            map.set(1, 'one');
            expect(map.has(1)).toBe(true);
        });

        it('returns true even if value is undefined', function() {
            map.set(1, undefined);
            expect(map.has(1)).toBe(true);
            expect(map.get(1)).toBeUndefined();
        });

        it('returns false if the key does not exists', function() {
            expect(map.has(1)).toBe(false);
        });
    });

    describe('delete() removes the element', function() {
        it('for the string key', function() {
            map.set('1', 'one');
            map['delete']('1');
            expect(map.has('1')).toBe(false);
        });

        it('for the object key', function() {
            var key = {};

            map.set(key, 'value');
            map['delete'](key);
            expect(map.has(key)).toBe(false);
        });

        it('delete and set again', function() {
            var key = {};

            map.set(key, 'once');
            map['delete'](key);
            map.set(key, 'again');
            expect(map.get(key)).toBe('again');
        });

        it('delete and set again with undefined key', function() {
            map.set(undefined, 'once');
            map['delete'](undefined);
            expect(map.has(undefined)).toBe(false);

            map.set(undefined, 'again');
            expect(map.get(undefined)).toBe('again');
        });

        it('deleted key is not undefined key', function() {
            map.set(1, 'one');
            map.set(undefined, 'undefined');
            map['delete'](1);

            expect(map.get(undefined)).toBe('undefined');
        });
    });

    describe('size property', function() {
        it('is the number of elements in a map', function() {
            expect(map.size).toEqual(0);

            map.set(1, 'one');
            map.set(2, 'two');
            expect(map.size).toEqual(2);

            map.set(2, 'two again');
            expect(map.size).toEqual(2);

            map['delete'](2);
            expect(map.size).toEqual(1);
        });
    });

    describe('clear()', function() {
        it('removes all elements', function() {
            map.set(1, 'one');
            map.set(2, 'two');
            expect(map.size).toEqual(2);

            map.clear();

            expect(map.size).toEqual(0);
            expect(map.has(1)).toBe(false);
            expect(map.has(2)).toBe(false);
        });
    });

    describe('forEach() executes a function once per each key/value pair', function() {
        var string;

        beforeEach(function() {
            string = '';
            map.set(1, '1');
            map.set(null, '2');
            map.set('3', '3');
        });

        it('in insertion order', function() {
            map.forEach(function(value) {
                string += value;
            });
            expect(string).toEqual('123');
        });

        it('second argument is key', function() {
            map.forEach(function(value, key) {
                string += key;
            });
            expect(string).toEqual('1null3');
        });

        it('third argument is map itself', function() {
            map.forEach(function(value, key, thisMap) {
                string += thisMap.get(key);
            });
            expect(string).toEqual('123');
        });

        it('context can be set', function() {
            var context = {value: '0'};

            map.forEach(function(value) {
                string += (value + this.value);
            }, context);
            expect(string).toEqual('102030');
        });
    });

    describe('keys(), values(), entries() returns Iterator object in insertion order', function() {
        beforeEach(function() {
            map.set(null, '1');
            map.set(undefined, '2');
            map.set('3', '3');
        });

        describe('Iterator from keys()', function() {
            var keys;

            beforeEach(function() {
                keys = map.keys();
            });

            it('contains the keys for each element', function() {
                expect(keys.next().value).toBe(null);
                expect(keys.next().value).toBe(undefined);
                expect(keys.next().value).toBe('3');
            });

            it('done is false if there are more values. otherwise is true', function() {
                expect(keys.next().done).toBe(false);
                expect(keys.next().done).toBe(false);
                expect(keys.next().done).toBe(false);
                expect(keys.next().done).toBe(true);
            });
        });

        describe('Iterator from values()', function() {
            var values;

            beforeEach(function() {
                values = map.values();
            });

            it('contains the values for each element', function() {
                expect(values.next().value).toBe('1');
                expect(values.next().value).toBe('2');
                expect(values.next().value).toBe('3');
            });

            it('done is false if there are more values. otherwise is true', function() {
                expect(values.next().done).toBe(false);
                expect(values.next().done).toBe(false);
                expect(values.next().done).toBe(false);
                expect(values.next().done).toBe(true);
            });
        });

        describe('Iterator from values()', function() {
            var entries;

            beforeEach(function() {
                entries = map.entries();
            });

            it('contains the values for each element', function() {
                expect(entries.next().value).toEqual([null, '1']);
                expect(entries.next().value).toEqual([undefined, '2']);
                expect(entries.next().value).toEqual(['3', '3']);
            });

            it('done is false if there are more values. otherwise is true', function() {
                expect(entries.next().done).toBe(false);
                expect(entries.next().done).toBe(false);
                expect(entries.next().done).toBe(false);
                expect(entries.next().done).toBe(true);
            });
        });
    });
});

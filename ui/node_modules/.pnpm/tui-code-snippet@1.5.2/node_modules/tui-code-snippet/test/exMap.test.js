/* eslint-disable no-undefined */

'use strict';

var Map = require('../src/js/map');
var ExMap = require('../src/js/exMap');

describe('module:ExMap', function() {
    var map;

    beforeEach(function() {
        map = new ExMap();
    });

    describe('The tui.util.ExMap', function() {
        it('is defined', function() {
            expect(ExMap).toBeDefined();
        });

        it('is a constructor', function() {
            expect(map instanceof ExMap).toBe(true);
        });

        describe('has an argument', function() {
            it('that can be an array', function() {
                var initData = [
                    [1, 'one'],
                    [2, 'two'],
                    [3, 'three']
                ];

                map = new ExMap(initData);

                expect(map.get(1)).toBe('one');
                expect(map.get(2)).toBe('two');
                expect(map.get(3)).toBe('three');
            });
        });
    });

    describe('methods from tui.util.Map', function() {
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
        });

        describe('has()', function() {
            it('returns true if the key exists', function() {
                map.set(1, 'one');
                expect(map.has(1)).toBe(true);
            });

            it('returns false if the key does not exists', function() {
                expect(map.has(1)).toBe(false);
            });
        });

        describe('delete() removes the element', function() {
            var key = {};

            it('for the object key', function() {
                map.set(key, 'value');
                map['delete'](key);
                expect(map.has(key)).toBe(false);
            });

            it('delete and set again', function() {
                map.set(key, 'once');
                map['delete'](key);
                map.set(key, 'again');
                expect(map.get(key)).toBe('again');
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

        describe('forEach()', function() {
            it('executes a function once per each key/value pair in insertion order', function() {
                var string = '';

                map.set(1, '1');
                map.set(null, '2');
                map.set('3', '3');
                map.forEach(function(value) {
                    string += value;
                });

                expect(string).toEqual('123');
            });
        });

        describe('keys(), values(), entries() returns Iterator object in insertion order', function() {
            beforeEach(function() {
                map.set(null, '1');
                map.set(undefined, '2');
                map.set('3', '3');
            });

            describe('Iterator from keys()', function() {
                it('contains the keys for each element', function() {
                    var keys = map.keys();
                    expect(keys.next().value).toBe(null);
                    expect(keys.next().value).toBe(undefined);
                    expect(keys.next().value).toBe('3');
                });
            });

            describe('Iterator from values()', function() {
                it('contains the values for each element', function() {
                    var values = map.values();
                    expect(values.next().value).toBe('1');
                    expect(values.next().value).toBe('2');
                    expect(values.next().value).toBe('3');
                });
            });

            describe('Iterator from values()', function() {
                it('contains the values for each element', function() {
                    var entries = map.entries();
                    expect(entries.next().value).toEqual([null, '1']);
                    expect(entries.next().value).toEqual([undefined, '2']);
                    expect(entries.next().value).toEqual(['3', '3']);
                });
            });
        });
    });

    describe('setObject()', function() {
        it('sets the each key/value pair in the object to the map.', function() {
            map.setObject({
                'name': 'kim',
                'company': 'apple'
            });
            expect(map.get('name')).toBe('kim');
            expect(map.get('company')).toBe('apple');
        });
    });

    describe('deleteByKeys()', function() {
        it('removes the elements associated to the each keys in the array', function() {
            map.set('1', 'one');
            map.set(1, 'number one');
            map.set(null, 'null');

            expect(map.has('1')).toBe(true);
            expect(map.has(1)).toBe(true);
            expect(map.has(null)).toBe(true);

            map.deleteByKeys(['1', 1]);

            expect(map.has('1')).toBe(false);
            expect(map.has(1)).toBe(false);
            expect(map.has(null)).toBe(true);
        });
    });

    describe('merge()', function() {
        it('sets all of the key-value pairs in the specified map to this map', function() {
            var anotherMap = new Map();

            map.set(1, 'one');
            map.set(2, 'two');

            anotherMap.set(2, 'second');
            anotherMap.set(3, 'third');

            map.merge(anotherMap);

            expect(map.get(1)).toBe('one');
            expect(map.get(2)).toBe('second');
            expect(map.get(3)).toBe('third');
        });
    });

    describe('filter()', function() {
        it('returns new ExMap of all key-value pairs that pass a truth test', function() {
            var filtered;

            map.set(1, 1);
            map.set(2, 'two');
            map.set(3, 3);

            filtered = map.filter(function(value, key) {
                return value === key;
            });

            expect(filtered.get(1)).toBe(1);
            expect(filtered.get(2)).toBeUndefined();
            expect(filtered.get(3)).toBe(3);
            expect(filtered.size).toBe(2);
        });
    });
});

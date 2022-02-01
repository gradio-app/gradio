'use strict';

var array = require('../src/js/array');

describe('module:array', function() {
    describe('range', function() {
        it('only stop', function() {
            var arr = array.range(5);
            expect(arr.join(',')).toEqual('0,1,2,3,4');
        });

        it('start and stop', function() {
            var arr = array.range(1, 5);
            expect(arr.join(',')).toEqual('1,2,3,4');
        });

        it('start, stop, step', function() {
            var arr = array.range(2, 10, 2);
            expect(arr.join(',')).toEqual('2,4,6,8');
            arr = array.range(10, 2, -2);
            expect(arr.join(',')).toEqual('10,8,6,4');
        });
    });

    describe('zip', function() {
        it('test zip', function() {
            var result = array.zip([1, 2, 3], ['a', 'b', 'c'], [true, false, true]);
            expect(result).toEqual([
                [1, 'a', true],
                [2, 'b', false],
                [3, 'c', true]
            ]);
        });
    });
});

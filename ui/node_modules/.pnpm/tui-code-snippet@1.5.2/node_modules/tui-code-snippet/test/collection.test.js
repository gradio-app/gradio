'use strict';

var collection = require('../src/js/collection');
var array = require('../src/js/array');

describe('module:collection', function() {
    var objDummy,
        arrayDummy;

    beforeEach(function() {
        arrayDummy = [0, 1, 2, 3, 4, 5];
        objDummy = {_0: 0,
            _1: 1,
            _2: 2,
            _3: 3,
            _4: 4,
            _5: 5};
    });

    describe('forEachArray', function() {
        it('should traverse array or array-like object, and execute callback function in each element.', function() {
            var oSum = 0;

            collection.forEachArray(arrayDummy, function(value) {
                oSum += value;
            });

            expect(oSum).toEqual(15);
        });

        it('should end traversing, when callback returns false', function() {
            var oSum = 0;

            collection.forEachArray(arrayDummy, function(value) {
                oSum += value;

                if (oSum === 3) {
                    return false;
                }

                return true;
            });

            expect(oSum).toEqual(3);
        });
    });

    describe('forEachOwnProperties', function() {
        it('should traverse each element by sending collection object and callback function.', function() {
            var oSum = 0;

            collection.forEachOwnProperties(objDummy, function(value) {
                oSum += value;
            });

            expect(oSum).toEqual(15);
        });

        it('should end traversing, when callback returns false', function() {
            var oSum = 0;

            collection.forEachOwnProperties(objDummy, function(value) {
                oSum += value;

                if (oSum === 3) {
                    return false;
                }

                return true;
            });

            expect(oSum).toEqual(3);
        });
    });

    describe('forEach', function() {
        it('배열과 콜백펑션을 입력받아 배열의 내용을 순회할수있다.', function() {
            var aSum = 0;

            collection.forEach(arrayDummy, function(value) {
                aSum += value;
            });

            expect(aSum).toEqual(15);
        });

        it('객체와 콜백펑션을 입력받아 객체의 내용을 순회할수있다.', function() {
            var oSum = 0;

            collection.forEach(objDummy, function(value) {
                oSum += value;
            });

            expect(oSum).toEqual(15);
        });
    });
    describe('map', function() {
        it('배열을 입력받아 콜백을 통해 새로운 배열을 생성한다.', function() {
            var aSum = 1,
                resultArray;

            resultArray = collection.map(arrayDummy, function(value) {
                return value + aSum;
            });

            expect(resultArray[0]).toEqual(1);
            expect(resultArray[1]).toEqual(2);
            expect(resultArray[2]).toEqual(3);
            expect(resultArray[3]).toEqual(4);
            expect(resultArray[4]).toEqual(5);
            expect(resultArray[5]).toEqual(6);
        });

        it('객체를 입력받아 콜백을 통해 새로운 배열을 생성한다.', function() {
            var aSum = 1,
                resultArray;

            resultArray = collection.map(objDummy, function(value) {
                return value + aSum;
            });

            expect(resultArray[0]).toEqual(1);
            expect(resultArray[1]).toEqual(2);
            expect(resultArray[2]).toEqual(3);
            expect(resultArray[3]).toEqual(4);
            expect(resultArray[4]).toEqual(5);
            expect(resultArray[5]).toEqual(6);
        });
    });
    describe('reduce', function() {
        it('배열을 순회하여 콜백의 실행결과를 다음 콜백에 전달해 연산한다.', function() {
            var result;

            result = collection.reduce(arrayDummy, function(stored, value) {
                return stored + value;
            });

            expect(result).toEqual(15);
        });

        it('객체를 순회하여 콜백의 실행결과를 다음 콜백에 전달해 연산한다.', function() {
            var result;

            result = collection.reduce(objDummy, function(stored, value) {
                return stored + value;
            });

            expect(result).toEqual(15);
        });
    });

    describe('toArray', function() {
        it('유사 배열 객체를 배열로 변환한다.', function() {
            var result,
                arrayLike = {
                    0: 'one',
                    1: 'two',
                    2: 'three',
                    3: 'four',
                    length: 4
                };
            result = collection.toArray(arrayLike);
            expect(arrayLike instanceof Array).toBe(false);
            expect(result instanceof Array).toBe(true);

            result = collection.toArray(arguments);
            expect(arguments instanceof Array).toBe(false);
            expect(result instanceof Array).toBe(true);
        });

        it('인자의 length 프로퍼티 숫자 크기만큼 순회하며, length 가 없을 경우 빈 배열을 반환한다.', function() {
            var result,
                arrayLike = {
                    0: 'one',
                    1: 'two',
                    2: 'three',
                    3: 'four',
                    length: 2
                };
            result = collection.toArray(arrayLike);
            expect(result instanceof Array).toBe(true);
            expect(result.length).toBe(2);

            result = collection.toArray('abcde');
            expect(result instanceof Array).toBe(true);
            expect(result.length).toBe(5);

            result = collection.toArray(1);
            expect(result instanceof Array).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('filter', function() {
        it('배열을 순회하여, 콜백 실행 결과가 참인 새로울 배열을 만들어 리턴한다.', function() {
            var result;

            result = collection.filter(arrayDummy, function(value) {
                return (value % 2) === 0;
            });

            expect(result).toEqual([0, 2, 4]);
        });
        it('객체를 순회하여 콜백 실행 결과가 참인 새로운 객체를 만들어 리턴한다.', function() {
            var result;

            result = collection.filter(objDummy, function(value) {
                return (value % 2) === 0;
            });
            expect(result).toEqual({_0: 0,
                _2: 2,
                _4: 4});
        });
    });

    describe('inArray', function() {
        it('배열 내의 값을 찾아서 인덱스를 반환한다', function() {
            var arr = ['java', 'javascript', 'c#', 'basic'];
            var result;
            result = array.inArray('javascript', arr);
            expect(result).toBe(1);
        });

        it('배열내에 없는 값을 찾으려고 하면 -1을 반환한다.', function() {
            var arr = ['java', 'javascript', 'c#', 'basic'];
            var result = array.inArray('php', arr);
            expect(result).toBe(-1);
        });

        it('배열내에서 찾고자 하는 값과 fromIndex의 범위가 맞지 않으면 -1을 반환한다.', function() {
            var arr = ['one', 'two', 'three', 'four'];
            var result;

            // 'one' 이라는 값을 3번째 인덱스에서부터 찾음
            result = array.inArray('one', arr, 3);
            expect(result).toBe(-1);
        });

        it('array가 아닌 다른 객체를 넘기면 -1을 반환한다.', function() {
            var dummyObj = {};
            var result = array.inArray('four', dummyObj);
            expect(result).toBe(-1);
        });

        it('fromIndex의 범위가 초과하면 -1을 리턴한다', function() {
            var arr = ['one', 'two', 'three', 'four'];
            var result = array.inArray('two', arr, 10);
            expect(result).toBe(-1);
        });
    });

    describe('pluck', function() {
        var objArr = [
                {'abc': 1,
                    'def': 2,
                    'ghi': 3},
                {'abc': 4,
                    'def': 5,
                    'ghi': 6},
                {'abc': 7,
                    'def': 8,
                    'ghi': 9}
            ],
            arr2d = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];

        it('test object array', function() {
            var result = collection.pluck(objArr, 'abc');
            expect(result).toEqual([1, 4, 7]);
        });

        it('test two dimensional array', function() {
            var result = collection.pluck(arr2d, 2);
            expect(result).toEqual([3, 6, 9]);
        });
    });
});

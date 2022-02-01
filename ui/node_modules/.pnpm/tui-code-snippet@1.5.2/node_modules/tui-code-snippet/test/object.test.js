'use strict';

var object = require('../src/js/object');
var tui = {
    util: object
};

describe('object', function() {
    beforeEach(function() {
        tui.util.resetLastId();
    });

    it('compareJSON()은 json객체가 같은지 비교한다.', function() {
        var obj1 = {url: 'http://119.205.249.132/ac',
                st: 1,
                rLt: 1,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'},
            obj2 = {url: 'http://119.205.249.132/ac',
                st: 1,
                rLt: 1,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'},
            obj3 = {url: 'http://119.205.249.132/ac',
                st: 1,
                rLt: 1,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'},
            obj4 = {url: 'http://119.205.249.132/ac',
                st: 1,
                rLt: 1,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'};

        var objA = {url: 'http://119.205.249.132/ac',
                st: 1,
                rLt: 1,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'},
            objB = {url: 'http://120.120.266.1/',
                st: 11,
                rLt: 2,
                rEnc: 'UTF-8',
                qEnc: 'UTF-8'};

        var objC = {a: 100,
                b: [1, 2, 3],
                dt: {age: 12}},
            objD = {a: 100,
                b: [1, 2, 3],
                dt: {age: 1222}},
            objE = {a: 100,
                b: [1, 2, 3],
                dt: {age: 12}};

        expect(tui.util.compareJSON(obj1, obj2, obj3, obj4)).toBe(true);
        expect(tui.util.compareJSON(objA, objB)).toBe(false);
        expect(tui.util.compareJSON(objC, objD)).toBe(false);
        expect(tui.util.compareJSON(objC, objE)).toBe(true);
    });

    it('extend()는 객체를 확장한다', function() {
        var target = {
            firstName: 'MinHyeong',
            lastName: 'Kang'
        };

        var source = {
            lastName: 'Kim',
            middleName: '-',
            myprop: {
                test: 'good',
                testFunc: function(x) {
                    return x + 2;
                }
            }
        };

        tui.util.extend(target, source);

        expect(target.middleName).toEqual('-');
        expect(target.lastName).toEqual('Kim');
        expect(target.myprop.test).toEqual('good');
        expect(target.myprop.testFunc(3)).toEqual(5);
    });

    it('stamp() 메서드로 특정 객체에 unique 한 ID를 부여할 수 있다', function() {
        var myFn = function() {};

        var myObj = {};

        tui.util.stamp(myFn);
        tui.util.stamp(myObj);

        expect(tui.util.stamp(myFn)).toBeDefined();
        expect(tui.util.stamp(myFn)).toBe(1);
        expect(tui.util.stamp(myObj)).toBe(2);
    });

    it('hasStamp() 는 stamp()로 ID부여 여부를 확인가능', function() {
        var myFn = function() {};

        expect(tui.util.hasStamp(myFn)).not.toBe(true);

        tui.util.stamp(myFn);

        expect(tui.util.hasStamp(myFn)).toBe(true);
    });

    describe('keys', function() {
        it('객체를 전달받아 키만 따로 배열로 만들어 리턴해준다.', function() {
            var result = tui.util.keys({'key1': 1,
                'key2': 2});

            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('key1');
            expect(result[1]).toEqual('key2');
        });
    });

    describe('pick', function() {
        it('기본 검증', function() {
            var o1,
                o2 = null;

            expect(tui.util.pick(o1)).toBeUndefined();
            expect(tui.util.pick(o1, 'key1')).toBeUndefined();
            expect(tui.util.pick(o2)).toBeNull();
            expect(tui.util.pick(o2, 'key1')).toBeUndefined();
            expect(tui.util.pick(o2, 'key1', 'key2')).toBeUndefined();
            expect(tui.util.pick(o2, 'valueOf')).toBeUndefined();
            expect(tui.util.pick(o2, 'toString')).toBeUndefined();

            expect(tui.util.pick(1)).toBe(1);
            expect(tui.util.pick('key1')).toBe('key1');
            expect(tui.util.pick('key1', 'key2')).toBeUndefined();
        });
        it('Object 인 경우', function() {
            var obj = {
                'key1': 1,
                'key2': null,
                'nested': {
                    'key1': 11,
                    'key2': null,
                    'nested': {
                        'key1': 21
                    }
                }
            };

            expect(tui.util.pick(obj, 'key1')).toBe(1);
            expect(tui.util.pick(obj, 'key1', 'notFound')).toBeUndefined();

            expect(tui.util.pick(obj, 'nested')).toEqual(obj.nested);
            expect(tui.util.pick(obj, 'nested', 'key1')).toBe(11);
            expect(tui.util.pick(obj, 'nested', 'nested')).toBe(obj.nested.nested);
            expect(tui.util.pick(obj, 'nested', 'nested', 'key1')).toBe(21);

            expect(tui.util.pick(obj, 'notFound')).toBeUndefined();
            expect(tui.util.pick(obj, 'notFound', 'notFound')).toBeUndefined();

            expect(tui.util.pick(obj, 'key2')).toBeNull();
            expect(tui.util.pick(obj, 'key2', 'key2')).toBeUndefined();
            expect(tui.util.pick(obj, 'key2', 'valueOf')).toBeUndefined();
            expect(tui.util.pick(obj, 'nested', 'key2')).toBeNull();
        });

        it('배열인 경우', function() {
            var arr = [1, [2], {'key1': 3}];

            expect(tui.util.pick(arr, 0)).toBe(1);
            expect(tui.util.pick(arr, 1)).toBe(arr[1]);
            expect(tui.util.pick(arr, 1, 0)).toBe(2);
            expect(tui.util.pick(arr, 2, 'key1')).toBe(3);

            expect(tui.util.pick(arr, 5)).toBeUndefined();
        });
    });
});

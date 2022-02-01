'use strict';

var HashMap = require('../src/js/hashMap');

describe('module:hashMap', function() {
    var hashMap;

    beforeEach(function() {
        hashMap = new HashMap();
    });

    describe('HashMap이 존재한다.', function() {
        it('HashMap은 정의되어있다.', function() {
            expect(HashMap).toBeDefined();
        });

        it('hashMap의 인스턴스가 존재한다.', function() {
            expect(hashMap).toBeDefined();
        });
    });

    describe('setKeyValue()', function() {
        it('key와 value를 전달하여 데이터를 저장한다..', function() {
            hashMap.setKeyValue('dataKey', 'data');
            hashMap.setKeyValue('dataKey2', 'data');
            expect(hashMap.get('dataKey')).toEqual('data');
            expect(hashMap.length).toEqual(2);
        });

        it('같은 key에 값을 두번 셋팅하면 length에 변함이 없다.', function() {
            hashMap.setKeyValue('dataKey', 'data');
            hashMap.setKeyValue('dataKey', 'data2');
            expect(hashMap.get('dataKey')).toEqual('data2');
            expect(hashMap.length).toEqual(1);
        });
    });

    describe('setObject()', function() {
        it('객체를 전달하여 데이터를 저장한다..', function() {
            hashMap.setObject({
                'dataKey': 'data',
                'dataKey2': 'data'
            });
            expect(hashMap.get('dataKey')).toEqual('data');
            expect(hashMap.length).toEqual(2);
        });
    });

    describe('merge()', function() {
        it('해쉬맵을 인자로 받아 병합한다.', function() {
            var mergedHashMap = new HashMap();

            hashMap.setObject({
                'dataKey': 'data',
                'dataKey2': 'data'
            });

            mergedHashMap.merge(hashMap);

            expect(mergedHashMap.get('dataKey')).toEqual('data');
            expect(mergedHashMap.length).toEqual(2);
        });
    });

    describe('set()', function() {
        it('key와 value를 전달하여 데이터를 저장한다..', function() {
            hashMap.set('dataKey', 'data');
            expect(hashMap.get('dataKey')).toEqual('data');
        });
        it('객체를 전달하여 데이터를 저장한다..', function() {
            hashMap.set({
                'dataKey': 'data'
            });
            expect(hashMap.get('dataKey')).toEqual('data');
        });
    });

    describe('get()', function() {
        beforeEach(function() {
            hashMap.set('dataKey', 'data');
        });

        it('키를 넘겨 값을 가져온다.', function() {
            var v = hashMap.get('dataKey');
            expect(v).toEqual('data');
        });
    });

    describe('has()', function() {
        beforeEach(function() {
            hashMap.set('dataKey', 'data');
        });

        it('존재하는 키에대해 true를 리턴한다.', function() {
            var v = hashMap.has('dataKey');
            expect(v).toEqual(true);
        });

        it('존재하지 않는 키에대해 false를 리턴한다.', function() {
            var v = hashMap.has('notAKey');
            expect(v).toEqual(false);
        });
    });

    describe('encodeKey()', function() {
        it('키로 사용할 문자열을 넘기면 프리픽스를 인코딩해 리턴한다.', function() {
            var encodedKey = hashMap.encodeKey('dataKey');
            expect(encodedKey).toEqual('ådataKey');
        });
    });

    describe('decodeKey()', function() {
        it('키를 넘기면 프리픽스를 제거해 리턴한다.', function() {
            var encodedKey = hashMap.decodeKey('ådataKey');
            expect(encodedKey).toEqual('dataKey');
        });
    });

    describe('remove()', function() {
        beforeEach(function() {
            hashMap.set('dataKey', 'data');
            hashMap.set('dataKey2', 'data');
        });

        it('키를 넘겨 데이터를 삭제한다.', function() {
            hashMap.remove('dataKey');
            expect(hashMap.has('dataKey')).toEqual(false);
            expect(hashMap.length).toEqual(1);
        });

        it('키를 여러개 넘겨 데이터를 삭제한다.', function() {
            var v = hashMap.remove('dataKey', 'dataKey2');
            expect(v).toEqual(['data', 'data']);
            expect(hashMap.length).toEqual(0);
        });

        it('키의 배열을 넘겨 데이터를 삭제한다.', function() {
            var v = hashMap.remove(['dataKey', 'dataKey2']);
            expect(v).toEqual(['data', 'data']);
            expect(hashMap.length).toEqual(0);
        });

        it('삭제된 데이터가 리턴된다.', function() {
            var v = hashMap.remove('dataKey');
            expect(v).toEqual('data');
        });

        it('없는키를 삭제하면 null이 리턴되고 length는 변함이 없다.', function() {
            var v = hashMap.remove('dataKey1');
            expect(v).toBe(null);
            expect(hashMap.length).toEqual(2);
        });
    });

    describe('removeByKey()', function() {
        beforeEach(function() {
            hashMap.set('dataKey', 'data');
        });

        it('키를 넘겨 데이터를 삭제한다.', function() {
            var v;
            hashMap.removeByKey('dataKey');
            v = hashMap.has('dataKey');
            expect(v).toEqual(false);
            expect(hashMap.length).toEqual(0);
        });

        it('삭제된 데이터가 리턴된다.', function() {
            var v = hashMap.removeByKey('dataKey');
            expect(v).toEqual('data');
        });

        it('없는키를 삭제하면 null이 리턴되고 length는 변함이 없다.', function() {
            var v = hashMap.removeByKey('dataKey1');
            expect(v).toBe(null);
            expect(hashMap.length).toEqual(1);
        });
    });

    describe('removeByKeyArray()', function() {
        beforeEach(function() {
            hashMap.set('key', 'data');
            hashMap.set('key2', 'data');
        });

        it('키의 목록을 넘겨 데이터를 삭제한다.', function() {
            hashMap.removeByKeyArray(['key', 'key2']);
            expect(hashMap.has('key')).toEqual(false);
            expect(hashMap.has('key2')).toEqual(false);
            expect(hashMap.length).toEqual(0);
        });

        it('삭제된 데이터가 리턴된다.', function() {
            var v = hashMap.removeByKeyArray(['key', 'key2']);
            expect(v).toEqual(['data', 'data']);
        });
    });

    describe('removeAll()', function() {
        beforeEach(function() {
            hashMap.set('key1', 'data1');
            hashMap.set('key2', 'data2');
            hashMap.set('key3', 'data3');
        });

        it('모든 값을 지운다.', function() {
            hashMap.removeAll();

            expect(hashMap.get('key1')).not.toBeDefined();
            expect(hashMap.get('key2')).not.toBeDefined();
            expect(hashMap.get('key3')).not.toBeDefined();
            expect(hashMap.length).toEqual(0);
        });
    });

    describe('each()', function() {
        beforeEach(function() {
            hashMap.set('key1', 'data1');
            hashMap.set('key2', 'data2');
            hashMap.set('key3', 'data3');
        });

        it('데이터를 순회하여 넘겨받은 콜백에 넘겨준다.', function() {
            var sumValue = '';
            var sumKey = '';

            hashMap.each(function(value, key) {
                sumValue += value;
                sumKey += key;
            });

            expect(sumValue).toEqual('data1data2data3');
            expect(sumKey).toEqual('key1key2key3');
        });
    });

    describe('keys()', function() {
        beforeEach(function() {
            hashMap.set('key1', 'data1');
            hashMap.set('key2', 'data2');
            hashMap.set('key3', 'data3');
        });

        it('저장되어있는 Key를 모와서 배열로 리턴해준다.', function() {
            var keys;

            keys = hashMap.keys();

            expect(keys).toEqual(['key1', 'key2', 'key3']);
        });
    });

    describe('find()', function() {
        beforeEach(function() {
            hashMap.set('key1', 'data1');
            hashMap.set('key2', 'data');
            hashMap.set('key3', 'data');
        });

        it('조건을 체크하는 펑션을 넘겨 데이터의 배열을 구할수있다.', function() {
            var dataByValue, dataByKey;

            dataByValue = hashMap.find(function(value) {
                return value === 'data';
            });

            dataByKey = hashMap.find(function(value, key) {
                return key === 'key1';
            });

            expect(dataByValue).toEqual(['data', 'data']);
            expect(dataByKey).toEqual(['data1']);
        });
    });

    describe('toArray()', function() {
        var obj = {};
        beforeEach(function() {
            hashMap.set('key1', 'good');
            hashMap.set('key2', obj);
        });

        it('내부의 값들을 순서에 상관없이 배열로 반환한다', function() {
            var arr = hashMap.toArray();

            expect(arr.length).toBe(2);
            expect(arr[0]).toBe('good');
            expect(arr[1]).toBe(obj);
            expect(arr[3]).toBeUndefined();
        });
    });
});

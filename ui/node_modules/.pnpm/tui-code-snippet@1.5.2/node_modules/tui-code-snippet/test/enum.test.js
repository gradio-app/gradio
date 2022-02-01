'use strict';

var Enum = require('../src/js/enum');

describe('module:Enum', function() {
    var isModernBrowser = (function() {
        try {
            Object.defineProperty({}, 'x', {});

            return true;
        } catch (e) {
            return false;
        }
    })();
    var enumO;

    beforeEach(function() {
        enumO = new Enum();
    });

    describe('.set()', function() {
        it('상수명을 입력받을수있다.', function() {
            enumO.set('CONST1', 'CONST2');

            expect(enumO.CONST1).toBeDefined();
            expect(enumO.CONST2).toBeDefined();
        });

        it('배열로 상수를 지정할수있다', function() {
            enumO.set(['CONST3', 'CONST4']);

            expect(enumO.CONST3).toBeDefined();
            expect(enumO.CONST4).toBeDefined();
        });

        it('상수들은 서로다른 값을 갖는다', function() {
            enumO.set('CONST1', 'CONST2');

            expect(enumO.CONST1).not.toEqual(enumO.CONST2);
        });

        it('한번정의된 상수는 재정의 될수없다', function() {
            var originalValue;

            enumO.set('CONST1', 'CONST2');
            originalValue = enumO.CONST1;
            enumO.set('CONST1');

            expect(enumO.CONST1).toEqual(originalValue);
        });
    });

    describe('.getName()', function() {
        it('값을 입력해 상수명을 얻어올수있다', function() {
            var result;

            enumO.set('CONST1', 'CONST2');
            result = enumO.getName(enumO.CONST1);

            expect(result).toEqual('CONST1');
        });
    });

    describe('생성자 옵션으로 상수들을 지정할수있다', function() {
        it('상수들이 정상적으로 생성되었다', function() {
            var enumO2 = new Enum('CONST1', 'CONST2');

            expect(enumO2.CONST1).toBeDefined();
            expect(enumO2.CONST2).toBeDefined();
        });

        it('배열로 상수들이 정상적으로 생성되었다', function() {
            var enumO2 = new Enum(['CONST1', 'CONST2']);

            expect(enumO2.CONST1).toBeDefined();
            expect(enumO2.CONST2).toBeDefined();
        });
    });

    if (isModernBrowser) {
        describe('Modern Browser: 정의된 값은 변경할수없다', function() {
            beforeEach(function() {
                enumO.set('CONST1', 'CONST2');
            });

            it('상수의 값이 변경되지 않는다', function() {
                var desc = Object.getOwnPropertyDescriptor(enumO, 'CONST1');

                expect(desc.writable).toEqual(false);
                expect(desc.configurable).toEqual(false);
            });
        });
    }
});

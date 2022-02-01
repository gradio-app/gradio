'use strict';

var defineClass = require('../src/js/defineClass');

describe('module:def', function() {
    describe('def()', function() {
        var props1,
            propsWithinit,
            propsWithinit2,
            propsWithStatic;

        props1 = {
            var1: 1,
            method1: function() {}
        };

        propsWithinit = {
            var3: 3,
            init: function() {
                this.instanceVar = 3;
            },
            method3: function() {}
        };

        propsWithinit2 = {
            var4: 4,
            init: function() {
                this.instanceVar = 4;
            },
            method4: function() {}
        };

        propsWithStatic = {
            var2: 2,
            method2: function() {},
            static: {
                staticMethod1: function() {},
                staticMethod2: function() {}
            }
        };

        describe('생성자를 생성할수있다', function() {
            var MyObject;

            beforeEach(function() {
                MyObject = defineClass(props1);
            });

            it('MyObject.prototype에 method1이 있다.', function() {
                expect(MyObject.prototype.method1).toBeDefined();
                expect(MyObject.prototype.method1).toBe(props1.method1);
            });

            it('MyObject.prototype에 var1가 있고 값이 정확하다..', function() {
                expect(MyObject.prototype.var1).toBeDefined();
                expect(MyObject.prototype.var1).toEqual(props1.var1);
            });

            it('MyObject으로 생성한 인스턴스에서 va1과 method1를 참조할수있다.', function() {
                var instance = new MyObject();

                expect(instance.var1).toBeDefined();
                expect(instance.var1).toBe(MyObject.prototype.var1);
                expect(instance.method1).toBeDefined();
                expect(instance.method1).toBe(MyObject.prototype.method1);
            });
        });

        describe('init을 넘겨 생성자를 지정할수있다.', function() {
            var MyObject;

            beforeEach(function() {
                MyObject = defineClass(propsWithinit);
            });

            it('MyObject.prototype에 method3가 있다.', function() {
                expect(MyObject.prototype.method3).toBeDefined();
                expect(MyObject.prototype.method3).toBe(propsWithinit.method3);
            });

            it('MyObject.prototype에 var3가 있고 값이 정확하다..', function() {
                expect(MyObject.prototype.var3).toBeDefined();
                expect(MyObject.prototype.var3).toEqual(propsWithinit.var3);
            });

            it('MyObject으로 생성한 인스턴스에서 var3과 method3를 참조할수있다.', function() {
                var instance = new MyObject();

                expect(instance.var3).toBeDefined();
                expect(instance.var3).toBe(MyObject.prototype.var3);
                expect(instance.method3).toBeDefined();
                expect(instance.method3).toBe(MyObject.prototype.method3);
            });

            it('MyObject으로 생성한 인스턴스에서 인스턴스맴버가 존재한다.', function() {
                var instance = new MyObject();

                expect(instance.instanceVar).toBeDefined();
                expect(instance.instanceVar).toEqual(3);
            });
        });

        describe('static키로 클래스 멤버를 할당할수있다', function() {
            var MyObject;

            beforeEach(function() {
                MyObject = defineClass(propsWithStatic);
            });

            it('MyObject에 스테틱멤버가 존재한다.', function() {
                expect(MyObject.staticMethod1).toBeDefined();
                expect(MyObject.staticMethod2).toBeDefined();
                expect(propsWithStatic['static']).not.toBeDefined();
            });
        });

        describe('생성자를 상속받아 또다른 생성자를 만들수있다.', function() {
            var Parent,
                Child;

            beforeEach(function() {
                Parent = defineClass(propsWithinit);
                Child = defineClass(Parent, propsWithinit2);
            });

            it('Child.prototype에 method4가 있다.', function() {
                expect(Child.prototype.method4).toBeDefined();
                expect(Child.prototype.method4).toBe(propsWithinit2.method4);
            });

            it('Child.prototype에 var4가 있고 값이 정확하다..', function() {
                expect(Child.prototype.var4).toBeDefined();
                expect(Child.prototype.var4).toEqual(propsWithinit2.var4);
            });

            it('Child로 생성한 인스턴스에서 프로토타입멤버를 참조할수있다.', function() {
                var instance = new Child();

                expect(instance.var4).toBeDefined();
                expect(instance.var4).toBe(Child.prototype.var4);
                expect(instance.method4).toBeDefined();
                expect(instance.method4).toBe(Child.prototype.method4);
            });

            it('Child로 생성한 인스턴스에서 Parent에서 상속받은 멤버를 참조할수있다.', function() {
                var instance = new Child();

                expect(instance.var3).toBeDefined();
                expect(instance.var3).toBe(Parent.prototype.var3);
                expect(instance.method3).toBeDefined();
                expect(instance.method3).toBe(Parent.prototype.method3);
            });

            it('Child로 생성한 인스턴스에서 인스턴스멤버를 참조할수있다.', function() {
                var instance = new Child();

                expect(instance.instanceVar).toBeDefined();
                expect(instance.instanceVar).toEqual(4);
            });
        });

        describe('init안에서 def로 만들어진 생성자를 빌려쓸수있다.', function() {
            var Parent,
                Child;

            beforeEach(function() {
                Parent = defineClass(propsWithinit);
                Child = defineClass(Parent, {
                    init: function() {
                        Parent.call(this);
                    }
                });
            });

            it('Child로 생성한 인스턴스에서 Parent에서 상속받은 멤버를 참조할수있다.', function() {
                var instance = new Child();

                expect(instance.var3).toBeDefined();
                expect(instance.var3).toBe(Parent.prototype.var3);
                expect(instance.method3).toBeDefined();
                expect(instance.method3).toBe(Parent.prototype.method3);
            });

            it('Child로 생성한 인스턴스에서 인스턴스멤버를 참조할수있다.', function() {
                var instance = new Child();

                expect(instance.instanceVar).toBeDefined();
                expect(instance.instanceVar).toEqual(3);
            });
        });
    });
});

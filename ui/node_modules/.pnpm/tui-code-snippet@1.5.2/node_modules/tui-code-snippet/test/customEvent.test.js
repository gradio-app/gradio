'use strict';

var CustomEvents = require('../src/js/customEvent');

describe('CustomEvents', function() {
    var ce;

    beforeEach(function() {
        ce = new CustomEvents();
    });

    describe('should listen other object\'s event', function() {
        var handler;

        beforeEach(function() {
            handler = jasmine.createSpy('handler');
        });

        it('by name, handler function.', function() {
            ce.on('test', handler);

            expect(ce.events).toEqual({
                test: [{handler: handler}]
            });

            function handler2() {}
            ce.on('test', handler2);

            expect(ce.events).toEqual({
                test: [
                    {handler: handler},
                    {handler: handler2}
                ]
            });

            // double whitespace
            ce.on('multiple  multiple2', handler);

            expect(ce.events).toEqual({
                test: [
                    {handler: handler},
                    {handler: handler2}
                ],
                multiple: [{handler: handler}],
                multiple2: [{handler: handler}]
            });
            expect(ce.contexts).toBe(null);

            ce.on('a  b  c', handler);

            expect(ce.events).toEqual(jasmine.objectContaining({
                a: [{handler: handler}],
                b: [{handler: handler}],
                c: [{handler: handler}]
            }));
        });

        it('by name, handler, context object.', function() {
            var obj = {};
            ce.on('test', handler, obj);

            expect(ce.events).toEqual({
                test: [{handler: handler,
                    context: obj}]
            });

            ce.on('multi multi2', handler, obj);

            expect(ce.events).toEqual({
                test: [{handler: handler,
                    context: obj}],
                multi: [{handler: handler,
                    context: obj}],
                multi2: [{handler: handler,
                    context: obj}]
            });
            expect(ce.contexts).toEqual([[obj, 3]]);
        });

        it('by {name: handler} pair objects.', function() {
            function handler2() {}

            ce.on({
                'test': handler,
                'test2': handler2
            });

            expect(ce.events).toEqual({
                test: [{handler: handler}],
                test2: [{handler: handler2}]
            });

            ce.on({'test3': handler});
            ce.on({'test3': handler2});

            expect(ce.events).toEqual({
                test: [{handler: handler}],
                test2: [{handler: handler2}],
                test3: [{handler: handler}, {handler: handler2}]
            });

            // double whitespace
            ce.on({'multi  multi2': handler});

            expect(ce.events).toEqual({
                test: [{handler: handler}],
                test2: [{handler: handler2}],
                test3: [{handler: handler}, {handler: handler2}],
                multi: [{handler: handler}],
                multi2: [{handler: handler}]
            });
        });

        it('by {name: handler} pair object, context object.', function() {
            var obj = {};
            var obj2 = {};
            function handler2() {}

            ce.on({
                'test': handler,
                'test2': handler2
            }, obj);

            expect(ce.events).toEqual({
                'test': [{handler: handler,
                    context: obj}],
                'test2': [{handler: handler2,
                    context: obj}]
            });
            expect(ce.contexts).toEqual([[obj, 2]]);

            ce.on({'test': handler}, obj);

            expect(ce.events).toEqual({
                'test': [
                    {handler: handler,
                        context: obj},
                    {handler: handler,
                        context: obj}
                ],
                'test2': [{handler: handler2,
                    context: obj}]
            });
            expect(ce.contexts).toEqual([[obj, 3]]);

            ce.on({'multi  multi2': handler}, obj2);

            expect(ce.events).toEqual({
                test: [
                    {handler: handler,
                        context: obj},
                    {handler: handler,
                        context: obj}
                ],
                test2: [{handler: handler2,
                    context: obj}],
                multi: [{handler: handler,
                    context: obj2}],
                multi2: [{handler: handler,
                    context: obj2}]
            });
            expect(ce.contexts).toEqual([[obj, 3], [obj2, 2]]);
        });
    });

    describe('should stop listen other object\'s event', function() {
        var spy,
            spy2,
            obj,
            obj2;

        beforeEach(function() {
            spy = jasmine.createSpy('off');
            spy2 = jasmine.createSpy('last');
            ce = new CustomEvents();
            obj = {};
            obj2 = {};
        });

        it('exceptional situtaions.', function() {
            expect(function() {
                ce.off('good');
            }).not.toThrow();
        });

        it('by name.', function() {
            ce.on('play', spy, obj);
            ce.off('play');

            expect(ce.events).toEqual({'play': []});
            expect(ce.contexts.length).toBe(0);
        });

        it('by handler function.', function() {
            ce.on('play', spy);
            ce.off(spy);

            expect(ce.events).toEqual({'play': []});
        });

        it('by event name and handler function.', function() {
            ce.on('play', spy, obj);
            ce.on('pause', spy);

            ce.off('play', spy);

            expect(ce.events).toEqual({
                'play': [],
                'pause': [{handler: spy}]
            });

            expect(ce.contexts).toEqual([]);
        });

        it('by context.', function() {
            ce.on('play', spy, obj);
            ce.on('pause', spy);
            ce.off(obj);

            expect(ce.events).toEqual({
                play: [],
                pause: [{handler: spy}]
            });
            expect(ce.contexts.length).toBe(0);
        });

        it('by context and handler.', function() {
            ce.on('play', spy, obj);
            ce.on('pause', spy, obj);
            ce.off(obj, spy);

            expect(ce.events).toEqual({
                play: [],
                pause: []
            });
            expect(ce.contexts.length).toBe(0);
        });

        it('by context and event name.', function() {
            ce.on('play', spy, obj);
            ce.on('play', spy, obj2);
            ce.on('pause', spy, obj);

            ce.off(obj, 'pause');

            expect(ce.events).toEqual({
                play: [
                    {handler: spy,
                        context: obj},
                    {handler: spy,
                        context: obj2}
                ],
                pause: []
            });
            expect(ce.contexts.length).toBe(2);
        });

        it('by object with event name and handler pairs.', function() {
            ce.on('play', spy, obj);
            ce.on('pause', spy, obj);
            ce.on('play', spy2);
            ce.on('delay', spy2);

            ce.off({
                'play': spy,
                'pause': spy,
                'delay': spy2
            });

            expect(ce.events).toEqual({
                play: [{handler: spy2}],
                pause: [],
                delay: []
            });
            expect(ce.contexts.length).toBe(0);
        });

        it('with no arguments. then unbind all event.', function() {
            ce.on('play', spy, obj);
            ce.on('pause', spy, obj);
            ce.on('play', spy2);
            ce.on('delay', spy2);

            ce.off();

            expect(ce.events).toEqual({});
            expect(ce.contexts).toEqual([]);
        });
    });

    describe('should fire custom event', function() {
        var inst, spy;

        beforeEach(function() {
            inst = new CustomEvents();
            spy = jasmine.createSpy();
        });

        it('and invoke handler multiple times even if duplicated.', function() {
            var obj = {};

            inst.on('foo', spy);
            inst.on('foo', spy);

            inst.fire('foo');

            expect(spy.calls.count()).toBe(2);

            inst.on('bar', spy, obj);
            inst.on('bar', spy, obj);

            inst.fire('bar');

            expect(spy.calls.count()).toBe(4);
        });

        it('and pass arguments to each handlers.', function() {
            inst.on('foo', spy);
            inst.fire('foo', 'hello', 10);

            expect(spy).toHaveBeenCalledWith('hello', 10);
        });
    });

    describe('should return AND conditions for all of handler\' result', function() {
        var inst,
            spy;

        function MockComponent() {}

        CustomEvents.mixin(MockComponent);

        MockComponent.prototype.work = function() {
            if (this.invoke('beforeZoom')) {
                this.fire('zoom');
            }
        };

        beforeEach(function() {
            spy = jasmine.createSpy('handler');
            inst = new MockComponent();
            inst.on('zoom', spy);
        });

        describe('need return "false" explicitly for stop other event calls.', function() {
            it('empty string can\'t stop event calls.', function() {
                inst.on('beforeZoom', function() {
                    return '';
                });
                inst.work();
                expect(spy).toHaveBeenCalled();
            });

            it('undefined can\'t stop event calls.', function() {
                inst.on('beforeZoom', function() {
                    return undefined; // eslint-disable-line no-undefined
                });
                inst.work();
                expect(spy).toHaveBeenCalled();
            });

            it('null can\' stop event calls.', function() {
                inst.on('beforeZoom', function() {
                    return null;
                });
                inst.work();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('return AND condition value for result of all handlers.', function() {
            var returnTrueFn = function() {
                return true;
            };
            var returnFalseFn = function() {
                return false;
            };
            var returnNullFn = function() {
                return null;
            };
            var returnUndefinedFn = function() {
                return undefined; // eslint-disable-line no-undefined
            };
            var noopFn = function() {};

            it('at least one handler must return \'false\' to make invoke() return false.', function() {
                inst.on('beforeZoom', returnTrueFn);
                inst.on('beforeZoom', returnFalseFn);
                inst.on('beforeZoom', returnNullFn);

                inst.work();

                expect(spy).not.toHaveBeenCalled();
            });

            it('if not, invoke() will return true.', function() {
                inst.on('beforeZoom', returnTrueFn);
                inst.on('beforeZoom', returnUndefinedFn);
                inst.on('beforeZoom', noopFn);

                inst.work();

                expect(spy).toHaveBeenCalled();
            });
        });

        it('return true when no handler binded.', function() {
            function falseFn() {
                return false;
            }

            inst.work();
            expect(spy).toHaveBeenCalled();
            inst.on('beforeZoom', falseFn);
            inst.off('beforeZoom', falseFn);

            inst.work();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('should memorize', function() {
        it('specific context object.', function() {
            var inst = new CustomEvents();
            var obj = {};
            var obj2 = {};

            inst._memorizeContext(obj);
            inst._memorizeContext(obj2);
            expect(inst.contexts).toEqual([
                [obj, 1],
                [obj2, 1]
            ]);
        });

        it('and forget specific context object.', function() {
            var inst = new CustomEvents();
            var obj = {};
            var obj2 = {};

            inst._memorizeContext(obj);
            inst._memorizeContext(obj2);

            inst._forgetContext(obj2);

            expect(inst.contexts).toEqual([
                [obj, 1]
            ]);
        });

        it('context object and compute each context index.', function() {
            var inst = new CustomEvents();
            var obj = {};
            var obj2 = {};
            var obj3 = {};

            inst._memorizeContext(obj);
            inst._memorizeContext(obj2);

            expect(inst._indexOfContext(obj2)).toBe(1);
            expect(inst._indexOfContext(obj3)).toBe(-1);
        });
    });

    it('Can bind one-shot event.', function() {
        var spy = jasmine.createSpy();
        var inst = new CustomEvents();

        inst.once('foo', spy);

        inst.fire('foo');
        inst.fire('foo');

        expect(spy.calls.count()).toBe(1);
    });

    it('Can bind mutiple one-shot events.', function() {
        var spy = jasmine.createSpy();
        var inst = new CustomEvents();

        inst.once({
            'foo': spy,
            'bar': spy
        });

        inst.fire('foo');
        inst.fire('foo');
        inst.fire('bar');
        inst.fire('bar');

        expect(spy.calls.count()).toBe(2);
    });

    it('Can check specific event was binded.', function() {
        var inst = new CustomEvents();
        inst.on('test', function() {});

        expect(inst.hasListener('test')).toBe(true);
        expect(inst.hasListener('good')).not.toBe(true);
    });

    it('Can count event listeners.', function() {
        var inst = new CustomEvents();

        expect(inst.getListenerLength('foo')).toBe(0);

        inst.on('test', function() {});

        expect(inst.getListenerLength('test')).toBe(1);

        inst.off('test');

        expect(inst.getListenerLength('test')).toBe(0);
    });
});

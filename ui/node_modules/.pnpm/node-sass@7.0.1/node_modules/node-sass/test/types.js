/*eslint new-cap: ["error", { "capIsNew": false }]*/
'use strict';

var assert = require('assert').strict;
var sass = require('../');
var semver = require('semver');

describe('sass.types', function() {
  describe('Boolean', function() {
    it('exists', function() {
      assert(sass.types.Boolean);
    });

    it('names the constructor correctly', function() {
      assert.strictEqual(sass.types.Boolean.name, 'SassBoolean');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }
      var t = sass.types.Boolean(true);
      assert.strictEqual(t.toString(), '[object SassBoolean]');

      var f = sass.types.Boolean(false);
      assert.strictEqual(f.toString(), '[object SassBoolean]');
    });

    it('has true and false singletons', function() {
      assert.strictEqual(sass.types.Boolean(true), sass.types.Boolean(true));
      assert.strictEqual(sass.types.Boolean(false), sass.types.Boolean(false));
      assert.notStrictEqual(sass.types.Boolean(false), sass.types.Boolean(true));
      assert.strictEqual(sass.types.Boolean(true), sass.types.Boolean.TRUE);
      assert.strictEqual(sass.types.Boolean(false), sass.types.Boolean.FALSE);
    });

    it('supports DOES NOT support new constructor', function() {
      assert.throws(function() {
        new sass.types.Boolean(true);
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Cannot instantiate SassBoolean');
        return true;
      });
    });

    it('throws with incorrect constructor args', function() {
      assert.throws(function() {
        sass.types.Boolean();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected one boolean argument');
        return true;
      });

      [1, 2, '', 'hi', {}, []].forEach(function(arg) {
        assert.throws(function() {
          sass.types.Boolean(arg);
        }, function(error) {
          assert.ok(error instanceof TypeError);
          assert.strictEqual(error.message, 'Expected one boolean argument');
          return true;
        });
      });

      assert.throws(function() {
        sass.types.Boolean(true, false);
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected one boolean argument');
        return true;
      });
    });

    it('implements getValue', function() {
      var t = sass.types.Boolean(true);
      assert.strictEqual(typeof t.getValue, 'function');
      assert.strictEqual(t.getValue(), true);

      var f = sass.types.Boolean(false);
      assert.strictEqual(typeof f.getValue, 'function');
      assert.strictEqual(f.getValue(), false);
    });
  });

  describe('Color', function() {
    it('exists', function() {
      assert(sass.types.Color);
    });

    it('names the constructor correctly', function() {
      assert.strictEqual(sass.types.Color.name, 'SassColor');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var t = sass.types.Color();
      assert.strictEqual(t.toString(), '[object SassColor]');
    });

    it('supports new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var t = new sass.types.Color(1);
      assert.strictEqual(t.toString(), '[object SassColor]');
    });

    it('supports variadic constructor args', function() {
      var a = new sass.types.Color();

      assert.strictEqual(a.getR(), 0);
      assert.strictEqual(a.getG(), 0);
      assert.strictEqual(a.getB(), 0);
      assert.strictEqual(a.getA(), 1);

      var b = new sass.types.Color(1);

      assert.strictEqual(b.getR(), 0);
      assert.strictEqual(b.getG(), 0);
      assert.strictEqual(b.getB(), 1);
      assert.strictEqual(b.getA(), 0); // why ?

      assert.throws(function() {
        new sass.types.Color(1, 2);
      }, function(error) {
        // assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Constructor should be invoked with either 0, 1, 3 or 4 arguments.');
        return true;
      });

      var c = new sass.types.Color(1, 2, 3);

      assert.strictEqual(c.getR(), 1);
      assert.strictEqual(c.getG(), 2);
      assert.strictEqual(c.getB(), 3);
      assert.strictEqual(c.getA(), 1);

      var d = new sass.types.Color(1, 2, 3, 4);

      assert.strictEqual(d.getR(), 1);
      assert.strictEqual(d.getG(), 2);
      assert.strictEqual(d.getB(), 3);
      assert.strictEqual(d.getA(), 4);

      assert.throws(function() {
        new sass.types.Color(1, 2, 3, 4, 5);
      }, function(error) {
        // assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Constructor should be invoked with either 0, 1, 3 or 4 arguments.');
        return true;
      });
    });

    it('supports get{R,G,B,A} and set{R,G,B,A}', function() {
      var c = new sass.types.Color();

      assert.strictEqual(c.getR(), 0);
      assert.strictEqual(c.getG(), 0);
      assert.strictEqual(c.getB(), 0);
      assert.strictEqual(c.getA(), 1);

      assert.strictEqual(c.setR(1), undefined);

      assert.strictEqual(c.getR(), 1);
      assert.strictEqual(c.getG(), 0);
      assert.strictEqual(c.getB(), 0);
      assert.strictEqual(c.getA(), 1);

      assert.strictEqual(c.setG(1), undefined);

      assert.strictEqual(c.getR(), 1);
      assert.strictEqual(c.getG(), 1);
      assert.strictEqual(c.getB(), 0);
      assert.strictEqual(c.getA(), 1);

      assert.strictEqual(c.setB(1), undefined);

      assert.strictEqual(c.getR(), 1);
      assert.strictEqual(c.getG(), 1);
      assert.strictEqual(c.getB(), 1);
      assert.strictEqual(c.getA(), 1);

      assert.strictEqual(c.setA(0), undefined);

      assert.strictEqual(c.getR(), 1);
      assert.strictEqual(c.getG(), 1);
      assert.strictEqual(c.getB(), 1);
      assert.strictEqual(c.getA(), 0);
    });

    it('throws with incorrect set{R,G,B,A} arguments', function() {
      var c = new sass.types.Color();

      function assertJustOneArgument(cb) {
        assert.throws(function() {
          cb();
        }, function(error) {
          assert.ok(error instanceof TypeError);
          assert.strictEqual(error.message, 'Expected just one argument');

          return true;
        });
      }

      function assertNumberArgument(arg, cb) {
        assert.throws(function() {
          cb();
        }, function(error) {
          assert.ok(error instanceof TypeError);
          assert.strictEqual(error.message, 'Supplied value should be a number');

          return true;
        }, 'argument was: ' + arg);
      }

      assertJustOneArgument(function() { c.setR(); });
      assertJustOneArgument(function() { c.setG(); });
      assertJustOneArgument(function() { c.setB(); });
      assertJustOneArgument(function() { c.setA(); });

      assertJustOneArgument(function() { c.setR(1, 2); });
      assertJustOneArgument(function() { c.setG(1, 2); });
      assertJustOneArgument(function() { c.setB(1, 2); });
      assertJustOneArgument(function() { c.setA(1, 2); });

      [true, false, '0', '1', '', 'omg', {}, []].forEach(function(arg) {
        assertNumberArgument(arg, function() { c.setR(arg); });
        assertNumberArgument(arg, function() { c.setG(arg); });
        assertNumberArgument(arg, function() { c.setB(arg); });
        assertNumberArgument(arg, function() { c.setA(arg); });
      });
    });
  });

  describe('Error', function() {
    it('exists', function() {
      assert(sass.types.Error);
    });

    it('has a correctly named constructor', function() {
      assert.strictEqual(sass.types.Error.name, 'SassError');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var e = sass.types.Error('Such Error');
      assert.ok(e instanceof sass.types.Error);
      assert.strictEqual(e.toString(), '[object SassError]');

      // TODO: I'm not sure this object works well, it likely needs to be fleshed out more...
    });

    it('supports new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var e = new sass.types.Error('Such Error');
      assert.ok(e instanceof sass.types.Error);
      assert.strictEqual(e.toString(), '[object SassError]');
      // TODO: I'm not sure this object works well, it likely needs to be fleshed out more...
    });
  });

  describe('List', function() {
    it('exists', function() {
      assert(sass.types.List);
    });

    it('has a correctly named constructor', function() {
      assert.strictEqual(sass.types.List.name, 'SassList');
    });

    it('support call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var list = sass.types.List();
      assert.ok(list instanceof sass.types.List);
      assert.strictEqual(list.toString(), '[object SassList]');
    });

    it('support new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var list = new sass.types.List();
      assert.ok(list instanceof sass.types.List);
      assert.strictEqual(list.toString(), '[object SassList]');
    });

    it('support variadic constructor', function() {
      var a = new sass.types.List();
      assert.strictEqual(a.getLength(), 0);
      assert.strictEqual(a.getSeparator(), true);
      var b = new sass.types.List(1);
      assert.strictEqual(b.getSeparator(), true);
      assert.strictEqual(b.getLength(), 1);
      var c = new sass.types.List(1, true);
      assert.strictEqual(b.getLength(), 1);
      assert.strictEqual(c.getSeparator(), true);
      var d = new sass.types.List(1, false);
      assert.strictEqual(b.getLength(), 1);
      assert.strictEqual(d.getSeparator(), false);
      var e = new sass.types.List(1, true, 2);
      assert.strictEqual(b.getLength(), 1);
      assert.strictEqual(e.getSeparator(), true);

      assert.throws(function() {
        new sass.types.List('not-a-number');
      }, function(error) {
        // TODO: TypeError
        assert.strictEqual(error.message, 'First argument should be an integer.');
        return true;
      });

      assert.throws(function() {
        new sass.types.List(1, 'not-a-boolean');
      }, function(error) {
        // TODO: TypeError
        assert.strictEqual(error.message, 'Second argument should be a boolean.');
        return true;
      });
    });

    it('supports {get,set}Separator', function() {
      var a = new sass.types.List();
      assert.strictEqual(a.getSeparator(), true);
      assert.strictEqual(a.setSeparator(true), undefined);
      assert.strictEqual(a.getSeparator(), true);
      assert.strictEqual(a.setSeparator(false), undefined);
      assert.strictEqual(a.getSeparator(), false);

      assert.throws(function() {
        a.setSeparator();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');
        return true;
      });

      [1, '', [], {}].forEach(function(arg) {
        assert.throws(function() {
          a.setSeparator(arg);
        }, function(error) {
          assert.ok(error instanceof TypeError);
          assert.strictEqual(error.message, 'Supplied value should be a boolean');
          return true;
        }, 'setSeparator(' + arg + ')');
      });
    });

    it('supports setValue and getValue', function() {
      var a = new sass.types.List();

      assert.throws(function() {
        a.getValue();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');

        return true;
      });

      ['hi', [], {}].forEach(function(arg) {
        assert.throws(function() {
          a.getValue(arg);
        }, function(error) {
          assert.ok(error instanceof TypeError);
          assert.strictEqual(error.message, 'Supplied index should be an integer');

          return true;
        }, 'getValue(' + arg + ')');
      });

      assert.throws(function() {
        a.getValue(0);
      }, function(error) {
        assert.ok(error instanceof RangeError);
        assert.strictEqual(error.message, 'Out of bound index');

        return true;
      });

      assert.throws(function() {
        a.getValue(-1);
      }, function(error) {
        assert.ok(error instanceof RangeError);
        assert.strictEqual(error.message, 'Out of bound index');

        return true;
      });

      assert.throws(function() {
        a.setValue();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected two arguments');
        return true;
      });

      assert.throws(function() {
        a.setValue(1);
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected two arguments');
        return true;
      });

      assert.throws(function() {
        a.setValue(0, 'no-a-sass-value');
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Supplied value should be a SassValue object');
        return true;
      });
    });

    // TODO: more complex set/get value scenarios
  });

  describe('Map', function() {
    it('exists', function() {
      assert(sass.types.Map);
    });

    it('has a correctly named constructor', function() {
      assert.strictEqual(sass.types.Map.name, 'SassMap');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var x = sass.types.Map();
      assert.strictEqual(x.toString(), '[object SassMap]');
    });

    it('supports new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var x = new sass.types.Map();
      assert.strictEqual(x.toString(), '[object SassMap]');
    });

    it('supports an optional constructor argument', function() {
      var x = new sass.types.Map();
      var y = new sass.types.Map(1);
      var z = new sass.types.Map(2, 3);

      assert.throws(function() {
        new sass.types.Map('OMG');
      }, function(error) {
        assert.strictEqual(error.message, 'First argument should be an integer.');
        // TODO: TypeError

        return true;
      });

      assert.strictEqual(x.getLength(), 0);
      assert.strictEqual(y.getLength(), 1);
      assert.strictEqual(z.getLength(), 2);
    });

    it('supports length', function() {
      var y = new sass.types.Map(1);
      var z = new sass.types.Map(2);

      assert.strictEqual(y.getLength(), 1);
      assert.strictEqual(z.getLength(), 2);
    });

    it('supports {get,set}Value {get,set}Key', function() {
      var y = new sass.types.Map(1);
      var omg = new sass.types.String('OMG');
      y.setValue(0, omg);
      console.log(y.getValue(0));
    });
  });

  describe('Null', function() {
    it('exists', function() {
      assert(sass.types.Null);
    });

    it('has a correctly named constructor', function() {
      assert.strictEqual(sass.types.Null.name, 'SassNull');
    });

    it('does not support new constructor', function() {
      assert.throws(function() {
        new sass.types.Null();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Cannot instantiate SassNull');
        return true;
      });
    });

    it('supports call constructor (and is a singleton)', function() {
      assert.strictEqual(sass.types.Null(), sass.types.Null());
      assert.strictEqual(sass.types.Null(), sass.types.Null.NULL);
    });
  });

  describe('Number', function() {
    it('exists', function() {
      assert(sass.types.Number);
    });

    it('has a correctly named constructor', function() {
      assert.strictEqual(sass.types.Number.name, 'SassNumber');
    });

    it('supports new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var number = new sass.types.Number();
      assert.strictEqual(number.toString(), '[object SassNumber]');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var number = sass.types.Number();
      assert.strictEqual(number.toString(), '[object SassNumber]');
    });

    it('supports multiple constructor arguments', function() {
      var a = new sass.types.Number();
      var b = new sass.types.Number(1);
      var c = new sass.types.Number(2, 'px');

      assert.throws(function() {
        new sass.types.Number('OMG');
      }, function(error) {
        // TODO: TypeError
        assert.strictEqual(error.message, 'First argument should be a number.');
        return true;
      });

      assert.throws(function() {
        new sass.types.Number(1, 2);
      }, function(error) {
        // TODO: TypeError
        assert.strictEqual(error.message, 'Second argument should be a string.');
        return true;
      });

      assert.strictEqual(a.getValue(), 0);
      assert.strictEqual(a.getUnit(), '');
      assert.strictEqual(b.getValue(), 1);
      assert.strictEqual(b.getUnit(), '');
      assert.strictEqual(c.getValue(), 2);
      assert.strictEqual(c.getUnit(), 'px');
    });

    it('supports get{Unit,Value}, set{Unit,Value}', function() {
      var number = new sass.types.Number(1, 'px');
      assert.strictEqual(number.getValue(), 1);
      assert.strictEqual(number.getUnit(), 'px');

      number.setValue(2);
      assert.strictEqual(number.getValue(), 2);
      assert.strictEqual(number.getUnit(), 'px');

      number.setUnit('em');
      assert.strictEqual(number.getValue(), 2);
      assert.strictEqual(number.getUnit(), 'em');

      assert.throws(function() {
        number.setValue('OMG');
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Supplied value should be a number');
        return true;
      });

      assert.throws(function() {
        number.setValue();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');
        return true;
      });

      assert.throws(function() {
        number.setUnit();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');
        return true;
      });

      assert.throws(function() {
        number.setUnit(1);
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Supplied value should be a string');
        return true;
      });
    });
  });

  describe('String', function() {
    it('exists', function() {
      assert(sass.types.String);
    });

    it('has a properly named constructor', function() {
      assert.strictEqual(sass.types.String.name, 'SassString');
    });

    it('supports call constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var x = sass.types.String('OMG');

      assert.strictEqual(x.toString(), '[object SassString]');
      assert.strictEqual(x.getValue(), 'OMG');
    });

    it('supports new constructor', function() {
      if(semver.gt(process.version, 'v14.5.0')) {
        // v8 issue tracked in https://github.com/sass/node-sass/issues/2972
        this.skip();
      }

      var x = new sass.types.String('OMG');

      assert.strictEqual(x.toString(), '[object SassString]');
      assert.strictEqual(x.getValue(), 'OMG');
    });

    it('supports multiple constructor arg combinations', function() {
      new sass.types.String();
      new sass.types.String('OMG');
      new sass.types.String('OMG', 'NOPE');

      [null, undefined, [], {}, function() { }].forEach(function(arg) {
        assert.throws(function() {
          new sass.types.String(arg);
        }, function(error) {
          // TODO: TypeError
          assert.strictEqual(error.message, 'Argument should be a string.');
          return true;
        });
      });
    });

    it('supports {get,set}Value', function() {
      var x = new sass.types.String();

      assert.strictEqual(x.getValue(), '');
      assert.strictEqual(x.setValue('hi'), undefined);
      assert.strictEqual(x.getValue(), 'hi');
      assert.strictEqual(x.setValue('bye'), undefined);
      assert.strictEqual(x.getValue(), 'bye');

      assert.throws(function() {
        x.setValue();
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');
        return true;
      });

      assert.throws(function() {
        x.setValue('hi', 'hi');
      }, function(error) {
        assert.ok(error instanceof TypeError);
        assert.strictEqual(error.message, 'Expected just one argument');
        return true;
      });
    });
  });
});

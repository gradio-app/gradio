var assert = require('assert').strict,
  ua = require('../scripts/util/useragent'),
  opts = require('../scripts/util/downloadoptions');


describe('util', function() {
  describe('downloadoptions', function() {
    describe('without a proxy', function() {
      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: true,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });
    });

    describe('with an npm config proxy', function() {
      var proxy = 'http://test.proxy:1234';

      before(function() {
        process.env.npm_config_proxy = proxy;
      });

      after(function() {
        delete process.env.npm_config_proxy;
      });

      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: true,
          proxy: proxy,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });
    });

    describe('with an env proxy proxy', function() {
      var proxy = 'http://test.proxy:1234';

      before(function() {
        process.env.HTTP_PROXY = proxy;
      });

      after(function() {
        delete process.env.HTTP_PROXY;
      });

      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: true,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });
    });

    describe('with SASS_REJECT_UNAUTHORIZED set to false', function() {
      beforeEach(function() {
        process.env.SASS_REJECT_UNAUTHORIZED = '0';
      });

      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: false,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });
    });

    describe('with SASS_REJECT_UNAUTHORIZED set to true', function() {
      beforeEach(function() {
        process.env.SASS_REJECT_UNAUTHORIZED = '1';
      });

      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: true,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });
    });

    describe('with npm_config_sass_reject_unauthorized set to true', function() {
      beforeEach(function() {
        process.env.npm_config_sass_reject_unauthorized = true;
      });

      it('should look as we expect', function() {
        var expected = {
          rejectUnauthorized: true,
          timeout: 60000,
          headers: {
            'User-Agent': ua(),
          },
          encoding: null,
        };

        assert.deepStrictEqual(opts(), expected);
      });

      afterEach(function() {
        process.env.npm_config_sass_reject_unauthorized = undefined;
      });
    });
  });
});

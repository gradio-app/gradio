'use strict';

var browser = require('../src/js/browser');

describe('browser', function() {
    it('should detect web browser', function() {
        var key, hasTrueValue = false;

        for (key in browser) {
            if (browser.hasOwnProperty(key)) {
                if (browser[key]) {
                    hasTrueValue = true;
                    break;
                }
            }
        }

        expect(hasTrueValue).toBe(true);
    });
});

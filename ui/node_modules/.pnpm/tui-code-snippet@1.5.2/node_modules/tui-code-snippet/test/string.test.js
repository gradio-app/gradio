'use strict';

var string = require('../src/js/string');

describe('type', function() {
    it('encodeHTMLEntity()', function() {
        var htmlEntityString = '<script> alert(\'test\');</script><a href=\'test\'>',
            expectString = '&lt;script&gt; alert(&#39;test&#39;);&lt;/script&gt;&lt;a href=&#39;test&#39;&gt;';

        expect(string.encodeHTMLEntity(htmlEntityString)).toEqual(expectString);
    });
    it('decodeHTMLEntity()', function() {
        var htmlEntityString = 'A &#39;quote&#39; is &lt;b&gt;bold&lt;/b&gt;',
            expectString = 'A \'quote\' is <b>bold</b>';
        expect(string.decodeHTMLEntity(htmlEntityString)).toEqual(expectString);
    });
    it('hasEncodableString()', function() {
        var s1 = 'te < st',
            s2 = 'te > st',
            s3 = 'te __ st',
            s4 = 'te " st',
            s5 = 'te \' st',
            s6 = '<script> alert(\'test\');</script><a href=\'test\'>';

        expect(string.hasEncodableString(s1)).toBe(true);
        expect(string.hasEncodableString(s2)).toBe(true);
        expect(string.hasEncodableString(s3)).toBe(false);
        expect(string.hasEncodableString(s4)).toBe(true);
        expect(string.hasEncodableString(s5)).toBe(true);
        expect(string.hasEncodableString(s6)).toBe(true);
    });
    it('getDuplicatedChar() not include blank', function() {
        var str1 = 'abcdefghijk',
            str2 = 'fe team',
            str3 = 'nhn entertainment',
            str4 = 'will be success finally',
            str5 = 'kill me heal me',
            str6 = 'khan zi';
        expect(string.getDuplicatedChar(str1, str2)).toBe('aef');
        expect(string.getDuplicatedChar(str1, str3)).toBe('aehi');
        expect(string.getDuplicatedChar(str3, str4)).toBe(' aein');
        expect(string.getDuplicatedChar(str5, str6)).toBe(' ahik');
    });
});

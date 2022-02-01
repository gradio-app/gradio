[![build status](https://secure.travis-ci.org/dankogai/js-base64.png)](http://travis-ci.org/dankogai/js-base64)

# base64.js

Yet another Base64 transcoder

## Usage

### Install

```javascript
$ npm install --save js-base64
```

If you are using it on ES6 transpilers, you may also need:

```javascript
$ npm install --save babel-preset-env
```

Note `js-base64` itself is stand-alone so its `package.json` has no `dependencies`.  However, it is also tested on ES6 environment so `"babel-preset-env": "^1.7.0"` is on `devDependencies`.


### In Browser

* Locally

```html
<script src="base64.js"></script>
```

* Directly from CDN.  In which case you don't even need to install.

```html
<!-- the latest -->
<script src="https://cdn.jsdelivr.net/npm/js-base64/base64.min.js">
```

```html
<!-- with version fixed -->
<script src="https://cdn.jsdelivr.net/npm/js-base64@2.6.4/base64.min.js">
```

### node.js

```javascript
var Base64 = require('js-base64').Base64;
```

## es6+

```javascript
import { Base64 } from 'js-base64';
```

## SYNOPSIS

```javascript
Base64.encode('dankogai'); // ZGFua29nYWk=
Base64.btoa(  'dankogai'); // ZGFua29nYWk=
Base64.fromUint8Array(     // ZGFua29nYWk=
    new Uint8Array([100,97,110,107,111,103,97,105])
);
Base64.fromUint8Array(     // ZGFua29nYW which is URI safe
    new Uint8Array([100,97,110,107,111,103,97,105]), true
);
Base64.encode(   '小飼弾'); // 5bCP6aO85by+
Base64.encodeURI('小飼弾'); // 5bCP6aO85by- which equals to Base64.encode('小飼弾', true)
Base64.btoa(     '小飼弾'); // raises exception 
```

```javascript
Base64.decode('ZGFua29nYWk=');  // dankogai
Base64.atob(  'ZGFua29nYWk=');  // dankogai
Base64.toUint8Array(            // new Uint8Array([100,97,110,107,111,103,97,105])
    'ZGFua29nYWk='
);
Base64.decode('5bCP6aO85by+');  // 小飼弾
// note .decodeURI() is unnecessary since it accepts both flavors
Base64.decode('5bCP6aO85by-');  // 小飼弾
Base64.atob(  '5bCP6aO85by+');  // 'å°é£¼å¼¾' which is nonsense
```

### String Extension for ES5

```javascript
if (Base64.extendString) {
    // you have to explicitly extend String.prototype
    Base64.extendString();
    // once extended, you can do the following
    'dankogai'.toBase64();        // ZGFua29nYWk=
    '小飼弾'.toBase64();           // 5bCP6aO85by+
    '小飼弾'.toBase64(true);       // 5bCP6aO85by-
    '小飼弾'.toBase64URI();        // 5bCP6aO85by-
    'ZGFua29nYWk='.fromBase64();  // dankogai
    '5bCP6aO85by+'.fromBase64();  // 小飼弾
    '5bCP6aO85by-'.fromBase64();  // 小飼弾
}
```

### TypeScript

TypeScript 2.0 type definition was added to the [DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped).

```bash
$ npm install --save @types/js-base64
```

## `.decode()` vs `.atob` (and `.encode()` vs `btoa()`)

Suppose you have:

```
var pngBase64 = 
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
```

Which is a Base64-encoded 1x1 transparent PNG, **DO NOT USE** `Base64.decode(pngBase64)`.  Use `Base64.atob(pngBase64)` instead.  `Base64.decode()` decodes to UTF-8 string while `Base64.atob()` decodes to bytes, which is compatible to browser built-in `atob()` (Which is absent in node.js).  The same rule applies to the opposite direction.


## SEE ALSO

+ http://en.wikipedia.org/wiki/Base64

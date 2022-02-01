# semiver [![Build Status](https://badgen.now.sh/travis/lukeed/semiver)](https://travis-ci.org/lukeed/semiver)

> A tiny (187B) utility to compare semver strings.

Compare semver strings (eg, `1.8.2`, `2.0.0-next.6`, `0.0.0-alpha-1`, etc) using the [`Intl.Collator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator) class.<br>
Version suffixes are supported and are considered during comparison.

The output will always be `0`, `1`, or `-1`, allowing `semiver` to be used directly as a compare function for [`Array.sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

This module exposes three module definitions:

* **ES Module**: `dist/semiver.mjs`
* **CommonJS**: `dist/semiver.js`
* **UMD**: `dist/semiver.min.js`


## Install

```
$ npm install --save semiver
```


## Usage

```js
import semiver from 'semiver';

// A === B
semiver('0.0.0', '0.0.0'); //=> 0
semiver('1.2.3', '1.2.3'); //=> 0

// A > B
semiver('2.1.0', '1.9.0'); //=> 1
semiver('1.9.1', '1.9.0'); //=> 1
semiver('10.0.0', '1.0.0'); //=> 1
semiver('10.0.0', '8.9.0'); //=> 1
semiver('1.2.3-next.10', '1.2.3-next.6'); //=> 1
semiver('2.0.0-alpha-10', '2.0.0-alpha-6'); //=> 1
semiver('2.0.0-beta.1', '2.0.0-alpha.8'); //=> 1

// A < B
semiver('1.9.0', '2.1.0'); //=> -1
semiver('1.9.0', '1.9.1'); //=> -1
semiver('1.0.0', '10.0.0'); //=> -1
semiver('8.9.0', '10.0.0'); //=> -1
semiver('1.2.3-next.6', '1.2.3-next.10'); //=> -1
semiver('2.0.0-alpha-6', '2.0.0-alpha-10'); //=> -1
semiver('2.0.0-alpha.8', '2.0.0-beta.1'); //=> -1

// Sorting
[
  '4.11.6', '4.2.0',
  '1.5.19', '1.5.5',
  '1.0.0', '1.0.0-rc.1',
  '1.2.3', '1.2.3-alpha',
  '1.0.0-alpha.1', '1.0.0-alpha',
  '1.0.0-beta.11', '1.0.0-beta'
].sort(semiver);
/*
  [ '1.0.0-alpha',
    '1.0.0-alpha.1',
    '1.0.0-beta',
    '1.0.0-beta.11',
    '1.0.0-rc.1',
    '1.0.0',
    '1.2.3-alpha',
    '1.2.3',
    '1.5.5',
    '1.5.19',
    '4.2.0',
    '4.11.6' ]
*/
```


## API

### semiver(a, b)

Returns: `Number`

* `0` indicates that `a` is equal to `b`
* `-1` indicates that `a` is less than `b`
* `1` indicates that `a` is greater than `b`

#### a
Type: `String`

The input string to compare.

#### b
Type: `String`

The string to compare against.


## License

MIT © [Luke Edwards](https://lukeed.com)

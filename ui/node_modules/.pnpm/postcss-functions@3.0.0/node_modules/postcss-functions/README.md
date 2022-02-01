# postcss-functions [![Build Status][ci-img]][ci]

[PostCSS] plugin for exposing JavaScript functions.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/andyjansson/postcss-functions.svg
[ci]:      https://travis-ci.org/andyjansson/postcss-functions

## Installation

```js
npm install postcss-functions
```

## Usage

```js
var fs = require('fs');
var postcss = require('postcss');
var functions = require('postcss-functions');

var options = {
	//options
};

var css = fs.readFileSync('input.css', 'utf8');

postcss()
  .use(functions(options))
  .process(css)
  .then(function (result) {
    var output = result.css;
  });
```

**Example** of a function call:

```css
body {
	prop: foobar();
}
```

## Options

### `functions`

Type: `Object`

An object containing functions. The function name will correspond with the object key.

**Example:**

```js
var color = require('css-color-converter');
```

```js
require('postcss-functions')({
    functions: {
        darken: function (value, frac) {
           var darken = 1 - parseFloat(frac);
           var rgba = color(value).toRgbaArray();
           var r = rgba[0] * darken;
           var g = rgba[1] * darken;
           var b = rgba[2] * darken;
           return color([r,g,b]).toHexString();
        }
    }
});
```

```css
.foo {
    /* make 10% darker */
    color: darken(blue, 0.1);
}
```

### `glob`

Type: `string|string[]`

Loads files as functions based on one or more glob patterns. The function name will correspond with the file name.

**Example:**

```js
require('postcss-functions')({
	glob: path.join(__dirname, 'functions', '*.js')
});
```

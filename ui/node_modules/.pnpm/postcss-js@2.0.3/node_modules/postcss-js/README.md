# PostCSS JS [![Build Status][ci-img]][ci]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

[PostCSS] for React Inline Styles, Radium, JSS and other CSS-in-JS.

For example, to use [Stylelint], [RTLCSS] or [postcss-write-svg] plugins
in your workflow.

[postcss-write-svg]: https://github.com/jonathantneal/postcss-write-svg
[Stylelint]:         https://github.com/stylelint/stylelint
[PostCSS]:           https://github.com/postcss/postcss
[RTLCSS]:            https://github.com/MohammadYounes/rtlcss
[ci-img]:            https://travis-ci.org/postcss/postcss-js.svg
[ci]:                https://travis-ci.org/postcss/postcss-js

## Usage

### Installation

```sh
npm i postcss-js
```

### Processing

```js
const postcssJs = require('postcss-js')
const autoprefixer = require('autoprefixer')

const prefixer = postcssJs.sync([ autoprefixer ]);

const style = prefixer({
    userSelect: 'none'
});

style //=> {
      //     WebkitUserSelect: 'none',
      //        MozUserSelect: 'none',
      //         msUserSelect: 'none',
      //           userSelect: 'none'
      //   }
```

### Compile CSS-in-JS to CSS

```js
const postcss = require('postcss')
const postcssJs = require('postcss-js')

const style = {
    top: 10,
    '&:hover': {
        top: 5
    }
};

postcss().process(style, { parser: postcssJs }).then( (result) => {
    result.css //=> top: 10px;
               //   &:hover { top: 5px; }
})
```

### Compile CSS to CSS-in-JS

```js
const postcss = require('postcss')
const postcssJs = require('postcss-js')

const css  = '@media screen { z-index: 1 }'
const root = postcss.parse(css);

postcssJs.objectify(root) //=> { '@media screen': { zIndex: '1' } }
```

## API

### `sync(plugins): function`

Create PostCSS processor with simple API, but with only sync PostCSS plugins
support.

Processor is just a function, which takes one style object and return other.

### `async(plugins): function`

Same as `sync`, but also support async plugins.

Returned processor will return Promise.

### `parse(obj): Root`

Parse CSS-in-JS style object to PostCSS `Root` instance.

It converts numbers to pixels and parses
[Free Style] like selectors and at-rules:

```js
{
    '@media screen': {
        '&:hover': {
            top: 10
        }
    }
}
```

This methods use Custom Syntax name convention, so you can use it like this:

```js
postcss().process(obj, { parser: postcssJs })
```

### `objectify(root): object`

Convert PostCSS `Root` instance to CSS-in-JS style object.

## Troubleshoot

Webpack may need some extra config for some PostCSS plugins.

### `Module parse failed`

Autoprefixer and some other plugins
need a [json-loader](https://github.com/webpack/json-loader) to import data.

So, please install this loader and add to webpack config:

```js
loaders: [
    {
        test: /\.json$/,
        loader: "json-loader"
    }
]
```

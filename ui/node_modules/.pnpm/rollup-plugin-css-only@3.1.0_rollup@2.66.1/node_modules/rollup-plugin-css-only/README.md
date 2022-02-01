# Rollup plugin that bundles imported css

<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
</a>
<a href="https://github.com/thgh/rollup-plugin-css-only/issues">
  <img src="https://img.shields.io/github/issues/thgh/rollup-plugin-css-only.svg" alt="Issues" />
</a>
<a href="http://standardjs.com/">
  <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
</a>
<a href="https://npmjs.org/package/rollup-plugin-css-only">
  <img src="https://img.shields.io/npm/v/rollup-plugin-css-only.svg?style=flat-squar" alt="NPM" />
</a>
<a href="https://github.com/thgh/rollup-plugin-css-only/releases">
  <img src="https://img.shields.io/github/release/thgh/rollup-plugin-css-only.svg" alt="Latest Version" />
</a>
  
## Installation
```
npm install --save-dev rollup-plugin-css-only

# If using Node.js lower than 10.12
npm install --save-dev rollup-plugin-css-only@1
```

## Usage
```js
// rollup.config.js
import css from 'rollup-plugin-css-only'

export default {
  entry: 'entry.js',
  dest: 'bundle.js',
  plugins: [
    css({ output: 'bundle.css' })
  ]
}
```

```js
// entry.js
import './reset.css'
import './layout.css'

import Vue from 'vue'
```

### Options

The idea is to keep the options similar to [rollup-plugin-sass](https://github.com/differui/rollup-plugin-sass).

There is 1 option: `output`.
By default the plugin will base the filename for the css on the bundle destination.

```js
css({
  // Filename to write all styles to
  output: 'bundle.css',

  // Callback that will be called ongenerate with two arguments:
  // - styles: the contents of all style tags combined: 'body { color: green }'
  // - styleNodes: an array of style objects: [{lang: 'css', content: 'body { color: green }'}]
  output: function (styles, styleNodes) {
    writeFileSync('bundle.css', styles)
  },

  // Disable any style output or callbacks
  output: false,

  // Default behaviour is to write all styles to the bundle destination where .js is replaced by .css
  output: null
})
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Contributions and feedback are very welcome.

To get it running:
  1. Clone the project.
  2. `npm install`
  3. `npm run build`

## Credits

- [Thomas Ghysels](https://github.com/thgh)
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/thgh
[link-contributors]: ../../contributors
[rollup-plugin-vue]: https://www.npmjs.com/package/rollup-plugin-vue
[rollup-plugin-buble]: https://www.npmjs.com/package/rollup-plugin-buble
[rollup-plugin-babel]: https://www.npmjs.com/package/rollup-plugin-babel
[vue-template-compiler]: https://www.npmjs.com/package/vue-template-compiler

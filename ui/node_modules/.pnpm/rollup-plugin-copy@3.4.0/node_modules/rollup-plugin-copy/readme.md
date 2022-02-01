# rollup-plugin-copy

[![Build Status](https://travis-ci.com/vladshcherbin/rollup-plugin-copy.svg?branch=master)](https://travis-ci.com/vladshcherbin/rollup-plugin-copy)
[![Codecov](https://codecov.io/gh/vladshcherbin/rollup-plugin-copy/branch/master/graph/badge.svg)](https://codecov.io/gh/vladshcherbin/rollup-plugin-copy)

Copy files and folders, with glob support.

## Installation

```bash
# yarn
yarn add rollup-plugin-copy -D

# npm
npm install rollup-plugin-copy -D
```

## Usage

```js
// rollup.config.js
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'cjs'
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist/public' },
        { src: ['assets/fonts/arial.woff', 'assets/fonts/arial.woff2'], dest: 'dist/public/fonts' },
        { src: 'assets/images/**/*', dest: 'dist/public/images' }
      ]
    })
  ]
}
```

### Configuration

There are some useful options:

#### targets

Type: `Array` | Default: `[]`

Array of targets to copy. A target is an object with properties:

- **src** (`string` `Array`): Path or glob of what to copy
- **dest** (`string` `Array`): One or more destinations where to copy
- **rename** (`string` `Function`): Change destination file or folder name
- **transform** (`Function`): Modify file contents

Each object should have **src** and **dest** properties, **rename** and **transform** are optional. [globby](https://github.com/sindresorhus/globby) is used inside, check it for [glob pattern](https://github.com/sindresorhus/globby#globbing-patterns) examples.

##### File

```js
copy({
  targets: [{ src: 'src/index.html', dest: 'dist/public' }]
})
```

##### Folder

```js
copy({
  targets: [{ src: 'assets/images', dest: 'dist/public' }]
})
```

##### Glob

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }]
})
```

##### Glob: multiple items

```js
copy({
  targets: [{ src: ['src/index.html', 'src/styles.css', 'assets/images'], dest: 'dist/public' }]
})
```

##### Glob: negated patterns

```js
copy({
  targets: [{ src: ['assets/images/**/*', '!**/*.gif'], dest: 'dist/public/images' }]
})
```

##### Multiple targets

```js
copy({
  targets: [
    { src: 'src/index.html', dest: 'dist/public' },
    { src: 'assets/images/**/*', dest: 'dist/public/images' }
  ]
})
```

##### Multiple destinations

```js
copy({
  targets: [{ src: 'src/index.html', dest: ['dist/public', 'build/public'] }]
})
```

##### Rename with a string

```js
copy({
  targets: [{ src: 'src/app.html', dest: 'dist/public', rename: 'index.html' }]
})
```

##### Rename with a function

```js
copy({
  targets: [{
    src: 'assets/docs/*',
    dest: 'dist/public/docs',
    rename: (name, extension, fullPath) => `${name}-v1.${extension}`
  }]
})
```

##### Transform file contents

```js
copy({
  targets: [{
    src: 'src/index.html',
    dest: 'dist/public',
    transform: (contents, filename) => contents.toString().replace('__SCRIPT__', 'app.js')
  }]
})
```

#### verbose

Type: `boolean` | Default: `false`

Output copied items to console.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  verbose: true
})
```

#### hook

Type: `string` | Default: `buildEnd`

[Rollup hook](https://rollupjs.org/guide/en/#hooks) the plugin should use. By default, plugin runs when rollup has finished bundling, before bundle is written to disk.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  hook: 'writeBundle'
})
```

#### copyOnce

Type: `boolean` | Default: `false`

Copy items once. Useful in watch mode.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  copyOnce: true
})
```

#### flatten

Type: `boolean` | Default: `true`

Remove the directory structure of copied files.

```js
copy({
  targets: [{ src: 'assets/**/*', dest: 'dist/public' }],
  flatten: false
})
```

All other options are passed to packages, used inside:
  - [globby](https://github.com/sindresorhus/globby)
  - [fs-extra copy function](https://github.com/jprichardson/node-fs-extra/blob/7.0.0/docs/copy.md)

## Original Author

[Cédric Meuter](https://github.com/meuter)

## License

MIT

# console-clear

> Clear the console, cross-platform


## Install

```
$ npm install --save console-clear
```


## Usage

```js
const clear = require('console-clear');

clear(true);
//=> allow scrollback

clear();
//=> no scrollback, if supported
```


## API

### clear(keepHistory)

#### keepHistory

Type: `boolean`<br>
Default: `false`

Clears the console, but keeps the scrollback history intact.

> **For Windows:** This may be the *only* behavior available. <br>ANSI control sequences, like clearing the scrollback buffer, are [only handled in _recent_ versions of the native Windows console host](http://www.nivot.org/blog/post/2016/02/04/Windows-10-TH2-(v1511)-Console-Host-Enhancements).

## License

MIT © [Luke Edwards](https://lukeed.com)

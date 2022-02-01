# Toast UI CodeSnippet

`tui-code-snippet` is group of utility methods to make ease with developing javascript applications.

It includes several features like `class simulation`, `browser detecting`, `type checking` and +30 more.

`tui-code-snippet` supports IE8+ and modern browsers and already has been used for [open source javascript components](http://github.com/nhn/) and many commercial projects in [NHN](http://www.nhn.com) corporation.

## Feature
* browser.js
  * Browser detecting modules
* collection.js
 * Modules to Process collecitons
 * Support util methods for collecitons
* customEvent.js
 * Custom event modules
 * Add/Remove/fire custom events
* defineClass.js
 * Defined classes module
* enum.js
 * Const value modules
 * Making immutability values but IE8 low
* func.js
 * Function modules
* hashMap.js
 * Hash map modules
 * Managing data by key/value
* inheritance.js
  * Simple inheritance modules (Nicholas C. Zakas, YUI Library)
  * Call supur constructor of superclass
  * Have to get inheritance before define child
  * Using mixin and inner object
* object.js
 * Object modules
 * Support utils to control object
* string.js
 * String processing modules
 * Support utils such as decodeHTMLEntity, encodeHTMLEntity
* type.js
 * Check data type
* window.js
 * Window object modules
 * You need 'postDataBridgeUrl' options to avoid IE11 popup form submit bug.
 * Different domain have x-domain issue.
* defineNamespace.js
 * Support utils to define namespace
* formatDate.js
 * Formating date strings modules
* defineModule.js
 * Support utils to define modules

## Documentation
* API: [https://nhn.github.io/tui.code-snippet/latest/](https://nhn.github.io/tui.code-snippet/latest/)
* Tutorial: [https://github.com/nhn/fe.javascript/wiki/Toast-UI-CodeSnippet](https://github.com/nhn/fe.javascript/wiki/Toast-UI-CodeSnippet)

## Tested Browsers
* browser:
   * IE8 ~ IE11
   * Edge
   * Chrome
   * Firefox
   * Safari

## Usage
### Use `npm`

Install the latest version using `npm` command:

```
$ npm install tui-code-snippet --save
```

or want to install the each version:

```
$ npm install tui-code-snippet@<version> --save
```

To access as module format in your code:

```javascript
var util = require('tui-code-snippet');
```

### Use `bower`
Install the latest version using `bower` command:

```
$ bower install tui-code-snippet
```

or want to install the each version:

```
$ bower install tui-code-snippet#<tag>
```

To access as namespace format in your code:

```javascript
var util = tui.util;
```

### Download
* [Download bundle files from `dist` folder](https://github.com/nhn/tui.code-snippet/tree/production/dist)
* [Download all sources for each version](https://github.com/nhn/tui.code-snippet/releases)

## License
[MIT LICENSE](https://github.com/nhn/tui.code-snippet/blob/master/LICENSE)

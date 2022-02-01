# require-relative

require-relative is a node.js program to require and resolve modules relative to a path of your choice.
It exploits node.js's own `module` module, and has no additional dependencies.

## Example

requiring modules relatively

```js
var relative = require('require-relative');

var someModule = relative('./some-module', '/home/kamicane');
var somePackage = relative('some-package', '/home/kamicane');
var isTrue = relative('./some-module.js', process.cwd()) === relative('./some-module.js');
```

resolving filenames relatively

```js
var relative = require('require-relative');

relative.resolve('./some-module', '/home/kamicane'); // /home/kamicane/some-module.js
relative.resolve('some-package', '/home/kamicane'); // /home/kamicane/node_modules/some-package/index.js
var isTrue = relative.resolve('./some-module.js', process.cwd()) === relative.resolve('./some-module.js');
```

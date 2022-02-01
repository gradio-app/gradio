/**
 * Simple example that is broken by design (conflicting options)
 *
 * Examples:
 *   $ node example3.js
 *   > Conflicting flags: -v
 */

var opts = require('..');

var options = [
  { short       : 'v'
  , description : 'Show version and exit'
  },
  { short       : 'v'
  , description : 'Be verbose'
  },
];

opts.parse(options);
console.log('Example 3');
process.exit(0);



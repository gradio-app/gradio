/**
 * Simple example with one optional parameter, including the help option.
 *
 * Examples:
 *   $ node example1.js
 *
 *   Example 1
 *   $ node example1.js -v
 *   > v1.0
 *
 *   $ node example1.js --version
 *   > v1.0
 *
 *   $ node example1.js -version
 *   > Unknown option: -version
 *
 *   $ node example1.js --help
 *   > Show version and exit
 *         -v, --version
 *     Show this help message
 *         --help
 */

var opts = require('..');

var options = [
  { short       : 'v'
  , long        : 'version'
  , description : 'Show version and exit'
  , callback    : function () { console.log('v1.0'); process.exit(1); }
  }
];

opts.parse(options, true);
console.log('Example 1');
process.exit(0);



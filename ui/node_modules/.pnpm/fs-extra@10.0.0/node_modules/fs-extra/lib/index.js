'use strict'

module.exports = {
  // Export promiseified graceful-fs:
  ...require('./fs'),
  // Export extra methods:
  ...require('./copy-sync'),
  ...require('./copy'),
  ...require('./empty'),
  ...require('./ensure'),
  ...require('./json'),
  ...require('./mkdirs'),
  ...require('./move-sync'),
  ...require('./move'),
  ...require('./output'),
  ...require('./path-exists'),
  ...require('./remove')
}

'use strict';
const resolveFrom = require('resolve-from');

module.exports = (fromDirectory, moduleId) => require(resolveFrom(fromDirectory, moduleId));

module.exports.silent = (fromDirectory, moduleId) => {
	try {
		return require(resolveFrom(fromDirectory, moduleId));
	} catch (_) {}
};

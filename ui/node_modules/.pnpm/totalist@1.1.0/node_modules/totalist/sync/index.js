const { join, resolve } = require('path');
const { readdirSync, statSync } = require('fs');

module.exports = function list(dir, callback, pre='') {
	dir = resolve('.', dir);
	let arr = readdirSync(dir);
	let i=0, abs, stats;
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = statSync(abs);
		stats.isDirectory()
			? list(abs, callback, join(pre, arr[i]))
			: callback(join(pre, arr[i]), abs, stats);
	}
}

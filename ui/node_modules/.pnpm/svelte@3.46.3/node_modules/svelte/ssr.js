'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var internal = require('./internal/index.js');

function onMount() { }
function beforeUpdate() { }
function afterUpdate() { }

Object.defineProperty(exports, 'SvelteComponent', {
	enumerable: true,
	get: function () {
		return internal.SvelteComponentDev;
	}
});
Object.defineProperty(exports, 'SvelteComponentTyped', {
	enumerable: true,
	get: function () {
		return internal.SvelteComponentTyped;
	}
});
Object.defineProperty(exports, 'createEventDispatcher', {
	enumerable: true,
	get: function () {
		return internal.createEventDispatcher;
	}
});
Object.defineProperty(exports, 'getAllContexts', {
	enumerable: true,
	get: function () {
		return internal.getAllContexts;
	}
});
Object.defineProperty(exports, 'getContext', {
	enumerable: true,
	get: function () {
		return internal.getContext;
	}
});
Object.defineProperty(exports, 'hasContext', {
	enumerable: true,
	get: function () {
		return internal.hasContext;
	}
});
Object.defineProperty(exports, 'onDestroy', {
	enumerable: true,
	get: function () {
		return internal.onDestroy;
	}
});
Object.defineProperty(exports, 'setContext', {
	enumerable: true,
	get: function () {
		return internal.setContext;
	}
});
Object.defineProperty(exports, 'tick', {
	enumerable: true,
	get: function () {
		return internal.tick;
	}
});
exports.afterUpdate = afterUpdate;
exports.beforeUpdate = beforeUpdate;
exports.onMount = onMount;

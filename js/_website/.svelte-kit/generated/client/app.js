export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15')
];

export const server_loads = [0];

export const dictionary = {
		"/": [~2],
		"/changelog": [~3],
		"/demos": [~4],
		"/docs": [~5],
		"/docs/block-layouts": [~7],
		"/docs/combining-interfaces": [~8],
		"/docs/components": [~9],
		"/docs/flagging": [~10],
		"/docs/js-client": [~11],
		"/docs/python-client": [~12],
		"/docs/themes": [~13],
		"/docs/[doc=valid_doc]": [~6],
		"/guides": [~14],
		"/guides/[guide=valid_guide]": [~15]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';
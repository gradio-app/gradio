import { P as PUBLIC_VERSION } from './version-Cn071fJZ.js';

if (typeof window !== 'undefined') {
	// @ts-expect-error
	((window.__svelte ??= {}).v ??= new Set()).add(PUBLIC_VERSION);
}

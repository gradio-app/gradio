export {
	// this proxy is very important, to ensure that we always refer to the same base Component class which is critical for our components to work
	SvelteComponent as SvelteComponentDev,
	SvelteComponent,
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	getAllContexts,
	hasContext,
	tick,
	createEventDispatcher,
	SvelteComponentTyped
	// @ts-ignore
} from "svelte/internal";

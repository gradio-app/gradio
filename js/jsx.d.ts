declare namespace svelte.JSX {
	interface DOMAttributes<T extends EventTarget> {
		theme?: string;
		"item-type"?: string;
		webkitdirectory?: boolean | string;
		mozdirectory?: boolean | string;
	}
}

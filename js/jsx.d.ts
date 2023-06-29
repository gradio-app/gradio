declare namespace svelteHTML {
	interface HTMLAttributes<T extends EventTarget> {
		webkitdirectory?: boolean | string;
		mozdirectory?: boolean | string;
	}
}

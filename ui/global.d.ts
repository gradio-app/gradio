declare namespace svelte.JSX {
	interface DOMAttributes<T extends EventTarget> {
		theme?: string;
		"item-type"?: string;
	}
}

declare namespace global {
	interface Window {
		gradio_mode: "app" | "website";
	}
}

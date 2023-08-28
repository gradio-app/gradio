// import { _ } from "svelte-i18n";

export class Gradio<T extends Record<string, any>> {
	#id: number;
	theme: string;
	version: string;
	// i18n: typeof _;
	#el: HTMLElement;
	root: string;

	constructor(
		id: number,
		el: HTMLElement,
		theme: string,
		version: string,
		root: string
	) {
		this.#id = id;
		this.theme = theme;
		this.version = version;
		this.#el = el;
		// this.i18n = _;
		this.root = root;
	}

	dispatch<E extends keyof T>(event_name: E, data?: T[E]): void {
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: this.#id, event: event_name }
		});
		this.#el.dispatchEvent(e);
	}
}

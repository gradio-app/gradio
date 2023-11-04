import { format } from "svelte-i18n";
import { get } from "svelte/store";

const x = get(format);

export type I18nFormatter = typeof x;
export class Gradio<T extends Record<string, any> = Record<string, any>> {
	#id: number;
	theme: string;
	version: string;
	i18n: typeof x;
	#el: HTMLElement;
	root: string;
	autoscroll: boolean;

	constructor(
		id: number,
		el: HTMLElement,
		theme: string,
		version: string,
		root: string,
		autoscroll: boolean
	) {
		this.#id = id;
		this.theme = theme;
		this.version = version;
		this.#el = el;
		this.i18n = get(format);
		this.root = root;
		this.autoscroll = autoscroll;
	}

	dispatch<E extends keyof T>(event_name: E, data?: T[E]): void {
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: this.#id, event: event_name }
		});
		this.#el.dispatchEvent(e);
	}
}

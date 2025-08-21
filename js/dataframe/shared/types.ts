export interface SelectData {
	row_value?: any[];
	col_value?: any[];
	index: number | [number, number];
	value: any;
	selected?: boolean;
}

export type I18nFormatter = any;

interface Args {
	api_url: string;
	name: string;
	id?: string;
	variant: "component" | "example" | "base";
}

import type { ComponentType, SvelteComponent } from "svelte";
import type { Client } from "@gradio/client";

type component_loader = (args: Args) => {
	name: "string";
	component: {
		default: ComponentType<SvelteComponent>;
	};
};

const is_browser = typeof window !== "undefined";

function _load_component(
	this: Gradio,
	name: string,
	variant: "component" | "example" | "base" = "component"
): ReturnType<component_loader> {
	return this._load_component!({
		name,
		api_url: this.client.config?.root!,
		variant
	});
}

export class Gradio<T extends Record<string, any> = Record<string, any>> {
	#id: number;
	theme: string;
	version: string;
	i18n: I18nFormatter;
	#el: HTMLElement;
	root: string;
	autoscroll: boolean;
	max_file_size: number | null;
	client: Client;
	_load_component?: component_loader;
	load_component = _load_component.bind(this);

	constructor(
		id: number,
		el: HTMLElement,
		theme: string,
		version: string,
		root: string,
		autoscroll: boolean,
		max_file_size: number | null,
		i18n: I18nFormatter = (x: string): string => x,
		client: Client,
		virtual_component_loader?: component_loader
	) {
		this.#id = id;
		this.theme = theme;
		this.version = version;
		this.#el = el;
		this.max_file_size = max_file_size;

		this.i18n = i18n;
		this.root = root;
		this.autoscroll = autoscroll;
		this.client = client;

		this._load_component = virtual_component_loader;
	}

	dispatch<E extends keyof T>(event_name: E, data?: T[E]): void {
		if (!is_browser || !this.#el) return;
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: this.#id, event: event_name }
		});
		this.#el.dispatchEvent(e);
	}
}

export type CellCoordinate = [number, number];
export type EditingState = CellCoordinate | false;

export type Headers = (string | null)[];

export interface HeadersWithIDs {
	id: string;
	value: string;
}
[];

export interface TableCell {
	id: string;
	value: string | number;
}

export type TableData = TableCell[][];

export type CountConfig = [number, "fixed" | "dynamic"];

export type ElementRefs = Record<
	string,
	{
		cell: null | HTMLTableCellElement;
		input: null | HTMLTextAreaElement;
	}
>;

export type DataBinding = Record<string, TableCell>;

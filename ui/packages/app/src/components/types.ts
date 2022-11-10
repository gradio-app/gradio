import type { ComponentType } from "svelte";
import type { SvelteComponentDev } from "svelte/internal";

import type { component_map } from "./directory";

type ComponentMap = typeof component_map;

export interface ComponentMeta {
	type: keyof ComponentMap;
	id: number;
	has_modes: boolean;
	props: Record<string, unknown>;
	instance: SvelteComponentDev;
	component: ComponentType<SvelteComponentDev>;
	documentation?: Documentation;
	children?: Array<ComponentMeta>;
	value?: any;
}

export interface Dependency {
	trigger: string;
	targets: Array<number>;
	inputs: Array<number>;
	outputs: Array<number>;
	backend_fn: boolean;
	js: string | null;
	scroll_to_output: boolean;
	show_progress: boolean;
	frontend_fn?: Function;
	status?: string;
	queue: boolean | null;
	api_name: string | null;
	cancels: Array<number>;
}

export interface Documentation {
	input_type?: string,
	input_description?: string,
	example_input_data?: string,
	output_type?: string,
	output_description?: string,
	entered_input_preprocess: (arg0: string) => any
}

export interface LayoutNode {
	id: number;
	children: Array<LayoutNode>;
}

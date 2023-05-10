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

export interface DependencyTypes {
	continuous: boolean;
	generator: boolean;
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
	types: DependencyTypes;
	collects_event_data: boolean;
	trigger_after?: number;
	trigger_only_on_success?: boolean;
}

interface TypeDescription {
	input_payload?: string;
	response_object?: string;
	payload?: string;
}

export interface Documentation {
	type?: TypeDescription;
	description?: TypeDescription;
	example_data?: string;
}

export interface LayoutNode {
	id: number;
	children: Array<LayoutNode>;
}

export type ThemeMode = "system" | "light" | "dark";

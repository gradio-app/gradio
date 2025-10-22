import type { Component } from "svelte";
import type { Client } from "@gradio/client";
import type { LoadingStatus } from "js/statustracker";
import type { load_component } from "@gradio/utils";
import type { get_component } from "./init_utils.js";

// import type { I18nFormatter } from "./i18n.js";
// import type { component_loader } from "./init.js";
/** The props that are always present on a component */
export interface SharedProps {
	elem_id?: string;
	elem_classes: string[];
	components?: string[];
	server_fns?: string[];
	interactive: boolean;
	visible: boolean | "hidden";
	id: number;
	container: boolean;
	target: HTMLElement;
	theme_mode: "light" | "dark" | "system";
	version: string;
	root: string;
	autoscroll: boolean;
	max_file_size: number | null;
	formatter: any; //I18nFormatter;
	client: Client;
	scale: number;
	min_width: number;
	padding: number;
	load_component: typeof get_component; //component_loader;
	loading_status?: LoadingStatus;
	label: string;
	show_label: boolean;
	validation_error?: string | null;
}

/** The metadata for a component
 * The non optional fields are what are received from the backend
 * The optional fields are what are added by the frontend
 */
export interface ComponentMeta {
	type: string;
	id: number;
	props: SharedProps & Record<string, unknown>;
	documentation?: Documentation;
	value?: any;
	component_class_id: string;
	key: string | number | null;
	rendered_in?: number;
}

export interface ProcessedComponentMeta {
	type: string;
	id: number;
	props: { shared_props: SharedProps; props: Record<string, unknown> };
	component: Component | LoadingComponent;
	documentation?: Documentation;
	children?: ProcessedComponentMeta[];
	//	parent?: ProcessedComponentMeta;
	//component_class_id: string; // ?;
	key: string | number | null; // ?;
	rendered_in?: number; // ?;
}

/** Dictates whether a dependency is continous and/or a generator */
export interface DependencyTypes {
	generator: boolean;
	cancel: boolean;
}

/** An event payload that is sent with an API request */
export interface Payload {
	fn_index: number;
	data: unknown[];
	event_data?: unknown | null;
	trigger_id?: number | null;
	js_implementation?: boolean | null;
}

/** A dependency as received from the backend */
export interface Dependency {
	id: number;
	targets: [number, string][];
	inputs: number[];
	outputs: number[];
	backend_fn: boolean;
	js: string | null; // frontend fn
	scroll_to_output: boolean; // used by loading_status
	show_progress: "full" | "minimal" | "hidden"; // used by loading_status
	show_progress_on: number[] | null; // used by loading_status
	// frontend_fn: ((...args: unknown[]) => Promise<unknown[]>) | null;
	//status?: string; // I can't find this
	queue: boolean | null; // used by client
	api_name: string | null; // used by client
	cancels: number[];
	types: DependencyTypes;
	collects_event_data: boolean;
	//pending_request?: boolean; // added, not received from backend, unneeded
	trigger_after?: number; // then events
	trigger_only_on_success?: boolean; // success events
	trigger_only_on_failure?: boolean; // failure events
	trigger_mode: "once" | "multiple" | "always_last"; // dispatch policy
	// final_event: Payload | null; // added, not received from backend
	show_api: boolean; // use by api_doc
	rendered_in: number | null; // which component the new config should be added to
	render_id: number | null; // dno
	connection: "stream" | "sse"; // dno
	time_limit: number; // time limit for streaming
	stream_every: number; // chunk timeout for media recorder
	like_user_message: boolean; // dno, this shouldnt be here surely
	event_specific_args: ("time_limit" | "stream_every" | "like_user_message")[]; // `click(fn, some_arg=val)`
	js_implementation: string | null; // pythong -> js transpilation
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

/** A layout node as recived from the backend */
export interface LayoutNode {
	id: number;
	children: LayoutNode[];
}

/** The system theme mode */
export type ThemeMode = "system" | "light" | "dark";

/** the target map is an object mapping the target id to a series of events (another object), those events are a mapping of the event name to the function id's they trigger */
export type TargetMap = Record<number, Record<string, number[]>>;

/** A component that has been loaded via dynamic import */
export type LoadedComponent = {
	default: Component;
};

/**A component that is loading */
export type LoadingComponent = Promise<{
	default: Component;
}>;

export interface AppConfig {
	root: string;
	theme: string;
	version: string;
	max_file_size?: number;
	autoscroll: boolean;
	api_prefix: string;
}

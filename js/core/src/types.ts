import type { ComponentType } from "svelte";
import type { SvelteComponent } from "svelte";

/** The props that are always present on a component */
interface SharedProps {
	elem_id?: string;
	elem_classes?: string[];
	components?: string[];
	server_fns?: string[];
	interactive: boolean;
	[key: string]: unknown;
}

/** The metadata for a component
 * The non optional fields are what are received from the backend
 * The optional fields are what are added by the frontend
 */
export interface ComponentMeta {
	type: string;
	id: number;
	has_modes: boolean;
	props: SharedProps;
	instance: SvelteComponent;
	component: ComponentType<SvelteComponent>;
	documentation?: Documentation;
	children?: ComponentMeta[];
	parent?: ComponentMeta;
	value?: any;
	component_class_id: string;
	key: string | number | null;
	rendered_in?: number;
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
}

/** A dependency as received from the backend */
export interface Dependency {
	id: number;
	targets: [number, string][];
	inputs: number[];
	outputs: number[];
	backend_fn: boolean;
	js: string | null;
	scroll_to_output: boolean;
	show_progress: "full" | "minimal" | "hidden";
	frontend_fn: ((...args: unknown[]) => Promise<unknown[]>) | null;
	status?: string;
	queue: boolean | null;
	api_name: string | null;
	cancels: number[];
	types: DependencyTypes;
	collects_event_data: boolean;
	pending_request?: boolean;
	trigger_after?: number;
	trigger_only_on_success?: boolean;
	trigger_mode: "once" | "multiple" | "always_last";
	final_event: Payload | null;
	show_api: boolean;
	rendered_in: number | null;
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
	default: ComponentMeta["component"];
};

/**A component that is loading */
export type LoadingComponent = Promise<{
	default: ComponentMeta["component"];
}>;

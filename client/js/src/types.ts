// API Data Types

import { hardware_types } from "./helpers/spaces";
import type { SvelteComponent } from "svelte";
import type { ComponentType } from "svelte";

export interface ApiData {
	label: string;
	parameter_name: string;
	parameter_default?: any;
	parameter_has_default?: boolean;
	type: {
		type: any;
		description: string;
	};
	component: string;
	example_input?: any;
	python_type: { type: string; description: string };
	serializer: string;
}

export interface JsApiData {
	label: string;
	parameter_name: string;
	parameter_default?: any;
	parameter_has_default?: boolean;
	type: string;
	description: string;
	component: string;
	example_input?: any;
	serializer: string;
	python_type: { type: string; description: string };
}

export interface EndpointInfo<T extends ApiData | JsApiData> {
	parameters: T[];
	returns: T[];
	type?: DependencyTypes;
}

export interface ApiInfo<T extends ApiData | JsApiData> {
	named_endpoints: Record<string, EndpointInfo<T>>;
	unnamed_endpoints: Record<string, EndpointInfo<T>>;
}

export interface BlobRef {
	path: string[];
	type: string | undefined;
	blob: Blob | File | false;
}

export type DataType = string | Buffer | Record<string, any> | any[];

// custom class used for uploading local files
export class Command {
	type: string;
	command: string;
	meta: {
		path: string;
		name: string;
		orig_path: string;
	};
	fileData?: FileData;

	constructor(
		command: string,
		meta: { path: string; name: string; orig_path: string }
	) {
		this.type = "command";
		this.command = command;
		this.meta = meta;
	}
}

// Function Signature Types

export type SubmitFunction = (
	endpoint: string | number,
	data?: unknown[] | Record<string, unknown>,
	event_data?: unknown,
	trigger_id?: number | null
) => SubmitIterable<GradioEvent>;

export type PredictFunction = (
	endpoint: string | number,
	data?: unknown[] | Record<string, unknown>,
	event_data?: unknown
) => Promise<PredictReturn>;

export type client_return = {
	config: Config | undefined;
	predict: PredictFunction;
	submit: SubmitFunction;
	component_server: (
		component_id: number,
		fn_name: string,
		data: unknown[]
	) => any;
	view_api: (_fetch: typeof fetch) => Promise<ApiInfo<JsApiData>>;
};

export interface SubmitIterable<T> extends AsyncIterable<T> {
	[Symbol.asyncIterator](): AsyncIterator<T>;
	cancel: () => Promise<void>;
	event_id: () => string;
}

export type PredictReturn = {
	type: EventType;
	time: Date;
	data: unknown;
	endpoint: string;
	fn_index: number;
};

// Space Status Types

export type SpaceStatus = SpaceStatusNormal | SpaceStatusError;

export interface SpaceStatusNormal {
	status:
		| "sleeping"
		| "running"
		| "building"
		| "error"
		| "stopped"
		| "starting";
	detail:
		| "SLEEPING"
		| "RUNNING"
		| "RUNNING_BUILDING"
		| "BUILDING"
		| "APP_STARTING"
		| "NOT_FOUND";
	load_status: "pending" | "error" | "complete" | "generating";
	message: string;
}

export interface SpaceStatusError {
	status: "space_error" | "paused";
	detail:
		| "NO_APP_FILE"
		| "CONFIG_ERROR"
		| "BUILD_ERROR"
		| "RUNTIME_ERROR"
		| "PAUSED";
	load_status: "error";
	message: string;
	discussions_enabled: boolean;
}

export type SpaceStatusCallback = (a: SpaceStatus) => void;

// Configuration and Response Types
// --------------------------------
export interface Config {
	auth_required?: true;
	analytics_enabled: boolean;
	connect_heartbeat: boolean;
	auth_message: string;
	components: ComponentMeta[];
	css: string | null;
	js: string | null;
	head: string | null;
	dependencies: Dependency[];
	dev_mode: boolean;
	enable_queue: boolean;
	show_error: boolean;
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	root_url?: string;
	theme: string;
	title: string;
	version: string;
	space_id: string | null;
	is_space: boolean;
	is_colab: boolean;
	show_api: boolean;
	stylesheets: string[];
	path: string;
	protocol: "sse_v3" | "sse_v2.1" | "sse_v2" | "sse_v1" | "sse" | "ws";
	max_file_size?: number;
	theme_hash?: number;
	username: string | null;
	api_prefix?: string;
	fill_height?: boolean;
	fill_width?: boolean;
	pwa?: boolean;
}

// todo: DRY up types
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

interface SharedProps {
	elem_id?: string;
	elem_classes?: string[];
	components?: string[];
	server_fns?: string[];
	interactive: boolean;
	[key: string]: unknown;
	root_url?: string;
}

export interface Documentation {
	type?: TypeDescription;
	description?: TypeDescription;
	example_data?: string;
}

interface TypeDescription {
	input_payload?: string;
	response_object?: string;
	payload?: string;
}

export interface Dependency {
	id: number;
	targets: [number, string][];
	inputs: number[];
	outputs: number[];
	backend_fn: boolean;
	js: string | null;
	scroll_to_output: boolean;
	trigger: "click" | "load" | string;
	max_batch_size: number;
	show_progress: "full" | "minimal" | "hidden";
	frontend_fn: ((...args: unknown[]) => Promise<unknown[]>) | null;
	status?: string;
	queue: boolean | null;
	every: number | null;
	batch: boolean;
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
	zerogpu?: boolean;
	rendered_in: number | null;
	connection: "stream" | "sse";
	time_limit: number;
	stream_every: number;
	like_user_message: boolean;
	event_specific_args: string[];
}

export interface DependencyTypes {
	generator: boolean;
	cancel: boolean;
}

export interface Payload {
	fn_index: number;
	data: unknown[];
	time?: Date;
	event_data?: unknown;
	trigger_id?: number | null;
}

export interface PostResponse {
	error?: string;
	[x: string]: any;
}

export interface UploadResponse {
	error?: string;
	files?: string[];
}

// Client and File Handling Types

export interface DuplicateOptions extends ClientOptions {
	private?: boolean;
	hardware?: (typeof hardware_types)[number];
	timeout?: number;
}

export interface ClientOptions {
	hf_token?: `hf_${string}`;
	status_callback?: SpaceStatusCallback | null;
	auth?: [string, string] | null;
	with_null_state?: boolean;
	events?: EventType[];
	headers?: Record<string, string>;
}

export interface FileData {
	name: string;
	orig_name?: string;
	size?: number;
	data: string;
	blob?: File;
	is_file?: boolean;
	mime_type?: string;
	alt_text?: string;
}

// Event and Listener Types

export type EventType = "data" | "status" | "log" | "render";

export interface EventMap {
	data: PayloadMessage;
	status: StatusMessage;
	log: LogMessage;
	render: RenderMessage;
}

export type GradioEvent = {
	[P in EventType]: EventMap[P];
}[EventType];

export interface Log {
	log: string;
	title: string;
	level: "warning" | "info" | "success";
}
export interface Render {
	data: {
		components: any[];
		layout: any;
		dependencies: Dependency[];
		render_id: number;
	};
}

export interface Status {
	queue: boolean;
	code?: string;
	success?: boolean;
	stage: "pending" | "error" | "complete" | "generating" | "streaming";
	duration?: number;
	visible?: boolean;
	broken?: boolean;
	size?: number;
	position?: number;
	eta?: number;
	title?: string;
	message?: string;
	progress_data?: {
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}[];
	time?: Date;
	changed_state_ids?: number[];
	time_limit?: number;
}

export interface StatusMessage extends Status {
	type: "status";
	endpoint: string;
	fn_index: number;
	original_msg?: string;
}

export interface PayloadMessage extends Payload {
	type: "data";
	endpoint: string;
	fn_index: number;
}

export interface LogMessage extends Log {
	type: "log";
	endpoint: string;
	fn_index: number;
	duration: number | null;
	visible: boolean;
}

export interface RenderMessage extends Render {
	type: "render";
	endpoint: string;
	fn_index: number;
}

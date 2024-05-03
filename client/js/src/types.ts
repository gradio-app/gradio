// API Data Types

import { hardware_types } from "./helpers/spaces";

export interface ApiData {
	label: string;
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

// Event and Submission Types

type event = <K extends EventType>(
	eventType: K,
	listener: EventListener<K>
) => SubmitReturn;

type predict = (
	endpoint: string | number,
	data?: unknown[],
	event_data?: unknown
) => Promise<unknown>;

export type client_return = {
	config: Config | undefined;
	predict: predict;
	submit: (
		endpoint: string | number,
		data: unknown[],
		event_data?: unknown,
		trigger_id?: number | null
	) => SubmitReturn;
	component_server: (
		component_id: number,
		fn_name: string,
		data: unknown[]
	) => any;
	view_api: (_fetch: typeof fetch) => Promise<ApiInfo<JsApiData>>;
};

export type SubmitReturn = {
	on: event;
	off: event;
	cancel: () => Promise<void>;
	destroy: () => void;
};

// Space Status Types

export type SpaceStatus = SpaceStatusNormal | SpaceStatusError;

export interface SpaceStatusNormal {
	status: "sleeping" | "running" | "building" | "error" | "stopped";
	detail:
		| "SLEEPING"
		| "RUNNING"
		| "RUNNING_BUILDING"
		| "BUILDING"
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
	auth_required: boolean;
	analytics_enabled: boolean;
	connect_heartbeat: boolean;
	auth_message: string;
	components: any[];
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
}

export interface Dependency {
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
}

export interface DependencyTypes {
	continuous: boolean;
	generator: boolean;
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

export type EventType = "data" | "status" | "log";

export interface EventMap {
	data: Payload;
	status: Status;
	log: LogMessage;
}

export type Event<K extends EventType> = {
	[P in K]: EventMap[P] & { type: P; endpoint: string; fn_index: number };
}[K];
export type EventListener<K extends EventType> = (event: Event<K>) => void;
export type ListenerMap<K extends EventType> = {
	[P in K]?: EventListener<K>[];
};
export interface LogMessage {
	log: string;
	level: "warning" | "info";
}

export interface Status {
	queue: boolean;
	code?: string;
	success?: boolean;
	stage: "pending" | "error" | "complete" | "generating";
	broken?: boolean;
	size?: number;
	position?: number;
	eta?: number;
	message?: string;
	progress_data?: {
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}[];
	time?: Date;
}

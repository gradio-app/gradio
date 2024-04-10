export interface Config {
	auth_required: boolean | undefined;
	auth_message: string;
	components: any[];
	css: string | null;
	js: string | null;
	head: string | null;
	dependencies: any[];
	dev_mode: boolean;
	enable_queue: boolean;
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	root_url?: string;
	theme: string;
	title: string;
	version: string;
	space_id: string | null;
	is_colab: boolean;
	show_api: boolean;
	stylesheets: string[];
	path: string;
	protocol?: "sse_v2.1" | "sse_v2" | "sse_v1" | "sse" | "ws";
}

export interface Payload {
	data: unknown[];
	fn_index?: number;
	event_data?: unknown;
	time?: Date;
}

export interface PostResponse {
	error?: string;
	[x: string]: any;
}
export interface UploadResponse {
	error?: string;
	files?: string[];
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

export interface LogMessage {
	log: string;
	level: "warning" | "info";
}

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
export type SpaceStatus = SpaceStatusNormal | SpaceStatusError;

export type status_callback_function = (a: Status) => void;
export type SpaceStatusCallback = (a: SpaceStatus) => void;

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

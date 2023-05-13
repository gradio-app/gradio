// Copied from /client/js/src/types.ts
// TODO: Move this to a shared location

export interface Config {
	auth_required: boolean | undefined;
	auth_message: string;
	components: any[];
	css: string | null;
	dependencies: any[];
	dev_mode: boolean;
	enable_queue: boolean;
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	theme: string;
	title: string;
	version: string;
	is_space: boolean;
	is_colab: boolean;
	show_api: boolean;
	stylesheets: string[];
	path: string;
}

export interface Payload {
	data: Array<unknown>;
	fn_index?: number;
}

export interface PostResponse {
	error?: string;
	[x: string]: any;
}
export interface UploadResponse {
	error?: string;
	files?: Array<string>;
}

export interface Status {
	queue: boolean;
	status: "pending" | "error" | "complete" | "generating";
	size?: number;
	position?: number;
	eta?: number;
	message?: string;
	progress?: Array<{
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}>;
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
	status: "space_error";
	detail: "NO_APP_FILE" | "CONFIG_ERROR" | "BUILD_ERROR" | "RUNTIME_ERROR";
	load_status: "error";
	message: string;
	discussions_enabled: boolean;
}
export type SpaceStatus = SpaceStatusNormal | SpaceStatusError;

export type status_callback_function = (a: Status) => void;
export type SpaceStatusCallback = (a: SpaceStatus) => void;

export type EventType = "data" | "status";

export interface EventMap {
	data: Record<string, any>;
	status: Status;
}

export type Event<K extends EventType> = {
	[P in K]: EventMap[P] & { type: P; endpoint: string; fn_index: number };
}[K];
export type EventListener<K extends EventType> = (event: Event<K>) => void;
export type ListenerMap<K extends EventType> = {
	[P in K]?: EventListener<K>[];
};

export interface Config {
	auth_required: boolean | undefined;
	auth_message: string;
	components: any[];
	css: string | null;
	dependencies: any[];
	dev_mode: boolean;
	enable_queue: boolean;
	// fn: Function
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	// target: HTMLElement;
	theme: string;
	title: string;
	version: string;
	is_space: boolean;
	is_colab: boolean;
	show_api: boolean;
}

export interface Payload {
	data: Array<unknown>;
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
// case "STOPPED":
// case "SLEEPING":
// case "RUNNING":
// case "RUNNING_BUILDING":
// case "BUILDING":
// case "NO_APP_FILE":
// case "CONFIG_ERROR":
// case "BUILD_ERROR":
// case "RUNTIME_ERROR":
export interface SpaceStatus {
	status: "sleeping" | "running" | "building" | "error" | "stopped";
	detail:
		| "sleeping"
		| "running"
		| "running_building"
		| "building"
		| "no_app_file"
		| "config_error"
		| "build_error"
		| "runtime_error"
		| "not_found";
	message: string;
	discussions_enabled?: boolean;
}

export type status_callback_function = (a: Status) => void;
export type SpaceStatusCallback = (a: SpaceStatus) => void;

export type EventType = "data" | "status";

export interface EventMap {
	data: Record<string, any>;
	status: Status;
}

export type Event<K extends EventType> = {
	[P in K]: EventMap[P] & { type: P };
}[K];
export type EventListener<K extends EventType> = (event: Event<K>) => void;
export type ListenerMap<K extends EventType> = {
	[P in K]?: EventListener<K>[];
};

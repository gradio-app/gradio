export interface HttpRequest {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	query_string: string;
	headers: Record<string, string>;
	body?: Uint8Array;
}
export interface HttpResponse {
	status: number;
	headers: Record<string, string>;
	body: Uint8Array;
}
export interface EmscriptenFile {
	data: string | ArrayBufferView;
	opts?: Record<string, string>;
}
export interface EmscriptenFileUrl {
	url: string;
	opts?: Record<string, string>;
}

export interface InMessageBase {
	type: string;
	data: unknown;
}

export interface InMessageInit extends InMessageBase {
	type: "init";
	data: {
		gradioWheelUrl: string;
		gradioClientWheelUrl: string;
		files: Record<string, EmscriptenFile | EmscriptenFileUrl>;
		requirements: string[];
	};
}
export interface InMessageRunPython extends InMessageBase {
	type: "run-python";
	data: {
		code: string;
	};
}
export interface InMessageHttpRequest extends InMessageBase {
	type: "http-request";
	data: {
		request: HttpRequest;
	};
}
export interface InMessageFileWrite extends InMessageBase {
	type: "file:write";
	data: {
		path: string;
		data: string | ArrayBufferView;
		opts?: Record<string, any>;
	};
}
export interface InMessageFileRename extends InMessageBase {
	type: "file:rename";
	data: {
		oldPath: string;
		newPath: string;
	};
}
export interface InMessageFileUnlink extends InMessageBase {
	type: "file:unlink";
	data: {
		path: string;
	};
}
export interface InMessageInstall extends InMessageBase {
	type: "install";
	data: {
		requirements: string[];
	};
}

export interface InMessageEcho extends InMessageBase {
	// For debug
	type: "echo";
	data: unknown;
}

export type InMessage =
	| InMessageInit
	| InMessageRunPython
	| InMessageHttpRequest
	| InMessageFileWrite
	| InMessageFileRename
	| InMessageFileUnlink
	| InMessageInstall
	| InMessageEcho;

export interface ReplyMessageSuccess<T = unknown> {
	type: "reply:success";
	data: T;
}
export interface ReplyMessageError {
	type: "reply:error";
	error: Error;
}

export type ReplyMessage = ReplyMessageSuccess | ReplyMessageError;

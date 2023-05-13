export interface HttpRequest {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	query_string: string;
	headers: Record<string, string>;
	body: Uint8Array;
}

export interface HttpResponse {
	status: number;
	headers: Record<string, string>;
	body: Uint8Array;
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

export interface InMessageEcho extends InMessageBase {
	// For debug
	type: "echo";
	data: unknown;
}

export type InMessage =
	| InMessageInit
	| InMessageRunPython
	| InMessageHttpRequest
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

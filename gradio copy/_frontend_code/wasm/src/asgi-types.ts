import type { PyProxy } from "pyodide/ffi";

// A reference to an ASGI application instance in Python
// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
export type ASGIScope = Record<string, unknown>;
export type ASGIApplication = (
	scope: ASGIScope,
	receive: () => Promise<ReceiveEvent>,
	send: (event: PyProxy) => Promise<void> // `event` is a `SendEvent` dict in Python and passed as a `PyProxy` in JS via Pyodide's type conversion (https://pyodide.org/en/stable/usage/type-conversions.html#type-translations-pyproxy-to-js).
) => Promise<void>;

export type ReceiveEvent = RequestReceiveEvent | DisconnectReceiveEvent;
// https://asgi.readthedocs.io/en/latest/specs/www.html#request-receive-event
export interface RequestReceiveEvent {
	type: "http.request";
	body?: Uint8Array; // `bytes` in Python
	more_body?: boolean;
}
// https://asgi.readthedocs.io/en/latest/specs/www.html#disconnect-receive-event
export interface DisconnectReceiveEvent {
	type: "http.disconnect";
}

export type SendEvent = ResponseStartSendEvent | ResponseBodySendEvent;
// https://asgi.readthedocs.io/en/latest/specs/www.html#response-start-send-event
export interface ResponseStartSendEvent {
	type: "http.response.start";
	status: number;
	headers: Iterable<[Uint8Array, Uint8Array]>;
	trailers: boolean;
}
// https://asgi.readthedocs.io/en/latest/specs/www.html#response-body-send-event
export interface ResponseBodySendEvent {
	type: "http.response.body";
	body: Uint8Array; // `bytes` in Python
	more_body: boolean;
}

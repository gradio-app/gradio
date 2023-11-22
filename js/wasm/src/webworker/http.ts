import type { PyProxy } from "pyodide/ffi";
import type { HttpRequest, HttpResponse } from "../message-types";

// Inspired by https://github.com/rstudio/shinylive/blob/v0.1.2/src/messageporthttp.ts

// A reference to an ASGI application instance in Python
// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
type ASGIApplication = (
	scope: Record<string, unknown>,
	receive: () => Promise<ReceiveEvent>,
	send: (event: PyProxy) => Promise<void>
) => Promise<void>;

type ReceiveEvent = RequestReceiveEvent | DisconnectReceiveEvent;
// https://asgi.readthedocs.io/en/latest/specs/www.html#request-receive-event
interface RequestReceiveEvent {
	type: "http.request";
	body?: Uint8Array; // `bytes` in Python
	more_body: boolean;
}
// https://asgi.readthedocs.io/en/latest/specs/www.html#disconnect-receive-event
interface DisconnectReceiveEvent {
	type: "http.disconnect";
}

type SendEvent = ResponseStartSendEvent | ResponseBodySendEvent;
// https://asgi.readthedocs.io/en/latest/specs/www.html#response-start-send-event
interface ResponseStartSendEvent {
	type: "http.response.start";
	status: number;
	headers: Iterable<[Uint8Array, Uint8Array]>;
	trailers: boolean;
}
// https://asgi.readthedocs.io/en/latest/specs/www.html#response-body-send-event
interface ResponseBodySendEvent {
	type: "http.response.body";
	body: Uint8Array; // `bytes` in Python
	more_body: boolean;
}

function headersToASGI(headers: HttpRequest["headers"]): [string, string][] {
	const result: [string, string][] = [];
	for (const [key, value] of Object.entries(headers)) {
		result.push([key, value]);
	}
	return result;
}

export function uint8ArrayToString(buf: Uint8Array): string {
	let result = "";
	for (let i = 0; i < buf.length; i++) {
		result += String.fromCharCode(buf[i]);
	}
	return result;
}

function asgiHeadersToRecord(headers: any): Record<string, string> {
	headers = headers.map(([key, val]: [Uint8Array, Uint8Array]) => {
		return [uint8ArrayToString(key), uint8ArrayToString(val)];
	});
	return Object.fromEntries(headers);
}

export const makeHttpRequest = (
	asgiApp: ASGIApplication,
	request: HttpRequest
): Promise<HttpResponse> =>
	new Promise((resolve, reject) => {
		let sent = false;
		async function receiveFromJs(): Promise<ReceiveEvent> {
			if (sent) {
				// NOTE: I implemented this block just referring to the spec. However, it is not reached in practice so it's not combat-proven.
				return {
					type: "http.disconnect"
				};
			}

			const event: RequestReceiveEvent = {
				type: "http.request",
				more_body: false
			};
			if (request.body) {
				event.body = request.body;
			}

			console.debug("receive", event);
			sent = true;
			return event;
		}

		let status: number;
		let headers: { [key: string]: string };
		let body: Uint8Array = new Uint8Array();
		async function sendToJs(proxiedEvent: PyProxy): Promise<void> {
			const event = Object.fromEntries(proxiedEvent.toJs()) as SendEvent;
			console.debug("send", event);
			if (event.type === "http.response.start") {
				status = event.status;
				headers = asgiHeadersToRecord(event.headers);
			} else if (event.type === "http.response.body") {
				body = new Uint8Array([...body, ...event.body]);
				if (!event.more_body) {
					const response: HttpResponse = {
						status,
						headers,
						body
					};
					console.debug("HTTP response", response);
					resolve(response);
				}
			} else {
				throw new Error(`Unhandled ASGI event: ${JSON.stringify(event)}`);
			}
		}

		// https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope
		const scope = {
			type: "http",
			asgi: {
				version: "3.0",
				spec_version: "2.1"
			},
			http_version: "1.1",
			scheme: "http",
			method: request.method,
			path: request.path,
			query_string: request.query_string,
			root_path: "",
			headers: headersToASGI(request.headers)
		};

		asgiApp(scope, receiveFromJs, sendToJs).catch(reject);
	});

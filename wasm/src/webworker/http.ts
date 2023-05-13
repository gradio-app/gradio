import type { HttpRequest, HttpResponse } from "../message-types";

// Inspired by https://github.com/rstudio/shinylive/blob/v0.1.2/src/messageporthttp.ts

// A reference to an ASGI application instance in Python
// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
type ASGIApplication = (
	scope: unknown,
	receive: Function,
	send: Function
) => Promise<void>;

function headersToASGI(
	headers: HttpRequest["headers"]
): Array<[string, string]> {
	const result: Array<[string, string]> = [];
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
		// https://asgi.readthedocs.io/en/latest/specs/www.html#request-receive-event
		async function fromClient(): Promise<Record<string, any>> {
			return {
				type: "http.request",
				body: request.body,
				more_body: false
			};
		}

		// https://asgi.readthedocs.io/en/latest/specs/www.html#response-start-send-event
		let status: number;
		let headers: { [key: string]: string };
		let body: Uint8Array = new Uint8Array();
		async function toClient(event: Record<string, any>): Promise<void> {
			event = Object.fromEntries(event.toJs());
			console.debug("toClient", event);
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
				throw new Error(`Unhandled ASGI event: ${event.type}`);
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

		asgiApp(scope, fromClient, toClient);
	});

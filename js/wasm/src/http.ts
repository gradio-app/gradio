export interface HttpRequest {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	query_string: string; // This field must not contain the leading `?`, as it's directly used in the ASGI spec which requires this.
	headers: Record<string, string>;
	body?: Uint8Array | ReadableStream<Uint8Array> | null;
}
export interface HttpResponse {
	status: number;
	headers: Record<string, string>;
	body: Uint8Array;
}

// Inspired by https://github.com/rstudio/shinylive/blob/v0.1.2/src/messageporthttp.ts
export function headersToASGI(
	headers: HttpRequest["headers"]
): [string, string][] {
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

export function asgiHeadersToRecord(headers: any): Record<string, string> {
	headers = headers.map(([key, val]: [Uint8Array, Uint8Array]) => {
		return [uint8ArrayToString(key), uint8ArrayToString(val)];
	});
	return Object.fromEntries(headers);
}

export function getHeaderValue(
	headers: HttpRequest["headers"],
	key: string
): string | undefined {
	// The keys in `headers` are case-insensitive.
	const unifiedKey = key.toLowerCase();
	for (const [k, v] of Object.entries(headers)) {
		if (k.toLowerCase() === unifiedKey) {
			return v;
		}
	}
}

export function logHttpReqRes(
	request: HttpRequest,
	response: HttpResponse
): void {
	if (Math.floor(response.status / 100) !== 2) {
		let bodyText: string;
		let bodyJson: unknown;
		try {
			bodyText = new TextDecoder().decode(response.body);
		} catch (e) {
			bodyText = "(failed to decode body)";
		}
		try {
			bodyJson = JSON.parse(bodyText);
		} catch (e) {
			bodyJson = "(failed to parse body as JSON)";
		}
		console.error("Wasm HTTP error", {
			request,
			response,
			bodyText,
			bodyJson
		});
	}
}

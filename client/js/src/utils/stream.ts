//@ts-nocheck

import { BROKEN_CONNECTION_MSG } from "../constants";
import type { Client } from "../client";

export async function open_stream(this: Client): Promise<void> {
	let {
		event_callbacks,
		unclosed_events,
		pending_stream_messages,
		stream_status,
		config,
		jwt
	} = this;

	if (!config) {
		throw new Error("Could not resolve app config");
	}

	stream_status.open = true;

	let stream: EventSource | null = null;
	let params = new URLSearchParams({
		session_hash: this.session_hash
	}).toString();

	let url = new URL(`${config.root}/queue/data?${params}`);

	if (jwt) {
		url.searchParams.set("__sign", jwt);
	}

	stream = this.stream(url);

	if (!stream) {
		console.warn("Cannot connect to SSE endpoint: " + url.toString());
		return;
	}

	console.log({ stream });
	stream.onmessage = async function (event: MessageEvent) {
		let _data = JSON.parse(event.data);
		console.log({ _data });
		if (_data.msg === "close_stream") {
			close_stream(stream_status, stream);
			return;
		}
		const event_id = _data.event_id;
		if (!event_id) {
			await Promise.all(
				Object.keys(event_callbacks).map((event_id) =>
					event_callbacks[event_id](_data)
				)
			);
		} else if (event_callbacks[event_id] && config) {
			if (
				_data.msg === "process_completed" &&
				["sse", "sse_v1", "sse_v2", "sse_v2.1"].includes(config.protocol)
			) {
				unclosed_events.delete(event_id);
				if (unclosed_events.size === 0) {
					close_stream(stream_status, stream);
				}
			}
			let fn: (data: any) => void = event_callbacks[event_id];

			if (typeof window !== "undefined") {
				window.setTimeout(fn, 0, _data); // need to do this to put the event on the end of the event loop, so the browser can refresh between callbacks and not freeze in case of quick generations. See https://github.com/gradio-app/gradio/pull/7055
			} else {
				setImmediate(fn, _data);
			}
		} else {
			if (!pending_stream_messages[event_id]) {
				pending_stream_messages[event_id] = [];
			}
			pending_stream_messages[event_id].push(_data);
		}
	};
	stream.onerror = async function () {
		await Promise.all(
			Object.keys(event_callbacks).map((event_id) =>
				event_callbacks[event_id]({
					msg: "unexpected_error",
					message: BROKEN_CONNECTION_MSG
				})
			)
		);
		close_stream(stream_status, stream);
	};
}

export function close_stream(
	stream_status: { open: boolean },
	stream: EventSource | null
): void {
	if (stream_status && stream) {
		stream_status.open = false;
		stream?.close();
	}
}

export function apply_diff_stream(
	pending_diff_streams: Record<string, any[][]>,
	event_id: string,
	data: any
): void {
	let is_first_generation = !pending_diff_streams[event_id];
	if (is_first_generation) {
		pending_diff_streams[event_id] = [];
		data.data.forEach((value: any, i: number) => {
			pending_diff_streams[event_id][i] = value;
		});
	} else {
		data.data.forEach((value: any, i: number) => {
			let new_data = apply_diff(pending_diff_streams[event_id][i], value);
			pending_diff_streams[event_id][i] = new_data;
			data.data[i] = new_data;
		});
	}
}

export function apply_diff(
	obj: any,
	diff: [string, (number | string)[], any][]
): any {
	diff.forEach(([action, path, value]) => {
		obj = apply_edit(obj, path, action, value);
	});

	return obj;
}

function apply_edit(
	target: any,
	path: (number | string)[],
	action: string,
	value: any
): any {
	if (path.length === 0) {
		if (action === "replace") {
			return value;
		} else if (action === "append") {
			return target + value;
		}
		throw new Error(`Unsupported action: ${action}`);
	}

	let current = target;
	for (let i = 0; i < path.length - 1; i++) {
		current = current[path[i]];
	}

	const last_path = path[path.length - 1];
	switch (action) {
		case "replace":
			current[last_path] = value;
			break;
		case "append":
			current[last_path] += value;
			break;
		case "add":
			if (Array.isArray(current)) {
				current.splice(Number(last_path), 0, value);
			} else {
				current[last_path] = value;
			}
			break;
		case "delete":
			if (Array.isArray(current)) {
				current.splice(Number(last_path), 1);
			} else {
				delete current[last_path];
			}
			break;
		default:
			throw new Error(`Unknown action: ${action}`);
	}
	return target;
}

// eslint-disable-next-line complexity
export function readable_stream(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<EventSource> {
	// TODO: throw error?
	let req = new Request(input, init);
	fallback_util(req.headers, "Accept", "text/event-stream");
	fallback_util(req.headers, "Content-Type", "application/json");
	let iter: ReadableStream<string> | undefined;
	const instance = { close: () => iter?.cancel() };

	// eslint-disable-next-line complexity
	fetch(req).then(async (res) => {
		if (!res.ok) throw res;

		if (!res.body) throw new Error("Response body is not readable stream");

		iter = stream_util(res.body);
		let line;
		let reader = iter.getReader();
		let event: ServerSentEventMessage | undefined;

		const event_callbacks: Callback[] = [];

		// function onmessage(fn: (event: ServerSentEventMessage) => void): void {
		// 	console.log({ fn });
		// 	event_callbacks.push(fn);
		// }

		// function onerror(fn: (error: Error) => void): void {
		// 	reader.closed.then(() => {
		// 		fn(new Error("Stream closed"));
		// 	});
		// }

		for (;;) {
			if (req.signal && req.signal.aborted) {
				reader.cancel();
				break;
			}

			line = await reader.read();
			console.log({ line });

			if (line.value) {
				// console.log({ event });

				if (event && instance.onmessage) {
					console.log({ event });
					instance.onmessage(event);
					// event_callbacks.forEach((fn) => fn(event));
				}
				console.log("RESETTING EVENT", event);
				event = undefined;
				if (line.done) break;
				// continue;
			}

			if (line.done) break;

			let [field, value] = split_util(line.value) || [];
			if (!field) continue; // comment or invalid

			if (field === "data") {
				event ||= {};
				event[field] = event[field] ? event[field] + "\n" + value : value;
			} else if (field === "event") {
				event ||= {};
				event[field] = value;
			} else if (field === "id") {
				event ||= {};
				event[field] = +value || value;
			} else if (field === "retry") {
				event ||= {};
				event[field] = +value || undefined;
			}
		}
		console.log("done");
		reader.cancel();
	});

	return instance as EventSource;
}

// @ts-ignore
import TextLineStream from "textlinestream";

export function stream_util(
	input: ReadableStream<Uint8Array>
): ReadableStream<string> {
	let decoder = new TextDecoderStream();
	let split = new TextLineStream({ allowCR: true }) as TransformStream<
		string,
		string
	>;
	return input.pipeThrough(decoder).pipeThrough(split);
}

export function split_util(input: string): [string, string] | undefined {
	let rgx = /[:]\s*/;
	let match = rgx.exec(input);
	// ": comment" -> index=0 -> ignore
	let idx = match && match.index;
	if (idx) {
		return [input.substring(0, idx), input.substring(idx + match![0].length)];
	}
}

export function fallback_util(
	headers: Headers,
	key: string,
	value: string
): void {
	let tmp = headers.get(key);
	if (!tmp) headers.set(key, value);
}

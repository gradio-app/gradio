import { BROKEN_CONNECTION_MSG, EVENT_URL, SSE_URL } from "../constants";
import type { Client } from "../client";
import { stream } from "fetch-event-stream";

/** Backoff between attempts to reopen a broken stream, and its ceiling. */
export const RECONNECT_DELAY = 500;
export const MAX_RECONNECT_DELAY = 5000;

export async function open_stream(this: Client): Promise<void> {
	let {
		event_callbacks,
		unclosed_events,
		pending_stream_messages,
		stream_status,
		config,
		jwt
	} = this;

	const that = this;

	if (!config) {
		throw new Error("Could not resolve app config");
	}

	if (stream_status.open) {
		return;
	}

	this.clear_reconnect();
	stream_status.open = true;

	let stream: EventSource | null = null;
	let params = new URLSearchParams({
		session_hash: this.session_hash
	}).toString();

	let url = new URL(`${config.root}${this.api_prefix}/${SSE_URL}?${params}`);

	if (jwt) {
		url.searchParams.set("__sign", jwt);
	}

	stream = this.stream(url);

	if (!stream) {
		console.warn("Cannot connect to SSE endpoint: " + url.toString());
		return;
	}

	const abort_controller = this.abort_controller;
	that.stream_instance = stream;

	stream.onmessage = async function (event: MessageEvent) {
		// A stream that has already been replaced must not speak for the client.
		if (that.stream_instance !== stream) {
			return;
		}
		that.reconnect_attempts = 0;
		let _data = JSON.parse(event.data);
		if (_data.msg === "close_stream") {
			that.stream_instance = null;
			close_stream(stream_status, abort_controller);
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
				["sse", "sse_v1", "sse_v2", "sse_v2.1", "sse_v3"].includes(
					config.protocol
				)
			) {
				unclosed_events.delete(event_id);
			}
			let fn: (data: any) => void = event_callbacks[event_id];

			if (
				typeof window !== "undefined" &&
				typeof document !== "undefined" &&
				document.visibilityState !== "hidden"
			) {
				// Put the event at the end of the event loop so the browser can refresh
				// between callbacks and not freeze during quick generations. Hidden tabs
				// throttle timers, so process those messages immediately instead.
				setTimeout(fn, 0, _data); // See https://github.com/gradio-app/gradio/pull/7055
			} else {
				fn(_data);
			}
		} else {
			if (!pending_stream_messages[event_id]) {
				pending_stream_messages[event_id] = [];
			}
			pending_stream_messages[event_id].push(_data);
		}
	};
	stream.onerror = async function (e) {
		if (that.stream_instance !== stream) {
			return;
		}
		console.error(e);
		that.stream_instance = null;
		close_stream(stream_status, abort_controller);

		// A broken connection is not the end of the jobs behind it. The server keeps
		// them, and keeps their output, for long enough to come back for, so the
		// stream is reopened rather than every listener being told it is over.
		if (that.closed || unclosed_events.size === 0) {
			await Promise.all(
				Object.keys(event_callbacks).map((event_id) =>
					event_callbacks[event_id]({
						msg: "broken_connection",
						message: BROKEN_CONNECTION_MSG
					})
				)
			);
			return;
		}

		that.reopen_stream_later();
	};
}

/**
 * Follows a single job on its own stream, feeding its messages to `on_message`.
 *
 * Used by a page that reloaded: the session it submitted from is gone, so the job is
 * reached by its own id instead. Returns a function that stops following it.
 */
export function follow_event(
	client: Client,
	event_id: string,
	on_message: (data: any) => void | Promise<void>
): () => void {
	const { config } = client;
	if (!config) {
		throw new Error("Could not resolve app config");
	}

	const url = new URL(
		`${config.root}${client.api_prefix}/${EVENT_URL}/${event_id}`
	);
	if (client.jwt) {
		url.searchParams.set("__sign", client.jwt);
	}

	// Its own controller, so that closing this stream leaves the session's alone.
	const controller = new AbortController();
	const stream = readable_stream(url.toString(), { signal: controller.signal });

	stream.onmessage = async function (event: MessageEvent) {
		const data = JSON.parse(event.data);
		if (data.msg === "close_stream") {
			controller.abort();
			return;
		}
		await on_message(data);
	};
	stream.onerror = async function (e) {
		console.error(e);
		await on_message({
			msg: "broken_connection",
			message: BROKEN_CONNECTION_MSG
		});
	};

	return () => controller.abort();
}

export function close_stream(
	stream_status: { open: boolean },
	abort_controller: AbortController | null
): void {
	if (stream_status) {
		stream_status.open = false;
		abort_controller?.abort();
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
			// A new output can appear mid-stream if the app was hot-reloaded
			// while a generator was running; such outputs are diffed against
			// null on the server, so start from null when we haven't seen it.
			const prev =
				i < pending_diff_streams[event_id].length
					? pending_diff_streams[event_id][i]
					: null;
			let new_data = apply_diff(prev, value);
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

export function readable_stream(
	input: RequestInfo | URL,
	init: RequestInit = {}
): EventSource {
	const instance: EventSource & { readyState: number } = {
		close: () => {
			console.warn("Method not implemented.");
		},
		onerror: null,
		onmessage: null,
		onopen: null,
		readyState: 0,
		url: input.toString(),
		withCredentials: false,
		CONNECTING: 0,
		OPEN: 1,
		CLOSED: 2,
		addEventListener: () => {
			throw new Error("Method not implemented.");
		},
		dispatchEvent: () => {
			throw new Error("Method not implemented.");
		},
		removeEventListener: () => {
			throw new Error("Method not implemented.");
		}
	};

	stream(input, init)
		.then(async (res) => {
			instance.readyState = instance.OPEN;
			try {
				for await (const chunk of res) {
					//@ts-ignore
					instance.onmessage && instance.onmessage(chunk);
				}
				instance.readyState = instance.CLOSED;
			} catch (e) {
				instance.onerror && instance.onerror(e as Event);
				instance.readyState = instance.CLOSED;
			}
		})
		.catch((e) => {
			console.error(e);
			instance.onerror && instance.onerror(e as Event);
			instance.readyState = instance.CLOSED;
		});

	return instance as EventSource;
}

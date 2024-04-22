import { BROKEN_CONNECTION_MSG } from "../constants";
import type { Client } from "../client";

export function open_stream(this: Client): void {
	let {
		event_callbacks,
		unclosed_events,
		pending_stream_messages,
		stream_status,
		config
	} = this;

	if (!config) {
		throw new Error("Could not resolve app config");
	}

	stream_status.open = true;

	let event_source: EventSource | null = null;
	let params = new URLSearchParams({
		session_hash: this.session_hash
	}).toString();

	let url = new URL(`${config.root}/queue/data?${params}`);
	event_source = this.eventSource_factory(url);

	if (!event_source) {
		throw new Error("Cannot connect to sse endpoint: " + url.toString());
	}

	event_source.onmessage = async function (event) {
		let _data = JSON.parse(event.data);
		if (_data.msg === "close_stream") {
			close_stream(stream_status, event_source);
			return;
		}
		const event_id = _data.event_id;
		if (!event_id) {
			await Promise.all(
				Object.keys(event_callbacks).map(
					(event_id) =>
						// @ts-ignore
						event_callbacks[event_id](_data) // todo: check event_callbacks
				)
			);
		} else if (event_callbacks[event_id] && config) {
			if (
				_data.msg === "process_completed" &&
				["sse", "sse_v1", "sse_v2", "sse_v2.1"].includes(config.protocol)
			) {
				unclosed_events.delete(event_id);
				if (unclosed_events.size === 0) {
					close_stream(stream_status, event_source);
				}
			}
			let fn = event_callbacks[event_id];
			window.setTimeout(fn, 0, _data); // need to do this to put the event on the end of the event loop, so the browser can refresh between callbacks and not freeze in case of quick generations. See https://github.com/gradio-app/gradio/pull/7055
		} else {
			if (!pending_stream_messages[event_id]) {
				pending_stream_messages[event_id] = [];
			}
			pending_stream_messages[event_id].push(_data);
		}
	};
	event_source.onerror = async function () {
		await Promise.all(
			Object.keys(event_callbacks).map((event_id) =>
				// @ts-ignore
				event_callbacks[event_id]({
					msg: "unexpected_error",
					message: BROKEN_CONNECTION_MSG
				})
			)
		);
		close_stream(stream_status, event_source);
	};
}

export function close_stream(
	stream_status: { open: boolean },
	event_source: EventSource | null
): void {
	if (stream_status && event_source) {
		stream_status.open = false;
		event_source?.close();
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

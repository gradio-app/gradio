/**
 * Mock the client module `@gradio/client` for the Wasm env.
 */
import type {
	EventType,
	EventListener,
	ListenerMap,
	Event,
	Payload,
	PostResponse,
	UploadResponse,
	Status,
	SpaceStatus,
	SpaceStatusCallback
} from "./types";

import type { Config } from "./types";

import type { WorkerProxy } from "./worker-proxy";

type event = <K extends EventType>(
	eventType: K,
	listener: EventListener<K>
) => client_return;
type predict = (endpoint: string, payload: Payload) => Promise<unknown>;

type client_return = {
	predict: predict;
	config: Config;
	on: event;
	off: event;
	cancel: (endpoint: string, fn_index?: number) => void;
};

const BROKEN_CONNECTION_MSG = "Connection errored out.";

export async function post_data(
	workerProxy: WorkerProxy,
	path: string,
	body: unknown
): Promise<[PostResponse, number]> {
	try {
		const response = await workerProxy.httpRequest({
			method: "POST",
			headers: { "Content-Type": "application/json" },
			path,
			query_string: "",
			body: new TextEncoder().encode(JSON.stringify(body))
		});
		const bodyStr =
			typeof response.body === "string"
				? response.body
				: new TextDecoder().decode(response.body);
		const output: PostResponse = JSON.parse(bodyStr);
		return [output, response.status];
	} catch (e) {
		return [{ error: BROKEN_CONNECTION_MSG }, 500];
	}
}

export async function client(
	workerProxy: WorkerProxy,
	space_status_callback?: SpaceStatusCallback
): Promise<client_return> {
	const return_obj = {
		predict,
		on,
		off,
		cancel
	};

	const listener_map: ListenerMap<EventType> = {};
	const session_hash = Math.random().toString(36).substring(2);
	const ws_map = new Map<number, WebSocket>();
	const last_status: Record<string, Status["status"]> = {};
	let config: Config;
	let api_map: Record<string, number> = {};

	function config_success(_config: Config) {
		config = _config;
		// api_map = map_names_to_ids(_config?.dependencies || []);  // TODO: What's this?
		return {
			config,
			...return_obj
		};
	}

	function on<K extends EventType>(eventType: K, listener: EventListener<K>) {
		const narrowed_listener_map: ListenerMap<K> = listener_map;
		let listeners = narrowed_listener_map[eventType] || [];
		narrowed_listener_map[eventType] = listeners;
		listeners?.push(listener);

		return { ...return_obj, config };
	}

	function off<K extends EventType>(eventType: K, listener: EventListener<K>) {
		const narrowed_listener_map: ListenerMap<K> = listener_map;
		let listeners = narrowed_listener_map[eventType] || [];
		listeners = listeners?.filter((l) => l !== listener);
		narrowed_listener_map[eventType] = listeners;

		return { ...return_obj, config };
	}

	function cancel(endpoint: string, fn_index?: number) {
		const _index = typeof fn_index === "number" ? fn_index : api_map[endpoint];

		fire_event({
			type: "status",
			endpoint,
			fn_index: _index,
			status: "complete",
			queue: false
		});

		ws_map.get(_index)?.close();
	}

	function fire_event<K extends EventType>(event: Event<K>) {
		const narrowed_listener_map: ListenerMap<K> = listener_map;
		let listeners = narrowed_listener_map[event.type] || [];
		listeners?.forEach((l) => l(event));
	}
	function make_predict(endpoint: string, payload: Payload) {
		return new Promise((res, rej) => {
			const trimmed_endpoint = endpoint.replace(/^\//, "");
			let fn_index =
				typeof payload.fn_index === "number"
					? payload.fn_index
					: api_map[trimmed_endpoint];
			// if (skip_queue(fn_index, config)) {  // TODO: We skipped queue for Wasm env. Is it OK?
			fire_event({
				type: "status",
				endpoint,
				status: "pending",
				queue: false,
				fn_index
			});

			post_data(
				workerProxy,
				`/run${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
				{
					...payload,
					session_hash
				}
			)
				.then(([output, status_code]) => {
					if (status_code == 200) {
						fire_event({
							type: "status",
							endpoint,
							fn_index,
							status: "complete",
							eta: output.average_duration,
							queue: false
						});

						fire_event({
							type: "data",
							endpoint,
							fn_index,
							data: output.data
						});
					} else {
						fire_event({
							type: "status",
							status: "error",
							endpoint,
							fn_index,
							message: output.error,
							queue: false
						});
					}
				})
				.catch((e) => {
					fire_event({
						type: "status",
						status: "error",
						message: e.message,
						endpoint,
						fn_index,
						queue: false
					});
					throw new Error(e.message);
				});
		});
	}

	/**
	 * Run a prediction.
	 * @param endpoint - The prediction endpoint to use.
	 * @param status_callback - A function that is called with the current status of the prediction immediately and every time it updates.
	 * @return Returns the data for the prediction or an error message.
	 */
	function predict(endpoint: string, payload: Payload) {
		return make_predict(endpoint, payload);
	}

	config = await resolve_config(workerProxy, ``);
	return config_success(config);
}

async function resolve_config(
	workerProxy: WorkerProxy,
	endpoint: string
): Promise<Config> {
	// NOTE: In Wasm mode, we give up to get config from the static HTML.
	const response = await workerProxy.httpRequest({
		method: "GET",
		path: `${endpoint}/config`,
		query_string: "",
		body: new Uint8Array([]),
		headers: {}
	});
	console.debug("config response", {
		...response,
		body:
			typeof response.body === "string"
				? response.body
				: new TextDecoder().decode(response.body)
	});

	if (response.status === 200) {
		const bodyStr =
			typeof response.body === "string"
				? response.body
				: new TextDecoder().decode(response.body);
		const config = JSON.parse(bodyStr);
		config.path = config.path ?? "";
		config.root = endpoint;
		return config;
	} else {
		throw new Error("Could not get config.");
	}
}

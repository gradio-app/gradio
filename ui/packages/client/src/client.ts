import {
	process_endpoint,
	RE_SPACE_NAME,
	map_names_to_ids,
	discussions_enabled
} from "./utils";

import type {
	EventType,
	EventListener,
	ListenerMap,
	Event,
	Config,
	Payload,
	PostResponse,
	UploadResponse,
	Status,
	SpaceStatus,
	SpaceStatusCallback
} from "./types";

type event = <K extends EventType>(
	eventType: K,
	listener: EventListener<K>
) => ReturnType<predict>;
type predict = (endpoint: string, payload: Payload) => {};

type client_return = {
	predict: predict;
	config: Config;
	on: event;
	off: event;
	cancel: (endpoint: string, fn_index?: number) => void;
};

const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";

export async function post_data(
	url: string,
	body: unknown
): Promise<[PostResponse, number]> {
	try {
		var response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" }
		});
	} catch (e) {
		return [{ error: BROKEN_CONNECTION_MSG }, 500];
	}
	const output: PostResponse = await response.json();
	return [output, response.status];
}

export async function upload_files(
	root: string,
	files: Array<File>
): Promise<UploadResponse> {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append("files", file);
	});
	try {
		var response = await fetch(`${root}/upload`, {
			method: "POST",
			body: formData
		});
	} catch (e) {
		return { error: BROKEN_CONNECTION_MSG };
	}
	const output: UploadResponse["files"] = await response.json();
	return { files: output };
}

export async function client(
	app_reference: string,
	space_status_callback?: SpaceStatusCallback
): Promise<client_return> {
	return new Promise(async (res, rej) => {
		const return_obj = {
			predict,
			on,
			off,
			cancel
		};

		const listener_map: ListenerMap<EventType> = {};
		const { ws_protocol, http_protocol, host, space_id } =
			await process_endpoint(app_reference);
		const session_hash = Math.random().toString(36).substring(2);
		const ws_map = new Map<number, WebSocket>();
		const last_status: Record<string, Status["status"]> = {};
		let config: Config;
		let api_map: Record<string, number> = {};

		function config_success(_config: Config) {
			config = _config;
			api_map = map_names_to_ids(_config?.dependencies || []);
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

		function off<K extends EventType>(
			eventType: K,
			listener: EventListener<K>
		) {
			const narrowed_listener_map: ListenerMap<K> = listener_map;
			let listeners = narrowed_listener_map[eventType] || [];
			listeners = listeners?.filter((l) => l !== listener);
			narrowed_listener_map[eventType] = listeners;

			return { ...return_obj, config };
		}

		function cancel(endpoint: string, fn_index?: number) {
			const _index =
				typeof fn_index === "number" ? fn_index : api_map[endpoint];

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

		async function handle_space_sucess(status: SpaceStatus) {
			if (space_status_callback) space_status_callback(status);
			if (status.status === "running")
				try {
					config = await resolve_config(`${http_protocol}//${host}`);
					res(config_success(config));
				} catch (e) {
					if (space_status_callback) {
						space_status_callback({
							status: "error",
							message: "Could not load this space.",
							load_status: "error",
							detail: "NOT_FOUND"
						});
					}
				}
		}

		try {
			config = await resolve_config(`${http_protocol}//${host}`);
			res(config_success(config));
		} catch (e) {
			if (space_id) {
				check_space_status(
					space_id,
					RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
					handle_space_sucess
				);
			} else {
				if (space_status_callback)
					space_status_callback({
						status: "error",
						message: "Could not load this space.",
						load_status: "error",
						detail: "NOT_FOUND"
					});
			}
		}
		function make_predict(endpoint: string, payload: Payload) {
			return new Promise((res, rej) => {
				const trimmed_endpoint = endpoint.replace(/^\//, "");
				let fn_index =
					typeof payload.fn_index === "number"
						? payload.fn_index
						: api_map[trimmed_endpoint];

				if (skip_queue(fn_index, config)) {
					fire_event({
						type: "status",
						endpoint,
						status: "pending",
						queue: false,
						fn_index
					});

					post_data(
						`${http_protocol}//${host + config.path}/run${
							endpoint.startsWith("/") ? endpoint : `/${endpoint}`
						}`,
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
				} else {
					fire_event({
						type: "status",
						status: "pending",
						queue: true,
						endpoint,
						fn_index
					});

					const ws_endpoint = `${ws_protocol}://${host + config.path}/queue/join`;

					const websocket = new WebSocket(ws_endpoint);

					ws_map.set(fn_index, websocket);
					websocket.onclose = (evt) => {
						if (!evt.wasClean) {
							fire_event({
								type: "status",
								status: "error",
								message: BROKEN_CONNECTION_MSG,
								queue: true,
								endpoint,
								fn_index
							});
						}
					};

					websocket.onmessage = function (event) {
						const _data = JSON.parse(event.data);
						const { type, status, data } = handle_message(
							_data,
							last_status[fn_index]
						);

						if (type === "update" && status) {
							// call 'status' listeners
							fire_event({ type: "status", endpoint, fn_index, ...status });
							if (status.status === "error") {
								websocket.close();
								rej(status);
							}
						} else if (type === "hash") {
							websocket.send(JSON.stringify({ fn_index, session_hash }));
							return;
						} else if (type === "data") {
							websocket.send(JSON.stringify({ ...payload, session_hash }));
						} else if (type === "complete") {
							fire_event({
								type: "status",
								...status,
								status: status?.status!,
								queue: true,
								endpoint,
								fn_index
							});
							websocket.close();
						} else if (type === "generating") {
							fire_event({
								type: "status",
								...status,
								status: status?.status!,
								queue: true,
								endpoint,
								fn_index
							});
						}
						if (data) {
							fire_event({
								type: "data",
								data: data.data,
								endpoint,
								fn_index
							});
							res({ data: data.data });
						}
					};
				}
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
	});
}

function skip_queue(id: number, config: Config) {
	return (
		!(config?.dependencies?.[id].queue === null
			? config.enable_queue
			: config?.dependencies?.[id].queue) || false
	);
}

async function resolve_config(endpoint?: string): Promise<Config> {
	if (window.gradio_config && location.origin !== "http://localhost:9876") {
		const path = window.gradio_config.root;
		const config = window.gradio_config;
		config.root = endpoint + config.root;
		return { ...config, path: path };
	} else if (endpoint) {
		let response = await fetch(`${endpoint}/config`);

		if (response.status === 200) {
			const config = await response.json();
			config.path = config.root;
			config.root = endpoint + config.root;
			return config;
		} else {
			throw new Error("Could not get config.");
		}
	}

	throw new Error("No config or app endpoint found");
}

async function check_space_status(
	id: string,
	type: "subdomain" | "space_name",
	space_status_callback: SpaceStatusCallback
) {
	let endpoint =
		type === "subdomain"
			? `https://huggingface.co/api/spaces/by-subdomain/${id}`
			: `https://huggingface.co/api/spaces/${id}`;
	let response;
	let _status;
	try {
		response = await fetch(endpoint);
		_status = response.status;
		if (_status !== 200) {
			throw new Error();
		}
		response = await response.json();
	} catch (e) {
		space_status_callback({
			status: "error",
			load_status: "error",
			message: "Could not get space status",
			detail: "NOT_FOUND"
		});
		return;
	}

	if (!response || _status !== 200) return;
	const {
		runtime: { stage },
		id: space_name
	} = response;

	switch (stage) {
		case "STOPPED":
		case "SLEEPING":
			space_status_callback({
				status: "sleeping",
				load_status: "pending",
				message: "Space is asleep. Waking it up...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, space_status_callback);
			}, 1000);
			break;
		// poll for status
		case "RUNNING":
		case "RUNNING_BUILDING":
			space_status_callback({
				status: "running",
				load_status: "complete",
				message: "",
				detail: stage
			});
			// load_config(source);
			//  launch
			break;
		case "BUILDING":
			space_status_callback({
				status: "building",
				load_status: "pending",
				message: "Space is building...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, space_status_callback);
			}, 1000);
			break;
		default:
			space_status_callback({
				status: "space_error",
				load_status: "error",
				message: "This space is experiencing an issue.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
	}
}

function handle_message(
	data: any,
	last_status: Status["status"]
): {
	type: "hash" | "data" | "update" | "complete" | "generating" | "none";
	data?: any;
	status?: Status;
} {
	const queue = true;
	switch (data.msg) {
		case "send_data":
			return { type: "data" };
		case "send_hash":
			return { type: "hash" };
		case "queue_full":
			return {
				type: "update",
				status: {
					queue,
					message: QUEUE_FULL_MSG,
					status: "error"
				}
			};
		case "estimation":
			return {
				type: "update",
				status: {
					queue,
					status: last_status || "pending",
					size: data.queue_size,
					position: data.rank,
					eta: data.rank_eta
				}
			};
		case "progress":
			return {
				type: "update",
				status: {
					queue,
					status: "pending",
					progress: data.progress_data
				}
			};
		case "process_generating":
			return {
				type: "generating",
				status: {
					queue,
					message: !data.success ? data.output.error : null,
					status: data.success ? "generating" : "error",
					progress: data.progress_data,
					eta: data.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_completed":
			return {
				type: "complete",
				status: {
					queue,
					message: !data.success ? data.output.error : undefined,
					status: data.success ? "complete" : "error",
					progress: data.progress_data,
					eta: data.output.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_starts":
			return {
				type: "update",
				status: {
					queue,
					status: "pending",
					size: data.rank,
					position: 0
				}
			};
	}

	return { type: "none", status: { status: "error", queue } };
}

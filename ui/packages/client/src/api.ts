import { process_endpoint, RE_SPACE_NAME } from "./utils";
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
	SpaceStatusCallback,
	status_callback_function
} from "./types";

type event = <K extends EventType>(
	eventType: K,
	listener: EventListener<K>
) => ReturnType<predict>;
type predict = (
	endpoint: string,
	payload: Payload
) => {
	on: event;
	off: event;
	cancel: (endpoint: string | number) => void;
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
		var response = await fetch(`${root}upload`, {
			method: "POST",
			body: formData
		});
	} catch (e) {
		return { error: BROKEN_CONNECTION_MSG };
	}
	const output: UploadResponse["files"] = await response.json();
	return { files: output };
}

function map_names_to_ids(fns: Config["dependencies"]) {
	let apis: Record<string, number> = {};

	fns.forEach(({ api_name }, i) => {
		if (api_name) apis[api_name] = i;
	});

	return apis;
}

export async function client(
	app_reference: string,
	space_status_callback?: SpaceStatusCallback
): Promise<{ predict: predict; config: Config }> {
	return new Promise(async (res, rej) => {
		const { ws_protocol, http_protocol, host, space_id } =
			await process_endpoint(app_reference);
		const session_hash = Math.random().toString(36).substring(2);
		const ws_map = new Map<number, WebSocket>();
		const last_status: Record<string, Status["status"]> = {};
		let config: Config;
		let api_map: Record<string, number> = {};

		function config_success(_config: Config) {
			config = _config;
			api_map = map_names_to_ids(_config.dependencies);
			return {
				config,
				predict
			};
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
			}
		}
		function make_predict(endpoint: string, payload: Payload) {
			const x = {
				on,
				off,
				cancel
			};

			let fn_index = api_map[endpoint] || payload.fn_index!;
			const listener_map: ListenerMap<EventType> = {};

			function cancel(endpoint: string | number) {
				const _index =
					typeof endpoint === "string" ? api_map[endpoint] : endpoint;
				fire_event({
					type: "status",
					status: "complete"
				});
				ws_map.get(_index)?.close();
			}

			function on<K extends EventType>(
				eventType: K,
				listener: EventListener<K>
			) {
				const narrowed_listener_map: ListenerMap<K> = listener_map;
				let listeners = narrowed_listener_map[eventType] || [];
				narrowed_listener_map[eventType] = listeners;
				listeners.push(listener);

				return x;
			}

			function off<K extends EventType>(
				eventType: K,
				listener: EventListener<K>
			) {
				const narrowed_listener_map: ListenerMap<K> = listener_map;
				let listeners = narrowed_listener_map[eventType] || [];
				listeners = listeners.filter((l) => l !== listener);
				narrowed_listener_map[eventType] = listeners;

				return x;
			}

			function fire_event<K extends EventType>(event: Event<K>) {
				const narrowed_listener_map: ListenerMap<K> = listener_map;
				let listeners = narrowed_listener_map[event.type] || [];
				listeners.forEach((l) => l(event));
			}

			// const { fn_index } = endpoint;
			if (skip_queue(fn_index, config)) {
				fire_event({ type: "status", status: "pending" });

				post_data(
					`${http_protocol}//${host}/api${
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
								status: "complete",
								eta: output.average_duration
							});
						} else {
							fire_event({
								type: "status",
								status: "error",
								message: output.error
							});
						}
						fire_event({ type: "data", data: output.data });
					})
					.catch((e) => {
						fire_event({
							type: "status",
							status: "error",
							message: e.message
						});
						throw new Error(e.message);
					});
			} else {
				const ws_endpoint = `${ws_protocol}://${host}/queue/join`;

				const websocket = new WebSocket(ws_endpoint);
				ws_map.set(fn_index, websocket);
				websocket.onclose = (evt) => {
					if (!evt.wasClean) {
						fire_event({
							type: "status",
							status: "error",
							message: BROKEN_CONNECTION_MSG
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
						fire_event({ type: "status", ...status });
						if (status.status === "error") {
							websocket.close();
						}
					} else if (type === "send") {
						ws_map
							.get(fn_index)
							?.send(JSON.stringify({ ...payload, session_hash }));
						return;
					} else if (type === "complete") {
						fire_event({ type: "status", ...status, status: status?.status! });

						websocket.close();
					}
					if (data) {
						fire_event({ type: "data", data: data.data });
					}
				};

				return x;
			}

			return x;
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
	if (window.gradio_config) {
		return window.gradio_config;
	} else if (endpoint) {
		let response = await fetch(`${endpoint}/config`);
		if (response.status === 200) {
			const config = await response.json();
			config.root = endpoint;
			return config;
		} else {
			throw new Error("Could not get config.");
		}
	}

	throw new Error("No config or app endpoint found");
}

const RE_DISABLED_DISCUSSION =
	/^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function discussions_enabled(space_id: string) {
	try {
		const r = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/discussions`,
			{
				method: "HEAD"
			}
		);
		const error = r.headers.get("x-error-message");

		if (error && RE_DISABLED_DISCUSSION.test(error)) return false;
		else return true;
	} catch (e) {
		return false;
	}
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
	type: "send" | "update" | "complete" | "generating" | "none";
	data?: any;
	status?: Status;
} {
	switch (data.msg) {
		case "send_data":
			return { type: "send" };
		case "send_hash":
			return { type: "send" };
		case "queue_full":
			return {
				type: "update",
				status: {
					message: QUEUE_FULL_MSG,
					status: "error"
				}
			};
		case "estimation":
			return {
				type: "update",
				status: {
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
					status: "pending",
					progress: data.progress_data
				}
			};
		case "process_generating":
			return {
				type: "generating",
				status: {
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
					status: "pending",
					size: data.rank,
					position: 0
				}
			};
	}

	return { type: "none", status: { status: "error" } };
}

/* eslint-disable complexity */
import {
	Status,
	Payload,
	EventType,
	ListenerMap,
	SubmitReturn,
	EventListener,
	Event,
	JsApiData,
	EndpointInfo,
	Config,
	ApiInfo
} from "../types";

import { post_data } from "./post_data";
import { handle_blob } from "./handle_blob";
import { Client } from "..";
import {
	process_endpoint,
	resolve_config,
	map_names_to_ids,
	skip_queue,
	handle_message
} from "../helpers";
import { BROKEN_CONNECTION_MSG, QUEUE_FULL_MSG } from "../constants";
import { apply_diff_stream, close_stream, open_stream } from "./stream";

export async function submit(
	this: Client,
	endpoint: string | number,
	data?: unknown[],
	event_data?: unknown
): Promise<SubmitReturn> {
	try {
		const { hf_token } = this.options;
		const config = await validate_and_resolve_config(this, hf_token);
		const session_hash = Math.random().toString(36).substring(2);
		const event_callbacks: Record<string, () => Promise<void>> = {};

		// SSE variables
		let stream_open = false;
		let pending_stream_messages: Record<string, any[]> = {}; // Event messages may be received by the SSE stream before the initial data POST request is complete. To resolve this race condition, we store the messages in a dictionary and process them when the POST request is complete.
		let pending_diff_streams: Record<string, any[][]> = {};
		let event_stream: EventSource;
		const unclosed_events: Set<string> = new Set();

		// API variables
		const api = await this.view_api(config);
		if (!api) throw new Error("No API found");
		const api_map = map_names_to_ids(config.dependencies);
		const { fn_index, api_info } = get_endpoint_info(api, endpoint, api_map);

		let payload: Payload;
		let event_id: string | null = null;
		let last_status = {};

		payload = { data: data || [], event_data, fn_index };

		const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;

		let protocol = config.protocol;

		// let complete: boolean | Record<string, any> = false;
		let complete: any; // fix typing

		const url_params =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search).toString()
				: "";

		const listener_map: ListenerMap<EventType> = {};

		// event subscription methods
		function fire_event<K extends EventType>(event: Event<K>): void {
			(listener_map[event.type] || []).forEach((listener) =>
				listener(event as Event<EventType>)
			);
		}

		function on<K extends EventType>(
			eventType: K,
			listener: EventListener<K>
		): SubmitReturn {
			const narrowed_listener_map: ListenerMap<K> = listener_map;
			const listeners = narrowed_listener_map[eventType] || [];
			narrowed_listener_map[eventType] = listeners;
			listeners?.push(listener);

			return { on, off, cancel, destroy };
		}

		function off<K extends EventType>(
			eventType: K,
			listener: EventListener<K>
		): SubmitReturn {
			listener_map[eventType] = (listener_map[eventType] || []).filter(
				(l) => l !== listener
			);
			return { on, off, cancel, destroy };
		}

		async function cancel(): Promise<void> {
			const _status: Status = {
				stage: "complete",
				queue: false,
				time: new Date()
			};
			complete = _status;
			fire_event({
				..._status,
				type: "status",
				endpoint: _endpoint,
				fn_index: fn_index
			});

			let cancel_request = {};

			event_stream.close();

			cancel_request = { event_id };

			try {
				config &&
					(await fetch(`${config.root}/reset`, {
						headers: { "Content-Type": "application/json" },
						method: "POST",
						body: JSON.stringify(cancel_request)
					}));
			} catch (e) {
				console.warn(
					"The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
				);
			}
		}

		function destroy(): void {
			for (const event_type in listener_map) {
				listener_map &&
					listener_map[event_type as "data" | "status"]?.forEach((fn) => {
						off(event_type as "data" | "status", fn);
					});
			}
		}

		if (data) {
			data = await handle_blob(`${config.root}`, data, api_info, hf_token);
		}

		payload = {
			data: data || [],
			event_data,
			fn_index
		};

		if (config && skip_queue(fn_index, config)) {
			fire_event({
				type: "status",
				endpoint: _endpoint,
				stage: "pending",
				queue: false,
				fn_index,
				time: new Date()
			});

			post_data(
				`${config.root}/run${
					_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`
				}${url_params ? "?" + url_params : ""}`,
				{
					...payload,
					session_hash
				},
				hf_token
			)
				.then(([output, status_code]) => {
					const data = output.data;
					if (status_code == 200) {
						fire_event({
							type: "data",
							endpoint: _endpoint,
							fn_index,
							data: data,
							time: new Date()
						});

						fire_event({
							type: "status",
							endpoint: _endpoint,
							fn_index,
							stage: "complete",
							eta: output.average_duration,
							queue: false,
							time: new Date()
						});
					} else {
						fire_event({
							type: "status",
							stage: "error",
							endpoint: _endpoint,
							fn_index,
							message: output.error,
							queue: false,
							time: new Date()
						});
					}
				})
				.catch((e) => {
					fire_event({
						type: "status",
						stage: "error",
						message: e.message,
						endpoint: _endpoint,
						fn_index,
						queue: false,
						time: new Date()
					});
				});
		} else if (protocol === "sse") {
			fire_event({
				type: "status",
				stage: "pending",
				queue: true,
				endpoint: _endpoint,
				fn_index,
				time: new Date()
			});

			const params = new URLSearchParams({
				fn_index: fn_index.toString(),
				session_hash: session_hash
			}).toString();

			const sse_url = new URL(
				`${config.root}/sse/${_endpoint.startsWith("/") ? _endpoint.substring(1) : _endpoint}?${params.toString()}${url_params ? "&" + url_params : ""}`
			);

			event_stream = new EventSource(sse_url);

			// Event listener for receiving messages
			event_stream.onmessage = async (event) => {
				const _data = JSON.parse(event.data);
				let event_id = _data.event_id;

				const { type, status, data } = handle_message(
					_data,
					last_status[fn_index as keyof typeof last_status]
				);

				if (type === "update" && status && !complete) {
					// call 'status' listeners
					fire_event({
						type: "status",
						endpoint: _endpoint,
						fn_index,
						time: new Date(),
						...status
					});
					if (status.stage === "error") {
						event_stream.close();
					}
				} else if (type === "data") {
					event_id = _data.event_id as string;
					let [_, status] = await post_data(
						`${config.root}/queue/data`,
						{
							...payload,
							session_hash,
							event_id
						},
						hf_token
					);
					if (status !== 200) {
						fire_event({
							type: "status",
							stage: "error",
							message: BROKEN_CONNECTION_MSG,
							queue: true,
							endpoint: _endpoint,
							fn_index,
							time: new Date()
						});
						event_stream.close();
					}
				} else if (type === "complete") {
					complete = status;
				} else if (type === "log") {
					fire_event({
						type: "log",
						log: data.log,
						level: data.level,
						endpoint: _endpoint,
						fn_index
					});
				} else if (type === "generating") {
					fire_event({
						type: "status",
						time: new Date(),
						...status,
						stage: status?.stage!,
						queue: true,
						endpoint: _endpoint,
						fn_index
					});
				}
				if (data) {
					fire_event({
						type: "data",
						time: new Date(),
						data: data.data,
						endpoint: _endpoint,
						fn_index
					});

					if (complete) {
						fire_event({
							type: "status",
							time: new Date(),
							...complete,
							stage: status?.stage!,
							queue: true,
							endpoint: _endpoint,
							fn_index
						});
						event_stream.close();
					}
				}
			};
		} else if (protocol === "sse_v1" || protocol === "sse_v2") {
			fire_event({
				type: "status",
				stage: "pending",
				queue: true,
				endpoint: _endpoint,
				fn_index,
				time: new Date()
			});

			fire_event({
				type: "status",
				stage: "pending",
				queue: true,
				endpoint: _endpoint,
				fn_index,
				time: new Date()
			});

			post_data(
				`${config.root}/queue/join?${url_params}`,
				{
					...payload,
					session_hash
				},
				hf_token
			).then(([response, status]) => {
				if (status === 503) {
					fire_event({
						type: "status",
						stage: "error",
						message: QUEUE_FULL_MSG,
						queue: true,
						endpoint: _endpoint,
						fn_index,
						time: new Date()
					});
				} else if (status !== 200) {
					fire_event({
						type: "status",
						stage: "error",
						message: BROKEN_CONNECTION_MSG,
						queue: true,
						endpoint: _endpoint,
						fn_index,
						time: new Date()
					});
				} else {
					event_id = response.event_id as string;
					let callback = async function (_data: object): Promise<void> {
						try {
							const { type, status, data } = handle_message(
								_data,
								last_status[fn_index as keyof typeof last_status]
							);

							if (type === "heartbeat") {
								return;
							}

							if (type === "update" && status && !complete) {
								// call 'status' listeners
								fire_event({
									type: "status",
									endpoint: _endpoint,
									fn_index,
									time: new Date(),
									...status
								});
								if (status.stage === "error") {
									event_stream.close();
								}
							} else if (type === "unexpected_error") {
								console.error("Unexpected error", status?.message);
								fire_event({
									type: "status",
									stage: "error",
									message: status?.message || "An Unexpected Error Occurred!",
									queue: true,
									endpoint: _endpoint,
									fn_index,
									time: new Date()
								});
								close_stream(stream_open, event_stream);
							} else if (type === "log") {
								fire_event({
									type: "log",
									log: data.log,
									level: data.level,
									endpoint: _endpoint,
									fn_index
								});
							} else if (type === "generating") {
								fire_event({
									type: "status",
									time: new Date(),
									...status,
									stage: status?.stage!,
									queue: true,
									endpoint: _endpoint,
									fn_index
								});
								if (event_id && data && protocol === "sse_v2") {
									apply_diff_stream(pending_diff_streams, event_id, data); // Example function to apply diffs
								}
								if (data) {
									fire_event({
										type: "data",
										time: new Date(),
										data: data.data,
										endpoint: _endpoint,
										fn_index
									});

									if (complete) {
										fire_event({
											type: "status",
											time: new Date(),
											...complete,
											stage: status?.stage!,
											queue: true,
											endpoint: _endpoint,
											fn_index
										});
									}

									if (
										event_id &&
										(status?.stage === "complete" || status?.stage === "error")
									) {
										if (event_callbacks[event_id]) {
											delete event_callbacks[event_id];
										}
										if (event_id in pending_diff_streams) {
											delete pending_diff_streams[event_id];
										}
									}
								}
							}
						} catch (e) {
							console.error("Unexpected client exception", e);
							fire_event({
								type: "status",
								stage: "error",
								message: "An Unexpected Error Occurred!",
								queue: true,
								endpoint: _endpoint,
								fn_index,
								time: new Date()
							});
							close_stream(stream_open, event_stream);
						}
					};
					if (event_id in pending_stream_messages) {
						pending_stream_messages[event_id].forEach((msg: object) =>
							callback(msg)
						);
						delete pending_stream_messages[event_id];
					}
					// @ts-ignore
					event_callbacks[event_id] = callback; // fix typing

					unclosed_events.add(event_id);
					if (!stream_open) {
						open_stream(
							stream_open,
							session_hash,
							config,
							event_callbacks,
							unclosed_events,
							pending_stream_messages
						);
					}
				}
			});
		}

		return { on, off, cancel, destroy };
	} catch (error) {
		console.error("Submit function encountered an error:", error);
		throw error;
	}
}

async function validate_and_resolve_config(
	client: Client,
	hf_token?: `hf_${string}`
): Promise<Config> {
	const { http_protocol, host } =
		(await process_endpoint(client.app_reference, hf_token ?? undefined)) || {};

	if (!http_protocol || !host) throw new Error("Could not get host");
	const config = await resolve_config(
		fetch,
		`${http_protocol}//${host}`,
		hf_token
	);
	if (!config) throw new Error("No config or app_id set");
	return config;
}

function get_endpoint_info(
	api: ApiInfo<JsApiData>,
	endpoint: string | number,
	api_map: Record<string, number>
): { fn_index: number; api_info: EndpointInfo<JsApiData> } {
	const fn_index =
		typeof endpoint === "number"
			? endpoint
			: api_map[endpoint.replace(/^\//, "")];
	const api_info =
		typeof endpoint === "number"
			? api.unnamed_endpoints[fn_index]
			: api.named_endpoints[endpoint.trim()];

	if (typeof fn_index !== "number" || !api_info)
		throw new Error("Invalid endpoint");
	return { fn_index, api_info };
}

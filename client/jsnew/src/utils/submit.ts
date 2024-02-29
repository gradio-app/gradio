import {
	Status,
	Payload,
	EventType,
	ListenerMap,
	SubmitReturn,
	EventListener,
	Event,
	JsApiData,
	EndpointInfo
} from "../types";

import { post_data } from "./post_data";
import { handle_message, skip_queue } from "../helpers";
import { handle_blob } from "./handle_blob";
import { BROKEN_CONNECTION_MSG, QUEUE_FULL_MSG } from "../constants";
import { Client } from "..";
import { apply_diff_stream } from "./stream";

export async function submit(
	this: Client,
	endpoint: string | number,
	data: unknown[],
	event_data: unknown,
	trigger_id: number | null = null
): Promise<SubmitReturn> {
	const { hf_token } = this.options;

	let config = this.config;
	let session_hash = this.session_hash;
	let api_map = this.api_map;

	let fn_index: number;
	let api_info: EndpointInfo<JsApiData>;

	const api = await this.view_api(this.config);

	if (!api || !config) {
		throw new Error("No API found");
	}

	if (typeof endpoint === "number") {
		fn_index = endpoint;
		api_info = api.unnamed_endpoints[fn_index];
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");

		fn_index = api_map[trimmed_endpoint];
		api_info = api.named_endpoints[endpoint.trim()];
	}

	if (typeof fn_index !== "number") {
		throw new Error(
			"There is no endpoint matching that name of fn_index matching that number."
		);
	}

	let eventSource: EventSource;
	let protocol = config.protocol;

	const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;
	let payload: Payload;
	let event_id: string | null = null;
	let complete: false | Record<string, any> = false;
	const listener_map: ListenerMap<EventType> = {};
	let url_params = "";

	if (typeof window !== "undefined") {
		url_params = new URLSearchParams(window.location.search).toString();
	}

	config &&
		handle_blob(`${config.root}`, data, api_info, hf_token).then((_payload) => {
			payload = {
				data: _payload || [],
				event_data,
				fn_index,
				// @ts-ignore
				trigger_id
			};
			if (skip_queue(fn_index, config)) {
				fire_event({
					type: "status",
					endpoint: _endpoint,
					stage: "pending",
					queue: false,
					fn_index,
					time: new Date()
				});

				config &&
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
			} else if (protocol == "sse") {
				fire_event({
					type: "status",
					stage: "pending",
					queue: true,
					endpoint: _endpoint,
					fn_index,
					time: new Date()
				});
				var params = new URLSearchParams({
					fn_index: fn_index.toString(),
					session_hash: session_hash
				}).toString();
				let url = new URL(
					`${config.root}/queue/join?${
						url_params ? url_params + "&" : ""
					}${params}`
				);

				eventSource = EventSource_factory(url);

				eventSource.onmessage = async function (event) {
					const _data = JSON.parse(event.data);
					const { type, status, data } = handle_message(
						_data,
						this.last_status[fn_index]
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
							eventSource.close();
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
							eventSource.close();
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
							eventSource.close();
						}
					}
				};
			} else if (protocol == "sse_v1" || protocol == "sse_v2") {
				// latest API format. v2 introduces sending diffs for intermediate outputs in generative functions, which makes payloads lighter.
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
									last_status[fn_index]
								);

								if (type == "heartbeat") {
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
								} else if (type === "complete") {
									complete = status;
								} else if (type == "unexpected_error") {
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
								} else if (type === "log") {
									fire_event({
										type: "log",
										log: data.log,
										level: data.level,
										endpoint: _endpoint,
										fn_index
									});
									return;
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
									if (data && protocol === "sse_v2") {
										apply_diff_stream(event_id!, data);
									}
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
								}

								if (status?.stage === "complete" || status?.stage === "error") {
									if (event_callbacks[event_id]) {
										delete event_callbacks[event_id];
									}
									if (event_id in pending_diff_streams) {
										delete pending_diff_streams[event_id];
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
								close_stream();
							}
						};
						if (event_id in pending_stream_messages) {
							pending_stream_messages[event_id].forEach((msg: object) =>
								callback(msg)
							);
							delete pending_stream_messages[event_id];
						}
						event_callbacks[event_id] = callback;
						unclosed_events.add(event_id);
						if (!stream_open) {
							open_stream();
						}
					}
				});
			}
		});

	function fire_event<K extends EventType>(event: Event<K>): void {
		const narrowed_listener_map: ListenerMap<K> = listener_map;
		const listeners = narrowed_listener_map[event.type] || [];
		listeners?.forEach((l) => l(event));
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
		const narrowed_listener_map: ListenerMap<K> = listener_map;
		let listeners = narrowed_listener_map[eventType] || [];
		listeners = listeners?.filter((l) => l !== listener);
		narrowed_listener_map[eventType] = listeners;

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
		eventSource.close();
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

	return {
		on,
		off,
		cancel,
		destroy
	};
}

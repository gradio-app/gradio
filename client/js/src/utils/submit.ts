/* eslint-disable complexity */
import type {
	Status,
	Payload,
	EventType,
	ListenerMap,
	SubmitReturn,
	EventListener,
	Event,
	JsApiData,
	EndpointInfo,
	ApiInfo,
	Config,
	Dependency
} from "../types";

import { skip_queue, post_message } from "../helpers/data";
import { resolve_root } from "../helpers/init_helpers";
import { handle_message, process_endpoint } from "../helpers/api_info";
import { BROKEN_CONNECTION_MSG, QUEUE_FULL_MSG } from "../constants";
import { apply_diff_stream, close_stream } from "./stream";
import { Client } from "../client";

export function submit(
	this: Client,
	endpoint: string | number,
	data: unknown[],
	event_data?: unknown,
	trigger_id?: number | null
): SubmitReturn {
	try {
		const { hf_token } = this.options;
		const {
			fetch,
			app_reference,
			config,
			session_hash,
			api_info,
			api_map,
			stream_status,
			pending_stream_messages,
			pending_diff_streams,
			event_callbacks,
			unclosed_events,
			post_data
		} = this;

		if (!api_info) throw new Error("No API found");
		if (!config) throw new Error("Could not resolve app config");

		let { fn_index, endpoint_info, dependency } = get_endpoint_info(
			api_info,
			endpoint,
			api_map,
			config
		);

		let websocket: WebSocket;
		let stream: EventSource | null;
		let protocol = config.protocol ?? "ws";

		const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;
		let payload: Payload;
		let event_id: string | null = null;
		let complete: Status | undefined | false = false;
		const listener_map: ListenerMap<EventType> = {};
		let last_status: Record<string, Status["stage"]> = {};
		let url_params =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search).toString()
				: "";

		// event subscription methods
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
			if (protocol === "ws") {
				if (websocket && websocket.readyState === 0) {
					websocket.addEventListener("open", () => {
						websocket.close();
					});
				} else {
					websocket.close();
				}
				cancel_request = { fn_index, session_hash };
			} else {
				stream?.close();
				cancel_request = { event_id };
			}

			try {
				if (!config) {
					throw new Error("Could not resolve app config");
				}

				await fetch(`${config.root}/reset`, {
					headers: { "Content-Type": "application/json" },
					method: "POST",
					body: JSON.stringify(cancel_request)
				});
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

		this.handle_blob(config.root, data, endpoint_info).then(
			async (_payload) => {
				payload = {
					data: _payload || [],
					event_data,
					fn_index,
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

					post_data(
						`${config.root}/run${
							_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`
						}${url_params ? "?" + url_params : ""}`,
						{
							...payload,
							session_hash
						}
					)
						.then(([output, status_code]: any) => {
							const data = output.data;
							if (status_code == 200) {
								fire_event({
									type: "data",
									endpoint: _endpoint,
									fn_index,
									data: data,
									time: new Date(),
									event_data,
									trigger_id
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
				} else if (protocol == "ws") {
					const { ws_protocol, host } = await process_endpoint(
						app_reference,
						hf_token
					);

					fire_event({
						type: "status",
						stage: "pending",
						queue: true,
						endpoint: _endpoint,
						fn_index,
						time: new Date()
					});

					let url = new URL(
						`${ws_protocol}://${resolve_root(
							host,
							config.path as string,
							true
						)}/queue/join${url_params ? "?" + url_params : ""}`
					);

					if (this.jwt) {
						url.searchParams.set("__sign", this.jwt);
					}

					websocket = new WebSocket(url);

					websocket.onclose = (evt) => {
						if (!evt.wasClean) {
							fire_event({
								type: "status",
								stage: "error",
								broken: true,
								message: BROKEN_CONNECTION_MSG,
								queue: true,
								endpoint: _endpoint,
								fn_index,
								time: new Date()
							});
						}
					};

					websocket.onmessage = function (event) {
						const _data = JSON.parse(event.data);
						const { type, status, data } = handle_message(
							_data,
							last_status[fn_index]
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
								websocket.close();
							}
						} else if (type === "hash") {
							websocket.send(JSON.stringify({ fn_index, session_hash }));
							return;
						} else if (type === "data") {
							websocket.send(JSON.stringify({ ...payload, session_hash }));
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
								fn_index,
								event_data,
								trigger_id
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
								websocket.close();
							}
						}
					};

					// different ws contract for gradio versions older than 3.6.0
					//@ts-ignore
					if (semiver(config.version || "2.0.0", "3.6") < 0) {
						addEventListener("open", () =>
							websocket.send(JSON.stringify({ hash: session_hash }))
						);
					}
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

					if (this.jwt) {
						url.searchParams.set("__sign", this.jwt);
					}

					stream = this.stream_factory(url);

					if (!stream) {
						return Promise.reject(
							new Error("Cannot connect to SSE endpoint: " + url.toString())
						);
					}

					stream.onmessage = async function (event: MessageEvent) {
						const _data = JSON.parse(event.data);
						const { type, status, data } = handle_message(
							_data,
							last_status[fn_index]
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
								stream?.close();
							}
						} else if (type === "data") {
							event_id = _data.event_id as string;
							let [_, status] = await post_data(`${config.root}/queue/data`, {
								...payload,
								session_hash,
								event_id
							});
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
								stream?.close();
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
								fn_index,
								event_data,
								trigger_id
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
								stream?.close();
							}
						}
					};
				} else if (
					protocol == "sse_v1" ||
					protocol == "sse_v2" ||
					protocol == "sse_v2.1" ||
					protocol == "sse_v3"
				) {
					// latest API format. v2 introduces sending diffs for intermediate outputs in generative functions, which makes payloads lighter.
					// v3 only closes the stream when the backend sends the close stream message.
					fire_event({
						type: "status",
						stage: "pending",
						queue: true,
						endpoint: _endpoint,
						fn_index,
						time: new Date()
					});
					let hostname = "";
					if (typeof window !== "undefined") {
						hostname = window?.location?.hostname;
					}

					let hfhubdev = "dev.spaces.huggingface.tech";
					const origin = hostname.includes(".dev.")
						? `https://moon-${hostname.split(".")[1]}.${hfhubdev}`
						: `https://huggingface.co`;
					const zerogpu_auth_promise =
						dependency.zerogpu && window.parent != window && config.space_id
							? post_message<Headers>("zerogpu-headers", origin)
							: Promise.resolve(null);
					const post_data_promise = zerogpu_auth_promise.then((headers) => {
						return post_data(
							`${config.root}/queue/join?${url_params}`,
							{
								...payload,
								session_hash
							},
							headers
						);
					});
					post_data_promise.then(([response, status]: any) => {
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
											message:
												status?.message || "An Unexpected Error Occurred!",
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
										if (
											data &&
											["sse_v2", "sse_v2.1", "sse_v3"].includes(protocol)
										) {
											apply_diff_stream(pending_diff_streams, event_id!, data);
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

									if (
										status?.stage === "complete" ||
										status?.stage === "error"
									) {
										if (event_callbacks[event_id!]) {
											delete event_callbacks[event_id!];
										}
										if (event_id! in pending_diff_streams) {
											delete pending_diff_streams[event_id!];
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
									if (["sse_v2", "sse_v2.1"].includes(protocol)) {
										close_stream(stream_status, stream);
										stream_status.open = false;
									}
								}
							};

							if (event_id in pending_stream_messages) {
								pending_stream_messages[event_id].forEach((msg) =>
									callback(msg)
								);
								delete pending_stream_messages[event_id];
							}
							// @ts-ignore
							event_callbacks[event_id] = callback;
							unclosed_events.add(event_id);
							if (!stream_status.open) {
								this.open_stream();
							}
						}
					});
				}
			}
		);

		return { on, off, cancel, destroy };
	} catch (error) {
		console.error("Submit function encountered an error:", error);
		throw error;
	}
}

function get_endpoint_info(
	api_info: ApiInfo<JsApiData>,
	endpoint: string | number,
	api_map: Record<string, number>,
	config: Config
): {
	fn_index: number;
	endpoint_info: EndpointInfo<JsApiData>;
	dependency: Dependency;
} {
	let fn_index: number;
	let endpoint_info: EndpointInfo<JsApiData>;
	let dependency: Dependency;

	if (typeof endpoint === "number") {
		fn_index = endpoint;
		endpoint_info = api_info.unnamed_endpoints[fn_index];
		dependency = config.dependencies[endpoint];
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");

		fn_index = api_map[trimmed_endpoint];
		endpoint_info = api_info.named_endpoints[endpoint.trim()];
		dependency = config.dependencies[api_map[trimmed_endpoint]];
	}

	if (typeof fn_index !== "number") {
		throw new Error(
			"There is no endpoint matching that name of fn_index matching that number."
		);
	}
	return { fn_index, endpoint_info, dependency };
}

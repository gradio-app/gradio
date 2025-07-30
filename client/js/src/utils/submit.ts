/* eslint-disable complexity */
import type {
	Status,
	Payload,
	GradioEvent,
	JsApiData,
	EndpointInfo,
	ApiInfo,
	Config,
	Dependency,
	SubmitIterable
} from "../types";

import { skip_queue, post_message, handle_payload } from "../helpers/data";
import { resolve_root } from "../helpers/init_helpers";
import {
	handle_message,
	map_data_to_params,
	process_endpoint
} from "../helpers/api_info";
import semiver from "semiver";
import {
	BROKEN_CONNECTION_MSG,
	QUEUE_FULL_MSG,
	SSE_URL,
	SSE_DATA_URL,
	RESET_URL,
	CANCEL_URL
} from "../constants";
import { apply_diff_stream, close_stream } from "./stream";
import { Client } from "../client";

export function submit(
	this: Client,
	endpoint: string | number,
	data: unknown[] | Record<string, unknown> = {},
	event_data?: unknown,
	trigger_id?: number | null,
	all_events?: boolean
): SubmitIterable<GradioEvent> {
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
			post_data,
			options,
			api_prefix
		} = this;

		const that = this;

		if (!api_info) throw new Error("No API found");
		if (!config) throw new Error("Could not resolve app config");

		let { fn_index, endpoint_info, dependency } = get_endpoint_info(
			api_info,
			endpoint,
			api_map,
			config
		);

		let resolved_data = map_data_to_params(data, endpoint_info);

		let websocket: WebSocket;
		let stream: EventSource | null;
		let protocol = config.protocol ?? "ws";
		let event_id_final = "";
		let event_id_cb: () => string = () => event_id_final;

		const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;
		let payload: Payload;
		let event_id: string | null = null;
		let complete: Status | undefined | false = false;
		let last_status: Record<string, Status["stage"]> = {};
		let url_params =
			typeof window !== "undefined" && typeof document !== "undefined"
				? new URLSearchParams(window.location.search).toString()
				: "";

		const events_to_publish =
			options?.events?.reduce(
				(acc, event) => {
					acc[event] = true;
					return acc;
				},
				{} as Record<string, boolean>
			) || {};

		// event subscription methods
		function fire_event(event: GradioEvent): void {
			if (all_events || events_to_publish[event.type]) {
				push_event(event);
			}
		}

		async function cancel(): Promise<void> {
			let reset_request = {};
			let cancel_request = {};
			if (protocol === "ws") {
				if (websocket && websocket.readyState === 0) {
					websocket.addEventListener("open", () => {
						websocket.close();
					});
				} else {
					websocket.close();
				}
				reset_request = { fn_index, session_hash };
			} else {
				reset_request = { event_id };
				cancel_request = { event_id, session_hash, fn_index };
			}

			try {
				if (!config) {
					throw new Error("Could not resolve app config");
				}

				if ("event_id" in cancel_request) {
					await fetch(`${config.root}${api_prefix}/${CANCEL_URL}`, {
						headers: { "Content-Type": "application/json" },
						method: "POST",
						body: JSON.stringify(cancel_request)
					});
				}

				await fetch(`${config.root}${api_prefix}/${RESET_URL}`, {
					headers: { "Content-Type": "application/json" },
					method: "POST",
					body: JSON.stringify(reset_request)
				});
			} catch (e) {
				console.warn(
					"The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
				);
			}
		}

		const resolve_heartbeat = async (config: Config): Promise<void> => {
			await this._resolve_heartbeat(config);
		};

		async function handle_render_config(render_config: any): Promise<void> {
			if (!config) return;
			let render_id: number = render_config.render_id;
			config.components = [
				...config.components.filter((c) => c.props.rendered_in !== render_id),
				...render_config.components
			];
			config.dependencies = [
				...config.dependencies.filter((d) => d.rendered_in !== render_id),
				...render_config.dependencies
			];
			const any_state = config.components.some((c) => c.type === "state");
			const any_unload = config.dependencies.some((d) =>
				d.targets.some((t) => t[1] === "unload")
			);
			config.connect_heartbeat = any_state || any_unload;
			await resolve_heartbeat(config);
			fire_event({
				type: "render",
				data: render_config,
				endpoint: _endpoint,
				fn_index
			});
		}

		this.handle_blob(config.root, resolved_data, endpoint_info).then(
			async (_payload) => {
				let input_data = handle_payload(
					_payload,
					dependency,
					config.components,
					"input",
					true
				);
				payload = {
					data: input_data || [],
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
						`${config.root}${api_prefix}/run${
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
									data: handle_payload(
										data,
										dependency,
										config.components,
										"output",
										options.with_null_state
									),
									time: new Date(),
									event_data,
									trigger_id
								});
								if (output.render_config) {
									handle_render_config(output.render_config);
								}

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
							config.root as string,
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
								title: data.title,
								log: data.log,
								level: data.level,
								endpoint: _endpoint,
								duration: data.duration,
								visible: data.visible,
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
								data: handle_payload(
									data.data,
									dependency,
									config.components,
									"output",
									options.with_null_state
								),
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
						`${config.root}${api_prefix}/${SSE_URL}?${
							url_params ? url_params + "&" : ""
						}${params}`
					);

					if (this.jwt) {
						url.searchParams.set("__sign", this.jwt);
					}

					stream = this.stream(url);

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
								close();
							}
						} else if (type === "data") {
							let [_, status] = await post_data(
								`${config.root}${api_prefix}/queue/data`,
								{
									...payload,
									session_hash,
									event_id
								}
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
								stream?.close();
								close();
							}
						} else if (type === "complete") {
							complete = status;
						} else if (type === "log") {
							fire_event({
								type: "log",
								title: data.title,
								log: data.log,
								level: data.level,
								endpoint: _endpoint,
								duration: data.duration,
								visible: data.visible,
								fn_index
							});
						} else if (type === "generating" || type === "streaming") {
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
								data: handle_payload(
									data.data,
									dependency,
									config.components,
									"output",
									options.with_null_state
								),
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
								close();
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
					if (
						typeof window !== "undefined" &&
						typeof document !== "undefined"
					) {
						hostname = window?.location?.hostname;
					}

					let hfhubdev = "dev.spaces.huggingface.tech";
					const origin = hostname.includes(".dev.")
						? `https://moon-${hostname.split(".")[1]}.${hfhubdev}`
						: `https://huggingface.co`;

					const is_zerogpu_iframe =
						typeof window !== "undefined" &&
						typeof document !== "undefined" &&
						window.parent != window &&
						window.supports_zerogpu_headers;
					const zerogpu_auth_promise = is_zerogpu_iframe
						? post_message<Map<string, string>>("zerogpu-headers", origin)
						: Promise.resolve(null);
					const post_data_promise = zerogpu_auth_promise.then((headers) => {
						return post_data(
							`${config.root}${api_prefix}/${SSE_DATA_URL}?${url_params}`,
							{
								...payload,
								session_hash
							},
							headers
						);
					});
					post_data_promise.then(async ([response, status]: any) => {
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
								broken: true,
								message: BROKEN_CONNECTION_MSG,
								queue: true,
								endpoint: _endpoint,
								fn_index,
								time: new Date()
							});
						} else {
							event_id = response.event_id as string;
							event_id_final = event_id;
							let callback = async function (_data: object): Promise<void> {
								try {
									const { type, status, data, original_msg } = handle_message(
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
											original_msg: original_msg,
											...status
										});
									} else if (type === "complete") {
										complete = status;
									} else if (
										type == "unexpected_error" ||
										type == "broken_connection"
									) {
										console.error("Unexpected error", status?.message);
										const broken = type === "broken_connection";
										fire_event({
											type: "status",
											stage: "error",
											message:
												status?.message || "An Unexpected Error Occurred!",
											queue: true,
											endpoint: _endpoint,
											broken,
											session_not_found: status?.session_not_found,
											fn_index,
											time: new Date()
										});
									} else if (type === "log") {
										fire_event({
											type: "log",
											title: data.title,
											log: data.log,
											level: data.level,
											endpoint: _endpoint,
											duration: data.duration,
											visible: data.visible,
											fn_index
										});
										return;
									} else if (type === "generating" || type === "streaming") {
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
											dependency.connection !== "stream" &&
											["sse_v2", "sse_v2.1", "sse_v3"].includes(protocol)
										) {
											apply_diff_stream(pending_diff_streams, event_id!, data);
										}
									}
									if (data) {
										fire_event({
											type: "data",
											time: new Date(),
											data: handle_payload(
												data.data,
												dependency,
												config.components,
												"output",
												options.with_null_state
											),
											endpoint: _endpoint,
											fn_index
										});
										if (data.render_config) {
											await handle_render_config(data.render_config);
										}

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
											close();
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
									if (["sse_v2", "sse_v2.1", "sse_v3"].includes(protocol)) {
										close_stream(stream_status, that.abort_controller);
										stream_status.open = false;
										close();
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
								await this.open_stream();
							}
						}
					});
				}
			}
		);

		let done = false;
		const values: (IteratorResult<GradioEvent> | PromiseLike<never>)[] = [];
		const resolvers: ((
			value: IteratorResult<GradioEvent> | PromiseLike<never>
		) => void)[] = [];

		function close(): void {
			done = true;
			while (resolvers.length > 0)
				(resolvers.shift() as (typeof resolvers)[0])({
					value: undefined,
					done: true
				});
		}

		function push(
			data: { value: GradioEvent; done: boolean } | PromiseLike<never>
		): void {
			if (resolvers.length > 0) {
				(resolvers.shift() as (typeof resolvers)[0])(data);
			} else {
				values.push(data);
			}
		}

		function push_error(error: unknown): void {
			push(thenable_reject(error));
			close();
		}

		function push_event(event: GradioEvent): void {
			push({ value: event, done: false });
		}

		function next(): Promise<IteratorResult<GradioEvent, unknown>> {
			if (values.length > 0) {
				return Promise.resolve(values.shift() as (typeof values)[0]);
			}
			return new Promise((resolve) => resolvers.push(resolve));
		}

		const iterator = {
			[Symbol.asyncIterator]: () => iterator,
			next,
			throw: async (value: unknown) => {
				push_error(value);
				return next();
			},
			return: async () => {
				close();
				return next();
			},
			cancel,
			event_id: event_id_cb
		};

		return iterator;
	} catch (error) {
		console.error("Submit function encountered an error:", error);
		throw error;
	}
}

function thenable_reject<T>(error: T): PromiseLike<never> {
	return {
		then: (
			resolve: (value: never) => PromiseLike<never>,
			reject: (error: T) => PromiseLike<never>
		) => reject(error)
	};
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
		dependency = config.dependencies.find((dep) => dep.id == endpoint)!;
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");

		fn_index = api_map[trimmed_endpoint];
		endpoint_info = api_info.named_endpoints[endpoint.trim()];
		dependency = config.dependencies.find(
			(dep) => dep.id == api_map[trimmed_endpoint]
		)!;
	}

	if (typeof fn_index !== "number") {
		throw new Error(
			"There is no endpoint matching that name of fn_index matching that number."
		);
	}
	return { fn_index, endpoint_info, dependency };
}

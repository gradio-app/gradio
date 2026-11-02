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

import {
	skip_queue,
	post_message,
	handle_payload,
	sign_file_urls
} from "../helpers/data";
import { get_zerogpu_origin } from "../helpers/zerogpu";
import {
	handle_message,
	map_data_to_params,
	process_endpoint
} from "../helpers/api_info";
import {
	BROKEN_CONNECTION_MSG,
	NO_API_INFO_MSG,
	QUEUE_FULL_MSG,
	SSE_URL,
	SSE_DATA_URL,
	RESET_URL,
	CANCEL_URL,
	WS_PROTOCOL_MSG
} from "../constants";
import { events } from "fetch-event-stream";
import { apply_diff_stream, close_stream, streams_per_event } from "./stream";
import { is_streaming_webcam } from "./browser_storage";
import { clear_resumable_event, track_resumable_event } from "./session";
import type { StatePayload } from "./session_store";
import { Client } from "../client";
import {
	is_automatic_run,
	read_run_history_storage,
	start_run_history,
	update_run_history,
	update_run_inputs
} from "./run_history";

export function submit(
	this: Client,
	endpoint: string | number,
	data: unknown[] | Record<string, unknown> = {},
	event_data?: unknown,
	trigger_id?: number | null,
	all_events?: boolean,
	additional_headers?: Record<string, string>,
	resume_event_id?: string
): SubmitIterable<GradioEvent> {
	try {
		const { token } = this.options;
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

		const base_headers = additional_headers || { "x-gradio-user": "api" };

		const that = this;

		if (!api_info) throw new Error(NO_API_INFO_MSG);
		if (!config) throw new Error("Could not resolve app config");
		const root = config.root;

		this.open_heartbeat();

		let { fn_index, endpoint_info, dependency } = get_endpoint_info(
			api_info,
			endpoint,
			api_map,
			config
		);

		// The gr.State values the server keeps in this client, for this event
		const state_ids = new Set([...dependency.inputs, ...dependency.outputs]);
		const state_payload = (force: number[] = []): StatePayload =>
			that.session_store.payload(state_ids, force);
		// Posts an event with its state. A server that has not cached a value
		// the client referred to answers 409 with the ids it needs in full.
		const post_with_state = async (
			url: string,
			body: Record<string, unknown>,
			headers: any
		): Promise<[any, number]> => {
			const result = (await post_data(
				url,
				{ ...body, state: state_payload() },
				headers
			)) as [any, number];
			const missing = result[0]?.detail?.missing_state;
			if (result[1] === 409 && Array.isArray(missing)) {
				return (await post_data(
					url,
					{ ...body, state: state_payload(missing) },
					headers
				)) as [any, number];
			}
			return result;
		};

		let resolved_data = resume_event_id
			? []
			: map_data_to_params(data, endpoint_info);

		let protocol: Config["protocol"] | "sse_v4" =
			config.supported_protocols?.includes("sse_v4")
				? streams_per_event(config)
					? "sse_v4"
					: "sse_v3"
				: (config.protocol ?? "ws");
		if (protocol === "ws") {
			throw new Error(WS_PROTOCOL_MSG);
		}
		const history_endpoint =
			typeof dependency.api_name === "string"
				? `/${dependency.api_name}`
				: endpoint;
		const history_api_name =
			typeof dependency.api_name === "string"
				? `/${dependency.api_name}`
				: `Function ${fn_index}`;
		// Kept index-aligned with the stored payloads (null for components we
		// cannot resolve) so every saved value stays matched to its component.
		const component_metadata = (id: number) => {
			const component = config.components.find((item) => item.id === id);
			if (!component) return null;
			return {
				type: component.type,
				component_class_id: component.component_class_id,
				props: component.props
			};
		};
		// The run history covers the same endpoints the API page documents, which
		// it selects with exactly this predicate (see `ApiDocs.svelte`). That also
		// keeps out the dependencies Gradio wires up for itself, since example
		// loading, flagging and clear buttons are all "undocumented" or "private"
		// and some of them fire on page load. The trade is that a component whose
		// UI submits through an undocumented dependency — `gr.ChatInterface` does
		// — records nothing for its in-app use.
		const is_documented_endpoint = dependency.api_visibility === "public";
		// A chunk is not the input of an input stream, so the streamed component
		// is saved empty; the event's other inputs are kept.
		const streamed_inputs = new Set(
			dependency.targets
				.filter(([, event]) => event === "stream")
				.map(([id]) => id)
		);
		const history_inputs = (values: unknown[]): unknown[] =>
			values.map((value, index) =>
				streamed_inputs.has(dependency.inputs[index]) ? null : value
			);
		// Either side may opt out: the app for everyone who uses it, and this
		// caller for itself.
		const history_enabled =
			config.run_history !== false && this.options.record_history !== false;
		const history_scope = {
			root: config.root,
			app_key: config.app_key,
			app_id: config.app_id,
			username: config.username
		};
		const history_storage = read_run_history_storage(history_scope);
		const addt_headers = {
			...base_headers,
			...(history_enabled && history_storage.type === "bucket"
				? { "x-gradio-history-bucket": history_storage.bucket_id }
				: {})
		};
		const history_run_id =
			resume_event_id ||
			!history_enabled ||
			!is_documented_endpoint ||
			is_automatic_run(config.dependencies, dependency, trigger_id)
				? null
				: start_run_history({
						...history_scope,
						endpoint: history_endpoint,
						api_name: history_api_name,
						fn_index,
						// Aligned to `dependency.inputs` the same way the submitted payload
						// is, so this placeholder matches the components until the uploaded
						// files are swapped in by `update_run_inputs` below.
						inputs: history_inputs(
							handle_payload(
								resolved_data,
								dependency,
								config.components,
								"input",
								true
							)
						),
						input_components: dependency.inputs.map(component_metadata),
						output_components: dependency.outputs.map(component_metadata)
					});
		let chunk_inputs = "";

		let stream: EventSource | null;
		let event_id_final = "";
		let event_id_cb: () => string = () => event_id_final;
		let own_stream_controller: AbortController | null = null;
		let own_stream_callback: ((data: unknown) => Promise<void>) | null = null;
		let own_stream_active = false;
		let own_stream_cancelled = false;
		let own_stream_finished = false;
		let own_stream_completion_delivered = false;
		let resolve_own_stream_started: () => void = () => {};
		const own_stream_started = new Promise<void>((resolve) => {
			resolve_own_stream_started = resolve;
		});
		const abort_own_stream = (): void => {
			own_stream_controller?.abort();
		};

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
			update_run_history(history_scope, history_run_id, event);
			if (event.type === "data" || event.type === "render") {
				sign_file_urls(event.data, root, api_prefix, that.jwt);
			}
			if (all_events || events_to_publish[event.type]) {
				push_event(event);
			}
		}

		async function cancel(): Promise<void> {
			if (own_stream_active && !own_stream_cancelled) {
				own_stream_cancelled = true;
				if (!own_stream_callback) {
					await own_stream_started;
				}
				abort_own_stream();
				if (!own_stream_callback) close();
				if (own_stream_callback && !own_stream_completion_delivered) {
					await own_stream_callback({
						msg: "process_completed",
						output: {},
						success: true,
						event_id
					});
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
			}
			let reset_request = {};
			let cancel_request = {};
			reset_request = { event_id };
			cancel_request = { event_id, session_hash, fn_index };

			try {
				if (!config) {
					throw new Error("Could not resolve app config");
				}

				const attempts =
					own_stream_cancelled && options.resume_sessions ? 32 : 1;
				for (let attempt = 0; attempt < attempts; attempt++) {
					const response = await fetch(
						`${config.root}${api_prefix}/${CANCEL_URL}`,
						{
							headers: { "Content-Type": "application/json" },
							method: "POST",
							body: JSON.stringify(cancel_request)
						}
					);
					const result = await response.json().catch(() => null);
					if (result?.found !== false) break;
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
			await acknowledge();
		}

		async function acknowledge(): Promise<void> {
			if (!event_id_final) return;
			if (!options.resume_sessions) return;
			const response = await that
				.fetch(`${config!.root}${api_prefix}/${RESET_URL}`, {
					headers: { "Content-Type": "application/json" },
					method: "POST",
					body: JSON.stringify({ event_id: event_id_final })
				})
				.catch(() => null);
			if (response?.ok) clear_resumable_event(event_id_final);
		}

		const resolve_heartbeat = async (config: Config): Promise<void> => {
			await this._resolve_heartbeat(config);
		};

		async function handle_render_config(render_config: any): Promise<void> {
			if (!config) return;
			let render_id: number = render_config.render_id;
			// After a reload, the first time a `gr.render` block is built again
			// (when its render function reruns on load), put back the values its
			// components had, as for the rest of the page. Later renders are the
			// app's own doing and are left alone.
			if (that.session_restored && !that.restored_renders.has(render_id)) {
				that.restored_renders.add(render_id);
				that.session_store.restore_into(render_config.components);
			}
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

		function create_queue_callback(
			queue_event_id: string
		): (data: unknown) => Promise<void> {
			return async function (_data: unknown): Promise<void> {
				try {
					const { type, status, data, original_msg } = handle_message(
						_data,
						last_status[fn_index]
					);

					if (type == "heartbeat") {
						return;
					}

					if (type === "update" && status && !complete) {
						fire_event({
							type: "status",
							endpoint: _endpoint,
							fn_index,
							time: new Date(),
							original_msg,
							...status
						});
					} else if (type === "complete") {
						complete = status;
					} else if (
						type == "unexpected_error" ||
						type == "broken_connection"
					) {
						if (type === "unexpected_error") {
							unclosed_events.delete(queue_event_id);
							if (status?.session_not_found) {
								clear_resumable_event(queue_event_id);
							}
						}
						console.error("Unexpected error", status?.message);
						const broken = type === "broken_connection";
						fire_event({
							type: "status",
							stage: "error",
							message: status?.message || "An Unexpected Error Occurred!",
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
							["sse_v2", "sse_v2.1", "sse_v3", "sse_v4"].includes(protocol)
						) {
							apply_diff_stream(pending_diff_streams, event_id!, data);
						}
					}
					if (data) {
						// Before the data event, so that events that follow this one
						// (and resumed jobs) send the new state
						that.session_store.apply(data.state);
						that.session_store.record(
							dependency.outputs,
							data.data || [],
							config!.components
						);
						fire_event({
							type: "data",
							time: new Date(),
							data: data.data
								? handle_payload(
										data.data,
										dependency,
										config!.components,
										"output",
										options.with_null_state
									)
								: data.data,
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

					if (status?.stage === "complete" || status?.stage === "error") {
						delete event_callbacks[queue_event_id];
						delete pending_diff_streams[queue_event_id];
						close();
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
					if (own_stream_active) {
						abort_own_stream();
						close();
					} else if (
						["sse_v2", "sse_v2.1", "sse_v3", "sse_v4"].includes(protocol)
					) {
						close_stream(stream_status, that.abort_controller);
						stream_status.open = false;
						close();
					}
				}
			};
		}

		async function register_queue_event(queue_event_id: string): Promise<void> {
			event_id = queue_event_id;
			event_id_final = queue_event_id;
			const callback = create_queue_callback(queue_event_id);
			event_callbacks[queue_event_id] = callback;
			unclosed_events.add(queue_event_id);
			if (queue_event_id in pending_stream_messages) {
				for (const msg of pending_stream_messages[queue_event_id]) {
					if (
						msg.msg === "process_completed" &&
						[
							"sse",
							"sse_v1",
							"sse_v2",
							"sse_v2.1",
							"sse_v3",
							"sse_v4"
						].includes(protocol)
					) {
						unclosed_events.delete(queue_event_id);
					}
					await callback(msg);
				}
				delete pending_stream_messages[queue_event_id];
			}
			if (!stream_status.open && unclosed_events.has(queue_event_id)) {
				await that.open_stream();
			}
		}

		if (resume_event_id) {
			event_id = resume_event_id;
			event_id_final = resume_event_id;
			this.events_to_resume.add(resume_event_id);
		}

		async function get_join_headers(): Promise<Record<string, string>> {
			let hostname = "";
			if (typeof window !== "undefined" && typeof document !== "undefined") {
				hostname = window?.location?.hostname;
			}

			const origin = get_zerogpu_origin(hostname);

			const is_zerogpu_iframe =
				typeof window !== "undefined" &&
				typeof document !== "undefined" &&
				window.parent != window &&
				!!origin &&
				window.supports_zerogpu_headers;
			const headers = is_zerogpu_iframe
				? await post_message<Map<string, string>>("zerogpu-headers", origin)
				: null;
			return { ...addt_headers, ...(headers || {}) } as Record<string, string>;
		}

		function report_join_error(response: any, status: number): boolean {
			if (status === 503) {
				fire_event({
					type: "status",
					stage: "error",
					message: QUEUE_FULL_MSG,
					queue: true,
					endpoint: _endpoint,
					fn_index,
					time: new Date(),
					visible: true
				});
			} else if (status === 422) {
				fire_event({
					type: "status",
					stage: "error",
					message: response.detail,
					queue: true,
					endpoint: _endpoint,
					fn_index,
					code: "validation_error",
					time: new Date(),
					visible: true
				});
			} else if (status !== 200) {
				const is_connection_error = response?.error === BROKEN_CONNECTION_MSG;
				fire_event({
					type: "status",
					stage: "error",
					broken: is_connection_error,
					message: is_connection_error
						? BROKEN_CONNECTION_MSG
						: response.detail || response.error,
					queue: true,
					endpoint: _endpoint,
					fn_index,
					time: new Date(),
					visible: true
				});
			} else {
				return false;
			}
			close();
			return true;
		}

		async function stream_own_event(
			headers: Record<string, string>,
			on_event_id: () => void
		): Promise<void> {
			if (!config) throw new Error("Could not resolve app config");
			const controller = new AbortController();
			own_stream_controller = controller;
			own_stream_active = true;
			that.own_stream_controllers.add(controller);
			const deliver = (message: any): void => {
				const callback = own_stream_callback;
				if (own_stream_cancelled || !callback) return;
				if (
					message?.msg === "process_completed" ||
					message?.msg === "unexpected_error"
				) {
					own_stream_completion_delivered = true;
				}
				if (
					typeof window !== "undefined" &&
					typeof document !== "undefined" &&
					document.visibilityState !== "hidden"
				) {
					setTimeout(callback, 0, message);
				} else {
					callback(message);
				}
			};
			try {
				const url = new URL(
					`${config.root}${api_prefix}/${SSE_DATA_URL}?${url_params}`
				);
				if (options.resume_sessions) {
					url.searchParams.set("acknowledgements", "true");
				}
				if (that.jwt) {
					url.searchParams.set("__sign", that.jwt);
				}
				const post = (state: StatePayload): Promise<Response> =>
					that.fetch(url, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							...(options.token
								? { Authorization: `Bearer ${options.token}` }
								: {}),
							...Object.fromEntries(
								Object.entries(headers).filter(
									([key]) => key.toLowerCase() !== "accept"
								)
							),
							Accept: "text/event-stream"
						},
						body: JSON.stringify({ ...payload, session_hash, state }),
						credentials: options.credentials ?? "same-origin",
						signal: controller.signal
					});
				let response: Response;
				try {
					response = await post(state_payload());
					if (response.status === 409) {
						const missing = (await response.json().catch(() => null))?.detail
							?.missing_state;
						if (Array.isArray(missing)) {
							response = await post(state_payload(missing));
						}
					}
				} catch (e) {
					if (controller.signal.aborted) {
						if (!own_stream_cancelled && !options.resume_sessions) close();
					} else {
						report_join_error({ error: BROKEN_CONNECTION_MSG }, 500);
					}
					return;
				}
				if (!response.ok) {
					let body: unknown;
					try {
						body = await response.json();
					} catch (e) {
						body = { error: `Could not parse server response: ${e}` };
					}
					report_join_error(body, response.status);
					return;
				}
				const messages = events(response, controller.signal);
				const next_message = (): Promise<IteratorResult<{ data?: string }>> =>
					new Promise((resolve, reject) => {
						const on_abort = (): void => reject(new Error("aborted"));
						if (controller.signal.aborted) return on_abort();
						controller.signal.addEventListener("abort", on_abort, {
							once: true
						});
						messages
							.next()
							.then(resolve, reject)
							.finally(() =>
								controller.signal.removeEventListener("abort", on_abort)
							);
					});
				try {
					while (true) {
						const { value: message, done } = await next_message();
						if (done) break;
						if (!message.data) continue;
						const data = JSON.parse(message.data);
						if (!own_stream_callback && data.event_id) {
							event_id = data.event_id as string;
							event_id_final = event_id;
							if (options.resume_sessions) {
								track_resumable_event(config, session_hash, {
									event_id,
									fn_index
								});
							}
							own_stream_callback = create_queue_callback(event_id);
							on_event_id();
							resolve_own_stream_started();
						}
						if (
							data.msg === "process_completed" ||
							data.msg === "unexpected_error"
						) {
							own_stream_finished = true;
						}
						deliver(data);
					}
				} catch (e) {}
				if (own_stream_finished) return;
				if (controller.signal.aborted) {
					if (!own_stream_cancelled && !options.resume_sessions) close();
				} else if (!own_stream_callback || !event_id) {
					report_join_error({ error: BROKEN_CONNECTION_MSG }, 500);
				} else if (options.resume_sessions) {
					own_stream_active = false;
					delete pending_diff_streams[event_id];
					that.events_to_resume.add(event_id);
					if (stream_status.open) {
						close_stream(stream_status, that.abort_controller);
						unclosed_events.forEach((id) => {
							that.events_to_resume.add(id);
							delete pending_diff_streams[id];
						});
					}
					await register_queue_event(event_id);
				} else {
					deliver({ msg: "broken_connection", message: BROKEN_CONNECTION_MSG });
				}
			} finally {
				own_stream_active = false;
				that.own_stream_controllers.delete(controller);
				resolve_own_stream_started();
			}
		}

		const job = this.handle_blob(
			config.root,
			resolved_data,
			endpoint_info
		).then(async (_payload) => {
			if (resume_event_id) {
				fire_event({
					type: "status",
					stage: "pending",
					queue: true,
					endpoint: _endpoint,
					fn_index,
					time: new Date()
				});
				await register_queue_event(resume_event_id);
				return;
			}
			let input_data = handle_payload(
				_payload,
				dependency,
				config.components,
				"input",
				true
			);
			update_run_inputs(
				history_scope,
				history_run_id,
				history_inputs(input_data || [])
			);
			that.session_store.record(
				dependency.inputs,
				(input_data || []).map((value, index) => {
					const id = dependency.inputs[index];
					const component = config.components.find((c) => c.id === id);
					return streamed_inputs.has(id) || is_streaming_webcam(component)
						? undefined
						: value;
				}),
				config.components
			);
			payload = {
				data: input_data || [],
				event_data,
				fn_index,
				trigger_id,
				...(options.oauth_token && endpoint_info?.oauth_token
					? { oauth_token: options.oauth_token }
					: {})
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

				post_with_state(
					`${config.root}${api_prefix}/run${
						_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`
					}${url_params ? "?" + url_params : ""}`,
					{
						...payload,
						session_hash
					},
					addt_headers
				)
					.then(async ([output, status_code]: any) => {
						const data = output.data;

						if (status_code == 200) {
							that.session_store.apply(output.state);
							that.session_store.record(
								dependency.outputs,
								data || [],
								config.components
							);
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
								await handle_render_config(output.render_config);
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
							const is_connection_error =
								output?.error === BROKEN_CONNECTION_MSG;
							fire_event({
								type: "status",
								stage: "error",
								endpoint: _endpoint,
								fn_index,
								message: output.error,
								broken: is_connection_error,
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
							},
							addt_headers
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
				const post_data_promise = get_join_headers().then((combined_headers) =>
					post_with_state(
						`${config.root}${api_prefix}/${SSE_DATA_URL}?${url_params}`,
						{
							...payload,
							session_hash
						},
						combined_headers
					)
				);

				return post_data_promise.then(async ([response, status]: any) => {
					if (response.event_id) {
						event_id_final = response.event_id as string;
					}

					if (!report_join_error(response, status)) {
						event_id = response.event_id as string;
						event_id_final = event_id;
						if (options.resume_sessions) {
							track_resumable_event(config, session_hash, {
								event_id,
								fn_index
							});
						}
						await register_queue_event(event_id);
					}
				});
			} else if (protocol == "sse_v4") {
				fire_event({
					type: "status",
					stage: "pending",
					queue: true,
					endpoint: _endpoint,
					fn_index,
					time: new Date()
				});
				return get_join_headers().then(
					(combined_headers) =>
						new Promise<void>((resolve_id, reject) => {
							stream_own_event(combined_headers, resolve_id).then(
								resolve_id,
								reject
							);
						})
				);
			}
		});

		// Surface internal failures (e.g. malformed payloads or configs) as an
		// error event instead of leaving the returned iterator hanging forever
		// with an unhandled promise rejection.
		job.catch((e) => {
			fire_event({
				type: "status",
				stage: "error",
				message: e instanceof Error ? e.message : String(e),
				queue: !skip_queue(fn_index, config),
				endpoint: _endpoint,
				fn_index,
				time: new Date()
			});
			close();
		});

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
			if (done) {
				return Promise.resolve({ value: undefined, done: true });
			}
			return new Promise((resolve) => resolvers.push(resolve));
		}

		// The event id is only known once queue/join has responded.
		const post_to_event = (suffix: string, body: unknown): void => {
			job.then(
				() => {
					if (!event_id_final) return;
					this.post_data(
						`${config.root}${api_prefix}/stream/${event_id_final}${suffix}`,
						body
					);
				},
				() => {}
			);
		};

		const iterator: SubmitIterable<GradioEvent> = {
			[Symbol.asyncIterator]: () => iterator,
			next,
			throw: async (value: unknown) => {
				push_error(value);
				return next();
			},
			return: async () => {
				close();
				return { value: undefined, done: true as const };
			},
			cancel,
			send_chunk: (payload: Record<string, unknown>) => {
				post_to_event("", { ...payload, session_hash: this.session_hash });
				// The saved output is the last one, so keep the other inputs in step,
				// after the job has written the first ones.
				job.then(
					() => {
						if (!history_run_id || complete) return;
						try {
							const inputs = history_inputs(
								handle_payload(
									payload.data as unknown[],
									dependency,
									config.components,
									"input",
									true
								)
							);
							const key = JSON.stringify(inputs);
							if (key === chunk_inputs) return;
							chunk_inputs = key;
							update_run_inputs(history_scope, history_run_id, inputs);
						} catch (error) {
							console.warn("Could not update the run history.", error);
						}
					},
					() => {}
				);
			},
			close_stream: () => {
				close();
				post_to_event("/close", {});
			},
			event_id: () => event_id_final,
			wait_for_id: async () => {
				await job;
				return event_id;
			},
			acknowledge
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
	let dependency: Dependency | undefined;

	if (typeof endpoint === "number") {
		fn_index = endpoint;
		endpoint_info = api_info.unnamed_endpoints[fn_index];
		dependency = config.dependencies.find((dep) => dep.id == endpoint);
	} else {
		const trimmed_endpoint = endpoint.replace(/^\//, "");

		fn_index = api_map[trimmed_endpoint];
		// named endpoints are keyed with a leading slash in the API info, but
		// accept endpoint names passed without one (e.g. "predict")
		endpoint_info =
			api_info.named_endpoints[endpoint.trim()] ??
			api_info.named_endpoints[`/${trimmed_endpoint}`];
		dependency = config.dependencies.find(
			(dep) => dep.id == api_map[trimmed_endpoint]
		);
	}

	if (typeof fn_index !== "number" || !dependency) {
		const valid_endpoints = config.dependencies
			.filter((dep) => dep.api_name)
			.map((dep) => `"/${dep.api_name}"`)
			.join(", ");
		throw new Error(
			`No endpoint matching ${JSON.stringify(endpoint)} was found. ` +
				(valid_endpoints
					? `Valid named endpoints are: ${valid_endpoints}. `
					: "This app exposes no named endpoints. ") +
				"An fn_index (number) of an existing dependency can also be used."
		);
	}
	return { fn_index, endpoint_info, dependency };
}

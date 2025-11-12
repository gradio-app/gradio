import type {
	ComponentMeta,
	DependencyTypes,
	Dependency as IDependency,
	LayoutNode,
	Payload
} from "./types.js";
import { AsyncFunction } from "./init_utils";
import { Client, type client_return } from "@gradio/client";
import { LoadingStatus, type LoadingStatusArgs } from "@gradio/statustracker";
import type { ToastMessage } from "@gradio/statustracker";
import type { StatusMessage, ValidationError } from "@gradio/client";
const MESSAGE_QUOTE_RE = /^'([^]+)'$/;

const NOVALUE = Symbol("NOVALUE");
/**
 * A dependency as used by the frontend
 * This class represents a discrete dependency that can be triggered by an event
 * It is responsible calling the appropriate functions and reporting back results
 */
export class Dependency {
	id: number;
	inputs: number[];
	outputs: number[];
	cancels: number[];
	pending = false;
	trigger_modes: "once" | "multiple" | "always_last";
	event_args: Record<string, unknown> = {};
	targets: [number, string][] = [];
	connection_type: "stream" | "sse";

	// if this dependency has any then, success or failure triggers
	triggers: [number, "success" | "failure" | "all"][] = [];

	// the id of the original event_id that caused this dependency to run
	// in the case of chained events, it would be the id of the initial trigger
	original_trigger_id: number | null = null;
	show_progress_on: number[] | null = null;

	functions: {
		frontend?: (...args: unknown[]) => Promise<unknown[]>;
		backend: boolean;
		backend_js?: (...args: unknown[]) => Promise<unknown[]>;
	};

	constructor(dep_config: IDependency) {
		this.id = dep_config.id;
		this.original_trigger_id = dep_config.id;
		this.inputs = dep_config.inputs;
		this.outputs = dep_config.outputs;
		this.connection_type = dep_config.connection;
		this.functions = {
			frontend: dep_config.js
				? process_frontend_fn(
						dep_config.js,
						dep_config.backend_fn,
						dep_config.inputs.length,
						dep_config.outputs.length
					)
				: undefined,
			backend: dep_config.backend_fn,
			backend_js: dep_config.js_implementation
				? new AsyncFunction(
						`let result = await (${dep_config.js_implementation})(...arguments);
						return (!Array.isArray(result)) ? [result] : result;`
					)
				: undefined
		};
		this.targets = dep_config.targets;
		this.cancels = dep_config.cancels;
		this.trigger_modes = dep_config.trigger_mode;
		this.show_progress_on = dep_config.show_progress_on || null;

		for (let i = 0; i < dep_config.event_specific_args?.length || 0; i++) {
			const key = dep_config.event_specific_args[i];
			this.event_args[key] = dep_config[key] ?? null;
		}
	}

	async run(
		client: client_return,
		data_payload: unknown[],
		event_data: unknown,
		target_id: number | null | undefined
	): Promise<
		| { type: "data"; data: unknown[] }
		| { type: "void"; data: null }
		| { type: "submit"; data: ReturnType<client_return["submit"]> }
	> {
		let _data_payload = data_payload;

		// if the function is backend_js, then it's the entire event
		// no need to chain frontend and backend
		if (this.functions.backend_js) {
			const data = await this.functions.backend_js(..._data_payload);
			return { type: "data", data };
		}

		// If it has a js implementation, the correct behavior
		// is to run that and pass the output to the backend
		if (this.functions.frontend) {
			_data_payload = await this.functions.frontend(data_payload);
		}

		if (this.functions.backend) {
			return {
				type: "submit",
				data: client.submit(this.id, _data_payload, event_data, target_id)
			};
		} else if (this.functions.frontend) {
			return { type: "data", data: _data_payload };
		}
		return { type: "void", data: null };
	}

	add_trigger(dep_id: number, condition: "success" | "failure" | "all") {
		this.triggers.push([dep_id, condition]);
	}

	get_triggers(): { success: number[]; failure: number[]; all: number[] } {
		return {
			success: this.triggers
				.filter(([, condition]) => condition === "success")
				.map(([id]) => id),
			failure: this.triggers
				.filter(([, condition]) => condition === "failure")
				.map(([id]) => id),
			all: this.triggers
				.filter(([, condition]) => condition === "all")
				.map(([id]) => id)
		};
	}
}

interface DispatchFunction {
	type: "fn";
	event_data: unknown;
	fn_index?: number;
	target_id?: number;
}

interface DispatchEvent {
	type: "event";
	event_name?: string;
	target_id?: number;
	event_data: unknown;
}

/**
 * Manages all dependencies for an app acting as a bridge between app state and Dependencies
 * Responsible for registering dependencies and dispatching events to them
 * It is also responsible for orchestrating dependencies based on the follwing:
 * - Cancelling dependencies
 * - Ensuring individual dependencies respect `trigger_mode`
 * - Managing then, success and failure events
 * - Ensuring that dependencies bound to the same id are treated a single unit
 * - updating loading states
 * - updating component states
 */
export class DependencyManager {
	dependencies_by_fn: Map<number, Dependency> = new Map();
	dependencies_by_event: Map<string, Dependency[]> = new Map();
	render_id_deps = new Map<number, Set<number>>();

	submissions: Map<number, ReturnType<Client["submit"]>> = new Map();
	client: Client;
	queue: Set<number> = new Set();
	add_to_api_calls: (payload: Payload) => void;

	update_state_cb: (
		id: number,
		state: Record<string, unknown>,
		check_visibility?: boolean
	) => Promise<void>;
	get_state_cb: (id: number) => Promise<Record<string, unknown> | null>;
	rerender_cb: (components: ComponentMeta[], layout: LayoutNode) => void;
	log_cb: (
		title: string,
		message: string,
		fn_index: number,
		type: ToastMessage["type"],
		duration?: number | null,
		visible?: boolean
	) => void;
	loading_stati = new LoadingStatus();

	constructor(
		dependencies: IDependency[],
		client: Client,
		update_state_cb: (
			id: number,
			state: Record<string, unknown>,
			check_visibility?: boolean
		) => Promise<void>,
		get_state_cb: (id: number) => Promise<Record<string, unknown> | null>,
		rerender_cb: (components: ComponentMeta[], layout: LayoutNode) => void,
		log_cb: (
			title: string,
			message: string,
			fn_index: number,
			type: ToastMessage["type"],
			duration?: number | null,
			visible?: boolean
		) => void,
		add_to_api_calls: (payload: Payload) => void
	) {
		const { by_id, by_event } = this.create(dependencies);

		this.dependencies_by_event = by_event;
		this.dependencies_by_fn = by_id;
		this.client = client;
		this.update_state_cb = update_state_cb;
		this.get_state_cb = get_state_cb;
		this.rerender_cb = rerender_cb;
		this.log_cb = log_cb;
		this.add_to_api_calls = add_to_api_calls;

		for (const [dep_id, dep] of this.dependencies_by_fn) {
			for (const [output_id] of dep.targets) {
				this.set_event_args(output_id, dep.event_args);
			}
		}
		this.register_loading_stati(by_id);
	}

	register_loading_stati(deps: Map<number, Dependency>): void {
		for (const [_, dep] of deps) {
			this.loading_stati.register(
				dep.id,
				dep.show_progress_on || dep.outputs,
				dep.inputs
			);
		}
	}

	clear_loading_status(component_id: number): void {
		this.loading_stati.clear(component_id);
	}

	async update_loading_stati_state() {
		// const promises = [];
		// for (const [_, dep] of Object.entries(this.loading_stati.current)) {
		// 	const dep_id = dep.fn_index;
		// 	const dependency = this.dependencies_by_fn.get(dep_id);
		// 	if (dependency) {
		// 		for (const output_id of dependency.outputs) {
		// 			this.update_state_cb(
		// 				output_id,
		// 				{
		// 					loading_status: { ...dep, type: "output" }
		// 				},
		// 				false
		// 			);
		// 		}

		// 		for (const input_id of dependency.inputs) {
		// 			if (dependency.connection_type === "stream") {
		// 				this.update_state_cb(
		// 					input_id,
		// 					{
		// 						loading_status: { ...dep, type: "input" }
		// 					},
		// 					false
		// 				);
		// 			}
		// 		}
		// 	}
		// }
		// await Promise.all(promises);
	}

	dispatch_state_change_events(result: StatusMessage): void {
		if (result.changed_state_ids) {
			for (const changed_id of result.changed_state_ids) {
				const change_dep = this.dependencies_by_event.get(
					"change-" + changed_id
				);
				change_dep?.forEach((dep) => {
					this.dispatch({
						type: "fn",
						fn_index: dep.id,
						target_id: changed_id,
						event_data: null
					});
				});
			}
		}
	}

	/** Dispatches an event to the appropriate dependency
	 * @param event_name the name of the event
	 * @param target_id the id of the component that triggered the event
	 * @param event_data any additional data to pass to the dependency
	 * @returns a value if there is no backend fn, a 'submission' if there is a backend fn, or null if there is no dependency
	 */
	async dispatch(event_meta: DispatchFunction | DispatchEvent): Promise<void> {
		let deps: Dependency[] | undefined;
		if (event_meta.type === "fn") {
			const dep = this.dependencies_by_fn.get(event_meta.fn_index!);
			if (dep) deps = [dep];
		} else {
			deps = this.dependencies_by_event.get(
				`${event_meta.event_name}-${event_meta.target_id}`
			);
		}

		for (let i = 0; i < (deps?.length || 0); i++) {
			const dep = deps ? deps[i] : undefined;
			console.log("Dispatching dependency:", dep);
			if (dep) {
				this.cancel(dep.cancels);

				const dispatch_status = should_dispatch(
					dep.trigger_modes,
					this.submissions.has(dep.id)
				);

				if (dispatch_status === "skip") {
					continue;
				} else if (dispatch_status === "defer") {
					this.queue.add(dep.id);
					continue;
				}

				// No loading status for js-only deps
				if (dep.functions.backend) {
					this.loading_stati.update({
						status: "pending",
						fn_index: dep.id,
						stream_state: null
					});
					await this.update_loading_stati_state();
				}

				const data_payload = await this.gather_state(dep.inputs);
				const unset_args = await Promise.all(
					dep.targets.map(([output_id]) =>
						this.set_event_args(output_id, dep.event_args)
					)
				);

				const { success, failure, all } = dep.get_triggers();

				try {
					let target_id: number | null = null;
					if (
						event_meta.target_id !== undefined ||
						event_meta.type === "event"
					) {
						target_id = event_meta.target_id || null;
					} else {
						target_id = dep.original_trigger_id;
					}

					if (
						dep.connection_type === "stream" &&
						this.submissions.has(dep.id)
					) {
						const submission = this.submissions.get(dep.id);
						let payload: Payload = {
							fn_index: dep.id,
							data: data_payload,
							event_data: event_meta.event_data
						};
						submission!.send_chunk(payload);
						unset_args.forEach((fn) => fn());
						continue;
					}

					this.add_to_api_calls({
						fn_index: dep.id,
						data: data_payload,
						event_data: event_meta.event_data,
						trigger_id: target_id
					});
					const dep_submission = await dep.run(
						this.client,
						data_payload,
						event_meta.event_data,
						target_id
					);

					if (dep_submission.type === "void") {
						unset_args.forEach((fn) => fn());
					} else if (dep_submission.type === "data") {
						this.handle_data(dep.outputs, dep_submission.data);
						unset_args.forEach((fn) => fn());
					} else {
						let stream_state: "open" | "closed" | "waiting" | null = null;

						if (
							dep.connection_type === "stream" &&
							!this.submissions.has(dep.id)
						) {
							stream_state = "waiting";
						}

						this.submissions.set(dep.id, dep_submission.data);
						let index = 0;
						// fn for this?
						submit_loop: for await (const result of dep_submission.data) {
							console.log("INDEX:", index, "RESULT:", result.type, result);
							if (index === 0) {
								// Clear out previously set validation errors
								dep.inputs.forEach((input_id) => {
									this.update_state_cb(
										input_id,
										{
											loading_status: {
												validation_error: null
											}
										},
										false
									);
								});
							}
							index += 1;
							if (result === null) continue;
							if (result.type === "data") {
								this.handle_data(dep.outputs, result.data);
							}
							if (result.type === "status") {
								if (
									result.original_msg === "process_starts" &&
									dep.connection_type === "stream"
								) {
									stream_state = "open";
								}
								const { fn_index, ...status } = result;

								// handle status updates here
								if (result.stage === "complete") {
									stream_state = "closed";
									success.forEach((dep_id) => {
										this.dispatch({
											type: "fn",
											fn_index: dep_id,
											event_data: null,
											target_id: target_id as number | undefined
										});
									});
									this.dispatch_state_change_events(result);
									// @ts-ignore
									this.loading_stati.update({
										...status,
										status: status.stage,
										fn_index: dep.id,
										stream_state
									});
									await this.update_loading_stati_state();
									break submit_loop;
								} else if (result.stage === "generating") {
									this.dispatch_state_change_events(result);
								} else if (result.stage === "error") {
									if (Array.isArray(result?.message)) {
										result.message.forEach((m: ValidationError, i) => {
											this.update_state_cb(
												dep.inputs[i],
												{
													loading_status: {
														validation_error: !m.is_valid ? m.message : null,
														show_validation_error: true
													}
												},
												false
											);
										});
										// Manually set the output statuses to null
										// Doing this in update_loading_stati_state would
										// validation errors set above
										// For example, if the input component is an output component (chatinterface)
										dep.outputs.forEach((output_id) => {
											if (dep.inputs.includes(output_id)) return;
											this.update_state_cb(
												output_id,
												{
													loading_status: {
														status: null
													}
												},
												false
											);
										});
										unset_args.forEach((fn) => fn());
										this.submissions.delete(dep.id);
										if (this.queue.has(dep.id)) {
											this.queue.delete(dep.id);
											this.dispatch(event_meta);
										}
										return;
									}

									const _message = result?.message?.replace(
										MESSAGE_QUOTE_RE,
										(_, b) => b
									);
									this.log_cb(
										result._title ?? "Error",
										_message,
										fn_index,
										"error",
										status.duration,
										status.visible
									);
									throw new Error("Dependency function failed");
								} else {
									// @ts-ignore
									this.loading_stati.update({
										...status,
										status: status.stage,
										fn_index: dep.id,
										stream_state
									});
									await this.update_loading_stati_state();
								}
							}

							if (result.type === "render") {
								const { layout, components, render_id, dependencies } =
									result.data;

								this.rerender_cb(components, layout);
								// update dependencies
								const { by_id, by_event } = this.create(
									dependencies as unknown as IDependency[]
								);
								this.register_loading_stati(by_id);

								by_id.forEach((dep) =>
									this.dependencies_by_fn.set(dep.id, dep)
								);
								by_event.forEach((dep, key) =>
									this.dependencies_by_event.set(key, dep)
								);
								const current_deps = this.render_id_deps.get(render_id);
								if (current_deps) {
									current_deps.forEach((old_dep_id) => {
										if (!by_id.has(old_dep_id)) {
											this.dependencies_by_fn.delete(old_dep_id);
										}
									});
								}
								this.render_id_deps.set(
									render_id,
									new Set(Array.from(by_id.keys()))
								);
								this.register_loading_stati(by_id);
								break submit_loop;
							}

							if (result.type === "log") {
								this.handle_log(result);
							}
						}
						all.forEach((dep_id) => {
							this.dispatch({
								type: "fn",
								fn_index: dep_id,
								event_data: null,
								target_id: target_id as number | undefined
							});
						});
						unset_args.forEach((fn) => fn());
						this.submissions.delete(dep.id);

						if (this.queue.has(dep.id)) {
							this.queue.delete(dep.id);
							this.dispatch(event_meta);
						}
					}
				} catch (error) {
					this.loading_stati.update({
						status: "error",
						fn_index: dep.id,
						eta: 0,
						queue: false,
						stream_state: null
					});
					await this.update_loading_stati_state();
					this.submissions.delete(dep.id);
					failure.forEach((dep_id) => {
						this.dispatch({
							type: "fn",
							fn_index: dep_id,
							event_data: null
						});
					});
				}
			}
		}
		return;
	}

	/**
	 *  Creates a map of dependencies for easy lookup
	 *
	 * @param dependencies the list of dependencies from the backend
	 * @returns a map of dependencies keyed by `${event_name}-${target_id}`
	 * */
	create(dependencies: IDependency[]): {
		by_id: Map<number, Dependency>;
		by_event: Map<string, Dependency[]>;
	} {
		const _deps_by_id = new Map<number, Dependency>();
		const _deps_by_event = new Map<string, Dependency[]>();
		const then_triggers: [number, number, "success" | "failure" | "all"][] = [];

		for (const dep_config of dependencies) {
			const dependency = new Dependency(dep_config);

			for (const [target_id, event_name] of dep_config.targets) {
				// if the key is already present, add it to the list. Otherwise, create a new element with the list
				if (!_deps_by_event.has(`${event_name}-${target_id}`)) {
					_deps_by_event.set(`${event_name}-${target_id}`, []);
				}
				_deps_by_event.get(`${event_name}-${target_id}`)?.push(dependency);
			}

			_deps_by_id.set(dep_config.id, dependency);

			if (dep_config.trigger_after !== undefined) {
				const then_mode = dep_config.trigger_only_on_failure
					? "failure"
					: dep_config.trigger_only_on_success
						? "success"
						: "all";

				then_triggers.push([
					dep_config.id,
					dep_config.trigger_after,
					then_mode
				]);
			}
		}

		for (const [dep_id, trigger_after, condition] of then_triggers) {
			const dependency = _deps_by_id.get(trigger_after);
			if (dependency) {
				dependency.add_trigger(dep_id, condition);
				dependency.original_trigger_id = walk_after_to_original(
					dependencies,
					trigger_after
				);
			}
		}

		return { by_id: _deps_by_id, by_event: _deps_by_event };
	}

	handle_log(msg: LogMessage): void {
		const { title, log, fn_index, level, duration, visible } = msg;

		this.log_cb(title, log, fn_index, level, duration, visible);
	}

	/**
	 *  Updates the state of the outputs based on the data received from the dependency
	 *
	 * @param outputs the ids of the output components
	 * @param data the data to update the components with
	 * */
	async handle_data(outputs: number[], data: unknown[]) {
		outputs.forEach(async (output_id, i) => {
			const _data = data[i] === undefined ? NOVALUE : data[i];
			if (_data === NOVALUE) return;

			if (is_prop_update(_data)) {
				let pending_visibility_update = false;
				let pending_visibility_value = null;
				for (const [update_key, update_value] of Object.entries(_data)) {
					if (update_key === "__type__") continue;
					if (update_key === "visible") {
						pending_visibility_update = true;
						pending_visibility_value = update_value;
						continue;
					}
					await this.update_state_cb(
						outputs[i],
						{
							[update_key]: update_value
						},
						update_key === "visible"
					);
				}
				if (pending_visibility_update) {
					await this.update_state_cb(
						outputs[i],
						{
							visible: pending_visibility_value
						},
						true
					);
				}
			} else {
				await this.update_state_cb(output_id, { value: _data }, false);
			}
		});
	}

	/**
	 * Gathers the current state of the inputs
	 *
	 * @param ids the ids of the components to gather state from
	 * @returns an array of the current state of the components, in the same order as the ids
	 */
	async gather_state(ids: number[]): Promise<(unknown | null)[]> {
		return (await Promise.all(ids.map((id) => this.get_state_cb(id)))).map(
			(state) => {
				return state?.value ?? null;
			}
		);
	}

	/** Sets the event arguments for a specific component
	 *
	 * @param id the id of the component to set the event arguments for
	 * @param args the event arguments to set
	 * @returns a function that can be called to reset the event arguments to their previous values
	 */
	async set_event_args(
		id: number,
		args: Record<string, unknown>
	): Promise<() => void> {
		let current_args: Record<string, unknown> = {};
		const current_state = await this.get_state_cb(id);
		for (const [key] of Object.entries(args)) {
			current_args[key] = current_state?.[key] ?? null;
		}

		if (Object.keys(args).length === 0) {
			return () => {
				// do nothing
			};
		}

		await this.update_state_cb(id, args, false);

		return () => {
			this.update_state_cb(id, current_args, false);
		};
	}

	async cancel(ids: number[] | undefined): Promise<void> {
		if (!ids) return;

		for (const id of ids) {
			const submission = this.submissions.get(id);
			if (submission) {
				await submission.cancel();
				this.submissions.delete(id);
			}
		}
	}

	dispatch_load_events() {
		console.log("Dispatching load events for all dependencies.");
		this.dependencies_by_fn.forEach((dep) => {
			dep.targets.forEach(([target_id, event_name]) => {
				if (event_name === "load") {
					console.log("Dispatching load event for dependency:", dep);
					this.dispatch({
						type: "fn",
						fn_index: dep.id,
						event_data: null,
						target_id: target_id
					});
				}
			});
		});
	}

	get_fns_from_targets(target_id: number): number[] {
		const fn_indices: number[] = [];
		this.dependencies_by_event.forEach((deps, key) => {
			const [, dep_target_id] = key.split("-");
			if (Number(dep_target_id) === target_id) {
				deps.forEach((dep) => {
					fn_indices.push(dep.id);
				});
			}
		});
		return fn_indices;
	}

	close_stream(id: number): void {
		const fn_ids = this.get_fns_from_targets(id);

		for (const fn_id of fn_ids) {
			const submission = this.submissions.get(fn_id);
			if (submission) {
				submission.close_stream();
				this.submissions.delete(fn_id);
			}

			this.loading_stati.update({
				status: "complete",
				fn_index: fn_id,
				eta: 0,
				queue: false,
				stream_state: "closed"
			});
		}

		this.update_loading_stati_state();
	}
}

function is_prop_update(payload: unknown): payload is Record<string, unknown> {
	return (
		typeof payload === "object" &&
		payload !== null &&
		"__type__" in payload &&
		payload?.__type__ === "update"
	);
}

function should_dispatch(
	mode: Dependency["trigger_modes"],
	is_running: boolean
): "run" | "skip" | "defer" {
	if (!is_running) return "run";

	if (mode === "always_last") {
		return "defer";
	} else if (mode === "multiple") {
		return "run";
	} else if (mode === "once") {
		return "skip";
	}
	return "run";
}

/**
 * Takes a string of source code and returns a function that can be called with arguments
 * @param source the source code
 * @param backend_fn if there is also a backend function
 * @param input_length the number of inputs
 * @param output_length the number of outputs
 * @returns The function, or null if the source code is invalid or missing
 */
export function process_frontend_fn(
	source: string,
	backend_fn: boolean,
	input_length: number,
	output_length: number
): (...args: unknown[]) => Promise<unknown[]> {
	const wrap = backend_fn ? input_length === 1 : output_length === 1;
	try {
		return new AsyncFunction(
			"__fn_args",
			`  let result = await (${source})(...__fn_args);
  if (typeof result === "undefined") return [];
  return (${wrap} && !Array.isArray(result)) ? [result] : result;`
		);
	} catch (e) {
		throw e;
	}
}

/**
 * Walks the dependency graph to find the original trigger ID for a given dependency.
 * @param dependency_map The map of all dependencies.
 * @param dep_id The ID of the dependency to start from.
 * @returns The ID of the original trigger dependency, or the input ID if not found.
 */
function walk_after_to_original(dependency_map: IDependency[], dep_id: number) {
	// TODO: hoist this cache later so it is useful across multiple calls
	let cache = new Map<number, IDependency>();
	let current_id = dep_id;
	let safety_counter = 0;
	while (safety_counter < 100) {
		const dep =
			cache.get(current_id) || dependency_map.find((d) => d.id === current_id);
		if (!dep) break;
		cache.set(dep.id, dep);
		if (dep.trigger_after === null || dep.trigger_after === undefined) break;

		current_id = dep.trigger_after;
		safety_counter += 1;
	}
	return current_id;
}

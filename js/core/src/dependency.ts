import type {
	ComponentMeta,
	DependencyTypes,
	Dependency as IDependency,
	LayoutNode,
	Payload
} from "./types.js";
import { AsyncFunction } from "./init_utils";
import { Client, type client_return } from "@gradio/client";

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

	// if this dependency has any then, success or failure triggers
	triggers: [number, "success" | "failure" | "all"][] = [];

	// the id of the original event_id that caused this dependency to run
	// in the case of chained events, it would be the id of the initial trigger
	original_trigger_id: number | null = null;

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
		this.cancels = dep_config.cancels;
		this.trigger_modes = dep_config.trigger_mode;

		for (let i = 0; i < dep_config.event_specific_args?.length || 0; i++) {
			const key = dep_config.event_specific_args[i];
			this.event_args[key] = dep_config[key] ?? null;
		}
	}

	async run(
		client: client_return,
		data_payload: unknown[],
		event_data: unknown
	): Promise<
		| { type: "data"; data: unknown[] }
		| { type: "void"; data: null }
		| { type: "submit"; data: ReturnType<client_return["submit"]> }
	> {
		let _data_payload = data_payload;

		if (this.functions.frontend) {
			_data_payload = await this.functions.frontend(...data_payload);
		}

		if (this.functions.backend_js) {
			const data = await this.functions.backend_js(..._data_payload);
			return { type: "data", data };
		} else if (this.functions.backend) {
			return {
				type: "submit",
				data: client.submit(
					this.id,
					_data_payload,
					event_data,
					this.original_trigger_id
				)
			};
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
	dependencies_by_event: Map<string, Dependency> = new Map();
	render_id_deps = new Map<number, Set<number>>();

	submissions: Map<number, ReturnType<Client["submit"]>> = new Map();
	client: Client;
	queue: Set<number> = new Set();

	update_state_cb: (id: number, state: Record<string, unknown>) => void;
	get_state_cb: (id: number) => Promise<Record<string, unknown> | null>;
	rerender_cb: (components: ComponentMeta[], layout: LayoutNode) => void;

	constructor(
		dependencies: IDependency[],
		client: Client,
		update_state_cb: (id: number, state: Record<string, unknown>) => void,
		get_state_cb: (id: number) => Promise<Record<string, unknown> | null>,
		rerender_cb: (components: ComponentMeta[], layout: LayoutNode) => void
	) {
		const { by_id, by_event } = this.create(dependencies);
		console.log("Created dependencies:", { by_id });
		this.dependencies_by_event = by_event;
		this.dependencies_by_fn = by_id;
		this.client = client;
		this.update_state_cb = update_state_cb;
		this.get_state_cb = get_state_cb;
		this.rerender_cb = rerender_cb;
	}

	/** Dispatches an event to the appropriate dependency
	 * @param event_name the name of the event
	 * @param target_id the id of the component that triggered the event
	 * @param event_data any additional data to pass to the dependency
	 * @returns a value if there is no backend fn, a 'submission' if there is a backend fn, or null if there is no dependency
	 */
	async dispatch(event_meta: DispatchFunction | DispatchEvent): Promise<void> {
		let dep: Dependency | undefined;

		if (event_meta.type === "fn") {
			dep = this.dependencies_by_fn.get(event_meta.fn_index!);
		} else {
			dep = this.dependencies_by_event.get(
				`${event_meta.event_name}-${event_meta.target_id}`
			);
		}

		if (dep) {
			const dispatch_status = should_dispatch(
				dep.trigger_modes,
				this.submissions.has(dep.id)
			);

			console.log("Dispatching status:", dispatch_status);

			switch (dispatch_status) {
				case "skip":
					return;
				case "defer":
					this.queue.add(dep.id);
					return;
				case "run":
					// continue to run
					break;
			}

			// only cancel if the event actually runs
			this.cancel(dep.cancels);

			const data_payload = await this.gather_state(dep.inputs);
			const unset_args = await this.set_event_args(dep.id, dep.event_args);

			const { success, failure, all } = dep.get_triggers();

			console.log({ success, failure, all });
			console.log("Running dependency:", dep.id, data_payload);

			try {
				const dep_submission = await dep.run(
					this.client,
					data_payload,
					event_meta.event_data
				);

				console.log("Dispatching to", dep.id);

				if (dep_submission.type === "void") {
					unset_args();
				} else if (dep_submission.type === "data") {
					this.handle_data(dep.outputs, dep_submission.data);
					unset_args();
				} else {
					console.log("Dispatching to", dep.id, dep_submission);
					this.submissions.set(dep.id, dep_submission.data);
					// fn for this?
					submit_loop: for await (const result of dep_submission.data) {
						console.log("Received submission result for", dep.id, result);
						if (result === null) continue;
						if (result.type === "data") {
							this.handle_data(dep.outputs, result.data);
						}
						if (result.type === "status") {
							// handle status updates here
							if (result.stage === "complete") {
								console.log("Submission complete for", dep.id);
								break submit_loop;
							}
						}

						if (result.type === "render") {
							const { layout, components, render_id, dependencies } =
								result.data;
							console.log(
								"Rerendering components from dependency",
								dep.id,
								result
							);
							this.rerender_cb(components, layout);
							// update dependencies
							const { by_id, by_event } = this.create(
								dependencies as IDependency[]
							);
							by_id.forEach((dep) => this.dependencies_by_fn.set(dep.id, dep));
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

							break submit_loop;
						}
					}
					console.log("+++");
					console.log("Dependency complete:", dep.id);
					unset_args();
					this.submissions.delete(dep.id);

					console.log(
						"Checking queue for deferred dependencies",
						this.queue.has(dep.id)
					);

					// if (this.queue.has(dep.id)) {
					// 	this.queue.delete(dep.id);
					// 	this.dispatch(event_meta);
					// }

					return;
				}

				console.log("Dispatching success/failure triggers");

				success.forEach((dep_id) => {
					console.log("Dispatching success to", dep_id);
					this.dispatch({
						type: "fn",
						fn_index: dep_id,
						event_data: null
					});
				});
			} catch (error) {
				failure.forEach((dep_id) => {
					this.dispatch({
						type: "fn",
						fn_index: dep_id,
						event_data: null
					});
				});
			}

			all.forEach((dep_id) => {
				this.dispatch({
					type: "fn",
					fn_index: dep_id,
					event_data: null
				});
			});
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
		by_event: Map<string, Dependency>;
	} {
		const _deps_by_id = new Map<number, Dependency>();
		const _deps_by_event = new Map<string, Dependency>();
		const then_triggers: [number, number, "success" | "failure" | "all"][] = [];

		for (const dep_config of dependencies) {
			const dependency = new Dependency(dep_config);

			for (const [target_id, event_name] of dep_config.targets) {
				_deps_by_event.set(`${event_name}-${target_id}`, dependency);
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

	handle_log() {}
	handle_status() {}
	/**
	 *  Updates the state of the outputs based on the data received from the dependency
	 *
	 * @param outputs the ids of the output components
	 * @param data the data to update the components with
	 * */
	async handle_data(outputs: number[], data: unknown[]) {
		outputs.forEach(async (output_id, i) => {
			console.log("handle_data", output_id, data[i]);
			const _data = data[i] ?? null;
			if (!_data) return;

			if (is_prop_update(_data)) {
				for (const [update_key, update_value] of Object.entries(_data)) {
					if (update_key === "__type__") continue;
					await this.update_state_cb(outputs[i], {
						[update_key]: update_value
					});
				}
			} else {
				console.log("handle_data", output_id, _data);
				await this.update_state_cb(output_id, { value: _data });
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
			(state) => state?.value ?? null
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

		console.log("Setting event args for", id, args, current_args);

		if (Object.keys(args).length === 0) {
			return () => {
				// do nothing
			};
		}
		this.update_state_cb(id, args);

		return () => {
			this.update_state_cb(id, current_args);
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

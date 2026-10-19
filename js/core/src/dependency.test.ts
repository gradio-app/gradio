import { afterEach, describe, expect, test, vi } from "vitest";
import type { Client } from "@gradio/client";
import { DependencyManager, process_frontend_fn } from "./dependency";
import type { Dependency as DependencyConfig } from "./types";

declare global {
	var event_js_result: string | undefined;
}

afterEach(() => {
	delete globalThis.event_js_result;
});

function dependency(
	id: number,
	api_name: string,
	outputs: number[]
): DependencyConfig {
	return {
		id,
		api_name,
		targets: [],
		inputs: [],
		outputs,
		backend_fn: true,
		js: null,
		scroll_to_output: false,
		show_progress: "full",
		show_progress_on: null,
		queue: true,
		cancels: [],
		types: { generator: true, cancel: false },
		collects_event_data: false,
		trigger_mode: "once",
		show_api: true,
		connection: "sse",
		component_prop_inputs: []
	} as DependencyConfig;
}

function manager(
	dependencies: DependencyConfig[],
	client: Client = {} as Client,
	update_state = vi.fn().mockResolvedValue(undefined),
	on_loading_status_change = vi.fn()
): DependencyManager {
	return new DependencyManager(
		dependencies,
		client,
		update_state,
		vi.fn().mockResolvedValue(null),
		vi.fn(),
		vi.fn(),
		vi.fn(),
		vi.fn(),
		on_loading_status_change
	);
}

describe("DependencyManager.reload", () => {
	test("remaps the captured dependency by api_name across consecutive reloads", () => {
		const dependencies = [dependency(0, "generate", [10])];
		const dependency_manager = manager(dependencies);
		const active_dependency = dependency_manager.dependencies_by_fn.get(0)!;

		const submission = {} as ReturnType<Client["submit"]>;
		dependency_manager.submissions.set(0, submission);
		dependency_manager.active_dependencies.set(submission, active_dependency);

		dependency_manager.reload(
			[dependency(0, "unrelated", [20]), dependency(1, "generate", [21])],
			vi.fn().mockResolvedValue(undefined),
			vi.fn().mockResolvedValue(null),
			vi.fn(),
			{} as Client
		);

		expect(active_dependency.outputs).toEqual([21]);
		expect(dependency_manager.loading_stati.fn_outputs[0]).toEqual([21]);
		expect(dependency_manager.dependencies_by_fn.get(0)?.api_name).toBe(
			"unrelated"
		);

		dependency_manager.reload(
			[
				dependency(0, "unrelated", [30]),
				dependency(1, "another", [31]),
				dependency(2, "generate", [32])
			],
			vi.fn().mockResolvedValue(undefined),
			vi.fn().mockResolvedValue(null),
			vi.fn(),
			{} as Client
		);

		expect(active_dependency.outputs).toEqual([32]);
		expect(dependency_manager.loading_stati.fn_outputs[0]).toEqual([32]);
	});

	test("accepts the js=True marker used by transpiled dependencies", async () => {
		const transpiled_dependency = dependency(0, "transpiled", [10]);
		transpiled_dependency.js = true;
		transpiled_dependency.js_implementation = "() => 'client result'";
		const active_dependency = manager([
			transpiled_dependency
		]).dependencies_by_fn.get(0)!;

		await expect(
			active_dependency.run({} as never, [], null, null)
		).resolves.toEqual({
			type: "data",
			data: ["client result"]
		});
	});
});

describe("process_frontend_fn", () => {
	test("invokes a JavaScript function with event inputs", async () => {
		const fn = process_frontend_fn(
			"(value) => value.toUpperCase();",
			true,
			1,
			1
		);

		await expect(fn(["hello"])).resolves.toEqual(["HELLO"]);
	});

	test("executes a raw JavaScript body with event inputs", async () => {
		const fn = process_frontend_fn(
			"const value = arguments[0]; return value.toUpperCase();",
			true,
			1,
			1
		);

		await expect(fn(["hello"])).resolves.toEqual(["HELLO"]);
	});

	test("executes a raw JavaScript expression without returning its value", async () => {
		const fn = process_frontend_fn(
			"globalThis.event_js_result = 'raw';",
			false,
			0,
			0
		);

		await expect(fn([])).resolves.toEqual([]);
		expect(globalThis.event_js_result).toBe("raw");
	});
});

describe("DependencyManager.dispatch", () => {
	test("does not repaint a pending status after a validator rejects the call", async () => {
		const validated = dependency(0, "validated", [10]);
		validated.inputs = [11];
		const messages: Record<number, unknown> = {
			0: {
				type: "status",
				stage: "error",
				queue: true,
				message: [{ is_valid: false, message: "value must not be 'bad'" }]
			},
			1: { type: "status", stage: "complete", queue: true }
		};
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					yield messages[fn_index];
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[validated, dependency(1, "unrelated", [20])],
			client,
			update_state
		);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		update_state.mockClear();
		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 1,
			event_data: null
		});

		const painted = update_state.mock.calls
			.filter(([id]) => id === 10)
			.map(([, state]) => state.loading_status?.status);
		expect(painted).not.toContain("pending");
		expect(painted).toContain("complete");
	});

	test("clears the show_progress_on targets but keeps the validation errors", async () => {
		const validated = dependency(0, "validated", [10]);
		validated.inputs = [11];
		// 11 is an input as well as a progress target, the chatinterface shape
		validated.show_progress_on = [11, 12];
		const client = {
			submit: () =>
				(async function* () {
					yield {
						type: "status",
						stage: "error",
						queue: true,
						message: [{ is_valid: false, message: "value must not be 'bad'" }]
					};
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager([validated], client, update_state);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});

		expect(update_state).toHaveBeenCalledWith(
			12,
			{ loading_status: { status: null } },
			false
		);
		expect(update_state).not.toHaveBeenCalledWith(
			11,
			{ loading_status: { status: null } },
			false
		);
		expect(update_state).toHaveBeenCalledWith(
			11,
			{
				loading_status: {
					validation_error: "value must not be 'bad'",
					show_validation_error: true
				}
			},
			false
		);
	});

	test("hands the validation errors to the announcer when settling", async () => {
		const validated = dependency(0, "validated", [10]);
		validated.inputs = [11, 12, 13];
		const client = {
			submit: () =>
				(async function* () {
					yield {
						type: "status",
						stage: "error",
						queue: true,
						message: [
							{ is_valid: false, message: "Name is required." },
							{ is_valid: true, message: "" },
							{ is_valid: false, message: "Age must be positive." }
						]
					};
				})()
		} as unknown as Client;
		const on_loading_status_change = vi.fn();
		const dependency_manager = manager(
			[validated],
			client,
			vi.fn().mockResolvedValue(undefined),
			on_loading_status_change
		);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});

		expect(on_loading_status_change).toHaveBeenLastCalledWith(
			expect.objectContaining({
				status: "complete",
				fn_index: 0,
				validation_error: "Name is required. Age must be positive."
			})
		);
	});

	test("settles the input components of a rejected stream event", async () => {
		const validated = dependency(0, "validated", [10]);
		validated.inputs = [11];
		validated.connection = "stream";
		const messages: Record<number, unknown[]> = {
			// The queued status opens the stream, which is what puts the input
			// component into the loading status in the first place.
			0: [
				{ type: "status", stage: "pending", queue: true },
				{
					type: "status",
					stage: "error",
					queue: true,
					message: [{ is_valid: false, message: "value must not be 'bad'" }]
				}
			],
			1: [{ type: "status", stage: "complete", queue: true }]
		};
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					yield* messages[fn_index];
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[validated, dependency(1, "unrelated", [20])],
			client,
			update_state
		);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		update_state.mockClear();
		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 1,
			event_data: null
		});

		const painted = update_state.mock.calls
			.filter(([id]) => id === 11)
			.map(([, state]) => state.loading_status);
		expect(painted.map((status) => status?.status)).not.toContain("pending");
		// Webcam and InteractiveAudio decide whether to drop incoming chunks from
		// stream_state alone, so settling the status is not enough on its own.
		expect(painted.map((status) => status?.stream_state)).not.toContain(
			"waiting"
		);
	});

	test.each([
		["completes", { type: "status", stage: "complete", queue: true }],
		["fails", { type: "status", stage: "error", queue: true, message: "boom" }],
		[
			"is rejected by its validator",
			{
				type: "status",
				stage: "error",
				queue: true,
				message: [{ is_valid: false, message: "bad" }]
			}
		]
	])(
		"runs a deferred always_last event with its own event data, for that dependency only, when the running call %s",
		async (_, first_run_result) => {
			const always_last = dependency(0, "always_last", []);
			always_last.targets = [
				[1, "click"],
				[2, "change"]
			];
			always_last.trigger_mode = "always_last";
			const other_click_listener = dependency(1, "other", []);
			other_click_listener.targets = [[1, "click"]];
			let finish_first_run!: () => void;
			const first_run = new Promise<void>((resolve) => {
				finish_first_run = resolve;
			});
			const calls: [number, unknown, number | null][] = [];
			const calls_to = (fn_index: number) =>
				calls.filter(([i]) => i === fn_index);
			const client = {
				submit: (
					fn_index: number,
					_data: unknown,
					event_data: unknown,
					trigger_id: number | null
				) => {
					calls.push([fn_index, event_data, trigger_id]);
					const is_first_run = calls_to(0).length === 1 && fn_index === 0;
					return (async function* () {
						if (is_first_run) {
							await first_run;
							yield first_run_result;
						} else {
							yield { type: "status", stage: "complete", queue: true };
						}
					})();
				}
			} as unknown as Client;
			const dependency_manager = manager(
				[other_click_listener, always_last],
				client
			);

			const click = dependency_manager.dispatch({
				type: "event",
				event_name: "click",
				target_id: 1,
				event_data: "click data"
			});
			await vi.waitFor(() => expect(calls_to(0)).toHaveLength(1));
			for (const event_data of ["stale change data", "change data"]) {
				await dependency_manager.dispatch({
					type: "event",
					event_name: "change",
					target_id: 2,
					event_data
				});
			}
			expect(calls_to(0)).toHaveLength(1);
			finish_first_run();
			await click;

			const expected = [
				[0, "click data", 1],
				[1, "click data", 1],
				[0, "change data", 2]
			];
			await vi.waitFor(() =>
				expect(calls).toEqual(expect.arrayContaining(expected))
			);
			expect(calls).toHaveLength(expected.length);
		}
	);

	test("starts every listener of an event without waiting for the others to finish", async () => {
		const slow = dependency(0, "slow", []);
		slow.targets = [[1, "click"]];
		const quick = dependency(1, "quick", []);
		quick.targets = [[1, "click"]];
		let finish_slow!: () => void;
		const slow_done = new Promise<void>((resolve) => {
			finish_slow = resolve;
		});
		const submitted: number[] = [];
		const client = {
			submit: (fn_index: number) => {
				submitted.push(fn_index);
				return (async function* () {
					if (fn_index === 0) await slow_done;
					yield { type: "status", stage: "complete", queue: true };
				})();
			}
		} as unknown as Client;
		const dependency_manager = manager([slow, quick], client);

		const click = dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});
		await vi.waitFor(() => expect(submitted).toContain(1));
		finish_slow();
		await click;
	});

	test("keeps a shared output pending until every listener writing to it is done", async () => {
		const slow = dependency(0, "slow", [10]);
		slow.targets = [[1, "click"]];
		const quick = dependency(1, "quick", [10]);
		quick.targets = [[1, "click"]];
		let finish_slow!: () => void;
		const slow_done = new Promise<void>((resolve) => {
			finish_slow = resolve;
		});
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					if (fn_index === 0) await slow_done;
					yield { type: "status", stage: "complete", queue: true };
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const on_loading_status_change = vi.fn();
		const dependency_manager = manager(
			[slow, quick],
			client,
			update_state,
			on_loading_status_change
		);
		const painted = () =>
			update_state.mock.calls
				.filter(([id, state]) => id === 10 && state.loading_status)
				.at(-1)?.[1].loading_status.status;

		const click = dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});
		await vi.waitFor(() =>
			expect(on_loading_status_change).toHaveBeenCalledWith(
				expect.objectContaining({ fn_index: 1, status: "complete" })
			)
		);
		expect(painted()).toBe("pending");
		finish_slow();
		await click;
		expect(painted()).toBe("complete");
	});

	test("does not keep an output pending while another listener reads it as an input", async () => {
		const reader = dependency(0, "reader", [20]);
		reader.targets = [[1, "click"]];
		reader.inputs = [10];
		const writer = dependency(1, "writer", [10]);
		writer.targets = [[1, "click"]];
		let finish_reader!: () => void;
		const reader_done = new Promise<void>((resolve) => {
			finish_reader = resolve;
		});
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					if (fn_index === 0) await reader_done;
					yield { type: "status", stage: "complete", queue: true };
				})()
		} as unknown as Client;
		const on_loading_status_change = vi.fn();
		const dependency_manager = manager(
			[reader, writer],
			client,
			undefined,
			on_loading_status_change
		);

		const click = dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});
		await vi.waitFor(() =>
			expect(on_loading_status_change).toHaveBeenCalledWith(
				expect.objectContaining({ fn_index: 1, status: "complete" })
			)
		);
		expect(dependency_manager.loading_stati.current[10].status).toBe(
			"complete"
		);
		finish_reader();
		await click;
		expect(dependency_manager.loading_stati.current[10].status).toBe(
			"complete"
		);
	});

	test("settles the loading status of a dependency transpiled to JavaScript", async () => {
		const transpiled = dependency(0, "transpiled", [10]);
		transpiled.targets = [[1, "click"]];
		transpiled.js = true;
		transpiled.js_implementation = "() => 'client result'";
		const dependency_manager = manager([transpiled]);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});

		expect(dependency_manager.loading_stati.current[10].status).toBe(
			"complete"
		);
	});

	test("runs the other listeners of an event when a validator rejects one", async () => {
		const validated = dependency(0, "validated", [10]);
		validated.targets = [[1, "click"]];
		const other = dependency(1, "other", [20]);
		other.targets = [[1, "click"]];
		const submitted: number[] = [];
		const client = {
			submit: (fn_index: number) => {
				submitted.push(fn_index);
				return (async function* () {
					yield fn_index === 0
						? {
								type: "status",
								stage: "error",
								queue: true,
								message: [{ is_valid: false, message: "bad" }]
							}
						: { type: "status", stage: "complete", queue: true };
				})();
			}
		} as unknown as Client;
		const dependency_manager = manager([validated, other], client);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});

		expect(submitted).toContain(1);
	});

	test("keeps a validation error when another listener on the same input responds later", async () => {
		const validated = dependency(0, "validated", [20]);
		validated.targets = [[1, "click"]];
		validated.inputs = [10];
		const other = dependency(1, "other", [30]);
		other.targets = [[1, "click"]];
		other.inputs = [10];
		let release_other!: () => void;
		const other_released = new Promise<void>((resolve) => {
			release_other = resolve;
		});
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					if (fn_index === 1) await other_released;
					yield fn_index === 0
						? {
								type: "status",
								stage: "error",
								queue: true,
								message: [{ is_valid: false, message: "bad" }]
							}
						: { type: "status", stage: "complete", queue: true };
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[validated, other],
			client,
			update_state
		);
		const validation_errors = () =>
			update_state.mock.calls
				.filter(
					([id, state]) =>
						id === 10 && state.loading_status?.validation_error !== undefined
				)
				.map(([, state]) => state.loading_status.validation_error);

		const click = dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});
		await vi.waitFor(() => expect(validation_errors()).toContain("bad"));
		release_other();
		await click;

		expect(validation_errors().at(-1)).toBe("bad");
	});

	test("drops a deferred always_last event when the running call is cancelled", async () => {
		const always_last = dependency(0, "always_last", [10]);
		always_last.targets = [[2, "change"]];
		always_last.trigger_mode = "always_last";
		let finish_run!: () => void;
		const run_finished = new Promise<void>((resolve) => {
			finish_run = resolve;
		});
		const calls: unknown[] = [];
		const client = {
			submit: (_fn_index: number, _data: unknown, event_data: unknown) => {
				calls.push(event_data);
				const submission = (async function* () {
					await run_finished;
					// What the client yields for the empty output the backend sends
					// to finish a cancelled job
					yield { type: "data", data: undefined };
					yield { type: "status", stage: "complete", queue: true };
				})();
				return Object.assign(submission, {
					cancel: async () => {
						finish_run();
						await new Promise((resolve) => setTimeout(resolve, 10));
					}
				});
			}
		} as unknown as Client;
		const dependency_manager = manager([always_last], client);

		const run = dependency_manager.dispatch({
			type: "event",
			event_name: "change",
			target_id: 2,
			event_data: "a"
		});
		await vi.waitFor(() => expect(calls).toHaveLength(1));
		await dependency_manager.dispatch({
			type: "event",
			event_name: "change",
			target_id: 2,
			event_data: "ab"
		});
		await dependency_manager.cancel([0]);
		await run;
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(calls).toEqual(["a"]);
	});
});

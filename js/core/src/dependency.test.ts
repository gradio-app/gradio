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

// The client's submit() result is an async iterable with helper methods.
function submission(
	iterator: AsyncGenerator<unknown>
): ReturnType<Client["submit"]> {
	return Object.assign(iterator, {
		acknowledge: vi.fn().mockResolvedValue(undefined)
	}) as unknown as ReturnType<Client["submit"]>;
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
				submission(
					(async function* () {
						yield messages[fn_index];
					})()
				)
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
				submission(
					(async function* () {
						yield {
							type: "status",
							stage: "error",
							queue: true,
							message: [{ is_valid: false, message: "value must not be 'bad'" }]
						};
					})()
				)
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
				submission(
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
				)
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

	test("an event that is not a stream does not close its inputs' stream", async () => {
		// e.g. a change handler that takes a streaming gr.Audio as an input
		const handler = dependency(0, "handler", [10]);
		handler.inputs = [11];
		const client = {
			submit: () =>
				submission(
					(async function* () {
						yield { type: "status", stage: "pending", queue: true };
						yield { type: "status", stage: "complete", queue: true };
					})()
				)
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager([handler], client, update_state);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});

		const input_states = update_state.mock.calls
			.filter(([id]) => id === 11)
			.map(([, state]) => state.loading_status?.stream_state);
		expect(input_states).not.toContain("closed");
	});

	test("an error in one run of an event leaves its other runs alone", async () => {
		const handler = dependency(0, "handler", [10]);
		handler.trigger_mode = "multiple";
		let fail!: () => void;
		const failing = new Promise<void>((resolve) => (fail = resolve));
		const runs: ReturnType<Client["submit"]>[] = [];
		const client = {
			submit: () => {
				const first = runs.length === 0;
				const run = submission(
					(async function* () {
						yield { type: "status", stage: "pending", queue: true };
						if (first) {
							await failing;
							yield {
								type: "status",
								stage: "error",
								queue: true,
								message: "failed"
							};
						} else {
							await new Promise(() => {});
						}
					})()
				);
				runs.push(run);
				return run;
			}
		} as unknown as Client;
		const dependency_manager = manager([handler], client);

		const first = dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await vi.waitFor(() => expect(runs).toHaveLength(1));
		void dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await vi.waitFor(() => expect(runs).toHaveLength(2));
		fail();
		await first;

		// Acknowledging a run also closes it
		expect(runs[0].acknowledge).toHaveBeenCalled();
		expect(runs[1].acknowledge).not.toHaveBeenCalled();
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
				submission(
					(async function* () {
						yield* messages[fn_index];
					})()
				)
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
		["fails", { type: "status", stage: "error", queue: true, message: "boom" }]
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
					return submission(
						(async function* () {
							if (is_first_run) {
								await first_run;
								yield first_run_result;
							} else {
								yield { type: "status", stage: "complete", queue: true };
							}
						})()
					);
				}
			} as unknown as Client;
			const dependency_manager = manager(
				[always_last, other_click_listener],
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

	test("drops the deferred always_last events of cancelled calls", async () => {
		const dependencies = [0, 1].map((id) => {
			const always_last = dependency(id, `always_last_${id}`, [10 + id]);
			always_last.targets = [[2 + id, "change"]];
			always_last.trigger_mode = "always_last";
			return always_last;
		});
		let finish_runs!: () => void;
		const runs_finished = new Promise<void>((resolve) => {
			finish_runs = resolve;
		});
		const calls: [number, unknown][] = [];
		const client = {
			submit: (fn_index: number, _data: unknown, event_data: unknown) => {
				calls.push([fn_index, event_data]);
				const run = submission(
					(async function* () {
						await runs_finished;
						// What the client yields for the empty output the backend sends
						// to finish a cancelled job
						yield { type: "data", data: undefined };
						yield { type: "status", stage: "complete", queue: true };
					})()
				);
				return Object.assign(run, {
					// Both runs end while the first cancel request is in flight
					cancel: async () => {
						finish_runs();
						await new Promise((resolve) => setTimeout(resolve, 10));
					}
				});
			}
		} as unknown as Client;
		const dependency_manager = manager(dependencies, client);
		const change = (id: number, event_data: string) =>
			dependency_manager.dispatch({
				type: "event",
				event_name: "change",
				target_id: 2 + id,
				event_data
			});

		const runs = [change(0, "a"), change(1, "x")];
		await vi.waitFor(() => expect(calls).toHaveLength(2));
		await change(0, "ab");
		await change(1, "xy");
		await dependency_manager.cancel([0, 1]);
		await Promise.all(runs);
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(calls).toEqual([
			[0, "a"],
			[1, "x"]
		]);
	});

	test("sends the root Blocks id as the trigger of a load event and its .failure() step", async () => {
		const on_load = dependency(0, "on_load", [10]);
		on_load.targets = [[0, "load"]];
		const fallback = dependency(1, "fallback", [10]);
		fallback.trigger_after = 0;
		fallback.trigger_only_on_failure = true;
		const submitted: [number, unknown][] = [];
		const client = {
			submit: (
				fn_index: number,
				_data: unknown,
				_event_data: unknown,
				trigger_id: unknown
			) => {
				submitted.push([fn_index, trigger_id]);
				return submission(
					(async function* () {
						yield fn_index === 0
							? { type: "status", stage: "error", queue: true, message: "boom" }
							: { type: "status", stage: "complete", queue: true };
					})()
				);
			}
		} as unknown as Client;

		manager([on_load, fallback], client).dispatch_load_events();

		await vi.waitFor(() =>
			expect(submitted).toEqual([
				[0, 0],
				[1, 0]
			])
		);
	});

	test("sends the cancelled run's trigger to the step chained after it", async () => {
		const slow = dependency(0, "slow", [10]);
		slow.targets = [[5, "click"]];
		const after = dependency(1, "after", [11]);
		after.trigger_after = 0;
		const stop = dependency(2, "stop", []);
		stop.targets = [[6, "click"]];
		stop.cancels = [0];
		const submitted: [number, unknown][] = [];
		const client = {
			submit: (
				fn_index: number,
				_data: unknown,
				_event_data: unknown,
				trigger_id: unknown
			) => {
				submitted.push([fn_index, trigger_id]);
				const run = submission(
					(async function* () {
						if (fn_index === 0) await new Promise(() => {});
						yield { type: "status", stage: "complete", queue: true };
					})()
				);
				return Object.assign(run, { cancel: vi.fn() });
			}
		} as unknown as Client;
		const dependency_manager = manager([slow, after, stop], client);

		dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 5,
			event_data: null
		});
		await vi.waitFor(() =>
			expect(dependency_manager.submissions.has(0)).toBe(true)
		);
		dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 6,
			event_data: null
		});

		await vi.waitFor(() => expect(submitted).toContainEqual([1, 5]));
	});

	test.each(["ends", "completes"])(
		"a cancelled run runs .then() and .failure() once when its iterator %s",
		async (ending) => {
			const run = dependency(0, "run", []);
			const then = dependency(1, "then", []);
			then.trigger_after = 0;
			const on_success = dependency(2, "on_success", []);
			on_success.trigger_after = 0;
			on_success.trigger_only_on_success = true;
			const on_failure = dependency(3, "on_failure", []);
			on_failure.trigger_after = 0;
			on_failure.trigger_only_on_failure = true;
			let cancelled!: () => void;
			const cancelling = new Promise<void>((resolve) => (cancelled = resolve));
			const running_run = Object.assign(
				submission(
					(async function* () {
						yield { type: "status", stage: "pending", queue: true };
						await cancelling;
						// The server's completion of a cancelled event, if it
						// arrives before the client acknowledges the event; once it
						// does, the iterator just ends
						if (ending === "completes") {
							yield { type: "status", stage: "complete", queue: true };
						}
					})()
				),
				{ cancel: vi.fn(async () => cancelled()) }
			);
			const client = { submit: () => running_run } as unknown as Client;
			const dependency_manager = manager(
				[run, then, on_success, on_failure],
				client
			);

			const running = dependency_manager.dispatch({
				type: "fn",
				fn_index: 0,
				event_data: null
			});
			await vi.waitFor(() =>
				expect(dependency_manager.submissions.has(0)).toBe(true)
			);
			const dispatch = vi
				.spyOn(dependency_manager, "dispatch")
				.mockResolvedValue(undefined);
			await dependency_manager.cancel([0]);
			await running;

			expect(
				dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
			).toEqual([1, 3]);
		}
	);
});

describe("DependencyManager.close_stream", () => {
	test("closes only the stream events of the component", async () => {
		const stream = dependency(0, "stream", []);
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		const on_start = dependency(1, "on_start", [6]);
		on_start.targets = [[5, "start_recording"]];
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[stream, on_start],
			{} as Client,
			update_state
		);
		const submissions = (dependency_manager as any).submissions as Map<
			number,
			{ close_stream: () => void }
		>;
		const stream_submission = { close_stream: vi.fn() };
		const start_submission = { close_stream: vi.fn() };
		submissions.set(0, stream_submission);
		submissions.set(1, start_submission);

		dependency_manager.close_stream(5);

		expect(stream_submission.close_stream).toHaveBeenCalled();
		expect(submissions.has(0)).toBe(false);
		// A handler of another event of the component keeps running, and its
		// outputs still get its result
		expect(start_submission.close_stream).not.toHaveBeenCalled();
		expect(submissions.has(1)).toBe(true);
	});

	test("a stream ended on the page still gets its last outputs and .success()", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		const on_success = dependency(1, "on_success", []);
		on_success.trigger_after = 0;
		on_success.trigger_only_on_success = true;
		const then = dependency(2, "then", []);
		then.trigger_after = 0;
		let end!: () => void;
		const ended = new Promise<void>((resolve) => (end = resolve));
		const run = Object.assign(
			submission(
				(async function* () {
					yield { type: "status", stage: "pending", queue: true };
					yield {
						type: "status",
						stage: "streaming",
						queue: true,
						original_msg: "process_starts"
					};
					await ended;
					// What the server still delivers once asked to end the stream
					yield { type: "data", data: ["last"] };
					yield { type: "status", stage: "complete", queue: true };
				})()
			),
			{ close_stream: vi.fn(() => end()) }
		);
		const client = { submit: () => run } as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[stream, on_success, then],
			client,
			update_state
		);
		const handle_data = vi.spyOn(dependency_manager as any, "handle_data");

		const running = dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await vi.waitFor(() =>
			expect((dependency_manager as any).submissions.has(0)).toBe(true)
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);
		dependency_manager.close_stream(5);
		update_state.mockClear();
		await running;

		expect(run.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		expect(handle_data).toHaveBeenCalledWith([10], ["last"]);
		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual([1, 2]);
		// The page has already settled the component's status, and a new stream
		// may have started since
		const painted = update_state.mock.calls
			.filter(([id, state]) => id === 10 && "loading_status" in state)
			.map(([, state]) => state.loading_status);
		expect(
			painted.every(
				(status) =>
					status.status === "complete" && status.stream_state === "closed"
			)
		).toBe(true);
	});

	test("a stream ended on the page before its turn came runs .failure() and .then(), as a cancelled one", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		const on_success = dependency(1, "on_success", []);
		on_success.trigger_after = 0;
		on_success.trigger_only_on_success = true;
		const then = dependency(2, "then", []);
		then.trigger_after = 0;
		const on_failure = dependency(3, "on_failure", []);
		on_failure.trigger_after = 0;
		on_failure.trigger_only_on_failure = true;
		let end!: () => void;
		const ended = new Promise<void>((resolve) => (end = resolve));
		const run = Object.assign(
			submission(
				(async function* () {
					yield { type: "status", stage: "pending", queue: true };
					await ended;
					// The server takes it out of the line and reports it over,
					// without outputs
					yield { type: "data", data: undefined };
					yield { type: "status", stage: "complete", queue: true };
				})()
			),
			{ close_stream: vi.fn(() => end()) }
		);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager(
			[stream, on_success, then, on_failure],
			client
		);

		const running = dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await vi.waitFor(() =>
			expect((dependency_manager as any).submissions.has(0)).toBe(true)
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);
		dependency_manager.close_stream(5);
		await running;

		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual([2, 3]);
	});

	test("a stream ended on the page while its process_starts was on the way still runs .failure()", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		const on_success = dependency(1, "on_success", []);
		on_success.trigger_after = 0;
		on_success.trigger_only_on_success = true;
		const then = dependency(2, "then", []);
		then.trigger_after = 0;
		const on_failure = dependency(3, "on_failure", []);
		on_failure.trigger_after = 0;
		on_failure.trigger_only_on_failure = true;
		let end!: () => void;
		const ended = new Promise<void>((resolve) => (end = resolve));
		const run = Object.assign(
			submission(
				(async function* () {
					yield { type: "status", stage: "pending", queue: true };
					await ended;
					// The queue had started the event when the page ended it:
					// its first call runs and finishes it
					yield {
						type: "status",
						stage: "pending",
						queue: true,
						original_msg: "process_starts"
					};
					yield { type: "data", data: undefined };
					yield { type: "status", stage: "complete", queue: true };
				})()
			),
			{ close_stream: vi.fn(() => end()) }
		);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager(
			[stream, on_success, then, on_failure],
			client
		);

		const running = dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await vi.waitFor(() =>
			expect((dependency_manager as any).submissions.has(0)).toBe(true)
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);
		dependency_manager.close_stream(5);
		await running;

		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual([2, 3]);
	});
});

describe("DependencyManager.dispatch with an observer", () => {
	function stream_dependency(): DependencyConfig {
		const stream = dependency(0, "stream", [10]);
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		stream.trigger_mode = "multiple";
		return stream;
	}

	function observer() {
		return { on_start: vi.fn(), on_status: vi.fn(), on_end: vi.fn() };
	}

	function start(
		dependency_manager: DependencyManager,
		watcher: ReturnType<typeof observer>
	): Promise<void> {
		return dependency_manager.dispatch({
			type: "event",
			event_name: "stream",
			target_id: 5,
			event_data: null,
			observer: watcher
		});
	}

	function stream_run(
		messages: unknown[],
		hold?: Promise<void>,
		after: unknown[] = []
	) {
		let end!: () => void;
		const ended = new Promise<void>((resolve) => (end = resolve));
		return Object.assign(
			submission(
				(async function* () {
					yield* messages;
					if (hold) await Promise.race([hold, ended]);
					yield* after;
				})()
			),
			{ close_stream: vi.fn(() => end()), cancel: vi.fn() }
		);
	}

	const waiting = {
		type: "status",
		stage: "pending",
		queue: true,
		position: 1,
		size: 3,
		eta: 20
	};
	const turn = {
		type: "status",
		stage: "streaming",
		queue: true,
		original_msg: "process_starts"
	};
	const complete = { type: "status", stage: "complete", queue: true };

	test("hears the run's statuses and how it ended, once", async () => {
		const run = stream_run([waiting, turn, complete]);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager([stream_dependency()], client);
		const watcher = observer();

		await start(dependency_manager, watcher);

		expect(watcher.on_start).toHaveBeenCalledTimes(1);
		const states = watcher.on_status.mock.calls.map(
			([status]) => status.stream_state
		);
		expect(states).toEqual(["waiting", "open", "closed"]);
		const [first] = watcher.on_status.mock.calls[0];
		expect(first).toMatchObject({ queue_position: 1, queue_size: 3, eta: 20 });
		expect(watcher.on_end.mock.calls).toEqual([["ended"]]);
	});

	test("hears an error once", async () => {
		const run = stream_run([
			waiting,
			{ type: "status", stage: "error", queue: true, message: "Bad frame" }
		]);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager([stream_dependency()], client);
		const watcher = observer();

		await start(dependency_manager, watcher);

		expect(watcher.on_end.mock.calls).toEqual([["error"]]);
	});

	test("hears that nothing started for an event without a function", async () => {
		const dependency_manager = manager([stream_dependency()]);
		const watcher = observer();

		await dependency_manager.dispatch({
			type: "event",
			event_name: "stream",
			target_id: 6,
			event_data: null,
			observer: watcher
		});

		expect(watcher.on_start).not.toHaveBeenCalled();
		expect(watcher.on_end.mock.calls).toEqual([["not_started"]]);
	});

	test("hears that nothing started after the connection was lost", async () => {
		const dependency_manager = manager([stream_dependency()]);
		dependency_manager.connection_lost = true;
		const watcher = observer();

		await start(dependency_manager, watcher);

		expect(watcher.on_end.mock.calls).toEqual([["not_started"]]);
	});

	test("hears that nothing started when the stream already runs", async () => {
		const dependency_manager = manager([stream_dependency()]);
		const running = { send_chunk: vi.fn() };
		(dependency_manager as any).submissions.set(0, running);
		const watcher = observer();

		await start(dependency_manager, watcher);

		// The dispatch went to the running stream as a chunk
		expect(running.send_chunk).toHaveBeenCalled();
		expect(watcher.on_start).not.toHaveBeenCalled();
		expect(watcher.on_end.mock.calls).toEqual([["not_started"]]);
	});

	test("hears how it went when the inputs cannot be read", async () => {
		const dependency_manager = manager([stream_dependency()]);
		vi.spyOn(dependency_manager, "gather_state").mockRejectedValue(
			new Error("gone")
		);
		const watcher = observer();

		await expect(start(dependency_manager, watcher)).rejects.toThrow("gone");

		expect(watcher.on_end.mock.calls).toEqual([["not_started"]]);
	});

	test("a deferred run started later does not report to the dispatch that deferred it", async () => {
		const always_last = dependency(0, "always_last", [10]);
		always_last.targets = [[5, "change"]];
		always_last.trigger_mode = "always_last";
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		const client = {
			submit: () =>
				submission(
					(async function* () {
						await held;
						yield complete;
					})()
				)
		} as unknown as Client;
		const dependency_manager = manager([always_last], client);
		const first = observer();
		const second = observer();
		const event = (watcher: ReturnType<typeof observer>) =>
			dependency_manager.dispatch({
				type: "event",
				event_name: "change",
				target_id: 5,
				event_data: null,
				observer: watcher
			});

		const running = event(first);
		await vi.waitFor(() =>
			expect((dependency_manager as any).submissions.has(0)).toBe(true)
		);
		await event(second);
		expect(second.on_end.mock.calls).toEqual([["not_started"]]);
		release();
		await running;
		await vi.waitFor(() =>
			expect((dependency_manager as any).submissions.has(0)).toBe(false)
		);

		expect(first.on_end.mock.calls).toEqual([["ended"]]);
		expect(second.on_start).not.toHaveBeenCalled();
		expect(second.on_end).toHaveBeenCalledTimes(1);
	});

	test("the run's handle ends the stream as the page's close does", async () => {
		let hold!: () => void;
		const held = new Promise<void>((resolve) => (hold = resolve));
		const run = stream_run([waiting, turn], held, [
			{ type: "data", data: ["last"] },
			complete
		]);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager([stream_dependency()], client);
		const handle_data = vi.spyOn(dependency_manager as any, "handle_data");
		const watcher = observer();

		const running = start(dependency_manager, watcher);
		await vi.waitFor(() => expect(watcher.on_start).toHaveBeenCalled());
		const [handle] = watcher.on_start.mock.calls[0];
		const statuses = watcher.on_status.mock.calls.length;
		handle.close();
		await running;
		hold();

		expect(run.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		expect((dependency_manager as any).submissions.has(0)).toBe(false);
		// The last outputs still arrive; the page has settled the status itself
		expect(handle_data).toHaveBeenCalledWith([10], ["last"]);
		expect(watcher.on_status).toHaveBeenCalledTimes(statuses);
		expect(watcher.on_end.mock.calls).toEqual([["ended"]]);
	});

	test("the handle of a run that is not a stream cancels it", async () => {
		const generator = dependency(0, "generator", [10]);
		generator.targets = [[5, "click"]];
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		const run = Object.assign(
			submission(
				(async function* () {
					yield waiting;
					await held;
					yield complete;
				})()
			),
			{ cancel: vi.fn(async () => release()), close_stream: vi.fn() }
		);
		const client = { submit: () => run } as unknown as Client;
		const dependency_manager = manager([generator], client);
		const watcher = observer();

		const running = dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 5,
			event_data: null,
			observer: watcher
		});
		await vi.waitFor(() => expect(watcher.on_start).toHaveBeenCalled());
		const [handle] = watcher.on_start.mock.calls[0];
		handle.close();
		await running;

		expect(run.cancel).toHaveBeenCalled();
		expect(run.close_stream).not.toHaveBeenCalled();
		expect(watcher.on_end).toHaveBeenCalledTimes(1);
	});

	test("the handle of an earlier run leaves a newer run of the event alone", async () => {
		let hold!: () => void;
		const held = new Promise<void>((resolve) => (hold = resolve));
		const run = stream_run([waiting, turn], held, [complete]);
		const client = { submit: () => run } as unknown as Client;
		const on_loading_status_change = vi.fn();
		const dependency_manager = manager(
			[stream_dependency()],
			client,
			vi.fn().mockResolvedValue(undefined),
			on_loading_status_change
		);
		const watcher = observer();

		const running = start(dependency_manager, watcher);
		await vi.waitFor(() => expect(watcher.on_start).toHaveBeenCalled());
		const [handle] = watcher.on_start.mock.calls[0];
		// Another run of the same event has since taken its place
		const newer = { close_stream: vi.fn() };
		(dependency_manager as any).submissions.set(0, newer);
		on_loading_status_change.mockClear();
		handle.close();

		expect(run.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		expect(newer.close_stream).not.toHaveBeenCalled();
		expect((dependency_manager as any).submissions.get(0)).toBe(newer);
		expect(on_loading_status_change).not.toHaveBeenCalled();
		hold();
		await running;
	});
});

describe("DependencyManager.dispatch_load_events", () => {
	test("dispatches load handlers that are not already being resumed", () => {
		const resumed_load = dependency(0, "resumed_load", []);
		resumed_load.targets = [[1, "load"]];
		const normal_load = dependency(1, "normal_load", []);
		normal_load.targets = [[2, "load"]];
		const dependency_manager = manager([resumed_load, normal_load]);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		dependency_manager.dispatch_load_events(undefined, new Set([0]));

		expect(dispatch).toHaveBeenCalledTimes(1);
		expect(dispatch).toHaveBeenCalledWith({
			type: "fn",
			fn_index: 1,
			event_data: null,
			target_id: 2
		});
	});
});

describe("DependencyManager.resume", () => {
	function chain(): DependencyConfig[] {
		const run = dependency(0, "run", []);
		const then = dependency(1, "then", []);
		then.trigger_after = 0;
		const on_success = dependency(2, "on_success", []);
		on_success.trigger_after = 0;
		on_success.trigger_only_on_success = true;
		const on_failure = dependency(3, "on_failure", []);
		on_failure.trigger_after = 0;
		on_failure.trigger_only_on_failure = true;
		return [run, then, on_success, on_failure];
	}

	async function resume_with(stage: "complete" | "error"): Promise<number[]> {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage, fn_index: 0, queue: true };
		}
		const client = {
			resume_jobs: vi.fn(() => [submission(events())])
		} as unknown as Client;
		const dependency_manager = manager(chain(), client);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		return dispatch.mock.calls.map(([meta]) => (meta as any).fn_index);
	}

	test("runs the events chained to a resumed run once it completes", async () => {
		expect((await resume_with("complete")).sort()).toEqual([1, 2]);
	});

	test("runs only the failure handlers when a resumed run fails", async () => {
		expect(await resume_with("error")).toEqual([3]);
	});

	test("settles a resumed run the server no longer has, without failure handlers", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield {
				type: "status",
				stage: "error",
				session_not_found: true,
				fn_index: 0,
				queue: true
			};
		}
		const client = {
			resume_jobs: vi.fn(() => [submission(events())])
		} as unknown as Client;
		const dependency_manager = manager(chain(), client);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(dispatch).not.toHaveBeenCalled();
	});

	test("ends a stream that was running when the page was reloaded", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "streaming", fn_index: 0, queue: true };
		}
		const stream = dependency(0, "stream", []);
		stream.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager([stream], client);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		// Its chunks came from the page that is gone, so it would only hold its
		// place in the concurrency limit until it timed out
		expect(resumed.close_stream).toHaveBeenCalled();
		expect(resumed.acknowledge).toHaveBeenCalled();
		// The next "stream" event from the component starts a new stream
		// instead of sending a chunk to this one
		expect((dependency_manager as any).submissions.has(0)).toBe(false);
	});

	test("a stream ended after a reload shows the outputs the server replays", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "streaming", fn_index: 0, queue: true };
			// Sent while the page was reloading
			yield { type: "data", data: ["latest"], fn_index: 0 };
		}
		const stream = dependency(0, "stream", [7]);
		stream.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager([stream], client);
		const handle_data = vi
			.spyOn(dependency_manager as any, "handle_data")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(handle_data).toHaveBeenCalledWith([7], ["latest"]);
	});

	test("a stream that had failed before the reload runs its failure handlers", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			yield { type: "status", stage: "error", fn_index: 0, queue: true };
		}
		const [run, then, on_success, on_failure] = chain();
		run.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager(
			[run, then, on_success, on_failure],
			client
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(dispatch.mock.calls.map(([meta]) => (meta as any).fn_index)).toEqual(
			[3]
		);
	});

	test("a stream ended after a reload reads what the server sends to its end", async () => {
		async function* events(): AsyncGenerator<unknown> {
			// The client's own, before the connection to the server opens
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			await new Promise((resolve) => setTimeout(resolve, 500));
			yield { type: "data", data: ["sent during the reload"], fn_index: 0 };
			yield { type: "status", stage: "error", fn_index: 0, queue: true };
		}
		const [run, then, on_success, on_failure] = chain();
		run.connection = "stream";
		run.outputs = [7];
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager(
			[run, then, on_success, on_failure],
			client
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);
		const handle_data = vi
			.spyOn(dependency_manager as any, "handle_data")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		// The server ends the stream and reports it, however slow the
		// connection; the page acknowledges it only after that
		expect(resumed.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		expect(handle_data).toHaveBeenCalledWith([7], ["sent during the reload"]);
		expect(dispatch.mock.calls.map(([meta]) => (meta as any).fn_index)).toEqual(
			[3]
		);
	});

	test("a resumed stream that takes long to end still reports how it ended", async () => {
		vi.useFakeTimers();
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			// e.g. its last call waits for a free worker
			await new Promise((resolve) => setTimeout(resolve, 6000));
			yield { type: "data", data: ["last"], fn_index: 0 };
			yield { type: "status", stage: "error", fn_index: 0, queue: true };
		}
		const [run, then, on_success, on_failure] = chain();
		run.connection = "stream";
		run.outputs = [7];
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager(
			[run, then, on_success, on_failure],
			client
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);
		const handle_data = vi
			.spyOn(dependency_manager as any, "handle_data")
			.mockResolvedValue(undefined);

		try {
			const resuming = dependency_manager.resume([
				{ event_id: "e", fn_index: 0 }
			]);
			await vi.advanceTimersByTimeAsync(6000);
			await resuming;
		} finally {
			vi.useRealTimers();
		}
		expect(handle_data).toHaveBeenCalledWith([7], ["last"]);
		expect(dispatch.mock.calls.map(([meta]) => (meta as any).fn_index)).toEqual(
			[3]
		);
	});

	test("a replayed stream runs the .change listeners of the state it changed", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield {
				type: "status",
				stage: "streaming",
				fn_index: 0,
				queue: true,
				changed_state_ids: [42]
			};
			yield { type: "status", stage: "complete", fn_index: 0, queue: true };
		}
		const stream = dependency(0, "stream", []);
		stream.connection = "stream";
		const on_change = dependency(1, "on_change", []);
		on_change.targets = [[42, "change"]];
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager([stream, on_change], client);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index)
		).toContain(1);
	});

	test("runs the events chained to a stream it ends after a reload", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield {
				type: "status",
				stage: "streaming",
				fn_index: 0,
				queue: true,
				original_msg: "process_starts"
			};
			yield { type: "status", stage: "complete", fn_index: 0, queue: true };
		}
		const [run, then, on_success, on_failure] = chain();
		run.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager(
			[run, then, on_success, on_failure],
			client
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		// As when a stream is stopped: .then() and .success() follow it
		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual([1, 2]);
	});

	test("a stream still waiting for its turn when the page was reloaded ends as a cancelled one", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			yield { type: "status", stage: "complete", fn_index: 0, queue: true };
		}
		const [run, then, on_success, on_failure] = chain();
		run.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager(
			[run, then, on_success, on_failure],
			client
		);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual([1, 3]);
	});

	test("builds the block of a resumed render function", async () => {
		const render_data = {
			layout: {},
			components: [],
			render_id: 0,
			dependencies: []
		};
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "render", data: render_data };
		}
		const client = {
			resume_jobs: vi.fn(() => [submission(events())])
		} as unknown as Client;
		const dependency_manager = manager(chain(), client);
		const apply_render = vi
			.spyOn(dependency_manager, "apply_render")
			.mockImplementation(() => {});

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(apply_render).toHaveBeenCalledWith(render_data);
	});
});

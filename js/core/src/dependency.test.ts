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
	on_loading_status_change = vi.fn(),
	get_state = vi.fn().mockResolvedValue(null)
): DependencyManager {
	return new DependencyManager(
		dependencies,
		client,
		update_state,
		get_state,
		vi.fn(),
		vi.fn(),
		vi.fn(),
		vi.fn(),
		on_loading_status_change
	);
}

// An event with a .then(), a .success() and a .failure() step
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

	test.each([
		// Its generator returned: the inputs stop sending
		[true, "ended"],
		// The page closed it or its time ran out
		[false, "closed"]
	])(
		"a stream completed with stream_ended=%s gives its inputs %s",
		async (stream_ended, expected) => {
			const stream = dependency(0, "stream", [10]);
			stream.connection = "stream";
			stream.targets = [[11, "stream"]];
			stream.inputs = [11];
			const client = {
				submit: () =>
					submission(
						(async function* () {
							yield { type: "status", stage: "pending", queue: true };
							yield {
								type: "status",
								stage: "complete",
								queue: true,
								stream_ended
							};
						})()
					)
			} as unknown as Client;
			const update_state = vi.fn().mockResolvedValue(undefined);
			const dependency_manager = manager([stream], client, update_state);

			await dependency_manager.dispatch({
				type: "fn",
				fn_index: 0,
				event_data: null
			});

			const input_states = update_state.mock.calls
				.filter(([id, state]) => id === 11 && "loading_status" in state)
				.map(([, state]) => state.loading_status?.stream_state);
			expect(input_states.at(-1)).toBe(expected);
		}
	);

	test.each([
		// Its generator failed: the inputs stop sending
		true,
		// A plain function's stream keeps today's behavior
		false
	])(
		"a stream that fails with stream_ended=%s ends its inputs only then",
		async (stream_ended) => {
			const stream = dependency(0, "stream", [10]);
			stream.connection = "stream";
			stream.targets = [[11, "stream"]];
			stream.inputs = [11];
			const client = {
				submit: () =>
					submission(
						(async function* () {
							yield { type: "status", stage: "pending", queue: true };
							yield {
								type: "status",
								stage: "error",
								queue: true,
								message: "out of GPU time",
								stream_ended
							};
						})()
					)
			} as unknown as Client;
			const update_state = vi.fn().mockResolvedValue(undefined);
			const dependency_manager = manager([stream], client, update_state);

			await dependency_manager
				.dispatch({ type: "fn", fn_index: 0, event_data: null })
				.catch(() => undefined);

			const input_states = update_state.mock.calls
				.filter(([id, state]) => id === 11 && "loading_status" in state)
				.map(([, state]) => state.loading_status?.stream_state);
			expect(input_states.at(-1) === "ended").toBe(stream_ended);
		}
	);

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
				return submission(
					(async function* () {
						if (fn_index === 0) await slow_done;
						yield { type: "status", stage: "complete", queue: true };
					})()
				);
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

	test("runs the other listeners when a validator rejects one, without clearing its error", async () => {
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
		const submitted: number[] = [];
		const client = {
			submit: (fn_index: number) => {
				submitted.push(fn_index);
				return submission(
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
				);
			}
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
		expect(submitted).toContain(1);
	});

	test.each([
		["completes", "complete", "pending"],
		["fails", "error", "error"]
	])(
		"shows a shared output's status while another listener writing it is still running, when one %s",
		async (_, stage, shown) => {
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
					submission(
						(async function* () {
							if (fn_index === 0) await slow_done;
							yield {
								type: "status",
								stage: fn_index === 1 ? stage : "complete",
								queue: true
							};
						})()
					)
			} as unknown as Client;
			const on_loading_status_change = vi.fn();
			const dependency_manager = manager(
				[slow, quick],
				client,
				undefined,
				on_loading_status_change
			);
			const output_status = (): string | undefined =>
				dependency_manager.loading_stati.current[10]?.status;

			const click = dependency_manager.dispatch({
				type: "event",
				event_name: "click",
				target_id: 1,
				event_data: null
			});
			await vi.waitFor(() =>
				expect(on_loading_status_change).toHaveBeenCalledWith(
					expect.objectContaining({ fn_index: 1, status: stage })
				)
			);
			// Pending while the other one runs, but a failure shows right away
			expect(output_status()).toBe(shown);
			finish_slow();
			await click;

			expect(output_status()).toBe("complete");
			expect(dependency_manager.loading_stati.running_fns.size).toBe(0);
		}
	);

	test("shows the progress of the listeners still writing a shared output", async () => {
		const shown = dependency(0, "shown", [10]);
		shown.targets = [[1, "click"]];
		const hidden = dependency(1, "hidden", [10]);
		hidden.targets = [[2, "click"]];
		hidden.show_progress = "hidden";
		const finish = new Map<number, () => void>();
		const client = {
			submit: (fn_index: number) =>
				submission(
					(async function* () {
						await new Promise<void>((resolve) => finish.set(fn_index, resolve));
						yield { type: "status", stage: "complete", queue: true };
					})()
				)
		} as unknown as Client;
		const dependency_manager = manager([shown, hidden], client);
		const status = (): unknown => dependency_manager.loading_stati.current[10];
		const click = (target_id: number): Promise<void> =>
			dependency_manager.dispatch({
				type: "event",
				event_name: "click",
				target_id,
				event_data: null
			});

		const shown_run = click(1);
		const hidden_run = click(2);
		const hidden_start = dependency_manager.loading_stati.running_fns
			.get(10)
			?.get(1)?.time_start;
		// The hidden listener does not hide the other one's progress
		expect(status()).toMatchObject({ fn_index: 0, show_progress: "full" });

		await vi.waitFor(() => expect(finish.size).toBe(2));
		finish.get(0)!();
		await shown_run;
		// Then the output shows the hidden listener's own status, timer included
		expect(status()).toMatchObject({
			fn_index: 1,
			status: "pending",
			show_progress: "hidden",
			time_start: hidden_start
		});

		finish.get(1)!();
		await hidden_run;
		expect(status()).toMatchObject({ status: "complete" });
	});

	test("does not end an open stream when a chunk cannot be read", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.targets = [[1, "stream"]];
		stream.inputs = [20];
		stream.connection = "stream";
		stream.trigger_mode = "multiple";
		const get_state = vi.fn(async (id: number) => {
			if (id === 20) throw new Error("no state");
			return null;
		});
		const dependency_manager = manager(
			[stream],
			{} as Client,
			undefined,
			undefined,
			get_state
		);
		const open_stream = {
			send_chunk: vi.fn(),
			acknowledge: vi.fn().mockResolvedValue(undefined)
		};
		dependency_manager.submissions.set(
			0,
			open_stream as unknown as ReturnType<Client["submit"]>
		);
		dependency_manager.loading_stati.update({
			status: "streaming",
			fn_index: 0,
			stream_state: "open"
		});

		await expect(
			dependency_manager.dispatch({
				type: "event",
				event_name: "stream",
				target_id: 1,
				event_data: null
			})
		).rejects.toThrow("no state");

		expect(open_stream.acknowledge).not.toHaveBeenCalled();
		expect(dependency_manager.submissions.get(0)).toBe(open_stream);
		expect(dependency_manager.loading_stati.current[10]?.status).not.toBe(
			"error"
		);
		expect(dependency_manager.loading_stati.is_running(0)).toBe(true);
	});

	test("does not mark a finished stream pending for a late chunk, or start a new run with it", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.targets = [[1, "stream"]];
		stream.connection = "stream";
		stream.trigger_mode = "multiple";
		const dependency_manager = manager([stream]);
		// The stream has sent its final status and is waiting to be acknowledged
		const finishing = { send_chunk: vi.fn() };
		dependency_manager.submissions.set(
			0,
			finishing as unknown as ReturnType<Client["submit"]>
		);
		dependency_manager.loading_stati.update({
			status: "complete",
			fn_index: 0,
			stream_state: "closed"
		});

		const chunk = dependency_manager.dispatch({
			type: "event",
			event_name: "stream",
			target_id: 1,
			event_data: null
		});
		// The stream is cleared while the chunk's inputs are read
		dependency_manager.submissions.delete(0);
		await chunk;

		expect(finishing.send_chunk).not.toHaveBeenCalled();
		expect(dependency_manager.loading_stati.current[10]?.status).toBe(
			"complete"
		);
		expect(dependency_manager.loading_stati.running_fns.size).toBe(0);
	});

	test("ends the status of a listener whose output is also its input", async () => {
		// Like ChatInterface clearing its textbox on submit
		const clear = dependency(0, "clear", [10, 11]);
		clear.targets = [[10, "submit"]];
		clear.inputs = [10];
		const client = {
			submit: () =>
				submission(
					(async function* () {
						yield { type: "status", stage: "complete", queue: false };
					})()
				)
		} as unknown as Client;
		const dependency_manager = manager([clear], client);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "submit",
			target_id: 10,
			event_data: null
		});

		expect(dependency_manager.loading_stati.current[10]?.status).toBe(
			"complete"
		);
		expect(dependency_manager.loading_stati.running_fns.size).toBe(0);
	});

	test("restores a component's event args only after the last listener using them finishes", async () => {
		const [first, second] = [0.5, 2].map((stream_every, id) =>
			Object.assign(dependency(id, `stream_${id}`, []), {
				targets: [[1, "stream"]],
				event_specific_args: ["stream_every"],
				stream_every
			})
		) as DependencyConfig[];
		const state: Record<string, unknown> = {};
		const update_state = vi.fn(
			async (id: number, update: Record<string, unknown>) => {
				if (id === 1) Object.assign(state, update);
			}
		);
		const get_state = vi.fn(async (id: number) =>
			id === 1 ? { ...state } : null
		);
		const gates = new Map<number, () => void>();
		const submitted: number[] = [];
		const client = {
			submit: (fn_index: number) => {
				submitted.push(fn_index);
				return submission(
					(async function* () {
						await new Promise<void>((resolve) => gates.set(fn_index, resolve));
						yield { type: "status", stage: "complete", queue: true };
					})()
				);
			}
		} as unknown as Client;
		const dependency_manager = manager(
			[first, second],
			client,
			update_state,
			undefined,
			get_state
		);
		// Startup writes each listener's args once, without restoring them
		await vi.waitFor(() => expect(update_state).toHaveBeenCalledTimes(2));
		state.stream_every = 1;

		const run = (fn_index: number): Promise<void> =>
			dependency_manager.dispatch({ type: "fn", fn_index, event_data: null });
		// The second listener starts while the first one's value is applied
		const runs = [run(0)];
		await vi.waitFor(() => expect(submitted).toEqual([0]));
		runs.push(run(1));
		await vi.waitFor(() => expect(submitted).toEqual([0, 1]));
		gates.get(0)!();
		await runs[0];
		expect(state.stream_every).toBe(2);
		gates.get(1)!();
		await runs[1];

		expect(state.stream_every).toBe(1);
		expect(dependency_manager.event_args_holds.size).toBe(0);
	});

	test("settles a listener whose inputs or event args cannot be read", async () => {
		const failing = Object.assign(dependency(0, "failing", [10]), {
			targets: [
				[1, "click"],
				[2, "click"]
			],
			inputs: [20],
			event_specific_args: ["stream_every"],
			stream_every: 0.5
		}) as DependencyConfig;
		const failure_step = dependency(1, "failure_step", []);
		failure_step.trigger_after = 0;
		failure_step.trigger_only_on_failure = true;
		const submitted: number[] = [];
		const client = {
			submit: (fn_index: number) => {
				submitted.push(fn_index);
				return submission(
					(async function* () {
						yield { type: "status", stage: "complete", queue: true };
					})()
				);
			}
		} as unknown as Client;
		const reads = new Map<number, number>();
		const get_state = vi.fn(async (id: number) => {
			reads.set(id, (reads.get(id) ?? 0) + 1);
			// The second target fails only once the run is under way
			if (id === 2 && reads.get(id)! > 1) throw new Error("no state");
			return { stream_every: 1, value: null };
		});
		const dependency_manager = manager(
			[failing, failure_step],
			client,
			undefined,
			undefined,
			get_state
		);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "click",
			target_id: 1,
			event_data: null
		});

		expect(dependency_manager.loading_stati.current[10]?.status).toBe("error");
		expect(dependency_manager.loading_stati.running_fns.size).toBe(0);
		await vi.waitFor(() =>
			expect(dependency_manager.event_args_holds.size).toBe(0)
		);
		await vi.waitFor(() => expect(submitted).toEqual([1]));
	});

	test("leaves the input's loading status alone when sending a chunk to an open stream", async () => {
		const stream = dependency(0, "stream", []);
		stream.targets = [[1, "stream"]];
		stream.inputs = [10];
		stream.connection = "stream";
		stream.trigger_mode = "multiple";
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager([stream], {} as Client, update_state);
		const send_chunk = vi.fn();
		dependency_manager.submissions.set(0, {
			send_chunk
		} as unknown as ReturnType<Client["submit"]>);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "stream",
			target_id: 1,
			event_data: null
		});

		expect(send_chunk).toHaveBeenCalled();
		expect(
			update_state.mock.calls.filter(
				([id, state]) => id === 10 && state.loading_status
			)
		).toEqual([]);
	});

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
			const dependency_manager = manager(chain(), client);

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
		const [stream, ...steps] = chain();
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		stream.outputs = [10];
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
			[stream, ...steps],
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

	test.each([
		// The server takes it out of the line
		["before its turn came", []],
		// The queue had started the event when the page ended it: its first
		// call runs and finishes it
		[
			"while its process_starts was on the way",
			[
				{
					type: "status",
					stage: "pending",
					queue: true,
					original_msg: "process_starts"
				}
			]
		]
	])(
		"a stream ended on the page %s runs .failure() and .then(), as a cancelled one",
		async (_, started: unknown[]) => {
			const [stream, ...steps] = chain();
			stream.connection = "stream";
			stream.targets = [[5, "stream"]];
			stream.outputs = [10];
			let end!: () => void;
			const ended = new Promise<void>((resolve) => (end = resolve));
			const run = Object.assign(
				submission(
					(async function* () {
						yield { type: "status", stage: "pending", queue: true };
						await ended;
						yield* started;
						// Reported over, without outputs
						yield { type: "data", data: undefined };
						yield { type: "status", stage: "complete", queue: true };
					})()
				),
				{ close_stream: vi.fn(() => end()) }
			);
			const client = { submit: () => run } as unknown as Client;
			const dependency_manager = manager([stream, ...steps], client);

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
			).toEqual([1, 3]);
		}
	);
});

describe("DependencyManager: WebRTC streams", () => {
	function webrtc_stream(): DependencyConfig {
		const stream = dependency(0, "stream", [10]);
		stream.inputs = [5];
		(stream as any).transport = { type: "webrtc", media_output: 0 };
		return stream;
	}

	// The webcam or microphone streams to a textbox: its component only hears
	// about the run through stream_state, so a run that fails, even before its
	// turn comes, must still close it, or the control stays in its recording state
	test.each([
		["the submission fails to start", null],
		[
			"the first message is an error",
			[{ type: "status", stage: "error", queue: true, message: "refused" }]
		],
		[
			"the connection is lost",
			[{ type: "status", stage: "error", queue: true, broken: true }]
		],
		[
			"it fails while running",
			[
				{ type: "status", stage: "pending", queue: true },
				{
					type: "status",
					stage: "streaming",
					queue: true,
					original_msg: "process_starts"
				},
				{ type: "status", stage: "error", queue: true, message: "boom" }
			]
		]
	])(
		"a send-only stream closes its input component when %s",
		async (_, messages: unknown[] | null) => {
			const stream = dependency(0, "stream", [10]);
			stream.inputs = [5];
			stream.connection = "stream";
			stream.targets = [[5, "stream"]];
			(stream as any).transport = { type: "webrtc", media_output: null };
			const client = {
				submit: () => {
					if (messages === null) throw new Error("no connection");
					return submission(
						(async function* () {
							yield* messages;
						})()
					);
				}
			} as unknown as Client;
			const update_state = vi.fn().mockResolvedValue(undefined);
			const dependency_manager = manager([stream], client, update_state);

			await dependency_manager.dispatch({
				type: "event",
				event_name: "stream",
				target_id: 5,
				event_data: null
			});
			await new Promise((resolve) => setTimeout(resolve, 0));

			const states = update_state.mock.calls
				.filter(([id, state]) => id === 5 && "loading_status" in state)
				.map(([, state]) => state.loading_status.stream_state);
			expect(states.slice(0, -1)).toContain("waiting");
			expect(states.at(-1)).toBe("closed");
			// A status without stream_state in between would end the stream on
			// the page while it runs
			expect(states.every((state) => state !== undefined)).toBe(true);
		}
	);

	test("a stream that hands its slot over shows that it waits its turn again", async () => {
		const stream = dependency(0, "stream", [10]);
		stream.inputs = [5];
		stream.connection = "stream";
		stream.targets = [[5, "stream"]];
		(stream as any).transport = { type: "webrtc", media_output: null };
		const starts = {
			type: "status",
			stage: "streaming",
			queue: true,
			original_msg: "process_starts"
		};
		const client = {
			submit: () =>
				submission(
					(async function* () {
						yield { type: "status", stage: "pending", queue: true };
						yield starts;
						// submit_over_webrtc() joined the queue again
						yield { type: "status", stage: "pending", queue: true };
						yield starts;
						yield { type: "status", stage: "complete", queue: true };
					})()
				)
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager([stream], client, update_state);

		await dependency_manager.dispatch({
			type: "event",
			event_name: "stream",
			target_id: 5,
			event_data: null
		});
		await new Promise((resolve) => setTimeout(resolve, 0));

		const states = update_state.mock.calls
			.filter(([id, state]) => id === 5 && "loading_status" in state)
			.map(([, state]) => state.loading_status.stream_state);
		const first_open = states.indexOf("open");
		expect(first_open).toBeGreaterThan(-1);
		const again = states.indexOf("waiting", first_open);
		expect(again).toBeGreaterThan(first_open);
		expect(states.indexOf("open", again)).toBeGreaterThan(again);
	});

	test("the end of an older run leaves a newer run's live media", () => {
		const stream = webrtc_stream();
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager([stream], {} as Client, update_state);
		const submissions = (dependency_manager as any).submissions as Map<
			number,
			unknown
		>;
		const older = {} as ReturnType<Client["submit"]>;
		submissions.set(0, {});

		dependency_manager.end_live_stream(stream, older);
		expect(update_state).not.toHaveBeenCalled();

		submissions.delete(0);
		dependency_manager.end_live_stream(stream, older);
		expect(update_state).toHaveBeenCalledWith(10, { live_stream: null }, false);
	});

	test("the newest values of the other inputs go out last", async () => {
		const dependency_manager = manager([webrtc_stream()]);
		const sent: unknown[] = [];
		const send_chunk = vi.fn((chunk: { data: unknown }) => {
			sent.push(chunk.data);
		});
		(dependency_manager as any).submissions.set(0, { send_chunk });
		let release_older!: (data: unknown[]) => void;
		const gathered = [
			new Promise<unknown[]>((resolve) => (release_older = resolve)),
			Promise.resolve(["newer"])
		];
		vi.spyOn(dependency_manager as any, "gather_state").mockImplementation(() =>
			gathered.shift()
		);

		dependency_manager.push_stream_inputs(5);
		dependency_manager.push_stream_inputs(5);
		await vi.waitFor(() => expect(sent).toEqual([["newer"]]));
		release_older(["older"]);
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(sent).toEqual([["newer"]]);

		// A stream that ended meanwhile: the failed send is not left unhandled
		send_chunk.mockImplementation(() => {
			throw new Error("closed");
		});
		vi.spyOn(dependency_manager as any, "gather_state").mockResolvedValue([1]);
		dependency_manager.push_stream_inputs(5);
		await new Promise((resolve) => setTimeout(resolve, 0));
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

	test("settles the status of a resumed run that throws or ends without one", async () => {
		async function* events(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			throw new Error("connection lost");
		}
		const client = {
			resume_jobs: vi.fn(() => [submission(events())])
		} as unknown as Client;
		const run = dependency(0, "run", [10]);
		const dependency_manager = manager([run], client);

		await expect(
			dependency_manager.resume([{ event_id: "e", fn_index: 0 }])
		).rejects.toThrow("connection lost");

		expect(dependency_manager.loading_stati.current[10]?.status).toBe("error");
		expect(dependency_manager.loading_stati.is_running(0)).toBe(false);

		async function* ends(): AsyncGenerator<unknown> {
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
		}
		vi.mocked(client.resume_jobs).mockReturnValue([submission(ends())]);
		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);

		expect(dependency_manager.loading_stati.current[10]?.status).toBe(
			"complete"
		);
		expect(dependency_manager.loading_stati.is_running(0)).toBe(false);
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

	test.each([
		[
			"that had failed before the reload runs its failure handlers",
			[
				{ type: "status", stage: "pending", fn_index: 0, queue: true },
				{ type: "status", stage: "error", fn_index: 0, queue: true }
			],
			[3]
		],
		[
			"that was running when the page was reloaded runs .then() and .success(), as a stopped one",
			[
				{
					type: "status",
					stage: "streaming",
					fn_index: 0,
					queue: true,
					original_msg: "process_starts"
				},
				{ type: "status", stage: "complete", fn_index: 0, queue: true }
			],
			[1, 2]
		],
		[
			"still waiting for its turn when the page was reloaded ends as a cancelled one",
			[
				{ type: "status", stage: "pending", fn_index: 0, queue: true },
				{ type: "status", stage: "complete", fn_index: 0, queue: true }
			],
			[1, 3]
		]
	])("a stream %s", async (_, messages: unknown[], expected: number[]) => {
		async function* events(): AsyncGenerator<unknown> {
			yield* messages;
		}
		const [run, ...steps] = chain();
		run.connection = "stream";
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager([run, ...steps], client);
		const dispatch = vi
			.spyOn(dependency_manager, "dispatch")
			.mockResolvedValue(undefined);

		await dependency_manager.resume([{ event_id: "e", fn_index: 0 }]);
		expect(
			dispatch.mock.calls.map(([meta]) => (meta as any).fn_index).sort()
		).toEqual(expected);
	});

	test("a stream ended after a reload reads what the server sends to its end", async () => {
		async function* events(): AsyncGenerator<unknown> {
			// The client's own, before the connection to the server opens
			yield { type: "status", stage: "pending", fn_index: 0, queue: true };
			await new Promise((resolve) => setTimeout(resolve, 500));
			yield { type: "data", data: ["sent during the reload"], fn_index: 0 };
			yield { type: "status", stage: "error", fn_index: 0, queue: true };
		}
		const [run, ...steps] = chain();
		run.connection = "stream";
		run.outputs = [7];
		const resumed = Object.assign(submission(events()), {
			close_stream: vi.fn()
		});
		const client = {
			resume_jobs: vi.fn(() => [resumed])
		} as unknown as Client;
		const dependency_manager = manager([run, ...steps], client);
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

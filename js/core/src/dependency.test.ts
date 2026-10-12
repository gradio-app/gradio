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

	test("pushes loading status only to the components whose status changed", async () => {
		const client = {
			submit: () =>
				(async function* () {
					yield { type: "status", stage: "complete", queue: true };
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const dependency_manager = manager(
			[dependency(0, "first", [10, 11]), dependency(1, "second", [20])],
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

		const painted_ids = update_state.mock.calls
			.filter(([, state]) => "loading_status" in state)
			.map(([id]) => id);
		expect(painted_ids).toContain(20);
		expect(painted_ids).not.toContain(10);
		expect(painted_ids).not.toContain(11);

		// After a reload every component is remounted, so all are pushed again
		update_state.mockClear();
		await dependency_manager.update_loading_stati_state(true);
		expect(update_state.mock.calls.map(([id]) => id).sort()).toEqual([
			10, 11, 20
		]);
	});

	test("pushes loading status again to the components a gr.render rebuilt", async () => {
		const messages: Record<number, unknown> = {
			0: { type: "status", stage: "complete", queue: true },
			1: {
				type: "render",
				data: {
					layout: { id: 99, children: [{ id: 10 }] },
					components: [{ id: 10, type: "textbox", props: {} }],
					render_id: 99,
					dependencies: []
				}
			}
		};
		const client = {
			submit: (fn_index: number) =>
				(async function* () {
					yield messages[fn_index];
				})()
		} as unknown as Client;
		const update_state = vi.fn().mockResolvedValue(undefined);
		const rerender = vi.fn();
		const dependency_manager = new DependencyManager(
			[dependency(0, "output", [10]), dependency(1, "render", [])],
			client,
			update_state,
			vi.fn().mockResolvedValue(null),
			rerender,
			vi.fn(),
			vi.fn(),
			vi.fn(),
			vi.fn()
		);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 0,
			event_data: null
		});
		await dependency_manager.dispatch({
			type: "fn",
			fn_index: 1,
			event_data: null
		});

		expect(rerender).toHaveBeenCalledOnce();
		update_state.mockClear();

		// 10's status did not change, but the render replaced its component,
		// which starts without one, so the next push includes it
		await dependency_manager.update_loading_stati_state();
		expect(update_state.mock.calls.map(([id]) => id)).toContain(10);
	});
});

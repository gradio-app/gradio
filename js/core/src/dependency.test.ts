import { describe, expect, test, vi } from "vitest";
import type { Client } from "@gradio/client";
import { DependencyManager } from "./dependency";
import type { Dependency as DependencyConfig } from "./types";

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
	client = {} as Client
): DependencyManager {
	return new DependencyManager(
		dependencies,
		client,
		vi.fn().mockResolvedValue(undefined),
		vi.fn().mockResolvedValue(null),
		vi.fn(),
		vi.fn(),
		vi.fn(),
		vi.fn()
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
});

describe("DependencyManager render results", () => {
	test("dispatches load events added by a reactive render", async () => {
		const outer_dependency = dependency(0, "outer_render", []);
		const nested_dependency = dependency(1, "nested_render", []);
		nested_dependency.targets = [[42, "load"]];

		const render_submission = {
			async *[Symbol.asyncIterator]() {
				yield {
					type: "render",
					data: {
						layout: { id: 42, children: [] },
						components: [],
						render_id: 0,
						dependencies: [nested_dependency]
					}
				};
			},
			cancel: vi.fn()
		} as ReturnType<Client["submit"]>;
		const nested_submission = {
			async *[Symbol.asyncIterator]() {},
			cancel: vi.fn()
		} as ReturnType<Client["submit"]>;
		const submit = vi
			.fn()
			.mockReturnValueOnce(render_submission)
			.mockReturnValueOnce(nested_submission);
		const dependency_manager = manager([outer_dependency], {
			submit
		} as unknown as Client);

		await dependency_manager.dispatch({
			type: "fn",
			fn_index: outer_dependency.id,
			event_data: null
		});

		await vi.waitFor(() => {
			expect(submit.mock.calls.map(([fn_index]) => fn_index)).toEqual([0, 1]);
		});
	});
});

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

function manager(dependencies: DependencyConfig[]): DependencyManager {
	return new DependencyManager(
		dependencies,
		{} as Client,
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
	});
});

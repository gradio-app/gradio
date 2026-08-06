import { afterEach, describe, expect, test } from "vitest";

import {
	clear_run_history,
	consume_run_history_replay,
	delete_run_history,
	read_run_history,
	stage_run_history_replay,
	start_run_history,
	update_run_history,
	update_run_inputs
} from "../utils/run_history";

const root = "http://localhost:7860/my-app/";

afterEach(() => clear_run_history(root));

describe("run history", () => {
	test("stores runs per app root with the page and inputs", () => {
		const id = start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"],
			input_components: [
				{
					type: "textbox",
					component_class_id: "textbox-id",
					props: { label: "Prompt" }
				}
			]
		});

		const runs = read_run_history(root);
		expect(runs).toHaveLength(1);
		expect(runs[0]).toMatchObject({
			id,
			endpoint: "/predict",
			api_name: "/predict",
			inputs: ["hello"],
			status: "running",
			input_components: [
				{
					type: "textbox",
					component_class_id: "textbox-id",
					props: { label: "Prompt" }
				}
			],
			page: `${window.location.pathname}${window.location.search}`
		});
		expect(read_run_history("http://localhost:7860/other-app/")).toEqual([]);
	});

	test("replaces inputs with their upload-processed values", () => {
		const id = start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: [new File(["hello"], "hello.txt")]
		});

		update_run_inputs(root, id, [
			{ path: "/tmp/hello.txt", url: "/gradio_api/file=/tmp/hello.txt" }
		]);

		expect(read_run_history(root)[0].inputs).toEqual([
			{ path: "/tmp/hello.txt", url: "/gradio_api/file=/tmp/hello.txt" }
		]);
	});

	test("updates outputs and completion state", () => {
		const id = start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});

		update_run_history(root, id, {
			type: "data",
			endpoint: "/predict",
			fn_index: 0,
			data: ["hello hello"]
		});
		update_run_history(root, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: false,
			stage: "complete",
			time: new Date("2025-05-16T21:45:00Z")
		});

		expect(read_run_history(root)[0]).toMatchObject({
			outputs: ["hello hello"],
			status: "completed",
			completed_at: "2025-05-16T21:45:00.000Z"
		});
	});

	test("records failed runs and their error message", () => {
		const id = start_run_history({
			root,
			endpoint: 3,
			api_name: "Function 3",
			fn_index: 3,
			inputs: [{ circular: null }]
		});

		update_run_history(root, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 3,
			queue: true,
			stage: "error",
			message: "generation failed"
		});

		expect(read_run_history(root)[0]).toMatchObject({
			status: "failed",
			error: "generation failed"
		});
	});

	test("keeps only the newest 100 runs", () => {
		for (let index = 0; index < 105; index++) {
			start_run_history({
				root,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: [index]
			});
		}

		const runs = read_run_history(root);
		expect(runs).toHaveLength(100);
		expect(runs[0].inputs).toEqual([104]);
		expect(runs.at(-1)?.inputs).toEqual([5]);
	});

	test("deletes an individual run", () => {
		const first = start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["first"]
		});
		start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["second"]
		});

		delete_run_history(root, first!);

		expect(read_run_history(root)).toHaveLength(1);
		expect(read_run_history(root)[0].inputs).toEqual(["second"]);
	});

	test("stages a run once so it can be loaded on its saved page", () => {
		const id = start_run_history({
			root,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		const run = read_run_history(root).find((item) => item.id === id)!;

		stage_run_history_replay(root, run);

		expect(consume_run_history_replay(root)).toEqual(run);
		expect(consume_run_history_replay(root)).toBeNull();
	});
});

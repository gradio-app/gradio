import { afterEach, describe, expect, test } from "vitest";

import {
	clear_run_history,
	consume_run_history_replay,
	delete_run_history,
	on_run_history_change,
	read_run_history,
	run_history_url,
	stage_run_history_replay,
	start_run_history,
	update_run_history,
	update_run_inputs
} from "../utils/run_history";

const app_id = "app-under-test";
const other_app = "some-other-app";
const in_browser = typeof window !== "undefined";

afterEach(() => {
	clear_run_history(app_id);
	clear_run_history(other_app);
});

describe.skipIf(!in_browser)("run history", () => {
	test("stores runs per app id with the page and inputs", () => {
		const id = start_run_history({
			app_id,
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

		const runs = read_run_history(app_id);
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
		expect(read_run_history(other_app)).toEqual([]);
	});

	test("replaces inputs with their upload-processed values", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: [new File(["hello"], "hello.txt")]
		});

		update_run_inputs(app_id, id, [
			{ path: "/tmp/hello.txt", url: "/gradio_api/file=/tmp/hello.txt" }
		]);

		expect(read_run_history(app_id)[0].inputs).toEqual([
			{ path: "/tmp/hello.txt", url: "/gradio_api/file=/tmp/hello.txt" }
		]);
	});

	test("updates outputs and completion state", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});

		update_run_history(app_id, id, {
			type: "data",
			endpoint: "/predict",
			fn_index: 0,
			data: ["hello hello"]
		});
		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: false,
			stage: "complete",
			time: new Date("2025-05-16T21:45:00Z")
		});

		expect(read_run_history(app_id)[0]).toMatchObject({
			outputs: ["hello hello"],
			status: "completed",
			completed_at: "2025-05-16T21:45:00.000Z"
		});
	});

	test("records the runtime reported by the server", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});

		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete",
			cache_duration: 1.25,
			time: new Date("2025-05-16T21:45:00Z")
		});

		expect(read_run_history(app_id)[0]).toMatchObject({
			duration_ms: 1250,
			completed_at: "2025-05-16T21:45:00.000Z"
		});
	});

	test("times a streamed run by its elapsed time, not its last chunk", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		const started_at = read_run_history(app_id)[0].started_at;

		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "pending",
			original_msg: "process_starts",
			time: new Date(Date.parse(started_at) + 100)
		});
		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "generating",
			time: new Date(Date.parse(started_at) + 400)
		});
		// A generator reports the duration of its final chunk only, which would
		// make a multi-second run look instantaneous.
		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete",
			cache_duration: 0.001,
			time: new Date(Date.parse(started_at) + 1600)
		});

		expect(read_run_history(app_id)[0]).toMatchObject({
			streamed: true,
			duration_ms: 1500
		});
	});

	test("measures the runtime from when the queue starts the function", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		const started_at = read_run_history(app_id)[0].started_at;

		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "pending",
			original_msg: "process_starts",
			time: new Date(Date.parse(started_at) + 400)
		});
		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete",
			time: new Date(Date.parse(started_at) + 1400)
		});

		// The queue wait is reported separately so it does not inflate the runtime.
		expect(read_run_history(app_id)[0]).toMatchObject({
			queued_ms: 400,
			duration_ms: 1000
		});
	});

	test("falls back to the elapsed time when the server reports none", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		const started_at = read_run_history(app_id)[0].started_at;

		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: false,
			stage: "complete",
			time: new Date(Date.parse(started_at) + 250)
		});

		const run = read_run_history(app_id)[0];
		expect(run.duration_ms).toBe(250);
		expect(run.queued_ms).toBeUndefined();
	});

	test("records failed runs and their error message", () => {
		const id = start_run_history({
			app_id,
			endpoint: 3,
			api_name: "Function 3",
			fn_index: 3,
			inputs: [{ circular: null }]
		});

		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 3,
			queue: true,
			stage: "error",
			message: "generation failed"
		});

		expect(read_run_history(app_id)[0]).toMatchObject({
			status: "failed",
			error: "generation failed"
		});
		expect(read_run_history(app_id)[0].duration_ms).toBeGreaterThanOrEqual(0);
	});

	test("keeps only the newest 100 runs", () => {
		for (let index = 0; index < 105; index++) {
			start_run_history({
				app_id,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: [index]
			});
		}

		const runs = read_run_history(app_id);
		expect(runs).toHaveLength(100);
		expect(runs[0].inputs).toEqual([104]);
		expect(runs.at(-1)?.inputs).toEqual([5]);
	});

	test("deletes an individual run", () => {
		const first = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["first"]
		});
		start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["second"]
		});

		delete_run_history(app_id, first!);

		expect(read_run_history(app_id)).toHaveLength(1);
		expect(read_run_history(app_id)[0].inputs).toEqual(["second"]);
	});

	test("notifies this tab when runs are added, deleted or cleared", () => {
		let notified = 0;
		const unsubscribe = on_run_history_change(() => notified++);

		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		expect(notified).toBe(1);

		// Progress updates are not structural, so they must not notify.
		update_run_history(app_id, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete"
		});
		expect(notified).toBe(1);

		delete_run_history(app_id, id!);
		expect(notified).toBe(2);

		clear_run_history(app_id);
		expect(notified).toBe(3);

		unsubscribe();
		start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["bye"]
		});
		expect(notified).toBe(3);
	});

	test("keeps a separate history per app id", () => {
		start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["mine"]
		});
		start_run_history({
			app_id: other_app,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["theirs"]
		});

		expect(read_run_history(app_id)[0].inputs).toEqual(["mine"]);
		expect(read_run_history(other_app)[0].inputs).toEqual(["theirs"]);
	});

	test("does nothing at all without an app id", () => {
		expect(
			start_run_history({
				app_id: undefined,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: ["hello"]
			})
		).toBeNull();
		expect(read_run_history(undefined)).toEqual([]);
		expect(read_run_history(null)).toEqual([]);
		expect(read_run_history("")).toEqual([]);
	});

	test("drops the histories of app instances that are long gone", () => {
		// Each restart of an app mints a new id, so without pruning the browser
		// would hold every history the app ever had.
		const ids = Array.from({ length: 14 }, (_, index) => `restart-${index}`);
		for (const id of ids) {
			start_run_history({
				app_id: id,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: [id]
			});
		}

		const remaining = ids.filter((id) => read_run_history(id).length > 0);
		expect(remaining.length).toBeLessThanOrEqual(8);
		// The newest instance always survives.
		expect(remaining).toContain(ids.at(-1));

		ids.forEach(clear_run_history);
	});

	test("never throws, whatever it is handed", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		// A value that cannot be serialised, and a storage that rejects writes.
		const set = window.localStorage.setItem;
		window.localStorage.setItem = () => {
			throw new Error("storage is full");
		};
		try {
			expect(() =>
				start_run_history({
					app_id,
					endpoint: "/predict",
					api_name: "/predict",
					fn_index: 0,
					inputs: [circular, BigInt(3), () => "fn"]
				})
			).not.toThrow();
			expect(() => read_run_history(app_id)).not.toThrow();
			expect(() => clear_run_history(app_id)).not.toThrow();
			expect(() => delete_run_history(app_id, "missing")).not.toThrow();
			expect(() =>
				update_run_history(app_id, "missing", {
					type: "status",
					endpoint: "/predict",
					fn_index: 0,
					queue: false,
					stage: "complete"
				})
			).not.toThrow();
			expect(() => update_run_inputs(app_id, "missing", [1])).not.toThrow();
		} finally {
			window.localStorage.setItem = set;
		}
	});

	test("survives a listener that throws", () => {
		let reached = false;
		const unsubscribe = on_run_history_change(() => {
			throw new Error("listener blew up");
		});
		const second = on_run_history_change(() => {
			reached = true;
		});

		expect(() =>
			start_run_history({
				app_id,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: ["hello"]
			})
		).not.toThrow();
		expect(reached).toBe(true);

		unsubscribe();
		second();
	});

	test("stages a run once so it can be loaded on its saved page", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});
		const run = read_run_history(app_id).find((item) => item.id === id)!;

		stage_run_history_replay(app_id, run);

		expect(consume_run_history_replay(app_id)).toEqual(run);
		expect(consume_run_history_replay(app_id)).toBeNull();
	});
});

describe("run history url", () => {
	test("joins the app root and the api prefix", () => {
		expect(run_history_url("http://localhost:7860")).toBe(
			"http://localhost:7860/gradio_api/runs"
		);
		expect(run_history_url("http://localhost:7860/my-app/")).toBe(
			"http://localhost:7860/my-app/gradio_api/runs"
		);
		expect(run_history_url("http://localhost:7860", "/api")).toBe(
			"http://localhost:7860/api/runs"
		);
	});
});

describe.skipIf(in_browser)("run history outside the browser", () => {
	test("is a no-op without storage", () => {
		expect(
			start_run_history({
				app_id,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: ["hello"]
			})
		).toBeNull();
		expect(read_run_history(app_id)).toEqual([]);
		expect(consume_run_history_replay(app_id)).toBeNull();
	});
});

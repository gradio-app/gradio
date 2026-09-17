import { afterEach, describe, expect, test, vi } from "vitest";

import {
	apply_run_history_replay,
	clear_run_history,
	consume_run_history_replay,
	delete_run_history,
	on_run_history_change,
	read_run_history,
	read_run_history_storage,
	run_history_url,
	set_run_history_storage,
	stage_run_history_replay,
	start_run_history,
	update_run_history,
	update_run_inputs
} from "../utils/run_history";

const app_id = "app-under-test";
const other_app = "some-other-app";
const scope = { app_id };
const other_scope = { app_id: other_app };
const replacement_apps = Array.from(
	{ length: 8 },
	(_, index) => `replacement-app-${index}`
);
const in_browser = typeof window !== "undefined";

afterEach(() => {
	set_run_history_storage(scope, { type: "browser" });
	set_run_history_storage(other_scope, { type: "browser" });
	clear_run_history(scope);
	clear_run_history(other_scope);
	for (const replacement_app of replacement_apps) {
		clear_run_history({ app_id: replacement_app });
	}
	vi.useRealTimers();
});

describe.skipIf(!in_browser)("run history", () => {
	test("uses this browser as the default history storage", () => {
		expect(read_run_history_storage(scope)).toEqual({ type: "browser" });
	});

	test("remembers a bucket while switching storage destinations", () => {
		set_run_history_storage(scope, {
			type: "bucket",
			bucket_id: "alice/app-history"
		});
		expect(read_run_history_storage(scope)).toEqual({
			type: "bucket",
			bucket_id: "alice/app-history"
		});

		set_run_history_storage(scope, {
			type: "browser",
			bucket_id: "alice/app-history"
		});
		expect(read_run_history_storage(scope)).toEqual({
			type: "browser",
			bucket_id: "alice/app-history"
		});
	});

	test("does not duplicate bucket runs in local storage", () => {
		set_run_history_storage(scope, {
			type: "bucket",
			bucket_id: "alice/app-history"
		});

		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["hello"]
		});

		expect(id).toBeNull();
		expect(read_run_history(scope)).toEqual([]);
	});

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

		const runs = read_run_history(scope);
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
		expect(read_run_history(other_scope)).toEqual([]);
	});

	test("replaces inputs with their upload-processed values", () => {
		const id = start_run_history({
			app_id,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: [new File(["hello"], "hello.txt")]
		});

		update_run_inputs(scope, id, [
			{ path: "/tmp/hello.txt", url: "/gradio_api/file=/tmp/hello.txt" }
		]);

		expect(read_run_history(scope)[0].inputs).toEqual([
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

		update_run_history(scope, id, {
			type: "data",
			endpoint: "/predict",
			fn_index: 0,
			data: ["hello hello"]
		});
		update_run_history(scope, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: false,
			stage: "complete",
			time: new Date("2025-05-16T21:45:00Z")
		});

		expect(read_run_history(scope)[0]).toMatchObject({
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

		update_run_history(scope, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete",
			cache_duration: 1.25,
			time: new Date("2025-05-16T21:45:00Z")
		});

		expect(read_run_history(scope)[0]).toMatchObject({
			duration_ms: 1250,
			completed_at: "2025-05-16T21:45:00.000Z"
		});
	});

	test("records failed runs and their error message", () => {
		const id = start_run_history({
			app_id,
			endpoint: 3,
			api_name: "Function 3",
			fn_index: 3,
			inputs: [{ circular: null }]
		});

		update_run_history(scope, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 3,
			queue: true,
			stage: "error",
			message: "generation failed"
		});

		expect(read_run_history(scope)[0]).toMatchObject({
			status: "failed",
			error: "generation failed"
		});
		expect(read_run_history(scope)[0].duration_ms).toBeGreaterThanOrEqual(0);
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

		const runs = read_run_history(scope);
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

		delete_run_history(scope, first!);

		expect(read_run_history(scope)).toHaveLength(1);
		expect(read_run_history(scope)[0].inputs).toEqual(["second"]);
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
		update_run_history(scope, id, {
			type: "status",
			endpoint: "/predict",
			fn_index: 0,
			queue: true,
			stage: "complete"
		});
		expect(notified).toBe(1);

		delete_run_history(scope, id!);
		expect(notified).toBe(2);

		clear_run_history(scope);
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

		expect(read_run_history(scope)[0].inputs).toEqual(["mine"]);
		expect(read_run_history(other_scope)[0].inputs).toEqual(["theirs"]);
	});

	test("keeps a separate history per user of the same app", () => {
		const ada = { app_id, username: "ada" };
		const grace = { app_id, username: "grace" };

		start_run_history({
			...ada,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["ada's secret"]
		});

		expect(read_run_history(grace)).toEqual([]);
		expect(read_run_history(scope)).toEqual([]);
		expect(read_run_history(ada)[0].inputs).toEqual(["ada's secret"]);

		clear_run_history(ada);
	});

	test("removes staged replays when pruning an old app", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
		start_run_history({
			app_id: other_app,
			endpoint: "/predict",
			api_name: "/predict",
			fn_index: 0,
			inputs: ["old"]
		});
		stage_run_history_replay(other_scope, read_run_history(other_scope)[0]);

		for (const [index, replacement_app] of replacement_apps.entries()) {
			vi.setSystemTime(new Date(Date.UTC(2025, 0, index + 2)));
			start_run_history({
				app_id: replacement_app,
				endpoint: "/predict",
				api_name: "/predict",
				fn_index: 0,
				inputs: [index]
			});
		}

		expect(read_run_history(other_scope)).toEqual([]);
		expect(consume_run_history_replay(other_scope)).toBeNull();
	});
});

describe.skipIf(!in_browser)("replaying a run", () => {
	function make_config() {
		return {
			app_id,
			components: [
				{ id: 1, type: "textbox", props: { value: "default in" } },
				{ id: 2, type: "state", props: { value: "server side" } },
				{ id: 3, type: "image", props: { value: null } },
				{ id: 4, type: "textbox", props: { value: "default out" } }
			],
			dependencies: [
				{ id: 7, api_name: "transform", inputs: [1, 2], outputs: [3, 4] }
			]
		};
	}

	const stored = {
		id: "run-1",
		endpoint: "/transform",
		api_name: "/transform",
		fn_index: 7,
		page: "/",
		inputs: ["prompt", null],
		outputs: [{ url: "http://localhost/image.webp" }, "described"],
		status: "completed" as const,
		started_at: new Date().toISOString()
	};

	test("writes the saved inputs and outputs back into the config", () => {
		stage_run_history_replay(scope, stored);
		const config = make_config();

		expect(apply_run_history_replay(config)).toBe(true);
		expect(config.components.map((component) => component.props.value)).toEqual(
			["prompt", "server side", stored.outputs[0], "described"]
		);
		expect(apply_run_history_replay(make_config())).toBe(false);
	});

	test("matches the endpoint by api name when the fn index has moved", () => {
		stage_run_history_replay(scope, { ...stored, fn_index: 99 });
		const config = make_config();

		expect(apply_run_history_replay(config)).toBe(true);
		expect(config.components[3].props.value).toBe("described");
	});

	test("leaves the config alone when the endpoint is gone", () => {
		stage_run_history_replay(scope, {
			...stored,
			fn_index: 99,
			api_name: "/removed"
		});
		const config = make_config();

		expect(apply_run_history_replay(config)).toBe(false);
		expect(config.components.map((component) => component.props.value)).toEqual(
			["default in", "server side", null, "default out"]
		);
	});

	test("is a no-op when nothing was staged", () => {
		expect(apply_run_history_replay(make_config())).toBe(false);
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
		expect(read_run_history(scope)).toEqual([]);
		expect(consume_run_history_replay(scope)).toBeNull();
	});
});

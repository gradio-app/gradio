import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";
import { HttpResponse, http } from "msw";

import { Client } from "../client";
import { set_run_history_storage } from "../utils/run_history";
import { direct_space_url } from "./handlers";
import { initialise_server } from "./server";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => {
	server.resetHandlers();
	if (typeof window !== "undefined") {
		set_run_history_storage({ app_id: 123 }, { type: "browser" });
	}
});
afterAll(() => server.stop());

async function race_with_timeout<T>(
	promise: Promise<T>,
	ms: number,
	message: string
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error(message)), ms);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		if (timer !== undefined) clearTimeout(timer);
	}
}

describe("submit iterator", () => {
	test("signs private Space file URLs before publishing data events", async () => {
		const app = await Client.connect("hmb/hello_world", {
			token: "hf_123",
			events: ["data", "status"]
		});
		app.stream_status.open = true;

		const iterator = app.submit("/predict", ["hi"]);
		const event_id = await iterator.wait_for_id();
		const callback = app.event_callbacks[event_id as string];

		const events: any[] = [];
		const consumer = (async () => {
			for await (const event of iterator) events.push(event);
		})();

		await callback({
			msg: "process_completed",
			output: {
				data: [
					{
						path: "/tmp/cat.png",
						url: `${direct_space_url}/gradio_api/file=/tmp/cat.png`,
						meta: { _type: "gradio.FileData" }
					}
				]
			},
			success: true
		});
		await consumer;

		const data_event = events.find((event) => event.type === "data");
		expect(data_event.data[0].url).toBe(
			`${direct_space_url}/gradio_api/file=/tmp/cat.png?__sign=jwt_123`
		);
	});

	test.skipIf(typeof window === "undefined")(
		"sends the selected history bucket with queued submissions",
		async () => {
			const app = await Client.connect("hmb/hello_world");
			const scope = {
				app_id: app.config?.app_id,
				username: app.config?.username
			};
			set_run_history_storage(scope, {
				type: "bucket",
				bucket_id: "alice/app-history"
			});

			let header: string | null = null;
			server.resetHandlers(
				http.post(`${direct_space_url}/queue/join`, ({ request }) => {
					header = request.headers.get("x-gradio-history-bucket");
					return HttpResponse.json({ event_id: "bucket-event" });
				})
			);

			const iterator = app.submit("/predict", ["hi"]);
			await expect(iterator.wait_for_id()).resolves.toBe("bucket-event");
			expect(header).toBe("alice/app-history");
			await iterator.return();
			set_run_history_storage(scope, { type: "browser" });
		}
	);

	test("next() after the iterator is closed resolves to {done: true}", async () => {
		const app = await Client.connect("hmb/hello_world");
		// Avoid opening a real SSE stream — the test does not need one.
		app.stream_status.open = true;

		const iterator = app.submit("/predict", ["hi"]);
		await iterator.return();

		const result = await race_with_timeout(
			iterator.next(),
			1000,
			"next() did not resolve after the iterator was closed"
		);
		expect(result).toEqual({ value: undefined, done: true });
	});

	test("for-await loop terminates when data and complete arrive in the same SSE callback", async () => {
		const app = await Client.connect("hmb/hello_world", {
			events: ["data", "status"]
		});
		app.stream_status.open = true;

		const iterator = app.submit("/predict", ["hi"]);
		const event_id = await iterator.wait_for_id();
		expect(event_id).toBeTruthy();

		const callback = app.event_callbacks[event_id as string];
		expect(callback).toBeDefined();

		const events: { type: string }[] = [];
		const consumer = (async () => {
			for await (const event of iterator) {
				events.push(event as { type: string });
			}
		})();

		// Let the consumer drain the pending status event pushed by submit()
		// and suspend on a fresh next() call, so a resolver is queued before
		// the SSE callback fires.
		await new Promise((r) => setTimeout(r, 0));

		// process_completed in the same tick fires a data event (resolving the
		// pending resolver), a status complete event (queued to values because
		// no resolver is registered at that instant), and then close().
		await callback({
			msg: "process_completed",
			output: { data: ["done"] },
			success: true
		});

		await race_with_timeout(
			consumer,
			1000,
			"submit iterator did not terminate after process_completed"
		);

		const types = events.map((e) => e.type);
		expect(types).toContain("data");
		expect(types).toContain("status");
	});

	test("for-await loop terminates when the server raises an error mid-stream", async () => {
		const app = await Client.connect("hmb/hello_world", {
			events: ["data", "status"]
		});
		app.stream_status.open = true;

		const iterator = app.submit("/predict", ["hi"]);
		const event_id = await iterator.wait_for_id();
		expect(event_id).toBeTruthy();

		const callback = app.event_callbacks[event_id as string];
		expect(callback).toBeDefined();

		const events: { type: string; stage?: string }[] = [];
		const consumer = (async () => {
			for await (const event of iterator) {
				events.push(event as { type: string; stage?: string });
			}
		})();

		await new Promise((r) => setTimeout(r, 0));

		// Stream a partial result first, so the error below genuinely arrives
		// mid-stream rather than as the very first message.
		await callback({
			msg: "process_generating",
			output: { data: ["partial"] },
			success: true
		});

		// A server-side exception then arrives as process_completed with
		// success:false and an `error` field in the output. This must fire an
		// "error" status and terminate the iterator rather than hang the
		// consumer. handle_message() reads title/visible/duration from
		// `output`, so mirror a real payload's shape here.
		await callback({
			msg: "process_completed",
			output: {
				error: "boom mid-stream",
				title: "Error",
				visible: true,
				duration: 0
			},
			success: false
		});

		await race_with_timeout(
			consumer,
			1000,
			"submit iterator did not terminate after a server-side error"
		);

		// The partial result should have been delivered before the error.
		expect(events.some((e) => e.type === "data")).toBe(true);

		const error_event = events.find(
			(e) => e.type === "status" && e.stage === "error"
		);
		expect(error_event).toBeDefined();
	});
});

describe("predict error handling", () => {
	test("predict() rejects its returned promise when the endpoint does not exist, so the error is catchable", async () => {
		const app = await Client.connect("hmb/hello_world");

		await expect(
			race_with_timeout(
				app.predict("nonexistent_endpoint", ["hi"]),
				1000,
				"predict() never settled for an unknown endpoint"
			)
		).rejects.toThrow('No endpoint matching "nonexistent_endpoint" was found');
	});
});

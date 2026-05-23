import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";

import { Client } from "../client";
import { initialise_server } from "./server";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
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
});

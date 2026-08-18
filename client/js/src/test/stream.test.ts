import { vi, type Mock } from "vitest";
import { Client } from "../client";
import { readable_stream } from "../utils/stream";
import { initialise_server } from "./server";
import { direct_space_url } from "./handlers.ts";

import {
	describe,
	it,
	expect,
	afterEach,
	beforeAll,
	afterAll,
	beforeEach
} from "vitest";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("open_stream", () => {
	let app: Client;

	beforeEach(async () => {
		app = await Client.connect("hmb/hello_world");
		app.stream = vi.fn().mockImplementation(() => {
			app.stream_instance = readable_stream(
				new URL(`${direct_space_url}/queue/data`)
			);
			return app.stream_instance;
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should throw an error if config is not defined", async () => {
		app.config = undefined;

		await expect(async () => {
			await app.open_stream();
		}).rejects.toThrow("Could not resolve app config");
	});

	it("should connect to the SSE endpoint and handle messages", async () => {
		await app.open_stream();

		const eventsource_mock_call = (app.stream as Mock).mock.calls[0][0];

		expect(eventsource_mock_call.href).toMatch(
			/https:\/\/hmb-hello-world\.hf\.space\/queue\/data\?session_hash/
		);

		expect(app.stream).toHaveBeenCalledWith(eventsource_mock_call);

		if (!app.stream_instance?.onmessage || !app.stream_instance?.onerror) {
			throw new Error("stream instance is not defined");
		}
		const stream = app.stream_instance;

		const message = { msg: "hello jerry" };

		stream.onmessage({
			data: JSON.stringify(message)
		} as MessageEvent);
		expect(app.stream_status.open).toBe(true);

		expect(app.event_callbacks).toEqual({});
		expect(app.pending_stream_messages).toEqual({});

		const close_stream_message = { msg: "close_stream" };
		stream.onmessage({
			data: JSON.stringify(close_stream_message)
		} as MessageEvent);
		expect(app.stream_status.open).toBe(false);
		expect(app.stream_instance).toBeNull();

		// A stream that has already been closed no longer speaks for the client, so
		// an error arriving late on it must not reopen anything.
		stream.onerror?.({
			data: JSON.stringify("404")
		} as MessageEvent);
		expect(app.stream_status.open).toBe(false);
		expect(app.stream).toHaveBeenCalledTimes(1);
	});

	it("reopens the stream when a job is still outstanding", async () => {
		vi.useFakeTimers();
		vi.spyOn(console, "error").mockImplementation(() => {});
		app.event_callbacks["event-1"] = vi.fn().mockResolvedValue(undefined);
		app.unclosed_events.add("event-1");

		await app.open_stream();
		const stream = app.stream_instance;
		if (!stream?.onerror) {
			throw new Error("stream instance is not defined");
		}

		stream.onerror({ data: JSON.stringify("network error") } as MessageEvent);

		// The job is not lost with the connection, so nothing is told it broke.
		expect(app.stream_status.open).toBe(false);
		expect(app.event_callbacks["event-1"]).not.toHaveBeenCalled();
		expect(app.stream).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(500);
		expect(app.stream).toHaveBeenCalledTimes(2);
		expect(app.stream_status.open).toBe(true);
	});

	it("tells listeners the connection broke when nothing is outstanding", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const callback = vi.fn().mockResolvedValue(undefined);
		app.event_callbacks["event-1"] = callback;

		await app.open_stream();
		const stream = app.stream_instance;
		if (!stream?.onerror) {
			throw new Error("stream instance is not defined");
		}

		await stream.onerror({ data: JSON.stringify("boom") } as MessageEvent);

		expect(callback).toHaveBeenCalledWith(
			expect.objectContaining({ msg: "broken_connection" })
		);
		expect(app.stream).toHaveBeenCalledTimes(1);
	});

	it("reopens a stale stream when the page comes back", async () => {
		app.event_callbacks["event-1"] = vi.fn().mockResolvedValue(undefined);
		app.unclosed_events.add("event-1");

		await app.open_stream();
		app.stream_status.open = false;
		app.stream_instance = null;

		app.resume_stream();
		await vi.waitFor(() => expect(app.stream).toHaveBeenCalledTimes(2));
	});
});

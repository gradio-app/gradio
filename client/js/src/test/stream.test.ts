import { vi } from "vitest";
import { Client } from "../client";
import { initialise_server } from "./server";

import { describe, it, expect, afterEach } from "vitest";
import "./mock_eventsource.ts";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("open_stream", () => {
	let mock_eventsource: any;
	let app: any;

	beforeEach(async () => {
		app = await Client.connect("hmb/hello_world");
		app.stream_factory = vi.fn().mockImplementation(() => {
			mock_eventsource = new EventSource("");
			return mock_eventsource;
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should throw an error if config is not defined", () => {
		app.config = undefined;

		expect(() => {
			app.open_stream();
		}).toThrow("Could not resolve app config");
	});

	it("should connect to the SSE endpoint and handle messages", async () => {
		app.open_stream();

		const eventsource_mock_call = app.stream_factory.mock.calls[0][0];

		expect(eventsource_mock_call.href).toMatch(
			/https:\/\/hmb-hello-world\.hf\.space\/queue\/data\?session_hash/
		);

		expect(app.stream_factory).toHaveBeenCalledWith(eventsource_mock_call);

		const onMessageCallback = mock_eventsource.onmessage;
		const onErrorCallback = mock_eventsource.onerror;

		const message = { msg: "hello jerry" };

		onMessageCallback({ data: JSON.stringify(message) });
		expect(app.stream_status.open).toBe(true);

		expect(app.event_callbacks).toEqual({});
		expect(app.pending_stream_messages).toEqual({});

		const close_stream_message = { msg: "close_stream" };
		onMessageCallback({ data: JSON.stringify(close_stream_message) });
		expect(app.stream_status.open).toBe(false);

		onErrorCallback({ data: JSON.stringify("404") });
		expect(app.stream_status.open).toBe(false);
	});
});

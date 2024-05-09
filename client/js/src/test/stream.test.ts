import { vi, type Mock } from "vitest";
import { Client } from "../client";
import { initialise_server } from "./server";

import {
	describe,
	it,
	expect,
	afterEach,
	beforeAll,
	afterAll,
	beforeEach
} from "vitest";
import "./mock_eventsource.ts";
import NodeEventSource from "eventsource";

const server = initialise_server();
const IS_NODE = process.env.TEST_MODE === "node";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("open_stream", () => {
	let mock_eventsource: any;
	let app: Client;

	beforeEach(async () => {
		app = await Client.connect("hmb/hello_world");
		app.stream = vi.fn().mockImplementation(() => {
			mock_eventsource = IS_NODE
				? new NodeEventSource("")
				: new EventSource("");
			return mock_eventsource;
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should throw an error if config is not defined", () => {
		app.config = undefined;

		expect(async () => {
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

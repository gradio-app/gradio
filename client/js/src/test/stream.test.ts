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

		const message = { msg: "hello jerry" };

		app.stream_instance.onmessage({
			data: JSON.stringify(message)
		} as MessageEvent);
		expect(app.stream_status.open).toBe(true);

		expect(app.event_callbacks).toEqual({});
		expect(app.pending_stream_messages).toEqual({});

		const close_stream_message = { msg: "close_stream" };
		app.stream_instance.onmessage({
			data: JSON.stringify(close_stream_message)
		} as MessageEvent);
		expect(app.stream_status.open).toBe(false);

		app.stream_instance.onerror({
			data: JSON.stringify("404")
		} as MessageEvent);
		expect(app.stream_status.open).toBe(false);
	});

	it.runIf(typeof document !== "undefined")(
		"should process stream messages immediately when the page is hidden",
		async () => {
			await app.open_stream();

			if (!app.stream_instance?.onmessage) {
				throw new Error("stream instance is not defined");
			}

			const callback = vi.fn();
			const message = {
				msg: "process_completed",
				event_id: "hidden-tab-event"
			};
			app.event_callbacks[message.event_id] = callback;
			const visibility_spy = vi
				.spyOn(document, "visibilityState", "get")
				.mockReturnValue("hidden");

			app.stream_instance.onmessage({
				data: JSON.stringify(message)
			} as MessageEvent);

			expect(callback).toHaveBeenCalledWith(message);
			visibility_spy.mockRestore();
		}
	);
});

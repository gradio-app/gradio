import {
	describe,
	beforeAll,
	beforeEach,
	afterEach,
	afterAll,
	test,
	expect
} from "vitest";
import { HttpResponse, http } from "msw";

import { Client } from "../client";
import { CONFIG_URL } from "../constants";
import { direct_space_url } from "./handlers";
import { initialise_server } from "./server";
import { config_response } from "./test_data";

const IN_BROWSER =
	typeof window !== "undefined" && typeof document !== "undefined";

let server: Awaited<ReturnType<typeof initialise_server>>;
let heartbeats: string[] = [];

function serve_config(connect_heartbeat: boolean): void {
	server.use(
		http.get(`${direct_space_url}/${CONFIG_URL}`, () =>
			HttpResponse.json({ ...config_response, connect_heartbeat })
		)
	);
}

async function settle(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 100));
}

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
beforeEach(() => {
	heartbeats = [];
	server.use(
		http.get(`*/heartbeat/*`, ({ request }) => {
			heartbeats.push(request.url);
			return new HttpResponse(new ReadableStream({ start() {} }), {
				headers: { "Content-Type": "text/event-stream" }
			});
		})
	);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("heartbeat", () => {
	test("connects on connect() in a browser, and otherwise waits for a submit", async () => {
		serve_config(true);
		const app = await Client.connect("hmb/hello_world");
		await settle();
		expect(heartbeats).toHaveLength(IN_BROWSER ? 1 : 0);

		app.stream_status.open = true;
		app.submit("/predict", ["hi"]);
		app.submit("/predict", ["hi"]);
		await settle();
		expect(heartbeats).toHaveLength(1);
		expect(heartbeats[0]).toContain(`/heartbeat/${app.session_hash}`);
		app.close();
	});

	test("does not connect when the app does not need it", async () => {
		serve_config(false);
		const app = await Client.connect("hmb/hello_world");
		app.stream_status.open = true;
		app.submit("/predict", ["hi"]);
		await settle();
		expect(heartbeats).toHaveLength(0);
		expect(app.heartbeat_event).toBeNull();
		app.close();
	});

	test("close() stops the heartbeat after another stream has been opened", async () => {
		serve_config(true);
		const app = await Client.connect("hmb/hello_world");
		app.stream_status.open = true;
		app.submit("/predict", ["hi"]);
		const heartbeat_signal = app.heartbeat_controller!.signal;

		app.stream_status.open = false;
		await app.open_stream();
		expect(app.abort_controller).not.toBe(app.heartbeat_controller);

		app.close();
		expect(heartbeat_signal.aborted).toBe(true);
		expect(app.heartbeat_event).toBeNull();
	});
});

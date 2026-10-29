import {
	describe,
	beforeAll,
	afterEach,
	afterAll,
	test,
	expect,
	vi
} from "vitest";
import { HttpResponse, http } from "msw";

import { Client } from "../client";
import { CONFIG_URL } from "../constants";
import { direct_space_url } from "./handlers";
import { initialise_server } from "./server";
import { config_response } from "./test_data";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

const encoder = new TextEncoder();

function event_stream(messages: object[], keep_open = false): HttpResponse {
	const body = new ReadableStream({
		start(controller) {
			for (const message of messages) {
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
				);
			}
			if (!keep_open) controller.close();
		}
	});
	return new HttpResponse(body, {
		headers: { "Content-Type": "text/event-stream" }
	});
}

async function connect_v4(
	options: Parameters<typeof Client.connect>[1] = {}
): Promise<Client> {
	server.use(
		http.get(`${direct_space_url}/${CONFIG_URL}`, () =>
			HttpResponse.json({
				...config_response,
				supported_protocols: ["sse_v3", "sse_v4"],
				browser_streams: "per_event"
			})
		)
	);
	return Client.connect("hmb/hello_world", {
		events: ["data", "status"],
		...options
	});
}

async function collect(iterator: AsyncIterable<any>): Promise<any[]> {
	const events: any[] = [];
	for await (const event of iterator) events.push(event);
	return events;
}

async function within<T>(promise: Promise<T>, message: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error(message)), 5000);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		if (timer !== undefined) clearTimeout(timer);
	}
}

describe("sse_v4: one request per event", () => {
	test("reads the event's messages from the queue/join response", async () => {
		const app = await connect_v4();
		const joins: { accept: string | null; body: any }[] = [];
		let opened_queue_data = false;
		server.use(
			http.post(`${direct_space_url}/queue/join`, async ({ request }) => {
				joins.push({
					accept: request.headers.get("accept"),
					body: await request.json()
				});
				return event_stream([
					{ msg: "estimation", event_id: "ev1", rank: 0, queue_size: 1 },
					{ msg: "process_starts", event_id: "ev1" },
					{
						msg: "process_generating",
						event_id: "ev1",
						success: true,
						output: { data: ["He"], is_generating: true }
					},
					{
						msg: "process_generating",
						event_id: "ev1",
						success: true,
						output: { data: [[["append", [], "llo"]]], is_generating: true }
					},
					{
						msg: "process_completed",
						event_id: "ev1",
						success: true,
						output: { data: ["Hello"], is_generating: false }
					}
				]);
			}),
			http.get(`${direct_space_url}/queue/data`, () => {
				opened_queue_data = true;
				return HttpResponse.error();
			})
		);

		const iterator = app.submit("/predict", ["hi"]);
		const events = await within(collect(iterator), "the event never finished");

		expect(joins).toHaveLength(1);
		expect(joins[0].accept).toBe("text/event-stream");
		expect(joins[0].body.session_hash).toBe(app.session_hash);
		expect(opened_queue_data).toBe(false);
		expect(iterator.event_id()).toBe("ev1");
		expect(
			events.filter((event) => event.type === "data").map((e) => e.data)
		).toEqual([["He"], ["Hello"], ["Hello"]]);
		expect(events.at(-1)).toMatchObject({ type: "status", stage: "complete" });
	});

	test("cancel() aborts the event's request and still asks the server to cancel it", async () => {
		const app = await connect_v4({ with_null_state: true });
		let cancel_calls = 0;
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				event_stream(
					[
						{ msg: "estimation", event_id: "ev2", rank: 0, queue_size: 1 },
						{ msg: "process_starts", event_id: "ev2" }
					],
					true
				)
			),
			http.post(`${direct_space_url}/cancel`, () => {
				cancel_calls += 1;
				return HttpResponse.json({ success: true });
			})
		);

		const iterator = app.submit("/predict", ["hi"]);
		expect(await within(iterator.wait_for_id(), "no event id")).toBe("ev2");
		const consumer = collect(iterator);
		await iterator.cancel();
		const events = await within(consumer, "cancel() did not end the iterator");

		expect(events.slice(-2)).toMatchObject([
			{ type: "data", data: undefined },
			{ type: "status", stage: "complete" }
		]);
		expect(events.some((event) => event.stage === "error")).toBe(false);
		expect(cancel_calls).toBe(1);
		await vi.waitFor(() => expect(app.own_stream_controllers.size).toBe(0));
	});
});

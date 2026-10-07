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
import { CONFIG_URL, QUEUE_FULL_MSG } from "../constants";
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

// A queue/join response in sse_v4: the event's own messages, followed by the
// end of the stream unless `keep_open`.
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
				supported_protocols: ["sse_v3", "sse_v4"]
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
		// The second generation is a diff against the first.
		expect(
			events.filter((event) => event.type === "data").map((e) => e.data)
		).toEqual([["He"], ["Hello"], ["Hello"]]);
		expect(events.at(-1)).toMatchObject({ type: "status", stage: "complete" });
	});

	test("reports a validation error returned before the stream starts", async () => {
		const app = await connect_v4();
		const detail = [{ is_valid: false, message: "too long" }];
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				HttpResponse.json({ detail }, { status: 422 })
			)
		);

		const events = await within(
			collect(app.submit("/predict", ["hi"])),
			"the rejected event never finished"
		);

		expect(events.at(-1)).toMatchObject({
			type: "status",
			stage: "error",
			code: "validation_error",
			message: detail
		});
	});

	test("reports a full queue", async () => {
		const app = await connect_v4();
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				HttpResponse.json({ detail: "Queue is full." }, { status: 503 })
			)
		);

		const events = await within(
			collect(app.submit("/predict", ["hi"])),
			"the rejected event never finished"
		);

		expect(events.at(-1)).toMatchObject({
			type: "status",
			stage: "error",
			message: QUEUE_FULL_MSG
		});
	});

	test("cancel() aborts the event's request and still asks the server to cancel it", async () => {
		// As the Gradio frontend connects.
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

		// The events the completion `/cancel` injects produce under sse_v3.
		expect(events.slice(-2)).toMatchObject([
			{ type: "data", data: undefined },
			{ type: "status", stage: "complete" }
		]);
		expect(events.some((event) => event.stage === "error")).toBe(false);
		// A server that keeps events for pages that resume does not stop one
		// just because its request closed.
		expect(cancel_calls).toBe(1);
		await vi.waitFor(() => expect(app.own_stream_controllers.size).toBe(0));
	});

	test("retries a join the server answers with 409 missing_state", async () => {
		const app = await connect_v4();
		let joins = 0;
		server.use(
			http.post(`${direct_space_url}/queue/join`, () => {
				joins += 1;
				if (joins === 1) {
					return HttpResponse.json(
						{ detail: { missing_state: [2] } },
						{ status: 409 }
					);
				}
				return event_stream([
					{
						msg: "process_completed",
						event_id: "ev7",
						success: true,
						output: { data: ["done"], is_generating: false }
					}
				]);
			})
		);

		const events = await within(
			collect(app.submit("/predict", ["hi"])),
			"the retried event never finished"
		);

		expect(joins).toBe(2);
		expect(events.at(-1)).toMatchObject({ type: "status", stage: "complete" });
	});

	test("with resume_sessions, a dropped stream resumes on the session stream", async () => {
		const app = await connect_v4({ resume_sessions: true });
		let join_url = "";
		let resume_url = "";
		server.use(
			http.post(`${direct_space_url}/queue/join`, ({ request }) => {
				join_url = request.url;
				// The request drops before the event completes
				return event_stream([
					{ msg: "estimation", event_id: "ev6", rank: 0, queue_size: 1 },
					{ msg: "process_starts", event_id: "ev6" }
				]);
			}),
			http.get(`${direct_space_url}/queue/data`, ({ request }) => {
				resume_url = request.url;
				return event_stream([
					{ msg: "process_starts", event_id: "ev6" },
					{
						msg: "process_completed",
						event_id: "ev6",
						success: true,
						output: { data: ["resumed"], is_generating: false }
					},
					{ msg: "close_stream" }
				]);
			})
		);

		const events = await within(
			collect(app.submit("/predict", ["hi"])),
			"the dropped event was not resumed"
		);

		expect(new URL(join_url).searchParams.get("acknowledgements")).toBe("true");
		const resume = new URL(resume_url).searchParams;
		expect(resume.getAll("resume_event_id")).toEqual(["ev6"]);
		expect(resume.get("acknowledgements")).toBe("true");
		expect(events.some((event) => event.broken)).toBe(false);
		expect(
			events.filter((event) => event.type === "data").at(-1)?.data
		).toEqual(["resumed"]);
		expect(events.at(-1)).toMatchObject({ type: "status", stage: "complete" });
		app.close();
	});

	test("reports a stream that ends before the event completes as a broken connection", async () => {
		const app = await connect_v4();
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				event_stream([
					{ msg: "estimation", event_id: "ev3", rank: 0, queue_size: 1 }
				])
			)
		);

		const events = await within(
			collect(app.submit("/predict", ["hi"])),
			"the dropped event never finished"
		);

		expect(events.at(-1)).toMatchObject({
			type: "status",
			stage: "error",
			broken: true
		});
	});

	test("send_chunk() posts to the event id announced on the stream", async () => {
		const app = await connect_v4();
		const stream_paths: string[] = [];
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				event_stream(
					[{ msg: "estimation", event_id: "ev4", rank: 0, queue_size: 1 }],
					true
				)
			),
			http.post(/\/stream\//, ({ request }) => {
				stream_paths.push(new URL(request.url).pathname);
				return HttpResponse.json({ msg: "success" });
			})
		);

		const iterator = app.submit("/predict", ["hi"]);
		iterator.send_chunk({ data: ["chunk"] });

		await vi.waitFor(() => expect(stream_paths).toEqual(["/stream/ev4"]));
		app.close();
	});

	test("Client.close() ends in-flight events without reporting an error", async () => {
		const app = await connect_v4();
		server.use(
			http.post(`${direct_space_url}/queue/join`, () =>
				event_stream(
					[{ msg: "estimation", event_id: "ev5", rank: 0, queue_size: 1 }],
					true
				)
			)
		);

		const iterator = app.submit("/predict", ["hi"]);
		await within(iterator.wait_for_id(), "no event id");
		const consumer = collect(iterator);
		app.close();
		const events = await within(consumer, "close() did not end the iterator");

		expect(events.some((event) => event.stage === "error")).toBe(false);
		expect(app.own_stream_controllers.size).toBe(0);
	});
});

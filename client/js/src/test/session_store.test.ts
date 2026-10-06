import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";
import { HttpResponse, http } from "msw";

import { Client } from "../client";
import { INLINE_STATE_LIMIT, SessionStore } from "../utils/session_store";
import { direct_space_url } from "./handlers";
import { initialise_server } from "./server";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

const big_token = "v1." + "x".repeat(INLINE_STATE_LIMIT + 1);

describe("SessionStore: gr.State", () => {
	test("sends small tokens in full and large ones by reference", () => {
		const store = new SessionStore();
		store.apply({
			"1": { ref: "r1", token: "v1.small" },
			"2": { ref: "r2", token: big_token }
		});
		expect(store.payload([1, 2, 3])).toEqual({
			"1": { token: "v1.small" },
			"2": { ref: "r2" }
		});
		expect(store.payload([2], [2])).toEqual({ "2": { token: big_token } });
		expect(store.payload([3])).toEqual({});
	});

	test("drops an entry when the server sends null", () => {
		const store = new SessionStore();
		store.apply({ "1": { ref: "r1", token: "v1.a" } });
		store.apply({ "1": null });
		expect(store.get(1)).toBeUndefined();
		expect(store.size).toBe(0);
	});

	test("ignores missing or malformed updates", () => {
		const store = new SessionStore();
		store.apply(undefined);
		store.apply({ "1": { ref: "r1" } as any });
		expect(store.size).toBe(0);
	});
});

describe("submit with client-held state", () => {
	test("sends the state, retries with tokens on 409 and keeps new tokens", async () => {
		const app = await Client.connect("hmb/hello_world");
		app.stream_status.open = true;
		app.session_store.apply({ "1": { ref: "r1", token: big_token } });

		const bodies: any[] = [];
		server.use(
			http.post(`${direct_space_url}/queue/join`, async ({ request }) => {
				const body: any = await request.json();
				bodies.push(body);
				if (bodies.length === 1) {
					return HttpResponse.json(
						{ detail: { missing_state: [1] } },
						{ status: 409 }
					);
				}
				return HttpResponse.json({ event_id: "state-event" });
			})
		);

		const iterator = app.submit("/predict", ["hi"]);
		const event_id = await iterator.wait_for_id();
		expect(bodies.map((b) => b.state)).toEqual([
			{ "1": { ref: "r1" } },
			{ "1": { token: big_token } }
		]);

		const consumer = (async () => {
			for await (const _ of iterator) {
				// drain
			}
		})();
		await app.event_callbacks[event_id as string]({
			msg: "process_completed",
			output: {
				data: ["hello"],
				state: { "1": { ref: "r2", token: "v1.new" } }
			},
			success: true
		});
		await consumer;

		expect(app.session_store.get(1)).toEqual({ ref: "r2", token: "v1.new" });
	});

	test("always sends a state object, so the server keeps state in the client", async () => {
		const app = await Client.connect("hmb/hello_world");
		app.stream_status.open = true;
		const bodies: any[] = [];
		server.use(
			http.post(`${direct_space_url}/queue/join`, async ({ request }) => {
				bodies.push(await request.json());
				return HttpResponse.json({ event_id: "no-state-event" });
			})
		);
		const iterator = app.submit("/predict", ["hi"]);
		await iterator.wait_for_id();
		iterator.cancel?.();
		expect(bodies[0].state).toEqual({});
	});
});

describe("SessionStore: component values", () => {
	const components = [
		{ id: 1, type: "textbox", props: { value: "", label: "In" } },
		{ id: 2, type: "dropdown", props: { value: null, choices: [] } },
		{ id: 3, type: "state", props: {} }
	];

	test("keeps the last value and props each component was given", () => {
		const store = new SessionStore();
		store.record(
			[1, 2, 3],
			["first", { __type__: "update", choices: ["a"] }, 7],
			components
		);
		store.record(
			[1, 2],
			["second", { __type__: "update", value: "a" }],
			components
		);
		// An update that changes nothing is not saved
		store.record([1], [{ __type__: "update" }], components);

		const restored = structuredClone(components);
		expect(store.restore_into(restored)).toBe(true);
		expect(restored[0].props).toEqual({ value: "second", label: "In" });
		expect(restored[1].props).toEqual({ value: "a", choices: ["a"] });
		// gr.State travels as tokens instead
		expect(restored[2].props).toEqual({});
	});

	test.skipIf(typeof indexedDB === "undefined")(
		"saves values and state for the session, scoped to the app",
		async () => {
			const store = new SessionStore();
			await store.attach("http://app", "key-1", "session-1");
			store.record([1], ["saved"], components);
			store.apply({ "3": { ref: "r", token: "v1.t" } });
			await store.flush();

			const same = new SessionStore();
			await same.attach("http://app/", "key-1", "session-1");
			expect(same.found).toBe(true);
			expect(same.get(3)?.token).toBe("v1.t");
			const restored = structuredClone(components);
			same.restore_into(restored);
			expect(restored[0].props.value).toBe("saved");

			// Clearing the session deletes what it saved
			await same.forget();
			const cleared = new SessionStore();
			await cleared.attach("http://app", "key-1", "session-1");
			expect(cleared.found).toBe(false);
			expect(same.size).toBe(0);

			for (const [root, app_key, session] of [
				["http://app", "key-2", "session-1"],
				["http://other", "key-1", "session-1"],
				["http://app", "key-1", "session-2"]
			]) {
				const other = new SessionStore();
				await other.attach(root, app_key, session);
				expect(other.found).toBe(false);
				expect(other.size).toBe(0);
			}
		}
	);
});

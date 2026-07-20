import {
	describe,
	beforeAll,
	afterEach,
	afterAll,
	test,
	expect,
	vi
} from "vitest";

import { Client, client, duplicate } from "..";
import {
	transformed_api_info,
	config_response,
	response_api_info
} from "./test_data";
import { initialise_server } from "./server";
import { SPACE_METADATA_ERROR_MSG } from "../constants";
import { track_resumable_event } from "../utils/session";

const app_reference = "hmb/hello_world";
const broken_app_reference = "hmb/bye_world";
const direct_app_reference = "https://hmb-hello-world.hf.space";
const secret_direct_app_reference = "https://hmb-secret-world.hf.space";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("Client class", () => {
	describe("initialisation", () => {
		test("fetch is bound to the Client instance", async () => {
			const test = await Client.connect("hmb/hello_world");
			const fetch_method = test.fetch;
			const res = await fetch_method(direct_app_reference + "/info");

			await expect(res.json()).resolves.toEqual(response_api_info);
		});

		test("stream is bound to the Client instance", async () => {
			const test = await Client.connect("hmb/hello_world");
			const stream_method = test.stream;
			const url = new URL(`${direct_app_reference}/queue/data`);
			const stream = stream_method(url);

			expect(stream).toBeDefined();
			expect(stream.onmessage).toBeDefined();
		});

		test("backwards compatibility of client using deprecated syntax", async () => {
			const app = await client(app_reference);
			expect(app.config).toEqual(config_response);
		});
		test("connecting to a running app with a space reference", async () => {
			const app = await Client.connect(app_reference);
			expect(app.config).toEqual(config_response);
		});

		test("connecting to a running app with a direct app URL", async () => {
			const app = await Client.connect(direct_app_reference);
			expect(app.config).toEqual(config_response);
		});

		test.skipIf(typeof sessionStorage === "undefined")(
			"does not restore a session from a different app",
			async () => {
				track_resumable_event(
					{ ...config_response, app_id: "another-app" },
					"restored-session",
					{ event_id: "event-id", fn_index: 0 }
				);

				const app = await Client.connect(direct_app_reference, {
					resume_sessions: true
				});

				expect(app.session_hash).not.toBe("restored-session");
			}
		);

		test("connecting successfully to a private running app with a space reference", async () => {
			const app = await Client.connect("hmb/secret_world", {
				token: "hf_123"
			});

			expect(app.config).toEqual({
				...config_response,
				root: "https://hmb-secret-world.hf.space"
			});
		});

		test("connecting successfully to a private running app with a direct app URL ", async () => {
			const app = await Client.connect(secret_direct_app_reference, {
				token: "hf_123"
			});

			expect(app.config).toEqual({
				...config_response,
				root: "https://hmb-secret-world.hf.space"
			});
		});

		test("unsuccessfully attempting to connect to a private running app", async () => {
			await expect(
				Client.connect("hmb/secret_world", {
					token: "hf_bad_token"
				})
			).rejects.toThrowError(SPACE_METADATA_ERROR_MSG);
		});

		test("viewing the api info of a running app", async () => {
			const app = await Client.connect(app_reference);
			expect(await app.view_api()).toEqual(transformed_api_info);
		});

		test("viewing the api info of a non-existent app", async () => {
			const app = Client.connect(broken_app_reference);
			await expect(app).rejects.toThrowError();
		});
	});

	describe("resume_jobs", () => {
		test("reattaches each job to its existing queue event", async () => {
			const app = await Client.connect(direct_app_reference);
			app.stream_status.open = true;

			const submissions = app.resume_jobs([
				{ event_id: "event-1", fn_index: 0 },
				{ event_id: "event-2", fn_index: 0 }
			]);

			await expect(submissions[0].wait_for_id()).resolves.toBe("event-1");
			await expect(submissions[1].wait_for_id()).resolves.toBe("event-2");
			expect(app.event_callbacks["event-1"]).toBeDefined();
			expect(app.event_callbacks["event-2"]).toBeDefined();
			expect(app.options.resume_sessions).toBe(true);

			await Promise.all(submissions.map((submission) => submission.return()));
		});
	});

	describe("duplicate", () => {
		test("backwards compatibility of duplicate using deprecated syntax", async () => {
			const app = await duplicate("gradio/hello_world", {
				token: "hf_123",
				private: true,
				hardware: "cpu-basic"
			});

			expect(app.config).toEqual(config_response);
		});

		test("creating a duplicate of a running app", async () => {
			const duplicate = await Client.duplicate("gradio/hello_world", {
				token: "hf_123",
				private: true,
				hardware: "cpu-basic"
			});

			expect(duplicate.config).toEqual(config_response);
		});

		test("creating a duplicate of a running app without a token", async () => {
			const duplicate = Client.duplicate("gradio/hello_world", {
				private: true,
				hardware: "cpu-basic"
			});

			await expect(duplicate).rejects.toThrow("Error: Unauthorized");
		});

		test("creating a duplicate of a broken app", async () => {
			const duplicate = Client.duplicate(broken_app_reference);

			await expect(duplicate).rejects.toThrow(SPACE_METADATA_ERROR_MSG);
		});
	});

	describe("overriding the Client class", () => {
		// TODO: broken test since https://github.com/gradio-app/gradio/pull/10890
		test.skip("overriding methods on the Client class", async () => {
			const mocked_fetch = vi.fn(
				(input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
					return Promise.resolve(
						new Response(JSON.stringify({ data: "test" }))
					);
				}
			);

			class CustomClient extends Client {
				fetch = mocked_fetch;
			}

			await CustomClient.connect("hmb/hello_world");
			expect(mocked_fetch).toHaveBeenCalled();
		});
	});
});

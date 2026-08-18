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
import { SPACE_NOT_FOUND_MSG } from "../constants";
import { http, HttpResponse } from "msw";

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

		test("connecting successfully to a private running app with the deprecated hf_token option", async () => {
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			const app = await Client.connect("hmb/secret_world", {
				hf_token: "hf_123"
			});

			expect(app.config).toEqual({
				...config_response,
				root: "https://hmb-secret-world.hf.space"
			});
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("`hf_token` option has been renamed")
			);
			warn.mockRestore();
		});

		test("unsuccessfully attempting to connect to a private running app", async () => {
			await expect(
				Client.connect("hmb/secret_world", {
					token: "hf_bad_token"
				})
			).rejects.toThrowError(SPACE_NOT_FOUND_MSG("hmb/secret_world", 401));
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

	describe("close", () => {
		test.skipIf(typeof window === "undefined")(
			"reports a deliberate departure to the server",
			async () => {
				const app = await Client.connect(secret_direct_app_reference, {
					token: "hf_123"
				});
				let received_session_hash: string | undefined;
				let received_authorization: string | null = null;
				let resolve_request: () => void = () => {};
				const request_received = new Promise<void>((resolve) => {
					resolve_request = resolve;
				});
				server.resetHandlers(
					http.post(
						`${secret_direct_app_reference}/queue/close`,
						async ({ request }) => {
							const body = (await request.json()) as { session_hash: string };
							received_session_hash = body.session_hash;
							received_authorization = request.headers.get("Authorization");
							resolve_request();
							return HttpResponse.json({ success: true });
						}
					)
				);

				app.close();
				await request_received;

				expect(received_session_hash).toBe(app.session_hash);
				expect(received_authorization).toBe("Bearer hf_123");
			}
		);

		test.skipIf(typeof window === "undefined")(
			"only reports the departure once",
			async () => {
				const app = await Client.connect(direct_app_reference);
				let requests = 0;
				server.resetHandlers(
					http.post(`${direct_app_reference}/queue/close`, () => {
						requests += 1;
						return HttpResponse.json({ success: true });
					})
				);

				app.close();
				app.close();
				await new Promise((resolve) => setTimeout(resolve, 50));

				expect(requests).toBe(1);
			}
		);
	});

	describe("reattach_jobs", () => {
		// Reattaching is a browser affair: the jobs to come back for are remembered in
		// `sessionStorage`, which does not exist outside one.
		test.skipIf(typeof window === "undefined")(
			"collects a job's output from the job's own stream",
			async () => {
				const app = await Client.connect(direct_app_reference, {
					events: ["data", "status"]
				});
				let requested_url = "";
				// Reattaching asks for the job by id, never by session hash: the session it
				// was submitted from keeps its own `gr.State`, and this page has started a
				// new one.
				server.resetHandlers(
					http.get(
						`${direct_app_reference}/queue/event/:event_id`,
						({ request }) => {
							requested_url = new URL(request.url).pathname;
							return new HttpResponse(
								'data: {"msg":"process_completed","event_id":"event-1",' +
									'"output":{"data":["done"]},"success":true}\n\n' +
									'data: {"msg":"close_stream"}\n\n',
								{ headers: { "Content-Type": "text/event-stream" } }
							);
						}
					)
				);

				const submission = app.reattach_jobs([
					{ event_id: "event-1", fn_index: 0 }
				])[0];

				const seen: string[] = [];
				for await (const event of submission) {
					seen.push(event.type);
					if (event.type === "data") {
						expect(event.data).toEqual(["done"]);
					}
					if (event.type === "status" && event.stage === "complete") break;
				}

				expect(requested_url).toBe("/queue/event/event-1");
				expect(seen).toContain("data");
				await submission.return();
			}
		);
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

			await expect(duplicate).rejects.toThrow(
				SPACE_NOT_FOUND_MSG(broken_app_reference, 404)
			);
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

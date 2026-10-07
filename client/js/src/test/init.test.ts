import {
	describe,
	beforeAll,
	beforeEach,
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
import {
	get_resumable_events,
	get_resumable_session_hash,
	set_session_in_use,
	track_resumable_event,
	track_session,
	has_session
} from "../utils/session";
import { HttpResponse, http } from "msw";
import { SessionStore } from "../utils/session_store";

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

		describe.skipIf(typeof sessionStorage === "undefined")(
			"after the page is reloaded",
			() => {
				// A tab only picks its session back up on the app it was using.
				const root =
					typeof location === "undefined"
						? direct_app_reference
						: location.origin;
				const app_config = { ...config_response, root, app_key: "app-v1" };
				let session_requests: (string | null)[];

				// What a page that used `session_hash` saved before it was reloaded
				async function save_session(
					session_hash: string,
					app_key = app_config.app_key
				): Promise<void> {
					const store = new SessionStore();
					await store.attach(root, app_key, session_hash);
					store.record([1], ["hi"], app_config.components);
					store.apply({ "5": { ref: "r", token: "v1.token" } });
					await store.flush();
				}

				beforeEach(() => {
					sessionStorage.clear();
					session_requests = [];
					server.use(
						http.get(`${direct_app_reference}/config`, () =>
							HttpResponse.json(app_config)
						),
						http.get(`${root}/config`, ({ request }) => {
							session_requests.push(
								new URL(request.url).searchParams.get("session_hash")
							);
							return HttpResponse.json(app_config);
						}),
						http.get(`${root}/info`, () =>
							HttpResponse.json(response_api_info)
						),
						// The server still has every session but these two, and can
						// read the gr.State of the first (it shares GRADIO_SECRET_KEY)
						http.get(`${root}/session_status`, ({ request }) => {
							const hash = new URL(request.url).searchParams.get(
								"session_hash"
							);
							return HttpResponse.json({
								known:
									hash !== "server-lost-session" &&
									hash !== "restarted-without-key",
								state_persists: hash !== "restarted-without-key"
							});
						})
					);
				});

				test("starts a new session if the server can read neither the session nor its state", async () => {
					await save_session("restarted-without-key");
					track_session(app_config, "restarted-without-key");
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).not.toBe("restarted-without-key");
					expect(app.session_restored).toBe(false);
					expect(app.session_store.size).toBe(0);
					expect(app.config?.components).toEqual(app_config.components);
					// The new session is the one a later reload picks up
					expect(has_session(app_config, app.session_hash)).toBe(true);
				});

				test("restores the session but reruns load events if the server lost it", async () => {
					await save_session("server-lost-session");
					track_session(app_config, "server-lost-session");
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).toBe("server-lost-session");
					// Load events run again, to set up on the server what it lost
					expect(app.session_restored).toBe(false);
					expect(
						app.config?.components.find(({ id }) => id === 1)?.props.value
					).toBe("hi");
					expect(app.session_store.get(5)?.token).toBe("v1.token");
				});

				test("picks up the session and its outputs from the browser", async () => {
					await save_session("known-session");
					track_session(app_config, "known-session");
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					// Nothing is asked of the server, so this works on any replica
					expect(session_requests.filter(Boolean)).toEqual([]);
					expect(app.session_hash).toBe("known-session");
					expect(app.session_restored).toBe(true);
					expect(
						app.config?.components.find(({ id }) => id === 1)?.props.value
					).toBe("hi");
					expect(app.session_store.get(5)?.token).toBe("v1.token");
				});

				test("still loads a page the session has not shown yet", async () => {
					await save_session("known-session");
					track_session(
						{ ...app_config, current_page: "other" },
						"known-session"
					);
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).toBe("known-session");
					expect(app.session_restored).toBe(false);
					// Its state still carries over
					expect(app.session_store.get(5)?.token).toBe("v1.token");
				});

				test("keeps the session but starts afresh if nothing was saved", async () => {
					track_session(app_config, "unsaved-session");
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).toBe("unsaved-session");
					expect(app.session_restored).toBe(false);
					expect(app.config?.components).toEqual(app_config.components);
				});

				test("ignores what a different version of the app saved", async () => {
					await save_session("old-session", "app-v0");
					track_session({ ...app_config, app_key: "app-v0" }, "old-session");
					set_session_in_use(false);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).not.toBe("old-session");
					expect(app.session_restored).toBe(false);
					expect(app.session_store.size).toBe(0);
				});

				test("starts afresh on every load if the app turned resuming off", async () => {
					await save_session("known-session");
					track_session(app_config, "known-session");
					set_session_in_use(false);
					server.use(
						http.get(`${direct_app_reference}/config`, () =>
							HttpResponse.json({ ...app_config, resume_sessions: false })
						),
						http.get(`${root}/config`, () =>
							HttpResponse.json({ ...app_config, resume_sessions: false })
						)
					);

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).not.toBe("known-session");
					expect(app.session_restored).toBe(false);
					expect(app.session_store.size).toBe(0);
					expect(app.options.resume_sessions).toBe(false);
					expect(get_resumable_session_hash()).toBeNull();
				});

				test("does not share a session with a duplicated tab", async () => {
					// The original tab is still using the session.
					track_session(app_config, "known-session");

					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});

					expect(app.session_hash).not.toBe("known-session");
					expect(app.session_restored).toBe(false);
				});

				test("remembers a new session for the next reload", async () => {
					const app = await Client.connect(direct_app_reference, {
						resume_sessions: true
					});
					expect(get_resumable_session_hash()).toBeNull();

					app.close();
					expect(get_resumable_session_hash()).toBe(app.session_hash);
				});
			}
		);

		test("forwards a page query when resolving config and API info", async () => {
			const requested_urls: string[] = [];
			server.use(
				http.get(`${direct_app_reference}/config`, ({ request }) => {
					requested_urls.push(request.url);
					return HttpResponse.json(config_response);
				}),
				http.get(`${direct_app_reference}/info`, ({ request }) => {
					requested_urls.push(request.url);
					return HttpResponse.json(response_api_info);
				})
			);

			await Client.connect(direct_app_reference, {
				query_params: { page: "details" }
			});

			expect(requested_urls).toEqual([
				`${direct_app_reference}/config?page=details`,
				`${direct_app_reference}/info?page=details`
			]);
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

		test("signs initial file values in a private Space config", async () => {
			const props = config_response.components[0].props;
			props.value = {
				path: "/tmp/cat.png",
				url: `${secret_direct_app_reference}/gradio_api/file=/tmp/cat.png`,
				meta: { _type: "gradio.FileData" }
			};
			try {
				const app = await Client.connect("hmb/secret_world", {
					token: "hf_123"
				});
				const value = app.config?.components[0].props.value as {
					url: string;
				};

				expect(value.url).toBe(
					`${secret_direct_app_reference}/gradio_api/file=/tmp/cat.png?__sign=jwt_123`
				);
			} finally {
				delete props.value;
			}
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

		test.skipIf(typeof sessionStorage === "undefined")(
			"clears a resumable event rejected by the server",
			async () => {
				const app = await Client.connect(direct_app_reference);
				app.stream_status.open = true;
				track_resumable_event(app.config!, app.session_hash, {
					event_id: "expired-event",
					fn_index: 0
				});

				const submission = app.resume_jobs([
					{ event_id: "expired-event", fn_index: 0 }
				])[0];
				await submission.wait_for_id();
				await app.event_callbacks["expired-event"]({
					msg: "unexpected_error",
					event_id: "expired-event",
					message: "Session event not found.",
					session_not_found: true
				});

				expect(get_resumable_events(app.config!, app.session_hash)).toEqual([]);
				await submission.return();
			}
		);

		test.skipIf(typeof window === "undefined")(
			"notifies the server when a resumable client closes",
			async () => {
				const app = await Client.connect(secret_direct_app_reference, {
					token: "hf_123",
					resume_sessions: true
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

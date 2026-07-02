import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";

import { Client, client, duplicate } from "..";
import { view_api } from "../utils/view_api";
import {
	transformed_api_info,
	config_response,
	response_api_info
} from "./test_data";
import { initialise_server } from "./server";

const app_reference = "hmb/hello_world";
const secret_app_reference = "hmb/secret_world";
const secret_direct_app_reference = "https://hmb-secret-world.hf.space";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("view_api", () => {
	test("viewing the api of a running, public app", async () => {
		const app = await Client.connect(app_reference);

		expect(await app.view_api()).toEqual(transformed_api_info);
	});

	test("viewing the api of a running, private app", async () => {
		const app = await Client.connect(secret_app_reference, {
			token: "hf_123"
		});

		expect(app.config).toEqual({
			...config_response,
			root: secret_direct_app_reference
		});

		expect(await app.view_api()).toEqual({
			...transformed_api_info
		});
	});

	test("viewing the api of a running, private app with a direct app URL", async () => {
		const app = await Client.connect(secret_direct_app_reference, {
			token: "hf_123"
		});

		expect(app.config).toEqual({
			...config_response,
			root: secret_direct_app_reference
		});

		expect(await app.view_api()).toEqual({
			...transformed_api_info
		});
	});

	test("requests api info without a Content-Type header and with same-origin credentials, so the cross-origin embed fetch is not blocked by CORS", async () => {
		let captured_init: RequestInit | undefined;
		const fake_client = {
			api_info: null,
			options: {},
			config: { root: "https://hmb-hello-world.hf.space" },
			api_prefix: "",
			api_map: {},
			fetch: (_url: string, init: RequestInit) => {
				captured_init = init;
				return Promise.resolve(
					new Response(JSON.stringify(response_api_info), { status: 200 })
				);
			}
		} as unknown as Client;

		// We only assert on the captured request; swallow any downstream
		// transform error so the test stays focused on the request shape.
		await view_api.call(fake_client).catch(() => {});

		expect(captured_init).toBeDefined();
		const header_names = Object.keys(
			captured_init?.headers as Record<string, string>
		).map((h) => h.toLowerCase());
		expect(header_names).not.toContain("content-type");
		expect(captured_init?.credentials).toBe("same-origin");
	});
});

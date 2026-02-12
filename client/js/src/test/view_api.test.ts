import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";

import { Client, client, duplicate } from "..";
import { transformed_api_info, config_response } from "./test_data";
import { initialise_server } from "./server";

const app_reference = "hmb/hello_world";
const secret_app_reference = "hmb/secret_world";
const secret_direct_app_reference = "https://hmb-secret-world.hf.space";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
});

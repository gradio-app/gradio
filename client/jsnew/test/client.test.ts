import { Client } from "../src/Client.js";
import { test, describe, expect, beforeEach, afterEach } from "vitest";
import fetchMock from "fetch-mock";
import { test_api_info, test_config } from "../test_data.js";
import { CONFIG_URL, HOST_URL } from "../src/constants.js";

describe.only("client", () => {
	beforeEach(() => {
		fetchMock.reset();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	let space_url = "https://huggingface.co/api/spaces/abidlabs/whisper";
	let host = "https://abidlabs-whisper.hf.space";

	describe("view_api", async () => {
		test("view_api()", async () => {
			let endpoint = `https://abidlabs-whisper.hf.space`;

			fetchMock.mock(`${endpoint}/${CONFIG_URL}`, {
				status: 200,
				body: JSON.stringify(test_config)
			});

			fetchMock.mock(`${space_url}/${HOST_URL}`, {
				status: 200,
				body: {
					subdomain: "abidlabs-whisper",
					host
				}
			});

			fetchMock.mock("https://gradio-space-api-fetcher-v2.hf.space/api", {
				status: 200,
				body: JSON.stringify(test_api_info)
			});

			const app = new Client("abidlabs/whisper");

			let api = await app.view_api();

			expect(api.named_endpoints["/predict"].parameters.length).toBe(1);
			expect(api.named_endpoints["/predict"].returns.length).toBe(1);
			expect(api.named_endpoints["/predict"].parameters[0].component).toBe(
				"TextInput"
			);
			expect(api.named_endpoints["/predict"].returns[0].component).toBe(
				"Checkbox"
			);

			expect(api.unnamed_endpoints).toEqual({
				0: {
					type: undefined,
					parameters: [
						{
							label: "TextInput",
							type: "string",
							component: "TextInput",
							description: ""
						}
					],
					returns: [
						{
							label: "Checkbox",
							type: "boolean",
							component: "Checkbox",
							description: ""
						}
					]
				}
			});
		});

		test("view_api with options", async () => {
			const app = new Client("abidlabs/whisper", {
				hf_token: "hf_token",
				status_callback: () => {}
			});
			let api = await app.view_api();

			expect(api.named_endpoints["/predict"].parameters.length).toBe(1);
			expect(api.named_endpoints["/predict"].returns.length).toBe(1);
			expect(api.named_endpoints["/predict"].parameters[0].component).toBe(
				"Audio"
			);
			expect(api.named_endpoints["/predict"].returns[0].component).toBe(
				"Textbox"
			);

			expect(api.unnamed_endpoints).toEqual({});
		});

		test("view_api with invalid hf_token", async () => {
			fetchMock.mock(`${space_url}/${HOST_URL}`, {
				status: 401,
				body: { message: "Unauthorized" }
			});

			fetchMock.mock(`${space_url}/${CONFIG_URL}`, {
				status: 401,
				body: { message: "Unauthorized" }
			});

			const app = new Client("abidlabs/whisper", {
				hf_token: "hf_invalid_token"
			});

			await expect(app.view_api()).rejects.toThrow(
				"Space metadata could not be loaded. Unauthorized"
			);
		});
	});
});

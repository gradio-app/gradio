import { Client } from "../client";
import { post_data } from "../utils/post_data";

import { initialise_server } from "./server";
import { BROKEN_CONNECTION_MSG } from "../constants";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("post_data", () => {
	it("should send a POST request with the correct headers and body", async () => {
		const app = await Client.connect("hmb/hello_world");
		const config = app.config;
		const url = config?.root;
		const body = { data: "test" };

		if (!url) {
			throw new Error("No URL provided");
		}

		const [response, status] = await app.post_data(url, body);

		expect(response).toEqual({});
		expect(status).toBe(200);
	});

	it("should handle network errors", async () => {
		const app = await Client.connect("hmb/secret_world", {
			token: "hf_123"
		});

		const url = "https://hmb-secret-world.hf.space";

		if (!url) {
			throw new Error("No URL provided");
		}

		const [response, status] = await app.post_data(url, {});

		expect(response).toEqual(BROKEN_CONNECTION_MSG);
		expect(status).toBe(500);
	});

	it("honors the credentials client option, so authenticated cross-origin deployments can opt back into cookies", async () => {
		let captured_init: RequestInit | undefined;
		const fake_client = {
			options: { credentials: "include" },
			fetch: (_url: string, init: RequestInit) => {
				captured_init = init;
				return Promise.resolve(new Response("{}", { status: 200 }));
			}
		} as unknown as Client;

		const [, status] = await post_data.call(
			fake_client,
			"https://hmb-hello-world.hf.space/gradio_api/queue/join",
			{ data: "test" }
		);

		expect(status).toBe(200);
		expect(captured_init?.credentials).toBe("include");
	});
});

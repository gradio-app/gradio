import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";

import { Client } from "..";
import { initialise_server } from "./server";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("upload_files", () => {
	it("should upload files successfully", async () => {
		const root_url = "https://hmb-hello-world.hf.space";

		const client = await Client.connect("hmb/hello_world", {
			hf_token: "hf_token"
		});

		const files = [new Blob([], { type: "image/jpeg" })];

		const response = await client.upload_files(root_url, files);

		if (!response.files) {
			throw new Error("No files returned");
		}

		expect(response.files).toHaveLength(1);
		expect(response.files[0]).toBe("lion.jpg");
	});

	it.skip("should handle a server error when connected to a running app and uploading files", async () => {
		const client = await Client.connect("hmb/server_test");

		const root_url = "https://hmb-server-test.hf.space";
		const files = [new Blob([""], { type: "text/plain" })];

		await expect(client.upload_files(root_url, files)).rejects.toThrow(
			"Connection errored out. Failed to fetch"
		);
	});
});

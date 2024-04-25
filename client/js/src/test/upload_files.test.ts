import { describe, it, expect, afterEach } from "vitest";

import { Client } from "..";
import { BROKEN_CONNECTION_MSG } from "../constants";
import { initialise_server } from "./server";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const image_path = join(__dirname, "..", "test", "lion.jpg");

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

		const files = [
			new Blob([readFileSync(image_path)], { type: "image/jpeg" })
		];

		const response = await client.upload_files(root_url, files);

		if (!response.files) {
			throw new Error("No files returned");
		}

		expect(response.files).toHaveLength(1);
		expect(response.files[0]).toBe("lion.jpg");
	});

	it("should handle a server error", async () => {
		const root_url = "https://hmb-server-error.hf.space";

		const client = await Client.connect("hmb/server_error");
		const files = [new Blob([""], { type: "text/plain" })];

		const response = await client.upload_files(root_url, files);

		expect(response).toEqual({ error: BROKEN_CONNECTION_MSG });
	});
});

import { describe, expect, it, vi } from "vitest";

import type { Client } from "../client";
import { FileData, upload } from "../upload";

describe("upload", () => {
	it("encodes uploaded file paths in file URLs", async () => {
		const path = "/tmp/computer%20vision#Huggy.png";
		const client = {
			api_prefix: "/gradio_api",
			upload_files: vi.fn().mockResolvedValue({ files: [path] })
		} as unknown as Client;
		const input = new FileData({
			path,
			blob: new File([], "computer%20vision#Huggy.png")
		});

		const result = await upload.call(client, [input], "https://example.com");

		expect(result?.[0]).toMatchObject({
			path,
			url: "https://example.com/gradio_api/file=/tmp/computer%2520vision%23Huggy.png"
		});
	});
});

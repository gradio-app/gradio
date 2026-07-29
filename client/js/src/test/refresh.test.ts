import { describe, expect, test, vi } from "vitest";
import { Client } from "../client";
import type { Config } from "../types";

describe("Client.refresh", () => {
	test("refreshes from the app root without stripping the current page again", async () => {
		const client = new Client("https://example.test/app/page");
		client.config = {
			root: "https://example.test/app",
			dependencies: []
		} as unknown as Config;

		const refreshed_config = {
			root: "https://example.test/app",
			api_prefix: "/gradio_api",
			dependencies: [{ id: 4, api_name: "generate" }]
		} as unknown as Config;
		const resolve_config = vi.fn().mockResolvedValue(refreshed_config);
		Reflect.set(client, "resolve_config", resolve_config);
		client.view_api = vi.fn().mockResolvedValue({});
		client.get_url_config = vi.fn().mockReturnValue(refreshed_config);

		await client.refresh();

		expect(resolve_config).toHaveBeenCalledWith(
			"https://example.test/app",
			false
		);
		expect(client.api_map).toEqual({ generate: 4 });
	});
});

import { describe, expect, test } from "vitest";
import { get_api_url } from "./init.svelte";

describe("get_api_url", () => {
	test("preserves the current browser origin for same-host mounted apps", () => {
		const url = get_api_url(
			{
				root: "https://machine.local/gradio",
				api_prefix: "/gradio_api"
			} as any,
			"https://machine.local:20080/gradio"
		);

		expect(url).toBe("https://machine.local:20080/gradio/gradio_api");
	});

	test("keeps remote app API URLs on the configured backend origin", () => {
		const url = get_api_url(
			{
				root: "https://remote.example/gradio",
				api_prefix: "/gradio_api"
			} as any,
			"https://host.example/page"
		);

		expect(url).toBe("https://remote.example/gradio/gradio_api");
	});
});

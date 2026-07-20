import { afterEach, describe, expect, test, vi } from "vitest";

import type { ComponentData } from "./utils";

const component = (overrides: Partial<ComponentData> = {}): ComponentData => ({
	id: "owner/gradio_map",
	name: "gradio_map",
	template: "Fallback",
	author: "owner",
	description: "Display geographic data",
	tags: "maps,visualization",
	version: "1.0.0",
	subdomain: "owner-gradio-map",
	background_color: "",
	likes: 10,
	...overrides
});

describe.sequential("custom component gallery data", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("uses the primary gallery API when it is available", async () => {
		const primary_components = [component()];
		const fetch_mock = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify(primary_components), { status: 200 })
			);
		vi.stubGlobal("fetch", fetch_mock);
		const { get_components } = await import("./utils");

		await expect(get_components()).resolves.toEqual(primary_components);
		expect(fetch_mock).toHaveBeenCalledTimes(1);
		expect(fetch_mock).toHaveBeenCalledWith(
			"https://gradio-custom-component-gallery-backend.hf.space/components?name_or_tags="
		);
	});

	test("returns an empty gallery when both data sources fail", async () => {
		const fetch_mock = vi
			.fn()
			.mockResolvedValue(new Response("Unavailable", { status: 503 }));
		vi.stubGlobal("fetch", fetch_mock);
		const { get_components } = await import("./utils");

		await expect(get_components()).resolves.toEqual([]);
	});

	test("falls back to cached backup data and preserves search", async () => {
		const backup_components = [
			component(),
			component({
				id: "owner/gradio_audio",
				name: "gradio_audio",
				description: "Audio editor",
				tags: "sound"
			})
		];
		const fetch_mock = vi
			.fn()
			.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify(backup_components), { status: 200 })
			)
			.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));
		vi.stubGlobal("fetch", fetch_mock);
		const { get_components } = await import("./utils");

		await expect(get_components(["GEO"])).resolves.toEqual([
			backup_components[0]
		]);
		await expect(get_components(["missing", " SOUND "])).resolves.toEqual([
			backup_components[1]
		]);
		expect(fetch_mock).toHaveBeenCalledTimes(3);
		expect(fetch_mock).toHaveBeenNthCalledWith(
			2,
			"https://huggingface.co/datasets/gradio/custom-component-gallery-backups/resolve/main/backup.json"
		);
	});
});

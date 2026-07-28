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

const backupPage = (rows: ComponentData[], total: number) =>
	new Response(
		JSON.stringify({
			rows: rows.map((row) => ({ row })),
			num_rows_total: total
		}),
		{ status: 200 }
	);

describe.sequential("custom component gallery data", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	test("uses the primary gallery API when it is available", async () => {
		const primaryComponents = [component()];
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify(primaryComponents), { status: 200 })
			);
		vi.stubGlobal("fetch", fetchMock);
		const { getComponents } = await import("./utils");

		await expect(getComponents()).resolves.toEqual(primaryComponents);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://gradio-custom-component-gallery-backend.hf.space/components?name_or_tags="
		);
	});

	test("returns an empty gallery when both data sources fail", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("Unavailable", { status: 503 }));
		vi.stubGlobal("fetch", fetchMock);
		const { getComponents } = await import("./utils");

		await expect(getComponents()).resolves.toEqual([]);
	});

	test("loads every backup page once and preserves search", async () => {
		const map = component();
		const audio = component({
			id: "owner/gradio_audio",
			name: "gradio_audio",
			description: "Audio editor",
			tags: "sound"
		});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
			.mockResolvedValueOnce(backupPage([map], 2))
			.mockResolvedValueOnce(backupPage([audio], 2))
			.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));
		vi.stubGlobal("fetch", fetchMock);
		const { getComponents } = await import("./utils");

		await expect(getComponents()).resolves.toEqual([map, audio]);
		await expect(getComponents([" SOUND "])).resolves.toEqual([audio]);
		expect(fetchMock).toHaveBeenCalledTimes(4);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"https://datasets-server.huggingface.co/rows?dataset=gradio/custom-component-gallery-backups&config=default&split=train&offset=0&length=100"
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			3,
			"https://datasets-server.huggingface.co/rows?dataset=gradio/custom-component-gallery-backups&config=default&split=train&offset=1&length=100"
		);
	});
});

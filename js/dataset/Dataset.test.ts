import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import Dataset from "./Index.svelte";
import DatasetRootExample from "./DatasetRootExample.svelte";

describe("Dataset", () => {
	afterEach(() => cleanup());

	test("forwards the shared root to example components", async () => {
		const result = await render(Dataset, {
			components: [{ name: "textbox", class_id: "textbox" }],
			component_props: [{}],
			headers: ["Example"],
			samples: [["sample"]],
			sample_labels: null,
			value: null,
			root: "/gradio-root",
			proxy_url: null,
			samples_per_page: 10,
			layout: "gallery",
			show_label: false,
			load_component: () => ({
				component: Promise.resolve({ default: DatasetRootExample }),
				runtime: false
			})
		});

		await waitFor(() => {
			expect(result.getByTestId("dataset-root")).toHaveTextContent(
				"/gradio-root"
			);
		});
	});
});

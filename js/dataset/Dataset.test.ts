import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Dataset from "./Index.svelte";
import DatasetRootExample from "./DatasetRootExample.svelte";

const table_props = {
	components: [
		{ name: "textbox", class_id: "textbox" },
		{ name: "textbox", class_id: "textbox" }
	],
	component_props: [{}, {}],
	headers: ["Name", "Field"],
	samples: [
		["Ada", "Math"],
		["Grace", "Compilers"]
	],
	sample_labels: null,
	value: null,
	root: "",
	proxy_url: null,
	samples_per_page: 10,
	layout: "table" as const,
	show_label: true,
	load_component: () => ({
		component: Promise.resolve({ default: DatasetRootExample }),
		runtime: false as const
	})
};

run_shared_prop_tests({
	component: Dataset,
	name: "Dataset",
	base_props: table_props,
	has_label: false,
	has_validation_error: false
});

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

	test("puts one tab stop on a cell instead of the whole grid", async () => {
		const before = document.createElement("button");
		let after: HTMLButtonElement | undefined;
		before.textContent = "Before Dataset";
		document.body.appendChild(before);

		try {
			const result = await render(Dataset, table_props);
			after = document.createElement("button");
			after.textContent = "After Dataset";
			document.body.appendChild(after);

			const cells = await waitFor(() => result.getAllByRole("gridcell"));
			const grid = result.getByRole("grid");

			expect(grid).not.toHaveAttribute("tabindex");
			expect(grid).toHaveAttribute("aria-rowcount", "3");
			expect(grid).toHaveAttribute("aria-colcount", "2");
			expect(cells[0]).toHaveAttribute("tabindex", "0");
			cells
				.slice(1)
				.forEach((cell) => expect(cell).toHaveAttribute("tabindex", "-1"));

			before.focus();
			await event.tab();
			expect(cells[0]).toHaveFocus();

			await event.tab();
			expect(after).toHaveFocus();
		} finally {
			before.remove();
			after?.remove();
		}
	});

	test("moves cell focus with arrow keys and activates rows from the keyboard", async () => {
		const { getAllByRole, listen } = await render(Dataset, table_props);
		const cells = await waitFor(() => getAllByRole("gridcell"));
		const select = listen("select");

		cells[0].focus();
		await event.keyboard("{ArrowRight}");
		expect(cells[1]).toHaveFocus();

		await event.keyboard("{ArrowDown}");
		expect(cells[3]).toHaveFocus();

		await event.keyboard("{Control>}{Home}{/Control}");
		expect(cells[0]).toHaveFocus();

		await event.keyboard(" ");
		expect(select).toHaveBeenCalledWith({
			index: 0,
			value: ["Ada", "Math"]
		});
		expect(cells[0].closest("tr")).toHaveAttribute("aria-selected", "true");
	});
});

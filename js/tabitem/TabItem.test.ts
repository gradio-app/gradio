import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import TabItemHarness from "./TabItemHarness.svelte";

describe("TabItem", () => {
	afterEach(() => cleanup());

	test("renders its slot content inside a tabpanel", async () => {
		const { getByRole, getByTestId } = await render(TabItemHarness, {
			tab_selected: "t1"
		});

		expect(getByRole("tabpanel", { hidden: true })).toBeInTheDocument();
		expect(getByTestId("tab-content")).toHaveTextContent("tab panel content");
	});

	test("content is visible when this tab is the selected tab", async () => {
		const { getByTestId } = await render(TabItemHarness, {
			tab_selected: "t1"
		});

		expect(getByTestId("tab-content")).toBeVisible();
	});

	test("content is hidden when a different tab is selected", async () => {
		const { getByTestId } = await render(TabItemHarness, {
			tab_selected: "t2"
		});

		expect(getByTestId("tab-content")).not.toBeVisible();
	});

	test("content stays hidden when visible is false even if selected", async () => {
		const { getByTestId } = await render(TabItemHarness, {
			tab_selected: "t1",
			tab_visible: false
		});

		expect(getByTestId("tab-content")).not.toBeVisible();
	});
});

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("fires when this tab is the active index on mount", async () => {
		const on_tab_select = vi.fn();

		await render(TabItemHarness, {
			tab_selected: "t1",
			tab_selected_index: 0,
			on_tab_select
		});

		await waitFor(() => {
			expect(on_tab_select).toHaveBeenCalledWith({
				value: "First Tab",
				index: 0
			});
		});
	});

	test("does not fire when this tab is not the active index", async () => {
		const on_tab_select = vi.fn();

		await render(TabItemHarness, {
			tab_selected: "t2",
			tab_selected_index: 1,
			on_tab_select
		});

		expect(on_tab_select).not.toHaveBeenCalled();
	});
});

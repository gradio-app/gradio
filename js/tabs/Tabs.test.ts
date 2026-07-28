import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";
import type { Tab } from "./shared/Tabs.svelte";

import Tabs from "./Index.svelte";
import TabsWithChild from "./WithChild.svelte";

const make_tab = (over: Partial<Tab>): Tab => ({
	label: "Tab",
	id: "t1",
	elem_id: undefined,
	visible: true,
	interactive: true,
	scale: null,
	component_id: 1,
	...over
});

const tabs: Tab[] = [
	make_tab({ label: "First", id: "t1", component_id: 1 }),
	make_tab({ label: "Second", id: "t2", component_id: 2 }),
	make_tab({ label: "Third", id: "t3", component_id: 3 })
];

const default_props = {
	initial_tabs: tabs,
	selected: "t1",
	name: "tabs" as const,
	visible: true
};

run_shared_prop_tests({
	component: Tabs,
	name: "Tabs",
	base_props: { initial_tabs: tabs, selected: "t1", name: "tabs" },
	has_label: false,
	has_validation_error: false,
	has_block_wrapper: false,
	visible_false_hides: true
});

describe("Tabs", () => {
	afterEach(() => cleanup());

	test("renders a tab button for each visible tab", async () => {
		const { getByRole } = await render(Tabs, default_props);

		expect(getByRole("tab", { name: "First" })).toBeInTheDocument();
		expect(getByRole("tab", { name: "Second" })).toBeInTheDocument();
		expect(getByRole("tab", { name: "Third" })).toBeInTheDocument();
	});

	test("does not render a button for a tab with visible: false", async () => {
		const { queryByRole } = await render(Tabs, {
			...default_props,
			initial_tabs: [
				make_tab({ label: "Shown", id: "t1", component_id: 1 }),
				make_tab({ label: "Gone", id: "t2", visible: false, component_id: 2 })
			]
		});

		expect(queryByRole("tab", { name: "Gone" })).toBeNull();
		expect(queryByRole("tab", { name: "Shown" })).toBeInTheDocument();
	});

	test("the selected tab is marked aria-selected", async () => {
		const { getByRole } = await render(Tabs, {
			...default_props,
			selected: "t2"
		});

		expect(getByRole("tab", { name: "Second" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(getByRole("tab", { name: "First" })).toHaveAttribute(
			"aria-selected",
			"false"
		);
	});
});

describe("Accessibility", () => {
	afterEach(() => cleanup());

	test("keyboard focus skips the hidden tab measurement buttons", async () => {
		const { getByRole } = await render(Tabs, default_props);

		await event.tab();

		expect(getByRole("tab", { name: "First" })).toHaveFocus();
	});

	test("the tab overflow button has an accessible name", async () => {
		const many_tabs = Array.from({ length: 20 }, (_, index) =>
			make_tab({
				label: `Long tab label ${index + 1}`,
				id: `t${index + 1}`,
				component_id: index + 1
			})
		);
		const { getByRole } = await render(Tabs, {
			...default_props,
			initial_tabs: many_tabs
		});

		await waitFor(() => {
			expect(getByRole("button", { name: "More tabs" })).toBeVisible();
		});
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("a non-interactive tab is disabled", async () => {
		const { getByRole } = await render(Tabs, {
			...default_props,
			initial_tabs: [
				make_tab({ label: "Active", id: "t1", component_id: 1 }),
				make_tab({
					label: "Locked",
					id: "t2",
					interactive: false,
					component_id: 2
				})
			]
		});

		expect(getByRole("tab", { name: "Locked" })).toBeDisabled();
		expect(getByRole("tab", { name: "Active" })).toBeEnabled();
	});
});

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("clicking a tab dispatches select with its details", async () => {
		const { listen, getByRole } = await render(Tabs, default_props);

		const select = listen("select");

		await fireEvent.click(getByRole("tab", { name: "Second" }));

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({
			value: "Second",
			index: 1,
			id: "t2",
			component_id: 2
		});
	});

	test("clicking the already-selected tab does not dispatch select", async () => {
		const { listen, getByRole } = await render(Tabs, default_props);

		const select = listen("select");

		await fireEvent.click(getByRole("tab", { name: "First" }));

		expect(select).not.toHaveBeenCalled();
	});

	test("clicking a disabled tab does not make it the selected tab", async () => {
		const { listen, get_data, getByRole } = await render(Tabs, {
			...default_props,
			selected: "t1",
			initial_tabs: [
				make_tab({ label: "Active", id: "t1", component_id: 1 }),
				make_tab({
					label: "Locked",
					id: "t2",
					interactive: false,
					component_id: 2
				})
			]
		});

		const change = listen("change");

		await fireEvent.click(getByRole("tab", { name: "Locked" }));

		expect(change).not.toHaveBeenCalled();
		expect(getByRole("tab", { name: "Locked" })).toHaveAttribute(
			"aria-selected",
			"false"
		);
		expect((await get_data()).selected).toBe("t1");
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("clicking a different tab dispatches change once", async () => {
		const { listen, getByRole } = await render(Tabs, default_props);

		const change = listen("change");

		await fireEvent.click(getByRole("tab", { name: "Third" }));

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("clicking the already-selected tab does not dispatch change", async () => {
		const { listen, getByRole } = await render(Tabs, default_props);

		const change = listen("change");

		await fireEvent.click(getByRole("tab", { name: "First" }));

		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: gradio_tab_select", () => {
	afterEach(() => cleanup());

	test("fires when the selected tab changes via set_data", async () => {
		const { listen, set_data } = await render(Tabs, default_props);

		const gradio_tab_select = listen("gradio_tab_select");

		await set_data({ selected: "t3" });

		expect(gradio_tab_select).toHaveBeenCalledTimes(1);
		expect(gradio_tab_select).toHaveBeenCalledWith({
			value: "Third",
			index: 2,
			id: "t3",
			component_id: 3
		});
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the initial selection", async () => {
		const { get_data } = await render(Tabs, default_props);

		const data = await get_data();
		expect(data.selected).toBe("t1");
	});

	test("clicking a tab updates the selection returned by get_data", async () => {
		const { get_data, getByRole } = await render(Tabs, default_props);

		await fireEvent.click(getByRole("tab", { name: "Second" }));

		const data = await get_data();
		expect(data.selected).toBe("t2");
	});

	test("set_data updates which tab is marked aria-selected", async () => {
		const { set_data, getByRole } = await render(Tabs, default_props);

		await set_data({ selected: "t3" });

		expect(getByRole("tab", { name: "Third" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	test("set_data then get_data round-trips the selection", async () => {
		const { set_data, get_data } = await render(Tabs, default_props);

		await set_data({ selected: "t2" });

		const data = await get_data();
		expect(data.selected).toBe("t2");
	});

	test("keeps 0 as an explicit tab id", async () => {
		const { get_data, getByRole } = await render(Tabs, {
			...default_props,
			selected: 0,
			initial_tabs: [
				make_tab({ label: "First", id: "first", component_id: 1 }),
				make_tab({ label: "Zero", id: 0, component_id: 2 })
			]
		});

		expect(getByRole("tab", { name: "Zero" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect((await get_data()).selected).toBe(0);
	});

	test("keeps an empty string as an explicit tab id", async () => {
		const { get_data, getByRole } = await render(Tabs, {
			...default_props,
			selected: "",
			initial_tabs: [
				make_tab({ label: "First", id: "first", component_id: 1 }),
				make_tab({ label: "Empty", id: "", component_id: 2 })
			]
		});

		expect(getByRole("tab", { name: "Empty" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect((await get_data()).selected).toBe("");
	});
});

describe("Children / slot", () => {
	afterEach(() => cleanup());

	test("renders slot children inside the tabs container", async () => {
		const { getByTestId } = await render(TabsWithChild, default_props);

		expect(getByTestId("slot-content")).toBeVisible();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("no select or change events fire on initial mount", async () => {
		const { listen } = await render(Tabs, default_props);

		const select = listen("select", { retrospective: true });
		const change = listen("change", { retrospective: true });

		expect(select).not.toHaveBeenCalled();
		expect(change).not.toHaveBeenCalled();
	});
});

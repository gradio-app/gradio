import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";

import Sidebar from "./Index.svelte";

// Sidebar requires both `visible` and `open` to be passed explicitly:
// - Index.svelte uses {#if gradio.shared.visible}, so omitting visible leaves
//   gradio.shared.visible=undefined (falsy) and the sidebar never mounts.
// - bind:open={gradio.props.open} passing undefined into a $bindable prop
//   triggers a Svelte props_invalid_value error.

describe("Sidebar", () => {
	afterEach(() => cleanup());

	test("renders the sidebar container", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		// No semantic role or label on the sidebar container itself —
		// querySelector(".sidebar") is the appropriate query here.
		expect(container.querySelector(".sidebar")).not.toBeNull();
	});

	test("renders the toggle button with an accessible label", async () => {
		const { getByRole } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		expect(getByRole("button", { name: "Toggle Sidebar" })).not.toBeNull();
	});

	test("elem_id is applied to the sidebar div", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left",
			elem_id: "my-sidebar"
		});
		expect(container.querySelector("#my-sidebar")).not.toBeNull();
	});

	test("elem_classes are applied to the sidebar div", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left",
			elem_classes: ["my-sidebar-class"]
		});
		expect(container.querySelector(".my-sidebar-class")).not.toBeNull();
	});

	test("visible: true → sidebar is in the DOM", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left",
			elem_id: "sb-visible"
		});
		expect(container.querySelector("#sb-visible")).not.toBeNull();
	});

	test("visible: false → sidebar is removed from the DOM", async () => {
		// {#if gradio.shared.visible} removes the component when false.
		const { container } = await render(Sidebar, {
			width: 320,
			visible: false,
			open: false,
			position: "left",
			elem_id: "sb-gone"
		});
		expect(container.querySelector("#sb-gone")).toBeNull();
	});

	test("visible: 'hidden' → sidebar is in the DOM (truthy string, not hidden)", async () => {
		// {#if gradio.shared.visible} — "hidden" is a truthy string so the sidebar
		// renders. There is no CSS hiding applied for this case.
		const { container } = await render(Sidebar, {
			width: 320,
			visible: "hidden",
			open: false,
			position: "left",
			elem_id: "sb-str-hidden"
		});
		expect(container.querySelector("#sb-str-hidden")).not.toBeNull();
	});
});

describe("Props: open / position", () => {
	afterEach(() => cleanup());

	test("open: true → get_data reports sidebar is open", async () => {
		const { get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: true,
			position: "left"
		});
		expect((await get_data()).open).toBe(true);
	});

	test("open: false → get_data reports sidebar is closed", async () => {
		const { get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		expect((await get_data()).open).toBe(false);
	});

	test("position: 'right' applies .right class to the sidebar div", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "right",
			elem_id: "sb-right"
		});
		// .right is the mechanism by which right-side positioning is applied
		// (toggle button moves to the left, transform direction inverts) —
		// no semantic alternative exists.
		expect(container.querySelector("#sb-right.right")).not.toBeNull();
	});

	test("position: 'left' (default) does not apply .right class", async () => {
		const { container } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left",
			elem_id: "sb-left"
		});
		expect(container.querySelector("#sb-left.right")).toBeNull();
	});
});

describe("Toggle button", () => {
	afterEach(() => cleanup());

	test("clicking when closed fires expand event", async () => {
		const { getByRole, listen } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		const expand = listen("expand");
		await fireEvent.click(getByRole("button", { name: "Toggle Sidebar" }));
		expect(expand).toHaveBeenCalledTimes(1);
	});

	test("clicking when open fires collapse event", async () => {
		// Use set_data to open the sidebar first so the double-tick settles _open.
		const { getByRole, listen, set_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		await set_data({ open: true });
		const collapse = listen("collapse");
		await fireEvent.click(getByRole("button", { name: "Toggle Sidebar" }));
		expect(collapse).toHaveBeenCalledTimes(1);
	});

	test("clicking twice fires expand then collapse in order", async () => {
		const { getByRole, listen } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		const expand = listen("expand");
		const collapse = listen("collapse");
		const button = getByRole("button", { name: "Toggle Sidebar" });

		await fireEvent.click(button); // closed → open
		expect(expand).toHaveBeenCalledTimes(1);
		expect(collapse).toHaveBeenCalledTimes(0);

		await fireEvent.click(button); // open → closed
		expect(expand).toHaveBeenCalledTimes(1);
		expect(collapse).toHaveBeenCalledTimes(1);
	});

	test("no expand or collapse events fire on mount", async () => {
		const { listen } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: true,
			position: "left"
		});
		// retrospective: true replays any events buffered during render
		const expand = listen("expand", { retrospective: true });
		const collapse = listen("collapse", { retrospective: true });
		expect(expand).not.toHaveBeenCalled();
		expect(collapse).not.toHaveBeenCalled();
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current open state", async () => {
		const { get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		expect((await get_data()).open).toBe(false);
	});

	test("set_data({ open: true }) → get_data reports open", async () => {
		const { set_data, get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		await set_data({ open: true });
		expect((await get_data()).open).toBe(true);
	});

	test("set_data({ open: false }) → get_data reports closed", async () => {
		const { set_data, get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: true,
			position: "left"
		});
		await set_data({ open: false });
		expect((await get_data()).open).toBe(false);
	});

	test("set_data does not fire expand or collapse (events only come from user click)", async () => {
		// Unlike Accordion (which has a $effect that dispatches events when open
		// changes), Sidebar only fires events from the toggle button's onclick handler.
		const { listen, set_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		const expand = listen("expand");
		const collapse = listen("collapse");

		await set_data({ open: true });
		expect(expand).not.toHaveBeenCalled();
		expect(collapse).not.toHaveBeenCalled();

		await set_data({ open: false });
		expect(expand).not.toHaveBeenCalled();
		expect(collapse).not.toHaveBeenCalled();
	});

	test("round-trip: set_data then get_data preserves open state", async () => {
		const { set_data, get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		await set_data({ open: true });
		expect((await get_data()).open).toBe(true);
		await set_data({ open: false });
		expect((await get_data()).open).toBe(false);
	});

	test("clicking updates get_data open state", async () => {
		const { getByRole, get_data } = await render(Sidebar, {
			width: 320,
			visible: true,
			open: false,
			position: "left"
		});
		await fireEvent.click(getByRole("button", { name: "Toggle Sidebar" }));
		expect((await get_data()).open).toBe(true);
	});
});

test.todo(
	"VISUAL: open=true slides the sidebar into view via CSS transform translateX(100%) for left, translateX(-100%) for right — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: position='right' places the sidebar at the right edge and moves the toggle button to the left side — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: width prop controls the sidebar container width (default 320px) — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: open sidebar adjusts parent .wrap padding via --overlap-amount CSS variable to prevent content overlap — needs Playwright visual regression screenshot comparison"
);

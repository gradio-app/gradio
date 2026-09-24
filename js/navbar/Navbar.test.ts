import { test, describe, afterEach, beforeEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { get } from "svelte/store";
import { navbar_config } from "@gradio/core/navbar_store";

import Navbar from "./Index.svelte";

const default_props = {
	value: [
		["Main", ""],
		["Settings", "settings"]
	] as [string, string][],
	main_page_name: "Home",
	visible: true,
	// Navbar's template calls elem_classes.join() unguarded, and the app always
	// serialises it, so every render supplies it.
	elem_classes: [] as string[]
};

beforeEach(() => navbar_config.set(null));

run_shared_prop_tests({
	component: Navbar,
	name: "Navbar",
	base_props: default_props,
	// Navbar is configuration-only: it renders a permanently hidden div and
	// never a label, a Block wrapper, or validation error text.
	has_label: false,
	has_validation_error: false,
	has_block_wrapper: false,
	visible_false_hides: true
});

describe("Navbar", () => {
	afterEach(() => cleanup());

	test("renders no visible UI of its own", async () => {
		const { container } = await render(Navbar, {
			...default_props,
			elem_id: "navbar-root"
		});

		const root = container.querySelector("#navbar-root");
		expect(root).toBeInTheDocument();
		expect(root).not.toBeVisible();
		expect(container).not.toHaveTextContent("Settings");
	});

	test("publishes its configuration to the navbar store on mount", async () => {
		await render(Navbar, default_props);

		expect(get(navbar_config)).toEqual({
			visible: true,
			main_page_name: "Home",
			value: [
				["Main", ""],
				["Settings", "settings"]
			]
		});
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("extra pages are published to the store in order", async () => {
		await render(Navbar, {
			...default_props,
			value: [
				["Dashboard", "dashboard"],
				["About", "https://twitter.com/abidlabs"]
			]
		});

		expect(get(navbar_config)?.value).toEqual([
			["Dashboard", "dashboard"],
			["About", "https://twitter.com/abidlabs"]
		]);
	});

	test("a null value is published unchanged", async () => {
		await render(Navbar, { ...default_props, value: null });

		expect(get(navbar_config)?.value).toBeNull();
	});

	test("an empty list is published unchanged", async () => {
		await render(Navbar, { ...default_props, value: [] });

		expect(get(navbar_config)?.value).toEqual([]);
	});
});

describe("Props: main_page_name", () => {
	afterEach(() => cleanup());

	test("a custom name is published to the store", async () => {
		await render(Navbar, { ...default_props, main_page_name: "Dashboard" });

		expect(get(navbar_config)?.main_page_name).toBe("Dashboard");
	});

	test("false is preserved so the main page can be dropped from the navbar", async () => {
		await render(Navbar, { ...default_props, main_page_name: false });

		expect(get(navbar_config)?.main_page_name).toBe(false);
	});

	test("null falls back to 'Home'", async () => {
		await render(Navbar, { ...default_props, main_page_name: null });

		expect(get(navbar_config)?.main_page_name).toBe("Home");
	});

	test("an omitted name falls back to 'Home'", async () => {
		await render(Navbar, { value: null, visible: true, elem_classes: [] });

		expect(get(navbar_config)?.main_page_name).toBe("Home");
	});
});

describe("Props: visible", () => {
	afterEach(() => cleanup());

	test("visible: true is published as true", async () => {
		await render(Navbar, { ...default_props, visible: true });

		expect(get(navbar_config)?.visible).toBe(true);
	});

	test("visible: false is published as false", async () => {
		await render(Navbar, { ...default_props, visible: false });

		expect(get(navbar_config)?.visible).toBe(false);
	});

	test("visible: 'hidden' is collapsed to false for the navbar", async () => {
		await render(Navbar, { ...default_props, visible: "hidden" });

		expect(get(navbar_config)?.visible).toBe(false);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the current value and main_page_name", async () => {
		const { get_data } = await render(Navbar, default_props);

		expect(await get_data()).toMatchObject({
			value: [
				["Main", ""],
				["Settings", "settings"]
			],
			main_page_name: "Home"
		});
	});

	test("set_data updates the store with new pages", async () => {
		const { set_data } = await render(Navbar, default_props);

		await set_data({
			value: [
				["Reports", "reports"],
				["Admin", "admin"]
			]
		});

		expect(get(navbar_config)?.value).toEqual([
			["Reports", "reports"],
			["Admin", "admin"]
		]);
	});

	test("set_data updates the store with a new main_page_name", async () => {
		const { set_data } = await render(Navbar, default_props);

		await set_data({ main_page_name: "Admin Panel" });

		expect(get(navbar_config)?.main_page_name).toBe("Admin Panel");
	});

	test("set_data hiding the navbar is published to the store", async () => {
		const { set_data } = await render(Navbar, default_props);
		expect(get(navbar_config)?.visible).toBe(true);

		await set_data({ visible: false });

		expect(get(navbar_config)?.visible).toBe(false);
	});

	test("set_data round-trips through get_data", async () => {
		const { set_data, get_data } = await render(Navbar, default_props);

		await set_data({ value: [["Only", "only"]], main_page_name: false });

		expect(await get_data()).toMatchObject({
			value: [["Only", "only"]],
			main_page_name: false
		});
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("does not dispatch change on mount", async () => {
		const { listen } = await render(Navbar, default_props);
		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("a remounted navbar replaces the configuration left by the previous one", async () => {
		const first = await render(Navbar, {
			...default_props,
			main_page_name: "First",
			value: null
		});
		expect(get(navbar_config)?.main_page_name).toBe("First");

		first.unmount();
		await render(Navbar, {
			...default_props,
			main_page_name: "Second",
			value: [["Users", "users"]]
		});

		expect(get(navbar_config)).toEqual({
			visible: true,
			main_page_name: "Second",
			value: [["Users", "users"]]
		});
	});

	test("the last navbar to mount wins when a page declares more than one", async () => {
		await render(Navbar, { ...default_props, main_page_name: "First" });
		await render(Navbar, { ...default_props, main_page_name: "Second" });

		expect(get(navbar_config)?.main_page_name).toBe("Second");
	});
});

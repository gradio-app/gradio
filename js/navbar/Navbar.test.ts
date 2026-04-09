import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import { setupi18n } from "../core/src/i18n";
import { get } from "svelte/store";
import { navbar_config } from "@gradio/core/navbar_store";

import Navbar from "./Index.svelte";

beforeEach(() => {
	setupi18n();
	cleanup();
	navbar_config.set(null);
});

afterEach(cleanup);

const baseProps = {
	visible: true,
	main_page_name: "Home",
	elem_classes: [] as string[],
	value: null as [string, string][] | null,
};

describe("Navbar Component", () => {
	test("initializes the navbar store with custom props", async () => {
		await render(Navbar, {
			...baseProps,
			main_page_name: "Dashboard",
			value: [
				["Main", ""],
				["Settings", "settings"],
			],
		});

		expect(get(navbar_config)).toMatchObject({
			visible: true,
			main_page_name: "Dashboard",
			value: [
				["Main", ""],
				["Settings", "settings"],
			],
		});
	});

	test("setting elem_id and elem_classes applies to the navbar", async () => {
		const { container } = await render(Navbar, {
			...baseProps,
			elem_id: "test-navbar",
			elem_classes: ["custom-class"],
		});

		const navbarDiv = container.querySelector("#test-navbar");
		expect(navbarDiv?.classList.contains("custom-class")).toBe(true);
	});

	test("navbar store updates when props change", async () => {
		const { unmount } = await render(Navbar, baseProps);

		expect(get(navbar_config)).toMatchObject({
			visible: true,
			main_page_name: "Home",
			value: null,
		});

		unmount();
		await render(Navbar, {
			...baseProps,
			visible: false,
			main_page_name: "Admin Panel",
			value: [
				["Dashboard", ""],
				["Users", "users"],
			],
		});

		expect(get(navbar_config)).toMatchObject({
			visible: false,
			main_page_name: "Admin Panel",
			value: [
				["Dashboard", ""],
				["Users", "users"],
			],
		});
	});

	test("main_page_name can be set to false", async () => {
		await render(Navbar, {
			...baseProps,
			main_page_name: false,
		});

		expect(get(navbar_config)?.main_page_name).toBe(false);
	});
});

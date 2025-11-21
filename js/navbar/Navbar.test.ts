import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { cleanup, render } from "@self/tootils";
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

describe("Navbar Component", () => {
	test("initializes the navbar store with custom props", async () => {
		await render(Navbar, {
			visible: true,
			main_page_name: "Dashboard",
			elem_classes: [],
			value: [
				["Main", ""],
				["Settings", "settings"]
			]
		});

		const store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.main_page_name, "Dashboard");
		assert.deepEqual(store_value?.value, [
			["Main", ""],
			["Settings", "settings"]
		]);
	});

	test("setting elem_id and elem_classes applies to the navbar", async () => {
		const { container } = await render(Navbar, {
			visible: true,
			main_page_name: "Home",
			elem_id: "test-navbar",
			elem_classes: ["custom-class"]
		});

		const navbar_div = container.querySelector("#test-navbar");
		assert.isTrue(navbar_div?.classList.contains("custom-class"));
	});

	test("navbar store updates when props change", async () => {
		const { unmount } = await render(Navbar, {
			visible: true,
			main_page_name: "Home",
			elem_classes: [],
			value: null
		});

		let store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.main_page_name, "Home");
		assert.equal(store_value?.value, null);

		unmount();
		await render(Navbar, {
			visible: false,
			main_page_name: "Admin Panel",
			elem_classes: [],
			value: [
				["Dashboard", ""],
				["Users", "users"]
			]
		});

		store_value = get(navbar_config);
		assert.equal(store_value?.visible, false);
		assert.equal(store_value?.main_page_name, "Admin Panel");
		assert.deepEqual(store_value?.value, [
			["Dashboard", ""],
			["Users", "users"]
		]);
	});

	test("main_page_name can be set to false", async () => {
		await render(Navbar, {
			visible: true,
			main_page_name: false,
			elem_classes: [],
			value: null
		});

		const store_value = get(navbar_config);
		assert.equal(store_value?.main_page_name, false);
	});
});

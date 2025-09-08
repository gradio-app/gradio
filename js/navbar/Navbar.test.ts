import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { cleanup, render } from "@self/tootils";
import { setupi18n } from "../core/src/i18n";
import { get } from "svelte/store";
import { navbar_config } from "@gradio/core/navbar_store";

import Navbar from "./Index.svelte";

beforeEach(() => {
	setupi18n();
	navbar_config.set(null);
});

afterEach(cleanup);

describe("Navbar Component", () => {
	test("initializes the navbar store with custom props", async () => {
		const { component } = await render(Navbar, {
			visible: true,
			main_page_name: "Dashboard",
			value: [
				["", "Main"],
				["settings", "Settings"]
			]
		});

		const store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.main_page_name, "Dashboard");
		assert.deepEqual(store_value?.value, [
			["", "Main"],
			["settings", "Settings"]
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
		const { component } = await render(Navbar, {
			visible: true,
			main_page_name: "Home",
			value: null
		});

		let store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.main_page_name, "Home");
		assert.equal(store_value?.value, null);

		component.visible = false;
		component.main_page_name = "Admin Panel";
		component.value = [
			["", "Dashboard"],
			["users", "Users"]
		];

		store_value = get(navbar_config);
		assert.equal(store_value?.visible, false);
		assert.equal(store_value?.main_page_name, "Admin Panel");
		assert.deepEqual(store_value?.value, [
			["", "Dashboard"],
			["users", "Users"]
		]);
	});

	test("main_page_name can be set to false", async () => {
		const { component } = await render(Navbar, {
			visible: true,
			main_page_name: false,
			value: null
		});

		const store_value = get(navbar_config);
		assert.equal(store_value?.main_page_name, false);
	});
});

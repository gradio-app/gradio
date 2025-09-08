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
			home_page_title: "Dashboard"
		});

		const store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.home_page_title, "Dashboard");
	});

	test("setting elem_id and elem_classes applies to the navbar", async () => {
		const { container } = await render(Navbar, {
			visible: true,
			home_page_title: "Home",
			elem_id: "test-navbar",
			elem_classes: ["custom-class"]
		});

		const navbar_div = container.querySelector("#test-navbar");
		assert.isTrue(navbar_div?.classList.contains("custom-class"));
	});

	test("navbar store updates when props change", async () => {
		const { component } = await render(Navbar, {
			visible: true,
			home_page_title: "Home"
		});

		let store_value = get(navbar_config);
		assert.equal(store_value?.visible, true);
		assert.equal(store_value?.home_page_title, "Home");
		component.visible = false;
		component.home_page_title = "Admin Panel";

		store_value = get(navbar_config);
		assert.equal(store_value?.visible, false);
		assert.equal(store_value?.home_page_title, "Admin Panel");
	});
});

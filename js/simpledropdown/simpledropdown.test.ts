import { test, describe, expect, afterEach, beforeAll } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";
import { setupi18n } from "../core/src/i18n";
import { formatter } from "../core/src/gradio_helper";

import SimpleDropdown from "./Index.svelte";

// Build a real i18n marker the way the backend's I18nData does.
const marker = (key: string): string =>
	`__i18n__${JSON.stringify({ __type__: "translation_metadata", key })}`;

const default_props = {
	label: "Simple Dropdown",
	show_label: true,
	value: "apple",
	choices: [
		["Apple", "apple"],
		["Banana", "banana"],
		["Cherry", "cherry"]
	] as [string, string | number][],
	interactive: true
};

describe("SimpleDropdown", () => {
	afterEach(() => cleanup());

	test("renders all choices as options", async () => {
		const { container } = await render(SimpleDropdown, default_props);

		const options = container.querySelectorAll("option");
		const labels = Array.from(options).map((o) => o.textContent?.trim());
		expect(labels).toEqual(["Apple", "Banana", "Cherry"]);
	});

	test("selecting an option updates the internal value", async () => {
		const { container, get_data } = await render(SimpleDropdown, default_props);

		const select = container.querySelector("select") as HTMLSelectElement;
		await event.selectOptions(select, "Banana");

		const data = await get_data();
		expect(data.value).toBe("banana");
	});
});

describe("SimpleDropdown: i18n choices", () => {
	beforeAll(async () => {
		await setupi18n();
	});
	afterEach(() => cleanup());

	const i18n_choices: [string, string][] = [
		[marker("common.clear"), "bold"],
		[marker("common.remove"), "italic"]
	];

	test("translates option display names through the i18n formatter", async () => {
		const { container } = await render(SimpleDropdown, {
			...default_props,
			i18n: formatter,
			choices: i18n_choices,
			value: "bold"
		});

		const options = container.querySelectorAll("option");
		const labels = Array.from(options).map((o) => o.textContent?.trim());
		expect(labels).toEqual(["Clear", "Remove"]);
	});

	test("selecting a translated option maps back to the internal value", async () => {
		const { container, get_data } = await render(SimpleDropdown, {
			...default_props,
			i18n: formatter,
			choices: i18n_choices,
			value: "bold"
		});

		const select = container.querySelector("select") as HTMLSelectElement;
		await event.selectOptions(select, "Remove");

		const data = await get_data();
		expect(data.value).toBe("italic");
	});
});

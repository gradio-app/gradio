import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@self/tootils";
import event from "@testing-library/user-event";
import { setupi18n } from "../core/src/i18n";

import Dropdown from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

describe("Dropdown", () => {
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});
	beforeEach(() => {
		setupi18n();
	});
	test("renders provided value", async () => {
		const { getByLabelText } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: null,
			value: "choice",
			label: "Dropdown",
			choices: [
				["choice", "choice"],
				["choice2", "choice2"]
			],
			filterable: false,
			interactive: false
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		assert.equal(item.value, "choice");
	});

	test("selecting the textbox should show the options", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "choice",
			label: "Dropdown",
			choices: [
				["choice", "choice"],
				["name2", "choice2"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();

		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(2);
		expect(options[0]).toContainHTML("choice");
		expect(options[1]).toContainHTML("name2");
	});

	test("editing the textbox value should trigger the type event and filter the options", async () => {
		const { getByLabelText, listen, getAllByTestId } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "",
			label: "Dropdown",
			choices: [
				["apple", "apple"],
				["zebra", "zebra"]
			],
			filterable: true,
			interactive: true
		});

		const key_up_event = listen("key_up");

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(2);

		item.value = "";
		await event.keyboard("z");

		const options_new = getAllByTestId("dropdown-option");

		await expect(options_new).toHaveLength(1);
		await expect(options[0]).toContainHTML("zebra");
		await assert.equal(key_up_event.callCount, 1);
	});

	test("blurring the textbox should cancel the filter", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "default",
			label: "Dropdown",
			max_choices: undefined,
			choices: [
				["default", "default"],
				["other", "other"]
			],
			filterable: false,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		item.focus();
		await event.keyboard("other");
	});

	test("blurring the textbox should save the input value", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "new ",
			label: "Dropdown",
			max_choices: undefined,
			allow_custom_value: true,
			choices: [
				["dwight", "dwight"],
				["michael", "michael"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		const change_event = listen("change");

		item.focus();
		await event.keyboard("kevin");
		await item.blur();

		assert.equal(item.value, "new kevin");
		assert.equal(change_event.callCount, 1);
	});

	test("focusing the label should toggle the options", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "default",
			label: "Dropdown",
			choices: [
				["default", "default"],
				["other", "other"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		const blur_event = listen("blur");
		const focus_event = listen("focus");

		item.focus();
		item.blur();

		assert.equal(blur_event.callCount, 1);
		assert.equal(focus_event.callCount, 1);
	});

	test("deselecting and reselcting a filtered dropdown should show all options again", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "",
			label: "Dropdown",
			choices: [
				["apple", "apple"],
				["zebra", "zebra"],
				["pony", "pony"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		item.focus();
		item.value = "";
		await event.keyboard("z");
		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(1);

		await item.blur();
		// Mock 100ms delay between interactions.
		await item.focus();
		const options_new = getAllByTestId("dropdown-option");

		expect(options_new).toHaveLength(3);
	});

	test("passing in a new set of identical choices when the dropdown is open should not filter the dropdown", async () => {
		const { getByLabelText, getAllByTestId, component } = await render(
			Dropdown,
			{
				show_label: true,
				loading_status,
				value: "",
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true,
				interactive: true
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();

		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(3);

		component.$set({
			value: "",
			choices: [
				["apple", "apple"],
				["zebra", "zebra"],
				["pony", "pony"]
			]
		});

		item.focus();

		const options_new = getAllByTestId("dropdown-option");
		expect(options_new).toHaveLength(3);
	});

	test("setting a custom value when allow_custom_choice is false should revert to the first valid choice", async () => {
		const { getByLabelText, getAllByTestId, component } = await render(
			Dropdown,
			{
				show_label: true,
				loading_status,
				value: "apple",
				allow_custom_value: false,
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true,
				interactive: true
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		await event.keyboard("pie");
		expect(item.value).toBe("applepie");
		await item.blur();
		expect(item.value).toBe("apple");
	});

	test("setting a custom value when allow_custom_choice is true should keep the value", async () => {
		const { getByLabelText, getAllByTestId, component } = await render(
			Dropdown,
			{
				show_label: true,
				loading_status,
				value: "apple",
				allow_custom_value: true,
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true,
				interactive: true
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		await event.keyboard("pie");
		expect(item.value).toBe("applepie");
		await item.blur();
		expect(item.value).toBe("applepie");
	});

	test("setting a value should update the displayed value and selected indices", async () => {
		const { getByLabelText, getAllByTestId, component } = await render(
			Dropdown,
			{
				show_label: true,
				loading_status,
				value: "apple",
				allow_custom_value: false,
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true,
				interactive: true
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		expect(item.value).toBe("apple");
		await item.focus();
		let options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveClass("selected");

		await component.$set({ value: "zebra" });
		expect(item.value).toBe("zebra");
		options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveClass("selected");

		await component.$set({ value: undefined });
		expect(item.value).toBe("");
		options = getAllByTestId("dropdown-option");
		expect(options[0]).not.toHaveClass("selected");

		await component.$set({ value: "zebra" });
		expect(item.value).toBe("zebra");
		options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveClass("selected");
	});

	test("blurring a dropdown should set the input text to the previously selected value", async () => {
		const { getByLabelText, getAllByTestId, component } = await render(
			Dropdown,
			{
				show_label: true,
				loading_status,
				value: "apple_internal_value",
				allow_custom_value: false,
				label: "Dropdown",
				choices: [
					["apple", "apple_internal_value"],
					["zebra", "zebra_internal_value"],
					["pony", "pony_internal_value"]
				],
				filterable: true,
				interactive: true
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		expect(item.value).toBe("apple");
		await item.focus();
		let options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveClass("selected");
		await item.blur();
		expect(item.value).toBe("apple");

		await item.focus();
		await event.keyboard("z");
		expect(item.value).toBe("applez");
		await item.blur();
		expect(item.value).toBe("apple");
	});

	test("updating choices should keep the dropdown focus-able and change the value appropriately if custom values are not allowed", async () => {
		const { getByLabelText, component } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "apple_internal_value",
			allow_custom_value: false,
			label: "Dropdown",
			choices: [
				["apple_choice", "apple_internal_value"],
				["zebra_choice", "zebra_internal_value"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await expect(item.value).toBe("apple_choice");

		component.$set({
			choices: [
				["apple_new_choice", "apple_internal_value"],
				["zebra_new_choice", "zebra_internal_value"]
			]
		});

		await item.focus();
		await item.blur();
		await expect(item.value).toBe("apple_new_choice");
	});

	test("updating choices should not reset the value if custom values are allowed", async () => {
		const { getByLabelText, component } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "apple_internal_value",
			allow_custom_value: true,
			label: "Dropdown",
			choices: [
				["apple_choice", "apple_internal_value"],
				["zebra_choice", "zebra_internal_value"]
			],
			filterable: true,
			interactive: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await expect(item.value).toBe("apple_choice");

		component.$set({
			choices: [
				["apple_new_choice", "apple_internal_value"],
				["zebra_new_choice", "zebra_internal_value"]
			]
		});

		await expect(item.value).toBe("apple_choice");
	});

	test("ensure dropdown can have the first item of the choices as a default value", async () => {
		const { getByLabelText } = await render(Dropdown, {
			show_label: true,
			loading_status,
			allow_custom_value: false,
			value: "apple_internal_value",
			label: "Dropdown",
			choices: [
				["apple_choice", "apple_internal_value"],
				["zebra_choice", "zebra_internal_value"]
			],
			filterable: true,
			interactive: true
		});
		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		await expect(item.value).toBe("apple_choice");
	});

	test("ensure dropdown works when initial value is undefined and allow_custom_value is true", async () => {
		const { getByLabelText } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: undefined,
			allow_custom_value: true,
			label: "Dropdown",
			choices: [
				["apple_choice", "apple_internal_value"],
				["zebra_choice", "zebra_internal_value"]
			],
			filterable: true,
			interactive: true
		});
		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		await expect(item.value).toBe("");
	});
});

import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";
import event from "@testing-library/user-event";
import { setupi18n } from "../app/src/i18n";

import Dropdown from "./interactive";
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
			filterable: false
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
			filterable: true
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

	test("editing the textbox value should filter the options", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "",
			label: "Dropdown",
			choices: [
				["apple", "apple"],
				["zebra", "zebra"]
			],
			filterable: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(2);

		item.value = "";
		await event.keyboard("z");
		const options_new = getAllByTestId("dropdown-option");

		expect(options_new).toHaveLength(1);
		expect(options[0]).toContainHTML("zebra");
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
			filterable: false
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		const change_event = listen("change");
		const select_event = listen("select");

		item.focus();
		await event.keyboard("other");
	});

	test("blurring the textbox should save the input value", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			show_label: true,
			loading_status,
			value: "default",
			label: "Dropdown",
			max_choices: undefined,
			allow_custom_value: true,
			choices: [
				["dwight", "dwight"],
				["michael", "michael"]
			],
			filterable: true
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		const change_event = listen("change");

		item.focus();
		await event.keyboard("kevin");
		await item.blur();

		assert.equal(item.value, "kevin");
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
			filterable: true
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
		vi.useFakeTimers();
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
			filterable: true
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
		vi.runAllTimers();
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
				filterable: true
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
				value: "",
				allow_custom_value: false,
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true
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
				value: "",
				allow_custom_value: true,
				label: "Dropdown",
				choices: [
					["apple", "apple"],
					["zebra", "zebra"],
					["pony", "pony"]
				],
				filterable: true
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
});

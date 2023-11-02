import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";
import event from "@testing-library/user-event";
import { setupi18n } from "../app/src/i18n";

import CheckboxGroup from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";
import exp from "constants";
import { list } from "postcss";

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

beforeEach(() => {
	setupi18n();
});

afterEach(cleanup);

describe("Values", () => {
	test("renders correct value when passed as string: single value", async () => {
		const { getByLabelText, debug } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: ["choice_one"],
			label: "Dropdown",
			choices: [
				["Choice One", "choice_one"],
				["Choice Two", "choice_two"]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
	});

	test("renders correct value when passed as string: multiple values", async () => {
		const { getByLabelText, debug } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: ["choice_one", "choice_three"],
			label: "Dropdown",
			choices: [
				["Choice One", "choice_one"],
				["Choice Two", "choice_two"],
				["Choice Three", "choice_three"]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;
		assert.equal(item_one.checked, true);
		assert.equal(item_two.checked, false);
		assert.equal(item_three.checked, true);

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();
	});

	test("renders correct value when passed as number: single value", async () => {
		const { getByLabelText, debug } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: [1],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
	});

	test("renders correct value when passed as number: multiple values", async () => {
		const { getByLabelText, debug } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: [1, 3],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();
	});

	test("component value and rendered value should be in sync", async () => {
		const { getByLabelText, debug, component } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: [1, 3],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();

		expect(component.value).toEqual([1, 3]);
	});

	test("changing the component value should update the checkboxes", async () => {
		const { getByLabelText, debug, component } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();

		component.value = [1, 3];

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();
	});

	test("setting a value that does not exist should do nothing", async () => {
		const { getByLabelText, debug, component } = await render(CheckboxGroup, {
			show_label: true,
			loading_status,
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			],
			interactive: true
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();

		component.value = ["choice_one"];

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();
	});
});

describe("Events", () => {
	test("changing the value via the UI should emit an event", async () => {
		const { getByLabelText, debug, component, listen } = await render(
			CheckboxGroup,
			{
				show_label: true,
				loading_status,
				value: [],
				label: "Dropdown",
				choices: [
					["Choice One", 1],
					["Choice Two", 2],
					["Choice Three", 3]
				],
				interactive: true
			}
		);

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();

		const mock = listen("change");

		await event.click(item_one);
		expect(mock.callCount).toBe(1);

		await event.click(item_three);
		expect(mock.callCount).toBe(2);
	});

	test("changing the value from outside should emit a change event", async () => {
		const { getByLabelText, debug, component, listen } = await render(
			CheckboxGroup,
			{
				show_label: true,
				loading_status,
				value: [],
				label: "Dropdown",
				choices: [
					["Choice One", 1],
					["Choice Two", 2],
					["Choice Three", 3]
				],
				interactive: true
			}
		);

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();

		const mock = listen("change");

		await (component.value = [1]);
		expect(mock.callCount).toBe(1);

		// await event.click(item_three);
		// expect(mock.callCount).toBe(2);
	});
});

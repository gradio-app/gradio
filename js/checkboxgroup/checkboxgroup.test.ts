import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";
import { setupi18n } from "../core/src/i18n";

import CheckboxGroup from "./Index.svelte";
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

beforeEach(() => {
	setupi18n();
});

afterEach(cleanup);

describe("Values", () => {
	test("renders correct value when passed as string: single value", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			value: ["choice_one"],
			label: "Dropdown",
			choices: [
				["Choice One", "choice_one"],
				["Choice Two", "choice_two"]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
	});

	test("renders correct value when passed as string: multiple values", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			value: ["choice_one", "choice_three"],
			label: "Dropdown",
			choices: [
				["Choice One", "choice_one"],
				["Choice Two", "choice_two"],
				["Choice Three", "choice_three"]
			]
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
		const { getByLabelText } = await render(CheckboxGroup, {
			value: [1],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
	});

	test("renders correct value when passed as number: multiple values", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			value: [1, 3],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();
	});

	test("component value and rendered value are in sync", async () => {
		const { getByLabelText, debug, component } = await render(CheckboxGroup, {
			value: [1, 3],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).toBeChecked();

		expect(component.value).toEqual([1, 3]);
	});

	test("changing the component value updates the checkboxes", async () => {
		const { getByLabelText, component } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
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

	test("setting a value that does not exist does nothing", async () => {
		const { getByLabelText, component } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
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
	test("changing the value via the UI emits a change event", async () => {
		const { getByLabelText, listen } = await render(CheckboxGroup, {
			loading_status,
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

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

	test("changing the value from outside emits a change event", async () => {
		const { getByLabelText, component, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;
		const item_two = getByLabelText("Choice Two") as HTMLInputElement;
		const item_three = getByLabelText("Choice Three") as HTMLInputElement;

		expect(item_one).not.toBeChecked();
		expect(item_two).not.toBeChecked();
		expect(item_three).not.toBeChecked();

		const mock = listen("change");

		await (component.value = [1]);
		expect(mock.callCount).toBe(1);
	});

	test("changing the value from the UI emits an input event", async () => {
		const { getByLabelText, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		const mock = listen("input");
		await event.click(item_one);

		expect(mock.callCount).toBe(1);
	});

	test("changing the value from outside DOES NOT emit an input event", async () => {
		const { getByLabelText, component, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const mock = listen("input");
		await (component.value = [1]);

		expect(mock.callCount).toBe(0);
	});

	test("changing the value via the UI emits a select event", async () => {
		const { getByLabelText, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", 1],
				["Choice Two", 2],
				["Choice Three", 3]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		const mock = listen("select");
		await event.click(item_one);

		expect(mock.callCount).toBe(1);
	});

	test("select event payload contains the selected value and index", async () => {
		const { getByLabelText, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", "val"],
				["Choice Two", "val_two"],
				["Choice Three", 3]
			]
		});

		const item = getByLabelText("Choice Two") as HTMLInputElement;

		const mock = listen("select");
		await event.click(item);

		expect(mock.calls[0][0].detail.data.value).toBe("val_two");
		expect(mock.calls[0][0].detail.data.index).toBe(1);
	});

	test("select event payload contains the correct selected state", async () => {
		const { getByLabelText, listen } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			choices: [
				["Choice One", "val"],
				["Choice Two", "val_two"],
				["Choice Three", 3]
			]
		});

		const item = getByLabelText("Choice Two") as HTMLInputElement;

		const mock = listen("select");

		await event.click(item);
		expect(mock.calls[0][0].detail.data.selected).toBe(true);

		await event.click(item);
		expect(mock.calls[1][0].detail.data.selected).toBe(false);
	});
});

describe("interactive vs static", () => {
	test("interactive component can be checked", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			interactive: true,
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		await event.click(item_one);

		expect(item_one).toBeChecked();
	});

	test("static component cannot be checked", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			interactive: false,
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		await event.click(item_one);

		expect(item_one).not.toBeChecked();
	});

	test("interactive component updates the value", async () => {
		const { getByLabelText, component } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			interactive: true,
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		await event.click(item_one);

		expect(component.value).toEqual([1]);
	});

	test("static component doe not update the value", async () => {
		const { getByLabelText, component } = await render(CheckboxGroup, {
			value: [],
			label: "Dropdown",
			interactive: false,
			choices: [
				["Choice One", 1],
				["Choice Two", 2]
			]
		});

		const item_one = getByLabelText("Choice One") as HTMLInputElement;

		await event.click(item_one);

		expect(component.value).toEqual([]);
	});
});

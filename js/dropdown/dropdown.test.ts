import { test, describe, assert, afterEach } from "vitest";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
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
	afterEach(() => cleanup());
	beforeEach(() => {
		setupi18n();
	});
	test("renders provided value", async () => {
		const { getByLabelText } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "choice",
			label: "Dropdown",
			choices: ["choice", "choice2"]
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;
		assert.equal(item.value, "choice");
	});

	test("selecting the textbox should show the options", async () => {
		const { getByLabelText, getAllByTestId, debug } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "choice",
			label: "Dropdown",
			choices: ["choice", "choice2"]
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();

		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(2);
		expect(options[0]).toContainHTML("choice");
		expect(options[1]).toContainHTML("choice2");
	});

	test("editing the textbox value should filter the options", async () => {
		const { getByLabelText, getAllByTestId, debug } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "",
			label: "Dropdown",
			choices: ["apple", "zebra"]
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(2);

		await event.keyboard("z");
		const options_new = getAllByTestId("dropdown-option");

		expect(options_new).toHaveLength(1);
		expect(options[0]).toContainHTML("zebra");
	});

	test("deselecting and reselcting a filtered dropdown should show all options again", async () => {
		const { getByLabelText, getAllByTestId, debug } = await render(Dropdown, {
			show_label: true,
			loading_status,
			max_choices: 10,
			value: "",
			label: "Dropdown",
			choices: ["apple", "zebra", "pony"]
		});

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();
		await event.keyboard("z");
		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(1);

		await item.blur();
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
				max_choices: 10,
				value: "zebra",
				label: "Dropdown",
				choices: ["apple", "zebra", "pony"]
			}
		);

		const item: HTMLInputElement = getByLabelText(
			"Dropdown"
		) as HTMLInputElement;

		await item.focus();

		const options = getAllByTestId("dropdown-option");

		expect(options).toHaveLength(3);

		await component.$set({ choices: ["apple", "zebra", "pony"] });

		const options_new = getAllByTestId("dropdown-option");

		expect(options_new).toHaveLength(3);
	});
});

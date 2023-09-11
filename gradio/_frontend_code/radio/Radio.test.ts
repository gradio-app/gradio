import { test, describe, assert, afterEach } from "vitest";

import { cleanup, render } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Radio from "./interactive";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as LoadingStatus["show_progress"]
};

describe("Radio", () => {
	afterEach(() => cleanup());
	const choices = [
		["dog", "dog"],
		["cat", "cat"],
		["turtle", "turtle"]
	];

	test("renders provided value", async () => {
		const { getAllByRole, getByTestId } = await render(Radio, {
			show_label: true,
			loading_status,
			choices: choices,
			value: "cat",
			label: "Radio",
			mode: "dynamic"
		});

		assert.equal(
			getByTestId("cat-radio-label").className.includes("selected"),
			true
		);

		const radioButtons: HTMLOptionElement[] = getAllByRole(
			"radio"
		) as HTMLOptionElement[];
		assert.equal(radioButtons.length, 3);

		radioButtons.forEach((radioButton: HTMLOptionElement, index) => {
			assert.equal(radioButton.value === choices[index][1], true);
		});
	});

	test("should update the value when a radio is clicked", async () => {
		const { getByDisplayValue, getByTestId } = await render(Radio, {
			show_label: true,
			loading_status,
			choices: choices,
			value: "cat",
			label: "Radio",
			mode: "dynamic"
		});

		await event.click(getByDisplayValue("dog"));

		assert.equal(
			getByTestId("dog-radio-label").className.includes("selected"),
			true
		);

		assert.equal(
			getByTestId("cat-radio-label").classList.contains("selected"),
			false
		);

		await event.click(getByDisplayValue("turtle"));

		assert.equal(
			getByTestId("turtle-radio-label").classList.contains("selected"),
			true
		);
	});
});

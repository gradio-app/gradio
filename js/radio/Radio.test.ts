import { test, describe, assert, afterEach } from "vitest";

import { cleanup, render } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Radio from "./Index.svelte";
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
	] as [string, string][];

	test("renders provided value", async () => {
		const { getAllByRole, getByTestId } = await render(Radio, {
			choices: choices,
			value: "cat",
			label: "Radio"
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
			choices: choices,
			value: "cat",
			label: "Radio"
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

	test("should dispatch the select event when clicks", async () => {
		const { listen, getAllByTestId } = await render(Radio, {
			choices: choices,
			value: "cat",
			label: "Radio"
		});

		const mock = listen("select");
		await event.click(getAllByTestId("dog-radio-label")[0]);
		expect(mock.callCount).toBe(1);
		expect(mock.calls[0][0].detail.data.value).toEqual("dog");
	});

	test("when multiple radios are on the screen, they should not conflict", async () => {
		const { container } = await render(Radio, {
			choices: choices,
			value: "cat",
			label: "Radio"
		});

		const { getAllByLabelText } = await render(
			Radio,
			{
				choices: choices,
				value: "dog",
				label: "Radio"
			},
			container
		);

		const items = getAllByLabelText("dog") as HTMLInputElement[];
		expect([items[0].checked, items[1].checked]).toEqual([false, true]);

		await event.click(items[0]);

		expect([items[0].checked, items[1].checked]).toEqual([true, true]);
		cleanup();
	});
});

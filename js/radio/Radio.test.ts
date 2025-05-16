import { test, describe, assert, afterEach } from "vitest";

import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";

import Radio from "./Index.svelte";

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

		const cat_radio = getAllByRole("radio")[1];

		expect(cat_radio).toBeChecked();

		const radioButtons: HTMLOptionElement[] = getAllByRole(
			"radio"
		) as HTMLOptionElement[];
		assert.equal(radioButtons.length, 3);

		radioButtons.forEach((radioButton: HTMLOptionElement, index) => {
			assert.equal(radioButton.value === choices[index][1], true);
		});
	});

	test("should update the value when a radio is clicked", async () => {
		const { getByDisplayValue, getAllByRole } = await render(Radio, {
			choices: choices,
			value: "cat",
			label: "Radio"
		});

		const dog_radio = getAllByRole("radio")[0];

		await event.click(dog_radio);

		expect(dog_radio).toBeChecked();

		const cat_radio = getAllByRole("radio")[1];

		expect(cat_radio).not.toBeChecked();

		await event.click(getByDisplayValue("turtle"));

		await event.click(cat_radio);

		expect(cat_radio).toBeChecked();
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

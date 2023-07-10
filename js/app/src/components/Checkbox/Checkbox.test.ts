import { cleanup, fireEvent, render } from "@gradio/tootils";
import Checkbox from "./Checkbox.svelte";

describe("Checkbox", () => {
	afterEach(() => cleanup());

	test("can be checked and unchecked", async () => {
		const { getByRole } = await render(Checkbox, { value: false });

		const checkbox = getByRole("checkbox");
		expect(checkbox.checked).toBe(false);

		await fireEvent.click(checkbox);
		expect(checkbox.checked).toBe(true);

		await fireEvent.click(checkbox);
		expect(checkbox.checked).toBe(false);
	});

	test("emits an event when its state changes", async () => {
		const { getByRole, component } = await render(Checkbox, { value: false });

		const checkbox = getByRole("checkbox");
		const mock = jest.fn();
		component.$on("change", mock);

		await fireEvent.click(checkbox);
		expect(mock).toHaveBeenCalledWith(true);

		await fireEvent.click(checkbox);
		expect(mock).toHaveBeenCalledWith(false);
	});
});
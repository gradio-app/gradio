import { cleanup, fireEvent, render } from "@gradio/tootils";
import Checkbox from "./Checkbox.svelte";

describe("Checkbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Checkbox, {
			value: true
		});

		const item: HTMLInputElement = getByDisplayValue("true");
		assert.equal(item.checked, true);
	});

	test("changing the checkbox should update the value", async () => {
		const { component, getByDisplayValue } = await render(Checkbox, {
			value: false
		});

		const item: HTMLInputElement = getByDisplayValue("false");

		const mock = spy();
		component.$on("change", mock);

		item.click();

		assert.equal(item.checked, true);
		assert.equal(component.value, true);
		assert.equal(mock.callCount, 1);
		assert.equal(mock.calls[0][0].detail, true);
	});
});


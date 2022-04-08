import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render } from "@gradio/tootils";

import Button from "./Button.svelte";

describe("Hello.svelte", () => {
	afterEach(() => cleanup());

	test.skip("renders label text", () => {
		const { container, component } = render(Button, { value: "Click Me" });
		assert.equal(container.innerText, "Click Me");
	});

	test.skip("triggers callback when clicked", async () => {
		const { container, component } = render(Button, { value: "Click Me" });
		const mock = spy();
		component.$on("click", mock);

		fireEvent.click(container.querySelector("button")!);

		assert.isTrue(mock.called);
	});
});

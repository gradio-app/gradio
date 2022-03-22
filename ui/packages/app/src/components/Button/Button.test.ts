import { test, describe, assert, afterAll } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render } from "@testing-library/svelte";

import Button from "./Button.svelte";

describe("Hello.svelte", () => {
	afterAll(() => cleanup());
	const { container, component } = render(Button, { label: "Click Me" });

	test("renders label text", () => {
		assert.equal(container.innerText, "Click Me");
	});

	test("triggers callback when clicked", async () => {
		const mock = spy();
		component.$on("click", mock);

		fireEvent.click(container.querySelector("button")!);

		assert.isTrue(mock.called);
	});
});

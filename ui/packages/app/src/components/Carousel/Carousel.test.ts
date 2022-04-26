import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render } from "@gradio/tootils";

import Carousel from "./Carousel.test.svelte";

describe("Carousel + CarouselItem", () => {
	afterEach(() => cleanup());

	test("renders first carousel item is rendered by default", () => {
		const { container } = render(Carousel);
		const item = container.querySelector(".component")!;

		assert.equal(item.children[0].tagName, "H1");
		assert.equal(item.children[0].innerHTML, "Item 1");
	});

	test.skip("clicking next shows the second component", async () => {
		const { container } = render(Carousel);
		const [, next] = Array.from(container.querySelectorAll("button"));

		await fireEvent.click(next);
		const item = container.querySelector(".component")!;

		assert.equal(item.children[0].tagName, "IMG");
	});

	test.skip("clicking previous from index 0 shows the last component", async () => {
		const { container } = render(Carousel);
		const [previous] = Array.from(container.querySelectorAll("button"));

		await fireEvent.click(previous);
		const item = container.querySelector(".component")!;

		assert.equal(item.children[0].tagName, "IMG");
	});

	test("change callback is triggered when", async () => {
		const { container, component } = render(Carousel);
		const [previous, next] = Array.from(container.querySelectorAll("button"));

		const mock = spy();

		component.$on("change", mock);

		fireEvent.click(next);
		fireEvent.click(previous);

		assert.isTrue(mock.called);
		assert.equal(mock.callCount, 2);
	});
});

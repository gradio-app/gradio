import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { tick, mount, unmount } from "svelte";

import BlockLabel from "./src/BlockLabel.svelte";

const Icon = (): void => {};

function pointer_move(
	el: Element,
	x: number,
	y: number,
	buttons = 0
): Promise<void> {
	el.dispatchEvent(
		new PointerEvent("pointermove", {
			clientX: x,
			clientY: y,
			buttons,
			bubbles: true
		})
	);
	return tick();
}

describe("BlockLabel hover reveal", () => {
	let target: HTMLElement;
	let component: any;

	beforeEach(() => {
		target = document.body.appendChild(document.createElement("div"));
		target.style.position = "relative";
		target.style.width = "400px";
		target.style.height = "300px";
	});

	afterEach(() => {
		if (component) unmount(component);
		target.remove();
	});

	async function setup(): Promise<{ label: HTMLLabelElement; rect: DOMRect }> {
		component = mount(BlockLabel, {
			target,
			props: { label: "A long label that buttons could cover", Icon }
		});
		await tick();
		const label = target.querySelector("label")!;
		return { label, rect: label.getBoundingClientRect() };
	}

	test("raises the label while the pointer is over it", async () => {
		const { label, rect } = await setup();
		await pointer_move(target, rect.left + 5, rect.top + 5);
		assert.isTrue(label.classList.contains("hovered"));

		await pointer_move(target, rect.right + 50, rect.bottom + 50);
		assert.isFalse(label.classList.contains("hovered"));
	});

	test("does not react while a mouse button is held (e.g. drawing)", async () => {
		const { label, rect } = await setup();
		await pointer_move(target, rect.left + 5, rect.top + 5, 1);
		assert.isFalse(label.classList.contains("hovered"));
	});

	test("does not cover a button the pointer is on", async () => {
		const { label, rect } = await setup();
		const button = target.appendChild(document.createElement("button"));
		await pointer_move(button, rect.left + 5, rect.top + 5);
		assert.isFalse(label.classList.contains("hovered"));
	});

	test("keeps letting clicks and drags through to what is underneath", async () => {
		const { label, rect } = await setup();
		await pointer_move(target, rect.left + 5, rect.top + 5);
		assert.equal(getComputedStyle(label).pointerEvents, "none");
	});
});

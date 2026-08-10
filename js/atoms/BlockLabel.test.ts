import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { tick, mount, unmount } from "svelte";
import { Music } from "@gradio/icons";

import BlockLabel from "./src/BlockLabel.svelte";

describe("BlockLabel", () => {
	let target: HTMLElement;
	let component: any;

	beforeEach(() => {
		target = document.body.appendChild(document.createElement("div"));
	});

	afterEach(() => {
		if (component) {
			unmount(component);
		}
		if (target.parentNode) {
			target.parentNode.removeChild(target);
		}
	});

	// An empty `for` makes Firefox call getElementById("") on every render and
	// hover, which it logs as "Empty string passed to getElementById()". See
	// https://github.com/gradio-app/gradio/issues/9374
	test("does not render an empty `for` attribute", async () => {
		component = mount(BlockLabel, {
			target,
			props: { label: "Test Label", Icon: Music }
		});
		await tick();

		const label = target.querySelector<HTMLLabelElement>(
			'[data-testid="block-label"]'
		);
		assert.isNotNull(label);
		assert.isFalse(label!.hasAttribute("for"));
		assert.equal(target.querySelectorAll('label[for=""]').length, 0);
	});
});

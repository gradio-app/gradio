import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { tick, mount, unmount } from "svelte";

import Block from "./src/Block.svelte";

describe("Block Accessibility", () => {
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

	test("renders with aria-label when label prop is provided", async () => {
		component = mount(Block, {
			target,
			props: {
				label: "Test Block Label"
			}
		});
		await tick();
		const block = target.querySelector(".block");
		assert.equal(block?.getAttribute("aria-label"), "Test Block Label");
	});

	test("renders with role='group' when type is fieldset", async () => {
		component = mount(Block, {
			target,
			props: {
				type: "fieldset",
				label: "Fieldset Group"
			}
		});
		await tick();
		const block = target.querySelector(".block");
		assert.equal(block?.getAttribute("role"), "group");
		assert.equal(block?.tagName.toLowerCase(), "fieldset");
	});

	test("renders without role when type is normal", async () => {
		component = mount(Block, {
			target,
			props: {
				type: "normal"
			}
		});
		await tick();
		const block = target.querySelector(".block");
		assert.isNull(block?.getAttribute("role"));
		assert.equal(block?.tagName.toLowerCase(), "div");
	});

	test("renders as div by default", async () => {
		component = mount(Block, {
			target,
			props: {}
		});
		await tick();
		const block = target.querySelector(".block");
		assert.equal(block?.tagName.toLowerCase(), "div");
	});

	test("renders as fieldset when type is fieldset", async () => {
		component = mount(Block, {
			target,
			props: {
				type: "fieldset"
			}
		});
		await tick();
		const block = target.querySelector(".block");
		assert.equal(block?.tagName.toLowerCase(), "fieldset");
	});
});

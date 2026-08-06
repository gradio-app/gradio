import { test, describe, assert, afterEach, beforeEach, vi } from "vitest";
import { tick, mount, unmount } from "svelte";
// @ts-ignore — `proxy` is the runtime implementation behind `$state(...)`.
// Using it directly keeps this file plain `.ts` rather than `.svelte.ts`,
// which intermittently fails to load in CI under concurrent test-file imports
// (see the same note in js/tootils/src/render.ts).
import { proxy } from "svelte/internal/client";

import Block from "./src/Block.svelte";

describe("Block fullscreen teardown", () => {
	let target: HTMLElement;
	let component: any;

	beforeEach(() => {
		target = document.body.appendChild(document.createElement("div"));
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
		if (target.parentNode) {
			target.parentNode.removeChild(target);
		}
		vi.restoreAllMocks();
	});

	test("removes the escape-key listener when destroyed while fullscreen", async () => {
		const add_spy = vi.spyOn(window, "addEventListener");
		const remove_spy = vi.spyOn(window, "removeEventListener");

		const props = proxy({ fullscreen: false });
		component = mount(Block, { target, props });
		await tick();

		props.fullscreen = true;
		await tick();

		const keydown_registrations = add_spy.mock.calls.filter(
			([type]) => type === "keydown"
		);
		assert.equal(
			keydown_registrations.length,
			1,
			"entering fullscreen should register a keydown listener"
		);
		const handler = keydown_registrations[0][1];

		// Destroyed while still fullscreen — the listener must not outlive it.
		unmount(component);
		component = null;
		await tick();

		assert.isTrue(
			remove_spy.mock.calls.some(
				([type, fn]) => type === "keydown" && fn === handler
			),
			"destroying a fullscreen block should remove its keydown listener"
		);
	});

	// Note: the marker comment sits inside Svelte's own fragment range, so it is
	// swept on teardown either way — this covers the enter/exit portal path
	// itself, which was otherwise untested.
	test("portals the block out of a transformed ancestor when fullscreen", async () => {
		const count_markers = (): number => {
			const walker = document.createTreeWalker(
				document.body,
				NodeFilter.SHOW_COMMENT
			);
			let node: Node | null;
			let count = 0;
			while ((node = walker.nextNode())) {
				if (node.nodeValue === "fullscreen block") count++;
			}
			return count;
		};

		// A transformed ancestor (this is what `gr.Sidebar` does) establishes a
		// containing block for fixed descendants, which is the case that makes
		// Block portal itself up to `.gradio-container`.
		target.className = "gradio-container";
		const transformed = target.appendChild(document.createElement("div"));
		transformed.style.transform = "translateX(0)";
		transformed.style.width = "200px";
		transformed.style.height = "200px";

		const props = proxy({ fullscreen: false });
		component = mount(Block, { target: transformed, props });
		await tick();

		props.fullscreen = true;
		await tick();

		assert.equal(
			count_markers(),
			1,
			"entering fullscreen under a transformed ancestor should portal the block"
		);

		unmount(component);
		component = null;
		await tick();

		assert.equal(count_markers(), 0);
	});
});

import { test, expect, afterEach } from "vitest";
import { mount, unmount, tick } from "svelte";
import StreamingBar from "./static/StreamingBar.svelte";

let target: HTMLDivElement;
let component: ReturnType<typeof mount>;

afterEach(() => {
	if (component) unmount(component);
	if (target) target.remove();
});

test("the bar starts over when it runs out while the stream goes on", async () => {
	target = document.createElement("div");
	document.body.appendChild(target);
	component = mount(StreamingBar, { target, props: { time_limit: 0.2 } });
	await tick();
	const first = target.querySelector(".streaming-bar");
	expect(first).not.toBeNull();

	await new Promise<void>((resolve) =>
		first!.addEventListener("animationend", () => resolve(), { once: true })
	);
	await tick();
	const second = target.querySelector(".streaming-bar");
	// A new element, so its countdown runs again from the start
	expect(second).not.toBeNull();
	expect(second).not.toBe(first);
});

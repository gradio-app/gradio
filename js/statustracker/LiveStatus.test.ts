import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { flushSync, mount, tick, unmount } from "svelte";
import { within } from "@self/tootils/render";
import type { LoadingStatusArgs } from "./static/types";
import LiveStatusHarness from "./LiveStatusHarness.test.svelte";

type Harness = {
	update_status: (status: LoadingStatusArgs) => void;
};

let target: HTMLDivElement;
let component: Harness;

function status_update(
	overrides: Partial<LoadingStatusArgs> = {}
): LoadingStatusArgs {
	return {
		fn_index: 0,
		status: "pending",
		stream_state: null,
		...overrides
	};
}

async function update_status(status: LoadingStatusArgs): Promise<void> {
	flushSync(() => component.update_status(status));
	await tick();
	await tick();
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
	target = document.createElement("div");
	document.body.appendChild(target);
	component = mount(LiveStatusHarness, { target }) as Harness;
});

afterEach(() => {
	unmount(component);
	target.remove();
	vi.useRealTimers();
});

test("announces repeated runs and clears stale status text", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update());
	expect(live_region).toHaveTextContent("Loading");

	await update_status(status_update({ status: "complete" }));
	expect(live_region).toHaveTextContent("Complete");

	vi.advanceTimersByTime(1000);
	await tick();
	expect(live_region).toHaveTextContent("");

	await update_status(status_update());
	expect(live_region).toHaveTextContent("Loading");

	await update_status(status_update({ status: "complete" }));
	expect(live_region).toHaveTextContent("Complete");
});

test("announces errors and queue position zero consistently with the UI", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update({ position: 0, size: 3 }));
	expect(live_region).toHaveTextContent("In queue: 1 of 3");

	await update_status(status_update({ status: "error" }));
	expect(live_region).toHaveTextContent("Error");
});

test("defers the newest throttled progress milestone instead of dropping it", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(
		status_update({
			progress_data: [
				{ progress: null, index: 1, length: 10, unit: "steps", desc: null }
			]
		})
	);
	expect(live_region).toHaveTextContent("1 / 10 steps");

	await update_status(
		status_update({
			progress_data: [
				{ progress: null, index: 5, length: 10, unit: "steps", desc: null }
			]
		})
	);
	await update_status(
		status_update({
			progress_data: [
				{ progress: null, index: 9, length: 10, unit: "steps", desc: null }
			]
		})
	);

	vi.advanceTimersByTime(5000);
	await tick();
	expect(live_region).toHaveTextContent("9 / 10 steps");
});

test("announces generator and streaming progress", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(
		status_update({
			status: "generating",
			progress_data: [
				{ progress: null, index: 5, length: 10, unit: "steps", desc: null }
			]
		})
	);
	expect(live_region).toHaveTextContent("5 / 10 steps");

	await update_status(
		status_update({
			status: "streaming",
			progress_data: [
				{ progress: null, index: 9, length: 10, unit: "steps", desc: null }
			]
		})
	);
	expect(live_region).toHaveTextContent("9 / 10 steps");
});

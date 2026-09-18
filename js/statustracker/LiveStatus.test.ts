import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { flushSync, mount, tick, unmount } from "svelte";
import { within } from "@self/tootils/render";
import type { LoadingStatusArgs } from "./static/types";
import LiveStatusHarness from "./LiveStatusHarness.test.svelte";

type Harness = {
	update_status: (status: LoadingStatusArgs) => void;
};

/** Must match the constants in LiveStatus.svelte. */
const THROTTLE_MS = 5000;
const CLEAR_MS = 1000;

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

async function advance(ms: number): Promise<void> {
	vi.advanceTimersByTime(ms);
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
	await advance(CLEAR_MS);
	expect(live_region).toHaveTextContent("");

	await advance(THROTTLE_MS - CLEAR_MS);
	expect(live_region).toHaveTextContent("Complete");

	await update_status(status_update());
	await advance(THROTTLE_MS);
	expect(live_region).toHaveTextContent("Loading");
});

test("announces errors and queue position zero consistently with the UI", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update({ position: 0, size: 3 }));
	expect(live_region).toHaveTextContent("In queue: 1 of 3");

	await update_status(status_update({ status: "error" }));
	await advance(THROTTLE_MS);
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

	await advance(THROTTLE_MS);
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
	await advance(THROTTLE_MS);
	expect(live_region).toHaveTextContent("9 / 10 steps");
});

test("collapses a rapidly re-triggered dependency into one trailing announcement", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update());
	expect(live_region).toHaveTextContent("Loading");

	// A gr.Timer-style dependency cycling pending -> complete many times inside a
	// single throttle window must not announce once per tick.
	for (let i = 0; i < 5; i++) {
		await update_status(status_update({ status: "complete" }));
		await update_status(status_update());
	}
	await update_status(status_update({ status: "complete" }));

	await advance(CLEAR_MS);
	expect(live_region).toHaveTextContent("");

	await advance(THROTTLE_MS - CLEAR_MS);
	expect(live_region).toHaveTextContent("Complete");
});

test("stays silent when the dependency sets show_progress to hidden", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update({ show_progress: "hidden" }));
	expect(live_region).toHaveTextContent("");

	await update_status(
		status_update({
			show_progress: "hidden",
			progress_data: [
				{ progress: null, index: 5, length: 10, unit: "steps", desc: null }
			]
		})
	);
	await update_status(
		status_update({ status: "complete", show_progress: "hidden" })
	);

	await advance(THROTTLE_MS);
	expect(live_region).toHaveTextContent("");
});

test("still announces when show_progress is full or minimal", async () => {
	const { getByRole } = within(target);
	const live_region = getByRole("status");

	await update_status(status_update({ show_progress: "minimal" }));
	expect(live_region).toHaveTextContent("Loading");

	await update_status(
		status_update({ fn_index: 1, status: "complete", show_progress: "full" })
	);
	await advance(THROTTLE_MS);
	expect(live_region).toHaveTextContent("Complete");
});

import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Timer from "./Index.svelte";

describe("Timer", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test("registers an interval and dispatches tick when active and visible", async () => {
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "visible",
		});

		let intervalCallback: (() => void) | undefined;
		const setIntervalSpy = vi
			.spyOn(globalThis, "setInterval")
			.mockImplementation(((fn: TimerHandler) => {
				intervalCallback = fn as () => void;
				return 1 as unknown as NodeJS.Timeout;
			}) as typeof setInterval);

		const { listen } = await render(Timer, {
			value: 0.25,
			active: true,
		});
		const tick = listen("tick");
		intervalCallback?.();

		expect(setIntervalSpy).toHaveBeenCalledTimes(1);
		expect(setIntervalSpy.mock.calls[0]?.[1]).toBe(250);
		expect(tick).toHaveBeenCalledTimes(1);
	});

	test("does not register an interval when inactive", async () => {
		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

		await render(Timer, {
			value: 0.25,
			active: false,
		});

		expect(setIntervalSpy).not.toHaveBeenCalled();
	});

	test("suppresses tick dispatches while the document is hidden", async () => {
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "hidden",
		});

		let intervalCallback: (() => void) | undefined;
		const setIntervalSpy = vi
			.spyOn(globalThis, "setInterval")
			.mockImplementation(((fn: TimerHandler) => {
				intervalCallback = fn as () => void;
				return 1 as unknown as NodeJS.Timeout;
			}) as typeof setInterval);

		const { listen } = await render(Timer, {
			value: 0.25,
			active: true,
		});
		const tick = listen("tick");
		intervalCallback?.();

		expect(setIntervalSpy).toHaveBeenCalledTimes(1);
		expect(tick).not.toHaveBeenCalled();
	});
});

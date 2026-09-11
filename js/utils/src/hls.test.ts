import { describe, expect, test, vi } from "vitest";
import { watch_for_stalls } from "./hls";

function fake_media(buffered_end: number): HTMLMediaElement {
	return {
		currentTime: 1,
		paused: false,
		ended: false,
		seeking: false,
		buffered: {
			length: 1,
			start: () => 0,
			end: () => buffered_end
		},
		play: () => Promise.resolve()
	} as unknown as HTMLMediaElement;
}

describe("watch_for_stalls", () => {
	test("moves a frozen playhead on when there is buffer past it", () => {
		vi.useFakeTimers();
		const media = fake_media(3);
		const stop = watch_for_stalls(media);

		vi.advanceTimersByTime(1000);
		expect(media.currentTime).toBeGreaterThan(1);

		stop();
		vi.useRealTimers();
	});

	test("leaves a playhead alone when the stream has simply run out", () => {
		vi.useFakeTimers();
		// Only 0.05 s past the playhead, so this is a stream still arriving
		// rather than a player that is stuck, and nudging would skip real media.
		const media = fake_media(1.05);
		const stop = watch_for_stalls(media);

		vi.advanceTimersByTime(1000);
		expect(media.currentTime).toBe(1);

		stop();
		vi.useRealTimers();
	});

	test("leaves a playhead alone while it is still moving", () => {
		vi.useFakeTimers();
		const media = fake_media(10);
		const stop = watch_for_stalls(media);

		for (let index = 0; index < 8; index++) {
			media.currentTime += 0.25;
			vi.advanceTimersByTime(250);
		}
		expect(media.currentTime).toBeCloseTo(3, 5);

		stop();
		vi.useRealTimers();
	});
});

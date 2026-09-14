import { describe, expect, test, vi } from "vitest";
import { watch_for_stalls } from "./hls";

function fake_media(buffered_end: number, fps = 0): HTMLMediaElement {
	// A real element settles a seek on a frame it can decode rather than where
	// it was put, so a nudge lands past what was asked for. Pass `fps` to get
	// that; leave it off and the value assigned is the value kept.
	let time = 1;
	return {
		get currentTime() {
			return time;
		},
		set currentTime(value: number) {
			time = fps ? Math.ceil(value * fps) / fps : value;
		},
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

	test("gives up on a playhead that will not restart", () => {
		vi.useFakeTimers();
		// Buffer to spare and nothing moving: not a drained buffer, so
		// something is wrong with the media itself and stepping through it
		// forever would skip what the viewer came for while hiding the fault.
		const media = fake_media(30);
		const stop = watch_for_stalls(media);

		vi.advanceTimersByTime(30000);
		expect(media.currentTime).toBeCloseTo(1.03, 5);

		stop();
		vi.useRealTimers();
	});

	test("gives up even when the seek lands past where it was put", () => {
		vi.useFakeTimers();
		// 24 fps, so each nudge settles about 0.042 s on rather than the 0.01 s
		// asked for. Reading that as playback would hand back the budget every
		// time and the watcher would walk the stream for as long as it lived.
		const media = fake_media(30, 24);
		const stop = watch_for_stalls(media);

		vi.advanceTimersByTime(30000);
		expect(media.currentTime).toBeLessThan(1.2);

		stop();
		vi.useRealTimers();
	});

	test("nudges again once playback has recovered in between", () => {
		vi.useFakeTimers();
		const media = fake_media(30);
		const stop = watch_for_stalls(media);

		vi.advanceTimersByTime(30000);
		expect(media.currentTime).toBeCloseTo(1.03, 5);
		// Playback runs again of its own accord, so the next stall is a new
		// one rather than a continuation of the one that gave up.
		media.currentTime = 5;
		vi.advanceTimersByTime(250);
		vi.advanceTimersByTime(30000);
		expect(media.currentTime).toBeCloseTo(5.03, 5);

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

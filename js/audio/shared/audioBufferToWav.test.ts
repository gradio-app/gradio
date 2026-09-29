import { test, describe, assert, vi } from "vitest";
import { audioBufferToWav } from "./audioBufferToWav";

function make_buffer(channels: number[][], sampleRate = 8000): AudioBuffer {
	const buffer = new AudioBuffer({
		numberOfChannels: channels.length,
		length: channels[0].length,
		sampleRate
	});
	channels.forEach((data, i) =>
		buffer.copyToChannel(Float32Array.from(data), i)
	);
	return buffer;
}

describe("audioBufferToWav", () => {
	test("interleaves channels as clamped 16-bit PCM after the header", () => {
		const buffer = make_buffer([
			[0, 1, -1, 2],
			[0.5, -0.5, -2, 0]
		]);
		const view = new DataView(audioBufferToWav(buffer).buffer);

		assert.equal(view.byteLength, 44 + 4 * 2 * 2);
		assert.equal(view.getUint16(22, true), 2);
		assert.equal(view.getUint32(24, true), 8000);
		assert.equal(view.getUint32(40, true), 4 * 2 * 2);

		const samples = [];
		for (let offset = 44; offset < view.byteLength; offset += 2) {
			samples.push(view.getInt16(offset, true));
		}
		assert.deepEqual(
			samples,
			[0, 16383, 32767, -16383, -32767, -32767, 32767, 0]
		);
	});

	test("reads each channel once rather than once per sample", () => {
		const buffer = make_buffer([
			new Array(1000).fill(0.1),
			new Array(1000).fill(-0.1)
		]);
		const spy = vi.spyOn(buffer, "getChannelData");

		audioBufferToWav(buffer);

		assert.equal(spy.mock.calls.length, 2);
	});
});

import { afterEach, describe, expect, test, vi } from "vitest";
import { Hls, create_hls_stream } from "./hls";

function attach(on_manifest_parsed?: () => void): Hls {
	vi.spyOn(Hls.prototype, "loadSource").mockImplementation(() => {});
	vi.spyOn(Hls.prototype, "attachMedia").mockImplementation(() => {});
	return create_hls_stream(
		document.createElement("audio"),
		"https://example.com/playlist.m3u8",
		on_manifest_parsed
	);
}

describe("create_hls_stream", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("an unrecoverable error destroys the instance", () => {
		const destroy = vi.spyOn(Hls.prototype, "destroy");
		const hls = attach();

		hls.trigger(Hls.Events.ERROR, {
			type: Hls.ErrorTypes.OTHER_ERROR,
			details: Hls.ErrorDetails.INTERNAL_EXCEPTION,
			fatal: true
		} as any);

		expect(destroy).toHaveBeenCalledTimes(1);
	});

	test("a recoverable error is retried rather than destroyed", () => {
		const destroy = vi.spyOn(Hls.prototype, "destroy");
		const start_load = vi
			.spyOn(Hls.prototype, "startLoad")
			.mockImplementation(() => {});
		const hls = attach();

		hls.trigger(Hls.Events.ERROR, {
			type: Hls.ErrorTypes.NETWORK_ERROR,
			details: Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
			fatal: true
		} as any);

		expect(start_load).toHaveBeenCalledTimes(1);
		expect(destroy).not.toHaveBeenCalled();
	});

	// The owning effect's teardown destroys the instance even when a fatal
	// error already destroyed it, so a second destroy() has to stay safe.
	test("destroying an already-destroyed instance does not throw", () => {
		const hls = attach();

		hls.destroy();

		expect(() => hls.destroy()).not.toThrow();
	});
});

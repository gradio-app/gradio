import { describe, expect, test, vi } from "vitest";
import Hls from "hls.js";
import { attach_hls_stream } from "./hls";

function attach(callbacks = {}): Hls {
	vi.spyOn(Hls.prototype, "loadSource").mockImplementation(() => {});
	vi.spyOn(Hls.prototype, "attachMedia").mockImplementation(() => {});
	return attach_hls_stream(
		document.createElement("audio"),
		"https://example.com/playlist.m3u8",
		callbacks
	);
}

describe("attach_hls_stream", () => {
	test("an unrecoverable error destroys the instance and reports it", () => {
		const destroy = vi.spyOn(Hls.prototype, "destroy");
		const on_unrecoverable = vi.fn();
		const hls = attach({ on_unrecoverable });

		hls.trigger(Hls.Events.ERROR, {
			type: Hls.ErrorTypes.OTHER_ERROR,
			details: Hls.ErrorDetails.INTERNAL_EXCEPTION,
			fatal: true
		} as any);

		expect(destroy).toHaveBeenCalledTimes(1);
		// The caller holds the reference, so it has to hear about the teardown
		// or it keeps a dead instance and destroys it a second time later.
		expect(on_unrecoverable).toHaveBeenCalledTimes(1);

		vi.restoreAllMocks();
	});

	test("a recoverable error is retried rather than destroyed", () => {
		const destroy = vi.spyOn(Hls.prototype, "destroy");
		const start_load = vi
			.spyOn(Hls.prototype, "startLoad")
			.mockImplementation(() => {});
		const on_unrecoverable = vi.fn();
		const hls = attach({ on_unrecoverable });

		hls.trigger(Hls.Events.ERROR, {
			type: Hls.ErrorTypes.NETWORK_ERROR,
			details: Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
			fatal: true
		} as any);

		expect(start_load).toHaveBeenCalledTimes(1);
		expect(destroy).not.toHaveBeenCalled();
		expect(on_unrecoverable).not.toHaveBeenCalled();

		vi.restoreAllMocks();
	});
});

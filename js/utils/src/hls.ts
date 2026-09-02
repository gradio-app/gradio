import Hls from "hls.js";

export { Hls };

export function is_hls_supported(): boolean {
	return Hls.isSupported();
}

/**
 * Create an HLS stream attached to a media element.
 *
 * The returned instance belongs to the caller, which must `destroy()` it when
 * the stream is replaced or the component goes away; `destroy()` is safe to
 * call on an instance that already destroyed itself after a fatal error. Both
 * `gr.Audio` and `gr.Video` stream through this so the buffer config and the
 * error recovery stay in one place.
 */
export function create_hls_stream(
	media: HTMLMediaElement,
	url: string,
	on_manifest_parsed?: () => void
): Hls {
	// Start playback after one second of data rather than filling a buffer.
	const hls = new Hls({
		maxBufferLength: 1,
		maxMaxBufferLength: 1,
		lowLatencyMode: true
	});

	// Listeners are registered before loading, which can emit synchronously.
	hls.on(Hls.Events.MANIFEST_PARSED, () => on_manifest_parsed?.());

	hls.on(Hls.Events.ERROR, (event, data) => {
		// Non-fatal errors are routine with a one-second buffer.
		if (!data.fatal) return;
		console.error("HLS error:", event, data);
		switch (data.type) {
			case Hls.ErrorTypes.NETWORK_ERROR:
				console.error("Fatal network error encountered, trying to recover");
				hls.startLoad();
				break;
			case Hls.ErrorTypes.MEDIA_ERROR:
				console.error("Fatal media error encountered, trying to recover");
				hls.recoverMediaError();
				break;
			default:
				console.error("Fatal error, cannot recover");
				hls.destroy();
				break;
		}
	});

	hls.loadSource(url);
	hls.attachMedia(media);

	return hls;
}

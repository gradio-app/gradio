import Hls from "hls.js";

export interface HlsStreamCallbacks {
	/** Called once the playlist is readable, which is where playback can start. */
	on_manifest_parsed?: () => void;
	/**
	 * Called after a fatal error has destroyed the instance. The caller owns the
	 * reference, so it has to drop it here or it keeps a dead instance around.
	 */
	on_unrecoverable?: () => void;
}

/**
 * Attach an HLS stream to a media element.
 *
 * The returned instance belongs to the caller, which must `destroy()` it before
 * attaching another stream and when the component goes away. Both `gr.Audio`
 * and `gr.Video` stream through this so the buffer config, the error recovery
 * and those lifetime rules stay in one place.
 */
export function attach_hls_stream(
	media: HTMLMediaElement,
	url: string,
	{ on_manifest_parsed, on_unrecoverable }: HlsStreamCallbacks = {}
): Hls {
	// Start playback after one second of data rather than filling a buffer.
	const hls = new Hls({
		maxBufferLength: 1,
		maxMaxBufferLength: 1,
		lowLatencyMode: true
	});

	hls.loadSource(url);
	hls.attachMedia(media);

	hls.on(Hls.Events.MANIFEST_PARSED, () => on_manifest_parsed?.());

	hls.on(Hls.Events.ERROR, (event, data) => {
		console.error("HLS error:", event, data);
		if (!data.fatal) return;
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
				on_unrecoverable?.();
				break;
		}
	});

	return hls;
}

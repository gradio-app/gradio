import Hls from "hls.js";

export { Hls };

export function is_hls_supported(): boolean {
	return Hls.isSupported();
}

// How much has to be buffered past the playhead before a stall counts as the
// player being stuck rather than the stream still arriving.
const STUCK_AHEAD_SECONDS = 0.25;

function buffered_ahead(media: HTMLMediaElement): number {
	for (let i = 0; i < media.buffered.length; i++) {
		if (
			media.buffered.start(i) <= media.currentTime &&
			media.buffered.end(i) > media.currentTime
		) {
			return media.buffered.end(i) - media.currentTime;
		}
	}
	return 0;
}

/**
 * Get playback going again whenever it stalls with data to spare.
 *
 * A generator slower than real time drains the buffer and the element stalls,
 * which is expected. What is not is that it stays stalled: the playhead stops,
 * so the buffer ahead of it grows past `maxBufferLength` and hls.js stops
 * loading, and nothing then prods the element even though the data it was
 * waiting for has arrived. hls.js nudges the playhead across a hole in the
 * buffer but not across the end of one, so this covers the other case.
 *
 * It has to be polled rather than driven off the stall event: hls.js reports
 * the stall while the buffer is still empty, which is exactly when nudging
 * would skip real media, and says nothing later when the data has turned up.
 */
export function watch_for_stalls(media: HTMLMediaElement): () => void {
	let last_time = -1;
	let still = 0;
	const timer = setInterval(() => {
		if (media.paused || media.ended || media.seeking) {
			still = 0;
			return;
		}
		if (media.currentTime !== last_time) {
			last_time = media.currentTime;
			still = 0;
			return;
		}
		still += 1;
		if (still < 3 || buffered_ahead(media) < STUCK_AHEAD_SECONDS) return;
		still = 0;
		media.currentTime = media.currentTime + 0.01;
		media.play().catch(() => {});
	}, 250);
	return () => clearInterval(timer);
}

export function create_hls_stream(
	media: HTMLMediaElement,
	url: string,
	on_manifest_parsed?: () => void
): Hls {
	const hls = new Hls({
		// Enough of a cushion that a generator which hiccups does not starve
		// the player outright. One second held so little that any pause in
		// supply stalled playback immediately.
		maxBufferLength: 4,
		maxMaxBufferLength: 30,
		lowLatencyMode: true
	});

	hls.on(Hls.Events.MANIFEST_PARSED, () => on_manifest_parsed?.());

	hls.on(Hls.Events.ERROR, (event, data) => {
		if (!data.fatal) {
			console.debug("HLS non-fatal error:", data.details);
			return;
		}
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

	const stop_watching = watch_for_stalls(media);
	hls.on(Hls.Events.DESTROYING, stop_watching);

	hls.loadSource(url);
	hls.attachMedia(media);

	return hls;
}

export function refresh_hls_stream(hls: Hls): void {
	const level = hls.loadLevelObj;
	const level_index = hls.loadLevel;
	if (!level || level_index < 0) return;

	hls.trigger(Hls.Events.LEVEL_LOADING, {
		url: level.uri,
		level: level_index,
		levelInfo: level,
		pathwayId: level.attrs["PATHWAY-ID"],
		id: 0,
		deliveryDirectives: null
	});
}

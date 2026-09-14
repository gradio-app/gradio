import Hls from "hls.js";

export { Hls };

export function is_hls_supported(): boolean {
	return Hls.isSupported();
}

// How much has to be buffered past the playhead before a stall counts as the
// player being stuck rather than the stream still arriving.
const STUCK_AHEAD_SECONDS = 0.25;

// How far each nudge moves the playhead, and how many in a row are worth
// trying. hls.js gives up after three of its own and raises a fatal error;
// something that will not restart after three is not a drained buffer, and
// walking on through it would step over the media rather than play it.
const NUDGE_SECONDS = 0.01;
const MAX_NUDGES = 3;

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
 * A generator slower than real time drains the buffer and playback stalls,
 * which cannot be helped. That it never restarts can be: once the playhead
 * freezes the buffer ahead of it grows past `maxBufferLength`, so hls.js stops
 * loading and nothing prods the element. hls.js nudges across a hole in the
 * buffer but not across the end of one.
 *
 * Polled rather than driven off the stall event, which hls.js raises while the
 * buffer is still empty and not again once the data has turned up.
 */
export function watch_for_stalls(media: HTMLMediaElement): () => void {
	let last_time = -1;
	let still = 0;
	let nudges = 0;
	const timer = setInterval(() => {
		if (media.paused || media.ended || media.seeking) {
			still = 0;
			return;
		}
		if (media.currentTime !== last_time) {
			// Further than a nudge of its own accord, so playback is running
			// again and the next stall starts with a full budget. A move of
			// exactly the nudge is this watcher's own and settles nothing.
			if (media.currentTime > last_time + NUDGE_SECONDS) nudges = 0;
			last_time = media.currentTime;
			still = 0;
			return;
		}
		still += 1;
		if (still < 3 || buffered_ahead(media) < STUCK_AHEAD_SECONDS) return;
		still = 0;
		if (nudges >= MAX_NUDGES) return;
		nudges += 1;
		media.currentTime = media.currentTime + NUDGE_SECONDS;
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
		// One second was too little to absorb any pause in supply.
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

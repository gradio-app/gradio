import Hls from "hls.js";

export { Hls };

export function is_hls_supported(): boolean {
	return Hls.isSupported();
}

export function create_hls_stream(
	media: HTMLMediaElement,
	url: string,
	on_manifest_parsed?: () => void
): Hls {
	const hls = new Hls({
		maxBufferLength: 1,
		maxMaxBufferLength: 1,
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

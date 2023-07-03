import type { ActionReturn } from "svelte/action";

interface LoadedParams {
	crop_values?: [number, number];
	autoplay?: boolean;
}

export function loaded(
	node: HTMLAudioElement,
	{ crop_values, autoplay }: LoadedParams = {}
): ActionReturn {
	function clamp_playback(): void {
		if (crop_values === undefined) return;

		const start_time = (crop_values[0] / 100) * node.duration;
		const end_time = (crop_values[1] / 100) * node.duration;

		if (node.currentTime < start_time) {
			node.currentTime = start_time;
		}

		if (node.currentTime > end_time) {
			node.currentTime = start_time;
			node.pause();
		}
	}

	async function handle_playback(): Promise<void> {
		if (!autoplay) return;

		node.pause();
		await node.play();
	}

	node.addEventListener("loadeddata", handle_playback);
	node.addEventListener("timeupdate", clamp_playback);

	return {
		destroy(): void {
			node.removeEventListener("loadeddata", handle_playback);
			node.removeEventListener("timeupdate", clamp_playback);
		}
	};
}

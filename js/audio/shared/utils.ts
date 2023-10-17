import type { ActionReturn } from "svelte/action";
import type WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions.js";

export interface LoadedParams {
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

export const skipAudio = (waveform: WaveSurfer, amount: number): void => {
	if (!waveform) return;
	waveform.skip(amount);
};

export const addRegion = (
	waveform: WaveSurfer,
	waveformRegions: Regions,
	start: number,
	end: number
): void => {
	waveformRegions = waveform.registerPlugin(Regions.create());

	waveformRegions.addRegion({
		start: start,
		end: end,
		color: "rgba(255, 0, 0, 0.1)",
		drag: true,
		resize: true
	});
};

export const getSkipRewindAmount = (audioDuration: number): number => {
	// TODO 5 is default fraction but make this an optional prop
	return (audioDuration / 100) * 5;
};

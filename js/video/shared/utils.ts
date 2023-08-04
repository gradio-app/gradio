import type { ActionReturn } from "svelte/action";

export const prettyBytes = (bytes: number): string => {
	let units = ["B", "KB", "MB", "GB", "PB"];
	let i = 0;
	while (bytes > 1024) {
		bytes /= 1024;
		i++;
	}
	let unit = units[i];
	return bytes.toFixed(1) + " " + unit;
};

export const playable = (): boolean => {
	// TODO: Fix this
	// let video_element = document.createElement("video");
	// let mime_type = mime.lookup(filename);
	// return video_element.canPlayType(mime_type) != "";
	return true; // FIX BEFORE COMMIT - mime import causing issues
};

export function loaded(
	node: HTMLVideoElement,
	{ autoplay }: { autoplay: boolean }
): ActionReturn {
	async function handle_playback(): Promise<void> {
		if (!autoplay) return;
		await node.play();
	}

	node.addEventListener("loadeddata", handle_playback);

	return {
		destroy(): void {
			node.removeEventListener("loadeddata", handle_playback);
		}
	};
}

import { toBlobURL } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { lookup } from "mrmime";

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
): any {
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

export default async function loadFfmpeg(): Promise<FFmpeg> {
	const ffmpeg = new FFmpeg();
	const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";

	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
		wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
	});

	return ffmpeg;
}

export function blob_to_data_url(blob: Blob): Promise<string> {
	return new Promise((fulfill, reject) => {
		let reader = new FileReader();
		reader.onerror = reject;
		reader.onload = () => fulfill(reader.result as string);
		reader.readAsDataURL(blob);
	});
}

export async function trimVideo(
	startTime: number,
	endTime: number,
	videoElement: HTMLVideoElement
): Promise<any> {
	try {
		const ffmpeg: FFmpeg = await loadFfmpeg();

		const videoUrl = videoElement.src;
		const mimeType = lookup(videoElement.src) || "video/mp4";
		const blobUrl = await toBlobURL(videoUrl, mimeType);
		const response = await fetch(blobUrl);
		const vidBlob = await response.blob();
		const type = mimeType.split("/")[1] || "mp4";
		const inputName = `input.${type}`;
		const outputName = `output.${type}`;

		await ffmpeg.writeFile(
			inputName,
			new Uint8Array(await vidBlob.arrayBuffer())
		);

		let command = [
			"-i",
			inputName,
			"-ss",
			startTime.toString(),
			"-to",
			endTime.toString(),
			"-c:a",
			"copy",
			outputName
		];

		await ffmpeg.exec(command);
		const outputData = await ffmpeg.readFile(outputName);
		const outputBlob = new Blob([outputData], {
			type: `video/${type}`
		});

		return outputBlob;
	} catch (error) {
		console.error("Error initializing FFmpeg:", error);
	}
}

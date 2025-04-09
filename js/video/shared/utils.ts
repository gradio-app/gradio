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
	ffmpeg: FFmpeg,
	startTime: number,
	endTime: number,
	videoElement: HTMLVideoElement
): Promise<any> {
	const videoUrl = videoElement.src;
	const mimeType = lookup(videoElement.src) || "video/mp4";
	const blobUrl = await toBlobURL(videoUrl, mimeType);
	const response = await fetch(blobUrl);
	const vidBlob = await response.blob();
	const type = getVideoExtensionFromMimeType(mimeType) || "mp4";
	const inputName = `input.${type}`;
	const outputName = `output.${type}`;

	try {
		if (startTime === 0 && endTime === 0) {
			return vidBlob;
		}

		await ffmpeg.writeFile(
			inputName,
			new Uint8Array(await vidBlob.arrayBuffer())
		);

		let command = [
			"-i",
			inputName,
			...(startTime !== 0 ? ["-ss", startTime.toString()] : []),
			...(endTime !== 0 ? ["-to", endTime.toString()] : []),
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
		return vidBlob;
	}
}

const getVideoExtensionFromMimeType = (mimeType: string): string | null => {
	const videoMimeToExtensionMap: { [key: string]: string } = {
		"video/mp4": "mp4",
		"video/webm": "webm",
		"video/ogg": "ogv",
		"video/quicktime": "mov",
		"video/x-msvideo": "avi",
		"video/x-matroska": "mkv",
		"video/mpeg": "mpeg",
		"video/3gpp": "3gp",
		"video/3gpp2": "3g2",
		"video/h261": "h261",
		"video/h263": "h263",
		"video/h264": "h264",
		"video/jpeg": "jpgv",
		"video/jpm": "jpm",
		"video/mj2": "mj2",
		"video/mpv": "mpv",
		"video/vnd.ms-playready.media.pyv": "pyv",
		"video/vnd.uvvu.mp4": "uvu",
		"video/vnd.vivo": "viv",
		"video/x-f4v": "f4v",
		"video/x-fli": "fli",
		"video/x-flv": "flv",
		"video/x-m4v": "m4v",
		"video/x-ms-asf": "asf",
		"video/x-ms-wm": "wm",
		"video/x-ms-wmv": "wmv",
		"video/x-ms-wmx": "wmx",
		"video/x-ms-wvx": "wvx",
		"video/x-sgi-movie": "movie",
		"video/x-smv": "smv"
	};

	return videoMimeToExtensionMap[mimeType] || null;
};

export interface WebcamOptions {
	mirror: boolean;
	constraints: Record<string, any>;
}

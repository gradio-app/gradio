import type { IMediaRecorderConstructor } from "extendable-media-recorder";

let media_recorder_initialized = false;
let media_recorder;

export async function init_media_recorder(): Promise<IMediaRecorderConstructor> {
	const { MediaRecorder, register } = await import("extendable-media-recorder");
	const { connect } = await import("extendable-media-recorder-wav-encoder");

	register(await connect());
	media_recorder_initialized = true;
	media_recorder = MediaRecorder;
	return media_recorder;
}

import type WaveSurfer from "wavesurfer.js";
import { audioBufferToWav } from "./audioBufferToWav";

export interface LoadedParams {
	autoplay?: boolean;
}

export function blob_to_data_url(blob: Blob): Promise<string> {
	return new Promise((fulfill, reject) => {
		let reader = new FileReader();
		reader.onerror = reject;
		reader.onload = () => fulfill(reader.result as string);
		reader.readAsDataURL(blob);
	});
}

export const process_audio = async (
	audioBuffer: AudioBuffer,
	start?: number,
	end?: number,
	waveform_sample_rate?: number
): Promise<Uint8Array> => {
	const audioContext = new AudioContext({
		sampleRate: waveform_sample_rate || audioBuffer.sampleRate
	});
	const numberOfChannels = audioBuffer.numberOfChannels;
	const sampleRate = waveform_sample_rate || audioBuffer.sampleRate;

	let trimmedLength = audioBuffer.length;
	let startOffset = 0;

	if (start && end) {
		startOffset = Math.round(start * sampleRate);
		const endOffset = Math.round(end * sampleRate);
		trimmedLength = endOffset - startOffset;
	}

	const trimmedAudioBuffer = audioContext.createBuffer(
		numberOfChannels,
		trimmedLength,
		sampleRate
	);

	for (let channel = 0; channel < numberOfChannels; channel++) {
		const channelData = audioBuffer.getChannelData(channel);
		const trimmedData = trimmedAudioBuffer.getChannelData(channel);
		for (let i = 0; i < trimmedLength; i++) {
			trimmedData[i] = channelData[startOffset + i];
		}
	}

	return audioBufferToWav(trimmedAudioBuffer);
};

export function loaded(
	node: HTMLAudioElement,
	{ autoplay }: LoadedParams = {}
): void {
	async function handle_playback(): Promise<void> {
		if (!autoplay) return;
		node.pause();
		await node.play();
	}
}

export const skip_audio = (waveform: WaveSurfer, amount: number): void => {
	if (!waveform) return;
	waveform.skip(amount);
};

export const get_skip_rewind_amount = (
	audio_duration: number,
	skip_length?: number | null
): number => {
	if (!skip_length) {
		skip_length = 5;
	}
	return (audio_duration / 100) * skip_length || 5;
};

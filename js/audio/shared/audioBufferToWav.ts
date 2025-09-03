export function audioBufferToWav(audioBuffer: AudioBuffer): Uint8Array {
	const numOfChan = audioBuffer.numberOfChannels;
	const length = audioBuffer.length * numOfChan * 2 + 44;
	const buffer = new ArrayBuffer(length);
	const view = new DataView(buffer);
	let offset = 0;

	// Write WAV header
	const writeString = function (
		view: DataView,
		offset: number,
		string: string
	): void {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	};

	writeString(view, offset, "RIFF");
	offset += 4;
	view.setUint32(offset, length - 8, true);
	offset += 4;
	writeString(view, offset, "WAVE");
	offset += 4;
	writeString(view, offset, "fmt ");
	offset += 4;
	view.setUint32(offset, 16, true);
	offset += 4; // Sub-chunk size, 16 for PCM
	view.setUint16(offset, 1, true);
	offset += 2; // PCM format
	view.setUint16(offset, numOfChan, true);
	offset += 2;
	view.setUint32(offset, audioBuffer.sampleRate, true);
	offset += 4;
	view.setUint32(offset, audioBuffer.sampleRate * 2 * numOfChan, true);
	offset += 4;
	view.setUint16(offset, numOfChan * 2, true);
	offset += 2;
	view.setUint16(offset, 16, true);
	offset += 2;
	writeString(view, offset, "data");
	offset += 4;
	view.setUint32(offset, audioBuffer.length * numOfChan * 2, true);
	offset += 4;

	// Write PCM audio data
	for (let i = 0; i < audioBuffer.length; i++) {
		for (let channel = 0; channel < numOfChan; channel++) {
			const sample = Math.max(
				-1,
				Math.min(1, audioBuffer.getChannelData(channel)[i])
			);
			view.setInt16(offset, sample * 0x7fff, true);
			offset += 2;
		}
	}

	return new Uint8Array(buffer);
}

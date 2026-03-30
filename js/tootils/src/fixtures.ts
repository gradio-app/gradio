import { FileData } from "@gradio/client";

const BASE = "/test/test_files";

function fixture(filename: string, mime_type: string, size: number): FileData {
	const url = `${BASE}/${filename}`;
	return new FileData({
		path: url,
		url,
		orig_name: filename,
		size,
		mime_type
	});
}

export const TEST_TXT = fixture("alphabet.txt", "text/plain", 26);
export const TEST_JPG = fixture("cheetah1.jpg", "image/jpeg", 20552);
export const TEST_PNG = fixture("bus.png", "image/png", 1951);
export const TEST_MP4 = fixture("video_sample.mp4", "video/mp4", 261179);
export const TEST_WAV = fixture("audio_sample.wav", "audio/wav", 16136);
export const TEST_PDF = fixture("sample_file.pdf", "application/pdf", 10558);

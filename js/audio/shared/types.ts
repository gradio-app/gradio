import { FileData } from "@gradio/client";
import type { CustomButton } from "@gradio/utils";

export type WaveformOptions = {
	waveform_color?: string;
	waveform_progress_color?: string;
	show_controls?: boolean;
	skip_length?: number;
	trim_region_color?: string;
	show_recording_waveform?: boolean;
	sample_rate?: number;
};

export interface SubtitleData {
	start: number;
	end: number;
	text: string;
}

export interface AudioProps {
	sources:
		| ["microphone"]
		| ["upload"]
		| ["microphone", "upload"]
		| ["upload", "microphone"];
	value: FileData | null;
	type: "numpy" | "filepath";
	autoplay: boolean;
	buttons: ("play" | "download" | "share" | CustomButton)[];
	recording: boolean;
	loop: boolean;
	subtitles: FileData | SubtitleData[] | null;
	waveform_options: WaveformOptions;
	editable: boolean;
	pending: boolean;
	streaming: boolean;
	stream_every: number;
	input_ready: boolean;
	minimal?: boolean;
	playback_position: number;
}

export interface AudioEvents {
	change: any;
	upload: any;
	stream: any;
	clear: any;
	play: any;
	pause: any;
	stop: any;
	start_recording: any;
	pause_recording: any;
	stop_recording: any;
	input: any;
	error: any;
	warning: any;
	clear_status: any;
	close_stream: any;
	edit: any;
}

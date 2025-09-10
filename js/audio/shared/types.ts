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

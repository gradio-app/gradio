import type { FileData } from "@gradio/client";
import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import type { InputHTMLAttributes } from "./shared/types";
import type { WaveformOptions } from "js/audio/shared/types";

export interface MultimodalTextboxEvents {
	change: { text: string; files: FileData[] };
	submit: never;
	stop: never;
	blur: never;
	select: SelectData;
	input: never;
	focus: never;
	error: string;
	clear_status: LoadingStatus;
	stop_recording: never;
	upload: FileData[] | FileData;
	clear: undefined;
}

export interface MultimodalTextboxProps {
	value: { text: string; files: FileData[] };
	file_types: string[] | null;
	lines: number;
	placeholder: string;
	info: string | undefined;
	max_lines: number;
	submit_btn: string | boolean | null;
	stop_btn: string | boolean | null;
	value_is_output: boolean;
	rtl: boolean;
	text_align: "left" | "right" | undefined;
	autofocus: boolean;
	file_count: "single" | "multiple" | "directory";
	max_plain_text_length: number;
	sources: ("microphone" | "upload")[];
	waveform_options: WaveformOptions;
	html_attributes: InputHTMLAttributes | null;
}

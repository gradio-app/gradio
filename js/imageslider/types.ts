import type {
	SelectData,
	ValueData,
	ShareData,
	CustomButton
} from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import type { FileData } from "@gradio/client";

export interface ImageSliderEvents {
	input: never;
	change: never;
	error: string;
	edit: never;
	stream: ValueData;
	drag: never;
	upload: never;
	clear: never;
	select: SelectData;
	share: ShareData;
	clear_status: LoadingStatus;
	close_stream: string;
}

export interface ImageSliderProps {
	value: [FileData | null, FileData | null];
	height: number | undefined;
	width: number | undefined;
	placeholder: string | undefined;
	buttons: (string | CustomButton)[];
	input_ready: boolean;
	slider_position: number;
	upload_count: number;
	slider_color: string;
	max_height: number;
}

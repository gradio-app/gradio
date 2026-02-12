import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "@gradio/statustracker";

export interface SimpleImageProps {
	value: null | FileData;
	show_download_button: boolean;
	placeholder: string | undefined;
}

export interface SimpleImageEvents {
	change: never;
	upload: never;
	clear: never;
	clear_status: LoadingStatus;
}

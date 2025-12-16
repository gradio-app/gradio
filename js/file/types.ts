import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "js/statustracker";
import type { SelectData, CustomButton } from "@gradio/utils";

export interface FileProps {
	value: FileData | FileData[] | null;
	file_types: string[];
	file_count: "single" | "multiple" | "directory";
	allow_reordering: boolean;
	type: "filepath" | "binary";
	_selectable: boolean;
	height: number | null;
	buttons: (string | CustomButton)[] | null;
}

export interface FileEvents {
	upload: FileData | FileData[];
	download: void;
	error: string;
	clear_status: LoadingStatus;
	clear: void;
	select: SelectData | null;
	change: FileData | FileData[] | null;
	delete: void;
	custom_button_click: { id: number };
}

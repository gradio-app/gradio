import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "js/statustracker";

export interface CheckboxProps {
	value: boolean;
	info: string;
}

export interface CheckboxEvents {
	change: boolean;
	input: boolean;
	select: SelectData;
	clear_status: LoadingStatus;
}

import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "js/statustracker";

export interface CheckboxProps {
	value: boolean;
	info: string;
	on_change: (value: boolean) => void;
	on_input: (value: boolean) => void;
	on_select: (data: SelectData) => void;
}

export interface CheckboxEvents {
	change: boolean;
	input: boolean;
	select: SelectData;
	clear_status: LoadingStatus;
}

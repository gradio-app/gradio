import type { SelectData, CustomButton } from "@gradio/utils";
import type { LoadingStatus } from "js/statustracker";

export interface CheckboxProps {
	value: boolean;
	info: string;
	buttons: (string | CustomButton)[] | null;
}

export interface CheckboxEvents {
	change: boolean;
	input: boolean;
	select: SelectData;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}

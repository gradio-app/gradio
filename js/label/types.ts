import type { SelectData, LoadingStatus, CustomButton } from "@gradio/utils";

export interface LabelProps {
	value: {
		label?: string;
		confidences?: { label: string; confidence: number }[];
	};
	color: undefined | string;
	_selectable: boolean;
	show_heading: boolean;
	buttons: (string | CustomButton)[] | null;
}

export interface LabelEvents {
	change: never;
	select: SelectData;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}

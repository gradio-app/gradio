import type { SelectData, LoadingStatus } from "@gradio/utils";

export interface LabelProps {
	value: {
		label?: string;
		confidences?: { label: string; confidence: number }[];
	};
	color: undefined | string;
	_selectable: boolean;
	show_heading: boolean;
}

export interface LabelEvents {
	change: never;
	select: SelectData;
	clear_status: LoadingStatus;
}

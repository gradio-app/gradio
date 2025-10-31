import type { LoadingStatus } from "@gradio/statustracker";

export interface SimpleTextboxProps {
	value: string;
	placeholder: string;
	rtl: boolean;
}

export interface SimpleTextboxEvents {
	change: never;
	submit: never;
	input: never;
	clear_status: LoadingStatus;
}

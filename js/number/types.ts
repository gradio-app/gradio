import type { LoadingStatus } from "js/statustracker";
import type { CustomButton } from "@gradio/utils";

export interface NumberProps {
	value: number | null;
	placeholder: string;
	minimum: number | undefined;
	maximum: number | undefined;
	step: number | null;
	info: string | undefined;
	buttons: (string | CustomButton)[] | null;
}

export interface NumberEvents {
	change: never;
	input: never;
	submit: never;
	blur: never;
	focus: never;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}

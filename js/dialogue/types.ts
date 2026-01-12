import type { CustomButton } from "@gradio/utils";

export interface DialogueProps {
	value: { speaker: string; text: string }[] | string;
	buttons: (string | CustomButton)[];
	ui_mode: "dialogue" | "text" | "both";
	max_lines: number;
	tags: string[];
	separator: string;
	color_map: { [key: string]: string };
	speakers: string[];
	info: string;
	placeholder: string;
	submit_btn: string | boolean;
}

export interface DialogueEvents {
	change: never;
	input: never;
	submit: never;
	clear_status: any;
	custom_button_click: { id: number };
}

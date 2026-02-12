import type { CustomButton } from "@gradio/utils";

export interface CodeProps {
	value: string;
	language: string;
	max_lines: number;
	wrap_lines: boolean;
	show_line_numbers: boolean;
	autocomplete: boolean;
	lines: number;
	buttons: (string | CustomButton)[] | null;
}

export interface CodeEvents {
	change: any;
	input: any;
	focus: any;
	blur: any;
	clear_status: any;
	custom_button_click: { id: number };
}

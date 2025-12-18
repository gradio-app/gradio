import type { SelectData, CustomButton } from "@gradio/utils";

export interface CheckboxGroupProps {
	value: (string | number)[];
	choices: [string, string | number][];
	info: string;
	show_select_all: boolean;
	buttons: (string | CustomButton)[] | null;
}

export interface CheckboxGroupEvents {
	change: (string | number)[];
	input: (string | number)[];
	select: SelectData;
	clear_status: void;
	custom_button_click: { id: number };
}

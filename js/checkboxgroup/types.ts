import type { SelectData } from "@gradio/utils";

export interface CheckboxGroupProps {
	value: (string | number)[];
	choices: [string, string | number][];
	info: string;
	show_select_all: boolean;
}

export interface CheckboxGroupEvents {
	change: (string | number)[];
	input: (string | number)[];
	select: SelectData;
}

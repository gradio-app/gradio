import type { KeyUpData, SelectData } from "@gradio/utils";

export type Item = string | number;

export interface DropdownProps {
	multiselect: boolean;
	max_choices: number | null;
	choices: [string, Item][];
	allow_custom_value: boolean;
	value: Item | Item[];
	info: string;
	filterable: boolean;
}

export interface DropdownEvents {
	change: never;
	input: never;
	select: SelectData;
	focus: never;
	blur: never;
	key_up: KeyUpData;
}

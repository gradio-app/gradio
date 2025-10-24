import type { SelectData } from "@gradio/utils";

export interface CheckboxProps {
	value: boolean;
	info: string;
}

export interface CheckboxEvents {
	change: boolean;
	input: boolean;
	select: SelectData;
}

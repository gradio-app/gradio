export interface ColorPickerProps {
	value: string;
	info: string;
}

export interface ColorPickerEvents {
	change: never;
	input: never;
	release: string;
	submit: never;
	focus: never;
	blur: never;
	clear_status: any;
}

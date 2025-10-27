export interface DialogueProps {
	value: { speaker: string; text: string }[] | string;
	buttons: string[];
	ui_mode: "dialogue" | "text" | "both";
	max_lines: number;
	tags: string[];
	separator: string;
	color_map: { [key: string]: string };
	speakers: string[];
	info: string;
	placeholder: string;
}

export interface DialogueEvents {
	change: never;
	input: never;
	submit: never;
	clear_status: any;
}

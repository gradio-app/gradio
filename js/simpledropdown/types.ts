import type { LoadingStatus } from "@gradio/statustracker";

export interface SimpleDropdownProps {
	value: string | number;
	choices: [string, string | number][];
}

export interface SimpleDropdownEvents {
	change: string;
	input: never;
	select: never;
	clear_status: LoadingStatus;
}

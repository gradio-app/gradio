import type { LoadingStatus } from "js/statustracker";

export interface NumberProps {
	value: number | null;
	placeholder: string;
	minimum: number | undefined;
	maximum: number | undefined;
	step: number | null;
	info: string | undefined;
}

export interface NumberEvents {
	change: never;
	input: never;
	submit: never;
	blur: never;
	focus: never;
	clear_status: LoadingStatus
}

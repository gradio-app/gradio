import type { LoadingStatus } from "@gradio/statustracker";

export interface SliderEvents {
	change: never;
	input: never;
	release: number;
	clear_status: LoadingStatus;
}

export interface SliderProps {
	value: number;
	minimum: number;
	maximum: number;
	step: number;
	buttons: string[] | null;
	info: string | undefined;
}

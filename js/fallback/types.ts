import type { LoadingStatus } from "@gradio/statustracker";
import type { SelectData } from "@gradio/utils";

export interface FallbackProps {
	value: unknown;
}

export interface FallbackEvents {
	change: never;
	select: SelectData;
	input: never;
	clear_status: LoadingStatus;
}

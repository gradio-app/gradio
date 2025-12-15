import type { LoadingStatus } from "@gradio/statustracker";
import type { SelectData, CustomButton } from "@gradio/utils";

export interface RadioProps {
	choices: [string, string | number][];
	value: string;
	info: string;
	rtl: boolean;
	buttons: (string | CustomButton)[] | null;
}

export interface RadioEvents {
	select: SelectData;
	change: any;
	input: any;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}

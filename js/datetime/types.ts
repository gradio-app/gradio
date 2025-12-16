import type { CustomButton } from "@gradio/utils";

export interface DateTimeProps {
	value: string;
	include_time: boolean;
	type: "timestamp" | "datetime" | "string";
	timezone: string | null;
	info: string;
	buttons: (string | CustomButton)[] | null;
}

export interface DateTimeEvents {
	change: never;
	submit: never;
	custom_button_click: { id: number };
}

import type { CustomButton } from "@gradio/utils";

export interface HTMLProps {
	value: string;
	html_template: string;
	css_template: string;
	js_on_load: string | null;
	apply_default_css: boolean;
	show_label: boolean;
	min_height: number | undefined;
	max_height: number | undefined;
	props: Record<string, any>;
	component_class_name: string;
	buttons: (string | CustomButton)[] | null;
}

export interface HTMLEvents {
	change: never;
	click: never;
	submit: never;
	custom_button_click: { id: number };
}

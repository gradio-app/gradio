import { type SelectData, type CopyData } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";

export interface TextboxEvents {
	change: string;
	submit: never;
	blur: never;
	select: SelectData;
	input: never;
	focus: never;
	stop: never;
	clear_status: LoadingStatus;
	copy: CopyData;
}

export interface TextboxProps {
	value: string;
	info: string;
	lines: number;
	type: "text" | "password" | "email" | undefined;
	rtl: boolean;
	text_align: "right" | "left";
	max_lines: number;
	placeholder: string;
	submit_btn: string;
	stop_btn: string;
	show_copy_button: boolean;
	autofocus: boolean;
	autoscroll: boolean;
	max_length: number;
	html_attributes: InputHTMLAttributes;
	validation_error: string | null;
}

type FullAutoFill =
	| AutoFill
	| "bday"
	| `${OptionalPrefixToken<AutoFillAddressKind>}${"cc-additional-name"}`
	| "nickname"
	| "language"
	| "organization-title"
	| "photo"
	| "sex"
	| "url";

export interface InputHTMLAttributes {
	autocapitalize?:
		| "off"
		| "none"
		| "on"
		| "sentences"
		| "words"
		| "characters"
		| null;
	autocorrect?: "on" | "off" | null;
	spellcheck?: boolean | null;
	autocomplete?: FullAutoFill | undefined | null;
	tabindex?: number | null;
	enterkeyhint?:
		| "enter"
		| "done"
		| "go"
		| "next"
		| "previous"
		| "search"
		| "send"
		| null;
	lang?: string | null;
}

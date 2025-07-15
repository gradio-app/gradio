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
	autocomplete?: string | null;
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

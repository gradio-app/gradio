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

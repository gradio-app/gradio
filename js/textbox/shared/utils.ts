import type { InputHTMLAttributes } from "./types";

export function convertHtmlAttributes(attrs: InputHTMLAttributes | null | undefined): Record<string, string> {
	if (!attrs) return {};
	
	const result: Record<string, string> = {};
	
	// Helper function to add attribute if not null
	const addAttr = (key: string, value: any): void => {
		if (value !== null && value !== undefined) {
			if (typeof value === 'boolean') {
				result[key] = value ? 'true' : 'false';
			} else {
				result[key] = String(value);
			}
		}
	};
	
	// Convert each attribute
	addAttr('autocapitalize', attrs.autocapitalize);
	addAttr('autocorrect', attrs.autocorrect);
	addAttr('spellcheck', attrs.spellcheck);
	addAttr('autocomplete', attrs.autocomplete);
	addAttr('tabindex', attrs.tabindex);
	addAttr('enterkeyhint', attrs.enterkeyhint);
	addAttr('lang', attrs.lang);
	addAttr('aria-label', attrs.aria_label);
	addAttr('aria-describedby', attrs.aria_describedby);
	addAttr('aria-placeholder', attrs.aria_placeholder);
	
	return result;
} 
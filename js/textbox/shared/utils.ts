import type { InputHTMLAttributes } from "./types";

export function convert_html_attributes(attrs: InputHTMLAttributes | null | undefined): Record<string, string> {
	if (!attrs) return {};
	
	const result: Record<string, string> = {};
	
	const add_attr = (key: string, value: any): void => {
		if (value !== null && value !== undefined) {
			if (typeof value === 'boolean') {
				result[key] = value ? 'true' : 'false';
			} else {
				result[key] = String(value);
			}
		}
	};
	
	const to_kebab_case = (str: string): string => {
		return str.replace(/_/g, '-');
	};
	
	for (const [key, value] of Object.entries(attrs)) {
		const html_key = to_kebab_case(key);
		add_attr(html_key, value);
	}
	
	return result;
} 
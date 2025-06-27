import type { InputHTMLAttributes } from "./types";

export function convert_html_attributes(
	attrs: InputHTMLAttributes | null | undefined
): Record<string, string> {
	if (!attrs) return {};

	const result: Record<string, string> = {};

	const add_attr = (key: string, value: any): void => {
		if (value !== null && value !== undefined) {
			if (typeof value === "boolean") {
				result[key] = value ? "true" : "false";
			} else {
				result[key] = String(value);
			}
		}
	};

	const add_autocorrect = (value: boolean | null | undefined): void => {
		if (value !== null && value !== undefined) {
			result["autocorrect"] = value ? "on" : "off";
		}
	};

	const add_autocapitalize = (value: string | null | undefined): void => {
		if (value !== null && value !== undefined) {
			const mapping: Record<string, string> = {
				sentences: "sentences",
				words: "words",
				characters: "characters",
				off: "off",
				none: "off",
				false: "off",
				true: "sentences"
			};
			result["autocapitalize"] = mapping[value.toLowerCase()] || value;
		}
	};

	for (const [key, value] of Object.entries(attrs)) {
		if (key === "autocapitalize") {
			add_autocapitalize(value);
		}
		if (key === "autocorrect") {
			add_autocorrect(value);
		}
		const htmlKey = key.replace(/_/g, "-");
		add_attr(htmlKey, value);
	}

	return result;
}

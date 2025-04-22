import { format, _ } from "svelte-i18n";
import { get } from "svelte/store";
import { all_common_keys } from "./i18n";

export { Gradio } from "@gradio/utils";
export type I18nFormatter = typeof formatter;

/**
 * i18n formatter with fallback to svelte-i18n's format function.
 *
 * @param value - The string to translate or format
 * @returns The translated string
 *
 * This formatter attempts translation in the following order:
 * 1. Direct translation of the input string
 * 2. Checks if input matches any common key names
 * 3. Falls back to svelte-i18n's format function
 */
export function formatter(value: string | null | undefined): string {
	if (value == null) {
		return "";
	}
	const string_value = String(value);
	const translate = get(_);
	const initial_formatter = get(format);

	let direct_translation = translate(string_value);

	if (direct_translation !== string_value) {
		return direct_translation;
	}

	const lower_value = string_value.toLowerCase();

	for (const common_key of all_common_keys) {
		const key_name = common_key.substring(common_key.indexOf(".") + 1);

		if (lower_value === key_name) {
			const translation = translate(common_key);

			if (translation !== common_key) {
				return translation;
			}
			break;
		}
	}

	// fall back to the svelte-i18n formatter to maintain compatibility
	const formatted = initial_formatter(string_value);
	if (formatted !== string_value) {
		return formatted;
	}

	return string_value;
}

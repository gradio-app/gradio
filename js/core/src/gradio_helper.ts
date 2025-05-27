import { all_common_keys } from "./i18n";
import { _ } from "svelte-i18n";
import { get, derived } from "svelte/store";
export { Gradio } from "@gradio/utils";

export type I18nFormatter = typeof formatter;

export function formatter(value: string | null | undefined): string {
	if (value == null) {
		return "";
	}
	const string_value = String(value);
	const translate = get(_);

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

	return string_value;
}

export const reactive_formatter = derived(_, () => formatter);

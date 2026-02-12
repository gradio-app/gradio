import { _ } from "svelte-i18n";
import { get, derived } from "svelte/store";
export { Gradio } from "@gradio/utils";
import { I18N_MARKER, translate_i18n_marker } from "@gradio/utils";

export type I18nFormatter = typeof formatter;

export function formatter(value: string | null | undefined): string {
	if (value == null) {
		return "";
	}
	const string_value = String(value);
	const translate = get(_);

	if (string_value.includes(I18N_MARKER)) {
		return translate_i18n_marker(string_value, translate);
	}

	const direct_translation = translate(string_value);
	if (direct_translation !== string_value) {
		return direct_translation;
	}

	return string_value;
}

export const reactive_formatter = derived(_, () => formatter);

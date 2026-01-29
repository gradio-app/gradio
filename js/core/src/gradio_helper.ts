import { i18n_marker } from "./i18n";
import { _ } from "svelte-i18n";
import { get, derived } from "svelte/store";
export { Gradio } from "@gradio/utils";

export type I18nFormatter = typeof formatter;

function translate_i18n_marker(
	value: string,
	translate: (key: string) => string
): string {
	const start = value.indexOf(i18n_marker);
	if (start === -1) return value;

	const json_start = start + i18n_marker.length;
	const json_end = value.indexOf("}", json_start) + 1;
	if (json_end === 0) return value;

	try {
		const metadata = JSON.parse(value.slice(json_start, json_end));
		if (metadata?.key) {
			const translated = translate(metadata.key);
			const result = translated !== metadata.key ? translated : metadata.key;
			return value.slice(0, start) + result + value.slice(json_end);
		}
	} catch {}

	return value;
}

export function formatter(value: string | null | undefined): string {
	if (value == null) {
		return "";
	}
	const string_value = String(value);
	const translate = get(_);

	if (string_value.includes(i18n_marker)) {
		return translate_i18n_marker(string_value, translate);
	}

	const direct_translation = translate(string_value);
	if (direct_translation !== string_value) {
		return direct_translation;
	}

	return string_value;
}

export const reactive_formatter = derived(_, () => formatter);

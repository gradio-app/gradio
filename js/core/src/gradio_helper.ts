import { all_common_keys, i18n_marker } from "./i18n";
import { _ } from "svelte-i18n";
import { get, derived } from "svelte/store";
export { Gradio } from "@gradio/utils";

export type I18nFormatter = typeof formatter;


function translate_i18n_marker(value: string, translate: (key: string) => string): string {
	const marker_index = value.indexOf(i18n_marker);
	if (marker_index === -1) {
		return value;
	}

	try {
		const before_marker = marker_index > 0 ? value.substring(0, marker_index) : "";
		const json_start = value.indexOf("{", marker_index + i18n_marker.length);
		let json_end = -1;
		let bracket_count = 0;

		for (let i = json_start; i < value.length; i++) {
			if (value[i] === "{") bracket_count++;
			if (value[i] === "}") bracket_count--;
			if (bracket_count === 0) {
				json_end = i + 1;
				break;
			}
		}

		if (json_end === -1) {
			return value;
		}

		const metadata_json = value.substring(json_start, json_end);
		const after_json = json_end < value.length ? value.substring(json_end) : "";
		const metadata = JSON.parse(metadata_json);

		if (metadata && metadata.key) {
			const translated = translate(metadata.key);
			return before_marker + (translated !== metadata.key ? translated : metadata.key) + after_json;
		}
	} catch {

	}

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

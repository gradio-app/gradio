import { _ } from "svelte-i18n";
import { get } from "svelte/store";
import { all_common_keys } from "./i18n";
import { Gradio as GradioBase } from "@gradio/utils";

export const Gradio = GradioBase;

export function formatter(value: string | null | undefined): string {
	if (value == null) {
		return "";
	}
	const stringValue = String(value);

	const translate = get(_);

	let direct_translation = translate(stringValue);

	if (direct_translation !== stringValue) {
		return direct_translation;
	}

	const lower_value = stringValue.toLowerCase();

	for (const common_key of all_common_keys) {
		const key_name = common_key.substring(common_key.indexOf(".") + 1); // e.g., key_name = "flag"

		if (lower_value === key_name) {
			const translation = translate(common_key);

			if (translation !== common_key) {
				return translation;
			}
			break;
		}
	}

	return stringValue;
}

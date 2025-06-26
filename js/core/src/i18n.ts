import {
	addMessages,
	init,
	getLocaleFromNavigator,
	locale,
	register,
	waitLocale
} from "svelte-i18n";
import { formatter } from "./gradio_helper";

const langs = import.meta.glob("./lang/*.json");

export interface I18nData {
	__type__: "translation_metadata";
	key: string;
}

export interface LangsRecord {
	[lang: string]: () => Promise<unknown>;
}

export function is_translation_metadata(obj: any): obj is I18nData {
	const result =
		obj &&
		typeof obj === "object" &&
		obj.__type__ === "translation_metadata" &&
		typeof obj.key === "string";

	return result;
}

// handles strings with embedded JSON metadata of shape "__i18n__{"key": "some.key"}"
export function translate_if_needed(value: any): string {
	if (typeof value !== "string") {
		return value;
	}

	const i18n_marker = "__i18n__";
	const marker_index = value.indexOf(i18n_marker);

	if (marker_index === -1) {
		return value;
	}

	try {
		const before_marker =
			marker_index > 0 ? value.substring(0, marker_index) : "";

		const after_marker_index = marker_index + i18n_marker.length;
		const json_start = value.indexOf("{", after_marker_index);
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
			console.error("Could not find end of JSON in i18n string");
			return value;
		}

		const metadata_json = value.substring(json_start, json_end);
		const after_json = json_end < value.length ? value.substring(json_end) : "";

		try {
			const metadata = JSON.parse(metadata_json);

			if (metadata && metadata.key) {
				const translated = formatter(metadata.key);
				return before_marker + translated + after_json;
			}
		} catch (jsonError) {
			console.error("Error parsing i18n JSON:", jsonError);
		}

		return value;
	} catch (e) {
		console.error("Error processing translation:", e);
		return value;
	}
}

export function process_langs(): LangsRecord {
	return Object.fromEntries(
		Object.entries(langs).map(([path, mod]) => [
			path.split("/").pop()!.split(".")[0],
			mod
		])
	);
}

const processed_langs = process_langs();
const available_locales = Object.keys(processed_langs);

export const language_choices: [string, string][] = Object.entries(
	processed_langs
).map(([code, data]) => [code, code]);

export let all_common_keys: Set<string> = new Set();

let i18n_initialized = false;
let previous_translations: Record<string, Record<string, string>> | undefined;

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>
): Promise<void> {
	const should_reinitialize =
		i18n_initialized && custom_translations !== previous_translations;

	if (i18n_initialized && !should_reinitialize) {
		return;
	}

	previous_translations = custom_translations;

	load_translations({
		processed_langs,
		custom_translations: custom_translations ?? {}
	});

	const browser_locale = getLocaleFromNavigator();

	let initial_locale =
		browser_locale && available_locales.includes(browser_locale)
			? browser_locale
			: null;

	if (!initial_locale) {
		const normalized_locale = browser_locale?.split("-")[0];
		initial_locale =
			normalized_locale && available_locales.includes(normalized_locale)
				? normalized_locale
				: "en";
	}

	await init({
		fallbackLocale: "en",
		initialLocale: initial_locale
	});

	await waitLocale();

	i18n_initialized = true;
}

export function changeLocale(new_locale: string): void {
	locale.set(new_locale);
}

export function get_initial_locale(
	browser_locale: string | null,
	available_locales: string[],
	fallback_locale = "en"
): string {
	if (!browser_locale) return fallback_locale;

	if (available_locales.includes(browser_locale)) {
		return browser_locale;
	}

	return fallback_locale;
}

export function load_translations(translations: {
	processed_langs: LangsRecord;
	custom_translations: Record<string, Record<string, string>>;
}): void {
	if (!translations) {
		return;
	}

	try {
		for (const lang in translations.custom_translations) {
			addMessages(lang, translations.custom_translations[lang]);
		}

		for (const lang in translations.processed_langs) {
			register(lang, translations.processed_langs[lang]);
		}
	} catch (e) {
		console.error("Error loading translations:", e);
	}
}

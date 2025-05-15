import { addMessages, init, getLocaleFromNavigator, locale } from "svelte-i18n";
import { formatter } from "./gradio_helper";

const langs = import.meta.glob("./lang/*.json", {
	eager: true
});

export interface TranslationMetadata {
	__type__: "translation_metadata";
	key: string;
}

export interface LangsRecord {
	[lang: string]: any;
}

// Checks if an object is a TranslationMetadata object
export function is_translation_metadata(obj: any): obj is TranslationMetadata {
	console.log(obj);
	const result =
		obj &&
		typeof obj === "object" &&
		obj.__type__ === "translation_metadata" &&
		typeof obj.key === "string";

	return result;
}

// handles explicit translation metadata objects of shape { __type__: "translation_metadata", key: string }
export function translate_metadata(metadata: TranslationMetadata): string {
	if (!is_translation_metadata(metadata)) {
		return String(metadata);
	}

	try {
		const { key } = metadata;
		return formatter(key);
	} catch (e) {
		console.error("Error translating metadata:", e);
		return metadata.key;
	}
}

// handles strings with embedded JSON metadata of shape "__i18n__{"key": "some.key"}"
export function translate_if_needed(value: any): string {
	if (typeof value !== "string") {
		return value;
	}

	// find i18n markers anywhere in the string
	const i18n_marker = "__i18n__";
	const marker_index = value.indexOf(i18n_marker);

	// skip if the string doesn't have the i18n marker
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
		Object.entries(langs).map(([path, module]) => [
			path.split("/").pop()!.split(".")[0],
			(module as Record<string, any>).default
		])
	);
}

const processed_langs = process_langs();
const available_locales = Object.keys(processed_langs);

export const language_choices: [string, string][] = Object.entries(
	processed_langs
).map(([code, data]) => [data._name || code, code]);

export let all_common_keys: Set<string> = new Set();

let i18n_initialized = false;

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>
): Promise<void> {
	if (i18n_initialized) {
		return;
	}

	load_translations({
		...processed_langs,
		...(custom_translations ?? {})
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

	for (const lang_code in processed_langs) {
		if (
			processed_langs[lang_code] &&
			typeof processed_langs[lang_code] === "object" &&
			processed_langs[lang_code].common &&
			typeof processed_langs[lang_code].common === "object"
		) {
			const common_ns = processed_langs[lang_code].common;
			for (const key in common_ns) {
				all_common_keys.add(`common.${key}`);
			}
		}
	}

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

export function load_translations(
	translations: LangsRecord | null | undefined
): void {
	if (!translations) {
		return;
	}

	try {
		for (const lang in translations) {
			addMessages(lang, translations[lang]);
		}
	} catch (e) {
		console.error("Error loading translations:", e);
	}
}

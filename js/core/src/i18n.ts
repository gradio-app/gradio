import {
	addMessages,
	init,
	getLocaleFromNavigator,
	locale,
	_
} from "svelte-i18n";
import { formatter } from "./gradio_helper";

const langs = import.meta.glob("./lang/*.json", {
	eager: true
});

type LangsRecord = Record<
	string,
	{
		[key: string]: any;
	}
>;

interface TranslationMetadata {
	__type__: "translation_metadata";
	key: string;
}

// checks if an object is a TranslationMetadata object
export function is_translation_metadata(obj: any): obj is TranslationMetadata {
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
		let translated = formatter(key);
		return translated;
	} catch (e) {
		console.error("Error translating metadata:", e);
		return metadata.key;
	}
}

// handles strings with embedded JSON metadata of shape "__i18n__{"key": "some.key"}"
export function translate_if_needed(value: string): string {
	if (typeof value !== "string") {
		return value;
	}

	const match = value.match(/^__i18n__(.+)$/);
	if (!match) {
		return value;
	}

	try {
		const metadataJson = match[1];
		const metadata = JSON.parse(metadataJson);

		if (metadata && metadata.key) {
			return formatter(metadata.key);
		}

		return value;
	} catch (e) {
		console.error("Error processing translation:", e);
		return value;
	}
}

// recursively processes objects and arrays to translate any i18n-marked strings while preserving object structure
export function process_i18n_obj(obj: any): any {
	if (obj == null || typeof obj !== "object") {
		return typeof obj === "string" ? translate_if_needed(obj) : obj;
	}

	if (
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Promise ||
		(typeof obj.get === "function" && typeof obj.set === "function") || // Map-like
		(typeof obj.add === "function" && typeof obj.has === "function") || // Set-like
		(typeof obj.then === "function" && typeof obj.catch === "function") // Promise-like
	) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(process_i18n_obj);
	}

	const result: Record<string, any> = {};
	const skipProps = ["gradio", "parent", "__proto__", "constructor"];

	for (const key in obj) {
		if (skipProps.includes(key)) {
			result[key] = obj[key];
			continue;
		}

		if (typeof obj[key] === "function") {
			result[key] = obj[key];
		} else {
			result[key] = process_i18n_obj(obj[key]);
		}
	}

	return result;
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

export function get_initial_locale(
	browser_locale: string | null,
	available_locales: string[],
	fallback_locale = "en"
): string {
	if (!browser_locale) return fallback_locale;

	if (available_locales.includes(browser_locale)) {
		return browser_locale;
	}

	const normalized_locale = browser_locale.split("-")[0];
	if (normalized_locale && available_locales.includes(normalized_locale)) {
		return normalized_locale;
	}

	return fallback_locale;
}

export async function init_i18n(
	initial_locale: string,
	fallback_locale = "en"
): Promise<void> {
	await init({
		fallbackLocale: fallback_locale,
		initialLocale: initial_locale
	});

	all_common_keys = new Set(
		Object.values(processed_langs)
			.filter((lang) => lang?.common)
			.flatMap((lang) => Object.keys(lang.common).map((key) => `common.${key}`))
	);
}

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>
): Promise<void> {
	load_translations({
		...processed_langs,
		...(custom_translations ?? {})
	});
	const initial_locale = get_initial_locale(
		getLocaleFromNavigator(),
		available_locales
	);

	await init_i18n(initial_locale);
}

export function changeLocale(new_locale: string): void {
	locale.set(new_locale);
}

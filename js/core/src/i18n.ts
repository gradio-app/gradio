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

	// skip if the string doesn't start with __i18n__
	if (!value.startsWith("__i18n__")) {
		return value;
	}

	try {
		// remove the __i18n__ prefix
		const metadataJson = value.substring(8);
		const metadata = JSON.parse(metadataJson);

		if (metadata && metadata.key) {
			const translated = formatter(metadata.key);
			return translated;
		}

		return value;
	} catch (e) {
		console.error("Error processing translation:", e);
		return value;
	}
}

// helper function to check if an object is a special non-traversable type
function is_special_object(obj: any): boolean {
	return (
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Promise ||
		// DOM and browser-specific objects
		(typeof window !== "undefined" &&
			(obj instanceof Node ||
				obj instanceof Window ||
				obj instanceof CSSStyleSheet ||
				obj instanceof HTMLElement ||
				obj instanceof EventTarget)) ||
		// objects with methods that suggest they're special types
		(typeof obj.get === "function" && typeof obj.set === "function") || // Map-like
		(typeof obj.add === "function" && typeof obj.has === "function") || // Set-like
		(typeof obj.then === "function" && typeof obj.catch === "function") // Promise-like
	);
}

function is_plain_object(obj: any): boolean {
	if (obj === null || typeof obj !== "object") return false;

	if (typeof window !== "undefined") {
		if (obj instanceof Node || obj instanceof Window) return false;
	}

	if (Object.getPrototypeOf(obj) !== Object.prototype) return false;

	return true;
}

function process_array(
	arr: any[],
	processedObjects: WeakMap<object, any>
): any[] {
	const result: any[] = [];

	processedObjects.set(arr, result);
	for (let i = 0; i < arr.length; i++) {
		result[i] = process_i18n_obj(arr[i], processedObjects);
	}
	return result;
}

function process_object(
	obj: any,
	processedObjects: WeakMap<object, any>
): Record<string, any> {
	const result: Record<string, any> = {};

	try {
		processedObjects.set(obj, result);

		const skipProps = ["gradio", "parent", "__proto__", "constructor"];

		const keys = Object.keys(obj);

		for (const key of keys) {
			try {
				if (skipProps.includes(key)) {
					result[key] = obj[key];
					continue;
				}

				const value = obj[key];

				if (typeof value === "function") {
					result[key] = value;
				} else {
					result[key] = process_i18n_obj(value, processedObjects);
				}
			} catch (propertyError) {
				try {
					result[key] = obj[key];
				} catch (e) {}
			}
		}
	} catch (e) {
		return obj;
	}

	return result;
}

// recursively processes objects and arrays to translate any i18n-marked strings while preserving object structure
export function process_i18n_obj(
	obj: any,
	processedObjects = new WeakMap()
): any {
	// Base case - prevent deep recursion
	if (obj == null) {
		return obj;
	}

	// Handle primitive types - only strings need translation
	if (typeof obj !== "object") {
		return typeof obj === "string" ? translate_if_needed(obj) : obj;
	}

	// Try-catch to handle potential DOM/browser errors
	try {
		// Check if we've already processed this object (handles circular references)
		if (processedObjects.has(obj)) {
			return processedObjects.get(obj);
		}
	} catch (e) {
		// If we can't check the WeakMap (e.g., for certain DOM objects), return the object as is
		return obj;
	}

	// Early return for non-traversable objects
	if (is_special_object(obj)) {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return process_array(obj, processedObjects);
	}

	// Safely check if it's a plain object before processing
	if (!is_plain_object(obj)) {
		return obj;
	}

	// Handle objects
	return process_object(obj, processedObjects);
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

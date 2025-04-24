import {
	addMessages,
	init,
	getLocaleFromNavigator,
	locale,
	_
} from "svelte-i18n";

const langs = import.meta.glob("./lang/*.json", {
	eager: true
});

type LangsRecord = Record<
	string,
	{
		[key: string]: any;
	}
>;

export function process_langs(): LangsRecord {
	let _langs: LangsRecord = {};

	for (const lang in langs) {
		const code = (lang.split("/").pop() as string).split(".").shift() as string;
		_langs[code] = (langs[lang] as Record<string, any>).default;
	}

	return _langs;
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

	for (const lang in translations) {
		addMessages(lang, translations[lang]);
	}
}

export function get_init_state(): boolean {
	return _i18n_initialized;
}
export function set_init_state(state: boolean): void {
	_i18n_initialized = state;
}

export function get_initial_locale(
	browser_locale: string | null,
	available_locales: string[],
	fallback_locale = "en"
): string {
	const normalized_locale = browser_locale?.split("-")[0];

	return normalized_locale && available_locales.includes(normalized_locale)
		? normalized_locale
		: fallback_locale;
}

let _i18n_initialized = false;

export async function init_i18n(
	initial_locale: string,
	fallback_locale = "en"
): Promise<void> {
	await init({
		fallbackLocale: fallback_locale,
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
}

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>
): Promise<void> {
	if (get_init_state()) {
		return;
	}

	try {
		load_translations(processed_langs);

		const browser_locale = getLocaleFromNavigator();
		const initial_locale = get_initial_locale(
			browser_locale,
			available_locales
		);

		await init_i18n(initial_locale);

		if (custom_translations) {
			load_translations(custom_translations);
		}

		set_init_state(true);
	} catch (error) {
		console.error("Error initializing i18n:", error);
	}
}

export function changeLocale(new_locale: string): void {
	locale.set(new_locale);
}

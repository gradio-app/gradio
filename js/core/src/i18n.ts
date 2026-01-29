import {
	addMessages,
	init,
	getLocaleFromNavigator,
	locale,
	register,
	waitLocale
} from "svelte-i18n";
import { loading } from "./lang/loading";

const lang_map = {
	ar: "العربية",
	ca: "Català",
	ckb: "کوردی",
	de: "Deutsch",
	en: "English",
	es: "Español",
	eu: "Euskara",
	fa: "فارسی",
	fi: "Suomi",
	fr: "Français",
	he: "עברית",
	hi: "हिंदी",
	ja: "日本語",
	ko: "한국어",
	lt: "Lietuvių",
	nb: "Norsk bokmål",
	nl: "Nederlands",
	pl: "Polski",
	"pt-BR": "Português do Brasil",
	pt: "Português",
	ro: "Română",
	ru: "Русский",
	sv: "Svenska",
	ta: "தமிழ்",
	th: "ภาษาไทย",
	tr: "Türkçe",
	uk: "Українська",
	ur: "اردو",
	uz: "O'zbek",
	"zh-CN": "简体中文",
	"zh-TW": "繁體中文"
};

const langs = import.meta.glob("./lang/*.json");
import en from "./lang/en.json";

export interface I18nData {
	__type__: "translation_metadata";
	key: string;
}

export type Lang = {
	[key: string]: Record<string, string> | string;
};

export interface LangsRecord {
	[lang: string]:
		| { type: "lazy"; data: () => Promise<Lang> }
		| { type: "static"; data: Lang };
}

export function is_translation_metadata(obj: any): obj is I18nData {
	const result =
		obj &&
		typeof obj === "object" &&
		obj.__type__ === "translation_metadata" &&
		typeof obj.key === "string";

	return result;
}

export const i18n_marker = "__i18n__";

export function process_langs(): LangsRecord {
	const lazy_langs = Object.fromEntries(
		Object.entries(langs).map(([path, mod]) => [
			path.split("/").pop()!.split(".")[0],
			{ type: "lazy", data: mod }
		])
	);

	return {
		...lazy_langs,
		en: { type: "static", data: en }
	};
}

const processed_langs = process_langs();
const available_locales = Object.keys(processed_langs);

export const language_choices: [string, string][] = Object.entries(
	processed_langs
).map(([code]) => [lang_map[code as keyof typeof lang_map] || code, code]);

let i18n_initialized = false;
let previous_translations: Record<string, Record<string, string>> | undefined;

const LOCALE_STORAGE_KEY = "gradio_locale";

function getSavedLocale(): string | null {
	try {
		if (typeof localStorage !== "undefined") {
			return localStorage.getItem(LOCALE_STORAGE_KEY);
		}
	} catch {}
	return null;
}

function get_lang_from_preferred_locale(header: string): string | null {
	const options = header
		.split(",")
		.map((value) =>
			value.includes(";") ? value.split(";").slice(0, 2) : [value, 1]
		);
	options.sort(
		(a, b) => parseFloat(b[1] as string) - parseFloat(a[1] as string)
	);
	for (const [lang, _] of options) {
		if (available_locales.includes(lang as string)) {
			return lang as string;
		}
	}
	return null;
}

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>,
	preferred_locale?: string
): Promise<void> {
	const should_reinitialize =
		i18n_initialized && custom_translations !== previous_translations;

	if (i18n_initialized && !should_reinitialize) {
		return;
	}

	const translations_to_use =
		custom_translations ?? previous_translations ?? {};

	if (custom_translations !== undefined) {
		previous_translations = custom_translations;
	}

	load_translations({
		processed_langs,
		custom_translations: translations_to_use
	});

	let initial_locale: string | null = null;
	const browser_locale = getLocaleFromNavigator();

	const saved_locale = getSavedLocale();
	if (saved_locale && available_locales.includes(saved_locale)) {
		initial_locale = saved_locale;
	} else if (preferred_locale) {
		initial_locale = get_lang_from_preferred_locale(preferred_locale);
	} else {
		initial_locale =
			browser_locale && available_locales.includes(browser_locale)
				? browser_locale
				: null;
	}

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

	i18n_initialized = true;
}

export function changeLocale(new_locale: string): void {
	locale.set(new_locale);
	try {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(LOCALE_STORAGE_KEY, new_locale);
		}
	} catch {}
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
			if (
				lang === "en" &&
				translations.processed_langs[lang].type === "static"
			) {
				addMessages(lang, en);
			} else if (translations.processed_langs[lang].type === "lazy") {
				register(lang, translations.processed_langs[lang].data);
			}
		}
	} catch (e) {
		console.error("Error loading translations:", e);
	}

	for (const lang in loading) {
		addMessages(lang, {
			common: { loading: loading[lang as keyof typeof loading] }
		});
	}
}

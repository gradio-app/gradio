import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Gradio } from "@gradio/utils";
import * as svelte_i18n from "svelte-i18n";
import {
	get_initial_locale,
	load_translations,
	init_i18n,
	changeLocale,
	set_init_state,
	setupi18n
} from "../../i18n";

vi.mock("svelte/store", () => {
	return {
		get: vi.fn(),
		writable: vi.fn(() => ({
			subscribe: vi.fn(),
			set: vi.fn(),
			update: vi.fn()
		})),
		derived: vi.fn()
	};
});

vi.mock("svelte-i18n", () => {
	return {
		locale: { set: vi.fn() },
		format: vi.fn(),
		addMessages: vi.fn(),
		init: vi.fn().mockResolvedValue(undefined),
		getLocaleFromNavigator: vi.fn()
	};
});

const setup_i18n = async (
	custom_translations?: Record<string, Record<string, string>>,
	browser_locale: string = "en",
	available_locales: string[] = ["en", "fr", "de"]
): Promise<void> => {
	const getLocaleFromNavigator = vi.mocked(svelte_i18n.getLocaleFromNavigator);

	getLocaleFromNavigator.mockReturnValue(browser_locale);

	const detected_browser_locale = getLocaleFromNavigator();
	const initial_locale = get_initial_locale(
		detected_browser_locale,
		available_locales
	);

	await init_i18n(initial_locale);

	if (custom_translations) {
		load_translations(custom_translations);
	}
};

describe("Custom i18n functionality", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test("get_initial_locale returns browser locale when available", () => {
		const result = get_initial_locale("fr", ["en", "fr", "de"]);
		expect(result).toBe("fr");
	});

	test("get_initial_locale falls back to fallback locale when browser locale not available", () => {
		const result = get_initial_locale("es", ["en", "fr", "de"]);
		expect(result).toBe("en");
	});

	test("get_initial_locale falls back to fallback locale when browser locale is null", () => {
		const result = get_initial_locale(null, ["en", "fr", "de"]);
		expect(result).toBe("en");
	});

	test("get_initial_locale uses custom fallback locale when provided", () => {
		const result = get_initial_locale("es", ["en", "fr", "de"], "de");
		expect(result).toBe("de");
	});

	test("init_i18n calls init with correct parameters", async () => {
		const init = vi.mocked(svelte_i18n.init);

		await init_i18n("fr", "en");

		expect(init).toHaveBeenCalledWith({
			fallbackLocale: "en",
			initialLocale: "fr"
		});
	});

	test("init_i18n uses default fallback locale when not provided", async () => {
		const init = vi.mocked(svelte_i18n.init);

		await init_i18n("fr");

		expect(init).toHaveBeenCalledWith({
			fallbackLocale: "en",
			initialLocale: "fr"
		});
	});

	test("setupi18n initialises with browser locale if available", async () => {
		const init = vi.mocked(svelte_i18n.init);

		await setup_i18n(undefined, "fr");

		expect(init).toHaveBeenCalledWith({
			fallbackLocale: "en",
			initialLocale: "fr"
		});
	});

	test("setupi18n falls back to 'en' if browser locale is not supported", async () => {
		const init = vi.mocked(svelte_i18n.init);

		await setup_i18n(undefined, "xx");

		expect(init).toHaveBeenCalledWith({
			fallbackLocale: "en",
			initialLocale: "en"
		});
	});

	test("load_translations adds messages for each language", () => {
		const addMessages = vi.mocked(svelte_i18n.addMessages);

		const custom_translations = {
			en: {
				greeting: "Hello"
			},
			fr: {
				greeting: "Bonjour"
			}
		};

		load_translations(custom_translations);

		expect(addMessages).toHaveBeenCalledTimes(2);
		expect(addMessages).toHaveBeenCalledWith("en", custom_translations.en);
		expect(addMessages).toHaveBeenCalledWith("fr", custom_translations.fr);
	});

	test("changeLocale sets the locale correctly", () => {
		const setLocale = vi.mocked(svelte_i18n.locale.set);

		changeLocale("fr");

		expect(setLocale).toHaveBeenCalledWith("fr");
	});

	test("setupi18n doesn't reinitialize if already initialized", async () => {
		const init = vi.mocked(svelte_i18n.init);

		set_init_state(true);
		await setupi18n();

		expect(init).not.toHaveBeenCalled();
		set_init_state(false);
	});

	test("comprehensive test for custom translations in the application and custom translations override default translations", async () => {
		const translations = {
			en: {
				hello: "Hello",
				submit: "Submit"
			},
			fr: {
				hello: "Bonjour",
				submit: "Soumettre"
			}
		};

		interface FormatOptions {
			locale?: string;
			[key: string]: any;
		}

		const custom_translations = {
			en: {
				cancel: "Cancel",
				hello: "Howdy"
			},
			fr: {
				cancel: "Annuler",
				hello: "Salut"
			}
		};

		await setup_i18n(custom_translations, "en");

		const addMessages = vi.mocked(svelte_i18n.addMessages);
		expect(addMessages).toHaveBeenCalledWith("en", custom_translations.en);
		expect(addMessages).toHaveBeenCalledWith("fr", custom_translations.fr);

		Object.keys(custom_translations).forEach((lang) => {
			translations[lang] = {
				...translations[lang],
				...custom_translations[lang]
			};
		});

		const mock_formatter = (key: string, options: FormatOptions = {}) => {
			const locale = options.locale || "en";
			return translations[locale]?.[key] || key;
		};

		const setLocale = vi.mocked(svelte_i18n.locale.set);

		const gradio = new Gradio(
			1,
			document.createElement("div"),
			"default",
			"1.0.0",
			"/",
			true,
			null,
			mock_formatter,
			{ config: { root: "/" } } as any
		);

		expect(gradio.i18n("cancel")).toBe("Cancel");
		expect(gradio.i18n("hello")).toBe("Howdy");

		setLocale("fr");

		const french_formatter = (key: string, options: FormatOptions = {}) => {
			const locale = options.locale || "fr";
			return translations[locale]?.[key] || key;
		};

		const frenchGradio = new Gradio(
			1,
			document.createElement("div"),
			"default",
			"1.0.0",
			"/",
			true,
			null,
			french_formatter,
			{ config: { root: "/" } } as any
		);

		expect(frenchGradio.i18n("cancel")).toBe("Annuler");
		expect(frenchGradio.i18n("hello")).toBe("Salut");
		expect(setLocale).toHaveBeenCalledWith("fr");
	});
});

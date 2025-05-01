import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Gradio } from "@gradio/utils";
import * as svelte_i18n from "svelte-i18n";
import {
	get_initial_locale,
	load_translations,
	init_i18n,
	changeLocale,
	set_init_state,
	setupi18n,
	translate_value,
	registerTranslation,
	translate_object
} from "../../i18n";
import { formatter } from "../../gradio_helper";
import { get } from "svelte/store";

interface I18nProps {
	[key: string]: any;
	__i18n_original_values?: {
		[prop: string]: string;
	};
}

vi.mock("svelte/store", () => {
	return {
		get: vi.fn((store) => {
			if (store === svelte_i18n.locale) {
				return store.subscribe ? store.subscribe((val) => val) : "en";
			}
			return undefined;
		}),
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
		locale: {
			set: vi.fn(),
			subscribe: vi.fn((cb) => {
				cb("en");
				return () => {}; // Return a proper unsubscriber function
			})
		},
		_: vi.fn((key) => `TRANSLATED-${key}`),
		format: vi.fn(),
		addMessages: vi.fn(),
		init: vi.fn().mockResolvedValue(undefined),
		getLocaleFromNavigator: vi.fn()
	};
});

vi.mock("../../gradio_helper", () => ({
	formatter: vi.fn((key) => `TRANSLATED-${key}`)
}));

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

describe("Gradio i18n System", () => {
	describe("Locale detection and initialization", () => {
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
	});

	// Tests for custom translations
	describe("Custom translations", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.resetAllMocks();
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

	describe("Enhanced i18n functionality", () => {
		beforeEach(() => {
			svelte_i18n.locale.set("en");
			vi.clearAllMocks();
		});

		test("translate_value should preserve metadata for re-translation", () => {
			const props: I18nProps = {
				label:
					'__i18n__{"__type__":"translation_metadata","key":"label.submit"}'
			};

			const translated = translate_value(props.label, props, "label");
			expect(translated).toBe("TRANSLATED-label.submit");
			expect(formatter).toHaveBeenCalledWith("label.submit");

			expect(props.__i18n_original_values).toBeDefined();
			expect(props.__i18n_original_values?.label).toBe(props.label);

			changeLocale("fr");
			const retranslated = translate_value(translated, props, "label");

			expect(retranslated).toBe("TRANSLATED-label.submit");
			expect(formatter).toHaveBeenCalledTimes(2);
		});

		test("translate_value should use registered translations", () => {
			const props: I18nProps = {
				label: "Submit"
			};

			registerTranslation(props, "label", "common.submit");

			const translated = translate_value(props.label, props, "label");
			expect(translated).toBe("TRANSLATED-common.submit");
			expect(formatter).toHaveBeenCalledWith("common.submit");

			expect(props.__i18n_original_values).toBeDefined();
			expect(props.__i18n_original_values?.label).toContain("common.submit");

			props.label = "MODIFIED-Submit";

			changeLocale("fr");
			const retranslated = translate_value(props.label, props, "label");

			expect(retranslated).toBe("TRANSLATED-common.submit");
			expect(formatter).toHaveBeenCalledTimes(2);
		});

		test("translate_value should handle nested component properties", () => {
			const tabsComponent: I18nProps = {
				type: "tabs",
				initial_tabs: [
					{
						id: "tab1",
						label:
							'__i18n__{"__type__":"translation_metadata","key":"tabs.first_tab"}',
						visible: true
					} as I18nProps,
					{
						id: "tab2",
						label:
							'__i18n__{"__type__":"translation_metadata","key":"tabs.second_tab"}',
						visible: true
					} as I18nProps
				]
			};

			const tab = tabsComponent.initial_tabs[0];
			const translated = translate_value(tab.label, tab, "label");
			expect(translated).toBe("TRANSLATED-tabs.first_tab");
			expect(formatter).toHaveBeenCalledWith("tabs.first_tab");

			expect(tab.__i18n_original_values).toBeDefined();
			expect(tab.__i18n_original_values?.label).toBe(tab.label);

			changeLocale("es");
			tab.label = "Changed Tab Name"; // Simulate UI update
			const retranslated = translate_value(tab.label, tab, "label");

			expect(retranslated).toBe("TRANSLATED-tabs.first_tab");
		});

		test("translate_object should recursively translate the entire object tree", () => {
			const componentTree = {
				id: 1,
				type: "column",
				props: {
					label:
						'__i18n__{"__type__":"translation_metadata","key":"components.column.label"}',
					description:
						'__i18n__{"__type__":"translation_metadata","key":"components.column.description"}'
				} as I18nProps,
				children: [
					{
						id: 2,
						type: "textbox",
						props: {
							label:
								'__i18n__{"__type__":"translation_metadata","key":"components.textbox.label"}',
							placeholder:
								'__i18n__{"__type__":"translation_metadata","key":"components.textbox.placeholder"}'
						} as I18nProps
					},
					{
						id: 3,
						type: "button",
						props: {
							value:
								'__i18n__{"__type__":"translation_metadata","key":"components.button.text"}'
						} as I18nProps
					}
				]
			};

			translate_value(componentTree.props.label, componentTree.props, "label");
			translate_value(
				componentTree.props.description,
				componentTree.props,
				"description"
			);
			translate_value(
				componentTree.children[0].props.label,
				componentTree.children[0].props,
				"label"
			);
			translate_value(
				componentTree.children[0].props.placeholder,
				componentTree.children[0].props,
				"placeholder"
			);
			translate_value(
				componentTree.children[1].props.value,
				componentTree.children[1].props,
				"value"
			);

			vi.clearAllMocks();

			const translated = translate_object(componentTree);

			expect(translated.props.label).toBe("TRANSLATED-components.column.label");
			expect(translated.props.description).toBe(
				"TRANSLATED-components.column.description"
			);
			expect(translated.children[0].props.label).toBe(
				"TRANSLATED-components.textbox.label"
			);
			expect(translated.children[0].props.placeholder).toBe(
				"TRANSLATED-components.textbox.placeholder"
			);
			expect(translated.children[1].props.value).toBe(
				"TRANSLATED-components.button.text"
			);

			expect(formatter).toHaveBeenCalledWith("components.column.label");
			expect(formatter).toHaveBeenCalledWith("components.column.description");
			expect(formatter).toHaveBeenCalledWith("components.textbox.label");
			expect(formatter).toHaveBeenCalledWith("components.textbox.placeholder");
			expect(formatter).toHaveBeenCalledWith("components.button.text");

			expect(componentTree.props.__i18n_original_values).toBeDefined();
			expect(
				componentTree.children[0].props.__i18n_original_values
			).toBeDefined();
			expect(
				componentTree.children[1].props.__i18n_original_values
			).toBeDefined();
		});

		test("changing locale should re-translate values using stored keys", () => {
			const component = {
				type: "form",
				props: {
					label:
						'__i18n__{"__type__":"translation_metadata","key":"form.label"}',
					description:
						'__i18n__{"__type__":"translation_metadata","key":"form.description"}',
					submit_text:
						'__i18n__{"__type__":"translation_metadata","key":"form.submit"}'
				} as I18nProps
			};

			vi.resetAllMocks();

			translate_value(component.props.label, component.props, "label");
			translate_value(
				component.props.description,
				component.props,
				"description"
			);
			translate_value(
				component.props.submit_text,
				component.props,
				"submit_text"
			);

			vi.clearAllMocks();

			vi.mocked(formatter).mockImplementation((key) => {
				const currentLocale = get(svelte_i18n.locale) || "en";
				return `${currentLocale.toUpperCase()}-${key}`;
			});

			component.props.label = translate_value(
				component.props.label,
				component.props,
				"label"
			);
			component.props.description = translate_value(
				component.props.description,
				component.props,
				"description"
			);
			component.props.submit_text = translate_value(
				component.props.submit_text,
				component.props,
				"submit_text"
			);

			expect(component.props.label).toBe("EN-form.label");
			expect(component.props.description).toBe("EN-form.description");
			expect(component.props.submit_text).toBe("EN-form.submit");

			changeLocale("fr");

			vi.mocked(svelte_i18n.locale.subscribe).mockImplementation((cb) => {
				cb("fr");
				return () => {}; // Return a proper unsubscriber function
			});

			component.props.label = translate_value(
				component.props.label,
				component.props,
				"label"
			);
			component.props.description = translate_value(
				component.props.description,
				component.props,
				"description"
			);
			component.props.submit_text = translate_value(
				component.props.submit_text,
				component.props,
				"submit_text"
			);

			expect(component.props.label).toBe("FR-form.label");
			expect(component.props.description).toBe("FR-form.description");
			expect(component.props.submit_text).toBe("FR-form.submit");

			changeLocale("en");

			vi.mocked(svelte_i18n.locale.subscribe).mockImplementation((cb) => {
				cb("en");
				return () => {};
			});

			component.props.label = translate_value(
				component.props.label,
				component.props,
				"label"
			);
			component.props.description = translate_value(
				component.props.description,
				component.props,
				"description"
			);
			component.props.submit_text = translate_value(
				component.props.submit_text,
				component.props,
				"submit_text"
			);

			expect(component.props.label).toBe("EN-form.label");
			expect(component.props.description).toBe("EN-form.description");
			expect(component.props.submit_text).toBe("EN-form.submit");
		});
	});
});

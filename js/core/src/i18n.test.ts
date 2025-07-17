import {
	describe,
	test,
	expect,
	assert,
	vi,
	beforeEach,
	afterEach
} from "vitest";
import { Lang, process_langs } from "./i18n";
import languagesByAnyCode from "wikidata-lang/indexes/by_any_code";
import BCP47 from "./lang/BCP47_codes";
import {
	translate_if_needed,
	get_initial_locale,
	load_translations,
	changeLocale,
	is_translation_metadata
} from "./i18n";

vi.mock("svelte-i18n", () => ({
	locale: { set: vi.fn() },
	_: vi.fn((key) => `translated_${key}`),
	addMessages: vi.fn(),
	init: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("svelte/store", () => ({
	get: vi.fn((store) => store),
	derived: vi.fn()
}));

import { locale, init, addMessages } from "svelte-i18n";

describe("i18n", () => {
	test("languages are loaded correctly", () => {
		const langs = process_langs();
		assert.ok(langs.en);
		assert.ok((langs.en as { type: "static"; data: Lang }).data.common);
	});

	test("language codes follow the correct format", async () => {
		const langs = Object.entries(process_langs());

		await Promise.all(
			langs.map(async ([code, translation]) => {
				const BCP47_REGEX = /^.{2}-.{2}$/;

				if (BCP47_REGEX.test(code)) {
					assert.ok(BCP47.includes(code));
				} else {
					assert.exists(languagesByAnyCode[code]);
				}

				let data: Lang;
				if (translation.type === "lazy") {
					data = await translation.data();
				} else {
					data = translation.data;
				}
				assert.ok(data.common);
			})
		);
	});

	describe("basic functions", () => {
		test("translate_if_needed handles regular strings", () => {
			const regularString = "hello world";
			expect(translate_if_needed(regularString)).toBe(regularString);
		});
	});

	describe("locale management", () => {
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
	});

	describe("i18n setup and initialization", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.resetAllMocks();
		});

		test("load_translations adds messages for each language", () => {
			const mockAddMessages = addMessages as unknown as ReturnType<
				typeof vi.fn
			>;

			const custom_translations = {
				en: {
					greeting: "Hello"
				},
				fr: {
					greeting: "Bonjour"
				}
			};

			load_translations({ processed_langs: {}, custom_translations });

			expect(mockAddMessages).toHaveBeenCalledTimes(2);
			expect(mockAddMessages).toHaveBeenCalledWith(
				"en",
				custom_translations.en
			);
			expect(mockAddMessages).toHaveBeenCalledWith(
				"fr",
				custom_translations.fr
			);
		});

		test("changeLocale sets the locale correctly", () => {
			const mockSetLocale = locale.set as unknown as ReturnType<typeof vi.fn>;

			changeLocale("fr");

			expect(mockSetLocale).toHaveBeenCalledWith("fr");
		});
	});

	describe("translation metadata handling", () => {
		test("is_translation_metadata identifies valid metadata objects", () => {
			expect(
				is_translation_metadata({
					__type__: "translation_metadata" as const,
					key: "test.key"
				})
			).toBe(true);
			expect(is_translation_metadata({ key: "test.key" })).toBe(false);

			expect(Boolean(is_translation_metadata(null))).toBe(false);
			expect(Boolean(is_translation_metadata(undefined))).toBe(false);
			expect(Boolean(is_translation_metadata("not an object"))).toBe(false);
		});
	});
});

import { describe, test, assert } from "vitest";
import { process_langs } from "./i18n";
import languagesByAnyCode from "wikidata-lang/indexes/by_any_code";
import BCP47 from "./lang/BCP47_codes";

describe("i18n", () => {
	test("languages are loaded correctly", () => {
		const langs = process_langs();
		assert.ok(langs.en);
		assert.ok(langs.en.common);
	});

	test("language codes follow the correct format", () => {
		const langs = Object.entries(process_langs());

		langs.forEach(([code, translation]) => {
			const BCP47_REGEX = /^.{2}-.{2}$/;

			if (BCP47_REGEX.test(code)) {
				assert.ok(BCP47.includes(code));
			} else {
				assert.exists(languagesByAnyCode[code]);
			}
			assert.ok(translation.common);
		});
	});
});

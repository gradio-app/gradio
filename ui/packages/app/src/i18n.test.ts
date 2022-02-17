import { describe, test, assert } from "vitest";
import { process_langs } from "./i18n";

describe("i18n", () => {
	test("languages are loaded correctly", () => {
		const langs = process_langs();
		assert.ok(langs.en);
		assert.ok(langs.en.interface);
	});

	test("language codes follow the correct format", () => {
		const langs = Object.entries(process_langs());

		langs.forEach(([code, translation]) => {
			// must be "xx" or "xx-xx" -- http://4umi.com/web/html/languagecodes.php
			const RE = /^([a-z]{2}-[a-z]{2}|[a-z]{2})$/;

			assert.ok(RE.test(code));
			assert.ok(translation.interface);
		});
	});
});

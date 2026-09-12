import { describe, test, expect } from "vitest";
import { isBlankValue } from "./node-meta";

describe("isBlankValue", () => {
	test("empty values are blank", () => {
		expect(isBlankValue(null)).toBe(true);
		expect(isBlankValue(undefined)).toBe(true);
		expect(isBlankValue("   ")).toBe(true);
		expect(isBlankValue([])).toBe(true);
		expect(isBlankValue({ name: "a", url: "", mime: "image/png" })).toBe(true);
	});

	test("0 and false are real answers, not blanks", () => {
		expect(isBlankValue(0)).toBe(false);
		expect(isBlankValue(false)).toBe(false);
	});

	test("filled values are not blank", () => {
		expect(isBlankValue("hi")).toBe(false);
		expect(isBlankValue(["a"])).toBe(false);
		expect(isBlankValue({ name: "a", url: "blob:x", mime: "image/png" })).toBe(
			false
		);
	});
});

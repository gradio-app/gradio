import { describe, test, expect } from "vitest";
import { gradio_filter_fn } from "../shared/utils/filter";

function make_row(value: string | number): { getValue: (id: string) => string | number } {
	return { getValue: (_id: string) => value };
}

function fv(
	filter: string,
	value: string,
	case_sensitive: boolean,
	dtype: "string" | "number" = "string"
): { dtype: string; filter: string; value: string; case_sensitive: boolean } {
	return { dtype, filter, value, case_sensitive };
}

describe("gradio_filter_fn – case sensitivity", () => {
	// ── Contains ─────────────────────────────────────────────────────────────

	describe("Contains", () => {
		test("case-sensitive: exact-case matches, others don't", () => {
			const fval = fv("Contains", "London", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(false);
		});

		test("case-insensitive: all case variants match", () => {
			const fval = fv("Contains", "london", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(false);
		});
	});

	// ── Does not contain ─────────────────────────────────────────────────────

	describe("Does not contain", () => {
		test("case-sensitive: only exact-case excluded", () => {
			const fval = fv("Does not contain", "London", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(true);
		});

		test("case-insensitive: all case variants excluded", () => {
			const fval = fv("Does not contain", "london", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(true);
		});
	});

	// ── Starts with ──────────────────────────────────────────────────────────

	describe("Starts with", () => {
		test("case-sensitive: only exact-case prefix matches", () => {
			const fval = fv("Starts with", "Lo", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
		});

		test("case-insensitive: any casing matches", () => {
			const fval = fv("Starts with", "lo", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(false);
		});
	});

	// ── Ends with ────────────────────────────────────────────────────────────

	describe("Ends with", () => {
		test("case-sensitive: only exact-case suffix matches", () => {
			const fval = fv("Ends with", "don", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
		});

		test("case-insensitive: all case variants match", () => {
			const fval = fv("Ends with", "don", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(false);
		});
	});

	// ── Is ───────────────────────────────────────────────────────────────────

	describe("Is", () => {
		test("case-sensitive: exact match only", () => {
			const fval = fv("Is", "London", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
		});

		test("case-insensitive: all variants match", () => {
			const fval = fv("Is", "london", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(false);
		});
	});

	// ── Is not ───────────────────────────────────────────────────────────────

	describe("Is not", () => {
		test("case-sensitive: everything except exact match passes", () => {
			const fval = fv("Is not", "London", true);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(true);
		});

		test("case-insensitive: all case variants excluded", () => {
			const fval = fv("Is not", "london", false);
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("LONDON"), "c", fval)).toBe(false);
			expect(gradio_filter_fn(make_row("Paris"), "c", fval)).toBe(true);
		});
	});

	// ── Is empty / Is not empty ───────────────────────────────────────────────

	describe("Is empty / Is not empty", () => {
		test("Is empty – unaffected by case_sensitive flag", () => {
			expect(gradio_filter_fn(make_row(""), "c", fv("Is empty", "", true))).toBe(true);
			expect(gradio_filter_fn(make_row(""), "c", fv("Is empty", "", false))).toBe(true);
			expect(gradio_filter_fn(make_row("London"), "c", fv("Is empty", "", true))).toBe(false);
		});

		test("Is not empty – unaffected by case_sensitive flag", () => {
			expect(gradio_filter_fn(make_row("London"), "c", fv("Is not empty", "", true))).toBe(true);
			expect(gradio_filter_fn(make_row("London"), "c", fv("Is not empty", "", false))).toBe(true);
			expect(gradio_filter_fn(make_row(""), "c", fv("Is not empty", "", true))).toBe(false);
		});
	});

	// ── Numeric filters ───────────────────────────────────────────────────────

	describe("Numeric filters", () => {
		test.each([
			["=", "20", 20, true],
			["=", "20", 10, false],
			["≠", "20", 10, true],
			["≠", "20", 20, false],
			[">", "15", 20, true],
			[">", "15", 10, false],
			["<", "25", 10, true],
			["<", "25", 30, false],
			["≥", "20", 20, true],
			["≥", "20", 19, false],
			["≤", "20", 20, true],
			["≤", "20", 21, false]
		] as [string, string, number, boolean][])(
			"filter '%s' value '%s' for cell %d → %s",
			(filter, value, cell, expected) => {
				expect(
					gradio_filter_fn(make_row(cell), "c", fv(filter, value, true, "number"))
				).toBe(expected);
			}
		);
	});

	// ── Edge cases ────────────────────────────────────────────────────────────

	describe("edge cases", () => {
		test("unknown filter returns true (pass-through)", () => {
			expect(
				gradio_filter_fn(make_row("anything"), "c", fv("Unknown", "x", true))
			).toBe(true);
		});

		test("case_sensitive defaults to false when omitted", () => {
			const fval = { dtype: "string", filter: "Is", value: "London" };
			expect(gradio_filter_fn(make_row("London"), "c", fval)).toBe(true);
			expect(gradio_filter_fn(make_row("london"), "c", fval)).toBe(true);
		});
	});
});

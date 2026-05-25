import { describe, test, expect } from "vitest";
import { gradio_filter_fn } from "../shared/utils/filter";

const make_row = (value: any) => ({
	getValue: (_col: string) => value
});

describe("gradio_filter_fn", () => {
	describe("number filters", () => {
		test("= matches exact number", () => {
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "=",
					value: "42"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "=",
					value: "43"
				})
			).toBe(false);
		});

		test("≠ excludes exact number", () => {
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "≠",
					value: "42"
				})
			).toBe(false);
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "≠",
					value: "43"
				})
			).toBe(true);
		});

		test("> greater than", () => {
			expect(
				gradio_filter_fn(make_row(10), "col_0", {
					dtype: "number",
					filter: ">",
					value: "5"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(5), "col_0", {
					dtype: "number",
					filter: ">",
					value: "5"
				})
			).toBe(false);
		});

		test("< less than", () => {
			expect(
				gradio_filter_fn(make_row(3), "col_0", {
					dtype: "number",
					filter: "<",
					value: "5"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(5), "col_0", {
					dtype: "number",
					filter: "<",
					value: "5"
				})
			).toBe(false);
		});

		test("≥ greater than or equal", () => {
			expect(
				gradio_filter_fn(make_row(5), "col_0", {
					dtype: "number",
					filter: "≥",
					value: "5"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(4), "col_0", {
					dtype: "number",
					filter: "≥",
					value: "5"
				})
			).toBe(false);
		});

		test("≤ less than or equal", () => {
			expect(
				gradio_filter_fn(make_row(5), "col_0", {
					dtype: "number",
					filter: "≤",
					value: "5"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(6), "col_0", {
					dtype: "number",
					filter: "≤",
					value: "5"
				})
			).toBe(false);
		});

		test("Is empty on empty string", () => {
			expect(
				gradio_filter_fn(make_row(""), "col_0", {
					dtype: "number",
					filter: "Is empty",
					value: ""
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("42"), "col_0", {
					dtype: "number",
					filter: "Is empty",
					value: ""
				})
			).toBe(false);
		});

		test("Is not empty on non-empty string", () => {
			expect(
				gradio_filter_fn(make_row("42"), "col_0", {
					dtype: "number",
					filter: "Is not empty",
					value: ""
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(""), "col_0", {
					dtype: "number",
					filter: "Is not empty",
					value: ""
				})
			).toBe(false);
		});

		test("NaN target falls through to true", () => {
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "=",
					value: "abc"
				})
			).toBe(true);
		});

		test("NaN cell value falls through to true", () => {
			expect(
				gradio_filter_fn(make_row("abc"), "col_0", {
					dtype: "number",
					filter: "=",
					value: "42"
				})
			).toBe(true);
		});
	});

	describe("string filters", () => {
		test("Contains (case-insensitive)", () => {
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Contains",
					value: "hello"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Contains",
					value: "xyz"
				})
			).toBe(false);
		});

		test("Does not contain", () => {
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Does not contain",
					value: "xyz"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Does not contain",
					value: "hello"
				})
			).toBe(false);
		});

		test("Starts with", () => {
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Starts with",
					value: "hello"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Starts with",
					value: "world"
				})
			).toBe(false);
		});

		test("Ends with", () => {
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Ends with",
					value: "world"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Ends with",
					value: "hello"
				})
			).toBe(false);
		});

		test("Is (exact match, case-insensitive)", () => {
			expect(
				gradio_filter_fn(make_row("Hello"), "col_0", {
					dtype: "string",
					filter: "Is",
					value: "hello"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Is",
					value: "hello"
				})
			).toBe(false);
		});

		test("Is not", () => {
			expect(
				gradio_filter_fn(make_row("Hello World"), "col_0", {
					dtype: "string",
					filter: "Is not",
					value: "hello"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("Hello"), "col_0", {
					dtype: "string",
					filter: "Is not",
					value: "hello"
				})
			).toBe(false);
		});

		test("Is empty", () => {
			expect(
				gradio_filter_fn(make_row(""), "col_0", {
					dtype: "string",
					filter: "Is empty",
					value: ""
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("  "), "col_0", {
					dtype: "string",
					filter: "Is empty",
					value: ""
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row("hello"), "col_0", {
					dtype: "string",
					filter: "Is empty",
					value: ""
				})
			).toBe(false);
		});

		test("Is not empty", () => {
			expect(
				gradio_filter_fn(make_row("hello"), "col_0", {
					dtype: "string",
					filter: "Is not empty",
					value: ""
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(""), "col_0", {
					dtype: "string",
					filter: "Is not empty",
					value: ""
				})
			).toBe(false);
		});
	});

	describe("edge cases", () => {
		test("null cell value coerced to empty string", () => {
			expect(
				gradio_filter_fn(make_row(null), "col_0", {
					dtype: "string",
					filter: "Is empty",
					value: ""
				})
			).toBe(true);
		});

		test("undefined filter value coerced to empty string", () => {
			expect(
				gradio_filter_fn(make_row("hello"), "col_0", {
					dtype: "string",
					filter: "Contains",
					value: undefined
				})
			).toBe(true);
		});

		test("unknown filter returns true (passthrough)", () => {
			expect(
				gradio_filter_fn(make_row("hello"), "col_0", {
					dtype: "string",
					filter: "UnknownFilter",
					value: "x"
				})
			).toBe(true);
			expect(
				gradio_filter_fn(make_row(42), "col_0", {
					dtype: "number",
					filter: "UnknownFilter",
					value: "5"
				})
			).toBe(true);
		});
	});
});

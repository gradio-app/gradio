import { test, describe, assert } from "vitest";
import { merge_elements, get_score_color } from "./utils";
import type { HighlightedToken } from "./utils";

describe("merge_elements", () => {
	test("returns empty array for empty input", () => {
		const result = merge_elements([], "equal");
		assert.deepEqual(result, []);
	});

	test("merges adjacent tokens with same class in equal mode", () => {
		const input: HighlightedToken[] = [
			{ token: "Hello ", class_or_confidence: "greeting" },
			{ token: "world", class_or_confidence: "greeting" }
		];
		const result = merge_elements(input, "equal");
		assert.deepEqual(result, [
			{ token: "Hello world", class_or_confidence: "greeting" }
		]);
	});

	test("does not merge tokens with different classes in equal mode", () => {
		const input: HighlightedToken[] = [
			{ token: "Hello ", class_or_confidence: "greeting" },
			{ token: "world", class_or_confidence: "noun" }
		];
		const result = merge_elements(input, "equal");
		assert.deepEqual(result, [
			{ token: "Hello ", class_or_confidence: "greeting" },
			{ token: "world", class_or_confidence: "noun" }
		]);
	});

	test("merges adjacent null tokens in empty mode", () => {
		const input: HighlightedToken[] = [
			{ token: "Hello ", class_or_confidence: null },
			{ token: "world ", class_or_confidence: null },
			{ token: "!", class_or_confidence: "punctuation" }
		];
		const result = merge_elements(input, "empty");
		assert.deepEqual(result, [
			{ token: "Hello world ", class_or_confidence: null },
			{ token: "!", class_or_confidence: "punctuation" }
		]);
	});

	test("handles single token", () => {
		const input: HighlightedToken[] = [
			{ token: "Hello", class_or_confidence: "greeting" }
		];
		const result = merge_elements(input, "equal");
		assert.deepEqual(result, [
			{ token: "Hello", class_or_confidence: "greeting" }
		]);
	});

	test("merges multiple consecutive tokens with same class", () => {
		const input: HighlightedToken[] = [
			{ token: "a", class_or_confidence: "letter" },
			{ token: "b", class_or_confidence: "letter" },
			{ token: "c", class_or_confidence: "letter" },
			{ token: "1", class_or_confidence: "number" }
		];
		const result = merge_elements(input, "equal");
		assert.deepEqual(result, [
			{ token: "abc", class_or_confidence: "letter" },
			{ token: "1", class_or_confidence: "number" }
		]);
	});
});

describe("get_score_color", () => {
	test("returns empty string for null", () => {
		assert.equal(get_score_color(null), "");
	});

	test("returns purple rgba for negative scores", () => {
		const result = get_score_color(-0.5);
		assert.equal(result, "rgba(128, 90, 213, 0.5)");
	});

	test("returns red rgba for positive scores", () => {
		const result = get_score_color(0.7);
		assert.equal(result, "rgba(239, 68, 60, 0.7)");
	});

	test("returns red rgba with 0 opacity for zero score", () => {
		const result = get_score_color(0);
		assert.equal(result, "rgba(239, 68, 60, 0)");
	});

	test("handles score of 1", () => {
		const result = get_score_color(1);
		assert.equal(result, "rgba(239, 68, 60, 1)");
	});

	test("handles score of -1", () => {
		const result = get_score_color(-1);
		assert.equal(result, "rgba(128, 90, 213, 1)");
	});
});

import { test, describe, assert } from "vitest";
import { normalize_color, format_color, hsva_to_rgba } from "./utils";

describe("normalize_color", () => {
	test("converts named CSS color to hex", () => {
		assert.equal(normalize_color("red"), "#ff0000");
	});

	test("expands 3-digit hex to 6-digit", () => {
		assert.equal(normalize_color("#f00"), "#ff0000");
	});

	test("passes through already-normalized 6-digit hex", () => {
		assert.equal(normalize_color("#ff0000"), "#ff0000");
	});

	test("converts 8-digit hex with alpha to 6-digit hex (alpha stripped by toHexString)", () => {
		assert.equal(normalize_color("#ff000080"), "#ff0000");
	});

	test("lowercases uppercase hex", () => {
		assert.equal(normalize_color("#FF0000"), "#ff0000");
	});

	test("converts rgb() string to hex", () => {
		assert.equal(normalize_color("rgb(255, 0, 0)"), "#ff0000");
	});

	test("converts hsl() string to hex", () => {
		assert.equal(normalize_color("hsl(0, 100%, 50%)"), "#ff0000");
	});

	test("returns invalid color string unchanged", () => {
		assert.equal(normalize_color("notacolor"), "notacolor");
	});

	test("returns empty string unchanged", () => {
		assert.equal(normalize_color(""), "");
	});
});

describe("format_color", () => {
	test("formats color as hex", () => {
		assert.equal(format_color("red", "hex"), "#ff0000");
	});

	test("formats color as rgb", () => {
		assert.equal(format_color("#ff0000", "rgb"), "rgb(255, 0, 0)");
	});

	test("formats color as hsl", () => {
		assert.equal(format_color("#ff0000", "hsl"), "hsl(0, 100%, 50%)");
	});
});

describe("hsva_to_rgba", () => {
	test("converts pure red", () => {
		assert.equal(hsva_to_rgba({ h: 0, s: 1, v: 1, a: 1 }), "#ff0000");
	});

	test("converts with alpha (toHexString strips alpha)", () => {
		assert.equal(hsva_to_rgba({ h: 0, s: 1, v: 1, a: 0.5 }), "#ff0000");
	});

	test("converts black", () => {
		assert.equal(hsva_to_rgba({ h: 0, s: 0, v: 0, a: 1 }), "#000000");
	});

	test("converts white", () => {
		assert.equal(hsva_to_rgba({ h: 0, s: 0, v: 1, a: 1 }), "#ffffff");
	});

	test("converts green (h=120)", () => {
		assert.equal(hsva_to_rgba({ h: 120, s: 1, v: 1, a: 1 }), "#00ff00");
	});

	test("converts blue (h=240)", () => {
		assert.equal(hsva_to_rgba({ h: 240, s: 1, v: 1, a: 1 }), "#0000ff");
	});
});

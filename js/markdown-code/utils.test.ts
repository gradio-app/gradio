import { test, describe, expect } from "vitest";
import { create_marked, escapeTags, track_open_elements } from "./utils";

describe("escapeTags", () => {
	test.each([
		[
			"custom tag with underscore",
			"<p><tool_call>get_weather</tool_call></p>",
			"<p>&lt;tool_call>get_weather&lt;/tool_call></p>"
		],
		[
			"self-closing custom tag",
			"<p>inline <tool_call/> x</p>",
			"<p>inline &lt;tool_call/> x</p>"
		],
		[
			"custom tag with attributes",
			'<p><think step="1">hmm</think></p>',
			'<p>&lt;think step="1">hmm&lt;/think></p>'
		],
		[
			"namespaced closing tag",
			"<p>x </ns:tag> y</p>",
			"<p>x &lt;/ns:tag> y</p>"
		],
		[
			"standard tag next to a custom one",
			"<p><b>bold</b> <x-foo>z</x-foo></p>",
			"<p><b>bold</b> &lt;x-foo>z&lt;/x-foo></p>"
		],
		[
			"standard tag with attributes",
			'<p><a href="x">link</a></p>',
			'<p><a href="x">link</a></p>'
		],
		[
			"mixed-case SVG tags",
			'<svg><clipPath id="c"></clipPath><linearGradient/></svg>',
			'<svg><clipPath id="c"></clipPath><linearGradient/></svg>'
		],
		["restored LaTeX", "<p>$a<b$ text</p>", "<p>$a&lt;b$ text</p>"],
		[
			"restored LaTeX before a closing tag",
			"<p>The bound is $$x<y$$</p>",
			"<p>The bound is $$x&lt;y$$</p>"
		],
		[
			"restored LaTeX before a line break",
			"<p>$$P(X<a)$$<br>we get</p>",
			"<p>$$P(X&lt;a)$$<br>we get</p>"
		],
		[
			"standard tag name followed by <",
			"<p>$$a<b<c$$</p>",
			"<p>$$a&lt;b&lt;c$$</p>"
		]
	])("allow_tags=true: %s", (_, input, expected) => {
		expect(escapeTags(input, true)).toBe(expected);
	});

	test.each([
		[
			"listed tag only",
			["thinking"],
			"<p><b>x</b> <thinking>y</thinking> <think>z</think></p>",
			"<p><b>x</b> &lt;thinking>y&lt;/thinking> <think>z</think></p>"
		],
		[
			"self-closing and uppercase listed tag",
			["think"],
			"<p><think/> <THINK>x</THINK></p>",
			"<p>&lt;think/> &lt;THINK>x&lt;/THINK></p>"
		],
		[
			"names are not regex patterns",
			["tool.call"],
			"<p><toolXcall>x</toolXcall></p>",
			"<p><toolXcall>x</toolXcall></p>"
		],
		[
			"names with regex metacharacters",
			["a("],
			"<p><a(>x</p>",
			"<p>&lt;a(>x</p>"
		]
	])("allow_tags=list: %s", (_, tags, input, expected) => {
		expect(escapeTags(input, tags)).toBe(expected);
	});

	test("repeated tag prefixes are handled in linear time", () => {
		// With a quadratic scan, this input takes well over the test timeout.
		const input = "<tool_call".repeat(50000);
		expect(escapeTags(input, true)).toBe("&lt;tool_call".repeat(50000));
	});

	test("allow_tags=false leaves content unchanged", () => {
		const input = "<p><tool_call>x</tool_call></p>";
		expect(escapeTags(input, false)).toBe(input);
	});
});

describe("track_open_elements", () => {
	const marked = create_marked({
		header_links: false,
		line_breaks: false,
		latex_delimiters: []
	});
	const open_after = (markdown: string): string[] => {
		const open: string[] = [];
		for (const token of marked.lexer(markdown)) {
			track_open_elements(marked, token, open);
		}
		return open;
	};

	test.each([
		[
			"raw html block",
			"<details>\n<summary>More</summary>\n\nInside",
			["details"]
		],
		["closed raw html block", "<div>\n\nInside\n\n</div>", []],
		["unknown inline tag in prose", "Use List<T> here.", []],
		["inline span", "Some <span>text", []],
		["inline formatting element", "Some <b>bold", ["b"]],
		["inline element that closes the paragraph", "Some <div>text", ["div"]],
		["inline tag in a list item", "- returns Promise<void>", []]
	])("%s", (_, markdown, expected) => {
		expect(open_after(markdown)).toEqual(expected);
	});
});

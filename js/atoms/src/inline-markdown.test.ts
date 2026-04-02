import { test, describe, expect } from "vitest";
import {
	render_inline_markdown,
	escape_html,
	INLINE_CODE_RE,
	LINK_RE,
	BOLD_ASTERISK_RE,
	BOLD_UNDERSCORE_RE,
	ITALIC_ASTERISK_RE,
	ITALIC_UNDERSCORE_RE,
	PROTOCOL_RE
} from "./inline-markdown";

describe("escape_html", () => {
	test("escapes ampersands", () => {
		expect(escape_html("a & b")).toBe("a &amp; b");
	});

	test("escapes angle brackets", () => {
		expect(escape_html("<script>")).toBe("&lt;script&gt;");
	});

	test("escapes double quotes", () => {
		expect(escape_html('"hello"')).toBe("&quot;hello&quot;");
	});

	test("leaves plain text unchanged", () => {
		expect(escape_html("hello world")).toBe("hello world");
	});

	test("escapes all special chars together", () => {
		expect(escape_html('<a href="x">&')).toBe(
			"&lt;a href=&quot;x&quot;&gt;&amp;"
		);
	});
});

describe("INLINE_CODE_RE", () => {
	test("matches single backtick code spans", () => {
		const matches = [..."`code`".matchAll(INLINE_CODE_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("code");
	});

	test("matches multiple code spans", () => {
		const matches = [..."`a` and `b`".matchAll(INLINE_CODE_RE)];
		expect(matches).toHaveLength(2);
		expect(matches[0][1]).toBe("a");
		expect(matches[1][1]).toBe("b");
	});

	test("does not match empty backticks", () => {
		const matches = [..."``".matchAll(INLINE_CODE_RE)];
		expect(matches).toHaveLength(0);
	});
});

describe("LINK_RE", () => {
	test("matches markdown links", () => {
		const matches = [..."[text](https://example.com)".matchAll(LINK_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("text");
		expect(matches[0][2]).toBe("https://example.com");
	});

	test("captures link text with spaces", () => {
		const matches = [..."[click here](https://example.com)".matchAll(LINK_RE)];
		expect(matches[0][1]).toBe("click here");
	});

	test("does not match incomplete link syntax", () => {
		expect([..."[text]".matchAll(LINK_RE)]).toHaveLength(0);
		expect([..."(url)".matchAll(LINK_RE)]).toHaveLength(0);
		expect([..."[text](".matchAll(LINK_RE)]).toHaveLength(0);
	});
});

describe("BOLD_ASTERISK_RE", () => {
	test("matches **bold**", () => {
		const matches = [..."**bold**".matchAll(BOLD_ASTERISK_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("bold");
	});

	test("matches bold with spaces", () => {
		const matches = [..."**bold text**".matchAll(BOLD_ASTERISK_RE)];
		expect(matches[0][1]).toBe("bold text");
	});
});

describe("BOLD_UNDERSCORE_RE", () => {
	test("matches __bold__", () => {
		const matches = [..."__bold__".matchAll(BOLD_UNDERSCORE_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("bold");
	});
});

describe("ITALIC_ASTERISK_RE", () => {
	test("matches *italic*", () => {
		const matches = [..."*italic*".matchAll(ITALIC_ASTERISK_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("italic");
	});
});

describe("ITALIC_UNDERSCORE_RE", () => {
	test("matches _italic_", () => {
		const matches = [..."_italic_".matchAll(ITALIC_UNDERSCORE_RE)];
		expect(matches).toHaveLength(1);
		expect(matches[0][1]).toBe("italic");
	});

	test("does not match mid-word underscores", () => {
		const matches = [..."foo_bar_baz".matchAll(ITALIC_UNDERSCORE_RE)];
		expect(matches).toHaveLength(0);
	});
});

describe("PROTOCOL_RE", () => {
	test("matches http:", () => {
		expect(PROTOCOL_RE.test("http://example.com")).toBe(true);
	});

	test("matches https:", () => {
		expect(PROTOCOL_RE.test("https://example.com")).toBe(true);
	});

	test("matches javascript:", () => {
		expect(PROTOCOL_RE.test("javascript:alert(1)")).toBe(true);
	});

	test("matches vbscript:", () => {
		expect(PROTOCOL_RE.test("vbscript:msgbox")).toBe(true);
	});

	test("matches data:", () => {
		expect(PROTOCOL_RE.test("data:text/html;base64,abc")).toBe(true);
	});

	test("does not match bare domains", () => {
		expect(PROTOCOL_RE.test("google.com")).toBe(false);
	});

	test("does not match www prefixed URLs", () => {
		expect(PROTOCOL_RE.test("www.google.com")).toBe(false);
	});

	test("does not match relative paths", () => {
		expect(PROTOCOL_RE.test("/path/to/page")).toBe(false);
		expect(PROTOCOL_RE.test("./relative")).toBe(false);
	});
});

describe("render_inline_markdown", () => {
	describe("inline code", () => {
		test("renders inline code", () => {
			expect(render_inline_markdown("`code`")).toBe("<code>code</code>");
		});

		test("renders multiple code spans", () => {
			expect(render_inline_markdown("`a` and `b`")).toBe(
				"<code>a</code> and <code>b</code>"
			);
		});
	});

	describe("bold", () => {
		test("renders **bold**", () => {
			expect(render_inline_markdown("**bold**")).toBe("<strong>bold</strong>");
		});

		test("renders __bold__", () => {
			expect(render_inline_markdown("__bold__")).toBe("<strong>bold</strong>");
		});
	});

	describe("italic", () => {
		test("renders *italic*", () => {
			expect(render_inline_markdown("*italic*")).toBe("<em>italic</em>");
		});

		test("renders _italic_", () => {
			expect(render_inline_markdown("_italic_")).toBe("<em>italic</em>");
		});
	});

	describe("line breaks", () => {
		test("converts newlines to <br>", () => {
			expect(render_inline_markdown("line1\nline2")).toBe("line1<br>line2");
		});
	});

	describe("html escaping", () => {
		test("escapes HTML in input", () => {
			expect(render_inline_markdown("<script>alert(1)</script>")).toBe(
				"&lt;script&gt;alert(1)&lt;/script&gt;"
			);
		});

		test("escapes HTML inside markdown syntax", () => {
			expect(render_inline_markdown("**<b>bold</b>**")).toBe(
				"<strong>&lt;b&gt;bold&lt;/b&gt;</strong>"
			);
		});
	});

	describe("safe links", () => {
		test("renders http links", () => {
			expect(render_inline_markdown("[click](http://example.com)")).toBe(
				'<a href="http://example.com" target="_blank" rel="noopener noreferrer">click</a>'
			);
		});

		test("renders https links", () => {
			expect(render_inline_markdown("[click](https://example.com)")).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer">click</a>'
			);
		});

		test("renders bare domain links (no protocol)", () => {
			expect(render_inline_markdown("[Google](google.com)")).toBe(
				'<a href="google.com" target="_blank" rel="noopener noreferrer">Google</a>'
			);
		});

		test("renders www links (no protocol)", () => {
			expect(render_inline_markdown("[Google](www.google.com)")).toBe(
				'<a href="www.google.com" target="_blank" rel="noopener noreferrer">Google</a>'
			);
		});

		test("renders relative path links", () => {
			expect(render_inline_markdown("[docs](/path/to/docs)")).toBe(
				'<a href="/path/to/docs" target="_blank" rel="noopener noreferrer">docs</a>'
			);
		});

		test("trims whitespace from URLs", () => {
			expect(render_inline_markdown("[click](  https://example.com  )")).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer">click</a>'
			);
		});
	});

	describe("XSS prevention", () => {
		test("blocks javascript: protocol links", () => {
			const result = render_inline_markdown(
				"[xss](javascript:alert(document.cookie))"
			);
			// No <a> tag should be produced — the XSS vector is neutralised.
			// Trailing ")" is left over because the link regex stops at the first ")".
			expect(result).not.toContain("<a");
			expect(result).not.toContain("javascript:");
			expect(result).toContain("xss");
		});

		test("blocks javascript: with simple payload", () => {
			expect(render_inline_markdown("[xss](javascript:void)")).toBe("xss");
		});

		test("blocks javascript: with leading spaces", () => {
			const result = render_inline_markdown("[xss](  javascript:alert(1)  )");
			expect(result).not.toContain("<a");
			expect(result).not.toContain("javascript:");
		});

		test("blocks vbscript: protocol links", () => {
			expect(render_inline_markdown("[xss](vbscript:msgbox)")).toBe("xss");
		});

		test("blocks data: protocol links", () => {
			expect(
				render_inline_markdown(
					"[xss](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)"
				)
			).toBe("xss");
		});

		test("blocks data: with nested HTML", () => {
			const result = render_inline_markdown(
				"[xss](data:text/html,<script>alert(1)</script>)"
			);
			expect(result).not.toContain("<a");
			expect(result).not.toContain("data:");
		});

		test("safe text surrounded by dangerous links renders correctly", () => {
			const input = "[bad](javascript:void) hello [good](https://example.com)";
			const result = render_inline_markdown(input);
			expect(result).toContain("bad");
			expect(result).not.toContain("javascript:");
			expect(result).toContain(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer">good</a>'
			);
		});
	});

	describe("combined syntax", () => {
		test("renders bold inside a sentence", () => {
			expect(render_inline_markdown("This is **important** info")).toBe(
				"This is <strong>important</strong> info"
			);
		});

		test("renders code and bold together", () => {
			expect(render_inline_markdown("Use `func()` for **speed**")).toBe(
				"Use <code>func()</code> for <strong>speed</strong>"
			);
		});

		test("renders link with surrounding text", () => {
			expect(
				render_inline_markdown("See [docs](https://docs.io) for more")
			).toBe(
				'See <a href="https://docs.io" target="_blank" rel="noopener noreferrer">docs</a> for more'
			);
		});

		test("empty string returns empty string", () => {
			expect(render_inline_markdown("")).toBe("");
		});

		test("plain text passes through unchanged", () => {
			expect(render_inline_markdown("hello world")).toBe("hello world");
		});
	});
});

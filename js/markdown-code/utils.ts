import { type Renderer, Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import * as Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-latex";
import "prismjs/components/prism-bash";
import GithubSlugger from "github-slugger";

// import loadLanguages from "prismjs/components/";

// loadLanguages(["python", "latex"]);

const LINK_ICON_CODE = `<svg class="md-link-icon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>`;

const COPY_ICON_CODE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" color="currentColor" aria-hidden="true" aria-label="Copy" stroke-width="1.3" width="15" height="15">
  <path fill="currentColor" d="M12.728 4.545v8.182H4.545V4.545zm0 -0.909H4.545a0.909 0.909 0 0 0 -0.909 0.909v8.182a0.909 0.909 0 0 0 0.909 0.909h8.182a0.909 0.909 0 0 0 0.909 -0.909V4.545a0.909 0.909 0 0 0 -0.909 -0.909"/>
  <path fill="currentColor" d="M1.818 8.182H0.909V1.818a0.909 0.909 0 0 1 0.909 -0.909h6.364v0.909H1.818Z"/>
</svg>

`;

const CHECK_ICON_CODE = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" aria-label="Copied" fill="none" stroke="currentColor" stroke-width="1.3">
  <path d="m13.813 4.781 -7.438 7.438 -3.188 -3.188"/>
</svg>
`;

const COPY_BUTTON_CODE = `<button title="copy" class="copy_code_button">
  <span class="copy-text">${COPY_ICON_CODE}</span>
  <span class="check">${CHECK_ICON_CODE}</span>
</button>`;

const escape_test = /[&<>"']/;
const escape_replace = new RegExp(escape_test.source, "g");
const escape_test_no_encode =
	/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escape_replace_no_encode = new RegExp(escape_test_no_encode.source, "g");
const escape_replacements: Record<string, any> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;"
};

const get_escape_replacement = (ch: string): string =>
	escape_replacements[ch] || "";

function escape(html: string, encode?: boolean): string {
	if (encode) {
		if (escape_test.test(html)) {
			return html.replace(escape_replace, get_escape_replacement);
		}
	} else {
		if (escape_test_no_encode.test(html)) {
			return html.replace(escape_replace_no_encode, get_escape_replacement);
		}
	}

	return html;
}
interface Tokenizer {
	name: string;
	level: string;
	start: (src: string) => number | undefined;
	tokenizer: (src: string, tokens: any) => any;
	renderer: (token: any) => string;
}

function createLatexTokenizer(
	delimiters: { left: string; right: string; display: boolean }[]
): Tokenizer {
	const delimiterPatterns = delimiters.map((delimiter) => ({
		start: new RegExp(delimiter.left.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")),
		end: new RegExp(delimiter.right.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
	}));

	return {
		name: "latex",
		level: "block",
		start(src: string) {
			for (const pattern of delimiterPatterns) {
				const match = src.match(pattern.start);
				if (match) {
					return match.index;
				}
			}
			return -1;
		},
		tokenizer(src: string, tokens: any) {
			for (const pattern of delimiterPatterns) {
				const match = new RegExp(
					`${pattern.start.source}([\\s\\S]+?)${pattern.end.source}`
				).exec(src);
				if (match) {
					return {
						type: "latex",
						raw: match[0],
						text: match[1].trim()
					};
				}
			}
		},
		renderer(token: any) {
			return `<div class="latex-block">${token.text}</div>`;
		}
	};
}

function createMermaidTokenizer(): Tokenizer {
	return {
		name: "mermaid",
		level: "block",
		start(src) {
			return src.match(/^```mermaid\s*\n/)?.index;
		},
		tokenizer(src) {
			const match = /^```mermaid\s*\n([\s\S]*?)```\s*(?:\n|$)/.exec(src);
			if (match) {
				return {
					type: "mermaid",
					raw: match[0],
					text: match[1].trim()
				};
			}
			return undefined;
		},
		renderer(token) {
			return `<div class="mermaid">${token.text}</div>\n`;
		}
	};
}

const renderer: Partial<Omit<Renderer, "constructor" | "options">> = {
	code(
		this: Renderer,
		code: string,
		infostring: string | undefined,
		escaped: boolean
	) {
		const lang = (infostring ?? "").match(/\S*/)?.[0] ?? "";
		code = code.replace(/\n$/, "") + "\n";

		if (!lang || lang === "mermaid") {
			// We include lang === "mermaid" to handle mermaid blocks that don't match our custom tokenizer
			// (i.e., those without closing ```). This handles mermaid blocks that have started streaming
			// but haven't finished yet.
			return (
				'<div class="code_wrap">' +
				COPY_BUTTON_CODE +
				"<pre><code>" +
				(escaped ? code : escape(code, true)) +
				"</code></pre></div>\n"
			);
		}
		return (
			'<div class="code_wrap">' +
			COPY_BUTTON_CODE +
			'<pre><code class="' +
			"language-" +
			escape(lang) +
			'">' +
			(escaped ? code : escape(code, true)) +
			"</code></pre></div>\n"
		);
	}
};

const slugger = new GithubSlugger();

export function create_marked({
	header_links,
	line_breaks,
	latex_delimiters
}: {
	header_links: boolean;
	line_breaks: boolean;
	latex_delimiters: { left: string; right: string; display: boolean }[];
}): typeof marked {
	const marked = new Marked();

	marked.use(
		{
			gfm: true,
			pedantic: false,
			breaks: line_breaks
		},
		markedHighlight({
			highlight: (code: string, lang: string) => {
				if (Prism?.languages?.[lang]) {
					return Prism.highlight(code, Prism.languages[lang], lang);
				}
				return code;
			}
		}),
		{ renderer }
	);

	if (header_links) {
		marked.use(gfmHeadingId());
		marked.use({
			extensions: [
				{
					name: "heading",
					level: "block",
					renderer(token) {
						const raw = token.raw
							.toLowerCase()
							.trim()
							.replace(/<[!\/a-z].*?>/gi, "");
						const id = "h" + slugger.slug(raw);
						const level = token.depth;
						const text = this.parser.parseInline(token.tokens!);

						return `<h${level} id="${id}"><a class="md-header-anchor" href="#${id}">${LINK_ICON_CODE}</a>${text}</h${level}>\n`;
					}
				}
			]
		});
	}

	const mermaidTokenizer = createMermaidTokenizer();
	const latexTokenizer = createLatexTokenizer(latex_delimiters);

	marked.use({
		extensions: [mermaidTokenizer, latexTokenizer]
	});

	return marked;
}

export function copy(node: HTMLDivElement): any {
	node.addEventListener("click", handle_copy);

	async function handle_copy(event: MouseEvent): Promise<void> {
		const path = event.composedPath() as HTMLButtonElement[];

		const [copy_button] = path.filter(
			(e) => e?.tagName === "BUTTON" && e.classList.contains("copy_code_button")
		);

		if (copy_button) {
			event.stopImmediatePropagation();

			const copy_text = copy_button.parentElement!.innerText.trim();
			const copy_sucess_button = Array.from(
				copy_button.children
			)[1] as HTMLDivElement;

			const copied = await copy_to_clipboard(copy_text);

			if (copied) copy_feedback(copy_sucess_button);

			function copy_feedback(_copy_sucess_button: HTMLDivElement): void {
				_copy_sucess_button.style.opacity = "1";
				setTimeout(() => {
					_copy_sucess_button.style.opacity = "0";
				}, 2000);
			}
		}
	}

	return {
		destroy(): void {
			node.removeEventListener("click", handle_copy);
		}
	};
}

async function copy_to_clipboard(value: string): Promise<boolean> {
	let copied = false;
	if ("clipboard" in navigator) {
		await navigator.clipboard.writeText(value);
		copied = true;
	} else {
		const textArea = document.createElement("textarea");
		textArea.value = value;

		textArea.style.position = "absolute";
		textArea.style.left = "-999999px";

		document.body.prepend(textArea);
		textArea.select();

		try {
			document.execCommand("copy");
			copied = true;
		} catch (error) {
			console.error(error);
			copied = false;
		} finally {
			textArea.remove();
		}
	}

	return copied;
}

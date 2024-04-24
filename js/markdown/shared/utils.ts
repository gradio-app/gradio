import { type Renderer, Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-latex";
import "prismjs/components/prism-bash";
import GithubSlugger from "github-slugger";

// import loadLanguages from "prismjs/components/";

// loadLanguages(["python", "latex"]);

const LINK_ICON_CODE = `<svg class="md-link-icon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>`;

const COPY_ICON_CODE = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 32 32"
><path
  fill="currentColor"
  d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"
/><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>`;
const CHECK_ICON_CODE = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="3"
stroke-linecap="round"
stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`;
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

const renderer: Partial<Omit<Renderer, "constructor" | "options">> = {
	code(
		this: Renderer,
		code: string,
		infostring: string | undefined,
		escaped: boolean
	) {
		const lang = (infostring ?? "").match(/\S*/)?.[0] ?? "";
		code = code.replace(/\n$/, "") + "\n";
		if (!lang) {
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
	line_breaks
}: {
	header_links: boolean;
	line_breaks: boolean;
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
				if (Prism.languages[lang]) {
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

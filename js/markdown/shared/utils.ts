import { marked, type Renderer } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-latex";
// import loadLanguages from "prismjs/components/";

// loadLanguages(["python", "latex"]);

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
		if (this.options.highlight) {
			const out = this.options.highlight(code, lang);
			if (out != null && out !== code) {
				escaped = true;
				code = out;
			}
		}

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
			this.options.langPrefix +
			escape(lang) +
			'">' +
			(escaped ? code : escape(code, true)) +
			"</code></pre></div>\n"
		);
	}
};

marked.use(
	{
		gfm: true,
		pedantic: false,
		headerIds: false,
		mangle: false
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

export { marked };

import { marked, Renderer } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-latex";
import type { FileData } from "@gradio/upload";
import { uploadToHuggingFace } from "@gradio/utils";

const copy_icon = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 32 32"
><path
  fill="currentColor"
  d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"
/><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>`;
const check_icon = `<svg
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="3"
stroke-linecap="round"
stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`;
const copy_button = `<button title="copy" class="copy_code_button">
<span class="copy-text">${copy_icon}</span>
<span class="check">${check_icon}</span>
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

const getEscapeReplacement = (ch: string) => escape_replacements[ch] || "";

function escape(html: string, encode?: boolean) {
	if (encode) {
		if (escape_test.test(html)) {
			return html.replace(escape_replace, getEscapeReplacement);
		}
	} else {
		if (escape_test_no_encode.test(html)) {
			return html.replace(escape_replace_no_encode, getEscapeReplacement);
		}
	}

	return html;
}

const renderer: Partial<
	Omit<marked.Renderer<false>, "constructor" | "options">
> = {
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
				"<pre><code>" +
				copy_button +
				(escaped ? code : escape(code, true)) +
				"</code></pre>\n"
			);
		}

		return (
			'<pre><code class="' +
			this.options.langPrefix +
			escape(lang) +
			'">' +
			copy_button +
			(escaped ? code : escape(code, true)) +
			"</code></pre>\n"
		);
	}
};

marked.use(
	{
		gfm: true,
		breaks: true,
		pedantic: false,
		smartLists: true,
		headerIds: false,
		mangle: false
	},
	markedHighlight({
		highlight: (code: string, lang: string) => {
			if (Prism.languages[lang]) {
				return Prism.highlight(code, Prism.languages[lang], lang);
			} else {
				return code;
			}
		}
	}),
	{ renderer }
);

export function copy(node: HTMLDivElement) {
	node.addEventListener("click", handle_copy);

	async function handle_copy(event: MouseEvent) {
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

			function copy_feedback(copy_sucess_button: HTMLDivElement) {
				copy_sucess_button.style.opacity = "1";
				setTimeout(() => {
					copy_sucess_button.style.opacity = "0";
				}, 2000);
			}
		}
	}

	return {
		destroy() {
			node.removeEventListener("click", handle_copy);
		}
	};
}

async function copy_to_clipboard(value: string) {
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

export const format_chat_for_sharing = async (chat: Array<
	[string | FileData | null, string | FileData | null]
>) => {
	return chat.map((message_pair) => {
		return message_pair
			.map(async (message, i) => {
				if (message === null) return "";
				let speaker_emoji = i === 0 ? "👤" : "🤖";
				let html_content = "";
				if (typeof message === "string") {
					html_content = message;
				} else {
					const file_url = await uploadToHuggingFace(message.data, "url");
					if (message.mime_type?.includes("audio")) {
						html_content = `<audio controls src="${file_url}"></audio>`;
					} else if (message.mime_type?.includes("video")) {
						html_content = `<video controls src="${file_url}"></video>`;
					} else if (message.mime_type?.includes("image")) {
						html_content = `<img src="${file_url}"">`;
					}
				}
				return `${speaker_emoji}: ${html_content}`;
			})
			.join(message_pair[0] === null || message_pair[1] === null ? "" : "\n");
	})
		.join("\n");
}


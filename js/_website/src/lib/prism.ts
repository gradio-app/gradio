import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";
import "prism-svelte";

(globalThis as any).Prism = Prism;

Prism.languages.insertBefore("python", "keyword", {
	namespace: { pattern: /\b[a-zA-Z_]\w*(?=\.)/ },
	"function-call": { pattern: /\b[a-zA-Z_]\w*(?=\s*\()/ },
	"keyword-argument": {
		pattern: /\b[a-zA-Z_]\w*(?=\s*=(?!=))/,
		alias: "attr-name"
	},
	decorator: {
		pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
		lookbehind: true,
		alias: "annotation"
	},
	"builtin-constant": {
		pattern: /\b(?:True|False|None|self|cls)\b/,
		alias: "constant"
	}
});

const langs: Record<string, string> = {
	python: "python",
	py: "python",
	bash: "bash",
	shell: "bash",
	csv: "csv",
	html: "html",
	json: "json",
	typescript: "typescript",
	ts: "typescript",
	javascript: "javascript",
	js: "javascript",
	directory: "json",
	svelte: "svelte",
	sv: "svelte",
	md: "markdown",
	css: "css"
};

function highlight(code: string, lang: string | null | undefined): string {
	const _lang = langs[lang || ""] || "";
	const grammar = Prism.languages[_lang] || Prism.languages.plaintext;
	const highlighted = Prism.highlight(code, grammar, _lang || "plaintext");
	return `<div class="codeblock"><pre class="gradio-code" data-lang="${lang}"><code>${highlighted}</code></pre></div>`;
}

export { Prism, langs, highlight };

import Prism from "prismjs";

// Same hazard as `js/paramviewer/ParamViewer.svelte`, and it broke
// /custom-components/html-gallery the same way: `prismjs/components/*` and
// `prism-svelte` assign into a bare `Prism` global and declare no imports, so as
// static imports the bundler hoists them above the assignment below (in the
// built html-gallery chunk the grammars sat ~10kB ahead of it). Dynamic imports
// are not hoisted, so the global is published first.
//
// Awaited at module scope rather than gated behind a promise so `highlight()`
// stays synchronous for the server `load` functions that render guides and the
// changelog — by the time any importer runs, the grammars are registered.
(globalThis as any).Prism = Prism;

// Order preserved from the static imports; the grammars extend one another.
await import("prismjs/components/prism-python");
await import("prismjs/components/prism-bash");
await import("prismjs/components/prism-json");
await import("prismjs/components/prism-typescript");
await import("prismjs/components/prism-javascript");
await import("prismjs/components/prism-csv");
await import("prismjs/components/prism-markup");
await import("prism-svelte");

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

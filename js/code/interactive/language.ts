import type { Extension } from "@codemirror/state";
import { StreamLanguage } from "@codemirror/language";

const possible_langs = [
	"python",
	"markdown",
	"json",
	"html",
	"css",
	"javascript",
	"typescript",
	"yaml",
	"dockerfile",
	"shell",
	"r"
];

const lang_map: Record<string, (() => Promise<Extension>) | undefined> = {
	python: () => import("@codemirror/lang-python").then((m) => m.python()),
	markdown: async () => {
		const [md, frontmatter] = await Promise.all([
			import("@codemirror/lang-markdown"),
			import("./frontmatter")
		]);
		return md.markdown({ extensions: [frontmatter.frontmatter] });
	},
	json: () => import("@codemirror/lang-json").then((m) => m.json()),
	html: () => import("@codemirror/lang-html").then((m) => m.html()),
	css: () => import("@codemirror/lang-css").then((m) => m.css()),
	javascript: () =>
		import("@codemirror/lang-javascript").then((m) => m.javascript()),
	typescript: () =>
		import("@codemirror/lang-javascript").then((m) =>
			m.javascript({ typescript: true })
		),
	yaml: () =>
		import("@codemirror/legacy-modes/mode/yaml").then((m) =>
			StreamLanguage.define(m.yaml)
		),
	dockerfile: () =>
		import("@codemirror/legacy-modes/mode/dockerfile").then((m) =>
			StreamLanguage.define(m.dockerFile)
		),
	shell: () =>
		import("@codemirror/legacy-modes/mode/shell").then((m) =>
			StreamLanguage.define(m.shell)
		),
	r: () =>
		import("@codemirror/legacy-modes/mode/r").then((m) =>
			StreamLanguage.define(m.r)
		)
} as const;

const alias_map: Record<string, string> = {
	py: "python",
	md: "markdown",
	js: "javascript",
	ts: "typescript",
	sh: "shell"
};

export async function getLanguageExtension(
	lang: string
): Promise<Extension | undefined> {
	const _lang = lang_map[lang] || lang_map[alias_map[lang]] || undefined;
	if (_lang) {
		return _lang();
	}
	return undefined;
}

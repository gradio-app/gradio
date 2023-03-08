import type { Extension } from "@codemirror/state";
import { StreamLanguage } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile";
import { r } from "@codemirror/legacy-modes/mode/r";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { frontmatter } from "./frontmatter";

const possible_langs = [
	"py",
	"python",
	"md",
	"markdown",
	"json",
	"html",
	"css",
	"js",
	"javascript",
	"ts",
	"typescript",
	"yaml",
	"yml",
	"dockerfile",
	"sh",
	"shell",
	"r"
];
export type Lang = typeof possible_langs[number];

const lang_map: Record<Lang, () => Promise<Extension>> = {
	py: () => import("@codemirror/lang-python").then((m) => m.python()), //[python()],
	md: async () => {
		const [md, frontmatter] = await Promise.all([
			import("@codemirror/lang-markdown"),
			import("./frontmatter")
		]);

		return md.markdown({ extensions: [frontmatter.frontmatter] });
	},
	json: () => import("@codemirror/lang-json").then((m) => m.json()), //json(),
	html: () => import("@codemirror/lang-html").then((m) => m.html()), //html(),
	css: () => import("@codemirror/lang-css").then((m) => m.css()), //css(),
	js: () => import("@codemirror/lang-javascript").then((m) => m.javascript()), //javascript(),
	ts: () =>
		import("@codemirror/lang-javascript").then((m) =>
			m.javascript({ typescript: true })
		), //javascript({ typescript: true }),
	yml: () =>
		import("@codemirror/legacy-modes/mode/yaml").then((m) =>
			StreamLanguage.define(m.yaml)
		), //StreamLanguage.define(yaml),
	dockerfile: () =>
		import("@codemirror/legacy-modes/mode/dockerfile").then((m) =>
			StreamLanguage.define(m.dockerFile)
		), //StreamLanguage.define(dockerFile),
	sh: () =>
		import("@codemirror/legacy-modes/mode/shell").then((m) =>
			StreamLanguage.define(m.shell)
		), //StreamLanguage.define(shell),
	r: () =>
		import("@codemirror/legacy-modes/mode/r").then((m) =>
			StreamLanguage.define(m.r)
		) //StreamLanguage.define(r)
};

function register_alias(lang: Lang, alias: Lang[]) {
	alias.forEach((a) => {
		Object.defineProperty(lang_map, a, {
			enumerable: true,
			get: function () {
				return this[lang];
			}
		});
	});
}

const aliases: Record<Lang, Lang[]> = {
	py: ["python"],
	md: ["markdown"],
	js: ["javascript"],
	ts: ["typescript"],
	sh: ["shell"]
};

Object.entries(aliases).forEach(([lang, aliases]) => {
	register_alias(lang, aliases);
});

console.log(lang_map);
export async function getLanguageExtension(
	lang: Lang
): Promise<Extension | undefined> {
	if (lang && possible_langs.includes(lang)) {
		return await lang_map[lang]();
	}
	return undefined;
}

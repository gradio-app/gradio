import type { Extension } from "@codemirror/state";
import { StreamLanguage, indentUnit } from "@codemirror/language";
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

const CODE_MIRROR_EXTS = [
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
] as const;
export type CodeMirrorLanguage = typeof CODE_MIRROR_EXTS[number];

const CODE_MIRROR_LANG: Record<CodeMirrorLanguage, Extension> = {
	py: [indentUnit.of(" ".repeat(4)), python()],
	python: [indentUnit.of(" ".repeat(4)), python()],
	md: [markdown({ extensions: [frontmatter] })], // md with yaml frontmatter
	markdown: [markdown({ extensions: [frontmatter] })], // md with yaml frontmatter
	json: json(),
	html: html(),
	css: css(),
	js: javascript(),
	javascript: javascript(),
	ts: javascript({ typescript: true }),
	typescript: javascript({ typescript: true }),
	yaml: StreamLanguage.define(yaml),
	yml: StreamLanguage.define(yaml),
	dockerfile: StreamLanguage.define(dockerFile),
	sh: StreamLanguage.define(shell),
	shell: StreamLanguage.define(shell),
	r: StreamLanguage.define(r)
} as const;

const RE_FILE_EXTENSION = /\.([0-9a-z]+)$/i;

export function getLanguageExtension(
	lang: CodeMirrorLanguage
): Extension | undefined {
	if (lang && CODE_MIRROR_EXTS.includes(lang)) {
		return CODE_MIRROR_LANG[lang];
	}
	return undefined;
}

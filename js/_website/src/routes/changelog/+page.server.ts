import changelog_json from "$lib/json/changelog.json";
import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import version from "$lib/json/version.json";

import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";

import Prism from "prismjs";
// Set Prism as global for component files that expect it
(globalThis as any).Prism = Prism;
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";
import "prism-svelte";

const langs = {
	python: "python",
	py: "python",
	bash: "bash",
	csv: "csv",
	html: "html",
	shell: "bash",
	json: "json",
	typescript: "typescript",
	ts: "typescript",
	js: "javascript",
	javascript: "javascript",
	directory: "json",
	svelte: "svelte",
	sv: "svelte",
	md: "markdown",
	css: "css"
};

function highlight(code: string, lang: string | undefined) {
	const _lang = langs[lang as keyof typeof langs] || "";

	const highlighted = _lang
		? `<pre class="language-${lang}"><code>${Prism.highlight(
				code,
				Prism.languages[_lang],
				_lang
			)}</code></pre>`
		: code;

	return highlighted;
}

const raw_content = changelog_json.content;

export async function load() {
	const changelog_slug: object[] = [];

	const get_slug = make_slug_processor();
	function plugin() {
		return function transform(tree: any) {
			tree.children.forEach((n: any) => {
				if (n.type === "element" && ["h2"].includes(n.tagName)) {
					const str_of_heading = to_string(n);
					const slug = get_slug(str_of_heading);

					changelog_slug.push({
						text: str_of_heading,
						href: `#${slug}`,
						level: parseInt(n.tagName.replace("h", ""))
					});

					if (!n.children) n.children = [];
					n.properties.className = ["group"];
					n.properties.id = [slug];
					n.children.push({
						type: "element",
						tagName: "a",
						properties: {
							href: `#${slug}`,
							className: ["invisible", "group-hover-visible"]
						},
						children: [
							{
								type: "element",
								tagName: "img",
								properties: {
									src: anchor,
									className: ["anchor-img"]
								},
								children: []
							}
						]
					});
				}
			});
		};
	}

	const compiled = await compile(raw_content, {
		rehypePlugins: [plugin],
		highlight: {
			highlighter: highlight
		}
	});
	const content = (await compiled?.code) || "";

	return {
		content,
		changelog_slug
	};
}

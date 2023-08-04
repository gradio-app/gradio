// import changelog_json from "$lib/json/changelog.json";
import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import version from "$lib/json/version.json";

import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";

import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";

const langs = {
	python: "python",
	py: "python",
	bash: "bash",
	csv: "csv",
	html: "html",
	shell: "bash",
	json: "json",
	typescript: "typescript",
	directory: "json"
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

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;

async function load_release_guide_categories(
	version: string
): Promise<typeof import("$lib/json/changelog.json")> {
	let docs_json = await fetch(`${DOCS_BUCKET}/${version}/changelog.json`);
	return await docs_json.json();
}

async function load_main_guide_categories() {
	return await import(`$lib/json/changelog.json`);
}

export async function load({ params }) {
	let content = (
		params?.version === "main"
			? await load_main_guide_categories()
			: await load_release_guide_categories(params?.version || VERSION)
	).content;

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

	const compiled = await compile(content, {
		rehypePlugins: [plugin],
		highlight: {
			highlighter: highlight
		}
	});
	content = (await compiled?.code) || "";

	return {
		content,
		changelog_slug
	};
}

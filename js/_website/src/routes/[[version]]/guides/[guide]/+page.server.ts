import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";
import { redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";

const langs = {
	python: "python",
	py: "python",
	bash: "bash",
	csv: "csv",
	html: "html",
	shell: "bash",
	json: "json",
	javascript: "javascript",
	js: "javascript",
	typescript: "typescript",
	ts: "typescript",
	directory: "json"
};

function highlight(code: string, lang: string | undefined) {
	const _lang = langs[lang as keyof typeof langs] || "";

	const highlighted = _lang
		? `<div class="codeblock"><pre class="language-${lang}"><code>${Prism.highlight(
				code,
				Prism.languages[_lang],
				_lang
		  )}</code></pre></div>`
		: code;

	return highlighted;
}

import version from "$lib/json/version.json";
export const prerender = true;

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;

async function load_release_guides(
	version: string,
	guide: string
): Promise<typeof import("$lib/json/guides/Gradio-and-Comet.json")> {
	let guide_json = await fetch(
		`${DOCS_BUCKET}/${version}/guides/${guide}.json`
	);
	return await guide_json.json();
}

async function load_release_guide_names(
	version: string
): Promise<typeof import("$lib/json/guides/guide_names.json")> {
	let guide_names_json = await fetch(
		`${DOCS_BUCKET}/${version}/guides/guide_names.json`
	);
	return await guide_names_json.json();
}

async function load_main_guides(guide: string) {
	return await import(`../../../../lib/json/guides/${guide}.json`);
}

async function load_main_guide_names() {
	return await import(`../../../../lib/json/guides/guide_names.json`);
}

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}
	let guide_names_json =
		params?.version === "main"
			? await load_main_guide_names()
			: await load_release_guide_names(params.version || VERSION);

	if (
		!guide_names_json.guide_urls.some((guide: string) => guide === params.guide)
	) {
		throw error(404);
	}

	let guide_json =
		params?.version === "main"
			? await load_main_guides(params.guide)
			: await load_release_guides(params.version || VERSION, params.guide);

	let guide = guide_json.guide;
	const guide_slug: object[] = [];

	const get_slug = make_slug_processor();
	function plugin() {
		return function transform(tree: any) {
			tree.children.forEach((n: any) => {
				if (
					n.type === "element" &&
					["h2", "h3", "h4", "h5", "h6"].includes(n.tagName)
				) {
					const str_of_heading = to_string(n);
					const slug = get_slug(str_of_heading);

					guide_slug.push({
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

	const compiled = await compile(guide.content, {
		rehypePlugins: [plugin],
		highlight: {
			highlighter: highlight
		}
	});
	guide.new_html = compiled?.code;

	return {
		guide,
		guide_slug,
		guide_names: guide_names_json.guide_names
	};
}

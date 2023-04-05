import guide_names_json from "../../guides/json/guide_names.json";
import fs from "fs";
import path from "path";
import { compile } from "mdsvex";
import anchor from "../../../assets/img/anchor.svg";
import { make_slug_processor } from "../../../utils";
import { toString as to_string } from "hast-util-to-string";
let guide_names = guide_names_json.guide_names;

import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";



function plugin() {
	return function transform(tree) {
		tree.children.forEach((n) => {
			if (n.type === "heading") {
				// console.log(n);
			}
		});
	};
}


const langs = {
	python: "python",
	py: "python",
	bash: "bash",
	csv: "csv",
	html: "html",
	shell: "bash",
	json: "json",
	typescript: "typescript",
	directory: "json",
};

function highlight(code, lang) {
	const _lang = langs[lang] || "";

	const highlighted = _lang
		? `<pre class="language-${lang}"><code>${Prism.highlight(
				code,
				Prism.languages[_lang],
				_lang
		  )}</code></pre>`
		: code;

	return highlighted;
}

export async function load({params}) {
	let guide_json = await import(`../../guides/json/${params.guide}.json`);
	let guide = guide_json.guide;
	const guide_slug = [];

	const get_slug = make_slug_processor();
	function plugin() {
		return function transform(tree) {
			tree.children.forEach((n) => {
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
					n.properties.className = ["group"]
					n.properties.id = [slug];
					n.children.push({
						type: "element",
						tagName: "a",
						properties: {
							href: `#${slug}`,
							className: ["invisible", "group-hover-visible"],
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
		guide.new_html = await compiled.code;

	return {
		guide,
		guide_slug,
		guide_names
	};
}

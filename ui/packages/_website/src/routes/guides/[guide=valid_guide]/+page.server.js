import guides_json from "../../guides/guides.json";
import { compile } from "mdsvex";
import anchor from "../../../assets/img/anchor.svg";
import { make_slug_processor } from "../../../utils";
import { toString as to_string } from "hast-util-to-string";
let guides = guides_json.guides;
let guides_by_category = guides_json.guides_by_category;
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";


// let guide;

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

export async function load() {
	const guide_slugs = {};
	for (const guide of guides) {
		const guide_slug = [];

		guide_slugs[guide.name] = guide_slug;
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
		guide.new_html = await compiled.code;
	}

	return {
		guides,
		guide_slugs
	};
}

import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";

function plugin() {
	return function transform(tree: any) {
		tree.children.forEach((n: any) => {
			if (n.type === "heading") {
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
	ts: "typescript",
	javascript: "javascript",
	js: "javascript",
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

export async function load({ parent }) {
	const {
		components,
		helpers,
		modals,
		py_client,
		routes,
		js_client,
		on_main,
		wheel
	} = await parent();

	const guide_slug = [];

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

	const compiled = await compile(js_client, {
		rehypePlugins: [plugin],
		highlight: {
			highlighter: highlight
		}
	});
	let readme_html = await compiled?.code;

	return {
		readme_html,
		components,
		helpers,
		modals,
		routes,
		py_client
	};
}

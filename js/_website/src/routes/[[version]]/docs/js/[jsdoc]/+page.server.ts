import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";
import { highlight } from "$lib/prism";
import { error } from "@sveltejs/kit";

export const prerender = true;

export async function load({ params, parent }) {
	const { js, js_pages } = await parent();

	let name = params.jsdoc;
	const guide_slug = [];

	const get_slug = make_slug_processor();

	if (!js_pages.some((p: string) => p === params.jsdoc)) {
		throw error(404);
	}

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

	let readme_html;

	for (const key in js) {
		if (key == name) {
			const compiled = await compile(js[key], {
				rehypePlugins: [plugin],
				highlight: {
					highlighter: highlight
				}
			});

			readme_html = await compiled?.code;
		}
	}

	return {
		name,
		readme_html,
		js_pages
	};
}

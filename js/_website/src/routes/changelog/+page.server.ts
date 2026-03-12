import changelog_json from "$lib/json/changelog.json";
import { compile } from "mdsvex";
import anchor from "$lib/assets/img/anchor.svg";
import version from "$lib/json/version.json";

import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";

import { highlight } from "$lib/prism";

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

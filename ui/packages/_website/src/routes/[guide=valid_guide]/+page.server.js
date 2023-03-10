import guides_json from "../guides/guides.json";
import { compile } from "mdsvex";
import anchor from "../../assets/img/anchor.svg";
import { make_slug_processor } from "../../utils";
import { toString as to_string } from "hast-util-to-string";
let guides = guides_json.guides;
let guides_by_category = guides_json.guides_by_category;
// let guide;

function plugin() {
	return function transform(tree) {
		tree.children.forEach((n) => {
			if (n.type === "heading") {
				console.log(n);
			}
		});
	};
}

export async function load() {
	const guide_slugs = {};
	for (const guide of guides) {
		const guide_slug = [];

		guide_slugs[guide.name] = guide_slug;
		const get_slug = make_slug_processor();
		console.log(to_string);
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
						n.properties.id = [slug];
						n.children.push({
							type: "element",
							tagName: "a",
							properties: {
								href: `#${slug}`
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
			rehypePlugins: [plugin]
		});
		guide.new_html = await compiled.code;
	}

	// these are the slugs that we can use to build the navigation
	console.log(guide_slugs);
	return {
		guides,
		guide_slugs
	};
}

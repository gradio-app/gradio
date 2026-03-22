import { compile } from "mdsvex";
import { highlight } from "$lib/prism";
import anchor from "$lib/assets/img/anchor.svg";
import { make_slug_processor } from "$lib/utils";
import { toString as to_string } from "hast-util-to-string";
import { error } from "@sveltejs/kit";

export const prerender = true;

async function load_main_blogs(blog: string) {
	return await import(`../../lib/json/blogs/${blog}.json`);
}

export async function load({ params, parent }) {
	const { blog_names_json, blogs } = await parent();

	if (!blog_names_json.blog_urls.some((blog: string) => blog === params.blog)) {
		throw error(404);
	}

	let blog_json = blogs[params.blog];

	let blog = blog_json.blog;
	const blog_slug: object[] = [];

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

					blog_slug.push({
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

	const compiled = await compile(blog.content, {
		rehypePlugins: [plugin],
		highlight: { highlighter: highlight },
		smartypants: false
	});
	blog.new_html = compiled?.code;

	return {
		blog,
		blog_slug,
		blog_names: blog_names_json.blog_names
	};
}

import { json } from "@sveltejs/kit";
import { render } from "svelte/server";

export const prerender = true;

function removeMarkdown(markdown) {
	return markdown
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/(\*\*|__)(.*?)\1/g, "$2")
		.replace(/(\*|_)(.*?)\1/g, "$2")
		.replace(/~~(.*?)~~/g, "$1")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/```[\s\S]*?```/g, "")
		.replace(/!\[.*?\]\(.*?\)/g, "")
		.replace(/\[(.*?)\]\(.*?\)/g, "$1")
		.replace(/^>\s+/gm, "")
		.replace(/^---$/gm, "")
		.replace(/^\s*[-+*]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/\n{2,}/g, "\n")
		.trim();
}

export async function GET() {
	const gradio_doc_paths = import.meta.glob(
		"/src/lib/templates/gradio/**/*.svx"
	);
	const gradio_doc_pages = await Promise.all(
		Object.entries(gradio_doc_paths).map(async ([path, content]) => {
			const module = await content();
			const rendered = render(module.default, { props: {} });
			content = rendered.body;
			let match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
			let title = "";
			if (match && match[1]) {
				title = match[1];
			}
			path = path.split("/").slice(-1)[0];
			path = path.match(/(?:\d{2}_)?(.+)/i)[1];
			path = "/main/docs/gradio/" + path.split(".svx")[0];

			// content = content.replace(/<div class="codeblock"*>([^]*?)<\/div>/g, '')
			content = content.replace(/<gradio-lite*?>([^]*?)<\/gradio-lite>/g, "");
			content = content.replace(
				/<pre[^>]*><code[^>]*>([^]*?)<\/code><\/pre>/g,
				"```\n$1\n```"
			);
			content = content.replace(
				/<span[^>]*>|<\/span>|<\/?[^>]*(token)[^>]*>/g,
				""
			);
			content = content.replace(/<[^>]*>?/gm, "");
			content = content.replace(/Open in 🎢.*?\n\t\t/g, "");

			return {
				title: title,
				slug: path,
				content: content,
				type: "DOCS"
			};
		})
	);

	const client_doc_paths = import.meta.glob(
		"/src/lib/templates/python-client/**/*.svx"
	);
	const client_doc_pages = await Promise.all(
		Object.entries(client_doc_paths).map(async ([path, content]) => {
			const module = await content();
			const rendered = render(module.default, { props: {} });
			content = rendered.body;
			let match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
			let title = "";
			if (match && match[1]) {
				title = match[1];
			}
			path = path.split("/").slice(-1)[0];
			path = path.match(/(?:\d{2}_)?(.+)/i)[1];
			path = "/main/docs/python-client/" + path.split(".svx")[0];

			content = content.replace(
				/<pre[^>]*?language-(\w+)[^>]*?><code[^>]*?>([^]*?)<\/code><\/pre>/g,
				"```$1\n$2\n```"
			);
			content = content.replace(
				/<span[^>]*>|<\/span>|<\/?[^>]*(token)[^>]*>/g,
				""
			);
			content = content.replace(
				/<gradio-lite[^>]*>([^]*?)<\/gradio-lite>/g,
				"```python\n$1\n```"
			);
			content = content.replace(/<[^>]*>?/gm, "");

			return {
				title: title,
				slug: path,
				content: content,
				type: "DOCS"
			};
		})
	);

	const guide_paths = import.meta.glob("/src/lib/json/guides/*.json");
	delete guide_paths["/src/lib/json/guides/guides_by_category.json"];
	delete guide_paths["/src/lib/json/guides/guide_names.json"];
	const guide_pages = await Promise.all(
		Object.entries(guide_paths).map(async ([path, content]) => {
			content = await content();
			content = content.default.guide;
			return {
				title: content.pretty_name,
				slug: content.url,
				content: removeMarkdown(content.content.replaceAll(/<[^>]*>?/gm, "")),
				type: "GUIDE"
			};
		})
	);

	const jsons_path = import.meta.glob("/src/lib/json/docs.json");
	const jsons_content = await jsons_path["/src/lib/json/docs.json"]();

	const js_client_page = {
		title: "JavaScript Client Library",
		slug: "/docs/js-client",
		content: removeMarkdown(jsons_content.default.js_client),
		type: "DOCS"
	};

	const js_components = jsons_content.default.js;
	const js_pages = await Promise.all(
		Object.entries(js_components).map(async ([name, content]) => {
			return {
				title: name,
				slug: "/docs/js/" + name,
				content: removeMarkdown(content.replaceAll(/<[^>]*>?/gm, "")),
				type: "DOCS"
			};
		})
	);

	let all_pages = gradio_doc_pages
		.concat(client_doc_pages)
		.concat(guide_pages)
		.concat([js_client_page])
		.concat(js_pages);
	return json(all_pages);
}

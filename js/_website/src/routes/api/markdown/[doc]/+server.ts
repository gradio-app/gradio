import { json } from "@sveltejs/kit";
import { readFileSync } from "fs";
import { resolve as pathResolve } from "path";
import { svxToMarkdown } from "$lib/utils/svx-to-markdown";
import docs_json from "$lib/templates/docs.json";

export const prerender = true;

export function entries() {
	return docs_json.pages.gradio.flatMap((category) =>
		category.pages.map((page) => ({ doc: page.name }))
	);
}

export async function GET({ params }) {
	const name = params.doc;
	const pages = docs_json.pages;

	let svxPath: string | null = null;
	for (const category of pages.gradio) {
		for (const page of category.pages) {
			if (page.name === name) {
				svxPath = page.path;
				break;
			}
		}
		if (svxPath) break;
	}

	if (!svxPath) {
		return json({ markdown: "", error: "Doc not found" }, { status: 404 });
	}

	try {
		const fullPath = pathResolve(process.cwd(), "src/lib/templates", svxPath);
		const svxContent = readFileSync(fullPath, "utf-8");

		const markdown = await svxToMarkdown(svxContent, name);

		return json({ markdown });
	} catch (error) {
		console.error("Error generating markdown:", error);
		return json(
			{ markdown: "", error: "Error generating markdown" },
			{ status: 500 }
		);
	}
}

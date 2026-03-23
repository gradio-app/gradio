import { json } from "@sveltejs/kit";
import guide_names from "$lib/json/guides/guide_names.json";
import { cleanGuideHtml } from "$lib/utils/clean-guide-html";

export const prerender = true;

export function entries() {
	return guide_names.guide_urls.map((guide) => ({ guide }));
}

export async function GET({ params }) {
	const { guide } = params;

	try {
		const module = await import(`$lib/json/guides/${guide}.json`);
		const data = module.default || module;
		const markdown = data.guide?.content;

		if (!markdown) {
			return json({ markdown: "", error: "Guide not found" }, { status: 404 });
		}

		return json({ markdown: await cleanGuideHtml(markdown) });
	} catch {
		return json({ markdown: "", error: "Guide not found" }, { status: 404 });
	}
}

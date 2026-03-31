import guide_names from "$lib/json/guides/guide_names.json";
import { cleanGuideHtml } from "$lib/utils/clean-guide-html";

export const prerender = true;

const MARKDOWN_HEADERS = {
	"Content-Type": "text/markdown; charset=utf-8",
	"X-Robots-Tag": "noindex"
};

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
			return new Response("Guide not found", { status: 404 });
		}

		return new Response(await cleanGuideHtml(markdown), {
			headers: MARKDOWN_HEADERS
		});
	} catch {
		return new Response("Guide not found", { status: 404 });
	}
}

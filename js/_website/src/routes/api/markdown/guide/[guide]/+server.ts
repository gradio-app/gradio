import { json } from "@sveltejs/kit";

export const prerender = true;

const guideModules = import.meta.glob("$lib/json/guides/*.json");

export function entries() {
	return Object.keys(guideModules).map((path) => ({
		guide: path.replace(/^.*\/(.+)\.json$/, "$1")
	}));
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

		return json({ markdown });
	} catch {
		return json({ markdown: "", error: "Guide not found" }, { status: 404 });
	}
}

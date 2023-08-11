import { redirect } from "@sveltejs/kit";
import * as version from "$lib/json/version.json";

const COLOR_SETS = [
	["from-green-100", "to-green-50"],
	["from-yellow-100", "to-yellow-50"],
	["from-red-100", "to-red-50"],
	["from-blue-100", "to-blue-50"],
	["from-pink-100", "to-pink-50"],
	["from-purple-100", "to-purple-50"],
	["from-green-100", "to-green-50"],
	["from-yellow-100", "to-yellow-50"],
	["from-red-100", "to-red-50"],
	["from-blue-100", "to-blue-50"],
	["from-pink-100", "to-pink-50"],
	["from-purple-100", "to-purple-50"]
];

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;

async function load_release_guide_categories(
	version: string
): Promise<typeof import("$lib/json/guides/guides_by_category.json")> {
	let docs_json = await fetch(
		`${DOCS_BUCKET}/${version}/guides/guides_by_category.json`
	);
	return await docs_json.json();
}

async function load_main_guide_categories() {
	return await import(`../../../lib/json/guides/guides_by_category.json`);
}

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}
	let guides_by_category = (
		params?.version === "main"
			? await load_main_guide_categories()
			: await load_release_guide_categories(params?.version || VERSION)
	).guides_by_category;

	let total_guides = 0;
	for (const category in guides_by_category) {
		for (const guide in guides_by_category[category].guides) {
			total_guides += 1;
		}
	}

	return {
		guides_by_category,
		total_guides,
		COLOR_SETS
	};
}

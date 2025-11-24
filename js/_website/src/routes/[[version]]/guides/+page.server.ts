import { redirect } from "@sveltejs/kit";
import * as version from "$lib/json/version.json";

const COLOR_SETS = [
	"green",
	"yellow",
	"red",
	"blue",
	"pink",
	"purple",
	"green",
	"yellow",
	"red",
	"blue",
	"pink",
	"purple"
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

	// Redirect to quickstart guide
	const versionPrefix = params?.version ? `/${params.version}` : "";
	throw redirect(302, `${versionPrefix}/guides/quickstart`);
}

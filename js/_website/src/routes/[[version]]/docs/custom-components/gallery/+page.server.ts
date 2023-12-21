import version from "$lib/json/version.json";
import { redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const prerender = true;

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;

async function load_release_guide_names(
	version: string
): Promise<typeof import("$lib/json/guides/guide_names.json")> {
	let guide_names_json = await fetch(
		`${DOCS_BUCKET}/${version}/guides/cc_guide_names.json`
	);
	return await guide_names_json.json();
}


async function load_main_guide_names() {
	return await import(`../../../../../lib/json/guides/cc_guide_names.json`);
}

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}
	let guide_names_json =
		params?.version === "main"
			? await load_main_guide_names()
			: await load_release_guide_names(params.version || VERSION);

    return {
        guide_names: guide_names_json.guide_names
    };
}

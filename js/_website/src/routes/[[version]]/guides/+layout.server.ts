import version from "$lib/json/version.json";
import { redirect } from "@sveltejs/kit";

export const prerender = true;

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;

let cache = new Map();

async function load_release_guide_names(
	version: string
): Promise<typeof import("$lib/json/guides/guide_names.json")> {
	if (cache.has(`${version}_guide_names`)) {
		return cache.get(`${version}_guide_names`);
	}
	let guide_names_json = await fetch(
		`${DOCS_BUCKET}/${version}/guides/guide_names.json`
	);

	let json = await guide_names_json.json();
	cache.set(`${version}_guide_names`, json);
	return json;
}

async function load_main_guide_names() {
	if (cache.has(`main_guide_names`)) {
		return cache.get(`main_guide_names`);
	}
	let guide_names_json = await import(
		`../../../lib/json/guides/guide_names.json`
	);
	cache.set(`main_guide_names`, guide_names_json);
	return guide_names_json;
}

async function load_release_guides(version: string, guide_urls: string[]) {
	if (cache.has(`${version}_guides`)) {
		return cache.get(`${version}_guides`);
	}
	let guides: { [key: string]: any } = {};
	for (const guide_url of guide_urls) {
		let guide_json = await fetch(
			`${DOCS_BUCKET}/${version}/guides/${guide_url}.json`
		);
		guides[guide_url] = await guide_json.json();
	}
	cache.set(`${version}_guides`, guides);
	return guides;
}

async function load_main_guides(guide_urls: string[]) {
	if (cache.has(`main_guides`)) {
		return cache.get(`main_guides`);
	}
	let guides: { [key: string]: any } = {};
	for (const guide_url of guide_urls) {
		let guide_json = await import(`../../../lib/json/guides/${guide_url}.json`);
		guides[guide_url] = guide_json;
	}
	cache.set(`main_guides`, guides);
	return guides;
}

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}
	let guide_names_json =
		params?.version === "main"
			? await load_main_guide_names()
			: await load_release_guide_names(params.version || VERSION);

	let guides =
		params?.version === "main"
			? await load_main_guides(guide_names_json.guide_urls)
			: await load_release_guides(
					params.version || VERSION,
					guide_names_json.guide_urls
				);
	return {
		guide_names_json,
		guides
	};
}

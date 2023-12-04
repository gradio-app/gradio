import { redirect } from "@sveltejs/kit";
import version from "$lib/json/version.json";
import wheel from "$lib/json/wheel.json";
export const prerender = true;

const DOCS_BUCKET = "https://gradio-docs-json.s3.us-west-2.amazonaws.com";
const VERSION = version.version;
const WHEEL = wheel.wheel;

async function load_release_docs(
	version: string
): Promise<typeof import("$lib/json/docs.json")> {
	let docs_json = await fetch(`${DOCS_BUCKET}/${version}/docs.json`);
	return await docs_json.json();
}

async function load_main_docs(): Promise<typeof import("$lib/json/docs.json")> {
	return await import("$lib/json/docs.json");
}

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}
	let docs_json =
		params?.version === "main"
			? await load_main_docs()
			: await load_release_docs(params.version || VERSION);

	let docs: { [key: string]: any } = docs_json.docs;
	let components = docs_json.docs.components;
	let helpers = docs_json.docs.helpers;
	let modals = docs_json.docs.modals || [];
	let routes = docs_json.docs.routes;
	let py_client = docs_json.docs["py-client"];
	let js = docs_json.js || {};
	let js_pages = docs_json.js_pages || [];
	let js_client = docs_json.js_client;
	let on_main = params.version === "main";
	let wheel: string = WHEEL;
	let pages: string[] = docs_json.pages;

	let url_version = params?.version || VERSION;

	return {
		docs,
		components,
		helpers,
		modals,
		routes,
		py_client,
		js,
		js_pages,
		on_main,
		wheel,
		pages,
		js_client,
		url_version
	};
}

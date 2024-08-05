import { error } from "@sveltejs/kit";

export async function load({ params, parent }) {
	const { on_main, wheel, pages, url_version, VERSION } = await parent();

	const modules: any = import.meta.glob(
		"/src/lib/templates*/third-party-clients/**/*.svx"
	);
	let name = params.doc;
	let page_path: string | null = null;

	for (const category of pages["third-party-clients"]) {
		for (const page of category.pages) {
			if (page.name === name) {
				page_path = page.path;
			}
		}
	}

	if (page_path === null) {
		throw error(404);
	}

	let version_append = on_main ? "/" : "_" + VERSION.replace(/\./g, "-") + "/";
	let module;

	for (const path in modules) {
		if (
			path.includes(page_path) &&
			path.includes("templates" + version_append)
		) {
			module = await modules[path]();
		}
	}

	return {
		name,
		on_main,
		wheel,
		url_version,
		pages,
		page_path,
		module
	};
}

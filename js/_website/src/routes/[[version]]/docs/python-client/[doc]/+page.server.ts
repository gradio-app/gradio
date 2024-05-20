import { error } from "@sveltejs/kit";

export async function load({ params, parent }) {
	const { on_main, wheel, pages, url_version } = await parent();

	let name = params.doc;
	let page_path: string | null = null;

	for (const category of pages["python-client"]) {
		for (const page of category.pages) {
			if (page.name === name) {
				page_path = page.path;
			}
		}
	}

	if (page_path === null) {
		throw error(404);
	}

	return {
		name,
		on_main,
		wheel,
		url_version,
		pages,
		page_path
	};
}

import { redirect } from "@sveltejs/kit";

export const prerender = true;

async function urlExists(fetch: any, url: string): Promise<boolean> {
	try {
		const res = await fetch(url, { method: "HEAD" });
		return res.ok;
	} catch (e) {
		return false;
	}
}

export async function load({ params, fetch }) {
	const url = params.version
		? `/${params.version}/docs/js/dataframe`
		: `/docs/js/dataframe`;
	const fallback_url = params.version
		? `/${params.version}/docs/js/js-client`
		: `/docs/js/js-client`;
	const exists = await urlExists(fetch, url);

	if (exists) {
		throw redirect(302, url);
	}

	throw redirect(302, fallback_url);
}

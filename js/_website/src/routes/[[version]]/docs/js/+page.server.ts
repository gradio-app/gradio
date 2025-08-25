import { redirect } from "@sveltejs/kit";

export const prerender = true;

async function urlExists(fetch: any, url: string): Promise<boolean> {
	try {
		const res = await fetch(url, { method: "HEAD" });
		console.log("URL EXISTS", url, res, res.ok);
		return res.ok;
	} catch (e) {
		console.log("URL EXISTS ERROR", url, e, false);
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

	console.log(url, exists, params);

	if (exists) {
		throw redirect(302, url);
	}

	throw redirect(302, fallback_url);
}

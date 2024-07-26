import { redirect } from "@sveltejs/kit";

export function load({ params, url }) {
	if (params?.version != "main") {
		throw redirect(302, `/main` + url.pathname);
	}
}

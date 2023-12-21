import { redirect } from "@sveltejs/kit";

export function load({ params }) {
	if (params?.version)
		throw redirect(302, `/${params?.version}/docs/lite/getting-started`);

	throw redirect(302, `/docs/lite/getting-started`);
}
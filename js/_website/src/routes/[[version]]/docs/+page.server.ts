import { redirect } from "@sveltejs/kit";

export function load({ params }) {
	if (params?.version)
		throw redirect(302, `/${params?.version}/docs/interface`);

	throw redirect(302, `/docs/interface`);
}

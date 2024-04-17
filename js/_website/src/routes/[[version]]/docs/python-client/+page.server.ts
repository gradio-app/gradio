import { redirect } from "@sveltejs/kit";

export function load({ params }) {
	if (params?.version)
		throw redirect(302, `/${params?.version}/docs/python-client/intro`);

	throw redirect(302, `/docs/python-client/intro`);
}

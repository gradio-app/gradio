import { redirect } from "@sveltejs/kit";

export const prerender = true;

export function load({ params }) {
	if (params?.version)
		throw redirect(
			302,
			`/${params?.version}/docs/custom-components/custom-components-in-five-minutes`
		);

	throw redirect(
		302,
		`/docs/custom-components/custom-components-in-five-minutes`
	);
}

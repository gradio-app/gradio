import { redirect } from "@sveltejs/kit";

export function load({ params }) {
	if (params?.version)
		throw redirect(302, `/main/docs/third-party-clients/introduction`);

	throw redirect(302, `/main/docs/third-party-clients/introduction`);
}

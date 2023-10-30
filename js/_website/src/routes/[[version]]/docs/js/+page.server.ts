import { redirect } from "@sveltejs/kit";

export const prerender = true;

export function load({ params }) {
	throw redirect(302, `./js/accordion`);
}

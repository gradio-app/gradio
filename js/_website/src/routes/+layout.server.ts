import { redirect } from "@sveltejs/kit";
import { redirects } from "./redirects.js";

export const prerender = true;

export async function load({ url }: any) {
	if (url.pathname in redirects) {
		throw redirect(308, redirects[url.pathname as keyof typeof redirects]);
	}
}

import { redirect } from "@sveltejs/kit";
import { redirects } from "./redirects.js";

export const prerender = true;

export async function load({ url }: any) {
	console.log(url.pathname);

	for (const key in redirects) {
		console.log(key);
		

		if (url.pathname.indexOf(key) !== -1 && url.pathname.indexOf('guides/') === -1) {
			console.log('redirect')
			throw redirect(308, redirects[key as keyof typeof redirects]);
		}
	}
	
}

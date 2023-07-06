import { redirect } from "@sveltejs/kit";
import { redirects } from "./redirects.js";

export const prerender = true;

export async function load({ url }: any) {
	// const _url = new URL(url.pathname, url.origin)
	// console.log(_url)

	for (const key in redirects) {
		// console.log(key);

		const _url = new URL(`${key}`, url.origin)

		// console.log(_url)
		

		if (url.pathname === _url.pathname) {
			console.log('redirect')
			throw redirect(308, redirects[key as keyof typeof redirects]);
		}
	}
	
}

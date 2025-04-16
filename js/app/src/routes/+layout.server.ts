import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";

export function load({ url }): void {
	const { pathname, search } = url;

	if (dev && url.pathname.startsWith("/theme")) {
		redirect(308, `http://127.0.0.1:7860${pathname}${search}`);
	}
}

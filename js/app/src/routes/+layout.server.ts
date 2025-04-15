import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";

export function load({ url }): void {
	const { pathname, search } = url;
	const api_base_url = "http://127.0.0.1:7860";

	if (dev && url.pathname.startsWith("/theme")) {
		redirect(308, `${api_base_url}${pathname}${search}`);
	}
}

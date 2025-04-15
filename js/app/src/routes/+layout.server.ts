import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { PUBLIC_API_BASE_URL } from "$env/static/public";

export function load({ url }): void {
	const { pathname, search } = url;
	console.log("PUBLIC_API_BASE_URL", PUBLIC_API_BASE_URL);
	const api_base_url = PUBLIC_API_BASE_URL || "http://127.0.0.1:7860";

	if (dev && url.pathname.startsWith("/theme")) {
		redirect(308, `${api_base_url}${pathname}${search}`);
	}
}

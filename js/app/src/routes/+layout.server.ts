// import { type LayoutServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";

export function load({ url }): void {
	if (url.pathname !== "/") {
		redirect(308, "/");
	}
}

import * as svelte from "svelte";
const is_browser = typeof window !== "undefined";
if (is_browser) {
	const o = {
		SvelteComponent: svelte.SvelteComponent
	};
	for (const key in svelte) {
		// if (key === "SvelteComponent") continue;
		// if (key === "SvelteComponentDev") {
		// 	//@ts-ignore
		// 	o[key] = o["SvelteComponent"];
		// } else {
		// @ts-ignore
		o[key] = svelte[key];
		// }
	}
	window.__gradio__svelte__internal = o;
	window.__gradio__svelte__internal["globals"] = {};
	window.globals = window;
}

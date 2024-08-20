import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import {
	generate_cdn_entry,
	generate_dev_entry,
	handle_ce_css,
	inject_component_loader,
	inject_ejs,
	mock_modules,
	resolve_svelte
} from "@gradio/build";

export default defineConfig({
	plugins: [sveltekit(), inject_component_loader({ mode: "development" })]
});

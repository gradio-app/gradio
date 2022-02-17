import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// this is dupe config, gonna try fix this
import tailwind from "tailwindcss";
import nested from "tailwindcss/nesting";

//@ts-ignore
export default defineConfig(({ mode }) => {
	const production = mode === "production";

	return {
		build: {
			outDir: "../../../gradio/templates/frontend"
		},
		define: {
			BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://localhost:7860/")
		},
		css: {
			postcss: {
				plugins: [nested, tailwind]
			}
		},
		plugins: [
			svelte({
				preprocess: sveltePreprocess({
					postcss: { plugins: [nested, tailwind] }
				})
			})
		]
	};
});

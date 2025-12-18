import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		svelte({
			prebundleSvelteLibraries: true,
			compilerOptions: {
				dev: true
			}
		})
	],
	resolve: {
		conditions: ["gradio", "browser"]
	},
	define: {
		BUILD_MODE: JSON.stringify("dev"),
		BACKEND_URL: JSON.stringify("http://localhost:7860/"),
		GRADIO_VERSION: JSON.stringify("dev")
	}
});

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			"@gradio/upload": path.resolve(__dirname, "stubs/upload.ts"),
			"@gradio/client": path.resolve(__dirname, "stubs/client.ts"),
			"./Upload.svelte": path.resolve(__dirname, "stubs/Upload.svelte")
		}
	}
});

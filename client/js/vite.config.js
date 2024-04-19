import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"],
			fileName: (format) => `index.${format}.js`
		},
		rollupOptions: {
			input: "src/index.ts",
			output: {
				dir: "dist"
			}
		}
	},
	plugins: [svelte()],

	ssr: {
		target: "node",
		format: "esm",
		noExternal: ["ws", "semiver", "bufferutil", "@gradio/upload"]
	}
});

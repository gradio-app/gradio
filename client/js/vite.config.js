import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const TEST_MODE = process.env.TEST_MODE || "happy-dom";

export default defineConfig(({ mode }) => {
	if (mode === "preview") {
		return {
			entry: "index.html"
		};
	}
	return {
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

		mode: process.env.MODE || "development",
		test: {
			include: ["./src/test/*.test.*"],
			environment: TEST_MODE
		},
		ssr: {
			target: "node",
			format: "esm",
			noExternal: [
				"ws",
				"semiver",
				"bufferutil",
				"@gradio/upload",
				"fetch-event-stream"
			]
		}
	};
});

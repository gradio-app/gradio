import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const TEST_MODE = process.env.TEST_MODE || "happy-dom";

export default defineConfig(({ mode }) => {
	const production = mode === "production";
	const isBrowserBuild = process.env.BROWSER_BUILD === "true";

	if (mode === "preview") {
		return {
			entry: "index.html"
		};
	}

	return {
		build: {
			emptyOutDir: false,
			lib: {
				entry: "src/index.ts",
				formats: ["es"],
				fileName: (format) =>
					isBrowserBuild ? `browser.${format}.js` : `index.${format}.js`
			},
			rollupOptions: {
				input: "src/index.ts",
				output: {
					dir: "dist"
				}
			}
		},
		plugins: [svelte()],
		define: {
			BROWSER_BUILD: JSON.stringify(isBrowserBuild)
		},
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

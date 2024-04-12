import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"],
			fileName: (format) => `index.${format}.js`
		},
		rollupOptions: {
			external: ["ws"],
			output: {
				globals: {
					ws: "WebSocket"
				}
			}
		}
	},
	plugins: [
		svelte(),
		dts({
			insertTypesEntry: true
		})
	],

	ssr: {
		target: "node",
		format: "esm",
		noExternal: ["ws", "semiver", "@gradio/upload"]
	}
});

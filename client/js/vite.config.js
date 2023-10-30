import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"]
		},
		rollupOptions: {
			input: "src/index.ts",
			output: {
				dir: "dist"
			}
		}
	},
	plugins: [
		svelte()
		// {
		// 	name: "resolve-gradio-client",
		// 	enforce: "pre",
		// 	resolveId(id) {
		// 		if (id === "@gradio/client") {
		// 			return path.join(__dirname, "src", "index.ts");
		// 		}
		// 	}
		// }
	],

	ssr: {
		target: "node",
		format: "esm",
		noExternal: ["ws", "semiver", "@gradio/upload"]
	}
});

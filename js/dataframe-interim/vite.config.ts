import { defineConfig, type Plugin } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.resolve(__dirname);

function gradioPlugin(): Plugin {
	return {
		enforce: "pre",
		name: "gradio",
		resolveId(id, importer) {
			if (id.startsWith("@gradio/image")) {
				return path.resolve(
					dir,
					"node_modules",
					"@gradio",
					"image",
					"Index.svelte"
				);
			}
		}
	};
}
export default defineConfig({
	plugins: [svelte({ preprocess: vitePreprocess() }), gradioPlugin()],
	resolve: {
		conditions: ["gradio", "svelte", "browser", "import", "default"]
	},
	build: {
		minify: false,
		sourcemap: true,
		lib: {
			entry: "./Index.svelte",
			formats: ["es"],
			fileName: "index"
		}
	}
});

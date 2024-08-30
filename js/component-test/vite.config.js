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
} from "@self/build";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [sveltekit()],

	resolve: {
		conditions: ["gradio"],
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
	optimizeDeps: {
		exclude: [
			"@gradio/video",
			"@ffmpeg/ffmpeg",
			"@ffmpeg/util",
			"@gradio/utils"
		]
	},
	assetsInclude: ["**/*.glb"],
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp"
		},
		fs: {
			allow: ["../.."]
		}
	}
});

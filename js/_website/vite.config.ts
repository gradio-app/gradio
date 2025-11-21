import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inject_component_loader } from "../build/out/index.js";
import { patchParamViewer } from "./vite-plugin-patch-paramviewer.js";

//@ts-ignore
export default defineConfig(({ mode }) => ({
	plugins: [patchParamViewer(), sveltekit(), inject_component_loader({ mode })],
	resolve: {
		conditions: ["gradio"]
	},
	build: {
		rollupOptions: {
			external: ["@gradio/wasm/svelte", "dompurify"]
		}
	}
}));

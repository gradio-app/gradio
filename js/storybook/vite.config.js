import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import autoprefixer from "autoprefixer";
import { inject_component_loader } from "../build/out/index.js";

export default defineConfig({
	base: "",
	server: {
		fs: {
			allow: [".."]
		}
	},

	plugins: [
		svelte({
			inspector: false,
			hot: {
				preserveLocalState: true
			},
			preprocess: sveltePreprocess({
				sourceMap: false,
				postcss: {
					plugins: [autoprefixer()]
				}
			})
		}),
		inject_component_loader({ mode: "storybook" })
	],
	resolve: {
		conditions: ["gradio"]
	}
});

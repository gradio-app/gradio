import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import autoprefixer from "autoprefixer";

export default defineConfig({
	base: "",
	server: {
		fs: {
			allow: [".."]
		}
	},

	plugins: [
		svelte({
			hot: {
				preserveLocalState: true
			},
			preprocess: sveltePreprocess({
				sourceMap: false,
				postcss: {
					plugins: [autoprefixer()]
				}
			})
		})
	]
});

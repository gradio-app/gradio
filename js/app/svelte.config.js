import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import custom_media from "postcss-custom-media";
import global_data from "@csstools/postcss-global-data";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { join } from "path";

const __dirname = fileURLToPath(import.meta.url);
const out_path = resolve(__dirname, "../../../gradio/templates/node/build");
const theme_token_path = join(
	__dirname,
	"..",
	"..",
	"theme",
	"src",
	"tokens.css"
);
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors

	preprocess: vitePreprocess(),
	// sveltePreprocess({
	// 	postcss: {
	// 		plugins: [global_data({ files: [theme_token_path] }), custom_media()]
	// 	}
	// })

	vitePlugin: {
		prebundleSvelteLibraries: false
	},

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			out: out_path
		})
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;

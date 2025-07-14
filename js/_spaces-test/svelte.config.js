import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import global_data from "@csstools/postcss-global-data";
import custom_media from "postcss-custom-media";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const theme_token_path = resolve(__dirname, "../theme/src/tokens.css");

// /** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	},
	preprocess: [
		vitePreprocess(),
		sveltePreprocess({
			postcss: {
				plugins: [global_data({ files: [theme_token_path] }), custom_media()]
			}
		})
	]
};

export default config;

import adapter from "@sveltejs/adapter-auto";
import svelte_preprocess from "svelte-preprocess";

import tailwind from "tailwindcss";
import nested from "postcss-nested";
import autoprefix from "autoprefixer";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		svelte_preprocess({
			postcss: { plugins: [tailwind, nested, autoprefix] }
		})
	],

	kit: {
		adapter: adapter()
	}
};

export default config;

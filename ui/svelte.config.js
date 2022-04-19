import svelte_preprocess from "svelte-preprocess";

import tailwind from "tailwindcss";
import nested from "postcss-nested";
import autoprefix from "autoprefixer";
import tw_config from "./tailwind.config.cjs";

/** @type {import('@sveltejs/kit').Config} */
export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		svelte_preprocess({
			postcss: { plugins: [tailwind(tw_config), nested, autoprefix] }
		})
	]
};

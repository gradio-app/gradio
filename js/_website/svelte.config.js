import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import _version from "./src/lib/json/version.json" assert { type: "json" };

const version = _version.version;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		prerender: {
			entries: [
				"*",
				`/${version}/docs`,
				`/${version}/guides`,
				`/main/docs`,
				`/main/guides`
				// "/main/docs/interface"
			]
		},
		files: {
			lib: "src/lib"
		},
		adapter: adapter()
	}
};

export default config;

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { redirects } from "./src/routes/redirects.js";

let version = "4.0.0"; // default version

const get_version = async () => {
	try {
		await import("./src/lib/json/version.json").then((module) => {
			version = module.version;
		});
	} catch (error) {
		console.error(
			"Using fallback version 4.0.0 as version.json was not found. Run `generate_jsons/generate.py` to get the latest version."
		);
	}
	return version;
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		prerender: {
			crawl: true,
			entries: [
				"*",
				`/${get_version()}/docs`,
				`/${get_version()}/guides`,
				`/main/docs`,
				`/main/guides`,
				`/main/docs/js`,
				`/main/docs/js/storybook`,
				`/main/docs/js/`,
				`/${version}/docs`,
				`/${version}/guides`,
				...Object.keys(redirects)
			]
		},
		files: {
			lib: "src/lib"
		},
		adapter: adapter()
	}
};

export default config;

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { redirects } from "./src/routes/redirects.js";

let version; 

async function get_version() {
	try {
	  const _version = await import("./src/lib/json/version.json", {
		assert: { type: "json" },
	  });
	  return _version;
	} catch (error) {
	  console.error("version.json not found");
	  return { version: "4.0.0" };
	}
  }

get_version().then((_version) => {
	version = _version.version;
});


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		prerender: {
			crawl: true,
			entries: [
				"*",
				`/${version}/docs`,
				`/${version}/guides`,
				`/main/docs`,
				`/main/guides`,
				`/main/docs/js`,
				`/main/docs/js/storybook`,
				`/main/docs/js/`,
				`/3.50.2/docs`,
				`/3.50.2/guides`,
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

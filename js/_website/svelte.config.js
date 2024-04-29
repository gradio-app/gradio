import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { redirects } from "./src/routes/redirects.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
let version = "4.0.0";

const get_version = async () => {
	try {
		const versionPath = path.join(
			currentDir,
			"src",
			"lib",
			"json",
			"version.json"
		);
		if (!fs.existsSync(versionPath)) {
			console.error(
				"Using fallback version 4.0.0 as version.json was not found. Run `generate_jsons/generate.py` to get the latest version."
			);
			return version;
		} else {
			const versionData = fs.readFileSync(versionPath, "utf8");
			const versionJson = JSON.parse(versionData);
			version = versionJson.version;
		}
	} catch (error) {
		console.error(
			"Using fallback version 4.0.0 as version.json was not found. Run `generate_jsons/generate.py` to get the latest version."
		);
	}
	return version;
};

get_version();

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
				`/3.50.2/docs`,
				`/3.50.2/docs/gradio/interface`,
				`/3.50.2/docs/python-client/intro`,
				`/docs/js`,
				`/docs/js/storybook`,
				`/docs/js/`,
				`/main/docs/js`,
				`/main/docs/js/storybook`,
				`/main/docs/js/`,

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

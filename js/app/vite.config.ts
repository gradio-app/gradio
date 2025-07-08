import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// @ts-ignore
import custom_media from "postcss-custom-media";
// @ts-ignore
import prefixer from "postcss-prefix-selector";
import { cpSync, readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";

import {
	inject_ejs,
	generate_cdn_entry,
	generate_dev_entry,
	handle_ce_css,
	inject_component_loader,
	resolve_svelte,
	mock_modules
} from "@self/build";

const version_path = resolve(__dirname, "../../gradio/package.json");
const theme_token_path = resolve(__dirname, "../theme/src/tokens.css");
const version_raw = JSON.parse(
	readFileSync(version_path, { encoding: "utf-8" })
).version.trim();
const version = version_raw.replace(/\./g, "-");

const GRADIO_VERSION = version_raw || "asd_stub_asd";
const CDN_BASE = "https://gradio.s3-us-west-2.amazonaws.com";

export default defineConfig(({ mode, isSsrBuild }) => {
	const production = mode === "production";
	const development = mode === "development";
	return {
		// plugins: [],
		server: {
			port: 9876,
			open: "/",
			proxy: {
				"/manifest.json": "http://localhost:7860",
				"^/static/.*": "http://localhost:7860"
			}
		},
		resolve: {
			conditions: ["gradio"]
		},
		build: {
			rollupOptions: {
				external: [
					"/svelte/svelte.js",
					"/svelte/svelte-submodules.js",
					"./svelte/svelte-submodules.js",
					"./svelte/svelte.js"
				]
			},
			minify: true,
			sourcemap: true
		},
		define: {
			BROWSER_BUILD: JSON.stringify(isSsrBuild),
			BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://127.0.0.1:7860/"),
			GRADIO_VERSION: JSON.stringify(version)
		},
		css: {
			postcss: {
				plugins: [
					prefixer({
						prefix: `.gradio-container-${version}`,
						// @ts-ignore
						transform(prefix, selector, prefixedSelector, fileName) {
							if (selector.indexOf("gradio-container") > -1) {
								return prefix;
							} else if (
								selector.indexOf(":root") > -1 ||
								selector.indexOf("dark") > -1 ||
								selector.indexOf("body") > -1 ||
								fileName.indexOf(".svelte") > -1
							) {
								return selector;
							}
							return prefixedSelector;
						}
					}),
					custom_media()
				]
			}
		},
		ssr: {
			noExternal: ["@gradio/*", "@huggingface/space-header"],
			external: mode === "development" ? [] : ["svelte", "svelte/*"]
		},
		optimizeDeps: {
			exclude: [
				"@gradio/*",
				"svelte",
				"svelte/*",
				"./svelte/svelte-submodules.js",
				"./svelte/svelte.js"
			]
		},
		plugins: [
			sveltekit(),

			inject_component_loader({ mode }),
			{
				name: "resolve_svelte",
				enforce: "pre",
				resolveId(id, importer, options) {
					if (development) {
						return null;
					}

					if (!options?.ssr) {
						if (id === "svelte" || id === "svelte/internal") {
							return { id: "../../../svelte/svelte.js", external: true };
						}
						if (id.startsWith("svelte/")) {
							return {
								id: "../../../svelte/svelte-submodules.js",
								external: true
							};
						}
					}
				}
			}
		]
	};
});

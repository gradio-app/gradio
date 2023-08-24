import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
// @ts-ignore
import custom_media from "postcss-custom-media";
import global_data from "@csstools/postcss-global-data";
// @ts-ignore
import prefixer from "postcss-prefix-selector";
import { readFileSync } from "fs";
import { resolve } from "path";

const version_path = resolve(__dirname, "../../gradio/version.txt");
const theme_token_path = resolve(__dirname, "../theme/src/tokens.css");
const version_raw = readFileSync(version_path, { encoding: "utf-8" }).trim();
const version = version_raw.replace(/\./g, "-");

const client_version_path = resolve(
	__dirname,
	"../../client/python/gradio_client/version.txt"
);
const client_version_raw = readFileSync(client_version_path, {
	encoding: "utf-8"
}).trim();
const client_version = client_version_raw.replace(/\./g, "-");

import {
	inject_ejs,
	patch_dynamic_import,
	generate_cdn_entry,
	handle_ce_css
} from "./build_plugins";

const GRADIO_VERSION = process.env.GRADIO_VERSION || "asd_stub_asd";
const TEST_CDN = !!process.env.TEST_CDN;
const CDN = TEST_CDN
	? "http://localhost:4321/"
	: `https://gradio.s3-us-west-2.amazonaws.com/${GRADIO_VERSION}/`;
const TEST_MODE = process.env.TEST_MODE || "jsdom";

//@ts-ignore
export default defineConfig(({ mode }) => {
	const CDN_URL = mode === "production:cdn" ? CDN : "/";
	const production =
		mode === "production:cdn" ||
		mode === "production:local" ||
		mode === "production:website" ||
		mode === "production:lite";
	const is_cdn = mode === "production:cdn" || mode === "production:website";
	const is_lite = mode.endsWith(":lite");

	return {
		base: is_cdn ? CDN_URL : "./",

		server: {
			port: 9876,
			open: is_lite ? "/lite.html" : "/"
		},

		build: {
			sourcemap: true,
			target: "modules",
			minify: production,
			outDir: is_lite
				? resolve(__dirname, "../lite/dist")
				: `../../gradio/templates/${is_cdn ? "cdn" : "frontend"}`,
			// To build Gradio-lite as a library, we can't use the library mode
			// like `lib: is_lite && {}`
			// because it inevitably enables inlining of all the static file assets,
			// while we need to disable inlining for the wheel files to pass their URLs to `micropip.install()`.
			// So we build it as an app and only use the bundled JS and CSS files as library assets, ignoring the HTML file.
			// See also `lite.ts` about it.
			rollupOptions: is_lite && {
				input: "./lite.html",
				output: {
					// To use it as a library, we don't add the hash to the file name.
					entryFileNames: "lite.js",
					assetFileNames: (file) => {
						if (file.name?.endsWith(".whl")) {
							// Python wheel files must follow the naming rules to be installed, so adding a hash to the name is not allowed.
							return `assets/[name].[ext]`;
						}
						if (file.name === "lite.css") {
							// To use it as a library, we don't add the hash to the file name.
							return `[name].[ext]`;
						} else {
							return `assets/[name]-[hash].[ext]`;
						}
					}
				}
			}
		},
		define: {
			BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://localhost:7860/"),
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
		plugins: [
			svelte({
				inspector: true,
				compilerOptions: {
					dev: !production
				},
				hot: !process.env.VITEST && !production,
				preprocess: sveltePreprocess({
					postcss: {
						plugins: [
							global_data({ files: [theme_token_path] }),
							custom_media()
						]
					}
				})
			}),
			inject_ejs(),
			patch_dynamic_import({
				mode: is_cdn ? "cdn" : "local",
				gradio_version: GRADIO_VERSION,
				cdn_url: CDN_URL
			}),
			generate_cdn_entry({ enable: is_cdn, cdn_url: CDN_URL }),
			handle_ce_css()
		],
		test: {
			setupFiles: [resolve(__dirname, "../../.config/setup_vite_tests.ts")],
			environment: TEST_MODE,
			include:
				TEST_MODE === "node"
					? ["**/*.node-test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
					: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			globals: true
		},
		resolve: {
			alias: {
				// For the Wasm app to import the wheel file URLs.
				"gradio.whl": resolve(
					__dirname,
					`../../dist/gradio-${version_raw}-py3-none-any.whl`
				),
				"gradio_client.whl": resolve(
					__dirname,
					`../../client/python/dist/gradio_client-${client_version_raw}-py3-none-any.whl`
				)
			}
		},
		assetsInclude: ["**/*.whl"] // To pass URLs of built wheel files to the Wasm worker.
	};
});

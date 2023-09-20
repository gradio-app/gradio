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
import { viteStaticCopy } from 'vite-plugin-static-copy';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

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
			cssCodeSplit: true,
			sourcemap: true,
			target: "esnext",
			minify: production,
			outDir: is_lite
				? resolve(__dirname, "../lite/dist")
				: `../../gradio/templates/${is_cdn ? "cdn" : "frontend"}`,
			lib: is_lite && production && {
				formats: ["es"],
				entry: resolve(__dirname, "./src/lite/index.ts"),
				name: "GradioLite",
				fileName: "gradio-lite"
			},
		},
		define: {
			BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://localhost:7860/"),
			GRADIO_VERSION: JSON.stringify(version),
			GRADIO_VERSION_RAW: JSON.stringify(version_raw),
			GRADIO_CLIENT_VERSION_RAW: JSON.stringify(client_version_raw)
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
			handle_ce_css(),
			is_lite && viteStaticCopy({
				// Gradio-lite is built as a library with Vite's library-mode (https://vitejs.dev/guide/build.html#library-mode),
				// but the library mode enforces inlining of all the static file assets imported with the `import()` syntax,
				// while we need to disable inlining for the wheel files so that they are served as static files
				// and their URLs to be passed to `micropip.install()`.
				// Currently disabling inlining is not supported in the library mode:
				// > If you specify build.lib, build.assetsInlineLimit will be ignored and assets will always be inlined, regardless of file size or being a Git LFS placeholder.
				// > https://vitejs.dev/config/build-options.html#build-assetsinlinelimit
				//
				// and there is an open issue about this: https://github.com/vitejs/vite/issues/4454.
				// So, we don't use the `import()` syntax for the wheel files to rely on Vite's static asset handling.
				// Instead, we copy the wheel files to the `dist` directory with the 'vite-plugin-static-copy' plugin here
				// and construct the URLs to them manually in `lite/index.ts`.
				//
				// Ref: This workaround is introduced in https://github.com/vitejs/vite/issues/4454#issuecomment-1588713917
				targets: [
					{
						src: resolve(
							__dirname,
							`../../dist/gradio-${version_raw}-py3-none-any.whl`
						),
						dest: 'wheels'
					},
					{
						src: resolve(
							__dirname,
							`../../client/python/dist/gradio_client-${client_version_raw}-py3-none-any.whl`
						),
						dest: 'wheels'
					}
				]
			}),
			is_lite && cssInjectedByJsPlugin({
				// This makes the binary files e.g. `*.woff2` embedded in chunked files separated from the generated entrypoint JS file.
				// Such binary files embedding makes the files large, so we want to chunk them to be loaded separately only when necessary.
				relativeCSSInjection: true,
			}),
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
	};
});

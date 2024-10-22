import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
// @ts-ignore
import custom_media from "postcss-custom-media";
import global_data from "@csstools/postcss-global-data";
// @ts-ignore
import prefixer from "postcss-prefix-selector";
import { readFileSync } from "fs";
import { resolve } from "path";

const version_path = resolve(__dirname, "../../gradio/package.json");
const theme_token_path = resolve(__dirname, "../theme/src/tokens.css");
const version_raw = JSON.parse(
	readFileSync(version_path, { encoding: "utf-8" })
).version.trim();
const version = version_raw.replace(/\./g, "-");

function convert_to_pypi_prerelease(version: string) {
	return version.replace(
		/(\d+\.\d+\.\d+)-([-a-z]+)\.(\d+)/,
		(match, v, tag, tag_version) => {
			if (tag === "beta") {
				return `${v}b${tag_version}`;
			} else if (tag === "alpha") {
				return `${v}a${tag_version}`;
			} else {
				return version;
			}
		}
	);
}

const python_version = convert_to_pypi_prerelease(version_raw);

const client_version_path = resolve(
	__dirname,
	"../../client/python/gradio_client/package.json"
);
const client_version_raw = JSON.parse(
	readFileSync(client_version_path, {
		encoding: "utf-8"
	})
).version.trim();

const client_python_version = convert_to_pypi_prerelease(client_version_raw);

import {
	inject_ejs,
	generate_cdn_entry,
	handle_ce_css,
	inject_component_loader,
	mock_modules
} from "@self/build";

const GRADIO_VERSION = version_raw || "asd_stub_asd";
const CDN_BASE = "https://gradio.s3-us-west-2.amazonaws.com";
const TEST_MODE = process.env.TEST_MODE || "happy-dom";

//@ts-ignore
export default defineConfig(({ mode }) => {
	const production = mode === "production";

	return {
		base: "./",

		server: {
			port: 9876,
			open: "/lite.html"
		},

		build: {
			sourcemap: true,
			target: "esnext",
			minify: production,
			outDir: resolve(__dirname, "../lite/dist"),
			// To build Gradio-lite as a library, we can't use the library mode
			// like `lib: is_lite && {}`
			// because it inevitably enables inlining of all the static file assets,
			// while we need to disable inlining for the wheel files to pass their URLs to `micropip.install()`.
			// So we build it as an app and only use the bundled JS and CSS files as library assets, ignoring the HTML file.
			// See also `lite.ts` about it.
			rollupOptions: {
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
								selector.indexOf("body") > -1 ||
								fileName.indexOf(".svelte") > -1
							) {
								return selector;
							} else if (
								// For the custom element <gradio-lite>. See theme/src/global.css for the details.
								/^gradio-lite(\:[^\:]+)?/.test(selector)
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
				inspector: false,
				compilerOptions: {
					dev: true,
					discloseVersion: false,
					accessors: true
				},
				hot: !process.env.VITEST && !production,
				preprocess: [
					vitePreprocess(),
					sveltePreprocess({
						postcss: {
							plugins: [
								global_data({ files: [theme_token_path] }),
								custom_media()
							]
						}
					})
				]
			}),

			inject_ejs(),
			generate_cdn_entry({ version: GRADIO_VERSION, cdn_base: CDN_BASE }),
			handle_ce_css(),
			inject_component_loader({ mode }),
			mode === "test" && mock_modules()
		],
		optimizeDeps: {
			exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@gradio/wasm"]
		},
		test: {
			setupFiles: [resolve(__dirname, "../../.config/setup_vite_tests.ts")],
			environment: TEST_MODE,
			include:
				TEST_MODE === "node"
					? ["**/*.node-test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
					: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			exclude: ["**/node_modules/**", "**/gradio/gradio/**"],
			globals: true,
			onConsoleLog(log, type) {
				if (log.includes("was created with unknown prop")) return false;
			}
		},

		resolve: {
			conditions: ["gradio"],
			alias: {
				// For the Wasm app to import the wheel file URLs.
				"gradio.whl": resolve(
					__dirname,
					`../../dist-lite/gradio-${python_version}-py3-none-any.whl`
				),
				"gradio_client.whl": resolve(
					__dirname,
					`../../client/python/dist/gradio_client-${client_python_version}-py3-none-any.whl`
				)
			}
		},
		assetsInclude: ["**/*.whl"] // To pass URLs of built wheel files to the Wasm worker.
	};
});

import { defineConfig } from "vite";
import type { Plugin } from "vite";
import {
	svelte as svelte_plugin,
	vitePreprocess
} from "@sveltejs/vite-plugin-svelte";
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
export default defineConfig(({ mode, isSsrBuild }) => {
	const production = mode === "production";

	return {
		base: "./",
		server: {
			port: 9876,
			open: "/"
		},
		build: {
			sourcemap: true,
			target: "esnext",
			minify: false,
			outDir: "../../gradio/templates/frontend"
		},
		define: {
			BROWSER_BUILD: JSON.stringify(true),
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
							}
							return prefixedSelector;
						}
					}),
					custom_media()
				]
			}
		},
		plugins: [
			handle_msw_imports(),
			svelte_plugin({
				inspector: false,
				compilerOptions: {
					dev: true,
					discloseVersion: false,
					accessors: true,
					experimental: {
						async: true
					}
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
			exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
		},
		resolve: {
			conditions:
				mode === "test"
					? ["gradio", "module", "node", "browser"]
					: ["gradio", "browser"]
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
		}
	};
});

import { createRequire } from "module";

const require = createRequire(import.meta.url);

function handle_msw_imports(): Plugin {
	return {
		name: "handle_msw_imports",
		enforce: "pre",
		resolveId(id, importer, options) {
			if (!process.env.VITEST) {
				return null;
			}

			if (id === "msw/node") {
				try {
					const mswPath = require.resolve("msw");
					const mswDir = mswPath.substring(0, mswPath.lastIndexOf("msw") + 3);
					return resolve(mswDir, "lib/node/index.mjs");
				} catch (e) {
					console.warn("Failed to resolve msw/node:", e);
					return null;
				}
			}
			return null;
		}
	};
}

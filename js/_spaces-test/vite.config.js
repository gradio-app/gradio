import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltekit } from "@sveltejs/kit/vite";
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

const client_version_path = resolve(
	__dirname,
	"../../client/python/gradio_client/package.json"
);
const client_version_raw = JSON.parse(
	readFileSync(client_version_path, {
		encoding: "utf-8"
	})
).version.trim();

import {
	inject_ejs,
	generate_cdn_entry,
	generate_dev_entry,
	handle_ce_css,
	inject_component_loader,
	resolve_svelte,
	mock_modules
} from "@self/build";

// const GRADIO_VERSION = version_raw || "asd_stub_asd";
// const CDN_BASE = "https://gradio.s3-us-west-2.amazonaws.com";

//@ts-ignore
export default defineConfig(({ mode, isSsrBuild }) => {
	const production = mode === "production";
	const development = mode === "development";
	return {
		// base: "./",
		server: {
			open: "/"
		},
		build: {
			sourcemap: true,
			target: "esnext",
			minify: production
			// outDir: "../../gradio/templates/frontend",
			// rollupOptions: {
			// 	external: ["./svelte/svelte.js"],
			// 	makeAbsoluteExternalsRelative: false
			// }
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
			// resolve_svelte(development),
			sveltekit(),
			// svelte({
			// 	inspector: false,
			// 	compilerOptions: {
			// 		dev: true,
			// 		discloseVersion: false,
			// 		accessors: true
			// 	},
			// 	hot: !process.env.VITEST && !production,
			// 	preprocess: [
			// 		vitePreprocess(),
			// 		sveltePreprocess({
			// 			postcss: {
			// 				plugins: [
			// 					global_data({ files: [theme_token_path] }),
			// 					custom_media()
			// 				]
			// 			}
			// 		})
			// 	]
			// }),
			resolve_svelte(true),
			// generate_dev_entry({
			// 	enable: !development && mode !== "test"
			// }),
			// inject_ejs(),
			// generate_cdn_entry({ version: GRADIO_VERSION, cdn_base: CDN_BASE }),
			// handle_ce_css(),
			inject_component_loader({ mode }),
			mode === "test" && mock_modules()
		],
		optimizeDeps: {
			exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@self/spa", "@self/core"]
		},
		resolve: {
			conditions: ["gradio"]
		}
	};
});

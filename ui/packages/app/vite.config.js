import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

import {
	inject_ejs,
	patch_dynamic_import,
	generate_cdn_entry,
	handle_ce_css
} from "./build_plugins";

// this is dupe config, gonna try fix this
import tailwind from "tailwindcss";
// @ts-ignore
import nested from "tailwindcss/nesting/index.js";

const GRADIO_VERSION = process.env.GRADIO_VERSION || "asd_stub_asd";
const TEST_CDN = !!process.env.TEST_CDN;
const CDN = TEST_CDN
	? "http://localhost:4321/"
	: `https://gradio.s3-us-west-2.amazonaws.com/${GRADIO_VERSION}/`;

//@ts-ignore
export default defineConfig(({ mode }) => {
	const CDN_URL = mode === "production:cdn" ? CDN : "/";
	const production =
		mode === "production:cdn" ||
		mode === "production:local" ||
		mode === "production:website";
	const is_cdn = mode === "production:cdn" || mode === "production:website";

	return {
		base: is_cdn ? CDN_URL : "./",

		build: {
			target: "esnext",
			minify: false,
			outDir: `../../../gradio/templates/${is_cdn ? "cdn" : "frontend"}`
		},
		define: {
			BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://localhost:7860/")
		},
		css: {
			postcss: {
				plugins: [nested, tailwind]
			}
		},
		plugins: [
			svelte({
				experimental: {
					inspector: true
				},
				compilerOptions: {
					dev: !production
				},
				hot: !process.env.VITEST && !production,
				preprocess: sveltePreprocess({
					postcss: { plugins: [tailwind, nested] }
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
			environment: "happy-dom",
			include: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
		}
	};
});

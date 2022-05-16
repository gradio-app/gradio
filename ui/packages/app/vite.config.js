import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

import path from "path";
import fs from "fs";

// this is dupe config, gonna try fix this
import tailwind from "tailwindcss";
import nested from "tailwindcss/nesting/index.js";

const GRADIO_VERSION = process.env.GRADIO_VERSION;
const CDN_URL = `https://gradio.s3-us-west-2.amazonaws.com/${GRADIO_VERSION}/`;

//@ts-ignore
export default defineConfig(({ mode }) => {
	const production = mode === "production:cdn" || mode === "production:local";
	const is_cdn = mode === "production:cdn";

	return {
		base: is_cdn ? CDN_URL : "./",

		build: {
			target: "esnext",
			minify: production,
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
				hot: !process.env.VITEST,
				preprocess: sveltePreprocess({
					postcss: { plugins: [tailwind, nested] }
				})
			}),
			{
				name: "inject-ejs",
				enforce: "post",
				transformIndexHtml: (html) => {
					return html.replace(
						/%gradio_config%/,
						`<script>window.gradio_config = {{ config | tojson }};</script>`
					);
				},

				writeBundle(config, bundle) {
					if (!is_cdn) return;

					const import_re = /import\(((?:'|")[\.\/a-zA-Z0-9]*(?:'|"))\)/g;
					const import_meta = `${"import"}.${"meta"}.${"url"}`;

					for (const file in bundle) {
						const chunk = bundle[file];
						if (chunk.type === "chunk") {
							if (chunk.code.indexOf("import(") > -1) {
								const fix_fn = `const VERSION_RE = new RegExp("${GRADIO_VERSION}\/", "g");function import_fix(mod, base) {const url =  new URL(mod, base); return import(\`${CDN_URL}\${url.pathname?.startsWith('/') ? url.pathname.substring(1).replace(VERSION_RE, "") : url.pathname.replace(VERSION_RE, "")}\`);}`;
								chunk.code =
									fix_fn +
									chunk.code.replace(
										import_re,
										`import_fix($1, ${import_meta})`
									);

								if (!config.dir) break;
								const output_location = path.join(config.dir, chunk.fileName);
								fs.writeFileSync(output_location, chunk.code);
							}
						}
					}
				}
			}
		],
		test: {
			environment: "happy-dom",
			include: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
		}
	};
});

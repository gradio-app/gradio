import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
// @ts-ignore
import custom_media from "postcss-custom-media";
import global_data from "@csstools/postcss-global-data";
// @ts-ignore
import prefixer from "postcss-prefix-selector";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

<<<<<<< HEAD:js/app/vite.config.js
const ROOT = join(__dirname, "..", "..");
const version_path = join(ROOT, "gradio", "version.txt");
const theme_token_path = join(__dirname, "..", "theme", "src", "tokens.css");
=======
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const version_path = join(__dirname, "..", "gradio", "version.txt");
const theme_token_path = join(
	__dirname,
	"..",
	"js",
	"theme",
	"src",
	"tokens.css"
);
>>>>>>> main:.config/basevite.config.ts

const version = readFileSync(version_path, { encoding: "utf-8" })
	.trim()
	.replace(/\./g, "-");

//@ts-ignore
export default defineConfig(({ mode }) => {
	const production =
		mode === "production:cdn" ||
		mode === "production:local" ||
		mode === "production:website";

	return {
		server: {
			port: 9876
		},

		build: {
			sourcemap: false,
			target: "esnext",
			minify: production
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
<<<<<<< HEAD:js/app/vite.config.js
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
			setupFiles: join(ROOT, ".config", "setup_vite_tests.ts"),
			environment: TEST_MODE,
			include:
				TEST_MODE === "node"
					? ["**/*.node-test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
					: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
		}
=======
			})
		]
>>>>>>> main:.config/basevite.config.ts
	};
});

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

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const version_path = join(__dirname, "..", "gradio", "package.json");
const theme_token_path = join(
	__dirname,
	"..",
	"js",
	"theme",
	"src",
	"tokens.css"
);

const version = JSON.parse(readFileSync(version_path, { encoding: "utf-8" }))
	.version.trim()
	.replace(/\./g, "-");

//@ts-ignore
export default defineConfig(({ mode }) => {
	const production = mode === "production";

	return {
		server: {
			port: 9876
		},
		resolve: {
			conditions: ["gradio"]
		},
		build: {
			sourcemap: false,
			target: "esnext",
			minify: production,
			rollupOptions: {
				external: ["virtual:component-loader"]
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
				inspector: false,
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
			})
		]
	};
});

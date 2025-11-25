import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

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

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const svelte = require("svelte/package.json");
const svelte_exports = Object.keys(svelte.exports)
	.filter((p) => p.endsWith(".json"))
	.map((entry) => entry.replace(/^\./, "svelte").split("/").join("_") + ".js");

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
				"^.*/theme\\.css": "http://localhost:7860",
				"^/static/.*": "http://localhost:7860",
				"^.*/svelte/.*": "http://localhost:7860"
			}
		},
		resolve: {
			conditions: ["gradio", "browser"]
		},
		ssr: {
			resolve: {
				conditions: ["gradio"]
			},
			noExternal: ["@gradio/*", "@huggingface/space-header"],
			external: mode === "development" ? [] : ["svelte", "svelte/*"]
		},

		build: {
			rollupOptions: {
				external: svelte_exports
			},
			minify: true,
			sourcemap: false
		},

		define: {
			// BROWSER_BUILD: JSON.stringify(isSsrBuild),
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
		optimizeDeps: {
			exclude: ["@gradio/*", "/svelte", "/svelte/*"]
		},
		plugins: [
			inject_svelte_init_code({ mode }),
			sveltekit(),

			inject_component_loader({ mode }),
			resolve_svelte(mode === "production"),
			handle_svelte_import({ development: mode === "development" })
		]
	};
});

function handle_svelte_import({
	development
}: {
	development: boolean;
}): Plugin {
	return {
		name: "handle_svelte_import",
		enforce: "pre",
		resolveId(id, importer, options) {
			if (development) {
				return null;
			}

			if (!options?.ssr) {
				if (id === "svelte") {
					return {
						id: "../../../svelte/svelte_svelte.js",
						external: true
					};
				}
				if (id.startsWith("svelte/")) {
					return {
						id: `../../../svelte/${id.split("/").join("_")}.js`,
						external: true
					};
				}
				return null;
			}
		}
	};
}

export const _svelte_exports = Object.keys(svelte.exports)

	.filter((entry) => {
		const _entry = Object.keys(svelte.exports[entry]).filter(
			(e) => e !== "types"
		);
		return (
			_entry.length !== 0 &&
			!entry.endsWith(".json") &&
			entry !== "./internal" &&
			entry !== "./compiler" &&
			entry !== "./internal/disclose-version"
		);
	})
	.map((entry) => "svelte" + entry.replace(/^\./, ""));
export const svelte_exports_transformed = Object.keys(svelte.exports).map(
	(entry) => entry.replace(/^\./, "svelte").split("/").join("_") + ".js"
);

export function inject_svelte_init_code({ mode }: { mode: string }): Plugin {
	const v_id = "virtual:load-svelte";
	const resolved_v_id = "\0" + v_id;

	return {
		name: "inject-component-loader",
		enforce: "pre",
		resolveId(id: string) {
			if (id === v_id) return resolved_v_id;
		},
		load(id: string) {
			if (id === resolved_v_id) {
				return make_init_code();
			}
		}
	};
}

function make_init_code(): string {
	const import_strings = _svelte_exports
		.map(
			(entry: string) =>
				`import * as ${entry
					.replace(/\.js$/, "")
					.replace(/-/g, "_")
					.replace(/\//g, "_")} from "${entry}";`
		)
		.join("\n");

	const import_mappings = _svelte_exports
		.map((entry: string) => {
			const var_name = entry.replace(/\//g, "_");
			return `o.${var_name} = {};
	for (const key in ${var_name}) {
		//@ts-ignore
		o.${var_name}[key] = ${var_name}[key];
	}`;
		})
		.join("\n");
	return `${import_strings}
	
const is_browser = typeof window !== "undefined";
if (is_browser) {
	const o = {};
	${import_mappings}

	window.__gradio__svelte__ = o;
	window.__gradio__svelte__["globals"] = {};
	window.globals = window;
}
`;
}

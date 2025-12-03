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
	generate_dev_entry,
	handle_ce_css,
	inject_component_loader,
	resolve_svelte,
	mock_modules
} from "@self/build";

const GRADIO_VERSION = version_raw || "asd_stub_asd";
const CDN_BASE = "https://gradio.s3-us-west-2.amazonaws.com";
const TEST_MODE = process.env.TEST_MODE || "happy-dom";

//@ts-ignore
export default defineConfig(({ mode, isSsrBuild }) => {
	const production = mode === "production";
	const development = mode === "development";

	return {
		base: "./",
		server: {
			port: 9876,
			open: "/"
		},
		build: {
			sourcemap: false,
			target: "esnext",
			minify: production,
			outDir: "../../gradio/templates/frontend",
			rollupOptions: {
				external: ["./svelte/svelte.js"],
				makeAbsoluteExternalsRelative: false
			}
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
			// generate_dev_entry({
			// 	enable: !development && mode !== "test"
			// }),
			inject_ejs(),
			generate_cdn_entry({ version: GRADIO_VERSION, cdn_base: CDN_BASE }),
			handle_ce_css(),
			inject_svelte_init_code({ mode }),

			inject_component_loader({ mode }),
			resolve_svelte(mode === "production"),
			handle_svelte_import({ development: mode === "development" }),
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
const svelte = require("svelte/package.json");
const svelte_exports = Object.keys(svelte.exports)
	.filter((p) => p.endsWith(".json"))
	.map((entry) => entry.replace(/^\./, "svelte").split("/").join("_") + ".js");

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

function handle_svelte_import({
	development
}: {
	development: boolean;
}): Plugin {
	return {
		name: "handle_svelte_import",
		enforce: "pre",
		resolveId(id, importer, options) {
			// In development or test mode, let vite handle svelte imports normally
			if (development || process.env.VITEST) {
				return null;
			}

			if (id === "svelte") {
				return {
					id: "./svelte/svelte_svelte.js",
					external: true
				};
			}
			if (id.startsWith("svelte/")) {
				return {
					id: `./svelte/${id.split("/").join("_")}.js`,
					external: true
				};
			}
			return null;
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
				const s = make_init_code();
				console.log("Svelte init code:", s);
				return s;
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

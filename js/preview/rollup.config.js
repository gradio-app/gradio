// @ts-nocheck
import { createRequire } from "node:module";
import { join, dirname } from "path";
import { cpSync, writeFileSync, rmSync, existsSync } from "fs";
import { fileURLToPath } from "url";

import ts from "@rollup/plugin-typescript";
import node from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const __dirname = dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);

const esbuild_binary_path = require.resolve("esbuild-wasm");
const vite_client = require.resolve("vite/dist/client/client.mjs");
const hmr = require.resolve("svelte-hmr");

const output_svelte_dir = "../../gradio/templates/frontend/assets/svelte";

const onwarn = (warning, warn) => {
	if (warning.plugin === "typescript") return;
	if (warning.code === "CIRCULAR_DEPENDENCY") return;
	if (warning.code === "EVAL") return;

	warn(warning);
};

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;

const dirname_def = `
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
`;

function inject_dirname() {
	return {
		name: "inject __dirname",

		transform(code, id) {
			if (id.includes("svelte-hmr/index.js")) {
				return `${dirname_def}\n${code}`;
			}
		}
	};
}

function resolve_imports() {
	return {
		name: "resolve-imports",
		resolveId(id) {
			const pkgs = [
				"sugarss",
				"stylus",
				"sass",
				"pug",
				"coffeescript",
				"lightningcss"
			];
			if (pkgs.includes(id)) {
				return join(__dirname, "src", "placeholder.ts");
			}
			if (id === "svelte/compiler") return "../compiler.js";
		},
		transform(code) {
			const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
				const identifier = $1.trim().startsWith("* as")
					? $1.replace("* as", "").trim()
					: $1.trim();
				return `const ${identifier.replace(
					" as ",
					": "
				)} = window.__gradio__svelte__internal;`;
			});
			return {
				code: new_code,
				map: null
			};
		}
	};
}

export function copy_files() {
	return {
		name: "copy_files",
		writeBundle() {
			cpSync(join(vite_client, ".."), "../../gradio/node/dist/client", {
				recursive: true
			});

			cpSync(join(hmr, "../runtime"), "../../gradio/node/dev/files/runtime", {
				recursive: true
			});
			cpSync(
				join(esbuild_binary_path, "..", "..", ".."),
				"../../gradio/node/dev/node_modules",
				{
					recursive: true
				}
			);

			cpSync("./src/examine.py", "../../gradio/node/examine.py");

			writeFileSync(
				"../../gradio/node/package.json",
				`{"type": "module", "version": "0.0.0"}`,
				{
					encoding: "utf-8"
				}
			);
		}
	};
}

const plugins = [node({ preferBuiltins: true }), json(), cjs(), ts()];

export default [
	{
		input: "src/index.ts",
		output: {
			dir: "../../gradio/node/dev/files",
			format: "esm",
			minifyInternalExports: false
		},
		onwarn,
		plugins: [
			{
				resolveId(id, importer) {
					if (id === "esbuild") {
						return "esbuild-wasm";
					}
				}
			},
			...plugins,
			{
				name: "clean_dir",
				buildStart() {
					if (existsSync("../../gradio/node")) {
						rmSync("../../gradio/node", { recursive: true });
					}
				}
			},
			resolve_imports(),
			inject_dirname(),
			copy_files()
		],
		external: ["fsevents", "esbuild-wasm", "../compiler.js"]
	},
	{
		input: "src/svelte-submodules.ts",
		output: {
			file: join(output_svelte_dir, "svelte-submodules.js"),
			format: "esm"
		},

		onwarn,
		plugins
	},

	{
		input: "src/svelte-internal.ts",
		output: {
			file: join(output_svelte_dir, "svelte.js"),
			format: "esm"
		},
		onwarn,
		plugins
	},

	{
		input: "src/compiler.ts",
		output: {
			file: "../../gradio/node/dev/compiler.js",
			format: "esm"
		},

		onwarn,
		plugins: [
			...plugins,
			json({
				include: ["**/node_modules/**", "node_modules/**"]
			}),
			{
				resolveId(id) {
					if (id === "css-tree") {
						return require.resolve(
							"./node_modules/css-tree/dist/csstree.esm.js"
						);
					}
				}
			}
		]
	}
];

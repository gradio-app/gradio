// @ts-nocheck

import ts from "@rollup/plugin-typescript";
import node from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import { cpSync, writeFileSync, rmdirSync, existsSync } from "fs";
import { join } from "path";
import json from "@rollup/plugin-json";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);

const esbuild_binary_path = require.resolve("esbuild-wasm");
console.log(esbuild_binary_path);
const vite_client = require.resolve("vite/dist/client/client.mjs");
const hmr = require.resolve("svelte-hmr");

const svelte_dir = "../../../templates/frontend/assets/svelte";
const output_svelte_dir = "../../gradio/templates/frontend/assets/svelte";

const onwarn = (warning, warn) => {
	if (warning.plugin === "typescript") return;
	warn(warning);
};

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;

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
					// console.log(id);
					if (id === "esbuild") {
						console.log(id, importer);
						return "esbuild-wasm";
					}
				}
			},
			ts(),
			node(),
			cjs(),
			{
				name: "clean_dir",
				buildStart() {
					if (existsSync("../../gradio/node")) {
						rmdirSync("../../gradio/node", { recursive: true });
					}
				}
			},
			json(),
			{
				name: "inject __dirname",
				resolveId(id, importer) {
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
					// if (id === "svelte") {
					// 	return join(svelte_dir, "svelte-internal.js");
					// }
					// if (id === "svelte/internal") {
					// 	return join(svelte_dir, "svelte-internal.js");
					// }

					// if (id === "svelte/internal/disclose-version") {
					// 	return join(svelte_dir, "svelte-disclose.js");
					// }
				},
				transform(code) {
					const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
						// console.log({ $1, $2, str });
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
				},

				transform(code, id) {
					if (id.includes("svelte-hmr/index.js")) {
						return `${dirname_def}\n${code}`;
					}
				}
			},
			{
				name: "copy_files",
				writeBundle() {
					cpSync(join(vite_client, ".."), "../../gradio/node/dist/client", {
						recursive: true
					});

					// cpSync(
					// 	join(__dirname, "node_modules", "svelte"),
					// 	"../../gradio/node/dev/node_modules/svelte",
					// 	{
					// 		recursive: true
					// 	}
					// );

					cpSync(
						join(hmr, "../runtime"),
						"../../gradio/node/dev/files/runtime",
						{
							recursive: true
						}
					);
					cpSync(
						join(esbuild_binary_path, "..", "..", ".."),
						"../../gradio/node/dev/node_modules",
						{
							recursive: true
						}
					);

					writeFileSync(
						"../../gradio/node/package.json",
						`{"type": "module", "version": "0.0.0"}`,
						{
							encoding: "utf-8"
						}
					);
				}
			}
		],
		external: ["fsevents", "esbuild-wasm", "../compiler.js"]
	},
	{
		input: "src/build-index.ts",
		output: {
			dir: "../../gradio/node/build/files",
			format: "esm",
			minifyInternalExports: false
		},
		onwarn,

		plugins: [
			{
				resolveId(id, importer) {
					// console.log(id);
					if (id === "esbuild") {
						console.log(id, importer);
						return "esbuild-wasm";
					}
				}
			},
			ts(),
			node(),
			cjs(),
			{
				name: "clean_dir",
				buildStart() {
					if (existsSync("../../gradio/node/build")) {
						rmdirSync("../../gradio/node/build", { recursive: true });
					}
				}
			},
			json(),
			{
				name: "inject __dirname",
				resolveId(id, importer) {
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
					// if (id === "svelte") {
					// 	return join(svelte_dir, "svelte-internal.js");
					// }
					// if (id === "svelte/internal") {
					// 	return join(svelte_dir, "svelte-internal.js");
					// }

					// if (id === "svelte/internal/disclose-version") {
					// 	return join(svelte_dir, "svelte-disclose.js");
					// }
				},
				transform(code) {
					const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
						// console.log({ $1, $2, str });
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
				},

				transform(code, id) {
					if (id.includes("svelte-hmr/index.js")) {
						return `${dirname_def}\n${code}`;
					}
				}
			},
			{
				name: "copy_files",
				writeBundle() {
					cpSync(join(vite_client, ".."), "../../gradio/node/dist/client", {
						recursive: true
					});

					// cpSync(
					// 	join(__dirname, "node_modules", "svelte"),
					// 	"../../gradio/node/dev/node_modules/svelte",
					// 	{
					// 		recursive: true
					// 	}
					// );

					cpSync(
						join(hmr, "../runtime"),
						"../../gradio/node/build/files/runtime",
						{
							recursive: true
						}
					);
					cpSync(
						join(esbuild_binary_path, "..", "..", ".."),
						"../../gradio/node/build/node_modules",
						{
							recursive: true
						}
					);

					writeFileSync(
						"../../gradio/node/package.json",
						`{"type": "module", "version": "0.0.0"}`,
						{
							encoding: "utf-8"
						}
					);
				}
			}
		],
		external: ["fsevents", "esbuild-wasm", "../compiler.js"]
	},
	// {
	// 	input: "src/svelte.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	external: ["./svelte-internal.js"],
	// 	plugins: [
	// 		node(),
	// 		json(),
	// 		cjs(),
	// 		ts(),
	// 		{
	// 			resolveId(id) {
	// 				// if (id === "svelte/internal/disclose-version") {
	// 				// 	return join(svelte_dir, "svelte-disclose.js");
	// 				// }

	// 				// if (id.startsWith("svelte/")) {
	// 				// 	return id.replace("svelte/", svelte_dir + "/svelte-") + ".js";
	// 				// }
	// 				// if (id === "svelte") {
	// 				// 	return "./svelte-internal.js";
	// 				// }

	// 				if (id === "svelte/internal") {
	// 					return "./svelte-internal.js";
	// 				}
	// 			}
	// 		}
	// 	]
	// },
	// {
	// 	input: "src/svelte-action.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-action.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	{
		input: "src/svelte-internal.ts",
		output: {
			file: join(output_svelte_dir, "svelte.js"),
			format: "esm"
		},
		onwarn,
		plugins: [node(), json(), cjs(), ts()]
	},
	// {
	// 	input: "src/svelte-animate.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-animate.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	// {
	// 	input: "src/svelte-motion.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-motion.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	// {
	// 	input: "src/svelte-store.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-store.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	// {
	// 	input: "src/svelte-transition.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-transition.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	// {
	// 	input: "src/svelte-disclose.ts",
	// 	output: {
	// 		file: join(output_svelte_dir, "svelte-disclose.js"),
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [node(), json(), cjs(), ts()]
	// },
	{
		input: "src/compiler.ts",
		output: [
			{
				file: "../../gradio/node/dev/compiler.js",
				format: "esm"
			},
			{
				file: "../../gradio/node/BUILD/compiler.js",
				format: "esm"
			}
		],
		onwarn,
		plugins: [
			node(),
			json({
				include: ["**/node_modules/**", "node_modules/**"]
			}),
			cjs(),
			ts(),
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
	// {
	// 	input: "src/compiler.ts",
	// 	output: {
	// 		file: "../../gradio/node/dev/files/compiler.js",
	// 		format: "esm"
	// 	},
	// 	onwarn,
	// 	plugins: [
	// 		node(),
	// 		json({
	// 			include: ["**/node_modules/**", "node_modules/**"]
	// 		}),
	// 		cjs(),
	// 		ts(),
	// 		{
	// 			resolveId(id) {
	// 				if (id === "css-tree") {
	// 					return require.resolve(
	// 						"./node_modules/css-tree/dist/csstree.esm.js"
	// 					);
	// 				}
	// 			}
	// 		}
	// 	]
	// }
];

import { createRequire } from "node:module";

const dirname_def = `
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
`;

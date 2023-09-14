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

const esbuild_binary_path = require.resolve("esbuild");
const vite_client = require.resolve("vite/dist/client/client.mjs");
const hmr = require.resolve("svelte-hmr");
console.log(__dirname);
export default [
	{
		input: "src/index.ts",
		output: {
			dir: "../../gradio/node/dev/files",
			format: "esm",
			minifyInternalExports: false
		},
		plugins: [
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
					if (id === "svelte") {
						return "../svelte-internal.js";
					}
					if (id === "svelte/internal") {
						return "../svelte-internal.js";
					}

					if (id === "svelte/internal/disclose-version") {
						return "../svelte-disclose.js";
					}
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

					cpSync(
						join(__dirname, "node_modules", "svelte"),
						"../../gradio/node/dev/node_modules/svelte",
						{
							recursive: true
						}
					);

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
		external: ["fsevents", "esbuild", "../compiler.js", "../svelte.js"]
	},
	{
		input: "src/svelte.ts",
		output: {
			file: "../../gradio/node/dev/svelte.js",
			format: "esm"
		},
		external: ["./svelte-internal.js"],
		plugins: [
			node(),
			json(),
			cjs(),
			ts(),
			{
				resolveId(id) {
					if (id === "svelte/internal/disclose-version") {
						return "./svelte-disclose.js";
					}

					if (id.startsWith("svelte/")) {
						return id.replace("svelte/", "./svelte-") + ".js";
					}
					if (id === "svelte") {
						return "./svelte-internal.js";
					}

					if (id === "svelte/internal/disclose-version") {
						return "./svelte-disclose.js";
					}
				}
			}
		]
	},
	{
		input: "src/svelte-action.ts",
		output: {
			file: "../../gradio/node/dev/svelte-action.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-internal.ts",
		output: {
			file: "../../gradio/node/dev/svelte-internal.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-animate.ts",
		output: {
			file: "../../gradio/node/dev/svelte-animate.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-motion.ts",
		output: {
			file: "../../gradio/node/dev/svelte-motion.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-store.ts",
		output: {
			file: "../../gradio/node/dev/svelte-store.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-transition.ts",
		output: {
			file: "../../gradio/node/dev/svelte-transition.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/svelte-disclose.ts",
		output: {
			file: "../../gradio/node/dev/svelte-disclose.js",
			format: "esm"
		},
		plugins: [node(), json(), cjs(), ts()]
	},
	{
		input: "src/compiler.ts",
		output: {
			file: "../../gradio/node/dev/compiler.js",
			format: "esm"
		},
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
	},
	{
		input: "src/compiler.ts",
		output: {
			file: "../../gradio/node/dev/files/compiler.js",
			format: "esm"
		},
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
];

import { createRequire } from "node:module";

const dirname_def = `
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
`;

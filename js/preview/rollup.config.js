// @ts-nocheck
import { createRequire } from "node:module";
import { join } from "node:path";
import { readFileSync } from "node:fs";

import ts from "@rollup/plugin-typescript";
import node from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const onwarn = (warning, warn) => {
	if (warning.plugin === "typescript") return;
	if (warning.code === "CIRCULAR_DEPENDENCY") return;
	if (warning.code === "EVAL") return;

	warn(warning);
};

const require = createRequire(import.meta.url);
const dir = require.resolve("./package.json");
const svelte_path = find_pkg_json(require.resolve("svelte"));
console.log("Svelte path:", svelte_path);

const svelte_pkg = JSON.parse(readFileSync(svelte_path, "utf-8"));
if (!svelte_pkg) {
	throw new Error("Could not find svelte package.json");
}

console.log("Svelte exports:", svelte_pkg.exports);

const _exports = Object.keys(svelte_pkg.exports)
	.filter((entry) => {
		const _entry = Object.keys(svelte_pkg.exports[entry]).filter(
			(e) => e !== "types"
		);
		return _entry.length !== 0;
	})
	.map((key) => `svelte${key.replace(/^\./, "")}`);

console.log("Svelte exports:", _exports);
const output_svelte_dir = join(
	dir,
	"..",
	"..",
	"..",
	"gradio",
	"templates",
	"frontend",
	"assets",
	"svelte"
);

const plugins = [
	node({ preferBuiltins: true, browser: true }),
	json(),
	cjs(),
	ts()
	// terser()
];

function make_config(input_file, output_file) {
	return {
		input: input_file,
		output: {
			file: join(output_svelte_dir, output_file),
			format: "esm"
		},
		onwarn,
		plugins
	};
}
// export default _exports.map((name) => {
// 	const input_file = name;
// 	const output_file = `${name.split("/").join("_")}.js`;
// 	return make_config(input_file, output_file);
// });

export default {
	input: _exports,
	output: {
		dir: output_svelte_dir,
		entryFileNames: (chunk) => {
			const { facadeModuleId: path } = chunk;
			path.split("node_modules/svelte/")[1];
			const export_path = path
				.split("node_modules/svelte/")[1]
				.replace(/\?.*$/, "");
			let name = find_in_exports(svelte_pkg.exports, export_path);
			console.log("Export path:", export_path, "Name:", name);
			if (name === ".") name = "svelte";
			if (name) {
				return (
					"svelte_" + name.replace(/^\.\//, "").replace(/\//g, "_") + ".js"
				);
			}
			return "[name].js";
		},
		format: "esm"
	},
	onwarn,
	plugins
};

function find_pkg_json(path) {
	const pkg_json = join(path, "package.json");
	try {
		require.resolve(pkg_json);
		return pkg_json;
	} catch (e) {
		const parent = join(path, "..");
		if (parent === path) return null; // reached the root
		return find_pkg_json(parent);
	}
}

function find_in_exports(_exports, target) {
	for (const key in _exports) {
		if (typeof _exports[key] === "string" && _exports[key].endsWith(target)) {
			return key;
		} else if (typeof _exports[key] === "object") {
			for (const subkey in _exports[key]) {
				if (_exports[key][subkey].endsWith(target)) {
					return key;
				}
			}
		}
	}
	return null;
}

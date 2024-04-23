// @ts-nocheck
import { createRequire } from "node:module";
import { join } from "path";

import ts from "@rollup/plugin-typescript";
import node from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const output_svelte_dir = "../../gradio/templates/frontend/assets/svelte";

const onwarn = (warning, warn) => {
	if (warning.plugin === "typescript") return;
	if (warning.code === "CIRCULAR_DEPENDENCY") return;
	if (warning.code === "EVAL") return;

	warn(warning);
};

const plugins = [node({ preferBuiltins: true }), json(), cjs(), ts()];

export default [
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
	}
];

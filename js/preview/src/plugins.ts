import type { Plugin, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "sucrase";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";
import { createLogger } from "vite";
import { join } from "path";

const svelte_codes_to_ignore: Record<string, string> = {
	"reactive-component": "Icon"
};

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;
const RE_BARE_SVELTE_IMPORT = /import ("|')svelte(\/\w+)*("|')(;)*/g;
export const plugins: PluginOption[] = [
	viteCommonjs() as Plugin,
	svelte({
		onwarn(warning, handler) {
			if (
				svelte_codes_to_ignore.hasOwnProperty(warning.code) &&
				svelte_codes_to_ignore[warning.code] &&
				warning.message.includes(svelte_codes_to_ignore[warning.code])
			) {
				return;
			}
			handler!(warning);
		},
		prebundleSvelteLibraries: false,
		hot: true,
		compilerOptions: {
			discloseVersion: false
		},
		preprocess: [
			{
				script: ({ attributes, filename, content }) => {
					if (attributes.lang === "ts") {
						const compiledCode = transform(content, {
							transforms: ["typescript"],
							keepUnusedImports: true
						});
						return {
							code: compiledCode.code,
							map: compiledCode.sourceMap
						};
					}
				}
			}
		]
	}) as unknown as Plugin,
	sucrase({
		transforms: ["typescript"],
		include: ["**/*.ts", "**/*.tsx"]
	}) as unknown as Plugin
];

interface GradioPluginOptions {
	mode: "dev" | "build";
	svelte_dir: string;
	backend_port?: number;
	imports?: string;
}

export function make_gradio_plugin({
	mode,
	svelte_dir,
	backend_port,
	imports
}: GradioPluginOptions): Plugin {
	return {
		name: "gradio",
		enforce: "pre",
		transform(code) {
			const new_code = code
				.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
					const identifier = $1.trim().startsWith("* as")
						? $1.replace("* as", "").trim()
						: $1.trim();
					return `const ${identifier.replace(
						" as ",
						": "
					)} = window.__gradio__svelte__internal;`;
				})
				.replace(RE_BARE_SVELTE_IMPORT, "");
			return {
				code: new_code,
				map: null
			};
		},
		resolveId(id) {
			if (
				id !== "svelte" &&
				id !== "svelte/internal" &&
				id.startsWith("svelte/")
			) {
				return join(svelte_dir, "svelte-submodules.js");
			}
		},
		transformIndexHtml(html) {
			return mode === "dev"
				? [
						{
							tag: "script",
							children: `window.__GRADIO_DEV__ = "dev";
        window.__GRADIO__SERVER_PORT__ = ${backend_port};
        window.__GRADIO__CC__ = ${imports};`
						}
				  ]
				: undefined;
		}
	};
}

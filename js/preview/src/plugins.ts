import type { Plugin, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import { join } from "path";
import { type ComponentConfig } from "./dev";
import type { Preprocessor, PreprocessorGroup } from "svelte/compiler";

const svelte_codes_to_ignore: Record<string, string> = {
	"reactive-component": "Icon"
};

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;
const RE_BARE_SVELTE_IMPORT = /import ("|')svelte(\/\w+)*("|')(;)*/g;
export function plugins(config: ComponentConfig): PluginOption[] {
	const _additional_plugins = config.plugins || [];
	const _additional_svelte_preprocess = config.svelte?.preprocess || [];
	const _svelte_extensions = (config.svelte?.extensions || [".svelte"]).map(
		(ext) => {
			if (ext.trim().startsWith(".")) {
				return ext;
			}
			return `.${ext.trim()}`;
		}
	);

	if (!_svelte_extensions.includes(".svelte")) {
		_svelte_extensions.push(".svelte");
	}

	return [
		svelte({
			inspector: false,
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
				discloseVersion: false,
				hydratable: true
			},
			extensions: _svelte_extensions,
			preprocess: [
				preprocess({
					typescript: {
						compilerOptions: {
							declaration: false,
							declarationMap: false
						}
					}
				}),
				...(_additional_svelte_preprocess as PreprocessorGroup[])
			]
		}),
		..._additional_plugins
	];
}

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
	const v_id = "virtual:component-loader";
	const resolved_v_id = "\0" + v_id;
	return {
		name: "gradio",
		enforce: "pre",
		transform(code) {
			const new_code = code
				.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
					if ($1.trim().startsWith("type")) return str;
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
			if (id === v_id) {
				return resolved_v_id;
			}
			if (
				id !== "svelte" &&
				id !== "svelte/internal" &&
				id.startsWith("svelte/")
			) {
				return join(svelte_dir, "svelte-submodules.js");
			}
		},
		load(id) {
			if (id === resolved_v_id) {
				return `export default {};`;
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

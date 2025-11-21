import type { Plugin, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import { join } from "path";
import { type ComponentConfig } from "./dev";
import type { Preprocessor, PreprocessorGroup } from "svelte/compiler";
import { deepmerge } from "./_deepmerge_internal";

const svelte_codes_to_ignore: Record<string, string> = {
	"reactive-component": "Icon"
};

const RE_SVELTE_IMPORT =
	/import\s+(?:([ -~]*)\s+from\s+){0,1}['"](svelte(?:\/[ -~]+){0,3})['"]/g;
const RE_TYPE_IMPORT = /type \w+\b/;

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
			compilerOptions: {
				discloseVersion: false,
				hmr: true
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
	let types: { types: string[]; path: string }[] = [];
	return {
		name: "gradio",
		enforce: "post",
		transform(code) {
			const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
				let ident = $1;

				if (!ident || ident.trim() === "") return "";
				if (ident.trim().startsWith("type")) {
					types.push({
						types: ident.trim().replace(/^type/, "").trim(),
						path: $2
					});
					return str;
				}

				if (RE_TYPE_IMPORT.test(ident)) {
					ident = remove_types(ident);
					types.push({ types: extract_types(ident), path: $2 });
				}

				const path = $2.split("/").join("_");
				const identifier = ident.trim().startsWith("* as")
					? ident.replace("* as", "").trim()
					: ident.trim();
				return `const ${identifier.replace(
					" as ",
					": "
				)} = window.__gradio__svelte__.${path};`;
			});

			return {
				code: new_code,
				map: null
			};
		},
		resolveId(id) {
			if (id === v_id) {
				return resolved_v_id;
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

export const deepmerge_plugin: Plugin = {
	name: "deepmerge",
	enforce: "pre",
	resolveId(id) {
		if (id === "deepmerge") {
			return "deepmerge_internal";
		}
	},
	load(id) {
		if (id === "deepmerge_internal") {
			return deepmerge;
		}
	}
};

function extract_types(str: string): string[] {
	const regex = /type (\w+\b)/g;
	let m;
	const out = [];
	while ((m = regex.exec(str))) out.push(m[1]);

	return out;
}

function remove_types(input: string): string {
	const inner = input.slice(1, -1); // remove { }
	const parts = inner
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s && !/^type\s+\w+\b$/.test(s));

	return `{ ${parts.join(", ")} }`;
}

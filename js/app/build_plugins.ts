import type { Plugin } from "vite";
import { parse, HTMLElement } from "node-html-parser";

import { join } from "path";
import { writeFileSync } from "fs";

export function inject_ejs(): Plugin {
	return {
		name: "inject-ejs",
		enforce: "post",
		transformIndexHtml: (html) => {
			return html.replace(
				/%gradio_config%/,
				`<script>window.gradio_config = {{ config | toorjson }};</script>`
			);
		}
	};
}

export function generate_cdn_entry({
	version,
	cdn_base
}: {
	version: string;
	cdn_base: string;
}): Plugin {
	return {
		name: "generate-cdn-entry",
		enforce: "post",
		writeBundle(config, bundle) {
			if (
				!config.dir ||
				!bundle["index.html"] ||
				bundle["index.html"].type !== "asset"
			)
				return;

			const source = bundle["index.html"].source as string;
			const tree = parse(source);

			const script = Array.from(
				tree.querySelectorAll("script[type=module]")
			).find((node) => node.attributes.src?.includes("assets"));

			const output_location = join(config.dir, "gradio.js");

			writeFileSync(output_location, make_entry(script?.attributes.src || ""));

			if (!script) return;

			const transformed_html =
				(bundle["index.html"].source as string).substring(0, script?.range[0]) +
				`<script type="module" crossorigin src="${cdn_base}/${version}/gradio.js"></script>` +
				(bundle["index.html"].source as string).substring(
					script?.range[1],
					source.length
				);

			const share_html_location = join(config.dir, "share.html");
			writeFileSync(share_html_location, transformed_html);
		}
	};
}

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;

export function generate_dev_entry({ enable }: { enable: boolean }): Plugin {
	return {
		name: "generate-dev-entry",
		transform(code, id) {
			if (!enable) return;

			const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
				return `const ${$1.replace(
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

function make_entry(script: string): string {
	return `import("${script}");
`;
}

export function handle_ce_css(): Plugin {
	return {
		enforce: "post",
		name: "custom-element-css",

		writeBundle(config, bundle) {
			let file_to_insert = {
				filename: "",
				source: ""
			};

			if (
				!config.dir ||
				!bundle["index.html"] ||
				bundle["index.html"].type !== "asset"
			)
				return;

			for (const key in bundle) {
				const chunk = bundle[key];
				if (chunk.type === "chunk") {
					const _chunk = chunk;

					const found = _chunk.code?.indexOf("ENTRY_CSS");

					if (found > -1)
						file_to_insert = {
							filename: join(config.dir, key),
							source: _chunk.code
						};
				}
			}

			const tree = parse(bundle["index.html"].source as string);

			const { style, fonts } = Array.from(
				tree.querySelectorAll("link[rel=stylesheet]")
			).reduce(
				(acc, next) => {
					if (/.*\/index(.*?)\.css/.test(next.attributes.href)) {
						return { ...acc, style: next };
					}
					return { ...acc, fonts: [...acc.fonts, next.attributes.href] };
				},
				{ fonts: [], style: undefined } as {
					fonts: string[];
					style: HTMLElement | undefined;
				}
			);

			writeFileSync(
				file_to_insert.filename,
				file_to_insert.source
					.replace("__ENTRY_CSS__", style!.attributes.href)
					.replace(
						'"__FONTS_CSS__"',
						`[${fonts.map((f) => `"${f}"`).join(",")}]`
					)
			);

			const share_html_location = join(config.dir, "share.html");
			const share_html = readFileSync(share_html_location, "utf8");
			const share_tree = parse(share_html);
			const node = Array.from(
				share_tree.querySelectorAll("link[rel=stylesheet]")
			).find((node) => /.*\/index(.*?)\.css/.test(node.attributes.href));

			if (!node) return;
			const transformed_html =
				share_html.substring(0, node.range[0]) +
				share_html.substring(node.range[1], share_html.length);

			writeFileSync(share_html_location, transformed_html);
		}
	};
}

// generate component importsy

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import { readdirSync, existsSync, readFileSync, statSync } from "fs";

function get_export_path(
	path: string,
	root: string,
	pkg_json: Record<string, any>
): string | undefined {
	if (!pkg_json.exports) return undefined;
	const _path = join(root, "..", `${pkg_json.exports[`${path}`]}`);

	return existsSync(_path) ? _path : undefined;
}

const ignore_list = [
	"tootils",
	"_cdn-test",
	"_spaces-test",
	"_website",
	"app",
	"atoms",
	"fallback",
	"icons",
	"lite",
	"preview",
	"simpledropdown",
	"simpletextbox",
	"storybook",
	"theme",
	"timeseries",
	"tooltip",
	"upload",
	"utils",
	"wasm"
];
function generate_component_imports(): string {
	const exports = readdirSync(join(__dirname, ".."))
		.map((dir) => {
			if (ignore_list.includes(dir)) return undefined;
			if (!statSync(join(__dirname, "..", dir)).isDirectory()) return undefined;

			const package_json_path = join(__dirname, "..", dir, "package.json");
			if (existsSync(package_json_path)) {
				const package_json = JSON.parse(
					readFileSync(package_json_path, "utf8")
				);

				const component = get_export_path(".", package_json_path, package_json);
				const example = get_export_path(
					"./example",
					package_json_path,
					package_json
				);

				if (!component && !example) return undefined;

				return {
					name: package_json.name,
					component,
					example
				};
			}
			return undefined;
		})
		.filter((x) => x !== undefined);

	const imports = exports.reduce((acc, _export) => {
		if (!_export) return acc;

		const example = _export.example
			? `example: () => import("${_export.name}/example"),\n`
			: "";
		return `${acc}"${_export.name.replace("@gradio/", "")}": {
			${example}
			component: () => import("${_export.name}")
			},\n`;
	}, "");

	return imports;
}

function load_virtual_component_loader(): string {
	const loader_path = join(__dirname, "component_loader.js");
	const component_map = `
const component_map = {
	${generate_component_imports()}
};
`;
	return `${component_map}\n\n${readFileSync(loader_path, "utf8")}`;
}

export function inject_component_loader(): Plugin {
	const v_id = "virtual:component-loader";
	const resolved_v_id = "\0" + v_id;

	return {
		name: "inject-component-loader",
		enforce: "pre",
		resolveId(id: string) {
			if (id === v_id) return resolved_v_id;
		},
		load(id: string) {
			if (id === resolved_v_id) {
				return load_virtual_component_loader();
			}
		}
	};
}

export function resolve_svelte(enable: boolean): Plugin {
	return {
		enforce: "pre",
		name: "resolve-svelte",
		async resolveId(id: string) {
			if (!enable) return;

			if (
				id === "./svelte/svelte.js" ||
				id === "svelte" ||
				id === "svelte/internal"
			) {
				const mod = join(
					__dirname,
					"..",
					"..",
					"gradio",
					"templates",
					"frontend",
					"assets",
					"svelte",
					"svelte.js"
				);
				return { id: mod, external: "absolute" };
			}
		}
	};
}

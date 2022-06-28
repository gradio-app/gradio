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
				`<script>window.gradio_config = {{ config | tojson }};</script>`
			);
		}
	};
}

interface PatchDynamicImportOptionms {
	mode: "cdn" | "local";
	gradio_version: string;
	cdn_url: string;
}

export function patch_dynamic_import({
	mode,
	gradio_version,
	cdn_url
}: PatchDynamicImportOptionms): Plugin {
	return {
		name: "patch-dynamic-import",
		enforce: "post",
		writeBundle(config, bundle) {
			if (mode !== "cdn") return;

			const import_re = /import\(((?:'|")[\.\/a-zA-Z0-9]*(?:'|"))\)/g;
			const import_meta = `${"import"}.${"meta"}.${"url"}`;

			for (const file in bundle) {
				const chunk = bundle[file];
				if (chunk.type === "chunk") {
					if (chunk.code.indexOf("import(") > -1) {
						const fix_fn = `const VERSION_RE = new RegExp("${gradio_version}\/", "g");function import_fix(mod, base) {const url =  new URL(mod, base); return import(\`${cdn_url}\${url.pathname?.startsWith('/') ? url.pathname.substring(1).replace(VERSION_RE, "") : url.pathname.replace(VERSION_RE, "")}\`);}`;
						chunk.code =
							fix_fn +
							chunk.code.replace(import_re, `import_fix($1, ${import_meta})`);

						if (!config.dir) break;
						const output_location = join(config.dir, chunk.fileName);
						writeFileSync(output_location, chunk.code);
					}
				}
			}
		}
	};
}

export function generate_cdn_entry({
	enable,
	cdn_url
}: {
	enable: boolean;
	cdn_url: string;
}): Plugin {
	return {
		name: "generate-cdn-entry",
		enforce: "post",
		writeBundle(config, bundle) {
			if (!enable) return;

			if (
				!config.dir ||
				!bundle["index.html"] ||
				bundle["index.html"].type !== "asset"
			)
				return;

			const tree = parse(bundle["index.html"].source as string);
			const script =
				Array.from(tree.querySelectorAll("script[type=module]")).find((node) =>
					node.attributes.src?.startsWith(cdn_url)
				)?.attributes.src || "";

			const output_location = join(config.dir, "gradio.js");

			writeFileSync(output_location, make_entry(script));
		}
	};
}

function make_entry(script: string) {
	const make_script = `
function make_script(src) {
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute("crossorigin", "");
    script.src = src;
    document.head.appendChild(script);
}`;

	return `
${make_script}
make_script("${script}");
`;
}

export function handle_ce_css(): Plugin {
	return {
		enforce: "post",
		name: "custome-element-css",
		transform(code, id) {
			if (id === "vite/preload-helper") {
				return {
					code: code.replace(
						"document.head.appendChild(link);",
						"window.scoped_css_attach(link)"
					)
				};
			}
		},

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
					} else {
						return { ...acc, fonts: [...acc.fonts, next.attributes.href] };
					}
				},
				{ fonts: [], style: undefined } as {
					fonts: string[];
					style: HTMLElement | undefined;
				}
			);

			const transformed_html =
				(bundle["index.html"].source as string).substring(0, style!.range[0]) +
				(bundle["index.html"].source as string).substring(
					style!.range[1],
					bundle["index.html"].source.length
				);
			const html_location = join(config.dir, "index.html");

			writeFileSync(
				file_to_insert.filename,
				file_to_insert.source
					.replace("__ENTRY_CSS__", style!.attributes.href)
					.replace(
						'"__FONTS_CSS__"',
						`[${fonts.map((f) => `"${f}"`).join(",")}]`
					)
			);

			writeFileSync(html_location, transformed_html);
		}
	};
}

import type { Plugin } from "vite";
import { parse } from "node-html-parser";

import path from "path";
import fs from "fs";

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
						const output_location = path.join(config.dir, chunk.fileName);
						fs.writeFileSync(output_location, chunk.code);
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
			const styles =
				Array.from(tree.querySelectorAll("link[rel=stylesheet]")).find((node) =>
					node.attributes.href?.startsWith(cdn_url)
				)?.attributes.href || "";

			const output_location = path.join(config.dir, "gradio.js");

			fs.writeFileSync(output_location, make_entry(script, styles));
		}
	};
}

function make_entry(script: string, style: string) {
	const make_style = `
function make_style(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}`;

	const make_script = `
function make_script(src) {
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute("crossorigin", "");
    script.src = src;
    document.head.appendChild(script);
}`;

	return `
${make_style}
${make_script}
make_script("${script}");
make_style("${style}");
`;
}

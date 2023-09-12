import { fileURLToPath } from "url";
import { createServer, build } from "vite";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "sucrase";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import { read } from "vega";
// import { typescript } from "svelte-preprocess";

interface ServerOptions {
	component_dir: string;
	root_dir: string;
	frontend_port: number;
	backend_port: number;
}

export async function create_server({
	component_dir,
	root_dir,
	frontend_port,
	backend_port
}: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const imports = generate_imports(component_dir);
	console.log(imports);

	const NODE_DIR = join(root_dir, "..", "..", "node", "dev");
	const server = await createServer({
		// any valid user config options, plus `mode` and `configFile`
		mode: "development",
		configFile: false,
		root: root_dir,
		build: {
			rollupOptions: {
				external: [
					"../../../node/dev/svelte.js",
					"../../../node/dev/svelte-internal.js",
					"../../../../../../gradio/node/dev/svelte-internal.js",
					"../../../../../../gradio/node/dev/svelte.js"
				]
			}
		},
		optimizeDeps: {
			disabled: true
		},
		server: {
			port: frontend_port,
			fs: {
				allow: [root_dir, NODE_DIR, component_dir]
			}
		},
		plugins: [
			viteCommonjs(),
			svelte({
				prebundleSvelteLibraries: false,
				hot: true,
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
			}),

			{
				name: "gradio",
				enforce: "pre",
				resolveId(importee, importer) {
					if (importee === "svelte") {
						return join(NODE_DIR, "svelte-internal.js");
					}

					if (importee === "svelte/internal") {
						return join(NODE_DIR, "svelte-internal.js");
					}

					if (importee === "svelte/action") {
						return join(NODE_DIR, "svelte-action.js");
					}
				},
				transform(code) {
					if (code.includes("__ROOT_PATH__")) {
						return code.replace(`"__ROOT_PATH__"`, imports);
					}

					if (code.includes("__GRADIO__SERVER_PORT__")) {
						return code.replace(
							`"__GRADIO__SERVER_PORT__"`,
							backend_port.toString()
						);
					}
				}
			}
		]
	});

	await server.listen();

	console.log(`[orange3]Frontend Server[/] (Go here): ${server.resolvedUrls?.local}`);
}

import * as fs from "fs";
import * as path from "path";

function find_frontend_folders(
	start_path: string
): { dir: string; package_name: string }[] {
	if (!fs.existsSync(start_path)) {
		console.log("No directory found at:", start_path);
		return [];
	}

	const results: { dir: string; package_name: string }[] = [];
	const queue: string[] = [start_path];

	while (queue.length > 0) {
		const current_path = queue.shift()!;
		const files = fs.readdirSync(current_path);

		let found_in_current_level = false;

		for (let i = 0; i < files.length; i++) {
			const filename = path.join(current_path, files[i]);
			const stat = fs.lstatSync(filename);

			if (stat.isDirectory() && files[i] === "frontend") {
				const package_json_path = path.join(filename, "package.json");
				if (fs.existsSync(package_json_path)) {
					const package_json = JSON.parse(
						fs.readFileSync(package_json_path, "utf8")
					);
					results.push({
						dir: filename,
						package_name: package_json.name || "Unknown"
					});
					found_in_current_level = true;
				}
			} else if (stat.isDirectory()) {
				queue.push(filename);
			}
		}

		if (found_in_current_level) {
			break;
		}
	}

	return results;
}

function generate_imports(component_dir: string): string {
	const components = find_frontend_folders(component_dir);

	const imports = components.reduce((acc, component) => {
		const x = {
			interactive: join(component.dir, "interactive"),
			static: join(component.dir, "static")
		};
		return `${acc}"${component.package_name}": {
			interactive: () => import("${x.interactive}"),
			static: () => import("${x.static}")
			},\n`;
	}, "");

	return `{${imports}}`;
}

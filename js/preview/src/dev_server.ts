import { fileURLToPath } from "url";
import { createServer, build, createLogger } from "vite";
import { join } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "sucrase";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";

const vite_messages_to_ignore = [
	"Default and named imports from CSS files are deprecated."
];
const svelte_codes_to_ignore: Record<string, string> = {
	"reactive-component": "Icon"
};

const logger = createLogger();
const originalWarning = logger.warn;
logger.warn = (msg, options) => {
	if (vite_messages_to_ignore.some((m) => msg.includes(m))) return;

	originalWarning(msg, options);
};

interface ServerOptions {
	component_dir: string;
	root_dir: string;
	frontend_port: number;
	backend_port: number;
	host: string;
}

export async function create_server({
	component_dir,
	root_dir,
	frontend_port,
	backend_port,
	host
}: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const imports = generate_imports(component_dir);

	const NODE_DIR = join(root_dir, "..", "..", "node", "dev");
	try {
		const server = await createServer({
			// any valid user config options, plus `mode` and `configFile`
			esbuild: false,
			customLogger: logger,
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
				host: host,
				fs: {
					allow: [root_dir, NODE_DIR, component_dir]
				}
			},
			plugins: [
				//@ts-ignore
				viteCommonjs(),
				{
					name: "gradio",
					enforce: "pre",
					resolveId(importee, importer) {
						if (importee === "svelte/internal/disclose-version") {
							return join(NODE_DIR, "svelte-action.js");
						}

						if (importee.startsWith("svelte/")) {
							return join(
								NODE_DIR,
								importee.replace("svelte/", "svelte-") + ".js"
							);
						}
						if (importee === "svelte") {
							return join(NODE_DIR, "svelte-internal.js");
						}
					},
					transform(code) {
						if (code.includes("__ROOT_PATH__")) {
							return code.replace(`"__ROOT_PATH__"`, imports);
						}
					},
					transformIndexHtml(html) {
						return html.replace(
							`window.__GRADIO_DEV__ = "dev"`,
							`window.__GRADIO_DEV__ = "dev";
							window.__GRADIO__SERVER_PORT__ = ${backend_port};`
						);
					}
				},
				sucrase({
					transforms: ["typescript"],
					include: ["**/*.ts", "**/*.tsx"]
				}),
				//@ts-ignore
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
				})
			]
		});

		await server.listen();
		console.info(
			`[orange3]Frontend Server[/] (Go here): ${host == 'localhost' ? server.resolvedUrls?.local : server.resolvedUrls?.network}`
		);
	} catch (e) {
		console.error(e);
	}
}

import * as fs from "fs";
import * as path from "path";

function find_frontend_folders(
	start_path: string
): { dir: string; package_name: string }[] {
	if (!fs.existsSync(start_path)) {
		console.warn("No directory found at:", start_path);
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

function to_posix(_path: string): string {
	const isExtendedLengthPath = /^\\\\\?\\/.test(_path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(_path); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return _path;
	}

	return _path.replace(/\\/g, '/');
}

function generate_imports(component_dir: string): string {
	const components = find_frontend_folders(component_dir);

	const imports = components.reduce((acc, component) => {
		const x = {
			interactive: to_posix(join(component.dir, "interactive")),
			static: to_posix(join(component.dir, "static")),
			example: to_posix(join(component.dir, "example"))
		};

		const interactive = fs.existsSync(x.interactive) ? `interactive: () => import("${x.interactive}"),\n` : ""
		const example = fs.existsSync(x.example) ? `example: () => import("${x.example}"),\n` : ""
		return `${acc}"${component.package_name}": {
			${interactive}
			${example}
			static: () => import("${x.static}")
			},\n`;
	}, "");

	return `{${imports}}`;
}

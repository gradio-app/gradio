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
	// root_dir: string;
}

const RE_SVELTE_IMPORT =
	/import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;

export async function make_build({
	component_dir // backend_port
} // root_dir // frontend_port,
: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const imports = generate_imports(component_dir);

	// const NODE_DIR = join(root_dir, "..", "..", "node", "dev");
	// console.log({ root_dir });
	// const SVELTE_DIR = join(root_dir, "assets", "svelte");

	try {
		const config = {
			// any valid user config options, plus `mode` and `configFile`
			root: component_dir,

			plugins: [
				//@ts-ignore
				viteCommonjs(),
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
				}),
				{
					name: "gradio",
					enforce: "pre",
					transform(code) {
						const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
							// console.log({ $1, $2, str });
							const identifier = $1.trim().startsWith("* as")
								? $1.replace("* as", "").trim()
								: $1.trim();
							return `const ${identifier.replace(
								" as ",
								": "
							)} = window.__gradio__svelte__internal;`;
						});
						return {
							code: new_code,
							map: null
						};
					}

					// transformIndexHtml(html) {
					// 	return [
					// 		{
					// 			tag: "script",
					// 			children: `window.__GRADIO_DEV__ = "dev";
					// 		window.__GRADIO__SERVER_PORT__ = ${backend_port};
					// 		window.__GRADIO__CC__ = ${imports};`
					// 		}
					// 	];
					// }
				},
				sucrase({
					transforms: ["typescript"],
					include: ["**/*.ts", "**/*.tsx"]
				})
			]
		};

		await build({
			root: path.resolve(component_dir, "frontend", "interactive", "index.ts"),
			plugins: [],

			build: {
				outDir: path.resolve(component_dir, "interactive"),
				rollupOptions: {
					input: path.resolve(
						component_dir,
						"frontend",
						"interactive",
						"index.ts"
					),
					output: {
						dir: path.resolve(component_dir, "backend", "newnewtext", "build"),
						entryFileNames: "[name].js",
						chunkFileNames: "[name].js",
						format: "es"
					}
				}
			}
		});
		// await server.listen();

		// console.info(
		// 	`[orange3]Frontend Server[/] (Go here): ${server.resolvedUrls?.local}`
		// );
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

	return _path.replace(/\\/g, "/");
}

function generate_imports(component_dir: string): string {
	const components = find_frontend_folders(component_dir);

	const imports = components.reduce((acc, component) => {
		const x = {
			interactive: to_posix(join(component.dir, "interactive")),
			static: to_posix(join(component.dir, "static")),
			example: to_posix(join(component.dir, "example"))
		};

		const interactive = fs.existsSync(x.interactive)
			? `interactive: () => import("${x.interactive}"),\n`
			: "";
		const example = fs.existsSync(x.example)
			? `example: () => import("${x.example}"),\n`
			: "";
		return `${acc}"${component.package_name}": {
			${interactive}
			${example}
			static: () => import("${x.static}")
			},\n`;
	}, "");

	return `{${imports}}`;
}

import * as fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { build } from "vite";
import { plugins, make_gradio_plugin, deepmerge_plugin } from "./plugins";
import type { PreRenderedChunk } from "rollup";
import { examine_module } from "./index";

interface BuildOptions {
	component_dir: string;
	root_dir: string;
	python_path: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function make_build({
	component_dir,
	root_dir,
	python_path
}: BuildOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const svelte_dir = join(root_dir, "assets", "svelte");

	const module_meta = examine_module(
		component_dir,
		root_dir,
		python_path,
		"build"
	);
	try {
		for (const comp of module_meta) {
			const template_dir = comp.template_dir;
			const source_dir = comp.frontend_dir;

			const pkg = JSON.parse(
				fs.readFileSync(join(source_dir, "package.json"), "utf-8")
			);
			let component_config = {
				plugins: [],
				svelte: {
					preprocess: []
				},
				build: {
					target: []
				},
				optimizeDeps: {
					exclude: ["svelte", "svelte/*"]
				}
			};

			if (
				comp.frontend_dir &&
				fs.existsSync(join(comp.frontend_dir, "gradio.config.js"))
			) {
				const m = await import(
					join("file://" + comp.frontend_dir, "gradio.config.js")
				);

				component_config.plugins = m.default.plugins || [];
				component_config.svelte.preprocess = m.default.svelte?.preprocess || [];
				component_config.build.target = m.default.build?.target || "modules";
				component_config.optimizeDeps =
					m.default.optimizeDeps || component_config.optimizeDeps;
			}

			const exports: (string | any)[][] = [
				[
					join(template_dir, "component"),
					[
						join(__dirname, "svelte_runtime_entry.js"),
						join(source_dir, pkg.exports["."].gradio)
					]
				],
				[
					join(template_dir, "example"),
					[
						join(__dirname, "svelte_runtime_entry.js"),
						join(source_dir, pkg.exports["./example"].gradio)
					]
				]
			].filter(([_, path]) => !!path);

			for (const [out_path, entry_path] of exports) {
				try {
					const x = await build({
						root: source_dir,
						configFile: false,
						plugins: [
							...plugins(component_config),
							make_gradio_plugin({ mode: "build", svelte_dir }),
							deepmerge_plugin
						],
						build: {
							emptyOutDir: true,
							outDir: out_path,
							lib: {
								entry: entry_path,
								fileName: "index.js",
								formats: ["es"]
							},
							minify: true,
							rollupOptions: {
								output: {
									assetFileNames: (chunkInfo) => {
										if (chunkInfo.names[0].endsWith(".css")) {
											return `style.css`;
										}

										return chunkInfo.names[0];
									},
									entryFileNames: (chunkInfo: PreRenderedChunk) => {
										if (chunkInfo.isEntry) {
											return chunkInfo.name.toLocaleLowerCase() + ".js";
										}
										return `${chunkInfo.name.toLocaleLowerCase()}.js`;
									}
								}
							}
						}
					});
				} catch (e) {
					throw e;
				}
			}
		}
	} catch (e) {
		throw e;
	}
}

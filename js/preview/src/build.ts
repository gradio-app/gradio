import * as fs from "fs";
import { join } from "path";
import { build } from "vite";
import { plugins, make_gradio_plugin, deepmerge_plugin } from "./plugins";
import type { PreRenderedChunk } from "rollup";
import { examine_module } from "./index";

interface BuildOptions {
	component_dir: string;
	root_dir: string;
	python_path: string;
}

const svelte_imports = [
	"svelte",
	"svelte/animate",
	"svelte/attachments",
	"svelte/compiler",
	"svelte/easing",
	"svelte/events",
	"svelte/internal/client",
	"svelte/internal/disclose-version",
	"svelte/internal/flags/async",
	"svelte/internal/flags/legacy",
	"svelte/internal/flags/tracing",
	"svelte/internal/server",
	"svelte/internal",
	"svelte/legacy",
	"svelte/motion",
	"svelte/reactivity/window",
	"svelte/reactivity",
	"svelte/server",
	"svelte/store",
	"svelte/transition"
];

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
					exclude: svelte_imports
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
				["component", pkg.exports["."] as object],
				["example", pkg.exports["./example"] as object]
			].filter(([_, path]) => !!path);

			for (const [entry, path] of exports) {
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
							outDir: join(template_dir, entry as string),

							lib: {
								entry: join(source_dir, (path as any).gradio),
								fileName: "index.js",
								formats: ["es"]
							},
							minify: true,
							rollupOptions: {
								external: svelte_imports,
								output: {
									assetFileNames: (chunkInfo) => {
										if (chunkInfo.names[0].endsWith(".css")) {
											return `style.css`;
										}

										return chunkInfo.names[0];
									},
									entryFileNames: (chunkInfo: PreRenderedChunk) => {
										if (chunkInfo.isEntry) {
											return "index.js";
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

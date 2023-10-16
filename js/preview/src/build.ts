import * as fs from "fs";
import { join } from "path";
import { build } from "vite";
import { plugins, make_gradio_plugin } from "./plugins";
import { examine_module } from "./index";

interface BuildOptions {
	component_dir: string;
	root_dir: string;
}

export async function make_build({
	component_dir,
	root_dir
}: BuildOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const svelte_dir = join(root_dir, "assets", "svelte");

	const module_meta = examine_module(component_dir, root_dir, "build");
	try {
		for (const comp of module_meta) {
			const template_dir = comp.template_dir;
			const source_dir = comp.frontend_dir;

			const pkg = JSON.parse(
				fs.readFileSync(join(source_dir, "package.json"), "utf-8")
			);

			const exports: string[][] = [
				["component", pkg.exports["."] as string],
				["exmaple", pkg.exports["./example"] as string]
			].filter(([_, path]) => !!path);

			for (const [entry, path] of exports) {
				try {
					const x = await build({
						plugins: [
							...plugins,
							make_gradio_plugin({ mode: "build", svelte_dir })
						],
						build: {
							emptyOutDir: true,
							outDir: join(template_dir, entry),
							lib: {
								entry: join(source_dir, path),
								fileName: "index.js",
								formats: ["es"]
							},
							rollupOptions: {
								output: {
									entryFileNames: "[name].js"
								}
							}
						}
					});
				} catch (e) {
					console.error(e);
				}
			}
		}
	} catch (e) {
		console.error(e);
	}
}

import * as fs from "fs";
import { join } from "path";
import { build } from "vite";
import { plugins, make_gradio_plugin } from "./plugins";
import path from "path";
import { examine_module } from "./index";

import { patch } from "toml-patch";
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

			const entries = ["interactive", "example", "static"];

			for (const entry of entries) {
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
								entry: join(source_dir, entry, "index.ts"),
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

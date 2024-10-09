import { defineConfig } from "vite";
import { cpSync, write } from "fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dir = require.resolve("./package.json");

const template_dir = join(dir, "..", "..", "..", "gradio", "templates");

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			formats: ["es"]
		},
		outDir: "dist",
		rollupOptions: {
			external: ["fsevents", "vite", "@sveltejs/vite-plugin-svelte"]
		}
	},
	plugins: [copy_files()]
});

export function copy_files() {
	return {
		name: "copy_files",
		writeBundle() {
			cpSync("./src/examine.py", "dist/examine.py");
			cpSync("./src/register.mjs", join(template_dir, "register.mjs"));
			cpSync("./src/hooks.mjs", join(template_dir, "hooks.mjs"));
			cpSync(
				join(template_dir, "frontend", "assets", "svelte"),
				join(template_dir, "node", "build", "client", "_app"),
				{ recursive: true }
			);
		}
	};
}

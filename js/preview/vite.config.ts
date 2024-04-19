import { defineConfig } from "vite";
import { cpSync } from "fs";

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
		}
	};
}

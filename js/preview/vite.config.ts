import { defineConfig } from "vite";
import { cpSync, writeFileSync, rmSync, existsSync } from "fs";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			formats: ["es"]
		},
		outDir: "dist",
		rollupOptions: {
			external: [
				"fsevents",
				"../compiler.js",
				"vite",
				"@sveltejs/vite-plugin-svelte"
			]
		}
	},
	plugins: [copy_files()]
});

export function copy_files() {
	return {
		name: "copy_files",
		writeBundle() {
			// cpSync(join(vite_client, ".."), "../../gradio/node/dist/client", {
			// 	recursive: true
			// });

			// cpSync(join(hmr, "../runtime"), "../../gradio/node/dev/files/runtime", {
			// 	recursive: true
			// });
			// cpSync(
			// 	join(esbuild_binary_path, "..", "..", ".."),
			// 	"../../gradio/node/dev/node_modules",
			// 	{
			// 		recursive: true
			// 	}
			// );

			cpSync("./src/examine.py", "dist/examine.py");
			// mkdirSync("dist", { recursive: true });

			// writeFileSync(
			// 	"dist/package.json",
			// 	`{"type": "module", "version": "0.0.0"}`,
			// 	{
			// 		encoding: "utf-8"
			// 	}
			// );
		}
	};
}

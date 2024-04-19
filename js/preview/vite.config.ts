import { defineConfig } from "vite";

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
	}
});

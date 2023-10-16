import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"]
		},
		rollupOptions: {
			input: "src/index.ts",
			output: {
				dir: "dist"
			}
		}
	},

	ssr: {
		target: "node",
		format: "esm",
		noExternal: ["ws", "semiver"]
	}
});

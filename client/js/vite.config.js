import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
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
		noExternal: "ws"
	}
});

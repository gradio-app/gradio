import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es", "umd"],
			name: "client"
		},
		rollupOptions: {
			external: [],
			output: {
				globals: {}
			}
		}
	},
	plugins: [
		tsconfigPaths(),
		dts({
			insertTypesEntry: true
		})
	]
});

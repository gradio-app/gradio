import path from "path";
import { defineConfig } from "vite";

/**
 * We bundle the service worker file before packaging separately from the main bundle.
 */

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: path.join(__dirname, "src/sw.ts"),
			// Ref: https://github.com/rollup/rollup/issues/2616#issuecomment-1431551704
			output: {
				entryFileNames: "sw.js"
			}
		}
	}
});

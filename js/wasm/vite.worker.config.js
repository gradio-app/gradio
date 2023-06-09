import path from "path";
import { defineConfig } from "vite";

/**
 * We bundle the worker file before packaging, while other files are only TS-transpiled.
 * The consumer of this package, `@gradio/app`, will be bundled with Vite,
 * and Vite only supports module-type WebWorkers (`new Worker("...", { type: "module" })`) to handle `import` in the worker file,
 * because in the dev mode it doesn't bundle the worker file and just relies on the browser's native support for module-type workers to resolve the imports.
 * However, we need to use `importScripts()` in the worker to load Pyodide from the CDN, which is only supported by classic WebWorkers (`new Worker("...")`),
 * while we still want to use `import` in the worker to modularize the code.
 * So, we bundle the worker file to resolve `import`s here before exporting, preserving `importScripts()` in the bundled file,
 * and load the bundled worker file on `@gradio/app` as a classic WebWorker.
 *
 * Note: We tried the following approaches, but they failed:
 * 1. Just TS-transpile the worker file like other files into `worker.js`, and use it like `new Worker("worker.js")`.
 * 	  It failed because `tsc` reserves `importScripts()` and also appends `export {};` to the end of the file to specify it as a module (`https://github.com/microsoft/TypeScript/issues/41513`),
 *    however, `importScripts()` is only supported by classic WebWorkers, and `export {};` is not supported by classic WebWorkers.
 * 2. Use ESM import instead of `importScripts()`, which is (experimentally?) supported by Pyodide since v0.20.0 (https://pyodide.org/en/stable/project/changelog.html#javascript-package),
 *    using `import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js";` in the worker file, instead of `importScripts(...)`.
 *    It was successful in the dev mode, but failed in the prod mode, which has this problem: https://github.com/pyodide/pyodide/issues/2217#issuecomment-1328344562.
 */

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: path.join(__dirname, "src/webworker/index.ts"),
			// Ref: https://github.com/rollup/rollup/issues/2616#issuecomment-1431551704
			output: {
				entryFileNames: "webworker.js"
			}
		}
	}
});

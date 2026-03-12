import { defineConfig, createLogger } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "@vitest/browser-playwright";

const TEST_MODE = process.env.TEST_MODE || "browser";

const logger = createLogger();
const originalWarning = logger.warn;

logger.warn = (log, options) => {
	if (log.includes("was created with unknown prop")) return false;
	if (log.includes("https://svelte.dev")) return false;
	if (log.includes("[vite-plugin-svelte]")) return false;
	if (log && log.includes("[MSW]")) return false;
	if (log && log.includes("node:")) return false;
	originalWarning(log, options);
};

const originalError = logger.error;

logger.error = (log, options) => {
	if (log.includes("was created with unknown prop")) return false;
	if (log.includes("https://svelte.dev")) return false;
	if (log.includes("[vite-plugin-svelte]")) return false;
	if (log && log.includes("[MSW]")) return false;
	if (log && log.includes("(node:")) return false;
	originalError(log, options);
};

const original_info = logger.info;
logger.info = (log, options) => {
	if (log.includes("was created with unknown prop")) return false;
	if (log.includes("https://svelte.dev")) return false;
	if (log.includes("[vite-plugin-svelte]")) return false;
	if (log && log.includes("[MSW]")) return false;
	if (log && log.includes("node:")) return false;
	original_info(log, options);
};
export default defineConfig(({ mode }) => {
	const production = mode === "production";
	const isBrowserBuild = process.env.BROWSER_BUILD === "true";

	if (mode === "preview") {
		return {
			entry: "index.html"
		};
	}

	return {
		customLogger: logger,
		build: {
			emptyOutDir: false,
			lib: {
				entry: "src/index.ts",
				formats: ["es"],
				fileName: isBrowserBuild ? `browser` : `index`
			},
			rollupOptions: {
				input: "src/index.ts",
				output: {
					dir: "dist"
				}
			}
		},
		plugins: [svelte()],
		define: {
			BROWSER_BUILD: JSON.stringify(isBrowserBuild)
		},
		mode: process.env.MODE || "development",
		test: {
			include: ["./src/test/*.test.*"],
			onConsoleLog(log) {
				if (log.includes("[MSW]")) return false;
				if (log.includes("node:")) return false;
				if (log.includes("data: '\"404\"'")) return false;
				if (log.includes("Too many arguments")) return false;
			},
			...(TEST_MODE === "node"
				? { environment: "node" }
				: {
						browser: {
							enabled: true,
							provider: playwright(),
							instances: [
								{
									browser: "chromium"
								}
							]
						}
					})
		},
		ssr: {
			target: "node",
			format: "esm",
			noExternal: [
				"ws",
				"semiver",
				"bufferutil",
				"@gradio/upload",
				"fetch-event-stream"
			]
		}
	};
});

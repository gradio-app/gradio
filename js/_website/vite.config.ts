import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inject_component_loader } from "../build/out/index.js";
import { patchParamViewer } from "./vite-plugin-patch-paramviewer.js";

// Workaround for rolldown-vite (Vite 8): its build environments don't isolate
// their module graphs, so SSR-resolved `*.server.*` modules (e.g.
// hooks.server.ts) leak into the CLIENT build. That trips SvelteKit's
// server-only import guard ("An impossible situation occurred"). Server modules
// are never used client-side, so stub them to an empty module in the client
// build only. Must run before SvelteKit's guard, hence `enforce: "pre"` and
// first position in the plugins array.
function stub_server_modules_in_client() {
	return {
		name: "stub-server-modules-in-client",
		enforce: "pre" as const,
		load(id: string, options?: { ssr?: boolean }) {
			if (options?.ssr !== true && /\.server\.[jt]s(\?|$)/.test(id)) {
				return "export {};";
			}
		}
	};
}

//@ts-ignore
export default defineConfig(({ mode }) => ({
	plugins: [
		stub_server_modules_in_client(),
		patchParamViewer(),
		sveltekit(),
		inject_component_loader({ mode })
	],
	resolve: {
		conditions: ["gradio"]
	},
	build: {
		rollupOptions: {
			external: ["@gradio/wasm/svelte", "dompurify", "ts-dedent"]
		}
	}
}));

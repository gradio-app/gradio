import "@gradio/theme";
import { WorkerProxy } from "@gradio/wasm";
import Index from "./Index.svelte";
import type { ThemeMode } from "./components/types";

// TODO: Make sure the wheel has been built.
import gradioWheel from "../../../dist/gradio-3.32.0-py3-none-any.whl";
import gradioClientWheel from "../../../client/python/dist/gradio_client-0.2.5-py3-none-any.whl";

declare let GRADIO_VERSION: string;

// NOTE: The following line has been copied from `main.ts`.
// In `main.ts`, which is the normal Gradio app entry point,
// the string literal "__ENTRY_CSS__" will be replaced with the actual CSS file path
// by the Vite plugin `handle_ce_css` in `build_plugins.ts`,
// and the CSS file will be dynamically loaded at runtime
// as the file path (the `ENTRY_CSS` variable) will be passed to `mount_css()`.
// This mechanism has been introduced in https://github.com/gradio-app/gradio/pull/1444
// to make Gradio work as a Web Component library
// with which users can use Gradio by loading only one JS file,
// without a link tag referring to the CSS file.
// However, we don't rely on this mechanism here to make things simpler by leaving the Vite plugins as is,
// because it will be refactored in the near future.
// As a result, the users of the Wasm app will have to load the CSS file manually.
// const ENTRY_CSS = "__ENTRY_CSS__";

interface Options {
	target: HTMLElement;
	pyCode: string;
	info: boolean;
	container: boolean;
	isEmbed: boolean;
	initialHeight?: string;
	eager: boolean;
	themeMode: ThemeMode | null;
	autoScroll: boolean;
	controlPageTitle: boolean;
	appMode: boolean;
}
export async function create(options: Options) {
	// TODO: Runtime type validation for options.

	const observer = new MutationObserver(() => {
		document.body.style.padding = "0";
	});

	observer.observe(options.target, { childList: true });

	const worker_proxy = new WorkerProxy({
		gradioWheelUrl: gradioWheel,
		gradioClientWheelUrl: gradioClientWheel,
		requirements: []
	});
	// NOTE: We don't run `await worker_proxy.runPythonAsync()` here
	// because its execution will be deferred until the worker initialization is done
	// and it blocks mounting the app.
	// Instead, we will pass the proxy and the Python code to the app component
	// and run it in the app component when it's ready.

	const app = new Index({
		target: options.target,
		props: {
			// embed source
			space: null,
			src: null,
			host: null,
			// embed info
			info: options.info,
			container: options.container,
			is_embed: options.isEmbed,
			initial_height: options.initialHeight ?? "300px", // default: 300px
			eager: options.eager,
			// gradio meta info
			version: GRADIO_VERSION,
			theme_mode: options.themeMode,
			// misc global behaviour
			autoscroll: options.autoScroll,
			control_page_title: options.controlPageTitle,
			// for gradio docs
			// TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
			app_mode: options.appMode,
			// For Wasm mode
			wasm_worker_proxy: worker_proxy,
			wasm_py_code: options.pyCode
		}
	});
}

/**
 * I'm not sure if this is a correct way to export functions from a bundle created with Vite.
 * However, at least, the library mode (https://vitejs.dev/guide/build.html#library-mode)
 * with an exported function (`export async function create()`) didn't work for our case.
 * In library mode with the `build.lib.entry = (this file)` config,
 * Vite creates a bundle exporting the functions from this file, which looks nice,
 * however, it inevitably enables inlining of all the static file assets,
 * while we need to disable inlining for the wheel files to pass their URLs to `micropip.install()`.
 *
 * > If you specify build.lib, build.assetsInlineLimit will be ignored and assets will always be inlined, regardless of file size or being a Git LFS placeholder.
 * > https://vitejs.dev/config/build-options.html#build-assetsinlinelimit
 *
 * There is an open issue about this: https://github.com/vitejs/vite/issues/4454
 *
 * FYI, stlite (https://github.com/whitphx/stlite) uses Webpack,
 * which supports bundling libraries that export entities to the global scope and disabling assets inlining
 * (https://webpack.js.org/guides/author-libraries/).
 */
// @ts-ignore
globalThis.createGradioApp = create;

declare let BUILD_MODE: string;
if (BUILD_MODE === "dev") {
	create({
		target: document.getElementById("gradio-app")!,
		pyCode: `
import gradio as gr

def greet(name):
		return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")

demo.launch()
		`,
		info: true,
		container: true,
		isEmbed: false,
		initialHeight: "300px",
		eager: false,
		themeMode: null,
		autoScroll: false,
		controlPageTitle: false,
		appMode: true
	});
}

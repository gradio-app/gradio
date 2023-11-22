import "@gradio/theme";
import type { SvelteComponent } from "svelte";
import { WorkerProxy, type WorkerProxyOptions } from "@gradio/wasm";
import { api_factory } from "@gradio/client";
import { wasm_proxied_fetch } from "./fetch";
import { wasm_proxied_WebSocket_factory } from "./websocket";
import { wasm_proxied_mount_css, mount_prebuilt_css } from "./css";
import type { mount_css } from "../css";
import Index from "../Index.svelte";
import ErrorDisplay from "./ErrorDisplay.svelte";
import type { ThemeMode } from "../types";
import { bootstrap_custom_element } from "./custom-element";

// These imports are aliased at built time with Vite. See the `resolve.alias` config in `vite.config.ts`.
import gradioWheel from "gradio.whl";
import gradioClientWheel from "gradio_client.whl";

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

interface GradioAppController {
	run_code: (code: string) => Promise<void>;
	run_file: (path: string) => Promise<void>;
	write: (
		path: string,
		data: string | ArrayBufferView,
		opts: any
	) => Promise<void>;
	rename: (old_path: string, new_path: string) => Promise<void>;
	unlink: (path: string) => Promise<void>;
	install: (requirements: string[]) => Promise<void>;
	unmount: () => void;
}

export interface Options {
	target: HTMLElement;
	files?: WorkerProxyOptions["files"];
	requirements?: WorkerProxyOptions["requirements"];
	code?: string;
	entrypoint?: string;
	sharedWorkerMode?: boolean;
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
export function create(options: Options): GradioAppController {
	// TODO: Runtime type validation for options.

	const observer = new MutationObserver(() => {
		document.body.style.padding = "0";
	});

	observer.observe(options.target, { childList: true });

	const worker_proxy = new WorkerProxy({
		gradioWheelUrl: new URL(gradioWheel, import.meta.url).href,
		gradioClientWheelUrl: new URL(gradioClientWheel, import.meta.url).href,
		files: options.files ?? {},
		requirements: options.requirements ?? [],
		sharedWorkerMode: options.sharedWorkerMode ?? false
	});

	worker_proxy.addEventListener("initialization-error", (event) => {
		showError((event as CustomEvent).detail);
	});

	// Internally, the execution of `runPythonCode()` or `runPythonFile()` is queued
	// and its promise will be resolved after the Pyodide is loaded and the worker initialization is done
	// (see the await in the `onmessage` callback in the webworker code)
	// So we don't await this promise because we want to mount the `Index` immediately and start the app initialization asynchronously.
	if (options.code != null) {
		worker_proxy.runPythonCode(options.code).catch(showError);
	} else if (options.entrypoint != null) {
		worker_proxy.runPythonFile(options.entrypoint).catch(showError);
	} else {
		throw new Error("Either code or entrypoint must be provided.");
	}

	mount_prebuilt_css(document.head);

	const overridden_fetch: typeof fetch = (input, init?) => {
		return wasm_proxied_fetch(worker_proxy, input, init);
	};
	const WebSocket_factory = (url: URL): WebSocket => {
		return wasm_proxied_WebSocket_factory(worker_proxy, url);
	};
	const { client, upload_files } = api_factory(
		overridden_fetch,
		WebSocket_factory
	);
	const overridden_mount_css: typeof mount_css = async (url, target) => {
		return wasm_proxied_mount_css(worker_proxy, url, target);
	};

	let app: SvelteComponent;
	function showError(error: Error): void {
		if (app != null) {
			app.$destroy();
		}

		app = new ErrorDisplay({
			target: options.target,
			props: {
				is_embed: !options.isEmbed,
				error
			}
		});
	}
	function launchNewApp(): void {
		if (app != null) {
			app.$destroy();
		}

		app = new Index({
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
				worker_proxy,
				client,
				upload_files,
				mount_css: overridden_mount_css
			}
		});
	}

	launchNewApp();

	return {
		run_code: (code: string) => {
			return worker_proxy
				.runPythonCode(code)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		run_file: (path: string) => {
			return worker_proxy
				.runPythonFile(path)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		write: (path, data, opts) => {
			return worker_proxy
				.writeFile(path, data, opts)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		rename: (old_path, new_path) => {
			return worker_proxy
				.renameFile(old_path, new_path)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		unlink: (path) => {
			return worker_proxy
				.unlink(path)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		install: (requirements) => {
			return worker_proxy
				.install(requirements)
				.then(launchNewApp)
				.catch((e) => {
					showError(e);
					throw e;
				});
		},
		unmount() {
			app.$destroy();
			worker_proxy.terminate();
		}
	};
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

bootstrap_custom_element();

declare let BUILD_MODE: string;
if (BUILD_MODE === "dev") {
	(async function () {
		const DevApp = (await import("./dev/App.svelte")).default;

		const app = new DevApp({
			target: document.getElementById("dev-app")!
		});
	})();
}

import { type WorkerProxyOptions } from "@gradio/wasm";
import type { ThemeMode } from "@gradio/core";
import { bootstrap_custom_element } from "./custom-element";

declare let GRADIO_VERSION: string;

import LiteIndex from "./LiteIndex.svelte";

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

export class GradioAppController extends EventTarget {
	constructor(private lite_svelte_app: LiteIndex) {
		super();

		this.lite_svelte_app.$on("error", (event: CustomEvent) => {
			this.dispatchEvent(new CustomEvent("error", { detail: event.detail }));
		});
		this.lite_svelte_app.$on("modules-auto-loaded", (event: CustomEvent) => {
			this.dispatchEvent(
				new CustomEvent("modules-auto-loaded", { detail: event.detail })
			);
		});
		this.lite_svelte_app.$on("stdout", (event: CustomEvent) => {
			this.dispatchEvent(new CustomEvent("stdout", { detail: event.detail }));
		});
		this.lite_svelte_app.$on("stderr", (event: CustomEvent) => {
			this.dispatchEvent(new CustomEvent("stderr", { detail: event.detail }));
		});
		this.lite_svelte_app.$on("initialization-error", (event: CustomEvent) => {
			this.dispatchEvent(
				new CustomEvent("initialization-error", { detail: event.detail })
			);
		});
		this.lite_svelte_app.$on("python-error", (event: CustomEvent) => {
			this.dispatchEvent(
				new CustomEvent("python-error", { detail: event.detail })
			);
		});
		this.lite_svelte_app.$on("init-code-run-error", (event: CustomEvent) => {
			this.dispatchEvent(
				new CustomEvent("init-code-run-error", { detail: event.detail })
			);
		});
		this.lite_svelte_app.$on("init-file-run-error", (event: CustomEvent) => {
			this.dispatchEvent(
				new CustomEvent("init-file-run-error", { detail: event.detail })
			);
		});
	}

	run_code = (code: string): Promise<void> => {
		return this.lite_svelte_app.run_code(code);
	};
	run_file = (path: string): Promise<void> => {
		return this.lite_svelte_app.run_file(path);
	};
	write = (
		path: string,
		data: string | ArrayBufferView,
		opts: any
	): Promise<void> => {
		return this.lite_svelte_app.write(path, data, opts);
	};
	rename = (old_path: string, new_path: string): Promise<void> => {
		return this.lite_svelte_app.rename(old_path, new_path);
	};
	unlink = (path: string): Promise<void> => {
		return this.lite_svelte_app.unlink(path);
	};
	install = (requirements: string[]): Promise<void> => {
		return this.lite_svelte_app.install(requirements);
	};
	unmount = (): void => {
		this.lite_svelte_app.$destroy();
	};
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
	playground: boolean | undefined;
	layout: string | null;
}
export function create(options: Options): GradioAppController {
	// TODO: Runtime type validation for options.

	const observer = new MutationObserver(() => {
		document.body.style.padding = "0";
	});

	observer.observe(options.target, { childList: true });

	const app = new LiteIndex({
		target: options.target,
		props: {
			info: options.info,
			container: options.container,
			is_embed: options.isEmbed,
			initial_height: options.initialHeight ?? "300px",
			eager: options.eager,
			version: GRADIO_VERSION,
			theme_mode: options.themeMode,
			autoscroll: options.autoScroll,
			control_page_title: options.controlPageTitle,
			app_mode: options.appMode,
			// For Wasm mode
			files: options.files,
			requirements: options.requirements,
			code: options.code,
			entrypoint: options.entrypoint,
			sharedWorkerMode: options.sharedWorkerMode,
			// For playground
			playground: options.playground,
			layout: options.layout
		}
	});

	return new GradioAppController(app);
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

// Deferring the custom element registration until the DOM is ready.
// If not, `this.textContent` will be empty in `connectedCallback`
// because the browser has not parsed the content yet.
// Using `setTimeout()` is also a solution but it might not be the best practice as written in the article below.
// Ref: https://dbushell.com/2024/06/15/custom-elements-unconnected-callback/
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		bootstrap_custom_element(create);
	});
} else {
	bootstrap_custom_element(create);
}

declare let BUILD_MODE: string;
if (BUILD_MODE === "dev") {
	(async function () {
		const DevApp = (await import("./dev/App.svelte")).default;

		const app = new DevApp({
			target: document.getElementById("dev-app")!
		});
	})();
}

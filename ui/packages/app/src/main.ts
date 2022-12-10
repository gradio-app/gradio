import Blocks from "./Blocks.svelte";
import Login from "./Login.svelte";
import { Component as Loader } from "./components/StatusTracker";
import { fn, component_fn } from "./api";

import type { ComponentMeta, Dependency, LayoutNode } from "./components/types";

import * as t from "@gradio/theme";

let id = -1;
window.__gradio_loader__ = [];

declare let BACKEND_URL: string;
declare let BUILD_MODE: string;

const ENTRY_CSS = "__ENTRY_CSS__";
const FONTS = "__FONTS_CSS__";

interface Config {
	auth_required: boolean | undefined;
	auth_message: string;
	components: ComponentMeta[];
	css: string | null;
	dependencies: Dependency[];
	dev_mode: boolean;
	enable_queue: boolean;
	fn: ReturnType<typeof fn>;
	layout: LayoutNode;
	mode: "blocks" | "interface";
	root: string;
	target: HTMLElement;
	theme: string;
	title: string;
	version: string;
	is_space: boolean;
	is_colab: boolean;
	show_api: boolean;
}

let app_id: string | null = null;
let app_mode = window.__gradio_mode__ === "app";

async function reload_check(root: string) {
	const result = await (await fetch(root + "app_id")).text();

	if (app_id === null) {
		app_id = result;
	} else if (app_id != result) {
		location.reload();
	}

	setTimeout(() => reload_check(root), 250);
}

async function get_source_config(source: string): Promise<Config> {
	let config = await (await fetch(source + "config")).json();
	config.root = source;
	return config;
}

async function get_config(source: string | null) {
	if (BUILD_MODE === "dev" || location.origin === "http://localhost:3000") {
		let config = await fetch(BACKEND_URL + "config");
		const result = await config.json();
		return result;
	} else if (source) {
		if (!source.endsWith("/")) {
			source += "/";
		}
		const config = await get_source_config(source);
		return config;
	} else {
		return window.gradio_config;
	}
}

function mount_custom_css(
	target: ShadowRoot | HTMLElement,
	css_string?: string
) {
	if (css_string) {
		let style = document.createElement("style");
		style.innerHTML = css_string;
		target.appendChild(style);
	}
}

function mount_css(
	url: string,
	target: ShadowRoot | HTMLElement
): Promise<void> {
	if (BUILD_MODE === "dev") Promise.resolve();

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	// @ts-ignore
	target.appendChild(link);

	return new Promise((res, rej) => {
		link.addEventListener("load", () => res());
		link.addEventListener("error", () =>
			rej(new Error(`Unable to preload CSS for ${url}`))
		);
	});
}

async function handle_config(
	target: HTMLElement | ShadowRoot,
	source: string | null
) {
	let config;

	try {
		let [_config] = await Promise.all([
			get_config(source),
			BUILD_MODE === "dev" ? Promise.resolve : mount_css(ENTRY_CSS, target)
		]);
		config = _config;
	} catch (e) {
		console.error(e);
		return null;
	}

	mount_custom_css(target, config.css);
	window.__is_colab__ = config.is_colab;

	if (config.root === undefined) {
		config.root = BACKEND_URL;
	}
	if (config.dev_mode) {
		reload_check(config.root);
	}

	config.target = target;

	return config;
}

function mount_app(
	config: Config,
	target: HTMLElement | ShadowRoot | false,
	wrapper: HTMLDivElement,
	id: number,
	autoscroll?: boolean,
	is_embed = false
) {
	//@ts-ignore
	if (config.detail === "Not authenticated" || config.auth_required) {
		new Login({
			target: wrapper,
			//@ts-ignore
			props: {
				auth_message: config.auth_message,
				root: config.root,
				id,
				app_mode
			}
		});
	} else {
		let session_hash = Math.random().toString(36).substring(2);
		config.fn = fn(
			session_hash,
			config.root + "run/",
			config.is_space,
			is_embed
		);

		new Blocks({
			target: wrapper,
			//@ts-ignore
			props: {
				...config,
				target: wrapper,
				id,
				autoscroll: autoscroll,
				app_mode
			}
		});
	}

	if (target) {
		target.append(wrapper);
	}
}

function create_custom_element() {
	//@ts-ignore
	FONTS.map((f) => mount_css(f, document.head));

	class GradioApp extends HTMLElement {
		root: ShadowRoot;
		wrapper: HTMLDivElement;
		_id: number;
		theme: string;

		constructor() {
			super();

			this._id = ++id;

			this.root = this.attachShadow({ mode: "open" });

			window.scoped_css_attach = (link) => {
				this.root.append(link);
			};

			this.wrapper = document.createElement("div");
			this.wrapper.classList.add("gradio-container");

			this.wrapper.style.position = "relative";
			this.wrapper.style.width = "100%";
			this.wrapper.style.minHeight = "100vh";
			this.theme = "light";

			window.__gradio_loader__[this._id] = new Loader({
				target: this.wrapper,
				props: {
					status: "pending",
					timer: false,
					queue_position: null,
					queue_size: null
				}
			});

			this.root.append(this.wrapper);
			if (window.__gradio_mode__ !== "website") {
				this.theme = handle_darkmode(this.wrapper);
			}
		}

		async connectedCallback() {
			const event = new CustomEvent("domchange", {
				bubbles: true,
				cancelable: false,
				composed: true
			});

			var observer = new MutationObserver((mutations) => {
				this.dispatchEvent(event);
			});

			observer.observe(this.root, { childList: true });

			const host = this.getAttribute("host");
			const space = this.getAttribute("space");

			const source = host
				? `https://${host}`
				: space
				? (
						await (
							await fetch(`https://huggingface.co/api/spaces/${space}/host`)
						).json()
				  ).host
				: this.getAttribute("src");

			const control_page_title = this.getAttribute("control_page_title");
			const initial_height = this.getAttribute("initial_height");
			let autoscroll = this.getAttribute("autoscroll");

			const _autoscroll = autoscroll === "true" ? true : false;

			this.wrapper.style.minHeight = initial_height || "300px";

			const config = await handle_config(this.root, source);
			if (config === null) {
				this.wrapper.remove();
			} else {
				mount_app(
					{
						...config,
						theme: this.theme,
						control_page_title:
							control_page_title && control_page_title === "true" ? true : false
					},
					this.root,
					this.wrapper,
					this._id,
					_autoscroll,
					!!space
				);
			}
		}
	}

	customElements.define("gradio-app", GradioApp);
}

async function unscoped_mount() {
	const target = document.querySelector("#root")! as HTMLDivElement;
	target.classList.add("gradio-container");
	if (window.__gradio_mode__ !== "website") {
		handle_darkmode(target);
	}

	window.__gradio_loader__[0] = new Loader({
		target: target,
		props: {
			status: "pending",
			timer: false,
			queue_position: null,
			queue_size: null
		}
	});

	const config = await handle_config(target, null);
	mount_app({ ...config, control_page_title: true }, false, target, 0);
}

function handle_darkmode(target: HTMLDivElement): string {
	let url = new URL(window.location.toString());
	let theme = "light";

	const color_mode: "light" | "dark" | "system" | null = url.searchParams.get(
		"__theme"
	) as "light" | "dark" | "system" | null;

	if (color_mode !== null) {
		if (color_mode === "dark") {
			theme = darkmode(target);
		} else if (color_mode === "system") {
			theme = use_system_theme(target);
		}
		// light is default, so we don't need to do anything else
	} else if (url.searchParams.get("__dark-theme") === "true") {
		theme = darkmode(target);
	} else {
		theme = use_system_theme(target);
	}
	return theme;
}

function use_system_theme(target: HTMLDivElement): string {
	const theme = update_scheme();
	window
		?.matchMedia("(prefers-color-scheme: dark)")
		?.addEventListener("change", update_scheme);

	function update_scheme() {
		let theme = "light";
		const is_dark =
			window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

		if (is_dark) {
			theme = darkmode(target);
		}
		return theme;
	}
	return theme;
}

function darkmode(target: HTMLDivElement): string {
	target.classList.add("dark");
	if (app_mode) {
		document.body.style.backgroundColor = "rgb(11, 15, 25)"; // bg-gray-950 for scrolling outside the body
	}
	return "dark";
}

// dev mode or if inside an iframe
if (BUILD_MODE === "dev" || window.location !== window.parent.location) {
	window.scoped_css_attach = (link) => {
		document.head.append(link);
	};
	unscoped_mount();
} else {
	create_custom_element();
}

import Blocks from "./Blocks.svelte";
import Login from "./Login.svelte";
import { Component as Loader } from "./components/StatusTracker";
import { fn } from "./api";

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
	show_api: boolean;
	// allow_flagging: string;
	// allow_interpretation: boolean;
	// article: string;
	// cached_examples: boolean;

	// description: string;
	// examples: Array<unknown>;
	// examples_per_page: number;
	// favicon_path: null | string;
	// flagging_options: null | unknown;

	// function_count: number;
	// input_components: Array<ComponentMeta>;
	// output_components: Array<ComponentMeta>;
	// layout: string;
	// live: boolean;
	// mode: "blocks" | "interface" | undefined;
	// enable_queue: boolean;
	// root: string;
	// show_input: boolean;
	// show_output: boolean;
	// simpler_description: string;
	// theme: string;
	// thumbnail: null | string;
	// title: string;
	// version: string;
	// space?: string;
	// detail: string;
	// dark: boolean;
	// dev_mode: boolean;
}

let app_id: string | null = null;

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
	autoscroll?: boolean
) {
	//@ts-ignore
	if (config.detail === "Not authenticated" || config.auth_required) {
		new Login({
			target: wrapper,
			//@ts-ignore
			props: {
				auth_message: config.auth_message,
				root: config.root,
				id
			}
		});
	} else {
		let session_hash = Math.random().toString(36).substring(2);
		config.fn = fn(session_hash, config.root + "api/", config.is_space);

		new Blocks({
			target: wrapper,
			//@ts-ignore
			props: { ...config, target: wrapper, id, autoscroll: autoscroll }
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

			const space = this.getAttribute("space");
			let source = space
				? `https://hf.space/embed/${space}/+/`
				: this.getAttribute("src");
			const initial_height = this.getAttribute("initial_height");
			let autoscroll = this.getAttribute("autoscroll");

			const _autoscroll = autoscroll === "true" ? true : false;

			this.wrapper.style.minHeight = initial_height || "300px";

			const config = await handle_config(this.root, source);
			if (config === null) {
				this.wrapper.remove();
			} else {
				mount_app(config, this.root, this.wrapper, this._id, _autoscroll);
			}
		}
	}

	customElements.define("gradio-app", GradioApp);
}

async function unscoped_mount() {
	const target = document.querySelector("#root")! as HTMLDivElement;
	target.classList.add("gradio-container");

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
	mount_app(config, false, target, 0);
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

import Blocks from "./Blocks.svelte";
import Login from "./Login.svelte";
import { Component as Loader } from "./components/StatusTracker";
import { fn } from "./api";

import * as t from "@gradio/theme";

let id = -1;
window.__gradio_loader__ = [];

interface CustomWindow extends Window {
	__gradio_mode__: "app" | "website";
	launchGradio: Function;
	launchGradioFromSpaces: Function;
	gradio_config: Config;
	scoped_css_attach: (link: HTMLLinkElement) => void;
	__gradio_loader__: Array<{
		$set: (args: any) => any;
	}>;
}

declare let window: CustomWindow;
declare let BACKEND_URL: string;
declare let BUILD_MODE: string;

const ENTRY_CSS = "__ENTRY_CSS__";
const FONTS = "__FONTS_CSS__";

interface Component {
	name: string;
	[key: string]: unknown;
}

interface Config {
	auth_required: boolean | undefined;
	allow_flagging: string;
	allow_interpretation: boolean;
	allow_screenshot: boolean;
	article: string;
	cached_examples: boolean;
	css: null | string;
	description: string;
	examples: Array<unknown>;
	examples_per_page: number;
	favicon_path: null | string;
	flagging_options: null | unknown;
	fn: Function;
	function_count: number;
	input_components: Array<Component>;
	output_components: Array<Component>;
	layout: string;
	live: boolean;
	mode: "blocks" | "interface" | undefined;
	enable_queue: boolean;
	root: string;
	show_input: boolean;
	show_output: boolean;
	simpler_description: string;
	theme: string;
	thumbnail: null | string;
	title: string;
	version: string;
	space?: string;
	detail: string;
	dark: boolean;
	dev_mode: boolean;
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

async function get_space_config(space_id: string): Promise<Config> {
	const space_url = `https://hf.space/embed/${space_id}/+/`;
	let config = await (await fetch(space_url + "config")).json();
	config.root = space_url;
	config.space = space_id;

	return config;
}

async function get_config(space_id: string | null) {
	if (BUILD_MODE === "dev" || location.origin === "http://localhost:3000") {
		let config = await fetch(BACKEND_URL + "config");
		const result = await config.json();
		return result;
	} else if (space_id) {
		const config = await get_space_config(space_id);
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
	space_id: string | null
) {
	let [config] = await Promise.all([
		get_config(space_id),
		mount_css(ENTRY_CSS, target)
	]);

	mount_custom_css(target, config.css);

	if (config.dev_mode) {
		reload_check(config.root);
	}

	if (config.root === undefined) {
		config.root = BACKEND_URL;
	}

	config.target = target;

	return config;
}

function mount_app(
	config: Config,
	target: HTMLElement | ShadowRoot | false,
	wrapper: HTMLDivElement,
	id: number
) {
	if (config.detail === "Not authenticated" || config.auth_required) {
		const app = new Login({
			target: wrapper,
			//@ts-ignore
			props: { ...config, id }
		});
	} else {
		let session_hash = Math.random().toString(36).substring(2);
		config.fn = fn.bind(null, session_hash, config.root + "api/");

		const app = new Blocks({
			target: wrapper,
			//@ts-ignore
			props: { ...config, target: wrapper, id }
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
					queue_position: null
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
			const initial_height = this.getAttribute("initial_height");
			this.wrapper.style.minHeight = initial_height || "300px";

			const config = await handle_config(this.root, space);
			mount_app(config, this.root, this.wrapper, this._id);
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
			queue_position: null
		}
	});

	const config = await handle_config(target, null);

	mount_app(config, false, target, 0);
}

if (BUILD_MODE === "dev") {
	unscoped_mount();
} else {
	create_custom_element();
}

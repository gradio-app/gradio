import Blocks from "./Blocks.svelte";
import Login from "./Login.svelte";
import { Component as Loader } from "./components/StatusTracker";
import { fn } from "./api";

import * as t from "@gradio/theme";

interface CustomWindow extends Window {
	__gradio_mode__: "app" | "website";
	launchGradio: Function;
	launchGradioFromSpaces: Function;
	gradio_config: Config;
}

declare let window: CustomWindow;
declare let BACKEND_URL: string;
declare let BUILD_MODE: string;

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
	static_src: string;
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
let reload_check = (root: string) => {
	fetch(root + "app_id")
		.then((response) => response.text())
		.then((response) => {
			if (app_id === null) {
				app_id = response;
			} else if (app_id != response) {
				location.reload();
			}
		})
		.finally(() => {
			setTimeout(() => reload_check(root), 250);
		});
};

window.launchGradio = (config: Config, element_query: string) => {
	let target: HTMLElement = document.querySelector(element_query)!;

	if (!target) {
		throw new Error(
			"The target element could not be found. Please ensure that element exists."
		);
	}
	target.classList.add("gradio-container");

	if (config.root === undefined) {
		config.root = BACKEND_URL;
	}
	if (window.__gradio_mode__ === "app") {
		config.static_src = ".";
	} else if (window.__gradio_mode__ === "website") {
		config.static_src = "";
	} else {
		config.static_src = "https://gradio.s3-us-west-2.amazonaws.com/PIP_VERSION";
	}
	if (config.dev_mode) {
		reload_check(config.root);
	}
	if (config.css) {
		let style = document.createElement("style");
		style.innerHTML = config.css;
		document.head.appendChild(style);
	}
	if (config.detail === "Not authenticated" || config.auth_required) {
		new Login({
			target: target,
			props: config
		});
		window.__gradio_loader__.$set({ status: "complete" });
	} else {
		let session_hash = Math.random().toString(36).substring(2);
		config.fn = fn.bind(null, session_hash, config.root + "api/");

		new Blocks({
			target: target,
			props: { ...config, target }
		});
	}
};

window.launchGradioFromSpaces = async (space: string, target: string) => {
	const space_url = `https://hf.space/embed/${space}/+/`;
	let config = await fetch(space_url + "config");
	let _config: Config = await config.json();
	_config.root = space_url;
	_config.space = space;
	window.launchGradio(_config, target);
};

async function get_config() {
	if (BUILD_MODE === "dev" || location.origin === "http://localhost:3000") {
		let config = await fetch(BACKEND_URL + "config");
		config = await config.json();
		return config;
	} else {
		return window.gradio_config;
	}
}

if (window.__gradio_mode__ == "app") {
	window.__gradio_loader__ = new Loader({
		target: document.querySelector("#root")!,
		props: {
			status: "pending",
			timer: false,
			queue_position: null,
			cover_all: true
		}
	});

	get_config()
		.then((config) => {
			window.launchGradio(config, "#root");
		})
		.catch((e) => {
			console.error(e);
			window.__gradio_loader__.$set({ status: "error" });
		});
}

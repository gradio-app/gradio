import Blocks from "./Blocks.svelte";
import Login from "./Login.svelte";
import { fn } from "./api";

import * as t from "@gradio/theme";

interface CustomWindow extends Window {
	gradio_mode: "app" | "website";
	launchGradio: Function;
	launchGradioFromSpaces: Function;
	gradio_config: Config;
}

declare let window: CustomWindow;
declare let BACKEND_URL: string;
declare let BACKEND_URL_TEST: string;
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
}

window.launchGradio = (config: Config, element_query: string) => {
	let target: HTMLElement = document.querySelector(element_query)!;

	if (!target) {
		throw new Error(
			"The target element could not be found. Please ensure that element exists."
		);
	}

	if (config.root === undefined) {
		config.root = BACKEND_URL;
	}
	if (window.gradio_mode === "app") {
		config.static_src = ".";
	} else if (window.gradio_mode === "website") {
		config.static_src = "/gradio_static";
	} else {
		config.static_src = "https://gradio.s3-us-west-2.amazonaws.com/PIP_VERSION";
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
	} else {
		handle_darkmode(target);

		let session_hash = Math.random().toString(36).substring(2);
		config.fn = fn.bind(null, session_hash, config.root + "api/");

		new Blocks({
			target: target,
			props: config
		});
	}
};

function handle_darkmode(target: HTMLElement) {
	let url = new URL(window.location.toString());

	const color_mode: "light" | "dark" | "system" | null = url.searchParams.get(
		"__theme"
	) as "light" | "dark" | "system" | null;

	if (color_mode !== null) {
		if (color_mode === "dark") {
			target.classList.add("dark");
		} else if (color_mode === "system") {
			use_system_theme(target);
		}
		// light is default, so we don't need to do anything else
	} else if (url.searchParams.get("__dark-theme") === "true") {
		target.classList.add("dark");
	} else {
		use_system_theme(target);
	}
}

function use_system_theme(target: HTMLElement) {
	update_scheme();
	window
		?.matchMedia("(prefers-color-scheme: dark)")
		?.addEventListener("change", update_scheme);

	function update_scheme() {
		const is_dark =
			window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

		target.classList[is_dark ? "add" : "remove"]("dark");
	}
}

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

if (window.gradio_mode == "app") {
	get_config().then((config) => {
		window.launchGradio(config, "#root");
	});
}

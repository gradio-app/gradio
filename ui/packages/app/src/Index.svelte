<script context="module" lang="ts">
	import { fn } from "./api";

	import type {
		ComponentMeta,
		Dependency,
		LayoutNode
	} from "./components/types";

	declare let BACKEND_URL: string;
	declare let BUILD_MODE: string;
	// declare let GRADIO_VERSION: string;
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

	let id = -1;
	let css_mounted = false;
</script>

<script lang="ts">
	import { onMount } from "svelte";

	import Embed from "./Embed.svelte";
	import Login from "./Login.svelte";
	// import Blocks from "./Blocks.svelte";
	import { Component as Loader } from "./components/StatusTracker";

	export let config: any;
	export let autoscroll: boolean;
	export let version: string;
	export let initial_height: string = "300px";
	export let app_mode: boolean;
	export let is_embed: boolean;
	export let theme: "light" | "dark" = "light";
	export let control_page_title: boolean;

	export let space: string | null;
	export let host: string | null;
	export let src: string | null;
	// export let;

	id = id + 1;

	let status: "pending" | "error" | "success" | "login" = "pending";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready: boolean = false;
	let root: string;

	async function handle_config(target: HTMLElement, source: string | null) {
		let config;

		try {
			let _config = await get_config(source);
			config = _config;
		} catch (e) {
			console.error(e);
			return null;
		}

		mount_custom_css(target, config.css);
		window.__is_colab__ = config.is_colab;

		if (root === undefined) {
			root = BACKEND_URL;
		}

		if (config.dev_mode) {
			reload_check(root);
		}

		return config;
	}

	async function get_config(source: string | null) {
		if (BUILD_MODE === "dev" || location.origin === "http://localhost:9876") {
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

	async function get_source_config(source: string): Promise<Config> {
		let config = await (await fetch(source + "config")).json();
		root = source;
		return config;
	}

	function mount_custom_css(target: HTMLElement, css_string?: string) {
		if (css_string) {
			let style = document.createElement("style");
			style.innerHTML = css_string;
			target.appendChild(style);
		}
	}

	async function reload_check(root: string) {
		const result = await (await fetch(root + "app_id")).text();

		if (app_id === null) {
			app_id = result;
		} else if (app_id != result) {
			location.reload();
		}

		setTimeout(() => reload_check(root), 250);
	}

	function handle_darkmode(target: HTMLDivElement): "light" | "dark" {
		let url = new URL(window.location.toString());
		let theme: "light" | "dark" = "light";

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

	function use_system_theme(target: HTMLDivElement): "light" | "dark" {
		const theme = update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme() {
			let theme: "light" | "dark" = "light";
			const is_dark =
				window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

			if (is_dark) {
				theme = darkmode(target);
			}
			return theme;
		}
		return theme;
	}

	function darkmode(target: HTMLDivElement): "dark" {
		target.classList.add("dark");
		if (app_mode) {
			document.body.style.backgroundColor = "rgb(11, 15, 25)"; // bg-gray-950 for scrolling outside the body
		}
		return "dark";
	}

	async function check_space_status(space_id: string) {
		let response;
		try {
			response = await (
				await fetch(`https://huggingface.co/api/spaces/${space_id}`)
			).json();
		} catch {}

		const {
			runtime: { stage }
		} = response;

		switch (stage) {
			case "STOPPED":
			case "SLEEPING":
				console.log("space is sleeping, waking up");
			// poll for status
			case "RUNNING":
				console.log("Space is running");
				//  launch
				break;
			case "RUNNING_BUILDING":
			case "BUILDING":
				console.log("space is building");
				// poll for status
				break;
			case "NO_APP_FILE":
			case "CONFIG_ERROR":
			case "BUILD_ERROR":
			case "RUNTIME_ERROR":
				console.log("space is broken, contact author");
				// launch error screen
				break;
		}

		// (NO_APP_FILE = "NO_APP_FILE"),
		// 	(CONFIG_ERROR = "CONFIG_ERROR"),
		// 	(BUILDING = "BUILDING"),
		// 	(BUILD_ERROR = "BUILD_ERROR"),
		// 	// RUNNING = "RUNNING",
		// 	// RUNNING_BUILDING = "RUNNING_BUILDING",
		// 	(RUNTIME_ERROR = "RUNTIME_ERROR"),
		// 	(DELETING = "DELETING"),
		// 	(STOPPED = "STOPPED"),
		console.log({ response });
	}

	const session_hash = Math.random().toString(36).substring(2);

	let error_detail: null | {
		type: "not_found" | "space_error";
		detail?: Record<string, any>;
	} = null;

	onMount(async () => {
		if (window.__gradio_mode__ !== "website") {
			theme = handle_darkmode(wrapper);
		}

		const source = host
			? `https://${host}`
			: space
			? await (
					await fetch(`https://huggingface.co/api/spaces/${space}/host`)
			  ).json().host
			: src;

		const _config: Config | null = await handle_config(wrapper, source);

		if (_config) {
			status = _config.auth_required ? "login" : "pending";
			console.log(session_hash, root + "run/", _config.is_space, is_embed);
			_config.fn = _config.fn = fn(
				session_hash,
				root + "run/",
				_config.is_space,
				is_embed
			);
			config = _config;
		} else {
			status = "error";
			error_detail = {
				type: "not_found"
			};
		}
		// check_space_status(space);

		// if (space) -> get metadata + update status
		// get config -> render
	});

	$: status = ready ? "success" : status;

  let Blocks;
  let Login;

  async function get_blocks() {

    Blocks = (await import('./Blocks.svelte')).default
    console.log(Blocks)
  }
  async function get_login() {

Login = (await import('./Login.svelte')).default
console.log(Login)
}
  // get_blocks()
</script>

<!-- this.wrapper = document.createElement("div");
			this.wrapper.classList.add("gradio-container");
			this.wrapper.classList.add(`gradio-container-${GRADIO_VERSION}`);
			this.wrapper.style.position = "relative";
			this.wrapper.style.width = "100%";
			this.wrapper.style.minHeight = "100vh"; -->
<Embed display={true} {version} bind:wrapper>
	{#if status === "pending"}
		<Loader
			status={"pending"}
			timer={false}
			queue_position={null}
			queue_size={null}
			status_text={"loading"}
		/>
	{:else if status === "error"}
		<p>problems...</p>
	{:else if status === "login" && Login}
		<Login
			auth_message={config.auth_message}
			root={config.root}
			is_space={config.is_space}
			{id}
			{app_mode}
		/>
	{/if}
	{#if config && Blocks}
		<Blocks
			{...config}
			{theme}
			{control_page_title}
			target={wrapper}
			{autoscroll}
			bind:ready
			show_footer={false}
		/>
	{/if}
</Embed>

<style>
	div {
		position: relative;
		width: 100%;
	}
</style>

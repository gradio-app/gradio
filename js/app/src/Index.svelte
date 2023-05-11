<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { mount_css } from "./css";

	import type {
		ComponentMeta,
		Dependency,
		LayoutNode
	} from "./components/types";

	declare let BUILD_MODE: string;
	interface Config {
		auth_required: boolean | undefined;
		auth_message: string;
		components: ComponentMeta[];
		css: string | null;
		dependencies: Dependency[];
		dev_mode: boolean;
		enable_queue: boolean;
		layout: LayoutNode;
		mode: "blocks" | "interface";
		root: string;
		theme: string;
		title: string;
		version: string;
		is_space: boolean;
		is_colab: boolean;
		show_api: boolean;
		stylesheets?: string[];
	}

	let id = -1;

	function create_intersection_store() {
		const intersecting = writable<Record<string, boolean>>({});

		const els = new Map<HTMLDivElement, number>();

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					let _el: number | undefined = els.get(entry.target as HTMLDivElement);
					if (_el !== undefined)
						intersecting.update((s) => ({ ...s, [_el as number]: true }));
				}
			});
		});

		function register(id: number, el: HTMLDivElement) {
			els.set(el, id);
			observer.observe(el);
		}

		return { register, subscribe: intersecting.subscribe };
	}

	const intersecting = create_intersection_store();
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { client, SpaceStatus } from "@gradio/client";
	import { wasmClient } from "@gradio/wasm";

	import Embed from "./Embed.svelte";
	import type { ThemeMode } from "./components/types";
	import { Component as Loader } from "./components/StatusTracker";

	export let autoscroll: boolean;
	export let version: string;
	export let initial_height: string;
	export let app_mode: boolean;
	export let is_embed: boolean;
	export let theme_mode: ThemeMode | null = "system";
	export let control_page_title: boolean;
	export let container: boolean;
	export let info: boolean;
	export let eager: boolean;

	export let space: string | null;
	export let host: string | null;
	export let src: string | null;

	let _id = id++;

	let loader_status: "pending" | "error" | "complete" | "generating" =
		"pending";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready: boolean = false;
	let config: Config;
	let loading_text: string = "Loading...";
	let active_theme_mode: ThemeMode;

	async function mount_custom_css(
		target: HTMLElement,
		css_string: string | null
	) {
		if (css_string) {
			let style = document.createElement("style");
			style.innerHTML = css_string;
			target.appendChild(style);
		}
		await mount_css(config.root + "/theme.css", document.head);
		if (!config.stylesheets) return;

		await Promise.all(
			config.stylesheets.map((stylesheet) => {
				let absolute_link =
					stylesheet.startsWith("http:") || stylesheet.startsWith("https:");
				return mount_css(
					absolute_link ? stylesheet : config.root + "/" + stylesheet,
					document.head
				);
			})
		);
	}

	async function reload_check(root: string) {
		const result = await (await fetch(root + "/app_id")).text();

		if (app_id === null) {
			app_id = result;
		} else if (app_id != result) {
			location.reload();
		}

		setTimeout(() => reload_check(root), 250);
	}

	function handle_darkmode(target: HTMLDivElement): "light" | "dark" {
		let url = new URL(window.location.toString());
		let url_color_mode: ThemeMode | null = url.searchParams.get(
			"__theme"
		) as ThemeMode | null;
		active_theme_mode = theme_mode || url_color_mode || "system";

		if (active_theme_mode === "dark" || active_theme_mode === "light") {
			darkmode(target, active_theme_mode);
		} else {
			active_theme_mode = use_system_theme(target);
		}
		return active_theme_mode;
	}

	function use_system_theme(target: HTMLDivElement): "light" | "dark" {
		const theme = update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme() {
			let theme: "light" | "dark" = window?.matchMedia?.(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";

			darkmode(target, theme);
			return theme;
		}
		return theme;
	}

	function darkmode(target: HTMLDivElement, theme: "dark" | "light") {
		const dark_class_element = is_embed ? target.parentElement! : document.body;
		const bg_element = is_embed ? target : target.parentElement!;
		bg_element.style.background = "var(--body-background-fill)";
		if (theme === "dark") {
			dark_class_element.classList.add("dark");
		} else {
			dark_class_element.classList.remove("dark");
		}
	}

	let status: SpaceStatus = {
		message: "",
		load_status: "pending",
		status: "sleeping",
		detail: "SLEEPING"
	};

	let app: Awaited<ReturnType<typeof client>>;
	let css_ready = false;
	function handle_status(_status: SpaceStatus) {
		status = _status;
	}
	onMount(async () => {
		if (window.__gradio_mode__ !== "website") {
			active_theme_mode = handle_darkmode(wrapper);
		}

		const api_url =
			BUILD_MODE === "dev"
				? "http://localhost:7860"
				: host || space || src || location.origin;

		app = await client(api_url, {
			status_callback: handle_status,
			normalise_files: false
		});
		config = app.config;

		wasmClient();

		status = {
			message: "",
			load_status: "complete",
			status: "running",
			detail: "RUNNING"
		};

		await mount_custom_css(wrapper, config.css);
		css_ready = true;
		window.__is_colab__ = config.is_colab;

		if (config.dev_mode) {
			reload_check(config.root);
		}
	});

	$: loader_status =
		!ready && status.load_status !== "error"
			? "pending"
			: !ready && status.load_status === "error"
			? "error"
			: status.load_status;

	$: config && (eager || $intersecting[_id]) && load_demo();

	let Blocks: typeof import("./Blocks.svelte").default;
	let Login: typeof import("./Login.svelte").default;

	async function get_blocks() {
		Blocks = (await import("./Blocks.svelte")).default;
	}
	async function get_login() {
		Login = (await import("./Login.svelte")).default;
	}

	function load_demo() {
		if (config.auth_required) get_login();
		else get_blocks();
	}

	type error_types =
		| "NO_APP_FILE"
		| "CONFIG_ERROR"
		| "BUILD_ERROR"
		| "RUNTIME_ERROR";

	const discussion_message = {
		readable_error: {
			NO_APP_FILE: "no app file",
			CONFIG_ERROR: "a config error",
			BUILD_ERROR: "a build error",
			RUNTIME_ERROR: "a runtime error"
		} as const,
		title(error: error_types) {
			return encodeURIComponent(
				`Space isn't working because there is ${
					this.readable_error[error] || "an error"
				}`
			);
		},
		description(error: error_types, site: string) {
			return encodeURIComponent(
				`Hello,\n\nFirstly, thanks for creating this space!\n\nI noticed that the space isn't working correctly because there is ${
					this.readable_error[error] || "an error"
				}.\n\nIt would be great if you could take a look at this because this space is being embedded on ${site}.\n\nThanks!`
			);
		}
	};

	onMount(async () => {
		intersecting.register(_id, wrapper);
	});
</script>

<Embed
	display={container && is_embed}
	{is_embed}
	info={!!space && info}
	{version}
	{initial_height}
	{space}
	loaded={loader_status === "complete"}
	bind:wrapper
>
	{#if (loader_status === "pending" || loader_status === "error") && !(config && config?.auth_required)}
		<Loader
			absolute={!is_embed}
			status={loader_status}
			timer={false}
			queue_position={null}
			queue_size={null}
			translucent={true}
			{loading_text}
		>
			<div class="error" slot="error">
				<p><strong>{status?.message || ""}</strong></p>
				{#if status.status === "space_error" && status.discussions_enabled}
					<p>
						Please <a
							href="https://huggingface.co/spaces/{space}/discussions/new?title={discussion_message.title(
								status?.detail
							)}&description={discussion_message.description(
								status?.detail,
								location.origin
							)}"
						>
							contact the author of the space</a
						> to let them know.
					</p>
				{:else}
					<p>Please contact the author of the page to let them know.</p>
				{/if}
			</div>
		</Loader>
	{/if}
	{#if config?.auth_required && Login}
		<Login
			auth_message={config.auth_message}
			root={config.root}
			is_space={config.is_space}
			{app_mode}
		/>
	{:else if config && Blocks && css_ready}
		<Blocks
			{app}
			{...config}
			theme_mode={active_theme_mode}
			{control_page_title}
			target={wrapper}
			{autoscroll}
			bind:ready
			show_footer={!is_embed}
			{app_mode}
		/>
	{/if}
</Embed>

<style>
	.error {
		position: relative;
		padding: var(--size-4);
		color: var(--body-text-color);
		text-align: center;
	}

	.error > * {
		margin-top: var(--size-4);
	}

	a {
		color: var(--link-text-color);
	}

	a:hover {
		color: var(--link-text-color-hover);
		text-decoration: underline;
	}

	a:visited {
		color: var(--link-text-color-visited);
	}

	a:active {
		color: var(--link-text-color-active);
	}
</style>

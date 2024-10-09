<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { mount_css } from "@gradio/core";

	import type { Client as ClientType } from "@gradio/client";

	import type { ComponentMeta, Dependency, LayoutNode } from "@gradio/core";
	declare let GRADIO_VERSION: string;

	declare let BUILD_MODE: string;
	interface Config {
		auth_required?: true;
		auth_message: string;
		components: ComponentMeta[];
		css: string | null;
		js: string | null;
		head: string | null;
		dependencies: Dependency[];
		dev_mode: boolean;
		enable_queue: boolean;
		layout: LayoutNode;
		mode: "blocks" | "interface";
		root: string;
		theme: string;
		title: string;
		version: string;
		space_id: string | null;
		is_colab: boolean;
		show_api: boolean;
		stylesheets?: string[];
		path: string;
		app_id?: string;
		fill_height?: boolean;
		fill_width?: boolean;
		theme_hash?: number;
		username: string | null;
	}

	let id = -1;

	function create_intersection_store(): {
		register: (n: number, el: HTMLDivElement) => void;
		subscribe: (typeof intersecting)["subscribe"];
	} {
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

		function register(_id: number, el: HTMLDivElement): void {
			els.set(el, _id);
			observer.observe(el);
		}

		return { register, subscribe: intersecting.subscribe };
	}
</script>

<script lang="ts">
	import { onMount, createEventDispatcher, onDestroy } from "svelte";
	import type { SpaceStatus } from "@gradio/client";
	import { Embed } from "@gradio/core";
	import type { ThemeMode } from "@gradio/core";
	import { StatusTracker } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "@gradio/core";
	import { Client } from "@gradio/client";
	import { page } from "$app/stores";

	import { init } from "@huggingface/space-header";
	import { browser } from "$app/environment";

	setupi18n();

	const dispatch = createEventDispatcher();
	export let data;

	export let autoscroll = false;
	export let version = GRADIO_VERSION;
	export let initial_height: string;
	export let app_mode = true;
	export let is_embed = false;
	export let theme_mode: ThemeMode | null = "system";
	export let control_page_title = true;
	export let container: boolean;
	let stream: EventSource;

	// These utilities are exported to be injectable for the Wasm version.

	// export let Client: typeof ClientType;

	export let space: string | null;
	// export let host: string | null;
	// export let src: string | null;

	let _id = id++;

	let loader_status: "pending" | "error" | "complete" | "generating" =
		"complete";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready = false;
	let render_complete = false;
	$: config = data.config;
	let loading_text = $_("common.loading") + "...";
	let active_theme_mode: ThemeMode;
	let intersecting: ReturnType<typeof create_intersection_store> = {
		register: () => {},
		subscribe: writable({}).subscribe
	};

	$: if (config?.app_id) {
		app_id = config.app_id;
	}

	let status: SpaceStatus = {
		message: "",
		load_status: "pending",
		status: "sleeping",
		detail: "SLEEPING"
	};

	let app: ClientType = data.app;
	let css_ready = false;
	function handle_status(_status: SpaceStatus): void {
		status = _status;
	}
	//@ts-ignore

	let gradio_dev_mode = "";

	onMount(async () => {
		active_theme_mode = handle_theme_mode(wrapper);

		//@ts-ignore
		config = data.config;
		window.gradio_config = config;
		window.gradio_config = data.config;
		config = data.config;

		if (!app.config) {
			throw new Error("Could not resolve app config");
		}

		window.__gradio_space__ = config.space_id;
		gradio_dev_mode = window?.__GRADIO_DEV__;

		status = {
			message: "",
			load_status: "complete",
			status: "running",
			detail: "RUNNING"
		};

		css_ready = true;
		window.__is_colab__ = config.is_colab;

		dispatch("loaded");

		if (config.dev_mode) {
			setTimeout(() => {
				const { host } = new URL(data.api_url);
				let url = new URL(`http://${host}${app.api_prefix}/dev/reload`);
				stream = new EventSource(url);
				stream.addEventListener("error", async (e) => {
					new_message_fn("Error reloading app", "error");
					// @ts-ignore
					console.error(JSON.parse(e.data));
				});
				stream.addEventListener("reload", async (event) => {
					app.close();
					app = await Client.connect(data.api_url, {
						status_callback: handle_status,
						with_null_state: true,
						events: ["data", "log", "status", "render"]
					});

					if (!app.config) {
						throw new Error("Could not resolve app config");
					}

					config = app.config;
					window.__gradio_space__ = config.space_id;
				});
			}, 200);
		}
	});

	let new_message_fn: (message: string, type: string) => void;

	onMount(async () => {
		intersecting = create_intersection_store();
		intersecting.register(_id, wrapper);
	});

	$: if (render_complete) {
		wrapper.dispatchEvent(
			new CustomEvent("render", {
				bubbles: true,
				cancelable: false,
				composed: true
			})
		);
	}

	$: app?.config &&
		browser &&
		mount_space_header(app?.config?.space_id, is_embed);
	let spaceheader: HTMLElement | undefined;

	async function mount_space_header(
		space_id: string | null | undefined,
		is_embed: boolean
	): Promise<void> {
		if (space_id && !is_embed && window.self === window.top) {
			if (spaceheader) {
				spaceheader.remove();
				spaceheader = undefined;
			}
			const header = await init(space_id);
			if (header) spaceheader = header.element;
		}
	}

	onDestroy(() => {
		spaceheader?.remove();
	});

	function handle_theme_mode(target: HTMLDivElement): "light" | "dark" {
		let new_theme_mode: ThemeMode;

		const url = new URL(window.location.toString());
		const url_color_mode: ThemeMode | null = url.searchParams.get(
			"__theme"
		) as ThemeMode | null;
		new_theme_mode = theme_mode || url_color_mode || "system";

		if (new_theme_mode === "dark" || new_theme_mode === "light") {
			apply_theme(target, new_theme_mode);
		} else {
			new_theme_mode = sync_system_theme(target);
		}
		return new_theme_mode;
	}

	function sync_system_theme(target: HTMLDivElement): "light" | "dark" {
		const theme = update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme(): "light" | "dark" {
			let _theme: "light" | "dark" = window?.matchMedia?.(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";

			apply_theme(target, _theme);
			return _theme;
		}
		return theme;
	}

	function apply_theme(target: HTMLDivElement, theme: "dark" | "light"): void {
		const dark_class_element = is_embed ? target.parentElement! : document.body;
		const bg_element = is_embed ? target : target.parentElement!;
		bg_element.style.background = "var(--body-background-fill)";
		if (theme === "dark") {
			dark_class_element.classList.add("dark");
		} else {
			dark_class_element.classList.remove("dark");
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={"./theme.css?v=" + config?.theme_hash} />

	{#if config.head}
		{@html config.head}
	{/if}
</svelte:head>

<Embed
	display={container && is_embed}
	{is_embed}
	info={false}
	{version}
	{initial_height}
	{space}
	loaded={loader_status === "complete"}
	fill_width={config?.fill_width || false}
	bind:wrapper
>
	{#if config?.auth_required}
		<svelte:component
			this={data.Render}
			auth_message={config.auth_message}
			root={config.root}
			space_id={space}
			{app_mode}
		/>
	{:else if config && app}
		<svelte:component
			this={data.Render}
			{app}
			{...config}
			fill_height={!is_embed && config.fill_height}
			theme_mode={active_theme_mode}
			{control_page_title}
			target={wrapper}
			{autoscroll}
			bind:ready
			bind:render_complete
			bind:add_new_message={new_message_fn}
			show_footer={!is_embed}
			{app_mode}
			{version}
			search_params={$page.url.searchParams}
			initial_layout={data.layout}
		/>
	{/if}
</Embed>

<!-- <style>
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
</style> -->

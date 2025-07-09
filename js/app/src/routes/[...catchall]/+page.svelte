<script context="module" lang="ts">
	import { writable } from "svelte/store";

	import type { Client as ClientType } from "@gradio/client";

	import type { ComponentMeta, Dependency, LayoutNode } from "@gradio/core";
	declare let GRADIO_VERSION: string;

	interface Config {
		deep_link_state?: "none" | "valid" | "invalid";
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
		app_id?: string;
		fill_height?: boolean;
		fill_width?: boolean;
		theme_hash?: number;
		username: string | null;
		pages: [string, string][];
		current_page: string;
		page: Record<
			string,
			{
				components: number[];
				dependencies: number[];
				layout: any;
			}
		>;
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
	import { _ } from "svelte-i18n";
	import { Client } from "@gradio/client";
	import { page } from "$app/stores";

	import { init } from "@huggingface/space-header";
	import { browser } from "$app/environment";

	const dispatch = createEventDispatcher();
	export let data;

	export let autoscroll = false;
	export let version = GRADIO_VERSION;
	export let initial_height: string;
	export let app_mode = true;
	export let is_embed = false;
	export let theme_mode: ThemeMode | null = null;
	export let control_page_title = true;
	export let container: boolean;
	let stream: EventSource;

	function handle_theme_mode(target: HTMLElement): "light" | "dark" {
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

	function sync_system_theme(target: HTMLElement): "light" | "dark" {
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

	function apply_theme(target: HTMLElement, theme: "dark" | "light"): void {
		const dark_class_element = is_embed ? target.parentElement! : document.body;
		const bg_element = is_embed ? target : target.parentElement!;
		bg_element.style.background = "var(--body-background-fill)";
		dark_class_element.classList.add("theme-loaded");
		if (theme === "dark") {
			dark_class_element.classList.add("dark");
		} else {
			dark_class_element.classList.remove("dark");
		}
	}

	let active_theme_mode: ThemeMode;

	if (browser) {
		active_theme_mode = handle_theme_mode(document.body);
	}

	async function add_custom_html_head(
		head_string: string | null
	): Promise<void> {
		if (head_string) {
			const parser = new DOMParser();
			const parsed_head_html = Array.from(
				parser.parseFromString(head_string, "text/html").head.children
			);

			if (parsed_head_html) {
				for (let head_element of parsed_head_html) {
					let newElement = document.createElement(head_element.tagName);
					Array.from(head_element.attributes).forEach((attr) => {
						newElement.setAttribute(attr.name, attr.value);
					});
					newElement.textContent = head_element.textContent;

					if (newElement.tagName == "META") {
						const propertyAttr = newElement.getAttribute("property");
						const nameAttr = newElement.getAttribute("name");

						if (propertyAttr || nameAttr) {
							const domMetaList = Array.from(
								document.head.getElementsByTagName("meta") ?? []
							);

							const matched = domMetaList.find((el) => {
								if (
									propertyAttr &&
									el.getAttribute("property") === propertyAttr
								) {
									return !el.isEqualNode(newElement);
								}
								if (nameAttr && el.getAttribute("name") === nameAttr) {
									return !el.isEqualNode(newElement);
								}
								return false;
							});

							if (matched) {
								document.head.replaceChild(newElement, matched);
								continue;
							}
						}
					}
					document.head.appendChild(newElement);
				}
			}
		}
	}

	export let space: string | null;
	let _id = id++;

	let loader_status: "pending" | "error" | "complete" | "generating" =
		"complete";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready = false;
	let render_complete = false;
	$: config = data.config;

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
	let pending_deep_link_error = false;

	let gradio_dev_mode = "";
	let i18n_ready: boolean;
	onMount(async () => {
		//@ts-ignore
		config = data.config;
		window.gradio_config = config;
		window.gradio_config = data.config;
		config = data.config;

		if (config.deep_link_state === "invalid") {
			pending_deep_link_error = true;
		}

		if (!app.config) {
			throw new Error("Could not resolve app config");
		}

		window.__gradio_space__ = config.space_id;
		window.__gradio_session_hash__ = app.session_hash; // type: ignore
		gradio_dev_mode = window?.__GRADIO_DEV__;

		status = {
			message: "",
			load_status: "complete",
			status: "running",
			detail: "RUNNING"
		};

		css_ready = true;
		window.__is_colab__ = config.is_colab;

		await add_custom_html_head(config.head);

		const supports_zerogpu_headers = "supports-zerogpu-headers";
		window.addEventListener("message", (event) => {
			if (event.data === supports_zerogpu_headers) {
				window.supports_zerogpu_headers = true;
			}
		});
		const hostname = window.location.hostname;
		const origin = hostname.includes(".dev.")
			? `https://moon-${hostname.split(".")[1]}.dev.spaces.huggingface.tech`
			: `https://huggingface.co`;
		window.parent.postMessage(supports_zerogpu_headers, origin);

		dispatch("loaded");
		if (config.dev_mode) {
			setTimeout(() => {
				const { host } = new URL(data.api_url);
				let url = new URL(`http://${host}${app.api_prefix}/dev/reload`);
				stream = new EventSource(url);
				stream.addEventListener("error", async (e) => {
					new_message_fn("Error", "Error reloading app", "error");
					// @ts-ignore
					console.error(JSON.parse(e.data));
				});
				stream.addEventListener("reload", async (event) => {
					app.close();
					app = await Client.connect(
						data.api_url,
						{
							status_callback: handle_status,
							with_null_state: true,
							events: ["data", "log", "status", "render"]
						},
						app.session_hash
					);

					if (!app.config) {
						throw new Error("Could not resolve app config");
					}

					config = app.config;
					window.__gradio_space__ = config.space_id;
				});
			}, 200);
		}
	});

	let new_message_fn: (title: string, message: string, type: string) => void;

	$: if (new_message_fn && pending_deep_link_error) {
		new_message_fn("Error", "Deep link was not valid", "error");
		pending_deep_link_error = false;
	}

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
</script>

<svelte:head>
	<link rel="stylesheet" href={"./theme.css?v=" + config?.theme_hash} />
	{#if config?.stylesheets}
		{#each config.stylesheets as stylesheet}
			{#if stylesheet.startsWith("http:") || stylesheet.startsWith("https:")}
				<link rel="stylesheet" href={stylesheet} />
			{/if}
		{/each}
	{/if}
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<Embed
	display={container && is_embed}
	{is_embed}
	info={false}
	{version}
	{initial_height}
	{space}
	pages={config.pages}
	current_page={config.current_page}
	root={config.root}
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

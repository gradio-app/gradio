<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { mount_css as default_mount_css, prefix_css } from "@gradio/core";

	import type { Client as ClientType } from "@gradio/client";

	import type { ComponentMeta, Dependency, LayoutNode } from "@gradio/core";

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

	const intersecting = create_intersection_store();
</script>

<script lang="ts">
	import { onMount, createEventDispatcher, onDestroy } from "svelte";
	import type { SpaceStatus } from "@gradio/client";
	import { Embed } from "@gradio/core";
	import type { ThemeMode } from "@gradio/core";
	import { StatusTracker } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "@gradio/core";
	import type { WorkerProxy } from "@gradio/wasm";
	import { setWorkerProxyContext } from "@gradio/wasm/svelte";
	import { init } from "@huggingface/space-header";

	setupi18n();

	const dispatch = createEventDispatcher();

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
	let stream: EventSource;

	// These utilities are exported to be injectable for the Wasm version.
	export let mount_css: typeof default_mount_css = default_mount_css;
	export let Client: typeof ClientType;
	export let worker_proxy: WorkerProxy | undefined = undefined;
	if (worker_proxy) {
		setWorkerProxyContext(worker_proxy);

		worker_proxy.addEventListener("progress-update", (event) => {
			loading_text = (event as CustomEvent).detail + "...";
		});
	}

	export let space: string | null;
	export let host: string | null;
	export let src: string | null;

	let _id = id++;

	let loader_status: "pending" | "error" | "complete" | "generating" =
		"pending";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready = false;
	let render_complete = false;
	let config: Config;
	let loading_text = $_("common.loading") + "...";
	let active_theme_mode: ThemeMode;
	let api_url: string;

	$: if (config?.app_id) {
		app_id = config.app_id;
	}

	let css_text_stylesheet: HTMLStyleElement | null = null;
	async function mount_custom_css(css_string: string | null): Promise<void> {
		if (css_string) {
			css_text_stylesheet = prefix_css(
				css_string,
				version,
				css_text_stylesheet || undefined
			);
		}
		await mount_css(
			config.root + "/theme.css?v=" + config.theme_hash,
			document.head
		);
		if (!config.stylesheets) return;

		await Promise.all(
			config.stylesheets.map((stylesheet) => {
				let absolute_link =
					stylesheet.startsWith("http:") || stylesheet.startsWith("https:");
				if (absolute_link) {
					return mount_css(stylesheet, document.head);
				}

				return fetch(config.root + "/" + stylesheet)
					.then((response) => response.text())
					.then((css_string) => {
						prefix_css(css_string, version);
					});
			})
		);
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

					if (
						newElement.tagName == "META" &&
						newElement.getAttribute("property")
					) {
						const domMetaList = Array.from(
							document.head.getElementsByTagName("meta") ?? []
						);
						const matched = domMetaList.find((el) => {
							return (
								el.getAttribute("property") ==
									newElement.getAttribute("property") &&
								!el.isEqualNode(newElement)
							);
						});
						if (matched) {
							document.head.replaceChild(newElement, matched);
							continue;
						}
					}

					document.head.appendChild(newElement);
				}
			}
		}
	}

	function handle_theme_mode(target: HTMLDivElement): "light" | "dark" {
		const force_light = window.__gradio_mode__ === "website";

		let new_theme_mode: ThemeMode;
		if (force_light) {
			new_theme_mode = "light";
		} else {
			const url = new URL(window.location.toString());
			const url_color_mode: ThemeMode | null = url.searchParams.get(
				"__theme"
			) as ThemeMode | null;
			new_theme_mode = theme_mode || url_color_mode || "system";
		}

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

	let status: SpaceStatus = {
		message: "",
		load_status: "pending",
		status: "sleeping",
		detail: "SLEEPING"
	};

	let app: ClientType;
	let css_ready = false;
	function handle_status(_status: SpaceStatus): void {
		status = _status;
	}
	//@ts-ignore
	const gradio_dev_mode = window.__GRADIO_DEV__;

	onMount(async () => {
		active_theme_mode = handle_theme_mode(wrapper);

		//@ts-ignore
		const server_port = window.__GRADIO__SERVER_PORT__;

		api_url =
			BUILD_MODE === "dev" || gradio_dev_mode === "dev"
				? `http://localhost:${
						typeof server_port === "number" ? server_port : 7860
					}`
				: host || space || src || location.origin;

		app = await Client.connect(api_url, {
			status_callback: handle_status,
			with_null_state: true,
			events: ["data", "log", "status", "render"]
		});

		if (!app.config) {
			throw new Error("Could not resolve app config");
		}

		config = app.config;
		window.__gradio_space__ = config.space_id;

		status = {
			message: "",
			load_status: "complete",
			status: "running",
			detail: "RUNNING"
		};

		await mount_custom_css(config.css);
		await add_custom_html_head(config.head);
		css_ready = true;
		window.__is_colab__ = config.is_colab;

		dispatch("loaded");

		if (config.dev_mode) {
			setTimeout(() => {
				const { host } = new URL(api_url);
				let url = new URL(`http://${host}/dev/reload`);
				stream = new EventSource(url);
				stream.addEventListener("error", async (e) => {
					new_message_fn("Error reloading app", "error");
					// @ts-ignore
					console.error(JSON.parse(e.data));
				});
				stream.addEventListener("reload", async (event) => {
					app.close();
					app = await Client.connect(api_url, {
						status_callback: handle_status,
						with_null_state: true,
						events: ["data", "log", "status", "render"]
					});

					if (!app.config) {
						throw new Error("Could not resolve app config");
					}

					config = app.config;
					window.__gradio_space__ = config.space_id;
					await mount_custom_css(config.css);
				});
			}, 200);
		}
	});

	$: loader_status =
		!ready && status.load_status !== "error"
			? "pending"
			: !ready && status.load_status === "error"
				? "error"
				: status.load_status;

	$: config && (eager || $intersecting[_id]) && load_demo();

	let Blocks: typeof import("@gradio/core/blocks").default;

	let Login: typeof import("@gradio/core/login").default;

	async function get_blocks(): Promise<void> {
		Blocks = (await import("@gradio/core/blocks")).default;
	}
	async function get_login(): Promise<void> {
		Login = (await import("@gradio/core/login")).default;
	}

	function load_demo(): void {
		if (config.auth_required) get_login();
		else get_blocks();
	}

	type error_types =
		| "NO_APP_FILE"
		| "CONFIG_ERROR"
		| "BUILD_ERROR"
		| "RUNTIME_ERROR"
		| "PAUSED";

	// todo @hannahblair: translate these messages
	const discussion_message = {
		readable_error: {
			NO_APP_FILE: $_("errors.no_app_file"),
			CONFIG_ERROR: $_("errors.config_error"),
			BUILD_ERROR: $_("errors.build_error"),
			RUNTIME_ERROR: $_("errors.runtime_error"),
			PAUSED: $_("errors.space_paused")
		} as const,
		title(error: error_types): string {
			return encodeURIComponent($_("errors.space_not_working"));
		},
		description(error: error_types, site: string): string {
			return encodeURIComponent(
				`Hello,\n\nFirstly, thanks for creating this space!\n\nI noticed that the space isn't working correctly because there is ${
					this.readable_error[error] || "an error"
				}.\n\nIt would be great if you could take a look at this because this space is being embedded on ${site}.\n\nThanks!`
			);
		}
	};

	let new_message_fn: (message: string, type: string) => void;

	onMount(async () => {
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

	$: app?.config && mount_space_header(app?.config?.space_id, is_embed);
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

<Embed
	display={container && is_embed}
	{is_embed}
	info={!!space && info}
	{version}
	{initial_height}
	{space}
	loaded={loader_status === "complete"}
	fill_width={config?.fill_width || false}
	bind:wrapper
>
	{#if (loader_status === "pending" || loader_status === "error") && !(config && config?.auth_required)}
		<StatusTracker
			absolute={!is_embed}
			status={loader_status}
			timer={false}
			queue_position={null}
			queue_size={null}
			translucent={true}
			{loading_text}
			i18n={$_}
			{autoscroll}
		>
			<div class="load-text" slot="additional-loading-text">
				{#if gradio_dev_mode === "dev"}
					<p>
						If your custom component never loads, consult the troubleshooting <a
							style="color: blue;"
							href="https://www.gradio.app/guides/frequently-asked-questions#the-development-server-didnt-work-for-me"
							>guide</a
						>.
					</p>
				{/if}
			</div>
			<!-- todo: translate message text -->
			<div class="error" slot="error">
				<p><strong>{status?.message || ""}</strong></p>
				{#if (status.status === "space_error" || status.status === "paused") && status.discussions_enabled}
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
					<p>{$_("errors.contact_page_author")}</p>
				{/if}
			</div>
		</StatusTracker>
	{/if}
	{#if config?.auth_required && Login}
		<Login
			auth_message={config.auth_message}
			root={config.root}
			space_id={space}
			{app_mode}
		/>
	{:else if config && Blocks && css_ready}
		<Blocks
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

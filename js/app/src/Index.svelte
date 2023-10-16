<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { mount_css as default_mount_css } from "./css";

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
		space_id: string | null;
		is_colab: boolean;
		show_api: boolean;
		stylesheets?: string[];
		path: string;
		app_id?: string;
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
	import { onMount, setContext } from "svelte";
	import type { api_factory, SpaceStatus } from "@gradio/client";
	import Embed from "./Embed.svelte";
	import type { ThemeMode } from "./components/types";
	import { StatusTracker } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	import type { WorkerProxy } from "@gradio/wasm";
	import { setWorkerProxyContext } from "@gradio/wasm/svelte";

	setupi18n();

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
	let websocket: WebSocket;

	// These utilities are exported to be injectable for the Wasm version.
	export let mount_css: typeof default_mount_css = default_mount_css;
	export let client: ReturnType<typeof api_factory>["client"];
	export let upload_files: ReturnType<typeof api_factory>["upload_files"];
	export let worker_proxy: WorkerProxy | undefined = undefined;
	if (worker_proxy) {
		setWorkerProxyContext(worker_proxy);
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

	$: if (config?.app_id) {
		app_id = config.app_id;
	}

	async function mount_custom_css(
		target: HTMLElement,
		css_string: string | null
	): Promise<void> {
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

		function update_scheme(): "light" | "dark" {
			let _theme: "light" | "dark" = window?.matchMedia?.(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";

			darkmode(target, _theme);
			return _theme;
		}
		return theme;
	}

	function darkmode(target: HTMLDivElement, theme: "dark" | "light"): void {
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
	function handle_status(_status: SpaceStatus): void {
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
		window.__gradio_space__ = config.space_id;

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
			setTimeout(() => {
				const { host } = new URL(api_url);
				let url = new URL(`ws://${host}/dev/reload`);
				websocket = new WebSocket(url);
				websocket.onmessage = async function (event) {
					if (event.data === "CHANGE") {
						app = await client(api_url, {
							status_callback: handle_status,
							normalise_files: false
						});
						app.config.root = app.config.path;
						config = app.config;
						window.__gradio_space__ = config.space_id;
					}
				};
			}, 200);
		}
	});

	setContext("upload_files", upload_files);

	$: loader_status =
		!ready && status.load_status !== "error"
			? "pending"
			: !ready && status.load_status === "error"
			? "error"
			: status.load_status;

	$: config && (eager || $intersecting[_id]) && load_demo();

	let Blocks: typeof import("./Blocks.svelte").default;
	let Login: typeof import("./Login.svelte").default;

	async function get_blocks(): Promise<void> {
		Blocks = (await import("./Blocks.svelte")).default;
	}
	async function get_login(): Promise<void> {
		Login = (await import("./Login.svelte")).default;
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
		<StatusTracker
			absolute={!is_embed}
			status={loader_status}
			timer={false}
			queue_position={null}
			queue_size={null}
			translucent={true}
			{loading_text}
		>
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
			theme_mode={active_theme_mode}
			{control_page_title}
			target={wrapper}
			{autoscroll}
			bind:ready
			bind:render_complete
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

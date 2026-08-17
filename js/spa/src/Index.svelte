<script module lang="ts">
	import { writable } from "svelte/store";
	import {
		mount_css,
		prefix_css,
		resolve_current_origin_url
	} from "@gradio/core";

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
		footer_links: string[];
		stylesheets?: string[];
		app_id?: string;
		fill_height?: boolean;
		fill_width?: boolean;
		theme_hash?: number;
		username: string | null;
		api_prefix?: string;
		max_file_size?: number;
		pages: [string, string, boolean][];
		current_page: string;
		deep_link_state?: "valid" | "invalid" | "none";
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

	const intersecting = create_intersection_store();
</script>

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import {
		consume_run_history_replay,
		on_deliberate_exit,
		type SpaceStatus,
		type StoredRun
	} from "@gradio/client";
	import { Embed } from "@gradio/core";
	import type { ThemeMode } from "@gradio/core";
	import { StatusTracker } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "@gradio/core";
	import { init } from "@huggingface/space-header";
	import RunHistory from "./RunHistory.svelte";

	let i18n_ready = $state(false);
	setupi18n().then(() => {
		i18n_ready = true;
	});

	let {
		autoscroll,
		version,
		initial_height,
		app_mode,
		is_embed,
		theme_mode = "system",
		control_page_title,
		container,
		info,
		eager,
		// These utilities are exported to be injectable for the Wasm version.
		Client,
		space,
		src,
		onloaded
	}: {
		autoscroll: boolean;
		version: string;
		initial_height: string;
		app_mode: boolean;
		is_embed: boolean;
		theme_mode?: ThemeMode | null;
		control_page_title: boolean;
		container: boolean;
		info: boolean;
		eager: boolean;
		Client: typeof ClientType;
		space: string | null;
		src: string | null;
		onloaded?: () => void;
	} = $props();

	let stream: EventSource;
	let pages: [string, string, boolean][] = $state([]);
	let current_page: string = $state("");
	let root: string = $state("");

	let _id = id++;

	let app_id: string | null = null;
	let wrapper: HTMLDivElement | undefined = $state();
	let ready = $state(false);
	let render_complete = $state(false);
	let config: Config = $state()!;
	let loading_text = $state("Loading...");

	let active_theme_mode: ThemeMode = $state("system");
	let api_url = $state("");
	let run_history = $state(false);

	function restore_run(config: Config, run: StoredRun | null): void {
		if (!run) return;
		const dependency = config.dependencies.find(
			(item) =>
				item.id === run.fn_index ||
				(typeof item.api_name === "string" &&
					`/${item.api_name.replace(/^\//, "")}` === run.api_name)
		);
		if (!dependency) return;

		const inputs = Array.isArray(run.inputs)
			? run.inputs
			: Object.values(run.inputs as Record<string, unknown>);
		const outputs = Array.isArray(run.outputs)
			? run.outputs
			: run.outputs === null
				? []
				: [run.outputs];
		const restore = (ids: number[], saved: unknown[]): void => {
			for (const [index, id] of ids.entries()) {
				const component = config.components.find((item) => item.id === id);
				if (!component || index >= saved.length) continue;
				// `gr.State` is held on the server and always saved as null, so
				// writing it back would wipe out the component's real default.
				if (component.type === "state") continue;
				component.props.value = saved[index];
			}
		};

		restore(dependency.inputs, inputs);
		restore(dependency.outputs, outputs);
	}

	$effect(() => {
		if (config?.app_id) {
			app_id = config.app_id;
		}
	});

	let css_text_stylesheet: HTMLStyleElement | null = null;
	async function mount_custom_css(css_string: string | null): Promise<void> {
		if (css_string) {
			if (!css_text_stylesheet) {
				css_text_stylesheet = document.createElement("style");
				document.head.appendChild(css_text_stylesheet);
			}
			css_text_stylesheet.textContent = prefix_css(
				css_string,
				version,
				css_text_stylesheet
			);
		}
		await mount_css(
			resolve_current_origin_url(
				config.root,
				`/theme.css?v=${config.theme_hash}`
			).toString(),
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

				return fetch(
					resolve_current_origin_url(config.root, stylesheet).toString()
				)
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
					if (newElement.tagName === "SCRIPT") {
						// Created scripts default to force-async; restore document order
						// (an explicit `async` attribute is re-applied just below).
						(newElement as HTMLScriptElement).async = false;
					}
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

	let status: SpaceStatus = $state({
		message: "",
		load_status: "pending",
		status: "sleeping",
		detail: "SLEEPING"
	});

	let app: ClientType = $state()!;
	let css_ready = $state(false);
	function handle_status(_status: SpaceStatus): void {
		status = _status;
	}
	//@ts-ignore
	const gradio_dev_mode = window.__GRADIO_DEV__;

	let pending_deep_link_error = $state(false);

	type AddNewMessage = (
		title: string,
		message: string,
		fn_index: number,
		type: "info" | "error" | "success" | "warning",
		duration?: number | null,
		visible?: boolean
	) => void;

	let new_message_fn: AddNewMessage = $state()!;

	$effect(() => {
		if (new_message_fn && pending_deep_link_error) {
			new_message_fn("Error", "Deep link was not valid", -1, "error", 10, true);
			pending_deep_link_error = false;
		}
	});

	let reload_count = $state(0);

	onMount(async () => {
		if (!wrapper) return;
		active_theme_mode = handle_theme_mode(wrapper);
		run_history = window.location.pathname
			.replace(/\/$/, "")
			.endsWith("/gradio_api/runs");

		//@ts-ignore
		const server_port = window.__GRADIO__SERVER_PORT__;

		const app_path = run_history
			? window.location.pathname.replace(/gradio_api\/runs\/?$/, "")
			: window.location.pathname;
		api_url =
			BUILD_MODE === "dev" || gradio_dev_mode === "dev"
				? `http://localhost:${
						typeof server_port === "number" ? server_port : 7860
					}`
				: space ||
					src ||
					new URL(app_path, location.origin).href.replace(/\/$/, "");

		const deep_link = new URLSearchParams(window.location.search).get(
			"deep_link"
		);
		const query_params: Record<string, string> = {};
		if (deep_link) {
			query_params.deep_link = deep_link;
		}
		app = await Client.connect(api_url, {
			status_callback: handle_status,
			with_null_state: true,
			events: ["data", "log", "status", "render"],
			query_params
		});
		on_deliberate_exit(() => app.close());

		if (!app.config && !config?.auth_required) {
			throw new Error("Could not resolve app config");
		}

		config = app.get_url_config() as unknown as Config;
		restore_run(config, consume_run_history_replay(config));
		window.__gradio_space__ = config.space_id;

		if (app.config?.i18n_translations) {
			await setupi18n(app.config.i18n_translations);
			i18n_ready = true;
		}
		//@ts-ignore
		window.__gradio_session_hash__ = app.session_hash;

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

		onloaded?.();

		pages = config.pages;
		current_page = config.current_page;
		root = config.root;
		if (config.deep_link_state === "invalid") {
			pending_deep_link_error = true;
		}
		if (config.js) {
			try {
				const script = document.createElement("script");
				script.textContent = config.js;
				document.head.appendChild(script);
			} catch (e) {
				console.error("Error executing custom JS:", e);
			}
		}
		if (config.dev_mode) {
			setTimeout(() => {
				const { host } = new URL(api_url);
				let url = new URL(
					`${window.location.protocol}//${host}${app.api_prefix}/dev/reload`
				);
				stream = new EventSource(url);
				stream.addEventListener("error", async (e) => {
					// @ts-ignore
					let event_data: string | undefined = e.data;
					if (event_data) {
						new_message_fn(
							"Error",
							"Error reloading app",
							-1,
							"error",
							10,
							true
						);
						console.error(JSON.parse(event_data));
					}
				});
				stream.addEventListener("reload", async (event) => {
					try {
						// Soft-reload: refresh config in place so in-flight SSE
						// streams (and generators) keep working across the reload.
						const refreshed_config = await app.refresh();
						await mount_custom_css(refreshed_config.css);
						await add_custom_html_head(refreshed_config.head);
						config = refreshed_config as unknown as Config;
						window.__gradio_space__ = config.space_id;
						css_ready = true;
						window.__is_colab__ = config.is_colab;
						reload_count += 1;
						onloaded?.();
					} catch (error) {
						new_message_fn(
							"Error",
							"Error reloading app",
							-1,
							"error",
							10,
							true
						);
						console.error("Error reloading app:", error);
					}
				});
			}, 200);
		}
	});

	let loader_status: "pending" | "error" | "complete" | "generating" = $derived(
		run_history
			? status.load_status
			: !ready && status.load_status !== "error"
				? "pending"
				: !ready && status.load_status === "error"
					? "error"
					: status.load_status
	);

	$effect(() => {
		if (config && (eager || $intersecting[_id])) load_demo();
	});

	let Blocks: typeof import("@gradio/core/blocks").default = $state()!;

	let Login: typeof import("@gradio/core/login").default = $state()!;

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
	let discussion_message: {
		readable_error: Record<error_types, string>;
		title: (error: error_types) => string;
		description: (error: error_types, site: string) => string;
	} = $state()!;

	$effect(() => {
		if (!i18n_ready) return;
		loading_text = $_("common.loading") + "...";
		discussion_message = {
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
	});

	onMount(async () => {
		if (wrapper) intersecting.register(_id, wrapper);
	});

	$effect(() => {
		if (render_complete && wrapper) {
			wrapper.dispatchEvent(
				new CustomEvent("render", {
					bubbles: true,
					cancelable: false,
					composed: true
				})
			);
		}
	});

	$effect(() => {
		if (app?.config) mount_space_header(app?.config?.space_id, is_embed);
	});
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
	{pages}
	{current_page}
	{root}
	components={config?.components || []}
	bind:wrapper
>
	{#if i18n_ready}
		{#if !run_history && (loader_status === "pending" || loader_status === "error") && !(config && config?.auth_required)}
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
				{#snippet additional_loading_text()}
					<div class="load-text">
						{#if gradio_dev_mode === "dev"}
							<p>
								If your custom component never loads, consult the
								troubleshooting <a
									style="color: blue;"
									href="https://www.gradio.app/guides/frequently-asked-questions#the-development-server-didnt-work-for-me"
									>guide</a
								>.
							</p>
						{/if}
					</div>
				{/snippet}
				<!-- todo: translate message text -->
				{#snippet error_details()}
					<div class="error">
						<p><strong>{status?.message || ""}</strong></p>
						{#if (status.status === "space_error" || status.status === "paused") && status.discussions_enabled && discussion_message}
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
						{:else if i18n_ready}
							<p>{$_("errors.contact_page_author")}</p>
						{/if}
					</div>
				{/snippet}
			</StatusTracker>
		{/if}
		{#if config?.auth_required && Login}
			<Login
				auth_message={config.auth_message}
				root={config.root}
				space_id={space}
				i18n={i18n_ready ? $_ : (s: string) => s}
				{app_mode}
			/>
		{:else if config && css_ready && run_history}
			<RunHistory
				root={api_url}
				scope={config}
				footer_links={config.footer_links}
			/>
		{:else if config && Blocks && css_ready}
			<Blocks
				{app}
				{...config}
				bind:ready
				fill_height={!is_embed && !!config.fill_height}
				theme_mode={active_theme_mode}
				{control_page_title}
				target={wrapper!}
				{autoscroll}
				bind:render_complete
				bind:add_new_message={new_message_fn}
				footer_links={is_embed ? [] : config.footer_links}
				{app_mode}
				vibe_mode={false}
				{version}
				api_prefix={config.api_prefix || ""}
				max_file_size={config.max_file_size}
				initial_layout={undefined}
				search_params={new URLSearchParams(window.location.search)}
				{reload_count}
			/>
		{/if}
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

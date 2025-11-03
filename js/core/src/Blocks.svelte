<script lang="ts">
	import { tick, onMount, setContext } from "svelte";
	import { _ } from "svelte-i18n";
	import { Client } from "@gradio/client";
	import { writable } from "svelte/store";

	// import type { LoadingStatus, LoadingStatusCollection } from "./stores";

	import type {
		ComponentMeta,
		Dependency as IDependency,
		LayoutNode
	} from "./types";
	// import type { UpdateTransaction } from "./_init";
	import { setupi18n } from "./i18n";
	import type { ThemeMode, Payload } from "./types";
	// import { Toast } from "@gradio/statustracker";
	// import type { ToastMessage } from "@gradio/statustracker";
	import { type ShareData, type ValueData, GRADIO_ROOT } from "@gradio/utils";

	import MountComponents from "./MountComponents.svelte";
	import { prefix_css } from "./css";
	import { reactive_formatter } from "./gradio_helper";

	// import type ApiDocsInterface from "./api_docs/ApiDocs.svelte";
	// import type ApiRecorderInterface from "./api_docs/ApiRecorder.svelte";
	// import type SettingsInterface from "./api_docs/Settings.svelte";
	// import type { ComponentType } from "svelte";

	import logo from "./images/logo.svg";
	import api_logo from "./api_docs/img/api-logo.svg";
	import settings_logo from "./api_docs/img/settings-logo.svg";
	import record_stop from "./api_docs/img/record-stop.svg";
	import { AsyncFunction } from "./init_utils";
	import { AppTree } from "./init.svelte";
	// import type {
	// 	LogMessage,
	// 	RenderMessage,
	// 	StatusMessage,
	// } from "@gradio/client";
	import * as screen_recorder from "./screen_recorder";

	import { DependencyManager } from "./dependency";

	export let root: string;
	export let components: ComponentMeta[];
	export let layout: LayoutNode;
	export let dependencies: IDependency[];
	export let title = "Gradio";
	export let target: HTMLElement;
	export let autoscroll: boolean;
	export let footer_links = ["gradio", "settings", "api"];
	export let control_page_title = false;
	export let app_mode: boolean;
	export let theme_mode: ThemeMode;
	export let app: Awaited<ReturnType<typeof Client.connect>>;
	export let space_id: string | null;
	export let version: string;
	export let js: string | null;
	export let fill_height = false;
	export let ready: boolean;
	export let username: string | null;
	export let api_prefix = "";
	export let max_file_size: number | undefined = undefined;
	export let initial_layout: ComponentMeta | undefined = undefined;
	export let css: string | null | undefined = null;
	export let vibe_mode = false;
	let broken_connection = false;

	components.forEach((comp) => {
		if (!comp.props.i18n) {
			comp.props.i18n = $reactive_formatter;
		}
	});

	let app_tree = new AppTree(
		components,
		layout,
		dependencies,
		{
			root,
			theme: theme_mode,
			version,
			api_prefix,
			max_file_size,
			autoscroll
		},
		app
	);
	app_tree.process();
	setContext(GRADIO_ROOT, {
		register: app_tree.register_component.bind(app_tree),
		dispatcher: gradio_event_dispatcher
	});

	function gradio_event_dispatcher(
		id: number,
		event: string,
		data: unknown
	): void {
		if (event === "share") {
			const { title, description } = data as ShareData;
			// trigger_share(title, description);
			// TODO: lets combine all of the into a log type with levels
		} else if (event === "error") {
			messages = [new_message("Error", data, -1, event), ...messages];
		} else if (event === "warning") {
			messages = [new_message("Warning", data, -1, event), ...messages];
		} else if (event === "info") {
			messages = [new_message("Info", data, -1, event), ...messages];
		} else if (event == "clear_status") {
			// TODO: the loading_status store should handle this via a method
			// update_status(id, "complete", data);
		} else if (event == "close_stream") {
			// TODO: this is for streaming webcam + audio, can they manage their own streams
			// the data streaming is orthogonal to the event, like files are
			//
			// const deps = $targets[id]?.[data];
			// deps?.forEach((dep_id) => {
			// 	if (submit_map.has(dep_id)) {
			// 		// @ts-ignore
			// 		const url = `${app.config.root + app.config.api_prefix}/stream/${submit_map.get(dep_id).event_id()}`;
			// 		app.post_data(`${url}/close`, {});
			// 		app.close_ws(url);
			// 	}
			// });
		} else {
			dep_manager.dispatch({
				type: "event",
				event_name: event,
				target_id: id,
				event_data: data
			});
		}
	}
	const dep_manager = new DependencyManager(
		dependencies,
		app,
		app_tree.update_state.bind(app_tree),
		app_tree.get_state.bind(app_tree),
		app_tree.rerender.bind(app_tree)
	);

	let old_dependencies = dependencies;
	$: if (
		dependencies !== old_dependencies &&
		render_complete &&
		!layout_creating
	) {
		// re-run load triggers in SSR mode when page changes
		handle_load_triggers();
		old_dependencies = dependencies;
	}

	let vibe_editor_width = 350;

	export let search_params: URLSearchParams;
	let api_docs_visible =
		search_params.get("view") === "api" && footer_links.includes("api");
	let settings_visible = search_params.get("view") === "settings";
	let api_recorder_visible =
		search_params.get("view") === "api-recorder" &&
		footer_links.includes("api");
	let allow_zoom = true;
	let allow_video_trim = true;

	// Lazy component loading state
	let ApiDocs: ComponentType<ApiDocsInterface> | null = null;
	let ApiRecorder: ComponentType<ApiRecorderInterface> | null = null;
	let Settings: ComponentType<SettingsInterface> | null = null;
	let VibeEditor: ComponentType | null = null;

	async function loadApiDocs(): Promise<void> {
		if (!ApiDocs || !ApiRecorder) {
			const api_docs_module = await import("./api_docs/ApiDocs.svelte");
			const api_recorder_module = await import("./api_docs/ApiRecorder.svelte");
			if (!ApiDocs) ApiDocs = api_docs_module.default;
			if (!ApiRecorder) ApiRecorder = api_recorder_module.default;
		}
	}

	async function loadApiRecorder(): Promise<void> {
		if (!ApiRecorder) {
			const api_recorder_module = await import("./api_docs/ApiRecorder.svelte");
			ApiRecorder = api_recorder_module.default;
		}
	}

	async function loadSettings(): Promise<void> {
		if (!Settings) {
			const settings_module = await import("./api_docs/Settings.svelte");
			Settings = settings_module.default;
		}
	}

	async function loadVibeEditor(): Promise<void> {
		if (!VibeEditor) {
			const vibe_editor_module = await import("@gradio/vibeeditor");
			VibeEditor = vibe_editor_module.default;
		}
	}

	async function set_api_docs_visible(visible: boolean): Promise<void> {
		api_recorder_visible = false;
		if (visible) {
			await loadApiDocs();
		}
		api_docs_visible = visible;
		let params = new URLSearchParams(window.location.search);
		if (visible) {
			params.set("view", "api");
		} else {
			params.delete("view");
		}
		history.replaceState(null, "", "?" + params.toString());
	}

	async function set_settings_visible(visible: boolean): Promise<void> {
		if (visible) {
			await loadSettings();
		}
		let params = new URLSearchParams(window.location.search);
		if (visible) {
			params.set("view", "settings");
		} else {
			params.delete("view");
		}
		history.replaceState(null, "", "?" + params.toString());
		settings_visible = !settings_visible;
	}

	let api_calls: Payload[] = [];

	let layout_creating = false;
	export let render_complete = false;

	let messages: (ToastMessage & { fn_index: number })[] = [];
	function new_message(
		title: string,
		message: string,
		fn_index: number,
		type: ToastMessage["type"],
		duration: number | null = 10,
		visible = true
	): ToastMessage & { fn_index: number } {
		return {
			title,
			message,
			fn_index,
			type,
			id: ++_error_id,
			duration,
			visible
		};
	}

	export function add_new_message(
		title: string,
		message: string,
		type: ToastMessage["type"]
	): void {
		messages = [new_message(title, message, -1, type), ...messages];
	}

	let _error_id = -1;

	const MESSAGE_QUOTE_RE = /^'([^]+)'$/;

	const DUPLICATE_MESSAGE = $_("blocks.long_requests_queue");
	const MOBILE_QUEUE_WARNING = $_("blocks.connection_can_break");
	const LOST_CONNECTION_MESSAGE =
		"Connection to the server was lost. Attempting reconnection...";
	const CHANGED_CONNECTION_MESSAGE =
		"Reconnected to server, but the server has changed. You may need to <a href=''>refresh the page</a>.";
	const RECONNECTION_MESSAGE = "Connection re-established.";
	const SESSION_NOT_FOUND_MESSAGE =
		"Session not found - this is likely because the machine you were connected to has changed. <a href=''>Refresh the page</a> to continue.";
	const WAITING_FOR_INPUTS_MESSAGE = $_("blocks.waiting_for_inputs");
	const SHOW_DUPLICATE_MESSAGE_ON_ETA = 15;
	const SHOW_MOBILE_QUEUE_WARNING_ON_ETA = 10;
	let is_mobile_device = false;
	let showed_duplicate_message = false;
	let showed_mobile_warning = false;
	let inputs_waiting: number[] = [];

	// as state updates are not synchronous, we need to ensure updates are flushed before triggering any requests

	let is_screen_recording = writable(false);

	onMount(() => {
		is_mobile_device =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);
	});

	let footer_height = 0;

	let root_container: HTMLElement;

	function get_root_node(container: HTMLElement | null): HTMLElement | null {
		if (!container) return null;
		return container.children[container.children.length - 1] as HTMLElement;
	}

	function handle_resize(): void {
		if ("parentIFrame" in window) {
			const box = root_container.children[0].getBoundingClientRect();
			if (!box) return;
			window.parentIFrame?.size(box.bottom + footer_height + 32);
		}
	}

	function screen_recording(): void {
		if ($is_screen_recording) {
			screen_recorder.stopRecording();
		} else {
			screen_recorder.startRecording();
		}
	}

	onMount(() => {
		if ("parentIFrame" in window) {
			window.parentIFrame?.autoResize(false);
		}

		const mut = new MutationObserver(handle_resize);
		const res = new ResizeObserver(handle_resize);

		mut.observe(root_container, {
			childList: true,
			subtree: true,
			attributes: true
		});

		res.observe(root_container);

		return () => {
			mut.disconnect();
			res.disconnect();
		};
	});

	$: ready = !!app_tree.root;
</script>

<svelte:head>
	{#if control_page_title}
		<title>{title}</title>
	{/if}
	{#if css}
		{@html `\<style\>${prefix_css(css, version)}</style>`}
	{/if}
</svelte:head>

<div class="wrap" style:min-height={app_mode ? "100%" : "auto"}>
	<div
		class="contain"
		style:flex-grow={app_mode ? "1" : "auto"}
		bind:this={root_container}
		style:margin-right={vibe_mode ? `${vibe_editor_width}px` : "0"}
	>
		{#if app_tree.root}
			<MountComponents node={app_tree.root} />
		{/if}

		{#if footer_links.length > 0}
		<footer bind:clientHeight={footer_height}>
			{#if footer_links.includes("api")}
				<button
					on:click={() => {
						set_api_docs_visible(!api_docs_visible);
					}}
					on:mouseenter={() => {
						loadApiDocs();
						loadApiRecorder();
					}}
					class="show-api"
				>
					{#if app.config?.mcp_server}
						{$_("errors.use_via_api_or_mcp")}
					{:else}
						{$_("errors.use_via_api")}
					{/if}
					<img src={api_logo} alt={$_("common.logo")} />
				</button>
			{/if}
			{#if footer_links.includes("gradio")}
				<div class="divider show-api-divider">·</div>
				<a
					href="https://gradio.app"
					class="built-with"
					target="_blank"
					rel="noreferrer"
				>
					{$_("common.built_with_gradio")}
					<img src={logo} alt={$_("common.logo")} />
				</a>
			{/if}
			<button
				class:hidden={!$is_screen_recording}
				on:click={() => {
					screen_recording();
				}}
				class="record"
			>
				{$_("common.stop_recording")}
				<img src={record_stop} alt={$_("common.stop_recording")} />
			</button>
			<div class="divider">·</div>
			{#if footer_links.includes("settings")}
				<div class="divider" class:hidden={!$is_screen_recording}>·</div>
				<button
					on:click={() => {
						set_settings_visible(!settings_visible);
					}}
					on:mouseenter={() => {
						loadSettings();
					}}
					class="settings"
				>
					{$_("common.settings")}
					<img src={settings_logo} alt={$_("common.settings")} />
				</button>
			{/if}
		</footer>
	{/if}
	</div>
{#if api_recorder_visible && ApiRecorder}
	<!-- TODO: fix -->
	<!-- svelte-ignore a11y-click-events-have-key-events-->
	<!-- svelte-ignore a11y-no-static-element-interactions-->
	<div
		id="api-recorder-container"
		on:click={() => {
			set_api_docs_visible(true);
			api_recorder_visible = false;
		}}
	>
		<svelte:component this={ApiRecorder} {api_calls} {dependencies} />
	</div>
{/if}

{#if api_docs_visible && app_tree.root && ApiDocs}
	<div class="api-docs">
		<!-- TODO: fix -->
		<!-- svelte-ignore a11y-click-events-have-key-events-->
		<!-- svelte-ignore a11y-no-static-element-interactions-->
		<div
			class="backdrop"
			on:click={() => {
				set_api_docs_visible(false);
			}}
		/>
		<div class="api-docs-wrap">
			<svelte:component
				this={ApiDocs}
				root_node={app_tree.root}
				on:close={(event) => {
					set_api_docs_visible(false);
					api_calls = [];
					api_recorder_visible = api_recorder_visible =
						event.detail?.api_recorder_visible;
				}}
				{dependencies}
				{root}
				{app}
				{space_id}
				{api_calls}
				{username}
			/>
		</div>
	</div>
{/if}

{#if settings_visible && app.config && app_tree.root && Settings}
	<div class="api-docs">
		<!-- TODO: fix -->
		<!-- svelte-ignore a11y-click-events-have-key-events-->
		<!-- svelte-ignore a11y-no-static-element-interactions-->
		<div
			class="backdrop"
			on:click={() => {
				set_settings_visible(false);
			}}
		/>
		<div class="api-docs-wrap">
			<svelte:component
				this={Settings}
				bind:allow_zoom
				bind:allow_video_trim
				on:close={() => {
					set_settings_visible(false);
				}}
				on:start_recording={() => {
					screen_recording();
				}}
				pwa_enabled={app.config.pwa}
				{root}
				{space_id}
			/>
		</div>
	</div>
{/if}

</div>

<style>
	.wrap {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		width: var(--size-full);
		font-weight: var(--body-text-weight);
		font-size: var(--body-text-size);
	}

	.contain {
		display: flex;
		flex-direction: column;
	}

	footer {
		display: flex;
		justify-content: center;
		margin-top: var(--size-4);
		color: var(--body-text-color-subdued);
	}
	.divider {
		margin-left: var(--size-1);
		margin-right: var(--size-2);
	}

	.show-api,
	.settings,
	.record {
		display: flex;
		align-items: center;
	}
	.show-api:hover {
		color: var(--body-text-color);
	}

	.show-api img {
		margin-right: var(--size-1);
		margin-left: var(--size-2);
		width: var(--size-3);
	}

	.settings img {
		margin-right: var(--size-1);
		margin-left: var(--size-1);
		width: var(--size-4);
	}

	.record img {
		margin-right: var(--size-1);
		margin-left: var(--size-1);
		width: var(--size-3);
	}

	.built-with {
		display: flex;
		align-items: center;
	}

	.built-with:hover,
	.settings:hover,
	.record:hover {
		color: var(--body-text-color);
	}

	.built-with img {
		margin-right: var(--size-1);
		margin-left: var(--size-1);
		margin-bottom: 1px;
		width: var(--size-4);
	}

	.api-docs {
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		z-index: var(--layer-top);
		background: rgba(0, 0, 0, 0.5);
		width: var(--size-screen);
		height: var(--size-screen-h);
	}

	.backdrop {
		flex: 1 1 0%;
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
	}

	.api-docs-wrap {
		box-shadow: var(--shadow-drop-lg);
		background: var(--background-fill-primary);
		overflow-x: hidden;
		overflow-y: auto;
	}

	@media (--screen-md) {
		.api-docs-wrap {
			border-top-left-radius: var(--radius-lg);
			border-bottom-left-radius: var(--radius-lg);
			width: 950px;
		}
	}

	@media (--screen-xxl) {
		.api-docs-wrap {
			width: 1150px;
		}
	}

	#api-recorder-container {
		position: fixed;
		left: 10px;
		bottom: 10px;
		z-index: 1000;
	}

	.show-api {
		display: flex;
		align-items: center;
	}

	@media (max-width: 640px) {
		.show-api,
		.show-api-divider {
			display: none;
		}
	}

	.show-api:hover {
		color: var(--body-text-color);
	}

	.hidden {
		display: none;
	}
</style>

<script lang="ts">
	import { tick, onMount } from "svelte";
	import { _ } from "svelte-i18n";
	import { Client } from "@gradio/client";

	import type { LoadingStatus, LoadingStatusCollection } from "./stores";

	import type { ComponentMeta, Dependency, LayoutNode } from "./types";
	import type { UpdateTransaction } from "./init";
	import { setupi18n } from "./i18n";
	import { ApiDocs, ApiRecorder, Settings } from "./api_docs/";
	import type { ThemeMode, Payload } from "./types";
	import { Toast } from "@gradio/statustracker";
	import type { ToastMessage } from "@gradio/statustracker";
	import type { ShareData, ValueData } from "@gradio/utils";
	import MountComponents from "./MountComponents.svelte";
	import { prefix_css } from "./css";

	import logo from "./images/logo.svg";
	import api_logo from "./api_docs/img/api-logo.svg";
	import settings_logo from "./api_docs/img/settings-logo.svg";
	import { create_components, AsyncFunction } from "./init";
	import type {
		LogMessage,
		RenderMessage,
		StatusMessage
	} from "@gradio/client";

	setupi18n();

	export let root: string;
	export let components: ComponentMeta[];
	export let layout: LayoutNode;
	export let dependencies: Dependency[];
	export let title = "Gradio";
	export let target: HTMLElement;
	export let autoscroll: boolean;
	export let show_api = true;
	export let show_footer = true;
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
	export let pages: [string, string][] = [];
	export let current_page = "";

	let {
		layout: _layout,
		targets,
		update_value,
		get_data,
		modify_stream,
		get_stream_state,
		set_time_limit,
		loading_status,
		scheduled_updates,
		create_layout,
		rerender_layout
	} = create_components(initial_layout);

	$: components, layout, dependencies, root, app, fill_height, target, run();

	$: {
		ready = !!$_layout;
	}

	let old_dependencies = dependencies;
	$: if (dependencies !== old_dependencies && render_complete) {
		// re-run load triggers in SSR mode when page changes
		handle_load_triggers();
		old_dependencies = dependencies;
	}

	async function run(): Promise<void> {
		await create_layout({
			components,
			layout,
			dependencies,
			root: root + api_prefix,
			app,
			options: {
				fill_height
			}
		});
	}

	export let search_params: URLSearchParams;
	let api_docs_visible = search_params.get("view") === "api" && show_api;
	let settings_visible = search_params.get("view") === "settings";
	let api_recorder_visible =
		search_params.get("view") === "api-recorder" && show_api;

	function set_api_docs_visible(visible: boolean): void {
		api_recorder_visible = false;
		api_docs_visible = visible;
		let params = new URLSearchParams(window.location.search);
		if (visible) {
			params.set("view", "api");
		} else {
			params.delete("view");
		}
		history.replaceState(null, "", "?" + params.toString());
	}

	function set_settings_visible(visible: boolean): void {
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

	export let render_complete = false;
	async function handle_update(data: any, fn_index: number): Promise<void> {
		const outputs = dependencies.find((dep) => dep.id == fn_index)!.outputs;

		const meta_updates = data?.map((value: any, i: number) => {
			return {
				id: outputs[i],
				prop: "value_is_output",
				value: true
			};
		});

		update_value(meta_updates);

		await tick();

		const updates: UpdateTransaction[] = [];

		data?.forEach((value: any, i: number) => {
			if (
				typeof value === "object" &&
				value !== null &&
				value.__type__ === "update"
			) {
				for (const [update_key, update_value] of Object.entries(value)) {
					if (update_key === "__type__") {
						continue;
					} else {
						updates.push({
							id: outputs[i],
							prop: update_key,
							value: update_value
						});
					}
				}
			} else {
				updates.push({
					id: outputs[i],
					prop: "value",
					value
				});
			}
		});
		update_value(updates);

		await tick();
	}

	let submit_map: Map<number, ReturnType<typeof app.submit>> = new Map();

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

	let user_left_page = false;

	const MESSAGE_QUOTE_RE = /^'([^]+)'$/;

	const DUPLICATE_MESSAGE = $_("blocks.long_requests_queue");
	const MOBILE_QUEUE_WARNING = $_("blocks.connection_can_break");
	const MOBILE_RECONNECT_MESSAGE = $_("blocks.lost_connection");
	const WAITING_FOR_INPUTS_MESSAGE = $_("blocks.waiting_for_inputs");
	const SHOW_DUPLICATE_MESSAGE_ON_ETA = 15;
	const SHOW_MOBILE_QUEUE_WARNING_ON_ETA = 10;
	let is_mobile_device = false;
	let showed_duplicate_message = false;
	let showed_mobile_warning = false;
	let inputs_waiting: number[] = [];

	// as state updates are not synchronous, we need to ensure updates are flushed before triggering any requests
	function wait_then_trigger_api_call(
		dep_index: number,
		trigger_id: number | null = null,
		event_data: unknown = null
	): void {
		let _unsub = (): void => {};
		function unsub(): void {
			_unsub();
		}
		if ($scheduled_updates) {
			_unsub = scheduled_updates.subscribe((updating) => {
				if (!updating) {
					tick().then(() => {
						trigger_api_call(dep_index, trigger_id, event_data);
						unsub();
					});
				}
			});
		} else {
			trigger_api_call(dep_index, trigger_id, event_data);
		}
	}

	async function get_component_value_or_event_data(
		component_id: number,
		trigger_id: number | null,
		event_data: unknown
	): Promise<any> {
		if (
			component_id === trigger_id &&
			event_data &&
			(event_data as ValueData).is_value_data === true
		) {
			// @ts-ignore
			return event_data.value;
		}
		return get_data(component_id);
	}

	async function trigger_api_call(
		dep_index: number,
		trigger_id: number | null = null,
		event_data: unknown = null
	): Promise<void> {
		let dep = dependencies.find((dep) => dep.id === dep_index)!;
		if (inputs_waiting.length > 0) {
			for (const input of inputs_waiting) {
				if (dep.inputs.includes(input)) {
					add_new_message("Warning", WAITING_FOR_INPUTS_MESSAGE, "warning");
					return;
				}
			}
		}
		const current_status = loading_status.get_status_for_fn(dep_index);
		messages = messages.filter(({ fn_index }) => fn_index !== dep_index);
		if (current_status === "pending" || current_status === "generating") {
			dep.pending_request = true;
		}

		let payload: Payload = {
			fn_index: dep_index,
			data: await Promise.all(
				dep.inputs.map((id) =>
					get_component_value_or_event_data(id, trigger_id, event_data)
				)
			),
			event_data: dep.collects_event_data ? event_data : null,
			trigger_id: trigger_id
		};

		if (dep.frontend_fn) {
			dep
				.frontend_fn(
					payload.data.concat(
						await Promise.all(dep.outputs.map((id) => get_data(id)))
					)
				)
				.then((v: unknown[]) => {
					if (dep.backend_fn) {
						payload.data = v;
						trigger_prediction(dep, payload);
					} else {
						handle_update(v, dep_index);
					}
				});
		} else if (dep.types.cancel && dep.cancels) {
			await Promise.all(
				dep.cancels.map(async (fn_index) => {
					const submission = submit_map.get(fn_index);
					submission?.cancel();
					return submission;
				})
			);
		} else {
			if (dep.backend_fn) {
				trigger_prediction(dep, payload);
			}
		}

		function trigger_prediction(dep: Dependency, payload: Payload): void {
			if (dep.trigger_mode === "once") {
				if (!dep.pending_request)
					make_prediction(payload, dep.connection == "stream");
			} else if (dep.trigger_mode === "multiple") {
				make_prediction(payload, dep.connection == "stream");
			} else if (dep.trigger_mode === "always_last") {
				if (!dep.pending_request) {
					make_prediction(payload, dep.connection == "stream");
				} else {
					dep.final_event = payload;
				}
			}
		}

		async function make_prediction(
			payload: Payload,
			streaming = false
		): Promise<void> {
			if (api_recorder_visible) {
				api_calls = [...api_calls, JSON.parse(JSON.stringify(payload))];
			}

			let submission: ReturnType<typeof app.submit>;
			app.set_current_payload(payload);
			if (streaming) {
				if (!submit_map.has(dep_index)) {
					dep.inputs.forEach((id) => modify_stream(id, "waiting"));
				} else if (
					submit_map.has(dep_index) &&
					dep.inputs.some((id) => get_stream_state(id) === "waiting")
				) {
					return;
				} else if (
					submit_map.has(dep_index) &&
					dep.inputs.some((id) => get_stream_state(id) === "open")
				) {
					await app.send_ws_message(
						// @ts-ignore
						`${app.config.root + app.config.api_prefix}/stream/${submit_map.get(dep_index).event_id()}`,
						{ ...payload, session_hash: app.session_hash }
					);
					return;
				}
			}
			try {
				submission = app.submit(
					payload.fn_index,
					payload.data as unknown[],
					payload.event_data,
					payload.trigger_id
				);
			} catch (e) {
				const fn_index = 0; // Mock value for fn_index
				messages = [
					new_message("Error", String(e), fn_index, "error"),
					...messages
				];
				loading_status.update({
					status: "error",
					fn_index,
					eta: 0,
					queue: false,
					queue_position: null
				});
				set_status($loading_status);
				return;
			}

			submit_map.set(dep_index, submission);

			for await (const message of submission) {
				if (message.type === "data") {
					handle_data(message);
				} else if (message.type === "render") {
					handle_render(message);
				} else if (message.type === "status") {
					handle_status_update(message);
				} else if (message.type === "log") {
					handle_log(message);
				}
			}

			function handle_data(message: Payload): void {
				const { data, fn_index } = message;
				if (dep.pending_request && dep.final_event) {
					dep.pending_request = false;
					make_prediction(dep.final_event, dep.connection == "stream");
				}
				dep.pending_request = false;
				handle_update(data, fn_index);
				set_status($loading_status);
			}

			function handle_render(message: RenderMessage): void {
				const { data } = message;
				let _components: ComponentMeta[] = data.components;
				let render_layout: LayoutNode = data.layout;
				let _dependencies: Dependency[] = data.dependencies;
				let render_id = data.render_id;

				let deps_to_remove: number[] = [];
				dependencies.forEach((dep, i) => {
					if (dep.rendered_in === render_id) {
						deps_to_remove.push(i);
					}
				});
				deps_to_remove.reverse().forEach((i) => {
					dependencies.splice(i, 1);
				});
				_dependencies.forEach((dep) => {
					dependencies.push(dep);
				});

				rerender_layout({
					components: _components,
					layout: render_layout,
					root: root + api_prefix,
					dependencies: dependencies,
					render_id: render_id
				});
			}

			function handle_log(msg: LogMessage): void {
				const { title, log, fn_index, level, duration, visible } = msg;
				messages = [
					new_message(title, log, fn_index, level, duration, visible),
					...messages
				];
			}

			function open_stream_events(
				status: StatusMessage,
				id: number,
				dep: Dependency
			): void {
				if (
					status.original_msg === "process_starts" &&
					dep.connection === "stream"
				) {
					modify_stream(id, "open");
				}
			}

			/* eslint-disable complexity */
			function handle_status_update(message: StatusMessage): void {
				const { fn_index, ...status } = message;
				if (status.stage === "streaming" && status.time_limit) {
					dep.inputs.forEach((id) => {
						set_time_limit(id, status.time_limit);
					});
				}
				dep.inputs.forEach((id) => {
					open_stream_events(message, id, dep);
				});
				//@ts-ignore
				loading_status.update({
					...status,
					time_limit: status.time_limit,
					status: status.stage,
					progress: status.progress_data,
					fn_index
				});
				set_status($loading_status);
				if (
					!showed_duplicate_message &&
					space_id !== null &&
					status.position !== undefined &&
					status.position >= 2 &&
					status.eta !== undefined &&
					status.eta > SHOW_DUPLICATE_MESSAGE_ON_ETA
				) {
					showed_duplicate_message = true;
					messages = [
						new_message("Warning", DUPLICATE_MESSAGE, fn_index, "warning"),
						...messages
					];
				}
				if (
					!showed_mobile_warning &&
					is_mobile_device &&
					status.eta !== undefined &&
					status.eta > SHOW_MOBILE_QUEUE_WARNING_ON_ETA
				) {
					showed_mobile_warning = true;
					messages = [
						new_message("Warning", MOBILE_QUEUE_WARNING, fn_index, "warning"),
						...messages
					];
				}

				if (status.stage === "complete" || status.stage === "generating") {
					status.changed_state_ids?.forEach((id) => {
						dependencies
							.filter((dep) => dep.targets.some(([_id, _]) => _id === id))
							.forEach((dep) => {
								wait_then_trigger_api_call(dep.id, payload.trigger_id);
							});
					});
				}
				if (status.stage === "complete") {
					dependencies.forEach(async (dep) => {
						if (dep.trigger_after === fn_index) {
							wait_then_trigger_api_call(dep.id, payload.trigger_id);
						}
					});
					dep.inputs.forEach((id) => {
						modify_stream(id, "closed");
					});
					submit_map.delete(dep_index);
				}
				if (status.broken && is_mobile_device && user_left_page) {
					window.setTimeout(() => {
						messages = [
							new_message("Error", MOBILE_RECONNECT_MESSAGE, fn_index, "error"),
							...messages
						];
					}, 0);
					wait_then_trigger_api_call(dep.id, payload.trigger_id, event_data);
					user_left_page = false;
				} else if (status.stage === "error") {
					if (status.message) {
						const _message = status.message.replace(
							MESSAGE_QUOTE_RE,
							(_, b) => b
						);
						const _title = status.title ?? "Error";
						messages = [
							new_message(
								_title,
								_message,
								fn_index,
								"error",
								status.duration,
								status.visible
							),
							...messages
						];
					}
					dependencies.map(async (dep) => {
						if (
							dep.trigger_after === fn_index &&
							!dep.trigger_only_on_success
						) {
							wait_then_trigger_api_call(dep.id, payload.trigger_id);
						}
					});
				}
			}
		}
	}
	/* eslint-enable complexity */

	function trigger_share(title: string | undefined, description: string): void {
		if (space_id === null) {
			return;
		}
		const discussion_url = new URL(
			`https://huggingface.co/spaces/${space_id}/discussions/new`
		);
		if (title !== undefined && title.length > 0) {
			discussion_url.searchParams.set("title", title);
		}
		discussion_url.searchParams.set("description", description);
		window.open(discussion_url.toString(), "_blank");
	}

	function handle_error_close(e: Event & { detail: number }): void {
		const _id = e.detail;
		messages = messages.filter((m) => m.id !== _id);
	}

	const is_external_url = (link: string | null): boolean =>
		!!(link && new URL(link, location.href).origin !== location.origin);

	async function handle_mount(): Promise<void> {
		if (js) {
			let blocks_frontend_fn = new AsyncFunction(
				`let result = await (${js})();
					return (!Array.isArray(result)) ? [result] : result;`
			);
			await blocks_frontend_fn();
		}

		await tick();

		var a = target.getElementsByTagName("a");

		for (var i = 0; i < a.length; i++) {
			const _target = a[i].getAttribute("target");
			const _link = a[i].getAttribute("href");

			// only target anchor tags with external links
			if (is_external_url(_link) && _target !== "_blank")
				a[i].setAttribute("target", "_blank");
		}

		handle_load_triggers();

		if (!target || render_complete) return;

		target.addEventListener("prop_change", (e: Event) => {
			if (!isCustomEvent(e)) throw new Error("not a custom event");
			const { id, prop, value } = e.detail;
			update_value([{ id, prop, value }]);
			if (prop === "input_ready" && value === false) {
				inputs_waiting.push(id);
			}
			if (prop === "input_ready" && value === true) {
				inputs_waiting = inputs_waiting.filter((item) => item !== id);
			}
		});
		target.addEventListener("gradio", (e: Event) => {
			if (!isCustomEvent(e)) throw new Error("not a custom event");

			const { id, event, data } = e.detail;

			if (event === "share") {
				const { title, description } = data as ShareData;
				trigger_share(title, description);
			} else if (event === "error") {
				messages = [new_message("Error", data, -1, event), ...messages];
			} else if (event === "warning") {
				messages = [new_message("Warning", data, -1, event), ...messages];
			} else if (event == "clear_status") {
				update_status(id, "complete", data);
			} else if (event == "close_stream") {
				const deps = $targets[id]?.[data];
				deps?.forEach((dep_id) => {
					if (submit_map.has(dep_id)) {
						// @ts-ignore
						const url = `${app.config.root + app.config.api_prefix}/stream/${submit_map.get(dep_id).event_id()}`;
						app.post_data(`${url}/close`, {});
						app.close_ws(url);
					}
				});
			} else {
				const deps = $targets[id]?.[event];

				deps?.forEach((dep_id) => {
					requestAnimationFrame(() => {
						wait_then_trigger_api_call(dep_id, id, data);
					});
				});
			}
		});

		render_complete = true;
	}

	const handle_load_triggers = (): void => {
		dependencies.forEach((dep) => {
			if (dep.targets.some((dep) => dep[1] === "load")) {
				wait_then_trigger_api_call(dep.id);
			}
		});
	};

	$: set_status($loading_status);

	function update_status(
		id: number,
		status: "error" | "complete" | "pending",
		data: LoadingStatus
	): void {
		data.status = status;
		update_value([
			{
				id,
				prop: "loading_status",
				value: data
			}
		]);
	}

	function set_status(statuses: LoadingStatusCollection): void {
		let updates: {
			id: number;
			prop: string;
			value: LoadingStatus;
		}[] = [];
		Object.entries(statuses).forEach(([id, loading_status]) => {
			let dependency = dependencies.find(
				(dep) => dep.id == loading_status.fn_index
			);
			if (dependency === undefined) {
				return;
			}
			loading_status.scroll_to_output = dependency.scroll_to_output;
			loading_status.show_progress = dependency.show_progress;
			updates.push({
				id: parseInt(id),
				prop: "loading_status",
				value: loading_status
			});
		});

		const inputs_to_update = loading_status.get_inputs_to_update();
		const additional_updates = Array.from(inputs_to_update).map(
			([id, pending_status]) => {
				return {
					id,
					prop: "pending",
					value: pending_status === "pending"
				};
			}
		);

		update_value([...updates, ...additional_updates]);
	}

	function isCustomEvent(event: Event): event is CustomEvent {
		return "detail" in event;
	}

	onMount(() => {
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "hidden") {
				user_left_page = true;
			}
		});

		is_mobile_device =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);
	});
</script>

<svelte:head>
	{#if control_page_title}
		<title>{title}</title>
	{/if}
	{#if css}
		{@html `\<style\>${prefix_css(css, version)}</style>`}
	{/if}
</svelte:head>

{#if pages.length > 1}
	<nav>
		{#each pages as [route, label], i}
			<a href={route.length ? route : "/"} class:active={route === current_page}
				>{label}</a
			>
			{#if i < pages.length - 1}
				<span>&bull;</span>
			{/if}
		{/each}
	</nav>
{/if}
<div class="wrap" style:min-height={app_mode ? "100%" : "auto"}>
	<div class="contain" style:flex-grow={app_mode ? "1" : "auto"}>
		{#if $_layout && app.config}
			<MountComponents
				rootNode={$_layout}
				{root}
				{target}
				{theme_mode}
				on:mount={handle_mount}
				{version}
				{autoscroll}
				{max_file_size}
				client={app}
			/>
		{/if}
	</div>

	{#if show_footer}
		<footer>
			{#if show_api}
				<button
					on:click={() => {
						set_api_docs_visible(!api_docs_visible);
					}}
					class="show-api"
				>
					{$_("errors.use_via_api")}
					<img src={api_logo} alt={$_("common.logo")} />
					<div>&nbsp;·</div>
				</button>
			{/if}
			<a
				href="https://gradio.app"
				class="built-with"
				target="_blank"
				rel="noreferrer"
			>
				{$_("common.built_with_gradio")}
				<img src={logo} alt={$_("common.logo")} />
			</a>
			<button
				on:click={() => {
					set_settings_visible(!settings_visible);
				}}
				class="settings"
			>
				<div>· &nbsp;</div>
				{$_("common.settings")}
				<img src={settings_logo} alt={$_("common.settings")} />
			</button>
		</footer>
	{/if}
</div>

{#if api_recorder_visible}
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
		<ApiRecorder {api_calls} {dependencies} />
	</div>
{/if}

{#if api_docs_visible && $_layout}
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
			<ApiDocs
				root_node={$_layout}
				on:close={(event) => {
					set_api_docs_visible(false);
					api_calls = [];
					api_recorder_visible = event.detail?.api_recorder_visible;
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

{#if settings_visible && $_layout && app.config}
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
			<Settings
				on:close={(event) => {
					set_settings_visible(false);
				}}
				pwa_enabled={app.config.pwa}
				{root}
				{space_id}
			/>
		</div>
	</div>
{/if}

{#if messages}
	<Toast {messages} on:close={handle_error_close} />
{/if}

<style>
	nav {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin: 0 auto var(--layout-gap);
		justify-content: center;
	}
	nav a:hover {
		text-decoration: underline;
	}
	nav a.active {
		font-weight: bold;
	}
	nav span {
		color: var(--body-text-color-subdued);
	}
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

	footer > * + * {
		margin-left: var(--size-2);
	}

	.show-api,
	.settings {
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

	.built-with {
		display: flex;
		align-items: center;
	}

	.built-with:hover,
	.settings:hover {
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
		.show-api {
			display: none;
		}
	}

	.show-api:hover {
		color: var(--body-text-color);
	}
</style>

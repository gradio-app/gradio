<script lang="ts">
	import { load_component } from "virtual:component-loader";

	import { tick } from "svelte";
	import { _ } from "svelte-i18n";
	import type { client } from "@gradio/client";

	import { create_loading_status_store } from "./stores";
	import type { LoadingStatusCollection } from "./stores";

	import type { ComponentMeta, Dependency, LayoutNode } from "./types";
	import { setupi18n } from "./i18n";
	import { ApiDocs } from "./api_docs/";
	import type { ThemeMode, Payload } from "./types";
	import { Toast } from "@gradio/statustracker";
	import type { ToastMessage } from "@gradio/statustracker";
	import type { ShareData } from "@gradio/utils";
	import MountComponents from "./MountComponents.svelte";

	import logo from "./images/logo.svg";
	import api_logo from "./api_docs/img/api-logo.svg";

	setupi18n();

	export let root: string;
	export let components: ComponentMeta[];
	export let layout: LayoutNode;
	export let dependencies: Dependency[];
	export let title = "Gradio";
	export let analytics_enabled = false;
	export let target: HTMLElement;
	export let autoscroll: boolean;
	export let show_api = true;
	export let show_footer = true;
	export let control_page_title = false;
	export let app_mode: boolean;
	export let theme_mode: ThemeMode;
	export let app: Awaited<ReturnType<typeof client>>;
	export let space_id: string | null;
	export let version: string;
	export let api_url: string;
	export let js: string | null;

	let loading_status = create_loading_status_store();

	let rootNode: ComponentMeta = {
		id: layout.id,
		type: "column",
		props: { interactive: false },
		has_modes: false,
		instance: null as unknown as ComponentMeta["instance"],
		component: null as unknown as ComponentMeta["component"],
		component_class_id: ""
	};

	const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
	dependencies.forEach((d) => {
		if (d.js) {
			const wrap = d.backend_fn
				? d.inputs.length === 1
				: d.outputs.length === 1;
			try {
				d.frontend_fn = new AsyncFunction(
					"__fn_args",
					`let result = await (${d.js})(...__fn_args);
					return (${wrap} && !Array.isArray(result)) ? [result] : result;`
				);
			} catch (e) {
				console.error("Could not parse custom js method.");
				console.error(e);
			}
		}
	});

	let params = new URLSearchParams(window.location.search);
	let api_docs_visible = params.get("view") === "api" && show_api;
	function set_api_docs_visible(visible: boolean): void {
		api_docs_visible = visible;
		let params = new URLSearchParams(window.location.search);
		if (visible) {
			params.set("view", "api");
		} else {
			params.delete("view");
		}
		history.replaceState(null, "", "?" + params.toString());
	}

	function is_dep(
		id: number,
		type: "inputs" | "outputs",
		deps: Dependency[]
	): boolean {
		for (const dep of deps) {
			for (const dep_item of dep[type]) {
				if (dep_item === id) return true;
			}
		}
		return false;
	}

	let dynamic_ids: Set<number> = new Set();

	function has_no_default_value(value: any): boolean {
		return (
			(Array.isArray(value) && value.length === 0) ||
			value === "" ||
			value === 0 ||
			!value
		);
	}

	let instance_map: { [id: number]: ComponentMeta };

	type LoadedComponent = {
		default: ComponentMeta["component"];
	};

	let component_set = new Set<
		Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
	>();

	let _component_map = new Map<
		`${ComponentMeta["type"]}_${ComponentMeta["props"]["interactive"]}`,
		Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
	>();

	async function walk_layout(
		node: LayoutNode,
		type_map: Map<number, ComponentMeta["props"]["interactive"]>,
		instance_map: { [id: number]: ComponentMeta },
		component_map: Map<
			`${ComponentMeta["type"]}_${ComponentMeta["props"]["interactive"]}`,
			Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
		>
	): Promise<void> {
		ready = false;
		let instance = instance_map[node.id];

		const _component = (await component_map.get(
			`${instance.type}_${type_map.get(node.id) || "false"}`
		))!.component;
		instance.component = _component.default;

		if (node.children) {
			instance.children = node.children.map((v) => instance_map[v.id]);
			await Promise.all(
				node.children.map((v) =>
					walk_layout(v, type_map, instance_map, component_map)
				)
			);
		}
	}

	export let ready = false;
	export let render_complete = false;

	$: components, layout, prepare_components();

	let target_map: Record<number, Record<string, number[]>> = {};

	function prepare_components(): void {
		target_map = dependencies.reduce(
			(acc, dep, i) => {
				dep.targets.forEach(([id, trigger]) => {
					if (!acc[id]) {
						acc[id] = {};
					}
					if (acc[id]?.[trigger]) {
						acc[id][trigger].push(i);
					} else {
						acc[id][trigger] = [i];
					}
				});

				return acc;
			},
			{} as Record<number, Record<string, number[]>>
		);
		loading_status = create_loading_status_store();

		dependencies.forEach((v, i) => {
			loading_status.register(i, v.inputs, v.outputs);
		});

		const _dynamic_ids = new Set<number>();
		for (const comp of components) {
			const { id, props } = comp;
			const is_input = is_dep(id, "inputs", dependencies);
			if (
				is_input ||
				(!is_dep(id, "outputs", dependencies) &&
					has_no_default_value(props?.value))
			) {
				_dynamic_ids.add(id);
			}
		}

		dynamic_ids = _dynamic_ids;

		const _rootNode: typeof rootNode = {
			id: layout.id,
			type: "column",
			props: { interactive: false },
			has_modes: false,
			instance: null as unknown as ComponentMeta["instance"],
			component: null as unknown as ComponentMeta["component"],
			component_class_id: ""
		};
		components.push(_rootNode);
		const _component_set = new Set<
			Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
		>();
		const __component_map = new Map<
			`${ComponentMeta["type"]}_${ComponentMeta["props"]["interactive"]}`,
			Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
		>();
		const __type_for_id = new Map<
			number,
			ComponentMeta["props"]["interactive"]
		>();
		const _instance_map = components.reduce(
			(acc, next) => {
				acc[next.id] = next;
				return acc;
			},
			{} as { [id: number]: ComponentMeta }
		);
		components.forEach((c) => {
			if ((c.props as any).interactive === false) {
				(c.props as any).interactive = false;
			} else if ((c.props as any).interactive === true) {
				(c.props as any).interactive = true;
			} else if (dynamic_ids.has(c.id)) {
				(c.props as any).interactive = true;
			} else {
				(c.props as any).interactive = false;
			}

			if ((c.props as any).server_fns) {
				let server: Record<string, (...args: any[]) => Promise<any>> = {};
				(c.props as any).server_fns.forEach((fn: string) => {
					server[fn] = async (...args: any[]) => {
						if (args.length === 1) {
							args = args[0];
						}
						const result = await app.component_server(c.id, fn, args);
						return result;
					};
				});
				(c.props as any).server = server;
			}

			if (target_map[c.id]) {
				c.props.attached_events = Object.keys(target_map[c.id]);
			}
			__type_for_id.set(c.id, c.props.interactive);

			if (c.type === "dataset") {
				const example_component_map = new Map();

				(c.props.components as string[]).forEach((name: string) => {
					if (example_component_map.has(name)) {
						return;
					}
					let _c;

					const matching_component = components.find((c) => c.type === name);
					if (matching_component) {
						_c = load_component({
							api_url,
							name,
							id: matching_component.component_class_id,
							variant: "example"
						});
						example_component_map.set(name, _c);
					}
				});

				c.props.component_map = example_component_map;
			}

			// maybe load custom

			const _c = load_component({
				api_url,
				name: c.type,
				id: c.component_class_id,
				variant: "component"
			});
			_component_set.add(_c);
			__component_map.set(`${c.type}_${c.props.interactive}`, _c);
		});

		Promise.all(Array.from(_component_set)).then(() => {
			walk_layout(layout, __type_for_id, _instance_map, __component_map)
				.then(async () => {
					ready = true;
					component_set = _component_set;
					_component_map = __component_map;
					instance_map = _instance_map;
					rootNode = _rootNode;
				})
				.catch((e) => {
					console.error(e);
				});
		});
	}

	async function handle_update(
		data: any,
		fn_index: number,
		outputs_set_to_non_interactive: number[]
	): Promise<void> {
		const outputs = dependencies[fn_index].outputs;

		data?.forEach((value: any, i: number) => {
			const output = instance_map[outputs[i]];
			output.props.value_is_output = true;
		});

		rootNode = rootNode;
		await tick();
		data?.forEach((value: any, i: number) => {
			const output = instance_map[outputs[i]];
			if (
				typeof value === "object" &&
				value !== null &&
				value.__type__ === "update"
			) {
				for (const [update_key, update_value] of Object.entries(value)) {
					if (update_key === "__type__") {
						continue;
					} else {
						output.props[update_key] = update_value;
						if (update_key == "interactive" && !update_value) {
							outputs_set_to_non_interactive.push(outputs[i]);
						}
					}
				}
			} else {
				output.props.value = value;
			}
		});
		rootNode = rootNode;
	}

	let submit_map: Map<number, ReturnType<typeof app.submit>> = new Map();

	function set_prop<T extends ComponentMeta>(
		obj: T,
		prop: string,
		val: any
	): void {
		if (!obj?.props) {
			// @ts-ignore
			obj.props = {};
		}
		obj.props[prop] = val;
		rootNode = rootNode;
	}
	let handled_dependencies: number[][] = [];

	let messages: (ToastMessage & { fn_index: number })[] = [];
	function new_message(
		message: string,
		fn_index: number,
		type: ToastMessage["type"]
	): ToastMessage & { fn_index: number } {
		return {
			message,
			fn_index,
			type,
			id: ++_error_id
		};
	}

	let _error_id = -1;

	let user_left_page = false;
	document.addEventListener("visibilitychange", function () {
		if (document.visibilityState === "hidden") {
			user_left_page = true;
		}
	});

	const MESSAGE_QUOTE_RE = /^'([^]+)'$/;

	const DUPLICATE_MESSAGE = $_("blocks.long_requests_queue");
	const MOBILE_QUEUE_WARNING = $_("blocks.connection_can_break");
	const MOBILE_RECONNECT_MESSAGE = $_("blocks.lost_connection");
	const SHOW_DUPLICATE_MESSAGE_ON_ETA = 15;
	const SHOW_MOBILE_QUEUE_WARNING_ON_ETA = 10;
	const is_mobile_device =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
	let showed_duplicate_message = false;
	let showed_mobile_warning = false;

	function get_data(comp: ComponentMeta): any | Promise<any> {
		if (comp.instance.get_value) {
			return comp.instance.get_value() as Promise<any>;
		}
		return comp.props.value;
	}

	async function trigger_api_call(
		dep_index: number,
		trigger_id: number | null = null,
		event_data: unknown = null
	): Promise<void> {
		let dep = dependencies[dep_index];
		const current_status = loading_status.get_status_for_fn(dep_index);
		messages = messages.filter(({ fn_index }) => fn_index !== dep_index);
		if (dep.cancels) {
			await Promise.all(
				dep.cancels.map(async (fn_index) => {
					const submission = submit_map.get(fn_index);
					submission?.cancel();
					return submission;
				})
			);
		}
		if (current_status === "pending" || current_status === "generating") {
			dep.pending_request = true;
		}

		let payload: Payload = {
			fn_index: dep_index,
			data: await Promise.all(
				dep.inputs.map((id) => get_data(instance_map[id]))
			),
			event_data: dep.collects_event_data ? event_data : null,
			trigger_id: trigger_id
		};

		if (dep.frontend_fn) {
			dep
				.frontend_fn(
					payload.data.concat(
						await Promise.all(
							dep.inputs.map((id) => get_data(instance_map[id]))
						)
					)
				)
				.then((v: unknown[]) => {
					if (dep.backend_fn) {
						payload.data = v;
						make_prediction(payload);
					} else {
						handle_update(v, dep_index, []);
					}
				});
		} else {
			if (dep.backend_fn) {
				if (dep.trigger_mode === "once") {
					if (!dep.pending_request) make_prediction(payload);
				} else if (dep.trigger_mode === "multiple") {
					make_prediction(payload);
				} else if (dep.trigger_mode === "always_last") {
					if (!dep.pending_request) {
						make_prediction(payload);
					} else {
						dep.final_event = payload;
					}
				}
			}
		}

		function make_prediction(payload: Payload): void {
			const pending_outputs: number[] = [];
			let outputs_set_to_non_interactive: number[] = [];
			const submission = app
				.submit(
					payload.fn_index,
					payload.data as unknown[],
					payload.event_data,
					payload.trigger_id
				)
				.on("data", ({ data, fn_index }) => {
					if (dep.pending_request && dep.final_event) {
						dep.pending_request = false;
						make_prediction(dep.final_event);
					}
					dep.pending_request = false;
					handle_update(data, fn_index, outputs_set_to_non_interactive);
				})
				.on("status", ({ fn_index, ...status }) => {
					tick().then(() => {
						const outputs = dependencies[fn_index].outputs;
						outputs.forEach((id) => {
							if (
								instance_map[id].props.interactive &&
								status.stage === "pending" &&
								dep.targets[0][1] !== "focus"
							) {
								pending_outputs.push(id);
								instance_map[id].props.interactive = false;
							} else if (
								status.stage === "complete" &&
								pending_outputs.includes(id) &&
								!outputs_set_to_non_interactive.includes(id)
							) {
								instance_map[id].props.interactive = true;
							}
						});
						//@ts-ignore
						loading_status.update({
							...status,
							status: status.stage,
							progress: status.progress_data,
							fn_index
						});
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
								new_message(DUPLICATE_MESSAGE, fn_index, "warning"),
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
								new_message(MOBILE_QUEUE_WARNING, fn_index, "warning"),
								...messages
							];
						}

						if (status.stage === "complete") {
							dependencies.map(async (dep, i) => {
								if (dep.trigger_after === fn_index) {
									trigger_api_call(i, payload.trigger_id);
								}
							});

							submission.destroy();
						}
						if (status.broken && is_mobile_device && user_left_page) {
							window.setTimeout(() => {
								messages = [
									new_message(MOBILE_RECONNECT_MESSAGE, fn_index, "error"),
									...messages
								];
							}, 0);
							trigger_api_call(dep_index, payload.trigger_id, event_data);
							user_left_page = false;
						} else if (status.stage === "error") {
							if (status.message) {
								const _message = status.message.replace(
									MESSAGE_QUOTE_RE,
									(_, b) => b
								);
								messages = [
									new_message(_message, fn_index, "error"),
									...messages
								];
							}
							dependencies.map(async (dep, i) => {
								if (
									dep.trigger_after === fn_index &&
									!dep.trigger_only_on_success
								) {
									trigger_api_call(i, payload.trigger_id);
								}
							});

							submission.destroy();
						}
					});
				})
				.on("log", ({ log, fn_index, level }) => {
					messages = [new_message(log, fn_index, level), ...messages];
				});

			submit_map.set(dep_index, submission);
		}
	}

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
			blocks_frontend_fn();
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

		// handle load triggers
		dependencies.forEach((dep, i) => {
			if (dep.targets[0][1] === "load") {
				trigger_api_call(i);
			}
		});

		target.addEventListener("gradio", (e: Event) => {
			if (!isCustomEvent(e)) throw new Error("not a custom event");

			const { id, event, data } = e.detail;

			if (event === "share") {
				const { title, description } = data as ShareData;
				trigger_share(title, description);
			} else if (event === "error" || event === "warning") {
				messages = [new_message(data, -1, event), ...messages];
			} else {
				const deps = target_map[id]?.[event];
				deps?.forEach((dep_id) => {
					trigger_api_call(dep_id, id, data);
				});
			}
		});

		render_complete = true;
	}

	function handle_destroy(id: number): void {
		handled_dependencies = handled_dependencies.map((dep) => {
			return dep.filter((_id) => _id !== id);
		});
	}

	$: set_status($loading_status);

	function set_status(statuses: LoadingStatusCollection): void {
		for (const id in statuses) {
			let loading_status = statuses[id];
			let dependency = dependencies[loading_status.fn_index];
			loading_status.scroll_to_output = dependency.scroll_to_output;
			loading_status.show_progress = dependency.show_progress;

			set_prop(instance_map[id], "loading_status", loading_status);
		}
		const inputs_to_update = loading_status.get_inputs_to_update();
		for (const [id, pending_status] of inputs_to_update) {
			set_prop(instance_map[id], "pending", pending_status === "pending");
		}
	}

	function isCustomEvent(event: Event): event is CustomEvent {
		return "detail" in event;
	}
</script>

<svelte:head>
	{#if control_page_title}
		<title>{title}</title>
	{/if}
	{#if analytics_enabled}
		<script
			async
			defer
			src="https://www.googletagmanager.com/gtag/js?id=UA-156449732-1"
		></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag("js", new Date());
			gtag("config", "UA-156449732-1", {
				cookie_flags: "samesite=none;secure"
			});
		</script>
	{/if}
</svelte:head>

<div class="wrap" style:min-height={app_mode ? "100%" : "auto"}>
	<div class="contain" style:flex-grow={app_mode ? "1" : "auto"}>
		{#if ready}
			<MountComponents
				{rootNode}
				{dynamic_ids}
				{instance_map}
				{root}
				{target}
				{theme_mode}
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
				{version}
				{autoscroll}
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
				</button>
				<div>·</div>
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
		</footer>
	{/if}
</div>

{#if api_docs_visible && ready}
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
				on:close={() => {
					set_api_docs_visible(false);
				}}
				{instance_map}
				{dependencies}
				{root}
				{app}
			/>
		</div>
	</div>
{/if}

{#if messages}
	<Toast {messages} on:close={handle_error_close} />
{/if}

<style>
	.wrap {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		width: var(--size-full);
		font-weight: var(--body-text-weight);
		font-size: var(--body-text-size);
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

	.show-api {
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

	.built-with {
		display: flex;
		align-items: center;
	}

	.built-with:hover {
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
		z-index: var(--layer-5);
		background: rgba(0, 0, 0, 0.5);
		width: var(--size-screen);
		height: var(--size-screen-h);
	}

	.backdrop {
		flex: 1 1 0%;
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
</style>

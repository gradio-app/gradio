<script lang="ts">
	import { tick } from "svelte";
	import { _ } from "svelte-i18n";

	import { component_map } from "./components/directory";
	import {
		create_loading_status_store,
		app_state,
		LoadingStatusCollection
	} from "./stores";

	import type {
		ComponentMeta,
		Dependency,
		LayoutNode
	} from "./components/types";
	import type { fn as api_fn } from "./api";
	import { setupi18n } from "./i18n";
	import Render from "./Render.svelte";
	import ApiDocs from "./ApiDocs.svelte";

	import logo from "./images/logo.svg";

	setupi18n();

	export let root: string;
	export let fn: ReturnType<typeof api_fn>;
	export let components: Array<ComponentMeta>;
	export let layout: LayoutNode;
	export let dependencies: Array<Dependency>;

	export let enable_queue: boolean;
	export let title: string = "Gradio";
	export let analytics_enabled: boolean = false;
	export let target: HTMLElement;
	export let id: number = 0;
	export let autoscroll: boolean = false;
	export let show_api: boolean = true;
	export let control_page_title = false;

	let app_mode = window.__gradio_mode__ === "app";
	let loading_status = create_loading_status_store();

	$: app_state.update((s) => ({ ...s, autoscroll }));

	let rootNode: ComponentMeta = {
		id: layout.id,
		type: "column",
		props: {},
		has_modes: false,
		instance: {} as ComponentMeta["instance"],
		component: {} as ComponentMeta["component"]
	};

	components.push(rootNode);

	const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
	dependencies.forEach((d) => {
		if (d.js) {
			try {
				d.frontend_fn = new AsyncFunction(
					"__fn_args",
					`let result = await (${d.js})(...__fn_args);
					return ${d.outputs.length} === 1 ? [result] : result;`
				);
			} catch (e) {
				console.error("Could not parse custom js method.");
				console.error(e);
			}
		}
	});
	let api_docs_visible = false;

	function is_dep(
		id: number,
		type: "inputs" | "outputs",
		deps: Array<Dependency>
	) {
		let dep_index = 0;
		for (;;) {
			const dep = deps[dep_index];
			if (dep === undefined) break;

			let dep_item_index = 0;
			for (;;) {
				const dep_item = dep[type][dep_item_index];
				if (dep_item === undefined) break;
				if (dep_item === id) return true;
				dep_item_index++;
			}

			dep_index++;
		}

		return false;
	}

	const dynamic_ids: Set<number> = components.reduce<Set<number>>(
		(acc, { id, props }) => {
			const is_input = is_dep(id, "inputs", dependencies);
			const is_output = is_dep(id, "outputs", dependencies);

			if (
				!is_input &&
				!is_output &&
				"value" in props &&
				has_no_default_value(props?.value)
			)
				acc.add(id); // default dynamic
			if (is_input) acc.add(id);

			return acc;
		},
		new Set()
	);

	function has_no_default_value(value: any) {
		return (
			(Array.isArray(value) && value.length === 0) ||
			value === "" ||
			value === 0 ||
			!value
		);
	}

	let instance_map = components.reduce((acc, next) => {
		acc[next.id] = next;
		return acc;
	}, {} as { [id: number]: ComponentMeta });

	type LoadedComponent = {
		Component: ComponentMeta["component"];
		modes?: Array<string>;
	};

	function load_component<T extends ComponentMeta["type"]>(
		name: T
	): Promise<{
		name: T;
		component: LoadedComponent;
	}> {
		return new Promise(async (res, rej) => {
			try {
				const c = await component_map[name]();
				res({
					name,
					component: c as LoadedComponent
				});
			} catch (e) {
				console.error("failed to load: " + name);
				console.error(e);
				rej(e);
			}
		});
	}

	const component_set = new Set<
		Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
	>();
	const _component_map = new Map<
		ComponentMeta["type"],
		Promise<{ name: ComponentMeta["type"]; component: LoadedComponent }>
	>();

	async function walk_layout(node: LayoutNode) {
		let instance = instance_map[node.id];
		const _component = (await _component_map.get(instance.type))!.component;
		instance.component = _component.Component;
		if (_component.modes && _component.modes.length > 1) {
			instance.has_modes = true;
		}

		if (node.children) {
			instance.children = node.children.map((v) => instance_map[v.id]);
			await Promise.all(node.children.map((v) => walk_layout(v)));
		}
	}

	components.forEach(async (c) => {
		const _c = load_component(c.type);
		component_set.add(_c);
		_component_map.set(c.type, _c);
	});

	let ready = false;
	Promise.all(Array.from(component_set)).then(() => {
		walk_layout(layout)
			.then(async () => {
				ready = true;

				await tick();
				window.__gradio_loader__[id].$set({ status: "complete" });
			})
			.catch((e) => {
				console.error(e);
				window.__gradio_loader__[id].$set({ status: "error" });
			});
	});

	function set_prop<T extends ComponentMeta>(obj: T, prop: string, val: any) {
		if (!obj?.props) {
			obj.props = {};
		}
		obj.props[prop] = val;
		rootNode = rootNode;
	}

	let handled_dependencies: Array<number[]> = [];

	async function handle_mount() {
		await tick();

		var a = target.getElementsByTagName("a");

		for (var i = 0; i < a.length; i++) {
			const _target = a[i].getAttribute("target");
			if (_target !== "_blank") a[i].setAttribute("target", "_blank");
		}

		dependencies.forEach(
			(
				{
					targets,
					trigger,
					inputs,
					outputs,
					queue,
					backend_fn,
					frontend_fn,
					...rest
				},
				i
			) => {
				const target_instances: [number, ComponentMeta][] = targets.map((t) => [
					t,
					instance_map[t]
				]);

				// page events
				if (
					targets.length === 0 &&
					!handled_dependencies[i]?.includes(-1) &&
					trigger === "load" &&
					// check all input + output elements are on the page
					outputs.every((v) => instance_map[v].instance) &&
					inputs.every((v) => instance_map[v].instance)
				) {
					const req = fn({
						action: "predict",
						backend_fn,
						frontend_fn,
						payload: {
							fn_index: i,
							data: inputs.map((id) => instance_map[id].props.value)
						},
						queue: queue === null ? enable_queue : queue,
						queue_callback: handle_update,
						loading_status: loading_status
					});

					function handle_update(output: any) {
						output.data.forEach((value: any, i: number) => {
							if (
								typeof value === "object" &&
								value !== null &&
								value.__type__ === "update"
							) {
								for (const [update_key, update_value] of Object.entries(
									value
								)) {
									if (update_key === "__type__") {
										continue;
									} else {
										instance_map[outputs[i]].props[update_key] = update_value;
									}
								}
								rootNode = rootNode;
							} else {
								instance_map[outputs[i]].props.value = value;
							}
						});
					}

					if (!(queue === null ? enable_queue : queue)) {
						req.then(handle_update);
					}

					handled_dependencies[i] = [-1];
				}

				target_instances.forEach(
					([id, { instance }]: [number, ComponentMeta]) => {
						if (handled_dependencies[i]?.includes(id) || !instance) return;
						instance?.$on(trigger, () => {
							if (loading_status.get_status_for_fn(i) === "pending") {
								return;
							}

							// page events
							const req = fn({
								action: "predict",
								backend_fn,
								frontend_fn,
								payload: {
									fn_index: i,
									data: inputs.map((id) => instance_map[id].props.value)
								},
								output_data: outputs.map((id) => instance_map[id].props.value),
								queue: queue === null ? enable_queue : queue,
								queue_callback: handle_update,
								loading_status: loading_status
							});

							if (!(queue === null ? enable_queue : queue)) {
								req.then(handle_update);
							}
						});

						function handle_update(output: any) {
							output.data.forEach((value: any, i: number) => {
								if (
									typeof value === "object" &&
									value !== null &&
									value.__type__ === "update"
								) {
									for (const [update_key, update_value] of Object.entries(
										value
									)) {
										if (update_key === "__type__") {
											continue;
										} else {
											instance_map[outputs[i]].props[update_key] = update_value;
										}
									}
									rootNode = rootNode;
								} else {
									instance_map[outputs[i]].props.value = value;
								}
							});
						}

						if (!handled_dependencies[i]) handled_dependencies[i] = [];
						handled_dependencies[i].push(id);
					}
				);
			}
		);
	}

	function handle_destroy(id: number) {
		handled_dependencies = handled_dependencies.map((dep) => {
			return dep.filter((_id) => _id !== id);
		});
	}

	$: set_status($loading_status);

	dependencies.forEach((v, i) => {
		loading_status.register(i, v.inputs, v.outputs);
	});

	function set_status(statuses: LoadingStatusCollection) {
		for (const id in statuses) {
			let loading_status = statuses[id];
			let dependency = dependencies[loading_status.fn_index];
			loading_status.scroll_to_output = dependency.scroll_to_output;
			loading_status.visible = dependency.show_progress;

			set_prop(instance_map[id], "loading_status", loading_status);
		}
		const inputs_to_update = loading_status.get_inputs_to_update();
		for (const [id, pending_status] of inputs_to_update) {
			set_prop(instance_map[id], "pending", pending_status === "pending");
		}
	}

	function handle_darkmode() {
		let url = new URL(window.location.toString());

		const color_mode: "light" | "dark" | "system" | null = url.searchParams.get(
			"__theme"
		) as "light" | "dark" | "system" | null;

		if (color_mode !== null) {
			if (color_mode === "dark") {
				darkmode();
			} else if (color_mode === "system") {
				use_system_theme();
			}
			// light is default, so we don't need to do anything else
		} else if (url.searchParams.get("__dark-theme") === "true") {
			darkmode();
		} else {
			use_system_theme();
		}
	}

	function use_system_theme() {
		update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme() {
			const is_dark =
				window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

			if (is_dark) {
				darkmode();
			}
		}
	}

	function darkmode() {
		target.classList.add("dark");
		if (app_mode) {
			document.body.style.backgroundColor = "rgb(11, 15, 25)"; // bg-gray-950 for scrolling outside the body
		}
	}

	if (window.__gradio_mode__ !== "website") {
		handle_darkmode();
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
			src="https://www.googletagmanager.com/gtag/js?id=UA-156449732-1"></script>
	{/if}
</svelte:head>

<div class="w-full flex flex-col" class:min-h-screen={app_mode}>
	<div
		class="mx-auto container px-4 py-6 dark:bg-gray-950"
		class:flex-grow={app_mode}
	>
		{#if api_docs_visible}
			<ApiDocs {components} {dependencies} {root} />
		{:else if ready}
			<Render
				has_modes={rootNode.has_modes}
				component={rootNode.component}
				id={rootNode.id}
				props={rootNode.props}
				children={rootNode.children}
				{dynamic_ids}
				{instance_map}
				{root}
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
			/>
		{/if}
	</div>
	<footer
		class="flex justify-center pb-6 text-gray-300 dark:text-gray-500 font-semibold"
	>
		{#if show_api}
			<div
				class="cursor-pointer hover:text-gray-400 dark:hover:text-gray-400 transition-colors"
				on:click={() => {
					api_docs_visible = !api_docs_visible;
				}}
			>
				{#if api_docs_visible}hide{:else}view{/if} api
			</div>
			&nbsp; &bull; &nbsp;
		{/if}
		<a
			href="https://gradio.app"
			target="_blank"
			rel="noreferrer"
			class="group hover:text-gray-400 dark:hover:text-gray-400 transition-colors"
		>
			{$_("interface.built_with_Gradio")}
			<img
				class="h-[22px] ml-0.5 inline-block pb-0.5 filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition"
				src={logo}
				alt="logo"
			/>
		</a>
	</footer>
</div>

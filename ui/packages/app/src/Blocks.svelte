<script lang="ts">
	import type { SvelteComponentTyped } from "svelte";
	import { onMount } from "svelte";
	import { component_map } from "./components/directory";
	import { loading_status } from "./stores";
	import type { LoadingStatus } from "./stores";

	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	import Render from "./Render.svelte";
	import { tick } from "svelte";
	setupi18n();

	interface Component {
		id: number;
		type: string;
		has_modes?: boolean;
		props: {
			name?: keyof typeof component_map;
			css?: Record<string, string>;
			visible?: boolean;
			elem_id?: string;
			[key: string]: unknown;
		};
		instance?: SvelteComponentTyped;
		value?: unknown;
		component?: any;
		children?: Array<Component>;
	}

	interface LayoutNode {
		id: number;
		children: Array<LayoutNode>;
	}

	interface Dependency {
		trigger: string;
		targets: Array<number>;
		inputs: Array<number>;
		outputs: Array<number>;
		backend_fn: boolean;
		js: string | null;
		frontend_fn?: Function;
		status_tracker: number | null;
		status?: string;
		queue: boolean | null;
	}

	export let root: string;
	export let fn: (...args: any) => Promise<unknown>;
	export let components: Array<Component>;
	export let layout: LayoutNode;
	export let dependencies: Array<Dependency>;
	export let theme: string;
	export let style: string | null;
	export let enable_queue: boolean;
	export let static_src: string;
	export let title: string = "Gradio";
	export let analytics_enabled: boolean = false;
	export let target: HTMLElement;

	let rootNode: Component = { id: layout.id, type: "column", props: {} };
	components.push(rootNode);

	dependencies.forEach((d) => {
		if (d.js) {
			try {
				d.frontend_fn = new Function(
					"__fn_args",
					`return ${d.outputs.length} === 1 ? [(${d.js})(...__fn_args)] : (${d.js})(...__fn_args)`
				);
			} catch (e) {
				console.error("Could not parse custom js method.");
				console.error(e);
			}
		}
	});

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

	const dynamic_ids = components.reduce((acc, { id }) => {
		const is_input = is_dep(id, "inputs", dependencies);
		const is_output = is_dep(id, "outputs", dependencies);

		if (!is_input && !is_output) acc.add(id); // default dynamic
		if (is_input) acc.add(id);

		return acc;
	}, new Set());

	let instance_map = components.reduce((acc, next) => {
		acc[next.id] = next;
		return acc;
	}, {} as { [id: number]: Component });

	function load_component<T extends keyof typeof component_map>(
		name: T
	): Promise<{ name: T; component: SvelteComponentTyped }> {
		return new Promise(async (res, rej) => {
			try {
				const c = await component_map[name]();
				res({ name, component: c });
			} catch (e) {
				console.log(name);
				rej(e);
			}
		});
	}

	async function walk_layout(node: LayoutNode) {
		let instance = instance_map[node.id];
		const _component = (await _component_map.get(instance.type)).component;
		instance.component = _component.Component;
		if (_component.modes.length > 1) {
			instance.has_modes = true;
		}

		if (node.children) {
			instance.children = node.children.map((v) => instance_map[v.id]);
			await Promise.all(node.children.map((v) => walk_layout(v)));
		}
	}

	const component_set = new Set();
	const _component_map = new Map();
	components.forEach((c) => {
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
				if (window.__gradio_mode__ == "app") {
					window.__gradio_loader__.$set({ status: "complete" });
				}
			})
			.catch((e) => {
				if (window.__gradio_mode__ == "app") {
					window.__gradio_loader__.$set({ status: "error" });
				}
			});
	});

	function set_prop(obj: Component, prop: string, val: any) {
		if (!obj?.props) {
			obj.props = {};
		}
		obj.props[prop] = val;
		rootNode = rootNode;
	}

	let handled_dependencies: Array<number[]> = [];
	let status_tracker_values: Record<number, string> = {};

	async function handle_mount() {
		await tick();

		var a = target.getElementsByTagName("a");

		for (var i = 0; i < a.length; i++) {
			const _target = a[i].getAttribute("target");
			if (_target !== "_blank") a[i].setAttribute("target", "_blank");
		}

		dependencies.forEach(
			(
				{ targets, trigger, inputs, outputs, queue, backend_fn, frontend_fn },
				i
			) => {
				const target_instances: [number, Component][] = targets.map((t) => [
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
					fn({
						action: "predict",
						backend_fn,
						frontend_fn,
						payload: {
							fn_index: i,
							data: inputs.map((id) => instance_map[id].props.value)
						},
						queue: queue === null ? enable_queue : queue
					})
						.then((output) => {
							output.data.forEach((value, i) => {
								if (
									typeof value === "object" &&
									value !== null &&
									value.__type__ == "update"
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
						})
						.catch((error) => {
							console.error(error);
						});

					handled_dependencies[i] = [-1];
				}

				target_instances.forEach(([id, { instance }]: [number, Component]) => {
					if (handled_dependencies[i]?.includes(id) || !instance) return;
					instance?.$on(trigger, () => {
						if (loading_status.get_status_for_fn(i) === "pending") {
							return;
						}

						// page events
						fn({
							action: "predict",
							backend_fn,
							frontend_fn,
							payload: {
								fn_index: i,
								data: inputs.map((id) => instance_map[id].props.value)
							},
							output_data: outputs.map((id) => instance_map[id].props.value),
							queue: queue === null ? enable_queue : queue
						})
							.then((output) => {
								output.data.forEach((value, i) => {
									if (
										typeof value === "object" &&
										value !== null &&
										value.__type__ == "update"
									) {
										for (const [update_key, update_value] of Object.entries(
											value
										)) {
											if (update_key === "__type__") {
												continue;
											} else {
												instance_map[outputs[i]].props[update_key] =
													update_value;
											}
										}
										rootNode = rootNode;
									} else {
										instance_map[outputs[i]].props.value = value;
									}
								});
							})
							.catch((error) => {
								console.error(error);
							});
					});

					if (!handled_dependencies[i]) handled_dependencies[i] = [];
					handled_dependencies[i].push(id);
				});
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
		loading_status.register(i, v.outputs);
	});

	function set_status(
		statuses: Record<number, Omit<LoadingStatus, "outputs">>
	) {
		for (const id in statuses) {
			set_prop(instance_map[id], "loading_status", statuses[id]);
		}
	}

	let mode = "";

	function handle_darkmode() {
		let url = new URL(window.location.toString());

		const color_mode: "light" | "dark" | "system" | null = url.searchParams.get(
			"__theme"
		) as "light" | "dark" | "system" | null;

		if (color_mode !== null) {
			if (color_mode === "dark") {
				mode = "dark";
			} else if (color_mode === "system") {
				use_system_theme();
			}
			// light is default, so we don't need to do anything else
		} else if (url.searchParams.get("__dark-theme") === "true") {
			mode = "dark";
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

			mode = is_dark ? "dark" : "";
		}
	}

	onMount(() => {
		if (window.__gradio_mode__ !== "website") {
			handle_darkmode();
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	{#if analytics_enabled}
		<script
			async
			defer
			src="https://www.googletagmanager.com/gtag/js?id=UA-156449732-1"></script>
	{/if}
</svelte:head>
<div class="w-full h-full min-h-screen {mode}">
	<div class="mx-auto container px-4 py-6 dark:bg-gray-950">
		{#if ready}
			<Render
				component={rootNode.component}
				id={rootNode.id}
				props={rootNode.props}
				children={rootNode.children}
				{dynamic_ids}
				{instance_map}
				{theme}
				{root}
				{status_tracker_values}
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
			/>
		{/if}
	</div>
	<div
		class="gradio-page container mx-auto flex flex-col box-border flex-grow text-gray-700 dark:text-gray-50"
	>
		<div
			class="footer flex-shrink-0 inline-flex gap-2.5 items-center text-gray-600 dark:text-gray-300 justify-center py-2"
		>
			<a href="https://gradio.app" target="_blank" rel="noreferrer">
				{$_("interface.built_with_Gradio")}
				<img
					class="h-5 inline-block pb-0.5"
					src="{static_src}/static/img/logo.svg"
					alt="logo"
				/>
			</a>
		</div>
	</div>
</div>

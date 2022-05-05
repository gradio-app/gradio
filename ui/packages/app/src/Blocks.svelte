<script lang="ts">
	import type { SvelteComponentTyped } from "svelte";
	import { component_map } from "./components/directory";
	import { loading_status } from "./stores";
	import type { LoadingStatus } from "./stores";

	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	import Render from "./Render.svelte";
	import { tick } from "svelte";
	setupi18n();

	interface Component {
		id: string;
		type: string;
		props: {
			name: keyof typeof component_map;
			css: Record<string, string>;
			[key: string]: unknown;
		};
	}

	interface Layout {
		name: string;
		type: string;
		children: Layout | number;
	}

	interface Dependency {
		trigger: string;
		targets: Array<number>;
		inputs: Array<number>;
		outputs: Array<number>;
		status_tracker: number | null;
		status?: string;
		queue: boolean | null;
	}

	export let root: string;
	export let fn: (...args: any) => Promise<unknown>;
	export let components: Array<Component>;
	export let layout: Layout;
	export let dependencies: Array<Dependency>;
	export let theme: string;
	export let style: string | null;
	export let enable_queue: boolean;
	export let static_src: string;
	export let title: string = "Gradio";
	export let analytics_enabled: boolean = false;

	const dynamic_ids = dependencies.reduce((acc, next) => {
		next.inputs.forEach((i) => acc.add(i));
		return acc;
	}, new Set());

	interface Instance {
		props?: Record<string, unknown>;
		id: number;
		type: string;
		instance?: SvelteComponentTyped;
		value?: unknown;
	}

	let instance_map = components.reduce((acc, next) => {
		return {
			...acc,
			[next.id]: {
				...next
			}
		};
	}, {} as { [id: number]: Instance });

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

	async function walk_layout(node) {
		const _n = { id: node.id };

		const meta = instance_map[_n.id];
		_n.props = meta.props || {};
		const _module = (await _component_map.get(meta.type)).component;
		_n.component = _module.Component;
		if (_module.modes.length > 1) {
			_n.has_modes = true;
		}

		if (node.children) {
			_n.children = await Promise.all(node.children.map((v) => walk_layout(v)));
		}

		return _n;
	}

	const component_set = new Set();
	const _component_map = new Map();
	components.forEach((c) => {
		const _c = load_component(c.type);
		component_set.add(_c);
		_component_map.set(c.type, _c);
	});

	let tree;

	Promise.all(Array.from(component_set)).then((v) => {
		Promise.all(layout.children.map((c) => walk_layout(c))).then((v) => {
			console.log(v);
			tree = v;
		});
	});

	function set_prop(obj: Instance, prop: string, val: any) {
		if (!obj?.props) {
			obj.props = {};
		}
		obj.props[prop] = val;
		tree = tree;
	}

	let handled_dependencies: Array<number[]> = [];
	let status_tracker_values: Record<number, string> = {};

	async function handle_mount() {
		await tick();
		dependencies.forEach(({ targets, trigger, inputs, outputs, queue }, i) => {
			const target_instances: [number, Instance][] = targets.map((t) => [
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
				fn(
					"predict",
					{
						fn_index: i,
						data: inputs.map((id) => instance_map[id].value)
					},
					queue === null ? enable_queue : queue
				)
					.then((output) => {
						output.data.forEach((value, i) => {
							instance_map[outputs[i]].value = value;
						});
					})
					.catch((error) => {
						console.error(error);
					});

				handled_dependencies[i] = [-1];
			}

			target_instances.forEach(([id, { instance }]: [number, Instance]) => {
				if (handled_dependencies[i]?.includes(id) || !instance) return;
				instance?.$on(trigger, () => {
					console.log(loading_status.get_status_for_fn(i));

					if (loading_status.get_status_for_fn(i) === "pending") {
						return;
					}

					fn(
						"predict",
						{
							fn_index: i,
							data: inputs.map((id) => instance_map[id].value)
						},
						queue === null ? enable_queue : queue
					)
						.then((output) => {
							output.data.forEach((value, i) => {
								instance_map[outputs[i]].value = value;
							});
						})
						.catch((error) => {
							console.error(error);
						});
				});

				if (!handled_dependencies[i]) handled_dependencies[i] = [];
				handled_dependencies[i].push(id);
			});
		});
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

<div class="mx-auto container space-y-4 px-4 py-6 dark:bg-gray-950">
	{#if tree}
		{#each tree as { component, id, props, children, has_modes }}
			<Render
				{has_modes}
				{dynamic_ids}
				{component}
				{id}
				{props}
				{children}
				{instance_map}
				{theme}
				{root}
				{status_tracker_values}
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
			/>
		{/each}
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

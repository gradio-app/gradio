<script lang="ts">
	import type { SvelteComponentTyped } from "svelte";
	import { component_map } from "./components/directory";
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
		queue: boolean;
		status_tracker: number | null;
		status?: string;
	}

	export let root: string;
	export let fn: (...args: any) => Promise<unknown>;
	export let components: Array<Component>;
	export let layout: Layout;
	export let dependencies: Array<Dependency>;
	export let theme: string;
	export let style: string | null;
	export let static_src: string;

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

	const instance_map = components.reduce((acc, next) => {
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

		// console.log(await _component_map.get(meta.type));

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

	let handled_dependencies: Array<number[]> = [];
	let status_tracker_values: Record<number, string> = {};

	let set_status = (dependency_index: number, status: string) => {
		dependencies[dependency_index].status = status;
		let status_tracker_id = dependencies[dependency_index].status_tracker;
		if (status_tracker_id !== null) {
			status_tracker_values[status_tracker_id] = status;
		}
	};

	async function handle_mount({ detail }) {
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
					queue,
					() => {}
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
				// console.log(id, handled_dependencies[i]?.includes(id) || !instance);
				if (handled_dependencies[i]?.includes(id) || !instance) return;
				// console.log(trigger, target_instances, instance);
				instance?.$on(trigger, () => {
					if (status === "pending") {
						return;
					}
					set_status(i, "pending");
					fn(
						"predict",
						{
							fn_index: i,
							data: inputs.map((id) => instance_map[id].value)
						},
						queue,
						() => {}
					)
						.then((output) => {
							set_status(i, "complete");
							output.data.forEach((value, i) => {
								instance_map[outputs[i]].value = value;
							});
						})
						.catch((error) => {
							set_status(i, "error");
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
	console.log("Blocks.svelte Hit")
</script>

<div class="mx-auto container p-4">
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
/>
<div
	class="footer flex-shrink-0 inline-flex gap-2.5 items-center text-gray-400 justify-center py-2"
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

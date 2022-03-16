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
			[key: string]: unknown;
		};
	}

	interface Layout {
		name: string;
		type: string;
		children: Layout | number;
	}

	interface Dependency {
		trigger: "click" | "change";
		targets: Array<number>;
		inputs: Array<string>;
		outputs: Array<string>;
	}

	export let fn: (...args: any) => Promise<unknown>;
	export let components: Array<Component>;
	export let layout: Layout;
	export let dependencies: Array<Dependency>;
	export let theme: string;

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

	async function handle_mount({ detail }) {
		await tick();
		dependencies.forEach(({ targets, trigger, inputs, outputs }, i) => {
			const target_instances: [number, Instance][] = targets.map((t) => [
				t,
				instance_map[t]
			]);

			target_instances.forEach(([id, { instance }]: [number, Instance]) => {
				// console.log(id, handled_dependencies[i]?.includes(id) || !instance);
				if (handled_dependencies[i]?.includes(id) || !instance) return;
				// console.log(trigger, target_instances, instance);
				instance?.$on(trigger, () => {
					console.log("boo");
					fn("predict", {
						fn_index: i,
						data: inputs.map((id) => instance_map[id].value)
					}).then((output) => {
						output.data.forEach((value, i) => {
							instance_map[outputs[i]].value = value;
						});
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

	$: console.log(handled_dependencies);
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
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
			/>
		{/each}
	{/if}
</div>

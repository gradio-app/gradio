<script lang="ts">
	import type { SvelteComponentTyped } from "svelte";
	import { component_map } from "./components/directory";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	import Render from "./Render.svelte";
	import { tick } from "svelte";
	setupi18n();

	// const json = {
	// 	mode: "blocks",
	// 	components: [
	// 		{
	// 			id: 1,
	// 			type: "markdown",
	// 			props: {
	// 				label:
	// 					"\n\t# Detect Disease From Scan\n\tWith this model you can lorem ipsum\n\t- ipsum 1\n\t- ipsum 2\n\t"
	// 			}
	// 		},
	// 		{
	// 			id: 2,
	// 			type: "checkboxgroup",
	// 			props: {
	// 				choices: ["Covid", "Malaria", "Lung Cancer"],
	// 				default: [],
	// 				label: "Disease to Scan For"
	// 			}
	// 		},
	// 		{ id: 3, type: "tabs" },
	// 		{ id: 4, type: "tabitem", props: { label: "X-ray" } },
	// 		{ id: 5, type: "row" },
	// 		{
	// 			id: 6,
	// 			type: "image",
	// 			props: {
	// 				image_mode: "RGB",
	// 				shape: null,
	// 				source: "upload",
	// 				tool: "editor",
	// 				optional: false,
	// 				label: null
	// 			}
	// 		},
	// 		{ id: 7, type: "json" },
	// 		{ id: 8, type: "button", props: { label: "Run" } },
	// 		{ id: 9, type: "tabitem", props: { label: "CT Scan" } },
	// 		{ id: 10, type: "row" },

	// 		{
	// 			id: 11,
	// 			type: "image",
	// 			props: {
	// 				image_mode: "RGB",
	// 				shape: null,
	// 				source: "upload",
	// 				tool: "editor",
	// 				optional: false,
	// 				label: null
	// 			}
	// 		},
	// 		{ id: 12, type: "json", props: { label: null } },
	// 		{ id: 13, type: "button", props: { label: "Run" } },
	// 		{ id: 14, type: "textbox", props: { label: null } }
	// 	],
	// 	theme: "default",
	// 	layout: {
	// 		children: [
	// 			{ id: 1 },
	// 			{ id: 2 },
	// 			{
	// 				id: 3,
	// 				children: [
	// 					{
	// 						id: 4,
	// 						children: [{ id: 5, children: [{ id: 6 }, { id: 7 }] }, { id: 8 }]
	// 					},
	// 					{
	// 						id: 9,
	// 						children: [
	// 							{ id: 10, children: [{ id: 11 }, { id: 12 }] },
	// 							{ id: 13 }
	// 						]
	// 					}
	// 				]
	// 			},
	// 			{ id: 14 }
	// 		],
	// 		type: "root"
	// 	},
	// 	dependencies: [
	// 		{ targets: [8], trigger: "click", inputs: [2, 6], outputs: [7] },
	// 		{ targets: [13], trigger: "click", inputs: [2, 11], outputs: [12] }
	// 	]
	// };


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
	): Promise<{ name: T; component: SvelteComponentDev }> {
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
			// console.log(v);
			tree = v;
		});
	});

	// let values: Record<string, unknown> = {};
	// let component_id_map: Record<string, Component> = {};
	// let event_listener_map: Record<string, Array<number>> = {};
	// for (let component of components) {
	// 	component_id_map[component.id] = component;
	// 	if (component.props && "default" in component.props) {
	// 		values[component.id] = component.props.default;
	// 	} else {
	// 		values[component.id] = null;
	// 	}
	// 	event_listener_map[component.id] = [];
	// }
	// dependencies.forEach((dependency, i) => {
	// 	if (dependency.trigger === "click") {
	// 		for (let target of dependency.targets) {
	// 			event_listener_map[target].push(i);
	// 		}
	// 	}
	// });

	// const setValues = (i: string, value: unknown) => {
	// 	values[i] = value;
	// };
	// const triggerTarget = (i: string) => {
	// 	event_listener_map[i].forEach((fn_index: number) => {
	// 		let dependency = dependencies[fn_index];
	// 		fn("predict", {
	// 			fn_index: fn_index,
	// 			data: dependency.inputs.map((i) => values[i])
	// 		}).then((output) => {
	// 			output["data"].forEach((value, i) => {
	// 				values[dependency.outputs[i]] = value;
	// 			});
	// 		});
	// 	});
	// };

	let handled_dependencies: Array<number[]> = [];

	async function handle_mount({ detail }) {
		console.log("mount", detail);
		// console.log("boo");
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
						console.log(output);
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
		console.log("destroy", id);
		// console.log(
		// 	id,
		// 	handled_dependencies,
		// 	handled_dependencies.map((dep) => {
		// 		return dep.filter((_id) => _id !== id);
		// 	})
		// );
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
				theme={theme}
				on:mount={handle_mount}
				on:destroy={({ detail }) => handle_destroy(detail)}
			/>
		{/each}
	{/if}
</div>

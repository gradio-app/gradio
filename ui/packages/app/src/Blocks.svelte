<script lang="ts">
	import Pane from "./page_layouts/Pane.svelte";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	setupi18n();

	interface Component {
		name: string;
		id: string;
		props: Record<string, unknown>;
	}

	interface Layout {
		name: string;
		type: string;
		children: Layout | number;
	}

	interface Dependency {
		trigger: "click" | "change";
		targets: Array<string>;
		inputs: Array<string>;
		outputs: Array<string>;
	}

	export let fn: (...args: any) => Promise<unknown>;
	export let components: Array<Component>;
	export let layout: Layout;
	export let dependencies: Array<Dependency>;
	export let theme: string;
	export let static_src: string;

	let values: Record<string, unknown> = {};
	let component_id_map: Record<string, Component> = {};
	let event_listener_map: Record<string, Array<number>> = {};
	for (let component of components) {
		component_id_map[component.id] = component;
		if (component.props && "default" in component.props) {
			values[component.id] = component.props.default;
		} else {
			values[component.id] = null;
		}
		event_listener_map[component.id] = [];
	}
	dependencies.forEach((dependency, i) => {
		if (dependency.trigger === "click") {
			for (let target of dependency.targets) {
				event_listener_map[target].push(i);
			}
		}
	});

	const setValues = (i: string, value: unknown) => {
		values[i] = value;
	};
	const triggerTarget = (i: string) => {
		event_listener_map[i].forEach((fn_index: number) => {
			let dependency = dependencies[fn_index];
			fn("predict", {
				fn_index: fn_index,
				data: dependency.inputs.map((i) => values[i])
			}).then((output) => {
				output["data"].forEach((value, i) => {
					values[dependency.outputs[i]] = value;
				});
			});
		});
	};
</script>

<div class="mx-auto container p-4">
	<Pane
		{component_id_map}
		children={layout.children}
		{dependencies}
		{values}
		{setValues}
		{triggerTarget}
		{theme}
		{static_src}
	/>
</div>

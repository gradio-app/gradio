<script lang="ts">
	import type { Component } from "svelte";

	import MountCustomComponent from "./MountCustomComponent.svelte";

	let {
		component,
		runtime,
		on_mount
	}: {
		component: Component;
		runtime: Pick<
			typeof import("svelte"),
			"createRawSnippet" | "mount" | "unmount"
		>;
		on_mount: () => void;
	} = $props();

	let id = $state(1);
	let value = $state("initial");
	let shared_props = $state({ id });
	const component_props = {
		get value() {
			return value;
		},
		on_mount
	};
	const node = {
		get id() {
			return id;
		},
		component: Promise.resolve({ default: component }),
		runtime: Promise.resolve(runtime),
		props: {
			get shared_props() {
				return shared_props;
			},
			props: component_props
		}
	};

	export function update_value(next_value: string): void {
		value = next_value;
	}

	export function replace_shared_props(): void {
		shared_props = { ...shared_props };
	}

	export function replace_id(next_id: number): void {
		id = next_id;
		shared_props = { ...shared_props, id: next_id };
	}
</script>

<MountCustomComponent {node} />

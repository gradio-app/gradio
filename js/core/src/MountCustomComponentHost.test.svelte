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

	let value = $state("initial");
	let shared_props = $state({});
	const component_props = {
		get value() {
			return value;
		},
		on_mount
	};
	const node = {
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
</script>

<MountCustomComponent {node} />

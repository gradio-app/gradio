<script lang="ts">
	import { mount, unmount } from "svelte";
	import type { StoredRunComponent } from "@gradio/client";
	import { load_component } from "virtual:component-loader";

	interface Props {
		component: StoredRunComponent;
		value: unknown;
		root: string;
	}

	let { component: meta, value, root }: Props = $props();
	let target: HTMLDivElement | null = $state(null);
	let loaded = $derived(
		load_component({
			api_url: root,
			name: meta.type,
			id: meta.component_class_id,
			variant: "example"
		})
	);

	$effect(() => {
		if (!target || !loaded.component) return;
		let disposed = false;
		let mounted: Record<string, unknown> | undefined;

		Promise.all([loaded.component, loaded.runtime]).then(
			([component, runtime]) => {
				if (disposed) return;
				const props = {
					...meta.props,
					value,
					type: "table",
					selected: false,
					root,
					samples_dir: `${root}/file=`
				};
				mounted = runtime
					? runtime.mount(component.default, { target, props })
					: mount(component.default, { target, props });
			}
		);

		return () => {
			disposed = true;
			if (mounted) {
				if (loaded.runtime) loaded.runtime.unmount(mounted);
				else unmount(mounted);
			}
		};
	});
</script>

<div class="run-value" bind:this={target}></div>

<style>
	.run-value {
		display: flex;
		align-items: center;
		min-width: 0;
		min-height: var(--size-8);
		max-height: var(--size-20);
		overflow: hidden;
	}
	.run-value :global(*) {
		max-width: 100%;
	}
</style>

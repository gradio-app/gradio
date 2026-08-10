<script lang="ts">
	import { mount, unmount } from "svelte";
	import type { StoredRunComponent } from "@gradio/client";
	import { load_component } from "virtual:component-loader";
	import { summarize, to_example_value } from "./run_value";

	interface Props {
		component: StoredRunComponent;
		value: unknown;
		root: string;
	}

	let { component: meta, value, root }: Props = $props();
	let target: HTMLDivElement | null = $state(null);
	let unpreviewable = $state(false);
	// Not every component ships an example renderer, and a saved run may even
	// name one this app no longer has, so fall back to text rather than break.
	let loaded = $derived.by(() => {
		try {
			return load_component({
				api_url: root,
				name: meta.type,
				id: meta.component_class_id,
				variant: "example"
			});
		} catch {
			return null;
		}
	});

	$effect(() => {
		unpreviewable = !loaded?.component;
	});

	$effect(() => {
		const mount_target = target;
		if (!mount_target || !loaded?.component) return;
		let disposed = false;
		let mounted: Record<string, unknown> | undefined;

		Promise.all([loaded.component, loaded.runtime])
			.then(([component, runtime]) => {
				if (disposed) return;
				const choices = Array.isArray(meta.props.choices)
					? meta.props.choices
					: (meta.type === "dropdown" || meta.type === "radio") && value != null
						? (Array.isArray(value) ? value : [value]).map((item) => [
								String(item),
								item
							])
						: undefined;
				const props = {
					...meta.props,
					...(choices ? { choices } : {}),
					value: to_example_value(meta.type, value),
					type: "table",
					selected: false,
					root,
					samples_dir: `${root}/file=`
				};
				mounted = runtime
					? runtime.mount(component.default, {
							target: mount_target,
							props
						})
					: mount(component.default, { target: mount_target, props });

				// Some renderers bail out entirely on a value they do not
				// recognise, which would otherwise leave a blank cell.
				requestAnimationFrame(() => {
					if (disposed) return;
					const drew_nothing =
						mount_target.children.length === 0 &&
						!mount_target.textContent?.trim();
					if (drew_nothing) unpreviewable = true;
				});
			})
			.catch(() => {
				if (!disposed) unpreviewable = true;
			});

		return () => {
			disposed = true;
			if (mounted) {
				if (loaded?.runtime) loaded.runtime.unmount(mounted);
				else unmount(mounted);
			}
		};
	});
</script>

{#if unpreviewable}
	<span class="fallback" title={summarize(value)}>{summarize(value)}</span>
{:else}
	<div class="run-value" bind:this={target}></div>
{/if}

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
	.fallback {
		display: block;
		overflow: hidden;
		color: var(--body-text-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

<script lang="ts">
	import { mount, unmount, untrack } from "svelte";
	import MountChildren from "./MountChildren.svelte";

	let { node, children, ...rest } = $props();

	let component = $derived(await node.component);
	let runtime = $derived(
		(await node.runtime) as {
			mount: typeof import("svelte").mount;
			unmount: typeof import("svelte").unmount;
			createRawSnippet?: typeof import("svelte").createRawSnippet;
		}
	);
	let el: HTMLElement | null = $state(null);

	$effect(() => {
		if (!el || !runtime || !component) return;

		// Read prop references so the effect re-runs when the node is
		// replaced during a dev reload (new objects are created by
		// app_tree.reload).
		const _shared_props = node.props.shared_props;
		const _props = node.props.props;
		const _runtime = runtime;
		// Recreate the snippet in the custom component's Svelte runtime, then
		// replace its temporary marker with children from Gradio's runtime.
		const runtime_children =
			children && _runtime.createRawSnippet
				? _runtime.createRawSnippet(() => ({
						render: () => "<span hidden></span>",
						setup: (target) => {
							const mounted_children = mount(MountChildren, {
								target,
								props: { children }
							});
							target.replaceWith(...target.childNodes);

							return () => {
								void unmount(mounted_children);
							};
						}
					}))
				: children;

		const mounted = untrack(() =>
			_runtime.mount(component.default, {
				target: el,
				props: {
					shared_props: _shared_props,
					props: _props,
					children: runtime_children
				}
			})
		);

		return () => {
			_runtime.unmount(mounted);
		};
	});
</script>

<span bind:this={el}></span>

<script module lang="ts">
	const custom_component_context = Symbol("custom component context");
</script>

<script lang="ts">
	import { getAllContexts, getContext, mount, unmount, untrack } from "svelte";
	import type { Snippet } from "svelte";
	import MountChildren from "./MountChildren.svelte";

	let {
		node,
		children,
		...rest
	}: { node: any; children?: Snippet; [key: string]: any } = $props();
	const host_context = getAllContexts();
	const parent_custom_component_context = getContext<
		Map<unknown, unknown> | undefined
	>(custom_component_context);

	let component = $derived(await node.component);
	let runtime = $derived(
		(await node.runtime) as {
			mount: typeof import("svelte").mount;
			unmount: typeof import("svelte").unmount;
			createRawSnippet?: typeof import("svelte").createRawSnippet;
			getAllContexts?: typeof import("svelte").getAllContexts;
		}
	);
	let el: HTMLElement | null = $state(null);

	$effect(() => {
		if (!el || !runtime || !component) return;
		const target = el;

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
							// This callback runs in the ancestor custom component's context.
							const child_host_context = new Map(host_context);
							if (_runtime.getAllContexts) {
								child_host_context.set(
									custom_component_context,
									_runtime.getAllContexts()
								);
							}
							const mounted_children = mount(MountChildren, {
								target,
								props: { children },
								context: child_host_context
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
				target,
				context: parent_custom_component_context,
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

<gradio-custom-component bind:this={el} style="display: contents"
></gradio-custom-component>

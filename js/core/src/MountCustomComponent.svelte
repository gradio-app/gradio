<script lang="ts">
	let { node, children, ...rest } = $props();

	let component = $derived(await node.component);
	let runtime = $derived(
		(await node.runtime) as {
			mount: typeof import("svelte").mount;
			unmount: typeof import("svelte").unmount;
		}
	);
	let el: HTMLElement = $state(null);

	$effect(() => {
		if (!el || !runtime || !component) return;

		// Read prop references so the effect re-runs when the node is
		// replaced during a dev reload (new objects are created by
		// app_tree.reload).
		const _shared_props = node.props.shared_props;
		const _props = node.props.props;
		const _runtime = runtime;

		const mounted = _runtime.mount(component.default, {
			target: el,
			props: {
				shared_props: _shared_props,
				props: _props,
				children
			}
		});

		return () => {
			_runtime.unmount(mounted);
		};
	});
</script>

<span bind:this={el}></span>

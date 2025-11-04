<script lang="ts">
	import Self from "./MountComponents.svelte";
	let { node } = $props();

	async function load_component(node_) {
		console.log("Loading component for", node_);
		return await node_.component;
	}

	let component = $state(null);

	$effect(() => {
		load_component(node).then((c) => {
			component = c;
		});
	});

	// onMount(() => {
	// 	console.log("Mounted component", node.id);
	// 	component_ids.delete(node.id);
	// 	console.log("Component IDs left:", component_ids);
	// });

	// $effect(() => {
	// 	console.log("Checking on_mount for", node.id, "with component_ids:", component_ids);
	// 	console.log("component_ids.size===0", component_ids.size === 0);
	// 	console.log("on_mount:", on_mount);
	// 	if (on_mount && component_ids.size === 0) {
	// 		console.log("HERE", node.id);
	// 		on_mount();
	// 	}
	// });

	$inspect(node);
</script>

{#if node && component}
	{#if node.props.shared_props.visible}
		<svelte:component
			this={component.default}
			shared_props={node.props.shared_props}
			props={node.props.props}
		>
			{#if node.children && node.children.length}
				{#each node.children as _node}
					<Self node={_node} />
				{/each}
			{/if}
		</svelte:component>
	{/if}
{/if}

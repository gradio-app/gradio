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

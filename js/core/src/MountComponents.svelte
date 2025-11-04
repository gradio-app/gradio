<script lang="ts">
	import Self from "./MountComponents.svelte";
	let { node } = $props();

	let component = $state(await node.component);
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

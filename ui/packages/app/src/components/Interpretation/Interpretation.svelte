<script lang="ts">
	import { component_map } from "./directory";

	export let component: string;
	export let component_props: Record<string, any>;
	export let value: any;
</script>

{#if value}
	<svelte:component
		this={component_map[component]}
		{...component_props}
		original={value.original}
		interpretation={value.interpretation}
	/>
{/if}

<style lang="postcss" global>
</style>

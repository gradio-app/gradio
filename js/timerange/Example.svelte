<script lang="ts">
	export let value: [number, number] | null;
</script>

{#if value}
	{new Date(value[0])} - {new Date(value[1])}
{:else}
	Empty
{/if}

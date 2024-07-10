<script lang="ts">
	export let value: [string, string] | null;
</script>

{#if value}
	{value[0]} - {value[1]}
{:else}
	Empty
{/if}

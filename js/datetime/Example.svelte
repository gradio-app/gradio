<script lang="ts">
	export let value: string | null;
</script>

{#if value}
	{value}
{:else}
	Empty
{/if}

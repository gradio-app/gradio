<script lang="ts">
	let {
		title,
		x,
		y
	}: {
		title: string | null;
		x: string;
		y: string;
	} = $props();
</script>

{#if title}
	{title}
{:else}
	{x} x {y}
{/if}

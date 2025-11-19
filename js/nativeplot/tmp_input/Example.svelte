<script lang="ts">
	export let title: string | null;
	export let x: string;
	export let y: string;
</script>

{#if title}
	{title}
{:else}
	{x} x {y}
{/if}

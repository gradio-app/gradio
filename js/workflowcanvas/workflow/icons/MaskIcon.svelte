<script lang="ts">
	let { masked = false }: { masked?: boolean } = $props();
</script>

<svg
	width="13"
	height="13"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
	<circle cx="12" cy="12" r="3" />
	{#if masked}
		<path d="M3 3l18 18" />
	{/if}
</svg>

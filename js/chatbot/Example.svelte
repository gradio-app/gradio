<script lang="ts">
	import { onMount } from "svelte";

	export let value: any[] | null = null;
</script>

{#if value}
	{value.length} messages
{:else}
	Empty chat
{/if}

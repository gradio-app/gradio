<script lang="ts">
	import Lightbulb from "$lib/components/icons/Lightbulb.svelte";
	export let summary: string;
	export let content: string;

	let open = false;
</script>

<div class="container">
	<button class="summary" class:open on:click={() => (open = !open)}
		><span><Lightbulb /></span>{summary}</button
	>
	{#if open}
		<div class="detail">{@html content}</div>
	{/if}
</div>

<style>
	.container {
		border-left: 3px solid rgb(9, 105, 218);
		margin-bottom: 1.5rem;
		padding: 0.25rem 1.25rem;
	}

	.summary {
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.75rem;
		color: #374151;
		cursor: pointer;
		display: flex;
		align-items: center;
		color: rgb(9, 105, 218);
	}

	.detail {
		margin-top: 0.75rem;
		font-size: 1rem;
		line-height: 1.5rem;
		color: #374151;
		text-align: justify;
	}

	span {
		color: rgb(9, 105, 218);
		margin-left: -3px;
		margin-right: 0.75rem;
	}
</style>

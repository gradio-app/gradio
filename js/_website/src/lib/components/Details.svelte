<script lang="ts">
	export let summary: string;
	export let content: string;

	let open = false;
</script>

<div class="container">
	<button class="summary" class:open on:click={() => (open = !open)}
		>{summary}</button
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
</style>

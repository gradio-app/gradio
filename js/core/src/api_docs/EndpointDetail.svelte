<script lang="ts">
	export let api_name: string | null = null;
	export let fn_index: number | null = null;
	export let named: boolean;
</script>

{#if named}
	<h3>
		api_name:
		<span class="post">{"/" + api_name}</span>
	</h3>
{:else}
	<h3>
		fn_index:
		<span class="post">{fn_index}</span>
	</h3>
{/if}

<style>
	h3 {
		color: var(--body-text-color);
		font-weight: var(--section-header-text-weight);
		font-size: var(--text-lg);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-bottom: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}
</style>
